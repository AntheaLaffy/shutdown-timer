use crate::{audio, shutdown, sleep, sync_tray};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    fs,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, AtomicU64, Ordering},
        Mutex,
    },
    thread,
    time::Duration,
};
use tauri::{AppHandle, Emitter, Manager, Runtime, State};
use tauri_plugin_dialog::DialogExt;
use time::{
    format_description::well_known::Rfc3339,
    macros::format_description,
    Duration as TimeDuration, OffsetDateTime, Time,
};

const CONFIG_VERSION: u32 = 1;
const WARNING_LEAD_SECONDS: i64 = 60;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Preferences {
    pub lang: String,
    pub auto_start: bool,
    pub prevent_sleep: bool,
    pub min_to_tray: bool,
    pub notification_enabled: bool,
    pub ringtone_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CountdownDraft {
    pub hours: u32,
    pub minutes: u32,
    pub seconds: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TimerDraft {
    pub mode: String,
    pub countdown: CountdownDraft,
    pub schedule_time: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackgroundSettings {
    pub image_path: String,
    pub opacity: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppearanceSettings {
    pub selected_theme_id: String,
    pub draft_theme: Value,
    pub custom_themes: Vec<Value>,
    pub background: BackgroundSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveTask {
    pub mode: String,
    pub target_at_iso: String,
    pub warning_at_iso: Option<String>,
    pub started_at_iso: String,
    pub prevent_sleep: bool,
    pub ringtone_path: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeState {
    pub active_task: Option<ActiveTask>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub version: u32,
    pub legacy_migrated: bool,
    pub preferences: Preferences,
    pub timer_draft: TimerDraft,
    pub appearance: AppearanceSettings,
    pub runtime: RuntimeState,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapPayload {
    pub config: AppConfig,
    pub runtime: RuntimeState,
    pub system: SystemSnapshot,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemSnapshot {
    pub platform: String,
    pub auto_start_supported: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OperationResult {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacySettings {
    pub auto_start: Option<bool>,
    pub prevent_sleep: Option<bool>,
    pub min_to_tray: Option<bool>,
    pub ringtone_path: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyMigrationPayload {
    pub settings: Option<LegacySettings>,
    pub theme_id: Option<String>,
    pub lang: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartTimerRequest {
    pub mode: String,
    pub countdown: Option<CountdownDraft>,
    pub schedule_time: Option<String>,
    pub prevent_sleep: bool,
    pub ringtone_path: String,
}

#[derive(Debug, Clone)]
pub struct TrayLabels {
    pub show: String,
    pub cancel: String,
    pub quit: String,
    pub tooltip: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct AppLogEvent<'a> {
    level: &'a str,
    source: &'a str,
    category: &'a str,
    message: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    detail: Option<String>,
}

struct ConfigStore {
    path: PathBuf,
    config: AppConfig,
}

pub struct AppState {
    store: Mutex<ConfigStore>,
    warning_revision: AtomicU64,
    restore_started: AtomicBool,
}

impl AppState {
    pub fn new<R: Runtime>(app: AppHandle<R>) -> Result<Self, String> {
        let path = config_path(&app)?;
        let config = load_or_default(&path)?;
        Ok(Self {
            store: Mutex::new(ConfigStore { path, config }),
            warning_revision: AtomicU64::new(0),
            restore_started: AtomicBool::new(false),
        })
    }

    pub fn get_config(&self) -> AppConfig {
        self.store.lock().expect("config lock poisoned").config.clone()
    }

    fn save_config(&self, next: AppConfig) -> Result<AppConfig, String> {
        let mut guard = self.store.lock().map_err(|_| "Config lock poisoned".to_string())?;
        guard.config = next.clone();
        save_config_file(&guard.path, &guard.config)?;
        Ok(next)
    }

    fn mutate_config<F>(&self, mutator: F) -> Result<AppConfig, String>
    where
        F: FnOnce(&mut AppConfig) -> Result<(), String>,
    {
        let mut guard = self.store.lock().map_err(|_| "Config lock poisoned".to_string())?;
        let mut next = guard.config.clone();
        mutator(&mut next)?;
        guard.config = next.clone();
        save_config_file(&guard.path, &guard.config)?;
        Ok(next)
    }

    pub fn should_minimize_to_tray(&self) -> bool {
        let config = self.get_config();
        config.runtime.active_task.is_some() || config.preferences.min_to_tray
    }

    pub fn tray_labels(&self) -> TrayLabels {
        tray_labels_for_lang(&self.get_config().preferences.lang)
    }

    fn bump_warning_revision(&self) -> u64 {
        self.warning_revision.fetch_add(1, Ordering::SeqCst) + 1
    }

    fn warning_revision(&self) -> u64 {
        self.warning_revision.load(Ordering::SeqCst)
    }

    fn mark_restore_started(&self) -> bool {
        self.restore_started
            .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
            .is_ok()
    }
}

#[tauri::command]
pub async fn bootstrap_app_state(
    app: AppHandle,
    state: State<'_, AppState>,
    legacy: Option<LegacyMigrationPayload>,
) -> Result<BootstrapPayload, String> {
    if let Some(legacy) = legacy {
        let current = state.get_config();
        if !current.legacy_migrated {
            let migrated = migrate_legacy(current, legacy);
            let _ = state.save_config(migrated)?;
            emit_app_log(
                &app,
                "info",
                "backend",
                "bootstrap",
                "Migrated legacy local settings into config file",
                None,
            );
            sync_tray(&app)?;
        }
    }

    let config = state.get_config();
    emit_app_log(
        &app,
        "info",
        "backend",
        "bootstrap",
        "Bootstrap state prepared",
        None,
    );
    start_restore_runtime(app.clone());
    Ok(BootstrapPayload {
        runtime: config.runtime.clone(),
        config,
        system: SystemSnapshot {
            platform: std::env::consts::OS.to_string(),
            auto_start_supported: cfg!(windows),
        },
    })
}

#[tauri::command]
pub async fn update_app_config(
    app: AppHandle,
    state: State<'_, AppState>,
    patch: Value,
) -> Result<AppConfig, String> {
    let current = serde_json::to_value(state.get_config()).map_err(|e| e.to_string())?;
    let merged = merge_json(current, patch);
    let next: AppConfig = serde_json::from_value(merged).map_err(|e| e.to_string())?;
    let saved = state.save_config(next)?;
    sync_tray(&app)?;
    emit_app_log(
        &app,
        "info",
        "backend",
        "config",
        "Configuration persisted",
        None,
    );
    Ok(saved)
}

#[tauri::command]
pub async fn set_auto_start_preference(
    app: AppHandle,
    state: State<'_, AppState>,
    enabled: bool,
) -> Result<AppConfig, String> {
    if enabled {
        shutdown::enable_auto_start_internal()?;
    } else {
        shutdown::disable_auto_start_internal()?;
    }

    let updated = state.mutate_config(|config| {
        config.preferences.auto_start = enabled;
        Ok(())
    })?;
    sync_tray(&app)?;
    emit_app_log(
        &app,
        "info",
        "system",
        "startup",
        if enabled {
            "Auto-start enabled"
        } else {
            "Auto-start disabled"
        },
        None,
    );
    Ok(updated)
}

#[tauri::command]
pub async fn start_timer(
    app: AppHandle,
    state: State<'_, AppState>,
    request: StartTimerRequest,
) -> Result<ActiveTask, String> {
    let target = resolve_target_time(&request)?;
    let now = now_local();
    let seconds_until = (target - now).whole_seconds();
    if seconds_until <= 0 {
        return Err("Target time must be in the future".to_string());
    }

    let _ = cancel_timer_internal(&app, &state);
    shutdown::schedule_shutdown_after(seconds_until as u64)?;

    if request.prevent_sleep {
        let _ = sleep::prevent_sleep_internal();
    }

    let warning_at = if seconds_until > WARNING_LEAD_SECONDS {
        Some(target - TimeDuration::seconds(WARNING_LEAD_SECONDS))
    } else {
        None
    };

    let task = ActiveTask {
        mode: request.mode.clone(),
        target_at_iso: format_datetime(target)?,
        warning_at_iso: warning_at.map(format_datetime).transpose()?,
        started_at_iso: format_datetime(now)?,
        prevent_sleep: request.prevent_sleep,
        ringtone_path: request.ringtone_path.clone(),
        status: "scheduled".to_string(),
    };

    let updated = state.mutate_config(|config| {
        config.timer_draft.mode = request.mode.clone();
        if let Some(countdown) = request.countdown.clone() {
            config.timer_draft.countdown = countdown;
        }
        if let Some(schedule_time) = request.schedule_time.clone() {
            config.timer_draft.schedule_time = schedule_time;
        }
        config.preferences.prevent_sleep = request.prevent_sleep;
        config.preferences.ringtone_path = request.ringtone_path.clone();
        config.runtime.active_task = Some(task.clone());
        Ok(())
    })?;

    schedule_warning(app.clone(), updated.preferences.notification_enabled, task.clone());
    let _ = sync_tray(&app);
    emit_app_log(
        &app,
        "info",
        "backend",
        "timer",
        "Shutdown task scheduled",
        Some(format!("targetAt={}", task.target_at_iso)),
    );

    Ok(task)
}

#[tauri::command]
pub async fn cancel_timer(app: AppHandle, state: State<'_, AppState>) -> Result<OperationResult, String> {
    cancel_timer_internal(&app, &state)
}

pub fn cancel_timer_from_tray(app: AppHandle) -> Result<OperationResult, String> {
    let state = app.state::<AppState>();
    cancel_timer_internal(&app, &state)
}

fn cancel_timer_internal(app: &AppHandle, state: &State<AppState>) -> Result<OperationResult, String> {
    state.bump_warning_revision();
    let shutdown_result = shutdown::cancel_shutdown_internal()?;
    let _ = sleep::allow_sleep_internal();
    let _ = audio::stop_ringtone();

    let _ = state.mutate_config(|config| {
        config.runtime.active_task = None;
        Ok(())
    })?;
    let _ = sync_tray(app);
    emit_app_log(
        app,
        "info",
        "backend",
        "timer",
        "Shutdown task cancelled",
        None,
    );

    Ok(OperationResult {
        success: shutdown_result.success,
        message: shutdown_result.message,
    })
}

#[tauri::command]
pub async fn preview_ringtone(
    app: AppHandle,
    state: State<'_, AppState>,
    path: Option<String>,
) -> Result<OperationResult, String> {
    let selected_path = path.unwrap_or_else(|| state.get_config().preferences.ringtone_path);
    if selected_path.trim().is_empty() {
        return Err("No ringtone selected".to_string());
    }

    audio::play_ringtone_internal(&selected_path)?;
    emit_app_log(
        &app,
        "info",
        "backend",
        "audio",
        "Ringtone preview started",
        Some(selected_path.clone()),
    );
    Ok(OperationResult {
        success: true,
        message: format!("Playing {}", selected_path),
    })
}

#[tauri::command]
pub fn pick_media_file(app: AppHandle, kind: String) -> Result<Option<String>, String> {
    let dialog = match kind.as_str() {
        "audio" => app
            .dialog()
            .file()
            .add_filter("Audio", &["mp3", "wav", "ogg", "flac", "aac", "m4a"])
            .set_title("Select Audio File"),
        "image" => app
            .dialog()
            .file()
            .add_filter("Image", &["png", "jpg", "jpeg", "webp", "bmp"])
            .set_title("Select Background Image"),
        "theme" => app
            .dialog()
            .file()
            .add_filter("Theme JSON", &["json"])
            .set_title("Import Theme"),
        _ => return Err("Unsupported media picker kind".to_string()),
    };

    let selected = dialog
        .blocking_pick_file()
        .and_then(|path| path.into_path().ok())
        .map(|path| path.to_string_lossy().to_string());
    Ok(selected)
}

#[tauri::command]
pub fn import_theme(app: AppHandle) -> Result<Value, String> {
    let file = app
        .dialog()
        .file()
        .add_filter("Theme JSON", &["json"])
        .set_title("Import Theme")
        .blocking_pick_file()
        .ok_or_else(|| "Import cancelled".to_string())?;

    let path = file
        .into_path()
        .map_err(|_| "Unsupported theme file path".to_string())?;
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let theme = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    emit_app_log(
        &app,
        "info",
        "backend",
        "appearance",
        "Theme file imported",
        None,
    );
    Ok(theme)
}

#[tauri::command]
pub fn export_theme(
    app: AppHandle,
    theme_json: Value,
    suggested_name: Option<String>,
) -> Result<OperationResult, String> {
    let base_name = suggested_name
        .unwrap_or_else(|| "custom-theme".to_string())
        .replace(['\\', '/', ':', '*', '?', '"', '<', '>', '|'], "-");
    let file = app
        .dialog()
        .file()
        .add_filter("Theme JSON", &["json"])
        .set_title("Export Theme")
        .set_file_name(format!("{base_name}.json"))
        .blocking_save_file()
        .ok_or_else(|| "Export cancelled".to_string())?;
    let path = file
        .into_path()
        .map_err(|_| "Unsupported export path".to_string())?;
    let pretty = serde_json::to_string_pretty(&theme_json).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| e.to_string())?;
    emit_app_log(
        &app,
        "info",
        "backend",
        "appearance",
        "Theme file exported",
        None,
    );

    Ok(OperationResult {
        success: true,
        message: "Theme exported successfully".to_string(),
    })
}

pub fn restore_runtime(app: AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let config = state.get_config();

    if let Some(task) = config.runtime.active_task {
        let target = parse_datetime(&task.target_at_iso)?;
        if target <= now_local() {
            let _ = state.mutate_config(|config| {
                config.runtime.active_task = None;
                Ok(())
            });
            emit_app_log(
                &app,
                "warn",
                "backend",
                "restore",
                "Skipped expired shutdown task during restore",
                None,
            );
            return Ok(());
        }

        let seconds_until = (target - now_local()).whole_seconds();
        shutdown::schedule_shutdown_after(seconds_until as u64)?;
        if task.prevent_sleep {
            let _ = sleep::prevent_sleep_internal();
        }
        schedule_warning(app.clone(), config.preferences.notification_enabled, task);
        emit_app_log(
            &app,
            "info",
            "backend",
            "restore",
            "Restored scheduled shutdown task",
            None,
        );
    } else {
        emit_app_log(
            &app,
            "debug",
            "backend",
            "restore",
            "No active runtime task to restore",
            None,
        );
    }

    Ok(())
}

fn start_restore_runtime(app: AppHandle) {
    let state = app.state::<AppState>();
    if !state.mark_restore_started() {
        return;
    }

    thread::spawn(move || {
        emit_app_log(
            &app,
            "debug",
            "backend",
            "restore",
            "Started background runtime restore",
            None,
        );
        if let Err(error) = restore_runtime(app.clone()) {
            log::error!("Failed to restore runtime: {}", error);
            emit_app_log(
                &app,
                "error",
                "backend",
                "restore",
                "Runtime restore failed",
                Some(error.clone()),
            );
            let _ = app.emit(
                "runtime-restore-error",
                json!({
                    "message": error,
                }),
            );
        }
    });
}

fn schedule_warning(app: AppHandle, notification_enabled: bool, task: ActiveTask) {
    let state = app.state::<AppState>();
    let revision = state.bump_warning_revision();

    thread::spawn(move || {
        let warning_at = task
            .warning_at_iso
            .as_ref()
            .and_then(|value| parse_datetime(value).ok());
        if let Some(warning_at) = warning_at {
            sleep_until_or_cancel(&app, revision, warning_at);
            if app.state::<AppState>().warning_revision() != revision {
                return;
            }
            if !task.ringtone_path.trim().is_empty() {
                let _ = audio::play_ringtone_internal(&task.ringtone_path);
            }
            emit_app_log(
                &app,
                "warn",
                "backend",
                "timer",
                "Warning threshold reached before shutdown",
                Some(format!("targetAt={}", task.target_at_iso)),
            );
            if notification_enabled {
                let _ = emit_timer_warning(&app, &task);
            }
        }

        if let Ok(target_at) = parse_datetime(&task.target_at_iso) {
            sleep_until_or_cancel(&app, revision, target_at + TimeDuration::seconds(2));
            if app.state::<AppState>().warning_revision() != revision {
                return;
            }
            let _ = app.state::<AppState>().mutate_config(|config| {
                config.runtime.active_task = None;
                Ok(())
            });
            let _ = sync_tray(&app);
        }
    });
}

fn sleep_until_or_cancel(app: &AppHandle, revision: u64, target: OffsetDateTime) {
    loop {
        if app.state::<AppState>().warning_revision() != revision {
            return;
        }
        let now = now_local();
        if now >= target {
            return;
        }
        let remaining = (target - now).whole_seconds().max(1) as u64;
        thread::sleep(Duration::from_secs(remaining.min(5)));
    }
}

fn emit_timer_warning(app: &AppHandle, task: &ActiveTask) -> Result<(), String> {
    app.emit(
        "timer-warning",
        json!({
            "title": "Shutdown Timer",
            "body": format!("Shutdown is scheduled at {}", task.target_at_iso),
            "task": task,
        }),
    )
    .map_err(|e| e.to_string())
}

fn emit_app_log(
    app: &AppHandle,
    level: &str,
    source: &str,
    category: &str,
    message: &str,
    detail: Option<String>,
) {
    let _ = app.emit(
        "app-log",
        AppLogEvent {
            level,
            source,
            category,
            message,
            detail,
        },
    );
}

fn config_path<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("app-config.json"))
}

fn load_or_default(path: &Path) -> Result<AppConfig, String> {
    if path.exists() {
        match fs::read_to_string(path) {
            Ok(content) => match serde_json::from_str::<AppConfig>(&content) {
                Ok(mut config) => {
                    config.version = CONFIG_VERSION;
                    return Ok(config);
                }
                Err(error) => {
                    log::error!("Failed to parse config file: {}", error);
                    let backup_path = path.with_extension("broken.json");
                    let _ = fs::copy(path, backup_path);
                }
            },
            Err(error) => {
                log::error!("Failed to read config file: {}", error);
            }
        }
    }

    let config = default_config();
    save_config_file(path, &config)?;
    Ok(config)
}

fn save_config_file(path: &Path, config: &AppConfig) -> Result<(), String> {
    let temp_path = path.with_extension("json.tmp");
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&temp_path, content).map_err(|e| e.to_string())?;
    if path.exists() {
        fs::remove_file(path).map_err(|e| e.to_string())?;
    }
    fs::rename(&temp_path, path).map_err(|e| e.to_string())?;
    Ok(())
}

fn default_config() -> AppConfig {
    AppConfig {
        version: CONFIG_VERSION,
        legacy_migrated: false,
        preferences: Preferences {
            lang: "zh".to_string(),
            auto_start: false,
            prevent_sleep: true,
            min_to_tray: true,
            notification_enabled: true,
            ringtone_path: String::new(),
        },
        timer_draft: TimerDraft {
            mode: "countdown".to_string(),
            countdown: CountdownDraft {
                hours: 0,
                minutes: 5,
                seconds: 0,
            },
            schedule_time: "12:00".to_string(),
        },
        appearance: AppearanceSettings {
            selected_theme_id: "fresh".to_string(),
            draft_theme: json!({}),
            custom_themes: Vec::new(),
            background: BackgroundSettings {
                image_path: String::new(),
                opacity: 0.2,
            },
        },
        runtime: RuntimeState::default(),
    }
}

fn migrate_legacy(mut config: AppConfig, legacy: LegacyMigrationPayload) -> AppConfig {
    if let Some(settings) = legacy.settings {
        if let Some(auto_start) = settings.auto_start {
            config.preferences.auto_start = auto_start;
        }
        if let Some(prevent_sleep) = settings.prevent_sleep {
            config.preferences.prevent_sleep = prevent_sleep;
        }
        if let Some(min_to_tray) = settings.min_to_tray {
            config.preferences.min_to_tray = min_to_tray;
        }
        if let Some(ringtone_path) = settings.ringtone_path {
            config.preferences.ringtone_path = ringtone_path;
        }
    }
    if let Some(theme_id) = legacy.theme_id {
        config.appearance.selected_theme_id = theme_id;
    }
    if let Some(lang) = legacy.lang {
        config.preferences.lang = lang;
    }
    config.legacy_migrated = true;
    config
}

fn merge_json(base: Value, patch: Value) -> Value {
    match (base, patch) {
        (Value::Object(mut base_map), Value::Object(patch_map)) => {
            for (key, value) in patch_map {
                let base_value = base_map.remove(&key).unwrap_or(Value::Null);
                base_map.insert(key, merge_json(base_value, value));
            }
            Value::Object(base_map)
        }
        (_, patch_value) => patch_value,
    }
}

fn resolve_target_time(request: &StartTimerRequest) -> Result<OffsetDateTime, String> {
    match request.mode.as_str() {
        "countdown" => {
            let countdown = request
                .countdown
                .clone()
                .ok_or_else(|| "Countdown values are required".to_string())?;
            let total_seconds = i64::from(countdown.hours) * 3600
                + i64::from(countdown.minutes) * 60
                + i64::from(countdown.seconds);
            if total_seconds <= 0 {
                return Err("Countdown must be greater than zero".to_string());
            }
            Ok(now_local() + TimeDuration::seconds(total_seconds))
        }
        "schedule" => {
            let raw = request
                .schedule_time
                .clone()
                .ok_or_else(|| "Schedule time is required".to_string())?;
            let time = Time::parse(&raw, format_description!("[hour]:[minute]"))
                .map_err(|_| "Invalid schedule time".to_string())?;
            let now = now_local();
            let mut candidate = now.replace_time(time);
            if candidate <= now {
                candidate += TimeDuration::days(1);
            }
            Ok(candidate)
        }
        _ => Err("Unsupported timer mode".to_string()),
    }
}

fn now_local() -> OffsetDateTime {
    OffsetDateTime::now_local().unwrap_or_else(|_| OffsetDateTime::now_utc())
}

fn format_datetime(datetime: OffsetDateTime) -> Result<String, String> {
    datetime.format(&Rfc3339).map_err(|e| e.to_string())
}

fn parse_datetime(raw: &str) -> Result<OffsetDateTime, String> {
    OffsetDateTime::parse(raw, &Rfc3339).map_err(|e| e.to_string())
}

fn tray_labels_for_lang(lang: &str) -> TrayLabels {
    match lang {
        "en" => TrayLabels {
            show: "Show Window".to_string(),
            cancel: "Cancel Shutdown".to_string(),
            quit: "Quit".to_string(),
            tooltip: "Shutdown Timer".to_string(),
        },
        "ja" => TrayLabels {
            show: "ウィンドウを表示".to_string(),
            cancel: "シャットダウン取消".to_string(),
            quit: "終了".to_string(),
            tooltip: "シャットダウンタイマー".to_string(),
        },
        _ => TrayLabels {
            show: "显示窗口".to_string(),
            cancel: "取消关机".to_string(),
            quit: "退出".to_string(),
            tooltip: "关机定时器".to_string(),
        },
    }
}

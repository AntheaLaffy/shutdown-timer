use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

mod audio;
mod config;
mod shutdown;
mod sleep;

pub use audio::*;
pub use config::*;
pub use shutdown::*;
pub use sleep::*;

const TRAY_ID: &str = "main-tray";

#[cfg_attr(windows, allow(non_snake_case))]
pub fn run() {
    env_logger::init();
    log::info!("Starting Shutdown Timer application");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let state = config::AppState::new(app.handle().clone())?;
            app.manage(state);

            if let Err(error) = init_tray(app) {
                log::error!("Failed to initialize tray: {}", error);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            config::bootstrap_app_state,
            config::update_app_config,
            config::start_timer,
            config::cancel_timer,
            config::pick_media_file,
            config::preview_ringtone,
            audio::stop_ringtone,
            config::import_theme,
            config::export_theme,
            config::set_auto_start_preference,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let should_hide = window
                    .app_handle()
                    .state::<config::AppState>()
                    .should_minimize_to_tray();

                if should_hide {
                    let _ = window.hide();
                    api.prevent_close();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn sync_tray(app: &tauri::AppHandle<tauri::Wry>) -> Result<(), String> {
    let labels = app.state::<config::AppState>().tray_labels();

    let show_i = MenuItem::with_id(app, "show", &labels.show, true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let cancel_i = MenuItem::with_id(app, "cancel", &labels.cancel, true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let quit_i = MenuItem::with_id(app, "quit", &labels.quit, true, None::<&str>)
        .map_err(|e| e.to_string())?;

    let menu = Menu::with_items(app, &[&show_i, &cancel_i, &quit_i]).map_err(|e| e.to_string())?;

    let tray = app
        .tray_by_id(TRAY_ID)
        .ok_or_else(|| "Tray icon not initialized".to_string())?;
    tray.set_menu(Some(menu)).map_err(|e| e.to_string())?;
    tray.set_tooltip(Some(labels.tooltip))
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn init_tray(app: &tauri::App<tauri::Wry>) -> Result<(), String> {
    let labels = app.state::<config::AppState>().tray_labels();
    let show_i = MenuItem::with_id(app, "show", &labels.show, true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let cancel_i = MenuItem::with_id(app, "cancel", &labels.cancel, true, None::<&str>)
        .map_err(|e| e.to_string())?;
    let quit_i = MenuItem::with_id(app, "quit", &labels.quit, true, None::<&str>)
        .map_err(|e| e.to_string())?;

    let menu = Menu::with_items(app, &[&show_i, &cancel_i, &quit_i]).map_err(|e| e.to_string())?;
    let icon = app
        .default_window_icon()
        .ok_or_else(|| "Missing tray icon".to_string())?;

    TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon.clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip(&labels.tooltip)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "cancel" => {
                let _ = config::cancel_timer_from_tray(app.app_handle().clone());
            }
            "quit" => {
                let _ = audio::stop_ringtone();
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            use tauri::tray::{MouseButton, TrayIconEvent};
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)
        .map_err(|e| e.to_string())?;

    Ok(())
}

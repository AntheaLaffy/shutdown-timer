use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

mod audio;
mod shutdown;
mod sleep;

pub use audio::*;
pub use shutdown::*;
pub use sleep::*;

#[cfg_attr(windows, allow(non_snake_case))]
pub fn run() {
    env_logger::init();
    log::info!("Starting Shutdown Timer application");

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            shutdown::shutdown_now,
            shutdown::cancel_shutdown,
            shutdown::schedule_shutdown,
            shutdown::enable_auto_start,
            shutdown::disable_auto_start,
            shutdown::is_auto_start_enabled,
            sleep::prevent_sleep,
            sleep::allow_sleep,
            audio::play_ringtone,
            audio::stop_ringtone,
        ])
        .setup(|app| {
            log::info!("Setting up application");

            // Build tray menu with quit option
            let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let cancel_i = MenuItem::with_id(app, "cancel", "取消关机", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&show_i, &cancel_i, &quit_i])?;

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(false)  // Left click shows window, right click shows menu
                .tooltip("Shutdown Timer")
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "cancel" => {
                            let _ = shutdown::cancel_shutdown_internal();
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    // Left click shows window
                    use tauri::tray::TrayIconEvent;
                    if let TrayIconEvent::Click { button: tauri::tray::MouseButton::Left, .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Minimize to tray instead of closing
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

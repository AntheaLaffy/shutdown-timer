use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ShutdownResult {
    pub success: bool,
    pub message: String,
}

/// Cancel any scheduled shutdown
#[tauri::command]
pub fn cancel_shutdown() -> Result<ShutdownResult, String> {
    log::info!("Cancel shutdown command received");
    cancel_shutdown_internal()
}

pub fn cancel_shutdown_internal() -> Result<ShutdownResult, String> {
    #[cfg(windows)]
    {
        let output = Command::new("shutdown")
            .args(["/a"])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            log::info!("Shutdown cancelled successfully");
            Ok(ShutdownResult {
                success: true,
                message: "Shutdown cancelled".to_string(),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            log::warn!("Failed to cancel shutdown: {}", stderr);
            Ok(ShutdownResult {
                success: false,
                message: format!("No shutdown scheduled or {}", stderr),
            })
        }
    }

    #[cfg(not(windows))]
    {
        Ok(ShutdownResult {
            success: false,
            message: "Not supported on this platform".to_string(),
        })
    }
}

/// Execute immediate shutdown
#[tauri::command]
pub fn shutdown_now() -> Result<ShutdownResult, String> {
    log::info!("Immediate shutdown command received");

    #[cfg(windows)]
    {
        let output = Command::new("shutdown")
            .args(["/s", "/f", "/t", "0"])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            log::info!("Shutdown initiated successfully");
            Ok(ShutdownResult {
                success: true,
                message: "Shutting down...".to_string(),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            log::error!("Shutdown failed: {}", stderr);

            let ps_output = Command::new("powershell")
                .args(["-NoProfile", "-Command", "Stop-Computer -Force"])
                .output();

            if ps_output.is_ok() && ps_output.unwrap().status.success() {
                Ok(ShutdownResult {
                    success: true,
                    message: "Shutting down...".to_string(),
                })
            } else {
                Err(format!("Shutdown failed: {}. Try running as administrator.", stderr))
            }
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Schedule shutdown at a specific time (HH:MM format)
#[tauri::command]
pub fn schedule_shutdown(time: String, cancel_on_wake: bool) -> Result<ShutdownResult, String> {
    log::info!("Schedule shutdown at {} (cancel_on_wake: {})", time, cancel_on_wake);

    #[cfg(windows)]
    {
        let parts: Vec<&str> = time.split(':').collect();
        if parts.len() != 2 {
            return Err("Invalid time format. Use HH:MM".to_string());
        }

        let target_hour: u32 = parts[0].parse().map_err(|_| "Invalid hour")?;
        let target_min: u32 = parts[1].parse().map_err(|_| "Invalid minute")?;

        if target_hour > 23 || target_min > 59 {
            return Err("Invalid time values".to_string());
        }

        let _ = Command::new("shutdown").args(["/a"]).output();

        let output = Command::new("schtasks")
            .args([
                "/Create",
                "/TN",
                "ShutdownTimer",
                "/SC",
                "ONCE",
                "/ST",
                &format!("{:02}:{:02}", target_hour, target_min),
                "/TR",
                "shutdown /s /f",
                "/F",
            ])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            log::info!("Shutdown scheduled for {}", time);
            Ok(ShutdownResult {
                success: true,
                message: format!("Shutdown scheduled for {}", time),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            log::error!("Failed to schedule shutdown: {}", stderr);
            Err(format!("Failed to schedule: {}", stderr))
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Enable auto-start with Windows
#[tauri::command]
pub fn enable_auto_start() -> Result<ShutdownResult, String> {
    log::info!("Enable auto-start");

    #[cfg(windows)]
    {
        let exe_path = std::env::current_exe()
            .map_err(|e| e.to_string())?;
        let exe_path_str = exe_path.to_string_lossy();

        let ps_script = format!(
            r#"Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'ShutdownTimer' -Value '"{}"'"#,
            exe_path_str
        );

        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", &ps_script])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            log::info!("Auto-start enabled");
            Ok(ShutdownResult {
                success: true,
                message: "Auto-start enabled".to_string(),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            log::error!("Failed to enable auto-start: {}", stderr);
            Err(format!("Failed to enable auto-start: {}", stderr))
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Disable auto-start with Windows
#[tauri::command]
pub fn disable_auto_start() -> Result<ShutdownResult, String> {
    log::info!("Disable auto-start");

    #[cfg(windows)]
    {
        let ps_script = r#"Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'ShutdownTimer' -ErrorAction SilentlyContinue"#;

        let _output = Command::new("powershell")
            .args(["-NoProfile", "-Command", ps_script])
            .output()
            .map_err(|e| e.to_string())?;

        log::info!("Auto-start disabled");
        Ok(ShutdownResult {
            success: true,
            message: "Auto-start disabled".to_string(),
        })
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Check if auto-start is enabled
#[tauri::command]
pub fn is_auto_start_enabled() -> Result<bool, String> {
    #[cfg(windows)]
    {
        let ps_script = r#"Test-Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run\ShutdownTimer'"#;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", ps_script])
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(result == "True")
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}
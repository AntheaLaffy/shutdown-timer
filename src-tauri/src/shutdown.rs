use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShutdownResult {
    pub success: bool,
    pub message: String,
}

pub fn cancel_shutdown_internal() -> Result<ShutdownResult, String> {
    #[cfg(windows)]
    {
        let output = Command::new("shutdown")
            .args(["/a"])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(ShutdownResult {
                success: true,
                message: "Shutdown cancelled".to_string(),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Ok(ShutdownResult {
                success: false,
                message: format!("No shutdown scheduled or {}", stderr.trim()),
            })
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

pub fn schedule_shutdown_after(seconds: u64) -> Result<ShutdownResult, String> {
    #[cfg(windows)]
    {
        let output = Command::new("shutdown")
            .args(["/s", "/f", "/t", &seconds.to_string()])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(ShutdownResult {
                success: true,
                message: format!("Shutdown scheduled in {} seconds", seconds),
            })
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Failed to schedule shutdown: {}", stderr.trim()))
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

pub fn enable_auto_start_internal() -> Result<(), String> {
    #[cfg(windows)]
    {
        let exe_path = std::env::current_exe().map_err(|e| e.to_string())?;
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
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Failed to enable auto-start: {}", stderr.trim()))
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

pub fn disable_auto_start_internal() -> Result<(), String> {
    #[cfg(windows)]
    {
        let ps_script = r#"Remove-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'ShutdownTimer' -ErrorAction SilentlyContinue"#;
        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", ps_script])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Failed to disable auto-start: {}", stderr.trim()))
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

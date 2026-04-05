use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct SleepResult {
    pub success: bool,
    pub message: String,
}

/// Prevent system from sleeping
#[tauri::command]
pub fn prevent_sleep() -> Result<SleepResult, String> {
    log::info!("Prevent sleep command received");

    #[cfg(windows)]
    {
        // Use PowerShell to call SetThreadExecutionState
        let ps_script = r#"
            Add-Type -Namespace Win32 -Name Power -MemberDefinition @'
                [DllImport("kernel32.dll")]
                public static extern int SetThreadExecutionState(int esFlags);
'@
            $result = [Win32.Power]::SetThreadExecutionState(0x80000003)
            if ($result -ne 0) { Write-Output "SUCCESS" } else { Write-Output "FAILED" }
        "#;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", ps_script])
            .output()
            .map_err(|e| e.to_string())?;

        let result_str = String::from_utf8_lossy(&output.stdout).trim().to_string();

        if result_str == "SUCCESS" {
            log::info!("Sleep prevention activated");
            Ok(SleepResult {
                success: true,
                message: "Sleep prevention enabled".to_string(),
            })
        } else {
            log::error!("Failed to prevent sleep");
            Err("Failed to prevent sleep".to_string())
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

/// Allow system to sleep normally
#[tauri::command]
pub fn allow_sleep() -> Result<SleepResult, String> {
    log::info!("Allow sleep command received");

    #[cfg(windows)]
    {
        // Use PowerShell to call SetThreadExecutionState with ES_CONTINUOUS only (0x80000000)
        let ps_script = r#"
            Add-Type -Namespace Win32 -Name Power -MemberDefinition @'
                [DllImport("kernel32.dll")]
                public static extern int SetThreadExecutionState(int esFlags);
'@
            $result = [Win32.Power]::SetThreadExecutionState(0x80000000)
            if ($result -ne 0) { Write-Output "SUCCESS" } else { Write-Output "FAILED" }
        "#;

        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", ps_script])
            .output()
            .map_err(|e| e.to_string())?;

        let result_str = String::from_utf8_lossy(&output.stdout).trim().to_string();

        if result_str == "SUCCESS" {
            log::info!("Sleep prevention deactivated");
            Ok(SleepResult {
                success: true,
                message: "Sleep prevention disabled".to_string(),
            })
        } else {
            log::error!("Failed to allow sleep");
            Err("Failed to allow sleep".to_string())
        }
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}
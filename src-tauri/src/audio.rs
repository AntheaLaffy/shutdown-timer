use rodio::{Decoder, OutputStream, Sink};
use serde::{Deserialize, Serialize};
use std::{
    fs::File,
    io::BufReader,
    path::Path,
    sync::{
        atomic::{AtomicU64, Ordering},
        OnceLock,
    },
    thread,
    time::Duration,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioResult {
    pub success: bool,
    pub message: String,
}

static PLAYBACK_REVISION: OnceLock<AtomicU64> = OnceLock::new();

fn playback_revision() -> &'static AtomicU64 {
    PLAYBACK_REVISION.get_or_init(|| AtomicU64::new(0))
}

pub fn play_ringtone_internal(path: &str) -> Result<AudioResult, String> {
    #[cfg(windows)]
    {
        if !Path::new(path).exists() {
            return Err(format!("File not found: {}", path));
        }

        let revision = playback_revision().fetch_add(1, Ordering::SeqCst) + 1;
        let selected_path = path.to_string();

        thread::spawn(move || {
            let Ok((_stream, stream_handle)) = OutputStream::try_default() else {
                return;
            };
            let Ok(sink) = Sink::try_new(&stream_handle) else {
                return;
            };
            let Ok(file) = File::open(&selected_path) else {
                return;
            };
            let Ok(source) = Decoder::new(BufReader::new(file)) else {
                return;
            };
            sink.append(source);

            loop {
                if playback_revision().load(Ordering::SeqCst) != revision {
                    sink.stop();
                    break;
                }
                if sink.empty() {
                    break;
                }
                thread::sleep(Duration::from_millis(250));
            }
        });

        Ok(AudioResult {
            success: true,
            message: format!("Playing: {}", path),
        })
    }

    #[cfg(not(windows))]
    {
        Err("Not supported on this platform".to_string())
    }
}

#[tauri::command]
pub fn stop_ringtone() -> Result<AudioResult, String> {
    playback_revision().fetch_add(1, Ordering::SeqCst);
    Ok(AudioResult {
        success: true,
        message: "Ringtone stopped".to_string(),
    })
}

use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, Ordering};
use std::io::BufReader;

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioResult {
    pub success: bool,
    pub message: String,
}

static PLAYING: AtomicBool = AtomicBool::new(false);

/// Play an audio file (supports WAV, FLAC, MP3, OGG, etc.)
#[tauri::command]
pub fn play_ringtone(path: String) -> Result<AudioResult, String> {
    log::info!("Play ringtone: {}", path);

    #[cfg(windows)]
    {
        // Check if file exists
        if !std::path::Path::new(&path).exists() {
            return Err(format!("File not found: {}", path));
        }

        // Stop any currently playing audio first
        let _ = stop_ringtone_internal();

        // Clone path for the thread
        let path_for_thread = path.clone();

        // Play in a separate thread
        std::thread::spawn(move || {
            if let Err(e) = play_audio_file(&path_for_thread) {
                log::error!("Failed to play audio: {}", e);
            }
        });

        PLAYING.store(true, Ordering::SeqCst);

        log::info!("Playing ringtone: {}", path);
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

#[cfg(windows)]
fn play_audio_file(path: &str) -> Result<(), String> {
    use rodio::{Decoder, OutputStream, Sink};

    let (_stream, stream_handle) = OutputStream::try_default()
        .map_err(|e| format!("Failed to open audio output: {}", e))?;

    let file = std::fs::File::open(path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
    let reader = BufReader::new(file);

    let source = Decoder::new(reader)
        .map_err(|e| format!("Failed to decode audio: {}", e))?;

    let sink = Sink::try_new(&stream_handle)
        .map_err(|e| format!("Failed to create sink: {}", e))?;

    sink.append(source);

    // Wait for playback to finish
    sink.sleep_until_end();

    PLAYING.store(false, Ordering::SeqCst);
    Ok(())
}

/// Stop currently playing ringtone
#[tauri::command]
pub fn stop_ringtone() -> Result<AudioResult, String> {
    log::info!("Stop ringtone command received");
    stop_ringtone_internal();
    Ok(AudioResult {
        success: true,
        message: "Ringtone stopped".to_string(),
    })
}

fn stop_ringtone_internal() -> Result<(), String> {
    PLAYING.store(false, Ordering::SeqCst);
    Ok(())
}
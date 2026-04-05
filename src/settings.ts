// Settings persistence with localStorage

export interface PersistentSettings {
  autoStart: boolean;
  preventSleep: boolean;
  minToTray: boolean;
  ringtonePath: string;
}

const STORAGE_KEY = 'shutdown-timer-settings';

const defaultSettings: PersistentSettings = {
  autoStart: false,
  preventSleep: true,
  minToTray: true,
  ringtonePath: '',
};

export function getSettings(): PersistentSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

export function saveSettings(settings: Partial<PersistentSettings>): void {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// Async versions that sync with Rust backend
import { invoke } from '@tauri-apps/api/core';

let cachedAutoStart: boolean | null = null;

export async function loadAutoStartStatus(): Promise<boolean> {
  if (cachedAutoStart !== null) {
    return cachedAutoStart;
  }

  try {
    cachedAutoStart = await invoke<boolean>('is_auto_start_enabled');
    return cachedAutoStart;
  } catch (e) {
    console.error('Failed to load auto-start status:', e);
    // Fall back to cached/localStorage value
    cachedAutoStart = getSettings().autoStart;
    return cachedAutoStart;
  }
}

export async function setAutoStart(enabled: boolean): Promise<boolean> {
  try {
    if (enabled) {
      await invoke('enable_auto_start');
    } else {
      await invoke('disable_auto_start');
    }
    cachedAutoStart = enabled;
    saveSettings({ autoStart: enabled });
    return true;
  } catch (e) {
    console.error('Failed to set auto-start:', e);
    return false;
  }
}

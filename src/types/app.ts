import type { ThemeDefinition } from './theme';

export type Lang = 'zh' | 'en' | 'ja';
export type TimerMode = 'countdown' | 'schedule';

export interface CountdownDraft {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface TimerDraft {
  mode: TimerMode;
  countdown: CountdownDraft;
  scheduleTime: string;
}

export interface Preferences {
  lang: Lang;
  autoStart: boolean;
  preventSleep: boolean;
  minToTray: boolean;
  notificationEnabled: boolean;
  ringtonePath: string;
}

export interface BackgroundSettings {
  imagePath: string;
  opacity: number;
}

export interface AppearanceSettings {
  selectedThemeId: string;
  draftTheme: ThemeDefinition | Record<string, never>;
  customThemes: ThemeDefinition[];
  background: BackgroundSettings;
}

export interface ActiveTask {
  mode: TimerMode;
  targetAtIso: string;
  warningAtIso?: string | null;
  startedAtIso: string;
  preventSleep: boolean;
  ringtonePath: string;
  status: string;
}

export interface RuntimeState {
  activeTask: ActiveTask | null;
}

export interface AppConfig {
  version: number;
  legacyMigrated: boolean;
  preferences: Preferences;
  timerDraft: TimerDraft;
  appearance: AppearanceSettings;
  runtime: RuntimeState;
}

export interface BootstrapPayload {
  config: AppConfig;
  runtime: RuntimeState;
  system: {
    platform: string;
    autoStartSupported: boolean;
  };
}

export interface OperationResult {
  success: boolean;
  message: string;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'frontend' | 'backend' | 'system';

export interface AppLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  category: string;
  message: string;
  detail?: string;
  count?: number;
}

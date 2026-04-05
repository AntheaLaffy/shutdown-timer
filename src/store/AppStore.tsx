import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { languages, t } from '../i18n';
import { presetThemes } from '../data/preset-themes';
import type {
  ActiveTask,
  AppConfig,
  AppLogEntry,
  BootstrapPayload,
  Lang,
  LogLevel,
  LogSource,
  OperationResult,
  TimerDraft,
} from '../types/app';
import {
  applyTheme,
  isThemeValue,
  normalizeTheme,
  themeFromJson,
  type ThemeDefinition,
} from '../types/theme';

type Page = 'timer' | 'settings' | 'appearance' | 'logs';
type BootStatus = 'booting' | 'ready' | 'error';
type LogDraft = Omit<AppLogEntry, 'id' | 'timestamp' | 'count'> & { timestamp?: string };

interface AppStoreValue {
  ready: boolean;
  bootStatus: BootStatus;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  config: AppConfig;
  lang: Lang;
  presetThemes: ThemeDefinition[];
  customThemes: ThemeDefinition[];
  resolvedTheme: ThemeDefinition | null;
  activeTask: ActiveTask | null;
  remainingSeconds: number | null;
  statusMessage: string | null;
  isMutating: boolean;
  logs: AppLogEntry[];
  clearLogs: () => void;
  setStatusMessage: (message: string | null) => void;
  patchConfig: (patch: unknown) => Promise<void>;
  setLanguage: (lang: Lang) => Promise<void>;
  setTimerDraft: (draft: Partial<TimerDraft>) => Promise<void>;
  startTimer: () => Promise<void>;
  cancelTimer: () => Promise<void>;
  chooseRingtone: () => Promise<void>;
  previewRingtone: () => Promise<void>;
  stopRingtone: () => Promise<void>;
  setAutoStart: (enabled: boolean) => Promise<void>;
  selectTheme: (themeId: string) => Promise<void>;
  updateDraftTheme: (theme: ThemeDefinition) => Promise<void>;
  saveCurrentTheme: () => Promise<void>;
  renameCustomTheme: (themeId: string) => Promise<void>;
  deleteCustomTheme: (themeId: string) => Promise<void>;
  importTheme: () => Promise<void>;
  exportCurrentTheme: () => Promise<void>;
  setBackgroundOpacity: (opacity: number) => Promise<void>;
  chooseBackgroundImage: () => Promise<void>;
  clearBackgroundImage: () => Promise<void>;
  backgroundImageUrl: string | null;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);
const MAX_LOGS = 200;
const LOG_MERGE_WINDOW_MS = 2500;

const defaultConfig: AppConfig = {
  version: 1,
  legacyMigrated: false,
  preferences: {
    lang: 'zh',
    autoStart: false,
    preventSleep: true,
    minToTray: true,
    notificationEnabled: true,
    ringtonePath: '',
  },
  timerDraft: {
    mode: 'countdown',
    countdown: {
      hours: 0,
      minutes: 5,
      seconds: 0,
    },
    scheduleTime: '12:00',
  },
  appearance: {
    selectedThemeId: 'fresh',
    draftTheme: presetThemes[0],
    customThemes: [],
    background: {
      imagePath: '',
      opacity: 0.2,
    },
  },
  runtime: {
    activeTask: null,
  },
};

function mergeJson<T>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return patch as T;
  if (!base || typeof base !== 'object' || Array.isArray(base)) return patch as T;

  const next: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    next[key] = mergeJson(next[key], value);
  }
  return next as T;
}

function readLegacyPayload() {
  try {
    const settings = localStorage.getItem('shutdown-timer-settings');
    const themeId = localStorage.getItem('theme');
    const lang = localStorage.getItem('lang');
    const payload: Record<string, unknown> = {};

    if (settings) payload.settings = JSON.parse(settings);
    if (themeId) payload.themeId = themeId;
    if (lang === 'zh' || lang === 'en' || lang === 'ja') payload.lang = lang;

    return Object.keys(payload).length > 0 ? payload : null;
  } catch {
    return null;
  }
}

function resolvedThemeFromConfig(config: AppConfig): ThemeDefinition | null {
  const preset = presetThemes.find((theme) => theme.id === config.appearance.selectedThemeId) ?? presetThemes[0];
  const custom = config.appearance.customThemes.find((theme) => theme.id === config.appearance.selectedThemeId);
  const selected = custom ?? preset;

  if (isThemeValue(config.appearance.draftTheme)) {
    return normalizeTheme(config.appearance.draftTheme, selected);
  }

  return selected;
}

function toAbsoluteImageUrl(path: string): string | null {
  if (!path) return null;
  return convertFileSrc(path);
}

function createLogAppender(setLogs: Dispatch<SetStateAction<AppLogEntry[]>>) {
  return (draft: LogDraft) => {
    setLogs((current) => {
      const nextTimestamp = draft.timestamp ?? new Date().toISOString();
      const previous = current[0];
      if (previous) {
        const previousTime = new Date(previous.timestamp).getTime();
        const nextTime = new Date(nextTimestamp).getTime();
        const canMerge =
          previous.level === draft.level &&
          previous.source === draft.source &&
          previous.category === draft.category &&
          previous.message === draft.message &&
          previous.detail === draft.detail &&
          nextTime - previousTime <= LOG_MERGE_WINDOW_MS;

        if (canMerge) {
          const merged: AppLogEntry = {
            ...previous,
            timestamp: nextTimestamp,
            count: (previous.count ?? 1) + 1,
          };
          return [merged, ...current.slice(1)];
        }
      }

      const entry: AppLogEntry = {
        id: `${nextTimestamp}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: nextTimestamp,
        count: 1,
        ...draft,
      };
      return [entry, ...current].slice(0, MAX_LOGS);
    });
  };
}

export function AppProvider({ children }: PropsWithChildren) {
  const [bootStatus, setBootStatus] = useState<BootStatus>('booting');
  const [currentPage, setCurrentPage] = useState<Page>('timer');
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const configRef = useRef(config);
  const mutationQueueRef = useRef(Promise.resolve());
  const appendLog = useMemo(() => createLogAppender(setLogs), []);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    appendLog({
      level: 'info',
      source: 'frontend',
      category: 'bootstrap',
      message: 'Application shell mounted',
    });

    let disposed = false;
    void invoke<BootstrapPayload>('bootstrap_app_state', {
      legacy: readLegacyPayload(),
    })
      .then((payload) => {
        if (disposed) return;
        appendLog({
          level: 'info',
          source: 'backend',
          category: 'bootstrap',
          message: 'Bootstrap payload loaded',
        });
        startTransition(() => {
          setConfig(payload.config);
          setBootStatus('ready');
        });
      })
      .catch((error) => {
        console.error(error);
        appendLog({
          level: 'error',
          source: 'backend',
          category: 'bootstrap',
          message: 'Bootstrap failed',
          detail: String(error),
        });
        if (disposed) return;
        startTransition(() => {
          setBootStatus('error');
          setStatusMessage(String(error));
        });
      });

    return () => {
      disposed = true;
    };
  }, [appendLog]);

  useEffect(() => {
    const theme = resolvedThemeFromConfig(config);
    if (theme) {
      applyTheme(theme, config.appearance.background);
    }
  }, [config]);

  useEffect(() => {
    if (!config.runtime.activeTask) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const target = new Date(config.runtime.activeTask!.targetAtIso).getTime();
      const next = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setRemainingSeconds(next);
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [config.runtime.activeTask]);

  useEffect(() => {
    appendLog({
      level: 'debug',
      source: 'frontend',
      category: 'navigation',
      message: `Current page changed to ${currentPage}`,
    });
  }, [appendLog, currentPage]);

  useEffect(() => {
    const warningPromise = listen<{ title?: string; body?: string }>('timer-warning', async (event) => {
      const lang = configRef.current.preferences.lang ?? 'zh';
      const title = event.payload.title ?? t('app.title', lang);
      const body = event.payload.body ?? t('warning.shutdownSoon', lang);

      appendLog({
        level: 'warn',
        source: 'backend',
        category: 'timer',
        message: body,
        detail: title,
      });

      if ('Notification' in window) {
        try {
          if (Notification.permission === 'granted') {
            new Notification(title, { body });
          } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification(title, { body });
            }
          }
        } catch (error) {
          appendLog({
            level: 'error',
            source: 'frontend',
            category: 'notification',
            message: 'Notification dispatch failed',
            detail: String(error),
          });
        }
      }

      setStatusMessage(body);
    });

    const restoreErrorPromise = listen<{ message?: string }>('runtime-restore-error', (event) => {
      const message = event.payload.message ?? 'Runtime restore failed';
      appendLog({
        level: 'error',
        source: 'backend',
        category: 'restore',
        message,
      });
      setStatusMessage(message);
    });

    const backendLogPromise = listen<{
      level?: LogLevel;
      source?: LogSource;
      category?: string;
      message?: string;
      detail?: string;
    }>('app-log', (event) => {
      appendLog({
        level: event.payload.level ?? 'info',
        source: event.payload.source ?? 'backend',
        category: event.payload.category ?? 'runtime',
        message: event.payload.message ?? 'Backend event',
        detail: event.payload.detail,
      });
    });

    return () => {
      void warningPromise.then((unlisten) => unlisten());
      void restoreErrorPromise.then((unlisten) => unlisten());
      void backendLogPromise.then((unlisten) => unlisten());
    };
  }, [appendLog]);

  const enqueueServerSync = <T,>(task: () => Promise<T>) => {
    mutationQueueRef.current = mutationQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        setIsMutating(true);
        try {
          return await task();
        } finally {
          setIsMutating(false);
        }
      })
      .then(() => undefined);

    return mutationQueueRef.current;
  };

  const patchConfig = async (patch: unknown) => {
    const optimistic = mergeJson(configRef.current, patch);
    appendLog({
      level: 'debug',
      source: 'frontend',
      category: 'config',
      message: 'Queued config patch',
    });
    configRef.current = optimistic;
    startTransition(() => setConfig(optimistic));

    await enqueueServerSync(async () => {
      const next = await invoke<AppConfig>('update_app_config', { patch });
      appendLog({
        level: 'info',
        source: 'backend',
        category: 'config',
        message: 'Config patch applied',
      });
      configRef.current = next;
      startTransition(() => setConfig(next));
    }).catch((error) => {
      appendLog({
        level: 'error',
        source: 'backend',
        category: 'config',
        message: 'Config patch failed',
        detail: String(error),
      });
      setStatusMessage(String(error));
    });
  };

  const resolvedTheme = useMemo(() => resolvedThemeFromConfig(config), [config]);
  const customThemes = config.appearance.customThemes ?? [];
  const activeTask = config.runtime.activeTask ?? null;
  const lang = config.preferences.lang ?? 'zh';
  const backgroundImageUrl = toAbsoluteImageUrl(config.appearance.background.imagePath ?? '');

  const actions = useMemo<AppStoreValue>(() => ({
    ready: bootStatus === 'ready',
    bootStatus,
    currentPage,
    setCurrentPage,
    config,
    lang,
    presetThemes,
    customThemes,
    resolvedTheme,
    activeTask,
    remainingSeconds,
    statusMessage,
    isMutating,
    logs,
    clearLogs: () => setLogs([]),
    setStatusMessage,
    patchConfig,
    setLanguage: async (nextLang) => {
      await patchConfig({ preferences: { ...configRef.current.preferences, lang: nextLang } });
    },
    setTimerDraft: async (draft) => {
      await patchConfig({ timerDraft: { ...configRef.current.timerDraft, ...draft } });
    },
    startTimer: async () => {
      try {
        const task = await invoke<ActiveTask>('start_timer', {
          request: {
            mode: configRef.current.timerDraft.mode,
            countdown: configRef.current.timerDraft.mode === 'countdown' ? configRef.current.timerDraft.countdown : null,
            scheduleTime: configRef.current.timerDraft.mode === 'schedule' ? configRef.current.timerDraft.scheduleTime : null,
            preventSleep: configRef.current.preferences.preventSleep,
            ringtonePath: configRef.current.preferences.ringtonePath,
          },
        });
        appendLog({
          level: 'info',
          source: 'backend',
          category: 'timer',
          message: `Timer started in ${task.mode} mode`,
        });
        const next = mergeJson(configRef.current, { runtime: { activeTask: task } });
        configRef.current = next;
        startTransition(() => setConfig(next));
      } catch (error) {
        appendLog({
          level: 'error',
          source: 'backend',
          category: 'timer',
          message: 'Failed to start timer',
          detail: String(error),
        });
        setStatusMessage(String(error));
      }
    },
    cancelTimer: async () => {
      try {
        await invoke<OperationResult>('cancel_timer');
        appendLog({
          level: 'info',
          source: 'backend',
          category: 'timer',
          message: 'Timer cancelled',
        });
        const next = mergeJson(configRef.current, { runtime: { activeTask: null } });
        configRef.current = next;
        startTransition(() => setConfig(next));
      } catch (error) {
        appendLog({
          level: 'error',
          source: 'backend',
          category: 'timer',
          message: 'Failed to cancel timer',
          detail: String(error),
        });
        setStatusMessage(String(error));
      }
    },
    chooseRingtone: async () => {
      const path = await invoke<string | null>('pick_media_file', { kind: 'audio' });
      if (path) {
        appendLog({
          level: 'info',
          source: 'frontend',
          category: 'media',
          message: 'Selected ringtone file',
        });
        await patchConfig({ preferences: { ...configRef.current.preferences, ringtonePath: path } });
      }
    },
    previewRingtone: async () => {
      try {
        await invoke('preview_ringtone');
        appendLog({
          level: 'info',
          source: 'backend',
          category: 'audio',
          message: 'Ringtone preview started',
        });
      } catch (error) {
        appendLog({
          level: 'error',
          source: 'backend',
          category: 'audio',
          message: 'Ringtone preview failed',
          detail: String(error),
        });
      }
    },
    stopRingtone: async () => {
      await invoke('stop_ringtone');
      appendLog({
        level: 'debug',
        source: 'backend',
        category: 'audio',
        message: 'Ringtone stopped',
      });
    },
    setAutoStart: async (enabled) => {
      try {
        const next = await invoke<AppConfig>('set_auto_start_preference', { enabled });
        appendLog({
          level: 'info',
          source: 'backend',
          category: 'system',
          message: `Auto-start ${enabled ? 'enabled' : 'disabled'}`,
        });
        configRef.current = next;
        startTransition(() => setConfig(next));
      } catch (error) {
        appendLog({
          level: 'error',
          source: 'backend',
          category: 'system',
          message: 'Failed to change auto-start',
          detail: String(error),
        });
        setStatusMessage(String(error));
      }
    },
    selectTheme: async (themeId) => {
      const theme = customThemes.find((item) => item.id === themeId)
        ?? presetThemes.find((item) => item.id === themeId);
      if (!theme) return;
      appendLog({
        level: 'info',
        source: 'frontend',
        category: 'appearance',
        message: `Selected theme ${theme.name}`,
      });
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          selectedThemeId: themeId,
          draftTheme: theme,
        },
      });
    },
    updateDraftTheme: async (theme) => {
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          draftTheme: theme,
        },
      });
    },
    saveCurrentTheme: async () => {
      if (!resolvedTheme) return;
      const name = window.prompt(t('appearance.themeName', lang), resolvedTheme.name) ?? '';
      if (!name.trim()) return;
      const description = window.prompt(t('appearance.themeDescription', lang), resolvedTheme.description) ?? '';
      const themeId = customThemes.find((item) => item.id === resolvedTheme.id)?.id ?? `custom-${Date.now()}`;
      const nextTheme = normalizeTheme({
        ...resolvedTheme,
        id: themeId,
        name: name.trim(),
        description: description.trim(),
        category: 'custom',
      });
      const nextCustomThemes = [
        ...customThemes.filter((item) => item.id !== themeId),
        nextTheme,
      ];
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          selectedThemeId: themeId,
          draftTheme: nextTheme,
          customThemes: nextCustomThemes,
        },
      });
      appendLog({
        level: 'info',
        source: 'frontend',
        category: 'appearance',
        message: `Saved custom theme ${nextTheme.name}`,
      });
      setStatusMessage(t('feedback.saved', lang));
    },
    renameCustomTheme: async (themeId) => {
      const theme = customThemes.find((item) => item.id === themeId);
      if (!theme) return;
      const name = window.prompt(t('appearance.themeName', lang), theme.name) ?? theme.name;
      const description = window.prompt(t('appearance.themeDescription', lang), theme.description) ?? theme.description;
      const nextTheme = { ...theme, name, description };
      const nextCustomThemes = customThemes.map((item) => item.id === themeId ? nextTheme : item);
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          customThemes: nextCustomThemes,
          draftTheme: configRef.current.appearance.selectedThemeId === themeId ? nextTheme : configRef.current.appearance.draftTheme,
        },
      });
      appendLog({
        level: 'info',
        source: 'frontend',
        category: 'appearance',
        message: `Renamed theme to ${name}`,
      });
    },
    deleteCustomTheme: async (themeId) => {
      const nextCustomThemes = customThemes.filter((theme) => theme.id !== themeId);
      const fallbackTheme = presetThemes[0];
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          customThemes: nextCustomThemes,
          selectedThemeId: configRef.current.appearance.selectedThemeId === themeId ? fallbackTheme.id : configRef.current.appearance.selectedThemeId,
          draftTheme: configRef.current.appearance.selectedThemeId === themeId ? fallbackTheme : configRef.current.appearance.draftTheme,
        },
      });
      appendLog({
        level: 'warn',
        source: 'frontend',
        category: 'appearance',
        message: `Deleted theme ${themeId}`,
      });
      setStatusMessage(t('feedback.deleted', lang));
    },
    importTheme: async () => {
      try {
        const imported = await invoke<unknown>('import_theme');
        const theme = themeFromJson(imported);
        if (!theme) {
          setStatusMessage(t('feedback.invalidTheme', lang));
          return;
        }
        const nextCustomThemes = [...customThemes.filter((item) => item.id !== theme.id), theme];
        await patchConfig({
          appearance: {
            ...configRef.current.appearance,
            customThemes: nextCustomThemes,
            selectedThemeId: theme.id,
            draftTheme: theme,
          },
        });
        appendLog({
          level: 'info',
          source: 'backend',
          category: 'appearance',
          message: `Imported theme ${theme.name}`,
        });
        setStatusMessage(t('feedback.imported', lang));
      } catch (error) {
        appendLog({
          level: 'error',
          source: 'backend',
          category: 'appearance',
          message: 'Theme import failed',
          detail: String(error),
        });
        setStatusMessage(String(error));
      }
    },
    exportCurrentTheme: async () => {
      if (!resolvedTheme) return;
      await invoke<OperationResult>('export_theme', {
        themeJson: resolvedTheme,
        suggestedName: resolvedTheme.name,
      });
      appendLog({
        level: 'info',
        source: 'backend',
        category: 'appearance',
        message: `Exported theme ${resolvedTheme.name}`,
      });
      setStatusMessage(t('feedback.exported', lang));
    },
    setBackgroundOpacity: async (opacity) => {
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          background: { ...configRef.current.appearance.background, opacity },
        },
      });
    },
    chooseBackgroundImage: async () => {
      const path = await invoke<string | null>('pick_media_file', { kind: 'image' });
      if (!path) return;
      appendLog({
        level: 'info',
        source: 'frontend',
        category: 'appearance',
        message: 'Selected background image',
      });
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          background: { ...configRef.current.appearance.background, imagePath: path },
        },
      });
    },
    clearBackgroundImage: async () => {
      await patchConfig({
        appearance: {
          ...configRef.current.appearance,
          background: { ...configRef.current.appearance.background, imagePath: '' },
        },
      });
      appendLog({
        level: 'debug',
        source: 'frontend',
        category: 'appearance',
        message: 'Cleared background image',
      });
    },
    backgroundImageUrl,
  }), [
    activeTask,
    backgroundImageUrl,
    bootStatus,
    config,
    currentPage,
    customThemes,
    isMutating,
    lang,
    logs,
    patchConfig,
    remainingSeconds,
    resolvedTheme,
    statusMessage,
  ]);

  return <AppStoreContext.Provider value={actions}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const value = useContext(AppStoreContext);
  if (!value) {
    throw new Error('AppStoreProvider is missing');
  }
  return value;
}

export function availableLanguages() {
  return languages;
}

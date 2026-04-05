import { t } from '../i18n';
import { useAppStore } from '../store/AppStore';

function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export default function TimerPage() {
  const {
    config,
    lang,
    activeTask,
    remainingSeconds,
    setTimerDraft,
    startTimer,
    cancelTimer,
    chooseRingtone,
    previewRingtone,
    patchConfig,
  } = useAppStore();

  if (!config) return null;

  const { timerDraft, preferences } = config;
  const displayTime = activeTask
    ? formatSeconds(remainingSeconds ?? 0)
    : timerDraft.mode === 'countdown'
      ? formatSeconds(
          timerDraft.countdown.hours * 3600
          + timerDraft.countdown.minutes * 60
          + timerDraft.countdown.seconds,
        )
      : timerDraft.scheduleTime;

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('app.title', lang)}</h1>
      </header>

      <div className="page-content">
        <div className="card hero-card">
          <div className="timer-display">{displayTime}</div>
          <div className="mode-tabs">
            <button
              className={`mode-tab ${timerDraft.mode === 'countdown' ? 'active' : ''}`}
              onClick={() => void setTimerDraft({ mode: 'countdown' })}
            >
              {t('timer.countdown', lang)}
            </button>
            <button
              className={`mode-tab ${timerDraft.mode === 'schedule' ? 'active' : ''}`}
              onClick={() => void setTimerDraft({ mode: 'schedule' })}
            >
              {t('timer.schedule', lang)}
            </button>
          </div>

          {timerDraft.mode === 'countdown' ? (
            <div className="timer-inputs">
              {(['hours', 'minutes', 'seconds'] as const).map((key) => (
                <div key={key} className="timer-input-group">
                  <input
                    type="number"
                    className="timer-input"
                    value={timerDraft.countdown[key]}
                    min={0}
                    max={key === 'hours' ? 99 : 59}
                    disabled={!!activeTask}
                    onChange={(event) => {
                      const numeric = Math.max(0, Number(event.target.value || 0));
                      void setTimerDraft({
                        countdown: {
                          ...timerDraft.countdown,
                          [key]: key === 'hours' ? numeric : Math.min(59, numeric),
                        },
                      });
                    }}
                  />
                  <span className="timer-input-label">{t(`timer.${key}` as never, lang)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="timer-inputs">
              <input
                type="time"
                className="timer-input schedule-input"
                value={timerDraft.scheduleTime}
                disabled={!!activeTask}
                onChange={(event) => void setTimerDraft({ scheduleTime: event.target.value })}
              />
            </div>
          )}

          <div className="cta-row">
            {!activeTask ? (
              <button className="btn btn-primary" onClick={() => void startTimer()}>
                {timerDraft.mode === 'countdown' ? t('timer.start', lang) : t('timer.setSchedule', lang)}
              </button>
            ) : (
              <button className="btn btn-danger" onClick={() => void cancelTimer()}>
                {t('timer.stop', lang)}
              </button>
            )}
          </div>

          <div className="status-bar">
            <div className="status-item">
              <span className="status-label">{t('timer.status', lang)}</span>
              <span className="status-value">
                {activeTask ? t('timer.running', lang) : t('timer.idle', lang)}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('timer.mode', lang)}</span>
              <span className="status-value">
                {timerDraft.mode === 'countdown' ? t('timer.countdown', lang) : t('timer.schedule', lang)}
              </span>
            </div>
            {activeTask && (
              <div className="status-item">
                <span className="status-label">{t('timer.target', lang)}</span>
                <span className="status-value">{new Date(activeTask.targetAtIso).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="field-row">
            <label className="field-label">{t('timer.ringtone', lang)}</label>
            <div className="inline-actions">
              <button className="btn btn-secondary" onClick={() => void chooseRingtone()}>
                {t('timer.selectFile', lang)}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => void previewRingtone()}
                disabled={!preferences.ringtonePath}
              >
                {t('timer.previewRingtone', lang)}
              </button>
            </div>
          </div>
          <div className="subtle-text">
            {preferences.ringtonePath || t('timer.noRingtone', lang)}
          </div>

          <div className="toggle-group">
            <button
              className={`toggle-item toggle-button ${preferences.preventSleep ? 'active' : ''}`}
              onClick={() => void patchConfig({ preferences: { ...preferences, preventSleep: !preferences.preventSleep } })}
            >
              <span className="toggle-label">{t('timer.preventSleep', lang)}</span>
              <span className="toggle-chip">{preferences.preventSleep ? t('settings.enabled', lang) : t('settings.disabled', lang)}</span>
            </button>
            <button
              className={`toggle-item toggle-button ${preferences.minToTray ? 'active' : ''}`}
              onClick={() => void patchConfig({ preferences: { ...preferences, minToTray: !preferences.minToTray } })}
            >
              <span className="toggle-label">{t('timer.minToTray', lang)}</span>
              <span className="toggle-chip">{preferences.minToTray ? t('settings.enabled', lang) : t('settings.disabled', lang)}</span>
            </button>
            <button
              className={`toggle-item toggle-button ${preferences.notificationEnabled ? 'active' : ''}`}
              onClick={() => void patchConfig({ preferences: { ...preferences, notificationEnabled: !preferences.notificationEnabled } })}
            >
              <span className="toggle-label">{t('timer.notifyBeforeShutdown', lang)}</span>
              <span className="toggle-chip">{preferences.notificationEnabled ? t('settings.enabled', lang) : t('settings.disabled', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

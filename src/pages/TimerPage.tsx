import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { t, type Lang } from '../i18n';

interface TimerPageProps {
  lang: Lang;
}

type TimerMode = 'countdown' | 'schedule';
type TimerStatus = 'idle' | 'running';

interface ShutdownResult {
  success: boolean;
  message: string;
}

export default function TimerPage({ lang }: TimerPageProps) {
  const [mode, setMode] = useState<TimerMode>('countdown');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [scheduleTime, setScheduleTime] = useState('12:00');
  const [remainingTime, setRemainingTime] = useState(0);
  const [preventSleep, setPreventSleep] = useState(true);
  const [minToTray, setMinToTray] = useState(true);

  useEffect(() => {
    let interval: number | undefined;

    if (status === 'running' && mode === 'countdown') {
      interval = window.setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStatus('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, mode]);

  const formatTime = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(async () => {
    try {
      if (mode === 'countdown') {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds <= 0) return;

        setRemainingTime(totalSeconds);
        setStatus('running');

        if (preventSleep) {
          await invoke('prevent_sleep');
        }
      } else {
        await invoke<ShutdownResult>('schedule_shutdown', {
          time: scheduleTime,
          cancelOnWake: true,
        });
        setStatus('running');
      }
    } catch (error) {
      console.error('Failed to start timer:', error);
      setStatus('idle');
    }
  }, [mode, hours, minutes, seconds, scheduleTime, preventSleep]);

  const handleStop = useCallback(async () => {
    try {
      await invoke<ShutdownResult>('cancel_shutdown');

      if (preventSleep) {
        await invoke('allow_sleep');
      }

      setStatus('idle');
      setRemainingTime(0);
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  }, [preventSleep]);

  const displayTime =
    mode === 'countdown'
      ? status === 'running'
        ? formatTime(remainingTime)
        : formatTime(hours * 3600 + minutes * 60 + seconds)
      : scheduleTime;

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('app.title', lang)}</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <div className="timer-display">{displayTime}</div>

          <div className="mode-tabs">
            <button
              className={`mode-tab ${mode === 'countdown' ? 'active' : ''}`}
              onClick={() => setMode('countdown')}
            >
              {t('timer.countdown', lang)}
            </button>
            <button
              className={`mode-tab ${mode === 'schedule' ? 'active' : ''}`}
              onClick={() => setMode('schedule')}
            >
              {t('timer.schedule', lang)}
            </button>
          </div>

          {mode === 'countdown' ? (
            <div className="timer-inputs">
              <div className="timer-input-group">
                <input
                  type="number"
                  className="timer-input"
                  value={hours.toString().padStart(2, '0')}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max="99"
                  disabled={status === 'running'}
                />
                <span className="timer-input-label">{t('timer.hours', lang)}</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-input-group">
                <input
                  type="number"
                  className="timer-input"
                  value={minutes.toString().padStart(2, '0')}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="59"
                  disabled={status === 'running'}
                />
                <span className="timer-input-label">{t('timer.minutes', lang)}</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-input-group">
                <input
                  type="number"
                  className="timer-input"
                  value={seconds.toString().padStart(2, '0')}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="59"
                  disabled={status === 'running'}
                />
                <span className="timer-input-label">{t('timer.seconds', lang)}</span>
              </div>
            </div>
          ) : (
            <div className="timer-inputs">
              <input
                type="time"
                className="timer-input"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                disabled={status === 'running'}
                style={{ width: '160px', height: '60px', fontSize: '1.5rem' }}
              />
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            {status === 'idle' ? (
              <button className="btn btn-primary" onClick={handleStart}>
                {mode === 'countdown' ? t('timer.start', lang) : t('timer.setSchedule', lang)}
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleStop}>
                {t('timer.stop', lang)}
              </button>
            )}
          </div>

          <div className="status-bar">
            <div className="status-item">
              <span className="status-label">{t('timer.status', lang)}</span>
              <span className="status-value">
                {status === 'idle' ? t('timer.idle', lang) : t('timer.running', lang)}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">{t('timer.mode', lang)}</span>
              <span className="status-value">
                {mode === 'countdown' ? t('timer.countdown', lang) : t('timer.schedule', lang)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="toggle-group">
            <div className="toggle-item">
              <span className="toggle-label">{t('timer.preventSleep', lang)}</span>
              <div
                className={`toggle ${preventSleep ? 'active' : ''}`}
                onClick={() => setPreventSleep(!preventSleep)}
              />
            </div>
            <div className="toggle-item">
              <span className="toggle-label">{t('timer.minToTray', lang)}</span>
              <div
                className={`toggle ${minToTray ? 'active' : ''}`}
                onClick={() => setMinToTray(!minToTray)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
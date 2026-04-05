import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { t, languages, type Lang } from '../i18n';

interface SettingsPageProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export default function SettingsPage({ lang, onLangChange }: SettingsPageProps) {
  const [autoStart, setAutoStart] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAutoStart = async () => {
      try {
        const enabled = await invoke<boolean>('is_auto_start_enabled');
        setAutoStart(enabled);
      } catch (error) {
        console.error('Failed to check auto start status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAutoStart();
  }, []);

  const handleAutoStartToggle = async () => {
    try {
      if (autoStart) {
        await invoke('disable_auto_start');
        setAutoStart(false);
      } else {
        await invoke('enable_auto_start');
        setAutoStart(true);
      }
    } catch (error) {
      console.error('Failed to toggle auto start:', error);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('nav.settings', lang)}</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-primary)' }}>
            {t('settings.language', lang)}
          </h2>
          <div className="language-selector">
            {languages.map((language) => (
              <button
                key={language.code}
                className={`lang-btn ${lang === language.code ? 'active' : ''}`}
                onClick={() => onLangChange(language.code)}
              >
                {language.nativeName}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text-primary)' }}>
            {t('settings.autoStart', lang)}
          </h2>
          <div className="toggle-group">
            <div className="toggle-item">
              <span className="toggle-label">
                {t('settings.autoStart', lang)}
              </span>
              <div
                className={`toggle ${autoStart ? 'active' : ''}`}
                onClick={loading ? undefined : handleAutoStartToggle}
                style={{ opacity: loading ? 0.5 : 1 }}
              />
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginTop: '12px' }}>
            {autoStart ? t('settings.enabled', lang) : t('settings.disabled', lang)}
          </p>
        </div>
      </div>
    </>
  );
}
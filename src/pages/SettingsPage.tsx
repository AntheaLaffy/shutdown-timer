import { useState, useEffect } from 'react';
import { t, languages, type Lang } from '../i18n';
import { loadAutoStartStatus, setAutoStart } from '../settings';

interface SettingsPageProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export default function SettingsPage({ lang, onLangChange }: SettingsPageProps) {
  const [autoStart, setAutoStartState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAutoStart = async () => {
      const status = await loadAutoStartStatus();
      if (!cancelled) {
        setAutoStartState(status);
        setLoading(false);
      }
    };

    checkAutoStart();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAutoStartToggle = async () => {
    if (toggling || loading) return;

    setToggling(true);
    const newValue = !autoStart;
    setAutoStartState(newValue); // Optimistic update

    const success = await setAutoStart(newValue);

    if (!success) {
      // Revert on failure
      setAutoStartState(!newValue);
    }
    setToggling(false);
  };

  const isDisabled = loading || toggling;

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
                className={`toggle ${autoStart ? 'active' : ''} ${toggling ? 'toggling' : ''}`}
                onClick={isDisabled ? undefined : handleAutoStartToggle}
                style={{ opacity: isDisabled ? 0.5 : 1 }}
              >
                {toggling && <span className="toggle-spinner" />}
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginTop: '12px' }}>
            {loading
              ? '...'
              : autoStart
                ? t('settings.enabled', lang)
                : t('settings.disabled', lang)}
          </p>
        </div>
      </div>
    </>
  );
}

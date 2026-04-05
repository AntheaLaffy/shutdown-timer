import { availableLanguages, useAppStore } from '../store/AppStore';
import { t } from '../i18n';

export default function SettingsPage() {
  const { config, lang, setLanguage, setAutoStart, patchConfig } = useAppStore();
  if (!config) return null;

  const { preferences } = config;

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('nav.settings', lang)}</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <h2 className="section-title">{t('settings.language', lang)}</h2>
          <div className="language-selector">
            {availableLanguages().map((language) => (
              <button
                key={language.code}
                className={`lang-btn ${lang === language.code ? 'active' : ''}`}
                onClick={() => void setLanguage(language.code)}
              >
                {language.nativeName}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">{t('settings.autoStart', lang)}</h2>
          <div className="toggle-group">
            <button
              className={`toggle-item toggle-button ${preferences.autoStart ? 'active' : ''}`}
              onClick={() => void setAutoStart(!preferences.autoStart)}
            >
              <span className="toggle-label">{t('settings.autoStart', lang)}</span>
              <span className="toggle-chip">{preferences.autoStart ? t('settings.enabled', lang) : t('settings.disabled', lang)}</span>
            </button>
            <button
              className={`toggle-item toggle-button ${preferences.notificationEnabled ? 'active' : ''}`}
              onClick={() => void patchConfig({ preferences: { ...preferences, notificationEnabled: !preferences.notificationEnabled } })}
            >
              <span className="toggle-label">{t('settings.notifications', lang)}</span>
              <span className="toggle-chip">{preferences.notificationEnabled ? t('settings.enabled', lang) : t('settings.disabled', lang)}</span>
            </button>
          </div>
          <p className="subtle-text">{t('settings.statusText', lang)}</p>
        </div>
      </div>
    </>
  );
}

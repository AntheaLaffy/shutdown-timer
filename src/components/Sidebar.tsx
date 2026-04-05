import { t } from '../i18n';
import { useAppStore } from '../store/AppStore';

export default function Sidebar() {
  const {
    currentPage,
    setCurrentPage,
    resolvedTheme,
    customThemes,
    presetThemes,
    lang,
    selectTheme,
  } = useAppStore();

  const themes = [...presetThemes, ...customThemes];

  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="brand-kicker">desktop utility</div>
        <div className="brand-title">{t('app.title', lang)}</div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${currentPage === 'timer' ? 'active' : ''}`}
          onClick={() => setCurrentPage('timer')}
        >
          <span>⏱</span>
          <span>{t('nav.timer', lang)}</span>
        </button>
        <button
          className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentPage('settings')}
        >
          <span>⚙</span>
          <span>{t('nav.settings', lang)}</span>
        </button>
        <button
          className={`sidebar-item ${currentPage === 'appearance' ? 'active' : ''}`}
          onClick={() => setCurrentPage('appearance')}
        >
          <span>🎨</span>
          <span>{t('nav.appearance', lang)}</span>
        </button>
        <button
          className={`sidebar-item ${currentPage === 'logs' ? 'active' : ''}`}
          onClick={() => setCurrentPage('logs')}
        >
          <span>🧾</span>
          <span>{t('nav.logs', lang)}</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-label">{resolvedTheme?.name ?? 'Theme'}</div>
        <select
          className="theme-select"
          value={resolvedTheme?.id ?? ''}
          onChange={(event) => void selectTheme(event.target.value)}
        >
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}

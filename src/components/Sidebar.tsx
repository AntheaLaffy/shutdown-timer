import { t, type Lang } from '../i18n';
import { PresetTheme } from '../types/theme';

type Page = 'timer' | 'settings' | 'appearance';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  themes: PresetTheme[];
  currentTheme: PresetTheme | null;
  onThemeChange: (theme: PresetTheme) => void;
  lang: Lang;
}

export default function Sidebar({
  currentPage,
  onPageChange,
  themes,
  currentTheme,
  onThemeChange,
  lang,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button
          className={`sidebar-item ${currentPage === 'timer' ? 'active' : ''}`}
          onClick={() => onPageChange('timer')}
        >
          <span>⏱</span>
          <span>{t('nav.timer', lang)}</span>
        </button>
        <button
          className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={() => onPageChange('settings')}
        >
          <span>⚙</span>
          <span>{t('nav.settings', lang)}</span>
        </button>
        <button
          className={`sidebar-item ${currentPage === 'appearance' ? 'active' : ''}`}
          onClick={() => onPageChange('appearance')}
        >
          <span>🎨</span>
          <span>{t('nav.appearance', lang)}</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
          {currentTheme?.name || 'Theme'}
        </div>
        <select
          value={currentTheme?.id || ''}
          onChange={(e) => {
            const theme = themes.find((t) => t.id === e.target.value);
            if (theme) onThemeChange(theme);
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '0.85rem',
            backgroundColor: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius, 8px)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
          }}
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
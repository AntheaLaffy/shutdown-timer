import { useState } from 'react';
import { presetThemes } from '../data/preset-themes';
import { PresetTheme } from '../types/theme';
import { t, type Lang } from '../i18n';

interface AppearancePageProps {
  lang: Lang;
  currentTheme: PresetTheme | null;
  onThemeChange: (theme: PresetTheme) => void;
}

type TabType = 'themes' | 'colors' | 'fonts' | 'layout' | 'background';

export default function AppearancePage({ lang, currentTheme, onThemeChange }: AppearancePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('themes');

  const tabs: { id: TabType; labelKey: string }[] = [
    { id: 'themes', labelKey: 'appearance.themes' },
    { id: 'colors', labelKey: 'appearance.colors' },
    { id: 'fonts', labelKey: 'appearance.fonts' },
    { id: 'layout', labelKey: 'appearance.layout' },
    { id: 'background', labelKey: 'appearance.background' },
  ];

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'light':
        return '#f0f7f4';
      case 'dark':
        return '#1a1a2e';
      case 'colorful':
        return '#0077b6';
      case 'nature':
        return '#4a7c4a';
      case 'professional':
        return '#8b4080';
      case 'minimal':
        return '#808080';
      case 'retro':
        return '#ff00ff';
      default:
        return '#808080';
    }
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('nav.appearance', lang)}</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`mode-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ flex: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
              >
                {t(tab.labelKey as keyof typeof t, lang)}
              </button>
            ))}
          </div>

          {activeTab === 'themes' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                {t('appearance.themes', lang)}
              </h3>
              <div className="theme-grid">
                {presetThemes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-card ${currentTheme?.id === theme.id ? 'active' : ''}`}
                    onClick={() => onThemeChange(theme)}
                  >
                    <div className="theme-card-name">{theme.name}</div>
                    <div className="theme-card-desc">{theme.description}</div>
                    <div className="theme-card-preview">
                      <div
                        className="preview-color"
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="preview-color"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="preview-color"
                        style={{ backgroundColor: theme.colors.bgPrimary }}
                        title="Background"
                      />
                      <div
                        className="preview-color"
                        style={{ backgroundColor: theme.colors.textPrimary }}
                        title="Text"
                      />
                      <div
                        className="preview-color"
                        style={{
                          backgroundColor: getCategoryColor(theme.category),
                          width: 'auto',
                          padding: '0 6px',
                          fontSize: '0.65rem',
                          color: theme.category === 'light' || theme.category === 'minimal' ? '#000' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {theme.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                {t('appearance.colors', lang)}
              </h3>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
                Color customization coming soon. Currently using preset themes.
              </p>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                {t('appearance.fonts', lang)}
              </h3>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
                Font customization coming soon. Currently using theme-defined fonts.
              </p>
            </div>
          )}

          {activeTab === 'layout' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                {t('appearance.layout', lang)}
              </h3>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
                Layout customization coming soon.
              </p>
            </div>
          )}

          {activeTab === 'background' && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
                {t('appearance.background', lang)}
              </h3>
              <p style={{ color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>
                Background customization coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
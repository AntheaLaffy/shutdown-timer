import { useMemo, useState } from 'react';
import { curatedFonts } from '../data/fonts';
import { t } from '../i18n';
import { useAppStore } from '../store/AppStore';
import { normalizeTheme } from '../types/theme';

type TabType = 'themes' | 'colors' | 'fonts' | 'layout' | 'background';

const colorKeys = [
  'bgPrimary',
  'bgSecondary',
  'bgTertiary',
  'bgElevated',
  'border',
  'borderHover',
  'borderFocus',
  'primary',
  'primarySoft',
  'primaryDark',
  'accent',
  'accentSoft',
  'warning',
  'danger',
  'success',
  'textPrimary',
  'textSecondary',
  'textTertiary',
  'textInverse',
] as const;

export default function AppearancePage() {
  const {
    config,
    lang,
    presetThemes,
    customThemes,
    resolvedTheme,
    selectTheme,
    updateDraftTheme,
    saveCurrentTheme,
    renameCustomTheme,
    deleteCustomTheme,
    importTheme,
    exportCurrentTheme,
    setBackgroundOpacity,
    chooseBackgroundImage,
    clearBackgroundImage,
    backgroundImageUrl,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('themes');
  const [fontQuery, setFontQuery] = useState('');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'themes', label: t('appearance.themes', lang) },
    { id: 'colors', label: t('appearance.colors', lang) },
    { id: 'fonts', label: t('appearance.fonts', lang) },
    { id: 'layout', label: t('appearance.layout', lang) },
    { id: 'background', label: t('appearance.background', lang) },
  ];

  const theme = resolvedTheme;
  const filteredFonts = useMemo(
    () => curatedFonts.filter((font) => font.toLowerCase().includes(fontQuery.toLowerCase())),
    [fontQuery],
  );

  if (!config || !theme) return null;

  const fonts = theme.fonts ?? {
    display: 'Quicksand',
    heading: 'Nunito',
    body: 'Nunito',
    mono: 'JetBrains Mono',
  };
  const layout = theme.layout ?? {
    borderRadius: '12px',
    spacing: 'normal',
    shadowIntensity: 'normal',
  };

  const updateTheme = (patch: Partial<typeof theme>) => void updateDraftTheme(normalizeTheme({ ...theme, ...patch }));

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{t('nav.appearance', lang)}</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <div className="tab-strip">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`mode-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'themes' && (
            <div className="editor-grid">
              <div>
                <h3 className="section-title">{t('appearance.presetThemes', lang)}</h3>
                <div className="theme-grid">
                  {presetThemes.map((preset) => (
                    <button
                      key={preset.id}
                      className={`theme-card ${config.appearance.selectedThemeId === preset.id ? 'active' : ''}`}
                      onClick={() => void selectTheme(preset.id)}
                    >
                      <div className="theme-card-name">{preset.name}</div>
                      <div className="theme-card-desc">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="inline-actions spaced">
                  <h3 className="section-title">{t('appearance.customThemes', lang)}</h3>
                  <button className="btn btn-secondary" onClick={() => void importTheme()}>
                    {t('appearance.import', lang)}
                  </button>
                </div>
                <div className="theme-grid">
                  {customThemes.map((custom) => (
                    <div key={custom.id} className={`theme-card ${config.appearance.selectedThemeId === custom.id ? 'active' : ''}`}>
                      <button className="theme-card-select" onClick={() => void selectTheme(custom.id)}>
                        <div className="theme-card-name">{custom.name}</div>
                        <div className="theme-card-desc">{custom.description}</div>
                      </button>
                      <div className="card-actions">
                        <button className="link-btn" onClick={() => void renameCustomTheme(custom.id)}>
                          {t('appearance.rename', lang)}
                        </button>
                        <button className="link-btn danger" onClick={() => void deleteCustomTheme(custom.id)}>
                          {t('appearance.delete', lang)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="inline-actions spaced top-gap">
                  <button className="btn btn-primary" onClick={() => void saveCurrentTheme()}>
                    {t('appearance.save', lang)}
                  </button>
                  <button className="btn btn-secondary" onClick={() => void exportCurrentTheme()}>
                    {t('appearance.export', lang)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="field-grid">
              {colorKeys.map((key) => (
                <label key={key} className="field-block">
                  <span className="field-label">{key}</span>
                  <input
                    className="text-input"
                    value={theme.colors[key]}
                    onChange={(event) => updateTheme({ colors: { ...theme.colors, [key]: event.target.value } })}
                  />
                </label>
              ))}
            </div>
          )}

          {activeTab === 'fonts' && (
            <div className="editor-grid">
              <div>
                <label className="field-block">
                  <span className="field-label">{t('appearance.fontSearch', lang)}</span>
                  <input
                    className="text-input"
                    value={fontQuery}
                    onChange={(event) => setFontQuery(event.target.value)}
                  />
                </label>
                <div className="font-list">
                  {filteredFonts.map((font) => (
                    <button
                      key={font}
                      className="font-chip"
                      onClick={() => updateTheme({
                        fonts: {
                          ...fonts,
                          body: font,
                        },
                      })}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-grid">
                {(['display', 'heading', 'body', 'mono'] as const).map((slot) => (
                  <label key={slot} className="field-block">
                    <span className="field-label">{slot}</span>
                    <select
                      className="text-input"
                      value={theme.fonts?.[slot] ?? ''}
                      onChange={(event) => updateTheme({
                        fonts: {
                          ...fonts,
                          [slot]: event.target.value,
                        },
                      })}
                    >
                      {curatedFonts.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="field-grid">
              <label className="field-block">
                <span className="field-label">{t('appearance.borderRadius', lang)}</span>
                <input
                  className="text-input"
                  value={theme.layout?.borderRadius ?? '12px'}
                  onChange={(event) => updateTheme({
                    layout: { ...layout, borderRadius: event.target.value },
                  })}
                />
              </label>
              <label className="field-block">
                <span className="field-label">{t('appearance.spacing', lang)}</span>
                <select
                  className="text-input"
                  value={theme.layout?.spacing ?? 'normal'}
                  onChange={(event) => updateTheme({
                    layout: { ...layout, spacing: event.target.value },
                  })}
                >
                  <option value="compact">compact</option>
                  <option value="normal">normal</option>
                  <option value="relaxed">relaxed</option>
                  <option value="spacious">spacious</option>
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">{t('appearance.shadowIntensity', lang)}</span>
                <select
                  className="text-input"
                  value={theme.layout?.shadowIntensity ?? 'normal'}
                  onChange={(event) => updateTheme({
                    layout: { ...layout, shadowIntensity: event.target.value },
                  })}
                >
                  <option value="soft">soft</option>
                  <option value="normal">normal</option>
                  <option value="strong">strong</option>
                </select>
              </label>
            </div>
          )}

          {activeTab === 'background' && (
            <div className="editor-grid">
              <div className="background-preview" style={backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined}>
                {!backgroundImageUrl && <span>{t('appearance.previewTheme', lang)}</span>}
              </div>
              <div className="field-grid">
                <div className="inline-actions">
                  <button className="btn btn-secondary" onClick={() => void chooseBackgroundImage()}>
                    {t('appearance.pickImage', lang)}
                  </button>
                  <button className="btn btn-secondary" onClick={() => void clearBackgroundImage()}>
                    {t('appearance.clearImage', lang)}
                  </button>
                </div>
                <label className="field-block">
                  <span className="field-label">{t('appearance.opacity', lang)}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.appearance.background.opacity}
                    onChange={(event) => void setBackgroundOpacity(Number(event.target.value))}
                  />
                </label>
                <div className="subtle-text">{config.appearance.background.imagePath || 'No image selected'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

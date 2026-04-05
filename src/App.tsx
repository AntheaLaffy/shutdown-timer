import { useState, useEffect } from 'react';
import { getStoredLang, setStoredLang, type Lang } from './i18n';
import { applyTheme, getStoredThemeId, PresetTheme } from './types/theme';
import { presetThemes, getPresetThemeById } from './data/preset-themes';
import Sidebar from './components/Sidebar';
import TimerPage from './pages/TimerPage';
import SettingsPage from './pages/SettingsPage';
import AppearancePage from './pages/AppearancePage';

type Page = 'timer' | 'settings' | 'appearance';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('timer');
  const [lang, setLang] = useState<Lang>(getStoredLang());
  const [currentTheme, setCurrentTheme] = useState<PresetTheme | null>(null);

  useEffect(() => {
    const storedThemeId = getStoredThemeId();
    if (storedThemeId) {
      const theme = getPresetThemeById(storedThemeId);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme);
      }
    } else {
      const defaultTheme = presetThemes[0];
      setCurrentTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    setStoredLang(newLang);
  };

  const handleThemeChange = (theme: PresetTheme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'timer':
        return <TimerPage lang={lang} />;
      case 'settings':
        return <SettingsPage lang={lang} onLangChange={handleLangChange} />;
      case 'appearance':
        return (
          <AppearancePage
            lang={lang}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        );
      default:
        return <TimerPage lang={lang} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        themes={presetThemes}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        lang={lang}
      />
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
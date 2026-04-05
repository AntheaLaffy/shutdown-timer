import Sidebar from './components/Sidebar';
import TimerPage from './pages/TimerPage';
import SettingsPage from './pages/SettingsPage';
import AppearancePage from './pages/AppearancePage';
import LogsPage from './pages/LogsPage';
import { useAppStore } from './store/AppStore';
import { t } from './i18n';

function AppContent() {
  const { bootStatus, currentPage, lang, statusMessage, isMutating } = useAppStore();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {bootStatus !== 'ready' ? (
          <div className="loading-screen">
            {bootStatus === 'booting' ? t('app.loading', lang) : (statusMessage ?? t('feedback.failed', lang))}
          </div>
        ) : (
          <>
            {currentPage === 'timer' && <TimerPage />}
            {currentPage === 'settings' && <SettingsPage />}
            {currentPage === 'appearance' && <AppearancePage />}
            {currentPage === 'logs' && <LogsPage />}
          </>
        )}
        {isMutating && <div className="sync-indicator">syncing...</div>}
        {statusMessage && <div className="toast-banner">{statusMessage}</div>}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

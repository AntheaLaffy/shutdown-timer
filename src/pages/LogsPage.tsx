import { t } from '../i18n';
import { useAppStore } from '../store/AppStore';

export default function LogsPage() {
  const { lang, logs, clearLogs, setStatusMessage } = useAppStore();

  const copyLogs = async () => {
    const content = logs
      .map((log) => {
        const lines = [
          `[${new Date(log.timestamp).toLocaleString()}] ${log.level.toUpperCase()} ${log.source}/${log.category}`,
          log.message,
        ];

        if (log.count && log.count > 1) {
          lines.push(`${t('logs.count', lang)}: ${log.count}`);
        }

        if (log.detail) {
          lines.push(log.detail);
        }

        return lines.join('\n');
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(content);
      setStatusMessage(t('logs.copied', lang));
    } catch (error) {
      setStatusMessage(String(error));
    }
  };

  return (
    <>
      <header className="page-header">
        <div className="page-header-row">
          <h1 className="page-title">{t('logs.title', lang)}</h1>
          <div className="inline-actions">
            <button className="btn btn-secondary" onClick={() => void copyLogs()} disabled={logs.length === 0}>
              {t('logs.copy', lang)}
            </button>
            <button className="btn btn-secondary" onClick={clearLogs} disabled={logs.length === 0}>
              {t('logs.clear', lang)}
            </button>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          {logs.length === 0 ? (
            <div className="subtle-text">{t('logs.empty', lang)}</div>
          ) : (
            <div className="log-list">
              {logs.map((log) => (
                <article key={log.id} className={`log-entry log-${log.level}`}>
                  <div className="log-meta">
                    <span className="log-badge">{log.level}</span>
                    <span className="log-source">{log.source}</span>
                    <span className="log-category">{log.category}</span>
                    <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                    {log.count && log.count > 1 && (
                      <span className="log-count">
                        {t('logs.count', lang)}: {log.count}
                      </span>
                    )}
                  </div>
                  <div className="log-message">{log.message}</div>
                  {log.detail && <pre className="log-detail">{log.detail}</pre>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

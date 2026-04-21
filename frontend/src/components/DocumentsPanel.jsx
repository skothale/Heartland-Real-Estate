import { useCallback, useEffect, useState } from 'react';
import { FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { apiUrl } from '../config/api.js';

function formatBytes(n) {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function DocumentsPanel({ refreshKey = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        apiUrl('/api/documents?limit=100&skip=0')
      );
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error('Invalid response');
      }
      if (!res.ok) {
        throw new Error(json.message || res.statusText);
      }
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed to load documents');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="documents-panel">
      <div className="documents-panel__header">
        <div>
          <h1 className="documents-panel__title">Documents</h1>
          <p className="documents-panel__subtitle">
            PDFs uploaded through Heartland ({data?.total ?? '—'} total)
          </p>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={load}
          disabled={loading}
          aria-label="Refresh list"
        >
          <RefreshCw
            size={18}
            strokeWidth={2}
            className={loading ? 'spin' : undefined}
          />
        </button>
      </div>

      {error && (
        <div className="documents-error" role="alert">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading && !data && (
        <p className="documents-loading">Loading documents…</p>
      )}

      {!loading && data?.items?.length === 0 && (
        <div className="placeholder-panel">
          <h2>No documents yet</h2>
          <p>Use <strong>Upload Document</strong> to add your first PDF.</p>
        </div>
      )}

      {data?.items?.length > 0 && (
        <ul className="documents-list">
          {data.items.map((doc) => (
            <li key={doc._id} className="documents-list__item">
              <div className="documents-list__icon">
                <FileText size={20} strokeWidth={1.75} />
              </div>
              <div className="documents-list__body">
                <p className="documents-list__name">{doc.title}</p>
                <p className="documents-list__meta">
                  {doc.fileName} · {formatBytes(doc.fileSize)} · {doc.status}
                </p>
                <p className="documents-list__date">{formatDate(doc.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

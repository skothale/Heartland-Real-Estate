import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText,
  RefreshCw,
  AlertCircle,
  Search,
  Users,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { apiUrl } from '../config/api.js';
import { authHeaders } from '../auth/token.js';
import { useAuth } from '../auth/AuthContext.jsx';

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

function statusIndex(status) {
  const s = String(status || 'draft').toLowerCase();
  if (s === 'failed') return -1;
  if (s === 'draft') return 0;
  if (s === 'processing') return 1;
  if (s === 'completed') return 2;
  return 0;
}

function pipelinePct(status) {
  const s = String(status || 'draft').toLowerCase();
  if (s === 'failed') return 100;
  return Math.round((statusIndex(status) / 2) * 100);
}

export default function DocumentsPanel({ refreshKey = 0 }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [agentsError, setAgentsError] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadAgents = useCallback(async () => {
    if (!isAdmin) {
      setAgents([]);
      setAgentsError('');
      return;
    }
    setAgentsError('');
    try {
      const res = await fetch(apiUrl('/api/agents'), {
        headers: {
          Accept: 'application/json',
          ...authHeaders(),
        },
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error('Invalid response');
      }
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please sign in again.');
      }
      if (!res.ok) {
        throw new Error(json.message || res.statusText);
      }
      setAgents(json.items || []);
    } catch (e) {
      setAgents([]);
      setAgentsError(e.message || 'Failed to load agents');
    }
  }, [isAdmin, logout]);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100', skip: '0' });
      if (isAdmin && selectedAgentId) {
        params.set('agentId', selectedAgentId);
      }

      const res = await fetch(apiUrl(`/api/documents?${params}`), {
        headers: {
          Accept: 'application/json',
          ...authHeaders(),
        },
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error('Invalid response');
      }
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please sign in again.');
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
  }, [isAdmin, selectedAgentId, logout]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents, refreshKey]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments, refreshKey]);

  const selectedAgentLabel = useMemo(() => {
    if (!selectedAgentId) return null;
    const a = agents.find((x) => x.id === selectedAgentId);
    return a?.name?.trim() || a?.email || 'Agent';
  }, [agents, selectedAgentId]);

  const filteredItems = useMemo(() => {
    const items = data?.items || [];
    const q = String(query || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((doc) => {
      const hay = `${doc.title || ''} ${doc.fileName || ''} ${doc.status || ''}`
        .toLowerCase()
        .trim();
      return hay.includes(q);
    });
  }, [data?.items, query]);

  const statusCounts = useMemo(() => {
    const items = data?.items || [];
    let draft = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;
    for (const d of items) {
      const s = String(d.status || 'draft').toLowerCase();
      if (s === 'failed') failed += 1;
      else if (s === 'completed') completed += 1;
      else if (s === 'processing') processing += 1;
      else draft += 1;
    }
    return {
      total: data?.total ?? items.length,
      draft,
      processing,
      completed,
      failed,
    };
  }, [data]);

  const refreshAll = () => {
    loadAgents();
    loadDocuments();
  };

  const openPdf = useCallback(
    async (id) => {
      setError('');
      try {
        const res = await fetch(apiUrl(`/api/documents/${id}/file`), {
          headers: {
            ...authHeaders(),
          },
        });
        if (res.status === 401) {
          logout();
          throw new Error('Session expired. Please sign in again.');
        }
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || res.statusText || 'Failed to load PDF');
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (e) {
        setError(e.message || 'Could not open PDF');
      }
    },
    [logout]
  );

  const deleteDoc = useCallback(
    async (doc) => {
      if (!doc?._id) return;
      const ok = window.confirm(
        `Delete this document?\n\n${doc.title || 'Untitled'}\n${doc.fileName || ''}\n\nThis cannot be undone.`
      );
      if (!ok) return;

      setDeletingId(doc._id);
      setError('');
      try {
        const res = await fetch(apiUrl(`/api/documents/${doc._id}`), {
          method: 'DELETE',
          headers: {
            ...authHeaders(),
          },
        });
        if (res.status === 401) {
          logout();
          throw new Error('Session expired. Please sign in again.');
        }
        if (!res.ok && res.status !== 204) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || res.statusText || 'Failed to delete document');
        }
        await loadDocuments();
      } catch (e) {
        setError(e.message || 'Could not delete document');
      } finally {
        setDeletingId(null);
      }
    },
    [loadDocuments, logout]
  );

  const scopeLabel = isAdmin
    ? selectedAgentId
      ? `Agent · ${selectedAgentLabel}`
      : 'All team'
    : 'Your workspace';

  return (
    <div className="documents-panel documents-panel--homeview">
      <div className="docs-home">
        <header className="docs-home__hero">
          <div className="docs-home__hero-main">
            <div className="docs-home__mark" aria-hidden>
              <FileText size={22} strokeWidth={1.85} />
            </div>
            <div>
              <p className="docs-home__eyebrow">{scopeLabel}</p>
              <h1 className="docs-home__title">Documents</h1>
              <p className="docs-home__lead">
                {isAdmin
                  ? selectedAgentId
                    ? `Showing PDFs uploaded by this agent. ${data ? `${data.total} on file.` : ''}`
                    : `Showing every team member’s PDFs in one place. ${data ? `${data.total} on file.` : ''}`
                  : `Your uploaded PDFs and where each file stands in the pipeline. ${data ? `${data.total} on file.` : ''}`}
              </p>
              {statusCounts.failed > 0 && (
                <p className="docs-home__warn">
                  {statusCounts.failed} document{statusCounts.failed === 1 ? '' : 's'} need
                  attention (failed).
                </p>
              )}
            </div>
          </div>

          <div className="docs-home__toolbar">
            <div className="docs-home__search" role="search">
              <Search size={18} strokeWidth={2} aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, filename, or status…"
                aria-label="Search documents"
              />
            </div>
            <button
              type="button"
              className="docs-home__refresh"
              onClick={refreshAll}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw
                size={18}
                strokeWidth={2}
                className={loading ? 'spin' : undefined}
              />
            </button>
          </div>
        </header>

        <section className="rt-home__stats docs-home__stats" aria-label="Document summary">
          <div className="rt-stat">
            <p className="rt-stat__label">Total PDFs</p>
            <p className="rt-stat__value">{statusCounts.total}</p>
          </div>
          <div className="rt-stat">
            <p className="rt-stat__label">Draft</p>
            <p className="rt-stat__value">{statusCounts.draft}</p>
          </div>
          <div className="rt-stat">
            <p className="rt-stat__label">Processing</p>
            <p className="rt-stat__value">{statusCounts.processing}</p>
          </div>
          <div className="rt-stat">
            <p className="rt-stat__label">Completed</p>
            <p className="rt-stat__value">{statusCounts.completed}</p>
          </div>
        </section>

        <div className={`docs-home__layout${isAdmin ? ' docs-home__layout--admin' : ''}`}>
          {isAdmin && (
            <aside className="docs-home__sidebar" aria-label="Filter by agent">
              <div className="docs-home__sidebar-head">
                <p className="docs-home__sidebar-title">
                  <Users size={18} strokeWidth={2} aria-hidden /> Agents
                </p>
                <p className="docs-home__sidebar-sub">Choose who to review</p>
              </div>
              <div className="docs-home__sidebar-list">
                <button
                  type="button"
                  className={`docs-home__agent${selectedAgentId == null ? ' docs-home__agent--active' : ''}`}
                  onClick={() => setSelectedAgentId(null)}
                >
                  <span className="docs-home__agent-name">All team</span>
                  <span className="docs-home__agent-meta">Everyone’s documents</span>
                </button>
                {agents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`docs-home__agent${selectedAgentId === a.id ? ' docs-home__agent--active' : ''}`}
                    onClick={() => setSelectedAgentId(a.id)}
                    title={a.email}
                  >
                    <span className="docs-home__agent-name">
                      {a.name?.trim() || a.email}
                    </span>
                    <span className="docs-home__agent-meta">{a.email}</span>
                  </button>
                ))}
              </div>
              {agentsError && (
                <div className="docs-home__sidebar-error" role="status">
                  <AlertCircle size={16} />
                  {agentsError}
                </div>
              )}
            </aside>
          )}

          <div className="docs-home__main">
            {error && (
              <div className="documents-error" role="alert">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {loading && !data && (
              <p className="documents-loading">Loading documents…</p>
            )}

            {!loading && (data?.items?.length ?? 0) === 0 && (
              <div className="docs-home__empty">
                <h2>No documents yet</h2>
                <p>
                  {isAdmin && selectedAgentId
                    ? 'This agent has not uploaded any PDFs yet.'
                    : 'Upload a PDF from the Upload tab to see it here.'}
                </p>
              </div>
            )}

            {!loading && data?.items?.length > 0 && filteredItems.length === 0 && (
              <div className="docs-home__empty">
                <h2>No matches</h2>
                <p>Try a different search term.</p>
              </div>
            )}

            {filteredItems.length > 0 && (
              <section className="docs-home__list" aria-label="All documents">
                <h2 className="docs-home__list-title">All documents</h2>
                <ul className="docs-home-cards">
                  {filteredItems.map((doc) => {
                    const st = String(doc.status || 'draft').toLowerCase();
                    const pct = pipelinePct(doc.status);
                    const failed = st === 'failed';
                    return (
                      <li key={doc._id} className="docs-home-card">
                        <div className="docs-home-card__thumb" aria-hidden />
                        <div className="docs-home-card__body">
                          <div className="docs-home-card__top">
                            <div className="docs-home-card__titles">
                              <h3 className="docs-home-card__name">{doc.title}</h3>
                              <p className="docs-home-card__file">{doc.fileName}</p>
                              <p className="docs-home-card__meta">
                                {formatBytes(doc.fileSize)} · {formatDate(doc.createdAt)}
                              </p>
                            </div>
                            <div className="docs-home-card__actions">
                              <span
                                className={`docs-home-badge docs-home-badge--${failed ? 'failed' : st}`}
                              >
                                {doc.status || 'draft'}
                              </span>
                              <button
                                type="button"
                                className="docs-home-view"
                                onClick={() => openPdf(doc._id)}
                              >
                                <ExternalLink size={16} strokeWidth={2} aria-hidden />
                                View PDF
                              </button>
                              <button
                                type="button"
                                className="docs-home-delete"
                                onClick={() => deleteDoc(doc)}
                                disabled={deletingId === doc._id}
                                aria-label="Delete document"
                              >
                                <Trash2 size={16} strokeWidth={2} aria-hidden />
                                {deletingId === doc._id ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          </div>

                          <div className="docs-home-card__pipeline">
                            <p className="docs-home-card__pipeline-label">Pipeline</p>
                            <div
                              className={`rt-progress${failed ? ' rt-progress--failed' : ''}`}
                              aria-label={`Pipeline: ${doc.status || 'draft'}`}
                            >
                              <div className="rt-progress__track" aria-hidden />
                              <div
                                className="rt-progress__fill"
                                style={{ width: `${pct}%` }}
                                aria-hidden
                              />
                              {!failed && (
                                <div
                                  className="rt-progress__dot"
                                  style={{ left: `${pct}%` }}
                                  aria-hidden
                                />
                              )}
                            </div>
                            <div className="rt-progress__labels" aria-hidden>
                              <span>Draft</span>
                              <span>Processing</span>
                              <span>Completed</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

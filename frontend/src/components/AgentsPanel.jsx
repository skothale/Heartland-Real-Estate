import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  UserPlus,
  AlertCircle,
  Search,
  Users,
  ShieldCheck,
  RefreshCw,
  UserRound,
  Mail,
  Calendar,
} from 'lucide-react';
import { apiUrl } from '../config/api.js';
import { authHeaders } from '../auth/token.js';
import { useAuth } from '../auth/AuthContext.jsx';

function formatAgentDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

export default function AgentsPanel({ onAgentsChanged }) {
  const { logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [filter, setFilter] = useState('');
  const [agentName, setAgentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setListError('');
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
        throw new Error('Session expired.');
      }
      if (!res.ok) {
        throw new Error(json.message || res.statusText);
      }
      setItems(json.items || []);
    } catch (e) {
      setListError(e.message || 'Failed to load team');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = String(filter || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => {
      const hay = `${a.name || ''} ${a.email || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, filter]);

  const onCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setCreating(true);
    try {
      const trimmedName = agentName.trim();
      if (!trimmedName) {
        throw new Error('Name is required');
      }
      const res = await fetch(apiUrl('/api/agents'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: trimmedName,
          email: email.trim(),
          password,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        throw new Error('Session expired.');
      }
      if (!res.ok) {
        throw new Error(json.message || 'Could not create agent');
      }
      setFormSuccess(`Created account for ${json.agent?.email || email.trim()}`);
      setAgentName('');
      setEmail('');
      setPassword('');
      await load();
      onAgentsChanged?.();
    } catch (err) {
      setFormError(err.message || 'Something went wrong');
    } finally {
      setCreating(false);
    }
  };

  const searchActive = Boolean(String(filter || '').trim());

  return (
    <div className="agents-panel agents-panel--homeview">
      <div className="team-home">
        <header className="team-home__hero">
          <div className="team-home__hero-main">
            <div className="team-home__mark" aria-hidden>
              <Users size={22} strokeWidth={1.85} />
            </div>
            <div>
              <p className="team-home__eyebrow">Admin · Team</p>
              <h1 className="team-home__title">Team</h1>
              <p className="team-home__lead">
                Create agent accounts so each person uploads and manages only their own
                documents. You can filter the directory anytime.
              </p>
              <p className="team-home__note">
                <ShieldCheck size={16} strokeWidth={2} aria-hidden />
                Agents only see their own uploads; you see everyone from Documents.
              </p>
            </div>
          </div>

          <div className="team-home__toolbar">
            <div className="team-home__search" role="search">
              <Search size={18} strokeWidth={2} aria-hidden />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by email…"
                aria-label="Search agents"
              />
            </div>
            <button
              type="button"
              className="team-home__refresh"
              onClick={() => load()}
              disabled={loading}
              aria-label="Refresh team list"
            >
              <RefreshCw
                size={18}
                strokeWidth={2}
                className={loading ? 'spin' : undefined}
              />
            </button>
          </div>
        </header>

        <section className="rt-home__stats team-home__stats" aria-label="Team summary">
          <div className="rt-stat">
            <p className="rt-stat__label">Team members</p>
            <p className="rt-stat__value">{items.length}</p>
          </div>
          <div className="rt-stat">
            <p className="rt-stat__label">{searchActive ? 'Matches' : 'Directory'}</p>
            <p className="rt-stat__value">{filtered.length}</p>
          </div>
          <div className="rt-stat">
            <p className="rt-stat__label">Access model</p>
            <p className="rt-stat__value rt-stat__value--text">Per agent</p>
          </div>
          <div className="rt-stat">
            <p className="rt-stat__label">Create</p>
            <p className="rt-stat__value rt-stat__value--text">Email + password</p>
          </div>
        </section>

        <div className="team-home__grid">
          <section className="team-home__panel" aria-label="Create agent">
            <div className="team-home__panel-head">
              <h2 className="team-home__panel-title">
                <UserPlus size={20} strokeWidth={2} aria-hidden />
                Invite an agent
              </h2>
              <p className="team-home__panel-lead">
                They sign in with this email and password. Ask them to change the password
                after first login if you add that flow later.
              </p>
            </div>

            <form className="team-home__form" onSubmit={onCreate}>
              <div className="team-home__field">
                <label className="team-home__label" htmlFor="agent-name">
                  Name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  className="team-home__input"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Agent name"
                  autoComplete="off"
                  required
                  maxLength={80}
                />
              </div>

              <div className="team-home__field">
                <label className="team-home__label" htmlFor="agent-email">
                  Work email
                </label>
                <input
                  id="agent-email"
                  type="email"
                  className="team-home__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@company.com"
                  autoComplete="off"
                  required
                />
              </div>

              <div className="team-home__field">
                <label className="team-home__label" htmlFor="agent-password">
                  Temporary password
                </label>
                <input
                  id="agent-password"
                  type="password"
                  className="team-home__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                <p className="team-home__hint">At least 8 characters.</p>
              </div>

              {formError && (
                <p className="team-home__banner team-home__banner--error" role="alert">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="team-home__banner team-home__banner--ok" role="status">
                  {formSuccess}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary team-home__submit"
                disabled={creating}
              >
                {creating ? 'Creating…' : 'Create agent account'}
              </button>
            </form>
          </section>

          <section className="team-home__panel team-home__panel--list" aria-label="Agents">
            <div className="team-home__panel-head team-home__panel-head--row">
              <div>
                <h2 className="team-home__panel-title">
                  <Users size={20} strokeWidth={2} aria-hidden />
                  Agent directory
                </h2>
                <p className="team-home__panel-lead">
                  {items.length === 0
                    ? 'No agents yet — create one on the left.'
                    : `${items.length} on your team${searchActive ? ` · ${filtered.length} match your search` : ''}.`}
                </p>
              </div>
            </div>

            {listError && (
              <div className="documents-error team-home__alert" role="alert">
                <AlertCircle size={18} />
                {listError}
              </div>
            )}

            {loading && <p className="documents-loading team-home__loading">Loading team…</p>}

            {!loading && items.length === 0 && !listError && (
              <div className="team-home__empty">
                <h3>No agents yet</h3>
                <p>Use the form beside this panel to add the first account.</p>
              </div>
            )}

            {!loading && items.length > 0 && filtered.length === 0 && (
              <div className="team-home__empty">
                <h3>No matches</h3>
                <p>Try another email search.</p>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <ul className="team-home__list">
                {filtered.map((a) => (
                  <li key={a.id} className="team-home__member">
                    <div className="team-home__avatar" aria-hidden>
                      {String(a.name || a.email || '?')
                        .trim()
                        .slice(0, 1)
                        .toUpperCase() || '?'}
                    </div>
                    <div className="team-home__member-body">
                      <p className="team-home__member-name">
                        <UserRound size={15} strokeWidth={2} aria-hidden />
                        {a.name || '—'}
                      </p>
                      <p className="team-home__member-email">
                        <Mail size={15} strokeWidth={2} aria-hidden />
                        {a.email}
                      </p>
                      <p className="team-home__member-meta">
                        <Calendar size={14} strokeWidth={2} aria-hidden />
                        Added {formatAgentDate(a.createdAt)}
                      </p>
                    </div>
                    <span className="team-home__pill">Agent</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

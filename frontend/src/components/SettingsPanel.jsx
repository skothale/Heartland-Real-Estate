import { useMemo, useState } from 'react';
import { KeyRound, UserRound, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiUrl } from '../config/api.js';
import { authHeaders } from '../auth/token.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function SettingsPanel() {
  const { user, logout, refreshUser } = useAuth();
  const [menu, setMenu] = useState('profile'); // profile | security

  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileOk, setProfileOk] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState('');

  const identity = useMemo(() => {
    const displayName = String(user?.name || '').trim();
    return {
      displayName: displayName || 'Your profile',
      email: user?.email || '',
      role: user?.role || 'agent',
    };
  }, [user?.email, user?.name, user?.role]);

  const saveName = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileOk('');
    setProfileSaving(true);
    try {
      const res = await fetch(apiUrl('/api/users/me'), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please sign in again.');
      }
      if (!res.ok) {
        throw new Error(json.message || 'Could not update profile');
      }
      setProfileOk('Name updated.');
      await refreshUser?.();
    } catch (err) {
      setProfileError(err.message || 'Something went wrong');
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwOk('');
    setPwSaving(true);
    try {
      const res = await fetch(apiUrl('/api/users/me/password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please sign in again.');
      }
      if (!res.ok) {
        throw new Error(json.message || 'Could not change password');
      }
      setCurrentPassword('');
      setNewPassword('');
      setPwOk('Password changed.');
    } catch (err) {
      setPwError(err.message || 'Something went wrong');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="settings-panel settings-panel--homeview">
      <div className="settings-home">
        <header className="settings-home__hero">
          <div className="settings-home__hero-main">
            <div className="settings-home__mark" aria-hidden>
              <UserRound size={22} strokeWidth={1.85} />
            </div>
            <div>
              <p className="settings-home__eyebrow">
                {identity.role === 'admin' ? 'Admin' : 'Agent'} · Settings
              </p>
              <h1 className="settings-home__title">{identity.displayName}</h1>
              <p className="settings-home__lead">
                Manage your profile and update your password.
              </p>
            </div>
          </div>
        </header>

        <div className="settings-home__layout">
          <aside className="settings-home__menu" aria-label="Settings menu">
            <button
              type="button"
              className={`settings-home__menu-item${menu === 'profile' ? ' settings-home__menu-item--active' : ''}`}
              onClick={() => setMenu('profile')}
            >
              <UserRound size={18} strokeWidth={2} aria-hidden />
              Profile
              <span className="settings-home__menu-sub">Name & identity</span>
            </button>
            <button
              type="button"
              className={`settings-home__menu-item${menu === 'security' ? ' settings-home__menu-item--active' : ''}`}
              onClick={() => setMenu('security')}
            >
              <KeyRound size={18} strokeWidth={2} aria-hidden />
              Security
              <span className="settings-home__menu-sub">Password</span>
            </button>
          </aside>

          <div className="settings-home__main">
            {menu === 'profile' && (
              <section className="settings-home__card" aria-label="Profile settings">
                <div className="settings-home__card-head">
                  <h2>Profile</h2>
                  <p>Update the name shown across the portal.</p>
                </div>

                <form className="settings-home__form" onSubmit={saveName}>
                  <label className="settings-home__label" htmlFor="settings-name">
                    Display name
                  </label>
                  <input
                    id="settings-name"
                    className="settings-home__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shivkumar"
                    maxLength={80}
                  />
                  <p className="settings-home__hint">
                    This name will show in Team, Documents filters, and your header.
                  </p>

                  {profileError && (
                    <div className="settings-home__banner settings-home__banner--error" role="alert">
                      <AlertCircle size={18} />
                      {profileError}
                    </div>
                  )}
                  {profileOk && (
                    <div className="settings-home__banner settings-home__banner--ok" role="status">
                      <CheckCircle2 size={18} />
                      {profileOk}
                    </div>
                  )}

                  <button type="submit" className="btn-primary settings-home__submit" disabled={profileSaving}>
                    <Save size={18} strokeWidth={2} aria-hidden />
                    {profileSaving ? 'Saving…' : 'Save changes'}
                  </button>
                </form>

                <div className="settings-home__readonly">
                  <div>
                    <p className="settings-home__readonly-label">Email</p>
                    <p className="settings-home__readonly-value">{identity.email || '—'}</p>
                  </div>
                  <div>
                    <p className="settings-home__readonly-label">Role</p>
                    <p className="settings-home__readonly-value">{identity.role}</p>
                  </div>
                </div>
              </section>
            )}

            {menu === 'security' && (
              <section className="settings-home__card" aria-label="Security settings">
                <div className="settings-home__card-head">
                  <h2>Security</h2>
                  <p>Change your password anytime.</p>
                </div>

                <form className="settings-home__form" onSubmit={changePassword}>
                  <label className="settings-home__label" htmlFor="settings-current-password">
                    Current password
                  </label>
                  <input
                    id="settings-current-password"
                    className="settings-home__input"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <label className="settings-home__label" htmlFor="settings-new-password">
                    New password
                  </label>
                  <input
                    id="settings-new-password"
                    className="settings-home__input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                  <p className="settings-home__hint">Minimum 8 characters.</p>

                  {pwError && (
                    <div className="settings-home__banner settings-home__banner--error" role="alert">
                      <AlertCircle size={18} />
                      {pwError}
                    </div>
                  )}
                  {pwOk && (
                    <div className="settings-home__banner settings-home__banner--ok" role="status">
                      <CheckCircle2 size={18} />
                      {pwOk}
                    </div>
                  )}

                  <button type="submit" className="btn-primary settings-home__submit" disabled={pwSaving}>
                    <KeyRound size={18} strokeWidth={2} aria-hidden />
                    {pwSaving ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


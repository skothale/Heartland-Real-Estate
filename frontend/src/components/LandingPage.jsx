import { useMemo, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Users,
  FileText,
  Sparkles,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

export default function LandingPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const sections = useMemo(
    () => [
      {
        id: 'client-management',
        title: 'Client management',
        lead: 'Keep every client organized, from prospect to close.',
        bullets: [
          'Manage clients in one place',
          'Track active and past transactions',
          'Stay consistent across your team',
        ],
        icon: Users,
      },
      {
        id: 'timelines-tasks',
        title: 'Timelines & tasks',
        lead: 'Clear progress tracking so nothing slips.',
        bullets: [
          'Property checklists and milestones',
          'Real-time updates for your team',
          'Simple, repeatable workflows',
        ],
        icon: ClipboardCheck,
      },
      {
        id: 'document-management',
        title: 'Document management',
        lead: 'Store and retrieve PDFs fast—role-aware by default.',
        bullets: [
          'Agents see only their own docs',
          'Admins can filter by agent',
          'PDFs stored as blobs in MongoDB',
        ],
        icon: FileText,
      },
      {
        id: 'track-commissions',
        title: 'Track commissions',
        lead: 'A quick snapshot of what’s pending.',
        bullets: [
          'Pending commissions and volume',
          'At-a-glance KPIs on the dashboard',
          'Simple reporting foundation',
        ],
        icon: TrendingUp,
      },
      {
        id: 'anniversaries-events',
        title: 'Anniversaries & events',
        lead: 'Keep relationships warm with reminders.',
        bullets: [
          'Monthly anniversaries overview',
          'Stay on top of key dates',
          'Designed for repeat business',
        ],
        icon: CalendarDays,
      },
    ],
    []
  );

  return (
    <div className="landing">
      <div className="landing__bg" aria-hidden />
      <div className="landing__shell">
        <div className="landing__nav-wrap">
          <nav className="landing__nav" aria-label="Landing navigation">
            <div className="landing__logo">
              <span className="landing__logo-mark" aria-hidden>
                <Building2 size={18} strokeWidth={2} />
              </span>
              <span>Heartland</span>
              <span className="landing__badge">Realtor portal</span>
            </div>

            <div className="landing__nav-links">
              <a className="landing__nav-link" href="#features">
                Features
              </a>
              <a className="landing__nav-link" href="#documents">
                Documents
              </a>
              <a className="landing__nav-link" href="#security">
                Security
              </a>
            </div>

            <div className="landing__nav-cta">
              <button
                type="button"
                className="landing__nav-btn"
                onClick={() =>
                  document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Sign in <ArrowRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </nav>
        </div>

        <main className="landing__content">
          <section className="landing__hero" aria-label="Hero">
            <div className="landing__hero-grid">
              <div className="landing__hero-copy">
                <p className="landing__kicker">
                  <ShieldCheck size={16} strokeWidth={2} aria-hidden /> Keep yourself and your
                  clients organized
                </p>
                <h1 className="landing__title">
                  Everything for your transactions.
                  <span className="landing__title-accent"> In one place.</span>
                </h1>
                <p className="landing__lead">
                  Documents, tasks, and property details with a simple workflow that scales from
                  solo agents to teams.
                </p>

                <div className="landing__hero-cta">
                  <button
                    type="button"
                    className="btn-primary landing__primary-cta"
                    onClick={() =>
                      document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    Get started <ArrowRight size={16} strokeWidth={2.2} />
                  </button>
                  <a className="landing__secondary-cta" href="#features">
                    See features
                  </a>
                </div>

                <div className="landing__proof" aria-label="Quick proof points">
                  <div className="landing__proof-item">
                    <span className="landing__proof-icon" aria-hidden>
                      <Users size={16} strokeWidth={2} />
                    </span>
                    <span>Admins manage agents</span>
                  </div>
                  <div className="landing__proof-item" id="documents">
                    <span className="landing__proof-icon" aria-hidden>
                      <FileText size={16} strokeWidth={2} />
                    </span>
                    <span>Docs stored in MongoDB</span>
                  </div>
                  <div className="landing__proof-item" id="security">
                    <span className="landing__proof-icon" aria-hidden>
                      <ShieldCheck size={16} strokeWidth={2} />
                    </span>
                    <span>JWT + role-based access</span>
                  </div>
                </div>
              </div>

              <div className="landing__hero-card" id="auth">
                <div className="landing__card">
                  <div className="landing__card-head">
                    <h2 className="landing__card-title">
                      {mode === 'login' ? 'Agent / Admin sign in' : 'Create admin account'}
                    </h2>
                    <p className="landing__card-subtitle">
                      {mode === 'login'
                        ? 'Sign in to open your portal.'
                        : 'Only available until an admin exists.'}
                    </p>
                  </div>

                  <div className="landing__tabs" role="tablist" aria-label="Authentication">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'login'}
                      className={`landing__tab${mode === 'login' ? ' landing__tab--active' : ''}`}
                      onClick={() => switchMode('login')}
                    >
                      Log in
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={mode === 'signup'}
                      className={`landing__tab${mode === 'signup' ? ' landing__tab--active' : ''}`}
                      onClick={() => switchMode('signup')}
                    >
                      Sign up
                    </button>
                  </div>

                  <form className="landing__form" onSubmit={onSubmit}>
                    <div className="landing__field">
                      <label className="landing__label" htmlFor="auth-email">
                        Email
                      </label>
                      <input
                        id="auth-email"
                        type="email"
                        autoComplete="email"
                        className="landing__input"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="landing__field">
                      <label className="landing__label" htmlFor="auth-password">
                        Password
                      </label>
                      <input
                        id="auth-password"
                        type="password"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        className="landing__input"
                        placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={mode === 'signup' ? 8 : undefined}
                      />
                    </div>

                    {mode === 'signup' && (
                      <p className="landing__hint">
                        Only available until an admin exists. Use at least 8 characters for your
                        password.
                      </p>
                    )}

                    {error && (
                      <p className="landing__error" role="alert">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn-primary landing__submit"
                      disabled={submitting}
                    >
                      {submitting
                        ? 'Please wait…'
                        : mode === 'login'
                          ? 'Sign in'
                          : 'Create admin'}
                    </button>

                    <p className="landing__fineprint">
                      Need an agent account? Ask your admin to create one from <strong>Team</strong>.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <section className="landing__features" id="features" aria-label="Features">
            <div className="landing__section-head">
              <h2 className="landing__section-title">Built for how real estate actually moves</h2>
              <p className="landing__section-sub">
                A clean portal that keeps documents, tasks, and progress together.
              </p>
            </div>

            <div className="landing__feature-grid">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="landing__feature">
                    <div className="landing__feature-icon" aria-hidden>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <h3 className="landing__feature-title">{s.title}</h3>
                    <p className="landing__feature-lead">{s.lead}</p>
                    <ul className="landing__feature-bullets">
                      {s.bullets.map((b) => (
                        <li key={b}>
                          <CheckCircle2 size={16} strokeWidth={2} aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="landing__testimonials" aria-label="Testimonials">
            <div className="landing__section-head">
              <h2 className="landing__section-title">Trusted workflows, without the clutter</h2>
              <p className="landing__section-sub">
                Simple, role-based collaboration that scales to teams.
              </p>
            </div>

            <div className="landing__quotes">
              <figure className="landing__quote-card">
                <blockquote>
                  “Finally—one place for agent PDFs and admin visibility. It keeps our team aligned.”
                </blockquote>
                <figcaption>— Brokerage admin</figcaption>
              </figure>
              <figure className="landing__quote-card">
                <blockquote>
                  “I can upload documents fast and never worry about who can see what.”
                </blockquote>
                <figcaption>— Agent</figcaption>
              </figure>
            </div>
          </section>

          <section className="landing__final-cta" aria-label="Call to action">
            <div className="landing__final-card">
              <div>
                <h2>Ready to start?</h2>
                <p>
                  Sign in to your portal. If you’re setting up a new environment, the first sign-up
                  becomes the admin.
                </p>
              </div>
              <button
                type="button"
                className="btn-primary landing__final-btn"
                onClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Sign in <ArrowRight size={16} strokeWidth={2.2} />
              </button>
            </div>
            <div className="landing__note">
              <Sparkles size={16} strokeWidth={2} aria-hidden />
              <p>
                Tip: the <strong>first sign-up</strong> becomes the organization admin. After that,
                admins create agent accounts from <strong>Team</strong>.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

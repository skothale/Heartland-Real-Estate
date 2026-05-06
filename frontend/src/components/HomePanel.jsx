import { useMemo } from 'react';
import {
  Building2,
  Plus,
  ChevronRight,
  Calendar,
  ClipboardCheck,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

function titleFromEmail(email) {
  if (!email) return 'Welcome';
  const raw = String(email).split('@')[0] || 'Welcome';
  const name = raw
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((p) => p.slice(0, 1).toUpperCase() + p.slice(1))
    .join(' ');
  return name || 'Welcome';
}

function formatMoneyShort(value) {
  if (value == null) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function HomePanel({ onGoToUploadDocument, onGoToDocuments }) {
  const { user } = useAuth();
  const displayName = String(user?.name || '').trim() || titleFromEmail(user?.email);

  const stats = useMemo(
    () => [
      { label: 'Sales volume pending', value: formatMoneyShort(3_170_000) },
      { label: 'Commission pending', value: formatMoneyShort(80_600) },
      { label: 'Closing clients pending', value: '7' },
      { label: 'Anniversaries this month', value: '9' },
    ],
    []
  );

  const clients = useMemo(
    () => [
      {
        id: '1194-carlin',
        title: '1194 Carlin Drive',
        subtitle: 'Fort Worth, TX 76108',
        days: 525,
        stage: 0.72,
        assignees: ['James Lin', 'Thomas Smith', 'Mary Thomas', 'Carlos Ortega'],
      },
      {
        id: '4928-dexter',
        title: '4928 Dexter Avenue',
        subtitle: 'Dallas, TX 75218',
        days: 459,
        stage: 0.46,
        assignees: ['Thomas Smith', 'Mary Thomas', 'Carlos Ortega'],
      },
      {
        id: '6641-stone',
        title: '6641 Stone Pike Lane',
        subtitle: 'Plano, TX 75024',
        days: 264,
        stage: 0.58,
        assignees: ['Mary Thomas', 'Carlos Ortega', 'Kelley Thompson'],
      },
      {
        id: '444-dove',
        title: '444 Dove Lane',
        subtitle: 'Austin, TX 78704',
        days: 198,
        stage: 0.33,
        assignees: ['Carlos Ortega', 'Kelley Thompson'],
      },
      {
        id: '409-mccam',
        title: '409 McCambridge Ave',
        subtitle: 'Madison, WI 53705',
        days: 182,
        stage: 0.64,
        assignees: ['Kelley Thompson'],
      },
    ],
    []
  );

  const tasks = useMemo(
    () => [
      {
        id: 'closing-gift',
        title: 'Closing gift for seller',
        subtitle: '1194 Valley View Ln · Claudia Garrison',
        icon: Calendar,
      },
      {
        id: 'prep-closing',
        title: 'Prepare closing gift for buyer',
        subtitle: '1194 Carlin Drive · James Lin',
        icon: ClipboardCheck,
      },
      {
        id: 'executed',
        title: 'Executed contract',
        subtitle: '444 Dove Lane · Carlos Ortega',
        icon: FileText,
      },
      {
        id: 'survey',
        title: 'Inspection survey if applicable',
        subtitle: '6641 Stone Pike Lane · Mary Thomas',
        icon: TrendingUp,
      },
    ],
    []
  );

  return (
    <div className="home-panel">
      <div className="rt-home">
        <header className="rt-home__top">
          <div className="rt-home__welcome">
            <div className="rt-home__avatar" aria-hidden>
              <Building2 size={18} strokeWidth={2} />
            </div>
            <div className="rt-home__welcome-text">
              <p className="rt-home__eyebrow">Welcome</p>
              <h1 className="rt-home__name">{displayName}</h1>
              <p className="rt-home__meta">
                {user?.role === 'admin'
                  ? 'Admin workspace'
                  : 'Agent workspace'}
              </p>
            </div>
          </div>

          <button type="button" className="rt-home__cta" onClick={onGoToUploadDocument}>
            <Plus size={16} strokeWidth={2.2} />
            Upload PDF
          </button>
        </header>

        <section className="rt-home__stats" aria-label="Overview stats">
          {stats.map((s) => (
            <div key={s.label} className="rt-stat">
              <p className="rt-stat__label">{s.label}</p>
              <p className="rt-stat__value">{s.value}</p>
            </div>
          ))}
        </section>

        <div className="rt-home__grid">
          <section className="rt-card rt-card--clients" aria-label="Pending clients">
            <div className="rt-card__head">
              <h2 className="rt-card__title">Pending clients</h2>
              <button type="button" className="rt-card__link" onClick={onGoToDocuments}>
                View documents <ChevronRight size={16} strokeWidth={2.25} />
              </button>
            </div>

            <ul className="rt-clients">
              {clients.map((c) => (
                <li key={c.id} className="rt-client">
                  <div className="rt-client__thumb" aria-hidden />
                  <div className="rt-client__main">
                    <div className="rt-client__row">
                      <div className="rt-client__id">
                        <p className="rt-client__title">{c.title}</p>
                        <p className="rt-client__sub">{c.subtitle}</p>
                      </div>
                      <span className="rt-client__pill">{c.days} days past</span>
                    </div>

                    <div className="rt-client__progress" aria-label="Progress">
                      <div className="rt-progress">
                        <div className="rt-progress__track" aria-hidden />
                        <div
                          className="rt-progress__fill"
                          style={{ width: `${Math.round(c.stage * 100)}%` }}
                          aria-hidden
                        />
                        <div
                          className="rt-progress__dot"
                          style={{ left: `${Math.round(c.stage * 100)}%` }}
                          aria-hidden
                        />
                      </div>
                      <div className="rt-progress__labels" aria-hidden>
                        <span>Inspection phase</span>
                        <span>Title policy / appraisal</span>
                        <span>Closing</span>
                      </div>
                    </div>

                    <div className="rt-client__assignees" aria-label="Assignees">
                      {c.assignees.slice(0, 3).map((a) => (
                        <span key={a} className="rt-client__assignee">
                          {a}
                        </span>
                      ))}
                      {c.assignees.length > 3 && (
                        <span className="rt-client__assignee rt-client__assignee--more">
                          +{c.assignees.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="rt-side" aria-label="Today">
            <section className="rt-card rt-card--tasks">
              <div className="rt-card__head">
                <div>
                  <p className="rt-side__date">
                    Today · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <h2 className="rt-card__title">Property tasks</h2>
                </div>
              </div>

              <ul className="rt-tasks">
                {tasks.map((t) => {
                  const Icon = t.icon;
                  return (
                    <li key={t.id} className="rt-task">
                      <div className="rt-task__icon" aria-hidden>
                        <Icon size={18} strokeWidth={1.9} />
                      </div>
                      <div className="rt-task__body">
                        <p className="rt-task__title">{t.title}</p>
                        <p className="rt-task__sub">{t.subtitle}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

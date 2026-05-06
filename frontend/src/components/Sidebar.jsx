import {
  Home,
  Files,
  Upload,
  Settings,
  LogOut,
  Moon,
  Sun,
  Users,
} from 'lucide-react';
import { useTheme } from '../theme/ThemeContext.jsx';

const baseItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'documents', label: 'Documents', icon: Files },
  { id: 'upload', label: 'Upload Document', icon: Upload },
];

export default function Sidebar({ active, onSelect, onLogout, userRole }) {
  const items =
    userRole === 'admin'
      ? [
          baseItems[0],
          baseItems[1],
          { id: 'agents', label: 'Team', icon: Users },
          baseItems[2],
        ]
      : baseItems;
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden />
        Heartland
      </div>
      <nav className="sidebar__nav" aria-label="Main">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar__link${active === id ? ' sidebar__link--active' : ''}`}
            onClick={() => onSelect(id)}
          >
            <Icon strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </nav>
      <div className="sidebar__footer">
        <button
          type="button"
          className={`sidebar__link${active === 'settings' ? ' sidebar__link--active' : ''}`}
          onClick={() => onSelect('settings')}
        >
          <Settings strokeWidth={1.75} />
          Settings
        </button>
        <button
          type="button"
          className="sidebar__link"
          onClick={toggleTheme}
          aria-pressed={isDark}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun strokeWidth={1.75} />
          ) : (
            <Moon strokeWidth={1.75} />
          )}
          Appearance
        </button>
        <button type="button" className="sidebar__link" onClick={onLogout}>
          <LogOut strokeWidth={1.75} />
          Sign out
        </button>
        <p className="sidebar__muted">v0.1.0 · Document assistant</p>
      </div>
    </aside>
  );
}

import { useAuth } from './auth/AuthContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import MainApp from './components/MainApp.jsx';

export default function App() {
  const { user, initializing, logout } = useAuth();

  if (initializing) {
    return (
      <div className="auth-boot" role="status">
        <p className="auth-boot__text">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <MainApp onLogout={logout} />;
}

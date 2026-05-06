import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiUrl } from '../config/api.js';
import { getStoredToken, setStoredToken } from './token.js';

const AuthContext = createContext(null);

async function parseJsonResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text || '{}');
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const hydrate = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }

    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const json = await parseJsonResponse(res);
      if (!res.ok) {
        setStoredToken(null);
        setUser(null);
        setInitializing(false);
        return;
      }
      setUser(json.user ?? null);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const json = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(json.message || 'Login failed');
    }
    setStoredToken(json.token);
    setUser(json.user ?? null);
  }, []);

  const signup = useCallback(async (email, password) => {
    const res = await fetch(apiUrl('/api/auth/signup'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const json = await parseJsonResponse(res);
    if (!res.ok) {
      throw new Error(json.message || 'Signup failed');
    }
    setStoredToken(json.token);
    setUser(json.user ?? null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      signup,
      logout,
      refreshUser: hydrate,
    }),
    [user, initializing, login, signup, logout, hydrate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

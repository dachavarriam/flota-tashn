import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { api } from '../api/client';
import type { LoginPayload, LoginResponse, Usuario } from '../api/auth';
import { login } from '../api/auth';

interface AuthContextValue {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'flota-auth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { user: Usuario; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
      api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  const handleLogin = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res: LoginResponse = await login(payload);
      setUser(res.user);
      setToken(res.access_token);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: res.user, token: res.access_token })
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo iniciar sesión';
      setError(Array.isArray(message) ? message[0] : message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, token, loading, error, login: handleLogin, logout }),
    [user, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};


import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authService from '../services/authService';
import {
  setUnauthorizedHandler,
  tokenStore,
} from '../services/api';
import { decodeToken, isExpired } from '../utils/jwt';

const AuthContext = createContext(null);

function userFromToken(token) {
  const payload = decodeToken(token);

  if (!payload || isExpired(payload)) return null;

  return {
    id: payload.id,
    exp: payload.exp,
  };
}

function restore() {
  const token = tokenStore.get();

  if (!token) return null;

  const user = userFromToken(token);

  if (!user) tokenStore.clear();

  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(restore);

  // Update authentication state from a valid access token.
  const setUserFromToken = useCallback((token) => {
    const authenticatedUser = userFromToken(token);

    if (!authenticatedUser) {
      tokenStore.clear();
      setUser(null);
      return false;
    }

    tokenStore.set(token);
    setUser(authenticatedUser);
    return true;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear();
      setUser(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  // Refresh the access token one minute before it expires.
  useEffect(() => {
    if (!user?.exp) return undefined;

    let cancelled = false;

    const refreshIn = Math.max(
      user.exp * 1000 - Date.now() - 60_000,
      0
    );

    const timer = setTimeout(async () => {
      try {
        const token = await authService.refresh();

        if (cancelled) return;

        const updatedUser = userFromToken(token);

        if (updatedUser) {
          tokenStore.set(token);
          setUser(updatedUser);
        } else {
          tokenStore.clear();
          setUser(null);
        }
      } catch (error) {
        if (cancelled) return;

        console.error('Session refresh failed:', error);
        tokenStore.clear();
        setUser(null);
      }
    }, refreshIn);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [user]);

  const login = useCallback(async (values) => {
    const token = await authService.login(values);

    if (!setUserFromToken(token)) {
      throw new Error('Login returned an invalid access token.');
    }
  }, [setUserFromToken]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
      register: authService.register,
      setUserFromToken,
    }),
    [user, login, logout, setUserFromToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}

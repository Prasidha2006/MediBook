import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { AUTH_EXPIRED_EVENT } from '../services/api';
import { getTokenExpiryMs, isTokenExpired } from '../utils/token';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];
const MAX_TIMEOUT_MS = 2147483647;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('medibook_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('medibook_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const expireSession = useCallback(() => {
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
    setUser(null);
    setToken(null);

    const isOnAuthPage = AUTH_PAGES.some((p) => location.pathname.startsWith(p));
    if (!isOnAuthPage) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [navigate, location]);

  // Synchronize user profile on initial mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = localStorage.getItem('medibook_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isTokenExpired(storedToken)) {
        if (isMounted) {
          expireSession();
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authService.getMe();
        if (isMounted && response.success && response.user) {
          setUser(response.user);
          localStorage.setItem('medibook_user', JSON.stringify(response.user));
        }
      } catch (err) {
        console.warn('Session verification notice:', err.message);
        // Any HTTP error response means the session is invalid — clear it.
        // We deliberately leave network errors (err.response === undefined) alone
        // so a temporary backend outage doesn't log the user out.
        if (err.response) {
          localStorage.removeItem('medibook_token');
          localStorage.removeItem('medibook_user');
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for 401 / expired-token events from the Axios interceptor
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, expireSession);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expireSession);
  }, [expireSession]);

  // Proactive JWT expiration timer and tab-focus/visibility re-check
  useEffect(() => {
    if (!token) return;

    const expMs = getTokenExpiryMs(token);
    if (expMs === null) return;

    const checkExpiry = () => {
      if (isTokenExpired(token)) {
        expireSession();
      }
    };

    const remainingMs = expMs - Date.now();
    if (remainingMs <= 0) {
      expireSession();
      return;
    }

    const timerId = setTimeout(checkExpiry, Math.min(remainingMs, MAX_TIMEOUT_MS));

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkExpiry();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', checkExpiry);

    return () => {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', checkExpiry);
    };
  }, [token, expireSession]);

  // Sync logout / session expiry across browser tabs
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'medibook_token' && !event.newValue) {
        expireSession();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [expireSession]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (patientData) => {
    setIsLoading(true);
    try {
      const data = await authService.register(patientData);
      setUser(data.user);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout notice:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const updateUserProfile = (updatedProfile) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedProfile };
      localStorage.setItem('medibook_user', JSON.stringify(updated));
      return updated;
    });
  };

  const getDashboardRedirectUrl = (roleOverride) => {
    const role = roleOverride || user?.role;
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'DOCTOR':
        return '/doctor/dashboard';
      case 'PATIENT':
      default:
        return '/patient/dashboard';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        getDashboardRedirectUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

  // Synchronize user profile on initial mount
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const storedToken = localStorage.getItem('medibook_token');
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
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

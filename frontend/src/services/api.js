import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if stored locally
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medibook_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle expired / invalid session globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Auth pages that must never be redirected away from
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isOnAuthPage = authPages.some((p) =>
      window.location.pathname.startsWith(p)
    );

    if (status === 401) {
      // Clear all stored credentials
      localStorage.removeItem('medibook_token');
      localStorage.removeItem('medibook_user');

      // Hard-redirect to login so React state is fully reset.
      // Skip if already on an auth page to avoid redirect loops.
      if (!isOnAuthPage) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;

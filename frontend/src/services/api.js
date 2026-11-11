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

// Response interceptor to catch 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear and redirect if we had a token previously or aren't on auth pages
      const token = localStorage.getItem('medibook_token');
      if (token && !window.location.pathname.startsWith('/login')) {
        localStorage.removeItem('medibook_token');
        localStorage.removeItem('medibook_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

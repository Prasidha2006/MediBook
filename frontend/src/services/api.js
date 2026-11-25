import axios from 'axios';
import { isTokenExpired } from '../utils/token';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const AUTH_EXPIRED_EVENT = 'medibook:unauthorized';

function triggerUnauthorized() {
  localStorage.removeItem('medibook_token');
  localStorage.removeItem('medibook_user');
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

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
      if (isTokenExpired(token)) {
        triggerUnauthorized();
        return Promise.reject(new axios.Cancel('Session expired'));
      }
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
    if (error.response?.status === 401) {
      triggerUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;

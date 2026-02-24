import axios from 'axios';

const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const normalizedApiUrl = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;
const API_BASE_URL = normalizedApiUrl;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const storedUser = localStorage.getItem('user');
      let redirectPath = '/login';
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?.role === 'ADMIN') {
            redirectPath = '/admin-login';
          } else if (parsedUser?.role === 'SUPERVISOR') {
            redirectPath = '/supervisor-login';
          }
        } catch {
          redirectPath = '/login';
        }
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('supervisor');
      window.location.href = redirectPath;
    }
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Use relative path '/api' by default so requests go to the same origin (Nginx)
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 10000
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('flota-auth');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});

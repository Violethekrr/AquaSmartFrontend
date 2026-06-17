import axios from 'axios';
import { useAuthStore } from '../store/authSlice';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // ← URL de ton backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : ajoute le token à chaque requête
api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur : gère les erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
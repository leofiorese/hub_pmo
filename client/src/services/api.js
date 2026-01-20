import axios from 'axios';

const api = axios.create({
  // Usa variável de ambiente (definida no .env.production no build) ou fallback para local
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// INTERCEPTOR: Antes de cada requisição, insere o token se ele existir
api.interceptors.request.use(async (config) => {
  // Tenta pegar do localStorage
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
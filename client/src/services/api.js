import axios from 'axios';

const api = axios.create({
  // Usa variável de ambiente (definida no .env.production no build) ou fallback para local
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
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

// INTERCEPTOR: Trata erros 401 (Token inválido/expirado) globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se receber 401, limpa tudo e força logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redireciona para login se não estiver lá
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
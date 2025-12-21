import axios from 'axios';

const api = axios.create({
  // Garanta que a porta é a mesma que aparece no terminal do backend (3000 ou 3001, etc)
  baseURL: 'http://localhost:3000/api', 
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
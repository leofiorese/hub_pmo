import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ao carregar a página, verifica se já tem token salvo e valida com o backend
    const loadStorageData = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        // 1. Carregamento Otimista (Mostra a UI imediatamente)
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // 2. Validação Silenciosa (Verifica se o token ainda é válido no servidor)
        try {
          const response = await api.get('/auth/me');
          // Atualiza com dados frescos (caso role ou status tenha mudado)
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (error) {
          console.error("Sessão expirada ou inválida:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadStorageData();
  }, []);

  async function signIn(email, password) {
    // Chama o backend
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Salva no navegador para persistir se der F5
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
  }

  function signOut() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
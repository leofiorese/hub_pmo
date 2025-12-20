import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Importa o Contexto original

// Este hook serve como um atalho para não precisarmos importar o useContext e o AuthContext em todo lugar
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
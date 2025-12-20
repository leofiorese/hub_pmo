import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {CssBaseline } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';

// --- IMPORTAÇÕES CORRIGIDAS ---
// 1. Importa o PROVEDOR (AuthProvider) da pasta contexts
import { AuthProvider } from './contexts/AuthContext'; 

// 2. Importa o HOOK (useAuth) da pasta hooks
import { useAuth } from './hooks/useAuth';            

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/Layout'; 

// Pages dos PowerBI's
import Faturamento from './pages/PowerBI/Faturamento';
import PMO from './pages/PowerBI/PMO';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth(); // Aqui usamos o hook novo

  if (loading) {
    return <div>Carregando...</div>; 
  }

  return signed ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      {/* O AuthProvider precisa estar aqui envolvendo tudo */}
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
            </Route>

            <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="pbi/faturamento" element={<Faturamento />} />
              <Route path="pbi/pmo" element={<PMO />} />
            </Route>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;
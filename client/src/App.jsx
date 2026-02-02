import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';

// --- CONTEXTOS E HOOKS ---
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext'; // Importar
import { useAuth } from './hooks/useAuth';

// --- PÁGINAS PÚBLICAS ---
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

// --- LAYOUT E PÁGINAS PRIVADAS ---
import MainLayout from './components/Layout';
import Dashboard from './pages/Dashboard';

// Pages dos PowerBI's
import DynamicPowerBI from './pages/PowerBI/DynamicPowerBI';
import Welcome from './pages/Analytics/Welcome';
import QueryBuilder from './pages/Analytics/QueryBuilder';
import DataPreview from './pages/Analytics/DataPreview';
import PromptBuilder from './pages/Analytics/PromptBuilder';
import AnalysisResults from './pages/Analytics/AnalysisResults';
import AiAnalytics from './pages/AiAnalytics'; // [NEW]

// --- NOVA PÁGINA DE ADMIN ---
// Certifique-se que o arquivo está em: client/src/pages/Admin/Users/index.jsx
import UsersList from './pages/Admin/Users';

//Página do Profile
import Profile from './pages/Profile';

//Página de Aprovações de Usuário
import Approvals from './pages/Admin/Approvals';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    // Você pode substituir isso por um componente de Loading (CircularProgress) mais bonito depois
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <AuthProvider>
        <AnalyticsProvider>
          <BrowserRouter basename={import.meta.env.VITE_BASE_PATH || ""}>
            <Routes>
              {/* --- ROTAS PÚBLICAS (Fora do Layout Principal) --- */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* --- ROTAS PRIVADAS (Dentro do Layout Principal) --- */}
              {/* Unificamos tudo neste bloco único */}
              <Route path="/" element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }>
                {/* Rota Index (Dashboard) */}
                <Route index element={<Dashboard />} />

                {/* Rota de Analytics */}
                <Route path="/analytics" element={<Welcome />} />
                <Route path="/analytics/builder" element={<QueryBuilder />} />
                <Route path="/analytics/preview" element={<DataPreview />} />
                <Route path="/analytics/prompt" element={<PromptBuilder />} />
                <Route path="/analytics/results" element={<AnalysisResults />} />
                <Route path="/ai-analytics" element={<AiAnalytics />} /> {/* [NEW] */}

                {/* Rota de Admin (Nova) */}
                <Route path="admin/users" element={<UsersList />} />
                <Route path="/admin/approvals" element={<Approvals />} />

                {/*Rota de Profile*/}
                <Route path="/profile" element={<Profile />} />

                {/* Rotas de Power BI */}
                {/* Todas as rotas PBI agora usam o componente dinâmico */}
                <Route path="pbi/:key" element={<DynamicPowerBI />} />

              </Route>

            </Routes>
          </BrowserRouter>
        </AnalyticsProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress 
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark.png';
import { useTheme } from '../../hooks/useTheme';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { mode } = useTheme();

  // 1. Captura o token da URL (?token=...)
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Se o usuário tentar acessar essa tela sem token, joga ele pro login
  useEffect(() => {
    if (!token) {
      alert('Link inválido. Inicie o processo novamente.');
      navigate('/login');
    }
  }, [token, navigate]);

  async function handleReset(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('As senhas não conferem.');
    }
    
    if (password.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres.');
    }

    setLoading(true);

    try {
      // 2. Envia Token + Nova Senha para o Backend
      await api.post('/auth/reset-password', {
        token, 
        newPassword: password
      });

      setSuccess(true);
      
      // Espera 2 segundos mostrando sucesso antes de ir pro login
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Erro ao redefinir senha. O link pode ter expirado.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: 'background.default' 
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
          
          <Box sx={{ mb: 2 }}>
             <img 
               src={mode === 'dark' ? logoDark : logoLight} 
               alt="Sandech" 
               style={{ maxWidth: '180px', height: 'auto' }} 
             />
          </Box>

          <Typography component="h1" variant="h5" color="textPrimary" sx={{ mb: 3, fontWeight: 'bold' }}>
            Redefinir Senha
          </Typography>

          {/* Feedback de Erro */}
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          {/* Feedback de Sucesso (Esconde o form) */}
          {success ? (
            <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
              Senha alterada com sucesso! <br/>
              Redirecionando para o login...
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleReset} sx={{ width: '100%' }}>
              <TextField
                margin="normal" required fullWidth label="Nova Senha"
                type="password" autoFocus
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal" required fullWidth label="Confirmar Nova Senha"
                type="password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading} sx={{ mt: 3, mb: 2, height: 48 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Nova Senha'}
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
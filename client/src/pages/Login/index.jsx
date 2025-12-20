import React, { useState } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress 
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);

    try {
      await signIn(email, password);
      navigate('/'); // Redireciona para o Dashboard após sucesso
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoadingLocal(false);
    }
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F6F8', // Cor de fundo suave
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          {/* Logo da Empresa (Simulado com Texto ou Ícone por enquanto) */}
          <Typography component="h1" variant="h4" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
            PMO HUB
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Acesso Corporativo Sandech
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-mail Corporativo"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loadingLocal}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loadingLocal ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>
        </Paper>
        
        <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          &copy; {new Date().getFullYear()} Sandech Engenharia. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
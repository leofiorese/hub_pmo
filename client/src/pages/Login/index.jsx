import React, { useState } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress, 
  Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

import { useTheme } from '../../hooks/useTheme'; 
import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark.png';

import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const { mode } = useTheme(); 

  // --- NOVO: Estilo personalizado para os Inputs no Dark Mode ---
  const customInputStyle = {
    // Cor do texto digitado
    '& .MuiInputBase-input': { 
      color: mode === 'dark' ? '#fff' : 'inherit' 
    },
    // Cor do Label (Título do campo)
    '& .MuiInputLabel-root': { 
      color: mode === 'dark' ? '#b0bec5' : 'inherit' 
    },
    // Cor do Label quando focado
    '& .MuiInputLabel-root.Mui-focused': { 
      color: mode === 'dark' ? '#fff' : 'primary.main' 
    },
    // Cor das bordas e ícones
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
      },
      '&:hover fieldset': {
        borderColor: mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.87)',
      },
    },
    '& .MuiSvgIcon-root': {
      color: mode === 'dark' ? '#b0bec5' : 'inherit'
    }
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoadingLocal(true);

    try {
      await signIn(email, password);
      navigate('/'); 
    } catch (err) {
      console.error(err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoadingLocal(false);
    }
  }

  const handleRecoverySubmit = async () => {
    try {
      await api.post('/auth/forgot-password', { email: recoveryEmail });
      
      alert('Se o e-mail existir, enviamos um link de recuperação (Olhe o console do backend).');
      setForgotOpen(false);
      setRecoveryEmail('');
    } catch (err) {
      console.error(err);
      alert('Erro ao solicitar recuperação. Tente novamente.');
    }
  };

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
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            borderRadius: 2,
            bgcolor: 'background.paper' // Garante a cor correta do cartão
          }}
        >
          
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img 
              src={mode === 'dark' ? logoDark : logoLight} 
              alt="Sandech Engenharia" 
              style={{ 
                maxWidth: '200px', 
                height: 'auto',
                display: 'block' 
              }} 
            />
          </Box>

          <Typography component="h1" variant="h5" color="textPrimary" sx={{ fontWeight: 500, mb: 3 }}>
            Acesso ao PMO HUB
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal" required fullWidth label="E-mail Corporativo"
              name="email" autoComplete="email" autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={customInputStyle} // Aplicando o estilo aqui
            />
            <TextField
              margin="normal" required fullWidth label="Senha"
              name="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={customInputStyle} // Aplicando o estilo aqui
            />
            
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loadingLocal} sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loadingLocal ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
              <MuiLink 
                component="button" type="button" variant="body2" 
                onClick={() => setForgotOpen(true)} underline="hover"
                // Ajuste de cor condicional: Cinza claro no Dark, Vermelho no Light
                sx={{ color: mode === 'dark' ? 'text.secondary' : 'primary.main' }}
              >
                Esqueceu a senha?
              </MuiLink>

              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  // Ajuste de cor condicional
                  sx={{ 
                    fontWeight: 500, 
                    color: mode === 'dark' ? 'text.secondary' : 'primary.main',
                    '&:hover': { 
                      textDecoration: 'underline', 
                      color: mode === 'dark' ? '#fff' : 'primary.dark' 
                    } 
                  }}
                >
                  Cadastrar-se
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
        
        <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          &copy; {new Date().getFullYear()}  SANDECH Consultoria em Engenharia e Gestão Ltda.
        </Typography>
      </Container>

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)}>
        <DialogTitle>Recuperar Senha</DialogTitle>
        <DialogContent>
          <DialogContentText>Digite seu e-mail corporativo.</DialogContentText>
          <TextField
            autoFocus margin="dense" id="recovery-email" label="Endereço de E-mail"
            type="email" fullWidth variant="standard"
            value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)}>Cancelar</Button>
          <Button onClick={handleRecoverySubmit} variant="contained">Enviar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
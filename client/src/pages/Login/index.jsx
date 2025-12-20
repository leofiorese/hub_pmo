import React, { useState } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress, 
  Grid, Link as MuiLink, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom'; // Import do Link do router

import { useTheme } from '../../hooks/useTheme'; // Para saber se é dark/light
import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark.png';

import api from '../../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingLocal, setLoadingLocal] = useState(false);
  
  // Estados para recuperação de senha
  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  // --- USO DO TEMA ---
  const { mode } = useTheme(); // Pega o modo atual (light ou dark)

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
      // ESTA LINHA É A QUE CHAMA O BACKEND
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
        // Agora o fundo respeita o tema (Cinza claro ou Preto suave)
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
            borderRadius: 2 
          }}
        >
          
          {/* --- ÁREA DA LOGO --- */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img 
              src={mode === 'dark' ? logoDark : logoLight} 
              alt="Sandech Engenharia" 
              style={{ 
                maxWidth: '200px', // Ajuste o tamanho conforme necessário
                height: 'auto',
                display: 'block' 
              }} 
            />
          </Box>
          {/* -------------------- */}

          <Typography component="h1" variant="h5" color="textPrimary" sx={{ fontWeight: 500, mb: 3 }}>
            Acesso ao PMO HUB
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal" required fullWidth label="E-mail Corporativo"
              name="email" autoComplete="email" autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal" required fullWidth label="Senha"
              name="password" type="password" autoComplete="current-password"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loadingLocal} sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loadingLocal ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
            
            {/* Links Auxiliares (Com o espaçamento corrigido) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 2 }}>
              <MuiLink 
                component="button" type="button" variant="body2" 
                onClick={() => setForgotOpen(true)} underline="hover"
              >
                Esqueceu a senha?
              </MuiLink>

              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                  Cadastrar-se
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
        
        <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
          &copy; {new Date().getFullYear()}  SANDECH Consultoria em Engenharia e Gestão Ltda..
        </Typography>
      </Container>

      {/* Modal de Recuperação (Igual ao anterior) */}
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
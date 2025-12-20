import React, { useState } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress, Link as MuiLink 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import api from  '../../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
      e.preventDefault();
      setError('');

      if (!formData.email.toLowerCase().endsWith('@sandech.com.br')) {
      return setError('Cadastro permitido apenas para e-mails corporativos (@sandech.com.br).');
    }

      if (formData.password !== formData.confirmPassword) {
        return setError('As senhas não coincidem.');
      }

      setLoading(true);

      try {
        // CHAMADA REAL AO BACKEND
        await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        alert('Cadastro realizado com sucesso! Faça login.');
        navigate('/login');
        
      } catch (err) {
        console.error(err);
        // Se o backend retornar erro (ex: email duplicado), mostramos aqui
        const msg = err.response?.data?.error || 'Erro ao realizar cadastro.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F4F6F8' }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
          <Typography component="h1" variant="h5" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
            Nova Conta
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
            <TextField
              margin="normal" required fullWidth label="Nome Completo"
              name="name" autoFocus
              value={formData.name} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth label="E-mail Corporativo"
              name="email" type="email"
              value={formData.email} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth label="Senha"
              name="password" type="password"
              value={formData.password} onChange={handleChange}
            />
            <TextField
              margin="normal" required fullWidth label="Confirmar Senha"
              name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
            />
            
            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={loading} sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Solicitar Acesso'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Já possui conta? Faça Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Paper, Typography, TextField, Button, Alert, Divider 
} from '@mui/material';
import { DeleteForever, Save } from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { signOut, user, setUser } = useAuth(); // setUser para atualizar o nome na Topbar

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados
  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/profile/me');
        // Preenche o formulário. Se vier null/undefined, usa string vazia
        setFormData(prev => ({
          ...prev,
          name: response.data.name || '',
          email: response.data.email || ''
        }));
      } catch (error) {
        console.error("Erro ao carregar perfil", error);
        setFeedback({ type: 'error', message: 'Erro ao carregar dados do perfil.' });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setFeedback({ type: '', message: '' });
    
    if (formData.password || formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
            setFeedback({ type: 'error', message: 'As senhas não conferem.' });
            return;
        }
    }

    setSaving(true);
    try {
      const response = await api.put('/profile/me', {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined // Aqui o JS undefined é removido pelo JSON.stringify, tudo bem
      });
      
      setFeedback({ type: 'success', message: 'Dados atualizados com sucesso!' });
      
      // Limpa campos de senha
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Atualiza o contexto global se a função setUser existir (atualiza Topbar)
      if (setUser) {
          // Mantém o token antigo, mas atualiza os dados do user
          setUser(oldUser => ({ ...oldUser, name: response.data.name, email: response.data.email }));
      }

    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Erro ao atualizar perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      "TEM CERTEZA ABSOLUTA?\n\nAo excluir sua conta, você perderá acesso ao sistema imediatamente. Essa ação é irreversível."
    );

    if (confirm) {
      try {
        await api.delete('/profile/me');
        alert('Sua conta foi excluída.');
        signOut(); 
      } catch (error) {
        alert('Erro ao excluir conta.');
      }
    }
  };

  if (loading) return <Box p={4}>Carregando...</Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
          Editar Informações
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Atualize seus dados pessoais ou gerencie sua conta.
        </Typography>

        {feedback.message && (
          <Alert severity={feedback.type} sx={{ mb: 3 }}>{feedback.message}</Alert>
        )}

        <Box component="form" noValidate autoComplete="off">
          <TextField
            label="Nome Completo" fullWidth margin="normal" variant="outlined"
            value={formData.name}
            // Garante que o input nunca receba undefined
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          
          <TextField
            label="E-mail" fullWidth margin="normal" variant="outlined"
            value={formData.email}
            // Habilitado agora!
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" gutterBottom color="primary">
             Alterar Senha (opcional)
          </Typography>
          
          <TextField
            label="Nova Senha" type="password" fullWidth margin="dense" variant="outlined"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <TextField
            label="Confirmar Senha" type="password" fullWidth margin="dense" variant="outlined"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          />

          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteForever />}
              onClick={handleDeleteAccount}
            >
              Excluir Minha Conta
            </Button>

            <Button 
              variant="contained" 
              size="large"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 150 }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
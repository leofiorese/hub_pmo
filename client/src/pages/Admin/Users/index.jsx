import React, { useState, useEffect } from 'react';
import {
  Box, Container, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, MenuItem, FormControl, InputLabel, Select, Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, CheckCircle, Cancel } from '@mui/icons-material';
import api from '../../../services/api';

// Configuração visual das Roles (Cores)
const roleConfig = {
  admin: { label: 'Administrador', color: 'error' },   // Vermelho
  pmo: { label: 'PMO', color: 'warning' },             // Laranja
  viewer: { label: 'Visualizador', color: 'default' }  // Cinza
};

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Modal de Edição
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '' 
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  // 1. Carregar Usuários ao abrir a tela
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários', error);
    } finally {
      setLoading(false);
    }
  }

  // 2. Abrir Modal de Edição
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Senha começa vazia (só preenche se quiser alterar)
    });
    setFeedback({ type: '', message: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentUser(null);
  };

  // 3. Salvar Alterações
  const handleSave = async () => {
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      // Envia para o backend (PUT /api/admin/users/:id)
      await api.put(`/admin/users/${currentUser.id}`, formData);
      
      setFeedback({ type: 'success', message: 'Usuário atualizado com sucesso!' });
      loadUsers(); // Recarrega a lista para mostrar os dados novos
      
      setTimeout(() => {
        handleClose();
      }, 1500);
      
    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao atualizar usuário.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Gerenciamento de Usuários
          </Typography>

          {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
             </Box>
          ) : (
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell align="center">Permissão (Role)</TableCell>
                    <TableCell align="center">Verificado</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={roleConfig[user.role]?.label || user.role} 
                          color={roleConfig[user.role]?.color || 'default'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {user.is_verified ? 
                          <CheckCircle color="success" fontSize="small"/> : 
                          <Cancel color="disabled" fontSize="small"/>
                        }
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleEditClick(user)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Editar Usuário</DialogTitle>
        <DialogContent dividers>
          {feedback.message && (
            <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>
          )}

          <TextField
            margin="dense" label="Nome Completo" fullWidth variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense" label="E-mail" fullWidth variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nível de Permissão (Role)</InputLabel>
            <Select
              value={formData.role}
              label="Nível de Permissão (Role)"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <MenuItem value="admin">Administrador (Acesso Total)</MenuItem>
              <MenuItem value="pmo">PMO (Gestão)</MenuItem>
              <MenuItem value="viewer">Visualizador (Apenas Leitura)</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Redefinir Senha
            </Typography>
            <Typography variant="caption" display="block" sx={{ mb: 1 }}>
              Deixe em branco se não quiser alterar a senha do usuário.
            </Typography>
            <TextField
              label="Nova Senha" type="password" fullWidth variant="outlined"
              placeholder="Digite para forçar uma nova senha"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </Box>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
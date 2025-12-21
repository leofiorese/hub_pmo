import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, 
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, Alert, Tooltip 
} from '@mui/material';
import { Menu as MenuIcon, ExitToApp as LogoutIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api'; // Certifique-se que o caminho da api está correto

const Topbar = ({ handleDrawerToggle, drawerWidth }) => {
  // Adicionamos setUser para poder atualizar o nome na tela instantaneamente
  const { user, signOut, setUser } = useAuth(); 

  // --- Estados para o Menu do Avatar ---
  const [anchorEl, setAnchorEl] = useState(null);
  
  // --- Estados para o Modal de Edição ---
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Handlers do Menu
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Handlers do Modal
  const handleOpenProfile = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: ''
    });
    setFeedback({ type: '', message: '' });
    setOpenDialog(true);
    handleMenuClose(); // Fecha o menu do avatar
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setFeedback({ type: '', message: '' });

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setFeedback({ type: 'error', message: 'As senhas não conferem.' });
    }

    setLoading(true);

    try {
      // Chama a rota de atualização (Lembre-se de criar no backend: PUT /users/profile)
      const response = await api.put('/users/profile', {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined 
      });

      setFeedback({ type: 'success', message: 'Perfil atualizado com sucesso!' });
      
      // Atualiza o contexto global se a função existir
      if (setUser) {
        setUser({ ...user, ...response.data });
      }

      setTimeout(() => {
        setOpenDialog(false);
        setFeedback({ type: '', message: '' });
      }, 1500);

    } catch (error) {
      const msg = error.response?.data?.error || 'Erro ao atualizar perfil.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'primary.main', // Mantido seu vermelho Sandech
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            PMO HUB
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
              Olá, {user?.name || 'Colaborador'}
            </Typography>

            {/* Avatar agora é clicável e abre o menu */}
            <Tooltip title="Opções de Conta">
              <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Botão de Sair mantido separado conforme seu original */}
            <IconButton color="inherit" onClick={signOut} title="Sair">
              <LogoutIcon />
            </IconButton>

            {/* Menu Dropdown oculto atrelado ao Avatar */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5 }
              }}
            >
              <MenuItem onClick={handleOpenProfile}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Editar Perfil
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- Modal (Dialog) de Edição --- */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Editar Informações</DialogTitle>
        <DialogContent>
          {feedback.message && (
            <Alert severity={feedback.type} sx={{ mb: 2, mt: 1 }}>
              {feedback.message}
            </Alert>
          )}

          <TextField
            margin="dense" label="Nome" name="name" fullWidth variant="outlined"
            value={formData.name} onChange={handleChange}
          />
          <TextField
            margin="dense" label="E-mail" name="email" type="email" fullWidth variant="outlined"
            value={formData.email} onChange={handleChange}
          />

          <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
            Alterar Senha (opcional)
          </Typography>

          <TextField
            margin="dense" label="Nova Senha" name="password" type="password" fullWidth variant="outlined"
            value={formData.password} onChange={handleChange}
          />
          <TextField
            margin="dense" label="Confirmar Senha" name="confirmPassword" type="password" fullWidth variant="outlined"
            value={formData.confirmPassword} onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancelar</Button>
          <Button onClick={handleSaveProfile} variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Topbar;
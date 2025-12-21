import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, 
  Menu, MenuItem, Tooltip, ListItemIcon 
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ExitToApp as LogoutIcon, 
  Person as PersonIcon // <--- Ícone mais adequado para "Minha Conta"
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // <--- Importante para navegação

const Topbar = ({ handleDrawerToggle, drawerWidth }) => {
  const { user, signOut } = useAuth(); 
  const navigate = useNavigate(); // <--- Hook de navegação
  
  // --- Estados do Menu ---
  const [anchorEl, setAnchorEl] = useState(null);

  // Handlers
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Redireciona para a nova página de Perfil
  const handleGoToProfile = () => {
    handleMenuClose();
    navigate('/profile'); // <--- Leva para a página que criamos antes
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main',
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

          {/* Avatar com Tooltip */}
          <Tooltip title="Opções de Conta">
            <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Botão de Sair Rápido (Opcional, já tem no menu, mas mantive do seu código) */}
          <IconButton color="inherit" onClick={signOut} title="Sair">
            <LogoutIcon />
          </IconButton>

          {/* Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1.5, minWidth: 150 }
            }}
          >
            {/* Opção 1: Minha Conta */}
            <MenuItem onClick={handleGoToProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Minha Conta
            </MenuItem>

            {/* Opção 2: Sair */}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
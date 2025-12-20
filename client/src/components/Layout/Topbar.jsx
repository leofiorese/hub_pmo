import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from '@mui/material';
import { Menu as MenuIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Topbar = ({ handleDrawerToggle, drawerWidth }) => {
  const { user, signOut } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'primary.main', // Vermelho Sandech definido no theme
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
          <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <IconButton color="inherit" onClick={signOut} title="Sair">
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
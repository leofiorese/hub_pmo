import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, Avatar,
  Menu, MenuItem, Tooltip, ListItemIcon, useTheme, alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ handleDrawerToggle, drawerWidth }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleGoToProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        color: 'text.primary',
        transition: 'width 0.3s'
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

        <Typography
          variant="h5"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          HUB PMO
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, fontWeight: 600 }}>
            Olá, {user?.name || 'Colaborador'}
          </Typography>

          <Tooltip title="Opções de Conta">
            <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0, border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.9rem', fontWeight: 'bold' }}>
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 4,
              sx: { mt: 1.5, minWidth: 180, borderRadius: 3 }
            }}
          >
            <MenuItem onClick={handleGoToProfile} sx={{ borderRadius: 1, m: 0.5 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              Minha Conta
            </MenuItem>

            <MenuItem onClick={handleLogout} sx={{ borderRadius: 1, m: 0.5 }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Sair</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
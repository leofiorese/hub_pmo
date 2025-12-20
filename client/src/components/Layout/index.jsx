import React, { useState } from 'react';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Sidebar from './Sidebar';

// Definição das larguras
const DRAWER_WIDTH = 260;
const MINI_DRAWER_WIDTH = 70;

const MainLayout = () => {
  const theme = useTheme();
  // Detecta se é mobile (telas menores que 'sm')
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado para Mobile (Menu gaveta temporário)
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Estado para Desktop (Expandido ou Colapsado)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Handler Mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handler Desktop (Minimizar/Maximizar)
  const handleSidebarToggle = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Calcula a largura atual baseada no estado
  const currentDrawerWidth = isSidebarExpanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Header */}
      <Topbar 
        handleDrawerToggle={handleDrawerToggle} 
        drawerWidth={currentDrawerWidth} // Passamos a largura dinâmica para a Topbar se ajustar
      />
      
      {/* Navegação Lateral */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle}
        
        // Props novas para o controle de colapso
        isExpanded={isSidebarExpanded}
        toggleSidebar={handleSidebarToggle}
        drawerWidth={DRAWER_WIDTH}
        miniDrawerWidth={MINI_DRAWER_WIDTH}
      />
      
      {/* Área de Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          // A mágica acontece aqui: A margem esquerda muda suavemente
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: 0 }, // O Drawer permanente já ocupa espaço no DOM, não precisa de margin-left se for "flex"
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Box sx={{ height: 64 }} /> 
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
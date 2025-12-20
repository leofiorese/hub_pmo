import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, Typography, Divider, ListItemButton, 
  ListItemIcon, ListItemText, Collapse, Dialog, DialogTitle, 
  DialogContent, DialogContentText, DialogActions, Button, Switch, IconButton, Tooltip
} from '@mui/material';
import { 
  Dashboard, ExpandLess, ExpandMore, BarChart, 
  TableChart, Settings, OpenInNew, Brightness4, Brightness7,
  ChevronLeft, ChevronRight // Ícones novos
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark.png';

const excelTools = [
  { title: 'Backlog', url: 'https://sandechnew.sharepoint.com/:x:/s/PMO738/IQB4-9BhruDURLPec3qeX30FAYE4bQldzMtuM9iQtKHG-fQ?e=oAlMm5' },
  { title: "Controle ART's", url: 'https://sandechnew.sharepoint.com/:x:/s/PMO738/IQCPXC7ITrjuTr8DMABKXLRmAU67rBPVme1UTSbMAqSc1V8?e=5IOrOL' },
  { title: 'Planilha de Faturamento', url: 'https://sandechnew.sharepoint.com/:x:/s/PMO738/IQC0VWDIEV0LQYPjoDsKhK0gAfZK3ya1wBA_YvNlmLiL9sI?e=UucQfv' }
];

const Sidebar = ({ 
  mobileOpen, handleDrawerToggle, drawerWidth, miniDrawerWidth, 
  isExpanded, toggleSidebar // Recebendo as novas props
}) => {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useTheme();
  
  const [openPowerBI, setOpenPowerBI] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  // Efeito: Se o usuário minimizar a barra, fechamos os menus expansíveis para não bugar o visual
  useEffect(() => {
    if (!isExpanded) {
      setOpenPowerBI(false);
      setOpenExcel(false);
    }
  }, [isExpanded]);

  // Função auxiliar para lidar com cliques nos grupos quando minimizado
  const handleGroupClick = (isOpen, setOpen) => {
    if (!isExpanded) {
      // Se estiver minimizado e clicar no ícone, expande a barra primeiro
      toggleSidebar();
      setOpen(true);
    } else {
      setOpen(!isOpen);
    }
  };

  const handleExcelClick = (url) => {
    setTargetUrl(url);
    setDialogOpen(true);
  };

  const handleConfirmRedirect = () => {
    if (targetUrl) window.open(targetUrl, '_blank');
    setDialogOpen(false);
  };

  // Conteúdo interno da sidebar
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 1. Header da Logo */}
      <Box 
        sx={{ 
          minHeight: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 1,
          overflow: 'hidden' // Impede logo de vazar quando pequeno
        }} 
      >
        {isExpanded ? (
           <img 
             src={mode === 'dark' ? logoDark : logoLight} 
             alt="Logo Sandech" 
             style={{ maxWidth: '140px', height: 'auto', transition: '0.3s' }} 
           />
        ) : (
           // Quando minimizado, mostra só a primeira letra ou um ícone pequeno
           <Typography variant="h6" fontWeight="bold" color="primary">
             S
           </Typography>
        )}
      </Box>
      
      <Divider />
      
      <List sx={{ flexGrow: 1 }}>
        {/* Item Simples */}
        <Tooltip title={!isExpanded ? "Visão Geral" : ""} placement="right">
          <ListItemButton onClick={() => navigate('/')} sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <Dashboard color="primary"/>
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Visão Geral" />}
          </ListItemButton>
        </Tooltip>

        {/* Item Power BI (Expansível) */}
        <Tooltip title={!isExpanded ? "Power BI" : ""} placement="right">
          <ListItemButton 
            onClick={() => handleGroupClick(openPowerBI, setOpenPowerBI)}
            sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <BarChart />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Power BI" />}
            {isExpanded && (openPowerBI ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>
        {/* Submenu só renderiza se estiver expandido (UX) */}
        <Collapse in={openPowerBI && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/pbi/faturamento')}>
              <ListItemText primary="Faturamento" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/pbi/pmo')}>
              <ListItemText primary="Dashboard PMO" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Item Excel (Expansível) */}
        <Tooltip title={!isExpanded ? "Excel Online" : ""} placement="right">
          <ListItemButton 
            onClick={() => handleGroupClick(openExcel, setOpenExcel)}
            sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <TableChart />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Excel Online" />}
            {isExpanded && (openExcel ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>
        <Collapse in={openExcel && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {excelTools.map((tool) => (
              <ListItemButton key={tool.title} sx={{ pl: 4 }} onClick={() => handleExcelClick(tool.url)}>
                <ListItemText primary={tool.title} />
                <OpenInNew color="action" sx={{ fontSize: 16, opacity: 0.6 }} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />

        {/* Toggle Dark Mode */}
        <Tooltip title={!isExpanded ? "Mudar Tema" : ""} placement="right">
          <ListItemButton onClick={toggleColorMode} sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Modo Escuro" />}
            {isExpanded && (
              <Switch edge="end" checked={mode === 'dark'} inputProps={{ 'aria-label': 'controle de tema' }} sx={{ pointerEvents: 'none' }} />
            )}
          </ListItemButton>
        </Tooltip>
      </List>

      {/* Botão de Colapso (Fixo no rodapé da sidebar) */}
      <Divider />
      <Box sx={{ p: 1, display: 'flex', justifyContent: isExpanded ? 'flex-end' : 'center' }}>
        <IconButton onClick={toggleSidebar}>
          {isExpanded ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: isExpanded ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}>
      {/* Mobile Drawer (Sempre funciona igual, não minimiza) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer (Controlado por isExpanded) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: isExpanded ? drawerWidth : miniDrawerWidth,
            transition: 'width 0.3s', // Animação suave
            overflowX: 'hidden'       // Evita barra de rolagem horizontal durante animação
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Redirecionamento Externo</DialogTitle>
        <DialogContent>
          <DialogContentText>Você será redirecionado para o Excel Online. Deseja continuar?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleConfirmRedirect} variant="contained" autoFocus>Continuar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
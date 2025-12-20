import React, { useState } from 'react';
import { 
  Box, Drawer, List, Typography, Divider, ListItemButton, 
  ListItemIcon, ListItemText, Collapse 
} from '@mui/material';
import { 
  Dashboard, ExpandLess, ExpandMore, BarChart, 
  TableChart, Description, Settings 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  
  // Estado para controlar os menus expansíveis
  const [openPowerBI, setOpenPowerBI] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);

  // Conteúdo do Menu
  const drawerContent = (
    <div>
      <ToolbarPlaceholder /> 
      <Box sx={{ p: 2, textAlign: 'center' }}>
         {/* Espaço para Logo da Sandech */}
         <Typography variant="h6" color="primary" fontWeight="bold">SANDECH</Typography>
         <Typography variant="caption">Engenharia e Gestão</Typography>
      </Box>
      <Divider />
      
      <List>
        {/* Dashboard Principal */}
        <ListItemButton onClick={() => navigate('/')}>
          <ListItemIcon><Dashboard color="primary"/></ListItemIcon>
          <ListItemText primary="Visão Geral" />
        </ListItemButton>

        {/* Grupo Power BI */}
        <ListItemButton onClick={() => setOpenPowerBI(!openPowerBI)}>
          <ListItemIcon><BarChart /></ListItemIcon>
          <ListItemText primary="Power BI" />
          {openPowerBI ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openPowerBI} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/pbi/faturamento')}>
              <ListItemText primary="Dashboard Faturamento" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/pbi/pmo')}>
              <ListItemText primary="Dashboard PMO" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Grupo Excel Online */}
        <ListItemButton onClick={() => setOpenExcel(!openExcel)}>
          <ListItemIcon><TableChart /></ListItemIcon>
          <ListItemText primary="Excel Online" />
          {openExcel ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openExcel} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {['Backlog', 'Controle ARTs', 'Colaboradores'].map((text) => (
              <ListItemButton key={text} sx={{ pl: 4 }}>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <Divider sx={{ my: 1 }} />
        
        <ListItemButton>
           <ListItemIcon><Settings /></ListItemIcon>
           <ListItemText primary="Configurações" />
        </ListItemButton>
      </List>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      {/* Drawer Mobile (Temporário) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Drawer Desktop (Fixo) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

// Componente utilitário para empurrar o conteúdo para baixo da AppBar
const ToolbarPlaceholder = () => <Box sx={{ minHeight: 64 }} />;

export default Sidebar;
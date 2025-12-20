import React, { useState } from 'react';
import { 
  Box, Drawer, List, Typography, Divider, ListItemButton, 
  ListItemIcon, ListItemText, Collapse, Dialog, DialogTitle, 
  DialogContent, DialogContentText, DialogActions, Button 
} from '@mui/material';
import { 
  Dashboard, ExpandLess, ExpandMore, BarChart, 
  TableChart, Settings, OpenInNew // Importamos o ícone de link externo
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Configuração dos Links do Excel (Fácil de manter)
const excelTools = [
  { 
    title: 'Backlog', 
    url: 'https://sandechnew.sharepoint.com/:x:/s/PMO738/IQB4-9BhruDURLPec3qeX30FAYE4bQldzMtuM9iQtKHG-fQ?e=oAlMm5' 
  },
  { 
    title: "Controle ART's", 
    url: 'https://sandechnew.sharepoint.com/:x:/s/PMO738/IQCPXC7ITrjuTr8DMABKXLRmAU67rBPVme1UTSbMAqSc1V8?e=5IOrOL' 
  },
  { 
    title: 'Planilha de Faturamento', 
    url: 'https://sandechnew.sharepoint.com/:x:/s/PMO738/IQC0VWDIEV0LQYPjoDsKhK0gAfZK3ya1wBA_YvNlmLiL9sI?e=UucQfv' 
  }
];

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  
  // Estados dos Menus Expansíveis
  const [openPowerBI, setOpenPowerBI] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);

  // Estados do Pop-up de Redirecionamento
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  // Handler: Quando clica no item do Excel
  const handleExcelClick = (url) => {
    setTargetUrl(url);
    setDialogOpen(true); // Abre o pop-up
  };

  // Handler: Quando confirma no Pop-up
  const handleConfirmRedirect = () => {
    if (targetUrl) {
      window.open(targetUrl, '_blank'); // Abre em nova aba
    }
    setDialogOpen(false); // Fecha o pop-up
  };

  const drawerContent = (
    <div>
      <ToolbarPlaceholder /> 
      <Box sx={{ p: 2, textAlign: 'center' }}>
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
              <ListItemText primary="Faturamento" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => navigate('/pbi/pmo')}>
              <ListItemText primary="Dashboard PMO" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Grupo Excel Online (Com Links Externos) */}
        <ListItemButton onClick={() => setOpenExcel(!openExcel)}>
          <ListItemIcon><TableChart /></ListItemIcon>
          <ListItemText primary="Excel Online" />
          {openExcel ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openExcel} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {excelTools.map((tool) => (
              <ListItemButton 
                key={tool.title} 
                sx={{ pl: 4 }} 
                onClick={() => handleExcelClick(tool.url)}
              >
                {/* Texto do Item */}
                <ListItemText primary={tool.title} />
                
                {/* Requisito 1: Ícone de Link Externo */}
                <OpenInNew color="action" sx={{ fontSize: 16, opacity: 0.6 }} />
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
      {/* Drawer Mobile */}
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
      
      {/* Drawer Desktop */}
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

      {/* --- Requisito 3: O Pop-up de Confirmação --- */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Redirecionamento Externo"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você está sendo redirecionado para uma planilha do Excel Online (SharePoint).
            <br /><br />
            Deseja continuar e abrir o link em uma nova aba?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirmRedirect} variant="contained" autoFocus>
            Continuar
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

const ToolbarPlaceholder = () => <Box sx={{ minHeight: 64 }} />;

export default Sidebar;
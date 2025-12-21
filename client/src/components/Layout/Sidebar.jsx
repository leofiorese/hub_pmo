import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, Typography, Divider, ListItemButton, 
  ListItemIcon, ListItemText, Collapse, Dialog, DialogTitle, 
  DialogContent, DialogContentText, DialogActions, Button, Switch, IconButton, Tooltip, TextField
} from '@mui/material';
import { 
  Dashboard, ExpandLess, ExpandMore, BarChart, 
  TableChart, OpenInNew, Brightness4, Brightness7,
  ChevronLeft, ChevronRight, BusinessCenter,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api'; 

import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark.png';

// Configuração APENAS dos Títulos e Chaves (URLs vêm do banco agora)
const excelToolsConfig = [
  { title: 'Backlog', key: 'excel_backlog' },
  { title: "Controle ART's", key: 'excel_art' },
  { title: 'Planilha de Faturamento', key: 'excel_faturamento' }
];

const Sidebar = ({ 
  mobileOpen, handleDrawerToggle, drawerWidth, miniDrawerWidth, 
  isExpanded, toggleSidebar 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useTheme();
  const { user } = useAuth();
  
  const [openPowerBI, setOpenPowerBI] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);
  
  // Dialog de Redirecionamento (Existente)
  const [redirectDialog, setRedirectDialog] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  // Dialog de Edição (Novo)
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({ key: '', url: '' });
  const [saving, setSaving] = useState(false);

  // Estado para guardar os links vindos do banco
  const [links, setLinks] = useState({});

  // 1. Busca os links no banco ao iniciar
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/links');
      setLinks(response.data); // Guarda { psoffice: 'http...', excel_art: 'http...' }
    } catch (error) {
      console.error('Erro ao buscar links da sidebar', error);
    }
  };

  useEffect(() => {
    if (location.pathname.includes('/pbi')) setOpenPowerBI(true);
    if (!isExpanded) {
      setOpenPowerBI(false);
      setOpenExcel(false);
    }
  }, [isExpanded, location.pathname]);

  const handleGroupClick = (isOpen, setOpen) => {
    if (!isExpanded) {
      toggleSidebar();
      setOpen(true);
    } else {
      setOpen(!isOpen);
    }
  };

  // Abre o link do Excel (Visualizador Comum)
  const handleExcelClick = (key) => {
    const url = links[key];
    if (url) {
        setTargetUrl(url);
        setRedirectDialog(true);
    } else {
        alert('Link não configurado.');
    }
  };

  // Abre o Modal de Edição (Admin ou PMO)
  const handleEditLink = (e, key) => {
    e.stopPropagation(); // IMPORTANTE: Impede que o clique no lápis abra o link
    e.preventDefault();  // Previne comportamento padrão de links
    setEditData({ key, url: links[key] || '' });
    setEditDialog(true);
  };

  // Salva a edição
  const saveLink = async () => {
    setSaving(true);
    try {
        await api.put(`/admin/links/${editData.key}`, { url: editData.url });
        // Atualiza o estado local imediatamente
        setLinks(prev => ({ ...prev, [editData.key]: editData.url }));
        setEditDialog(false);
    } catch (error) {
        alert('Erro ao atualizar link.');
    } finally {
        setSaving(false);
    }
  };

  const handleConfirmRedirect = () => {
    if (targetUrl) window.open(targetUrl, '_blank');
    setRedirectDialog(false);
  };

  const getButtonStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      justifyContent: isExpanded ? 'initial' : 'center',
      bgcolor: isActive ? 'action.selected' : 'transparent',
      borderLeft: '4px solid',
      borderLeftColor: isActive ? 'error.main' : 'transparent',
      '&:hover': { bgcolor: 'action.hover' }
    };
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ minHeight: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1, overflow: 'hidden' }}>
        {isExpanded ? (
           <img src={mode === 'dark' ? logoDark : logoLight} alt="Logo" style={{ maxWidth: '140px', height: 'auto', transition: '0.3s' }} />
        ) : (
           <Typography variant="h6" fontWeight="bold" color="primary">S</Typography>
        )}
      </Box>
      <Divider />
      
      <List sx={{ flexGrow: 1 }}>
        <Tooltip title={!isExpanded ? "Visão Geral" : ""} placement="right">
          <ListItemButton onClick={() => navigate('/')} sx={getButtonStyle('/')}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <Dashboard color={location.pathname === '/' ? 'primary' : 'inherit'}/>
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Visão Geral" />}
          </ListItemButton>
        </Tooltip>

        {/* --- GERENCIAR USUÁRIOS (SÓ ADMIN) --- */}
        {user?.role === 'admin' && (
            <Tooltip title={!isExpanded ? "Gerenciar Usuários" : ""} placement="right">
            <ListItemButton onClick={() => navigate('/admin/users')} sx={getButtonStyle('/admin/users')}>
                <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
                <AdminIcon color="error" /> 
                </ListItemIcon>
                {isExpanded && <ListItemText primary="Gerenciar Usuários" />}
            </ListItemButton>
            </Tooltip>
        )}

        {/* --- POWER BI --- */}
        <Tooltip title={!isExpanded ? "Power BI" : ""} placement="right">
          <ListItemButton onClick={() => handleGroupClick(openPowerBI, setOpenPowerBI)} sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <BarChart />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Power BI" />}
            {isExpanded && (openPowerBI ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>
        <Collapse in={openPowerBI && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4, ...getButtonStyle('/pbi/faturamento') }} onClick={() => navigate('/pbi/faturamento')}>
              <ListItemText primary="Faturamento" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4, ...getButtonStyle('/pbi/pmo') }} onClick={() => navigate('/pbi/pmo')}>
              <ListItemText primary="Dashboard PMO" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* --- EXCEL ONLINE (DINÂMICO) --- */}
        <Tooltip title={!isExpanded ? "Excel Online" : ""} placement="right">
          <ListItemButton onClick={() => handleGroupClick(openExcel, setOpenExcel)} sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <TableChart />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Excel Online" />}
            {isExpanded && (openExcel ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>
        <Collapse in={openExcel && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {excelToolsConfig.map((tool) => (
              <ListItemButton 
                key={tool.key} 
                sx={{ pl: 4 }} 
                onClick={() => handleExcelClick(tool.key)}
              >
                <ListItemText primary={tool.title} />
                
                {/* BOTÃO DE EDIÇÃO (ADMIN E PMO) */}
                {['admin', 'pmo'].includes(user?.role) ? (
                    <IconButton 
                        size="small" 
                        onClick={(e) => handleEditLink(e, tool.key)}
                        sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                ) : (
                    <OpenInNew color="action" sx={{ fontSize: 16, opacity: 0.6 }} />
                )}
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* --- PSOFFICE (DINÂMICO) --- */}
        <Tooltip title={!isExpanded ? "PSOffice" : ""} placement="right">
          <ListItemButton 
            component="a" 
            href={links['psoffice'] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <BusinessCenter /> 
            </ListItemIcon>
            {isExpanded && <ListItemText primary="PSOffice" />}
            
            {/* BOTÃO DE EDIÇÃO (ADMIN E PMO) */}
            {isExpanded && ['admin', 'pmo'].includes(user?.role) ? (
                 <IconButton 
                    size="small" 
                    onClick={(e) => handleEditLink(e, 'psoffice')}
                    sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            ) : (
                isExpanded && <OpenInNew color="action" sx={{ fontSize: 16, opacity: 0.6 }} />
            )}
          </ListItemButton>
        </Tooltip>

        <Divider sx={{ my: 1 }} />
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
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
        {drawerContent}
      </Drawer>
      <Drawer variant="permanent" open sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: isExpanded ? drawerWidth : miniDrawerWidth, transition: 'width 0.3s', overflowX: 'hidden' } }}>
        {drawerContent}
      </Drawer>

      {/* DIALOG DE REDIRECIONAMENTO (EXCEL) */}
      <Dialog open={redirectDialog} onClose={() => setRedirectDialog(false)}>
        <DialogTitle>Redirecionamento Externo</DialogTitle>
        <DialogContent>
          <DialogContentText>Você será redirecionado para o Excel Online. Deseja continuar?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedirectDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleConfirmRedirect} variant="contained" autoFocus>Continuar</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG DE EDIÇÃO DE LINK (ADMIN/PMO) */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Link</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Cole a nova URL abaixo para atualizar este link no sistema.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="URL do Link"
            type="url"
            fullWidth
            variant="outlined"
            value={editData.url}
            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={saveLink} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Alteração'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, Typography, Divider, ListItemButton,
  ListItemIcon, ListItemText, Collapse, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, Switch, IconButton, Tooltip, TextField,
  Badge, Chip, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import {
  Dashboard, ExpandLess, ExpandMore, BarChart,
  TableChart, OpenInNew, Brightness4, Brightness7,
  ChevronLeft, ChevronRight, BusinessCenter,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  PersonAdd as ApprovalIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

import logoLight from '../../assets/logo.png';
import logoDark from '../../assets/logo_dark.png';

const Sidebar = ({
  mobileOpen, handleDrawerToggle, drawerWidth, miniDrawerWidth,
  isExpanded, toggleSidebar
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useTheme();
  const { user } = useAuth();

  // Menus Control
  const [openPowerBI, setOpenPowerBI] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);

  // Links Data
  const [linksList, setLinksList] = useState([]);
  const [linksMap, setLinksMap] = useState({});
  const [pendingCount, setPendingCount] = useState(0);

  // Dialogs
  const [redirectDialog, setRedirectDialog] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({ key: '', url: '' });

  const [addLinkDialog, setAddLinkDialog] = useState(false);
  const [newLinkData, setNewLinkData] = useState({ title: '', url: '', category: 'pbi' });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
    if (user?.role === 'admin') {
      fetchPendingCount();
    }
  }, [user]);

  const fetchLinks = async () => {
    try {
      const response = await api.get('/links');
      setLinksList(response.data);

      // Criar mapa para acesso rápido (legacy support para psoffice e pbi hardcoded)
      const map = {};
      response.data.forEach(l => {
        map[l.link_key] = l.url;
      });
      setLinksMap(map);
    } catch (error) {
      console.error('Erro ao buscar links', error);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await api.get('/admin/approvals');
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Erro count', error);
    }
  };

  useEffect(() => {
    if (location.pathname.includes('/pbi')) setOpenPowerBI(true);
    if (!isExpanded) {
      setOpenPowerBI(false);
      setOpenExcel(false);
      setOpenCustom(false);
    }
    if (user?.role === 'admin') fetchPendingCount();
  }, [isExpanded, location.pathname, user?.role]);

  const handleGroupClick = (isOpen, setOpen) => {
    if (!isExpanded) { toggleSidebar(); setOpen(true); } else { setOpen(!isOpen); }
  };

  // --- Handlers de Link ---
  const handleExternalLinkClick = (url) => {
    if (url) {
      setTargetUrl(url);
      setRedirectDialog(true);
    } else {
      alert('Link não configurado.');
    }
  };

  const handlePbiClick = (key) => {
    // Se for os hardcoded antigos, navega direto
    if (key === 'pbi_faturamento') navigate('/pbi/faturamento');
    else if (key === 'pbi_pmo') navigate('/pbi/pmo');
    // Se for novo
    else navigate(`/pbi/${key}`);
  };

  // --- Edit Link (Legacy) ---
  const handleEditLink = (e, key) => {
    e.stopPropagation(); e.preventDefault();
    setEditData({ key, url: linksMap[key] || '' });
    setEditDialog(true);
  };

  const saveEditLink = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/links/${editData.key}`, { url: editData.url });
      fetchLinks(); // Recarrega tudo
      setEditDialog(false);
    } catch (error) { alert('Erro ao atualizar link.'); } finally { setSaving(false); }
  };

  // --- Add Link (New) ---
  const handleAddLink = async () => {
    if (!newLinkData.title || !newLinkData.url) return alert("Preencha título e URL");
    setSaving(true);
    try {
      await api.post('/links', newLinkData);
      fetchLinks();
      setAddLinkDialog(false);
      setNewLinkData({ title: '', url: '', category: 'pbi' });
      alert("Link criado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar link.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmRedirect = () => { if (targetUrl) window.open(targetUrl, '_blank'); setRedirectDialog(false); };

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

  // Filtros de Links
  const pbiLinks = linksList.filter(l => l.link_key.startsWith('pbi_') && l.link_key !== 'pbi_faturamento' && l.link_key !== 'pbi_pmo');
  const excelLinks = linksList.filter(l => l.link_key.startsWith('excel_'));
  const customLinks = linksList.filter(l => l.link_key.startsWith('custom_'));

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

        {/* Visão Geral */}
        <Tooltip title={!isExpanded ? "Visão Geral" : ""} placement="right">
          <ListItemButton onClick={() => navigate('/')} sx={getButtonStyle('/')}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <Dashboard color={location.pathname === '/' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Visão Geral" />}
          </ListItemButton>
        </Tooltip>

        {/* --- Power BI --- */}
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
            {/* Hardcoded (Legacy/Priority) */}
            <ListItemButton sx={{ pl: 4, ...getButtonStyle('/pbi/faturamento') }} onClick={() => handlePbiClick('pbi_faturamento')}>
              <ListItemText primary="Faturamento" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4, ...getButtonStyle('/pbi/pmo') }} onClick={() => handlePbiClick('pbi_pmo')}>
              <ListItemText primary="Dashboard PMO" />
            </ListItemButton>
            {/* Dynamic */}
            {pbiLinks.map(link => (
              <ListItemButton key={link.link_key} sx={{ pl: 4, ...getButtonStyle(`/pbi/${link.link_key}`) }} onClick={() => handlePbiClick(link.link_key)}>
                <ListItemText primary={link.title} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* --- Excel Online --- */}
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
            {excelLinks.map((link) => (
              <ListItemButton key={link.link_key} sx={{ pl: 4 }} onClick={() => handleExternalLinkClick(link.url)}>
                <ListItemText primary={link.title} />
                {['admin', 'pmo'].includes(user?.role) && (
                  <IconButton size="small" onClick={(e) => handleEditLink(e, link.link_key)} sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItemButton>
            ))}
            {excelLinks.length === 0 && <ListItemText sx={{ pl: 4, fontStyle: 'italic', color: 'text.secondary' }} primary="Nenhum link" />}
          </List>
        </Collapse>

        {/* --- Links Independentes (Custom) --- */}
        <Tooltip title={!isExpanded ? "Links Úteis" : ""} placement="right">
          <ListItemButton onClick={() => handleGroupClick(openCustom, setOpenCustom)} sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <LinkIcon />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Links Úteis" />}
            {isExpanded && (openCustom ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>
        <Collapse in={openCustom && isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {customLinks.map((link) => (
              <ListItemButton key={link.link_key} sx={{ pl: 4 }} onClick={() => handleExternalLinkClick(link.url)}>
                <ListItemText primary={link.title} />
                {['admin', 'pmo'].includes(user?.role) && (
                  <IconButton size="small" onClick={(e) => handleEditLink(e, link.link_key)} sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </ListItemButton>
            ))}
            {customLinks.length === 0 && <ListItemText sx={{ pl: 4, fontStyle: 'italic', color: 'text.secondary' }} primary="Nenhum link" />}
          </List>
        </Collapse>

        {/* PSOffice (Legacy) */}
        <Tooltip title={!isExpanded ? "PSOffice" : ""} placement="right">
          <ListItemButton
            component="a"
            href={linksMap['psoffice'] || '#'}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <BusinessCenter />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="PSOffice" />}
            {isExpanded && ['admin', 'pmo'].includes(user?.role) ? (
              <IconButton size="small" onClick={(e) => handleEditLink(e, 'psoffice')} sx={{ ml: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                <EditIcon fontSize="small" />
              </IconButton>
            ) : (isExpanded && <OpenInNew color="action" sx={{ fontSize: 16, opacity: 0.6 }} />)}
          </ListItemButton>
        </Tooltip>

        <Divider sx={{ my: 2 }} />

        {/* --- ADMIN AREA --- */}
        {['admin', 'pmo'].includes(user?.role) && (
          <>
            {/* Botão Adicionar Link */}
            <Tooltip title={!isExpanded ? "Adicionar Link" : ""} placement="right">
              <ListItemButton onClick={() => setAddLinkDialog(true)} sx={{ justifyContent: isExpanded ? 'initial' : 'center' }}>
                <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
                  <AddIcon color="primary" />
                </ListItemIcon>
                {isExpanded && <ListItemText primary="Adicionar Link" primaryTypographyProps={{ color: 'primary', fontWeight: 'bold' }} />}
              </ListItemButton>
            </Tooltip>

            {user?.role === 'admin' && (
              <>
                <Tooltip title={!isExpanded ? "Gerenciar Usuários" : ""} placement="right">
                  <ListItemButton onClick={() => navigate('/admin/users')} sx={getButtonStyle('/admin/users')}>
                    <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
                      <AdminIcon color="error" />
                    </ListItemIcon>
                    {isExpanded && <ListItemText primary="Gerenciar Usuários" />}
                  </ListItemButton>
                </Tooltip>

                <Tooltip title={!isExpanded ? "Solicitações Pendentes" : ""} placement="right">
                  <ListItemButton onClick={() => navigate('/admin/approvals')} sx={getButtonStyle('/admin/approvals')}>
                    <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
                      <Badge badgeContent={pendingCount} color="error">
                        <ApprovalIcon />
                      </Badge>
                    </ListItemIcon>
                    {isExpanded && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <ListItemText primary="Solicitações" />
                        {pendingCount > 0 && (
                          <Chip label={pendingCount} color="error" size="small" sx={{ height: 20, minWidth: 20 }} />
                        )}
                      </Box>
                    )}
                  </ListItemButton>
                </Tooltip>
              </>
            )}
          </>
        )}

        <Tooltip title={!isExpanded ? "Minha Conta" : ""} placement="right">
          <ListItemButton onClick={() => navigate('/profile')} sx={getButtonStyle('/profile')}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 3 : 'auto', justifyContent: 'center' }}>
              <PersonIcon />
            </ListItemIcon>
            {isExpanded && <ListItemText primary="Minha Conta" />}
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
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>{drawerContent}</Drawer>
      <Drawer variant="permanent" open sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: isExpanded ? drawerWidth : miniDrawerWidth, transition: 'width 0.3s', overflowX: 'hidden' } }}>{drawerContent}</Drawer>

      {/* Redirect Dialog */}
      <Dialog open={redirectDialog} onClose={() => setRedirectDialog(false)}>
        <DialogTitle>Redirecionamento Externo</DialogTitle>
        <DialogContent><DialogContentText>Você será redirecionado para um link externo. Deseja continuar?</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setRedirectDialog(false)} color="inherit">Cancelar</Button><Button onClick={handleConfirmRedirect} variant="contained" autoFocus>Continuar</Button></DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar Link</DialogTitle>
        <DialogContent><DialogContentText sx={{ mb: 2 }}>Cole a nova URL.</DialogContentText><TextField autoFocus margin="dense" label="URL do Link" type="url" fullWidth variant="outlined" value={editData.url} onChange={(e) => setEditData({ ...editData, url: e.target.value })} /></DialogContent>
        <DialogActions><Button onClick={() => setEditDialog(false)} color="inherit">Cancelar</Button><Button onClick={saveEditLink} variant="contained" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></DialogActions>
      </Dialog>

      {/* Add Link Dialog */}
      <Dialog open={addLinkDialog} onClose={() => setAddLinkDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Novo Link</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Título do Link/Relatório" fullWidth value={newLinkData.title} onChange={(e) => setNewLinkData({ ...newLinkData, title: e.target.value })} />
            <TextField label="URL" fullWidth value={newLinkData.url} onChange={(e) => setNewLinkData({ ...newLinkData, url: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={newLinkData.category}
                label="Categoria"
                onChange={(e) => setNewLinkData({ ...newLinkData, category: e.target.value })}
              >
                <MenuItem value="pbi">Power BI</MenuItem>
                <MenuItem value="excel">Excel Online</MenuItem>
                <MenuItem value="custom">Link Independente</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setAddLinkDialog(false)} color="inherit">Cancelar</Button><Button onClick={handleAddLink} variant="contained" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
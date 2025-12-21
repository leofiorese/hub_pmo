import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, CircularProgress, IconButton, Tooltip 
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import PowerBIEmbed from '../../components/UI/PowerBIEmbed'; // Mantendo seu componente
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function Faturamento() {
  const { user } = useAuth(); // Para verificar se é admin
  const LINK_KEY = 'pbi_faturamento'; // Chave definida no banco

  // URL Padrão (Fallback caso o banco falhe ou demore)
  const defaultUrl = "https://app.powerbi.com/view?r=eyJrIjoiNWYyOGQzYTYtZDgxYy00YTYxLTg0NGQtZWVjYzRmN2UxMTVjIiwidCI6ImMzN2RhMWY3LWE3MzctNDJjNS1hMDQ1LTIzMGE2NjM2ZjQ0NiJ9";

  const [reportUrl, setReportUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados do Modal de Edição
  const [openDialog, setOpenDialog] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // 1. Busca o link no Backend ao carregar
  useEffect(() => {
    fetchLink();
  }, []);

  const fetchLink = async () => {
    try {
      const response = await api.get(`/api/links/${LINK_KEY}`);
      if (response.data && response.data.url) {
        setReportUrl(response.data.url);
        setNewUrl(response.data.url);
      } else {
        setReportUrl(defaultUrl); // Usa o hardcoded se o banco estiver vazio
      }
    } catch (error) {
      console.error('Erro ao buscar link, usando padrão:', error);
      setReportUrl(defaultUrl);
    } finally {
      setLoading(false);
    }
  };

  // 2. Salva o novo link no Banco
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/admin/links/${LINK_KEY}`, { url: newUrl });
      setReportUrl(newUrl); // Atualiza na hora
      setOpenDialog(false);
      alert('Link atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar. Verifique se você é Admin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho com Título e Botão de Editar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
          Dashboard de Faturamento
        </Typography>

        {/* Botão visível apenas para Admin */}
        {user?.role === 'admin' && (
          <Tooltip title="Alterar Link do Relatório">
            <Button 
              startIcon={<EditIcon />} 
              variant="outlined" 
              size="small"
              onClick={() => {
                setNewUrl(reportUrl); // Garante que o input abre com o link atual
                setOpenDialog(true);
              }}
            >
              Editar Link
            </Button>
          </Tooltip>
        )}
      </Box>
      
      {/* Conteúdo Principal */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {loading ? (
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
             <CircularProgress />
           </Box>
        ) : (
          /* Aqui usamos o SEU componente reutilizável com a URL dinâmica */
          <PowerBIEmbed 
            title="FATURAMENTO" 
            src={reportUrl} 
          />
        )}
      </Box>

      {/* --- MODAL DE EDIÇÃO (Dialog) --- */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Editar Link do Power BI - Faturamento</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, mt: 1 }}>
            Insira o novo link "Embed URL" do relatório.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="URL do Relatório"
            type="url"
            fullWidth
            variant="outlined"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
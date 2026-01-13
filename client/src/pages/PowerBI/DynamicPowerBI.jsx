import React, { useState, useEffect } from 'react';
import {
    Typography, Box, CircularProgress, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Tooltip, FormControl,
    InputLabel, Select, MenuItem
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import PowerBIEmbed from '../../components/UI/PowerBIEmbed';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function DynamicPowerBI() {
    const { key } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [reportUrl, setReportUrl] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Edit Modal State
    const [openDialog, setOpenDialog] = useState(false);
    const [editData, setEditData] = useState({ title: '', url: '', category: 'pbi' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchLink();
    }, [key]);

    const fetchLink = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await api.get(`/links/${key}`);
            if (response.data && response.data.url) {
                setReportUrl(response.data.url);
                setTitle(response.data.title || 'Power BI Report');
            } else {
                setError(true);
            }
        } catch (error) {
            console.error('Erro ao buscar link:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setEditData({ title, url: reportUrl, category: 'pbi' });
        setOpenDialog(true);
    };

    const handleSave = async () => {
        if (!editData.title || !editData.url) return alert("Preencha todos os campos");
        setSaving(true);
        try {
            const response = await api.put(`/links/${key}`, {
                title: editData.title,
                url: editData.url,
                category: editData.category
            });

            setOpenDialog(false);
            alert('Atualizado com sucesso!');

            // Se mudou a chave (categoria mudou) ou se mudou a categoria para algo que não é PBI
            if (response.data.link_key !== key || editData.category !== 'pbi') {
                navigate('/'); // Volta para home pois a URL mudou ou não é mais uma página PBI
            } else {
                setTitle(editData.title);
                setReportUrl(editData.url);
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar link.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Tem certeza que deseja EXCLUIR este relatório?")) return;
        setSaving(true);
        try {
            await api.delete(`/links/${key}`);
            alert('Relatório excluído!');
            navigate('/');
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !reportUrl) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">Erro</Typography>
                <Typography>Não foi possível carregar o relatório. Verifique se o link existe.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>

                {['admin', 'pmo'].includes(user?.role) && (
                    <Tooltip title="Alterar Link/Título">
                        <Button
                            startIcon={<EditIcon />}
                            variant="outlined"
                            size="small"
                            onClick={handleEditClick}
                        >
                            Editar Link
                        </Button>
                    </Tooltip>
                )}
            </Box>

            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <PowerBIEmbed
                    title={title}
                    src={reportUrl}
                />
            </Box>

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Editar Relatório Power BI</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Título do Relatório"
                            fullWidth
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                        <TextField
                            label="URL (Embed)"
                            type="url"
                            fullWidth
                            value={editData.url}
                            onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Categoria</InputLabel>
                            <Select
                                value={editData.category}
                                label="Categoria"
                                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                            >
                                <MenuItem value="pbi">Power BI</MenuItem>
                                <MenuItem value="excel">Excel Online</MenuItem>
                                <MenuItem value="custom">Link Independente</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                    <Button onClick={handleDelete} variant="outlined" color="error" startIcon={<DeleteIcon />}>
                        Excluir
                    </Button>
                    <Box>
                        <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ mr: 1 }}>Cancelar</Button>
                        <Button onClick={handleSave} variant="contained" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

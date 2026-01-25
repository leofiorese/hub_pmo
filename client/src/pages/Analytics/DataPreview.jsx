import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Container, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    CircularProgress, Alert, Tabs, Tab, Chip, TextField,
    Select, MenuItem, FormControl, InputLabel, IconButton, Divider
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const DataPreview = () => {
    const navigate = useNavigate();
    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Context Loading
    const {
        selectedTables,
        filters, setFilters,
        dataPreview, setDataPreview
    } = useAnalytics();

    // Alias for compatibility
    const data = dataPreview;
    const setData = setDataPreview;

    // Filter State


    // New Filter Draft State
    const [draftFilter, setDraftFilter] = useState({ column: '', operator: '=', value: '' });

    useEffect(() => {
        if (!selectedTables || Object.keys(selectedTables).length === 0) {
            navigate('/analytics/builder');
            return;
        }

        // Fetch data whenever selectedTables or filters change
        // We perform a check to avoid double-fetching on initial mount if data is already present and matching? 
        // For now, to guarantee consistency with filters, we will fetch if filters changed.
        // However, to avoid re-fetching when just navigating back (and filters are same), we could check deeper.
        // But the user reported "When a filter is applied, preview is not updated". This suggests the caching (if !dataPreview) was too aggressive.
        // Let's allow refetching when filters change.

        const fetchData = async () => {
            // Avoid fetching if we already have data AND filters haven't changed? 
            // Hard to track "old filters". 
            // Simplest fix: Always fetch if this effect runs (which runs on filter change).
            // But we want to avoid fetch on returning from next page.
            // We can check if `dataPreview` is null. If it is NOT null, it might be from a previous visit.
            // If we just added a filter, `filters` changed, so effect runs.
            // So we need to distinguis "Mount due to navigation" vs "Mount/Update due to Filter Change".

            // Problem: `filters` is in dependency array.
            // If I navigate back, `filters` is same as before. `selectedTables` is same.
            // `dataPreview` is populated.
            // So `useEffect` runs? Yes, on mount.
            // If I have data, I don't want to refetch on mount.

            // BUT, if I change a filter, `filters` updates. `useEffect` runs.
            // I need to fetch then.

            // Solution: Use a ref to track if it's the first mount and we have data?
            // Or better: Just fetch. The user expects latest data. The "caching" for back-button is nice but correctness is priority.
            // Optimization: If we want to keep cache, we need to store "LastFetchedFilters" in context.
            // For now, let's remove the aggressively blocking check to FIX the bug.

            setLoading(true);
            try {
                const response = await api.post('/analytics/query', {
                    selectedTables,
                    filters
                });

                if (response.data.success) {
                    setDataPreview(response.data.data);
                } else {
                    setError("Falha ao buscar dados.");
                }
            } catch (err) {
                console.error(err);
                setError("Erro de conexão com o servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedTables, navigate, filters]); // Re-fetch when filters change

    // Handlers
    const handleAddFilter = (tableKey) => {
        if (!draftFilter.column || !draftFilter.value) return;

        const newFilter = { ...draftFilter, id: Date.now() };
        setFilters(prev => ({
            ...prev,
            [tableKey]: [...(prev[tableKey] || []), newFilter]
        }));

        setDraftFilter({ column: '', operator: '=', value: '' });
    };

    const handleRemoveFilter = (tableKey, id) => {
        setFilters(prev => ({
            ...prev,
            [tableKey]: prev[tableKey].filter(f => f.id !== id)
        }));
    };

    const handleProceed = () => {
        // Data is already in Context
        navigate('/analytics/prompt');
    };

    // Loading Overlay Logic is handled inside the main render now
    // if (loading) { ... }  <-- Removed to support overlay

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
                    Voltar
                </Button>
            </Container>
        );
    }

    // Use selectedTables keys for stable tabs (prevents blink when data is reloading)
    const tableKeys = selectedTables ? Object.keys(selectedTables) : [];
    const currentKey = tableKeys[activeTab];
    const currentRows = data && currentKey ? data[currentKey] : [];
    const columns = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Voltar
                </Button>
                <Typography variant="h5" component="h1">
                    Pré-visualização dos Dados
                </Typography>
                <Button
                    variant="contained"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleProceed}
                >
                    Configurar Análise IA
                </Button>
            </Box>

            {tableKeys.length > 0 ? (
                <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, val) => setActiveTab(val)}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        {tableKeys.map((key) => (
                            <Tab label={key} key={key} />
                        ))}
                    </Tabs>

                    {/* FILTER SECTION */}
                    <Box sx={{ p: 3, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" gutterBottom color="text.secondary">
                            Filtros Ativos ({currentKey})
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, minHeight: '32px' }}>
                            {(filters[currentKey] || []).map(f => (
                                <Chip
                                    key={f.id}
                                    label={`${f.column} ${f.operator} ${f.value}`}
                                    onDelete={() => handleRemoveFilter(currentKey, f.id)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                            {(filters[currentKey] || []).length === 0 && (
                                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    Nenhum filtro aplicado.
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>

                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                <InputLabel>Selecionar Coluna</InputLabel>
                                <Select
                                    value={draftFilter.column}
                                    label="Selecionar Coluna"
                                    onChange={(e) => setDraftFilter({ ...draftFilter, column: e.target.value })}
                                >
                                    {columns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Operador</InputLabel>
                                <Select
                                    value={draftFilter.operator}
                                    label="Operador"
                                    onChange={(e) => setDraftFilter({ ...draftFilter, operator: e.target.value })}
                                >
                                    <MenuItem value="=">Igual a</MenuItem>
                                    <MenuItem value=">">Maior que</MenuItem>
                                    <MenuItem value="<">Menor que</MenuItem>
                                    <MenuItem value=">=">Maior/Igual</MenuItem>
                                    <MenuItem value="<=">Menor/Igual</MenuItem>
                                    <MenuItem value="!=">Diferente de</MenuItem>
                                    <MenuItem value="LIKE">Contém</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                size="small"
                                label="Valor do Filtro"
                                placeholder="Ex: 1000"
                                value={draftFilter.value}
                                onChange={(e) => setDraftFilter({ ...draftFilter, value: e.target.value })}
                                sx={{ minWidth: 200 }}
                            />

                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                disabled={!draftFilter.column || !draftFilter.value}
                                onClick={() => handleAddFilter(currentKey)}
                            >
                                Adicionar
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer sx={{ maxHeight: 600, position: 'relative' }}>
                        {loading && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                bgcolor: 'rgba(255, 255, 255, 0.7)',
                                zIndex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CircularProgress />
                            </Box>
                        )}
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {columns.map((col) => (
                                        <TableCell key={col} sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                                            {col}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentRows.map((row, idx) => (
                                    <TableRow hover key={idx}>
                                        {columns.map((col) => (
                                            <TableCell key={`${idx}-${col}`}>
                                                {/* Handle objects/dates specifically if needed */}
                                                {typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {currentRows.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">
                                                Nenhum dado encontrado com os filtros atuais.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary">
                            * Mostrando amostra limitada (máx 50 linhas) para otimização do contexto da IA.
                        </Typography>
                    </Box>
                </Paper>
            ) : (
                <Alert severity="info" sx={{ mt: 2 }}>Nenhum dado selecionado ou retornado.</Alert>
            )}
        </Container>
    );
};

export default DataPreview;

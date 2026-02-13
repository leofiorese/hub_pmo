import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Container, TextField, Button,
    Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
    FormControl, InputLabel, Select, MenuItem, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ollamaService } from '../../services/ollamaService';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const PromptBuilder = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [loadingModels, setLoadingModels] = useState(false);

    // Data passed from Preview (Context)
    const { dataPreview } = useAnalytics();
    const preparedData = dataPreview;

    // Fetch Models on Mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                setLoadingModels(true);
                const data = await ollamaService.getModels();
                if (data && data.models) {
                    setModels(data.models);
                    if (data.models.length > 0) {
                        setSelectedModel(data.models[0].name);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch models", err);
                // Non-blocking error
            } finally {
                setLoadingModels(false);
            }
        };

        fetchModels();
    }, []);

    if (!preparedData) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">Nenhum dado recebido para análise. Volte e selecione os dados.</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/analytics/builder')} sx={{ mt: 2 }}>
                    Reiniciar
                </Button>
            </Container>
        );
    }

    const handleAnalyze = async () => {
        if (!prompt.trim()) {
            setError("Por favor, digite uma instrução para a IA.");
            return;
        }

        if (!selectedModel) {
            setError("Por favor, selecione um modelo de IA.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Send Data + Prompt to Backend
            const response = await api.post('/analytics/ask', {
                data: preparedData,
                prompt: prompt,
                model: selectedModel
            });

            if (response.data.success) {
                // Navigate to Results
                navigate('/analytics/results', {
                    state: {
                        result: response.data.response,
                        chartData: response.data.chartConfig || null
                    }
                });
            } else {
                setError(response.data.error || "Erro na análise.");
            }

        } catch (err) {
            console.error(err);
            setError("Erro de comunicação com o servidor de IA. Verifique se o Ollama está rodando.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate generic stats for info
    const totalTables = Object.keys(preparedData).length;
    let totalRows = 0;
    Object.values(preparedData).forEach(rows => totalRows += rows.length);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} disabled={loading}>
                    Voltar
                </Button>
                <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="warning" /> Instruções da Análise
                </Typography>
                <Box minWidth={64} /> {/* Spacer */}
            </Box>

            <Paper sx={{ p: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Contexto dos Dados:
                    </Typography>
                    <Alert severity="info" icon={<AutoAwesomeIcon />}>
                        Serão analisados <strong>{totalRows} registros</strong> de <strong>{totalTables} tabelas</strong>.
                    </Alert>
                </Box>

                {/* Data Preview as 'Fieldset' to match Input Style */}
                <Box
                    component="fieldset"
                    sx={{
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                        borderRadius: 1,
                        p: 0,
                        m: 0,
                        mb: 3,
                        '&:hover': {
                            borderColor: (theme) => theme.palette.text.primary
                        }
                    }}
                >
                    <legend style={{ marginLeft: 10, paddingLeft: 5, paddingRight: 5, fontSize: '0.75rem', color: 'gray' }}>
                        Visualizar Dados (Preview)
                    </legend>
                    <Accordion elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' }, m: 0 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
                                <TableChartIcon color="action" fontSize="small" />
                                <Typography variant="body1">
                                    {totalTables} Tabelas, {totalRows} Linhas
                                </Typography>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                            {Object.entries(preparedData).map(([tableName, rows]) => (
                                <Box key={tableName} sx={{ mb: 2, mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
                                        Tabela: {tableName} ({rows.length} registros)
                                    </Typography>
                                    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 250, border: '1px solid', borderColor: 'divider' }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    {rows.length > 0 && Object.keys(rows[0]).map((col) => (
                                                        <TableCell key={col} sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>{col}</TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {rows.slice(0, 10).map((row, idx) => (
                                                    <TableRow key={idx} hover>
                                                        {Object.values(row).map((val, i) => (
                                                            <TableCell key={i}>
                                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                                {rows.length > 10 && (
                                                    <TableRow>
                                                        <TableCell colSpan={Object.keys(rows[0]).length} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                            ... e mais {rows.length - 10} linhas
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </Box>

                <Stack spacing={3} sx={{ mb: 4 }}>
                    <FormControl fullWidth disabled={loadingModels}>
                        <InputLabel>Modelo de IA</InputLabel>
                        <Select
                            value={selectedModel}
                            label="Modelo de IA"
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {models.map((model) => (
                                <MenuItem key={model.name} value={model.name}>
                                    {model.name}
                                </MenuItem>
                            ))}
                            {models.length === 0 && !loadingModels && (
                                <MenuItem disabled value="">
                                    Nenhum modelo encontrado
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    <Box>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            O que você deseja descobrir?
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            placeholder="Ex: Analise a evolução dos custos nos últimos 3 meses e identifique outliers."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            variant="outlined"
                            disabled={loading}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Seja específico para obter melhores resultados. A IA irá considerar apenas os dados selecionados.
                        </Typography>
                    </Box>
                </Stack>

                {/* Show Data Snippet (Debug) - Keeping it collapsed by default or removing if redundant, but user might strict want it. Let's keep it closed at bottom */}
                <Accordion variant="outlined" sx={{ mb: 4 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" color="text.secondary">Ver JSON enviado (Debug)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                            <pre style={{ fontSize: '0.7rem', color: '#000000', margin: 0 }}>{JSON.stringify(preparedData, null, 2)}</pre>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}

                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleAnalyze}
                        disabled={loading || !selectedModel}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        sx={{ px: 6, py: 1.5, fontSize: '1.1rem', borderRadius: 50 }}
                        color="primary"
                    >
                        {loading ? "Analisando..." : "Gerar Análise"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default PromptBuilder;

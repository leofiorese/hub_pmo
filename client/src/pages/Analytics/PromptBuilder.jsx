import React, { useState } from 'react';
import {
    Box, Typography, Paper, Container, TextField, Button,
    Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PromptBuilder = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Data passed from Preview
    const preparedData = location.state?.preparedData;

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

        setLoading(true);
        setError(null);

        try {
            // Send Data + Prompt to Backend
            const response = await api.post('/analytics/ask', {
                data: preparedData,
                prompt: prompt,
                model: 'qwen2.5:14b' // Padrão definido, pode ser dinâmico no futuro
            });

            if (response.data.success) {
                // Navigate to Results
                navigate('/analytics/results', {
                    state: {
                        result: response.data.response,
                        chartData: response.data.chartConfig || null // Se backend gerar config de gráfico
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

                <Box sx={{ mb: 4 }}>
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

                {/* Show Data Snippet (Optional/Debug) */}
                <Accordion variant="outlined" sx={{ mb: 4 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" color="text.secondary">Ver JSON enviado (Debug)</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                            <pre style={{ fontSize: '0.7rem' }}>{JSON.stringify(preparedData, null, 2)}</pre>
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
                        disabled={loading}
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

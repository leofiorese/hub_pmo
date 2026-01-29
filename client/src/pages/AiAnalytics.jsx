import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Button,
    CircularProgress,
    Stack,
    Alert
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { ollamaService } from '../services/ollamaService';

const AiAnalytics = () => {
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingModels, setLoadingModels] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            setLoadingModels(true);
            const data = await ollamaService.getModels();
            if (data && data.models) {
                setModels(data.models);
                // Select first model by default if available
                if (data.models.length > 0) {
                    setSelectedModel(data.models[0].name);
                }
            }
        } catch (err) {
            setError('Falha ao carregar modelos. Verifique se o Ollama está rodando.');
        } finally {
            setLoadingModels(false);
        }
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || !selectedModel) return;

        setLoading(true);
        setError(null);
        setResponse('');

        try {
            const data = await ollamaService.chat(selectedModel, prompt);
            if (data && data.response) {
                setResponse(data.response);
            }
        } catch (err) {
            setError('Erro ao processar sua solicitação.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                AI Analytics
            </Typography>

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Stack spacing={3}>
                    <FormControl fullWidth disabled={loadingModels}>
                        <InputLabel>Selecione o Modelo</InputLabel>
                        <Select
                            value={selectedModel}
                            label="Selecione o Modelo"
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {models.map((model) => (
                                <MenuItem key={model.name} value={model.name}>
                                    {model.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Digite seu prompt aqui..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={loading}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={loading || !prompt || !selectedModel}
                        sx={{ alignSelf: 'flex-start', px: 4, py: 1.5 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
                    </Button>

                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </Paper>

            {response && (
                <Paper elevation={3} sx={{ p: 4, bgcolor: '#f8f9fa' }}>
                    <Typography variant="h6" gutterBottom>
                        Resposta:
                    </Typography>
                    <Box sx={{ '& pre': { bgcolor: '#e0e0e0', p: 2, borderRadius: 1, overflowX: 'auto' } }}>
                        <ReactMarkdown>{response}</ReactMarkdown>
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default AiAnalytics;

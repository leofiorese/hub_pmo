import React from 'react';
import { Box, Typography, Paper, Container, Button, Divider } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReplayIcon from '@mui/icons-material/Replay';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from 'react-router-dom';

const AnalysisResults = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get result from router state
    const aiResponse = location.state?.result;

    if (!aiResponse) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" color="error">Nenhum resultado encontrado.</Typography>
                <Button onClick={() => navigate('/analytics')} sx={{ mt: 2 }}>Voltar ao Início</Button>
            </Container>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="primary" /> Resultado da Análise
                </Typography>

                <Box>
                    <Button
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ mr: 2 }}
                    >
                        Exportar PDF
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<ReplayIcon />}
                        onClick={() => navigate('/analytics')}
                    >
                        Nova Análise
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 4, minHeight: '60vh' }} elevation={3}>
                <Box className="markdown-body">
                    <ReactMarkdown>
                        {aiResponse}
                    </ReactMarkdown>
                </Box>
            </Paper>

            <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="caption">
                    Gerado por IA (Modelo Qwen 2.5:14b). Verifique as informações antes de tomar decisões críticas.
                </Typography>
            </Box>
        </Container>
    );
};

export default AnalysisResults;

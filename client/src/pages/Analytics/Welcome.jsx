import React from 'react';
import { Box, Typography, Button, Paper, Container, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TableViewIcon from '@mui/icons-material/TableView';
import ChatIcon from '@mui/icons-material/Chat';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const Welcome = () => {
    const navigate = useNavigate();

    const steps = [
        {
            label: 'Seleção de Dados',
            description: 'Escolha as tabelas e colunas que deseja analisar.',
            icon: <TableViewIcon color="primary" />,
        },
        {
            label: 'Filtros Inteligentes',
            description: 'Aplique filtros para refinar o conjunto de dados.',
            icon: <FilterAltIcon color="primary" />,
        },
        {
            label: 'Pré-visualização',
            description: 'Confira os dados formatados antes de enviar para a IA.',
            icon: <TableViewIcon color="primary" />,
        },
        {
            label: 'Prompt & Modelo',
            description: 'Escreva sua pergunta e escolha o modelo de IA (ex: Llama 3).',
            icon: <ChatIcon color="primary" />,
        },
        {
            label: 'Análise Completa',
            description: 'Receba insights estratégicos e visualizações.',
            icon: <LightbulbIcon color="primary" />,
        },
    ];

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Análise Inteligente
                    </Typography>
                    <Typography variant="h6" color="text.secondary" paragraph>
                        Transforme seus dados em decisões com o poder da Inteligência Artificial.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Stepper orientation="vertical">
                        {steps.map((step, index) => (
                            <Step key={step.label} active={true}>
                                <StepLabel icon={step.icon}>
                                    <Typography variant="h6">{step.label}</Typography>
                                </StepLabel>
                                <StepContent>
                                    <Typography color="text.secondary">{step.description}</Typography>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Box sx={{ bgcolor: 'warning.light', p: 2, borderRadius: 1, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="warning.contrastText">
                        <strong>Aviso Importante:</strong> A análise é gerada por IA e pode conter imprecisões. Recomendamos sempre validar os resultados com os dados originais.
                    </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/analytics/builder')}
                        sx={{ px: 8, py: 1.5, fontSize: '1.2rem', borderRadius: 50 }}
                    >
                        Prosseguir
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Welcome;

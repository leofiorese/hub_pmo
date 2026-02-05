import React from 'react';
import { Box, Typography, Paper, Container, Button, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReplayIcon from '@mui/icons-material/Replay';
import PrintIcon from '@mui/icons-material/Print';
import { useLocation, useNavigate } from 'react-router-dom';
import ChartRenderer from '../../components/ChartRenderer';

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
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code: ({ node, inline, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match ? match[1] : '';

                                // Check if language is json-chart OR if it is json and looks like a chart
                                const isExplicitChart = lang === 'json-chart';
                                const isPotentialChart = lang === 'json' || !lang; // Also check basic json or no-lang blocks

                                if (!inline && (isExplicitChart || isPotentialChart)) {
                                    try {
                                        const content = String(children).replace(/\n$/, '');
                                        // Attempt to parse JSON
                                        const chartData = JSON.parse(content);

                                        // Validation: Must have 'type', 'data' array, and 'series' array to be a valid chart
                                        if (chartData && chartData.type && Array.isArray(chartData.data) && Array.isArray(chartData.series)) {
                                            return <ChartRenderer {...chartData} />;
                                        }

                                        // If it parsed but isn't a chart schema, fall through to default code block
                                    } catch (e) {
                                        // Not valid JSON, fall through
                                    }
                                }

                                return <code className={className} {...props}>{children}</code>;
                            },
                            table: ({ node, ...props }) => (
                                <TableContainer component={Paper} variant="outlined" sx={{ my: 2, bgcolor: 'background.paper', overflowX: 'auto' }}>
                                    <Table size="small" aria-label="data table">
                                        {props.children}
                                    </Table>
                                </TableContainer>
                            ),
                            thead: ({ node, ...props }) => <TableHead sx={{ bgcolor: 'action.hover' }}>{props.children}</TableHead>,
                            tbody: ({ node, ...props }) => <TableBody>{props.children}</TableBody>,
                            tr: ({ node, ...props }) => <TableRow hover>{props.children}</TableRow>,
                            th: ({ node, ...props }) => (
                                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                                    {props.children}
                                </TableCell>
                            ),
                            td: ({ node, ...props }) => <TableCell align="left">{props.children}</TableCell>,
                        }}
                    >
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

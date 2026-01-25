import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Container, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Button,
    CircularProgress, Alert, Tabs, Tab
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DataPreview = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null); // { TABLE_KEY: [rows] }
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Get selected tables from router state
    const selectedTables = location.state?.selectedTables;

    useEffect(() => {
        if (!selectedTables || Object.keys(selectedTables).length === 0) {
            navigate('/analytics/builder');
            return;
        }

        const fetchData = async () => {
            try {
                const response = await api.post('/analytics/query', {
                    selectedTables
                });

                if (response.data.success) {
                    setData(response.data.data);
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
    }, [selectedTables, navigate]);

    const handleProceed = () => {
        navigate('/analytics/prompt', { state: { preparedData: data } });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, gap: 2 }}>
                <CircularProgress />
                <Typography>Carregando prévia dos dados...</Typography>
            </Box>
        );
    }

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

    // Prepare tabs based on returned data keys
    const tableKeys = data ? Object.keys(data) : [];
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
                <Paper sx={{ width: '100%', mb: 2 }}>
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

                    <TableContainer sx={{ maxHeight: 600 }}>
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
                                        <TableCell colSpan={columns.length} align="center">
                                            Nenhum dado retornado.
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
                <Alert severity="info">Nenhum dado selecionado ou retornado.</Alert>
            )}
        </Container>
    );
};

export default DataPreview;

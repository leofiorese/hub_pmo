import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Container, Grid,
    Checkbox, FormGroup, FormControlLabel, Accordion,
    AccordionSummary, AccordionDetails, Button, Divider,
    CircularProgress, Chip, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const QueryBuilder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [schema, setSchema] = useState({});
    const [selectedColumns, setSelectedColumns] = useState({}); // { TABLE_KEY: ['col1', 'col2'] }
    const [error, setError] = useState(null);

    // Fetch Schema on Mount
    useEffect(() => {
        const fetchSchema = async () => {
            try {
                // TODO: Remover fallback quando backend estiver 100% integrado
                // const response = await api.get('/analytics/schema');
                // setSchema(response.data);

                // Fallback temporário caso a API não responda imediatamente no dev
                try {
                    const response = await api.get('/analytics/schema');
                    setSchema(response.data);
                } catch (e) {
                    console.warn("API Schema falhou, usando mock local para dev UI", e);
                    setSchema({
                        PROJECTS: { friendlyName: "Projetos", columns: { name: { label: "Nome" }, budget: { label: "Orçamento" } } },
                        USERS: { friendlyName: "Usuários", columns: { name: { label: "Nome" }, email: { label: "Email" } } }
                    });
                    setError("Modo Offline: Não foi possível conectar ao Backend de Analytics.");
                }

            } catch (err) {
                console.error(err);
                setError("Erro ao carregar estrutura de dados.");
            } finally {
                setLoading(false);
            }
        };
        fetchSchema();
    }, []);

    const handleToggleColumn = (tableKey, colKey) => {
        setSelectedColumns(prev => {
            const currentTableCols = prev[tableKey] || [];
            if (currentTableCols.includes(colKey)) {
                // Remove
                return { ...prev, [tableKey]: currentTableCols.filter(c => c !== colKey) };
            } else {
                // Add
                return { ...prev, [tableKey]: [...currentTableCols, colKey] };
            }
        });
    };

    const handleSelectTable = (tableKey) => {
        const table = schema[tableKey];
        if (!table) return;

        const allColKeys = Object.keys(table.columns);
        const currentSelected = selectedColumns[tableKey] || [];

        if (currentSelected.length === allColKeys.length) {
            // Deselect All
            setSelectedColumns(prev => ({ ...prev, [tableKey]: [] }));
        } else {
            // Select All
            setSelectedColumns(prev => ({ ...prev, [tableKey]: allColKeys }));
        }
    };

    const countSelected = () => {
        let count = 0;
        Object.values(selectedColumns).forEach(cols => count += cols.length);
        return count;
    };

    const handleProceed = () => {
        // Salvar estado (Contexto ou URL) e navegar
        // Por enquanto, apenas logar
        console.log("Selected:", selectedColumns);
        navigate('/analytics/preview', { state: { selectedTables: selectedColumns } });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon color="primary" /> Construtor de Análise
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Selecione os dados que deseja enviar para a Inteligência Artificial.
                    </Typography>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<NavigateNextIcon />}
                        disabled={countSelected() === 0}
                        onClick={handleProceed}
                    >
                        Visualizar Prévia ({countSelected()})
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>
            )}

            <Grid container spacing={3}>
                {Object.entries(schema).map(([key, table]) => (
                    <Grid item xs={12} md={6} key={key}>
                        <Accordion defaultExpanded elevation={2}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                    <Typography variant="h6">{table.friendlyName}</Typography>
                                    <Chip
                                        label={`${(selectedColumns[key] || []).length} selecionados`}
                                        size="small"
                                        color={(selectedColumns[key] || []).length > 0 ? "primary" : "default"}
                                    />
                                </Box>
                            </AccordionSummary>
                            <Divider />
                            <AccordionDetails>
                                <Box sx={{ mb: 2 }}>
                                    <Button size="small" onClick={() => handleSelectTable(key)}>
                                        {(selectedColumns[key] || []).length === Object.keys(table.columns).length ? "Desmarcar Todos" : "Selecionar Todos"}
                                    </Button>
                                </Box>
                                <FormGroup>
                                    {Object.entries(table.columns).map(([colKey, colData]) => (
                                        <FormControlLabel
                                            key={colKey}
                                            control={
                                                <Checkbox
                                                    checked={(selectedColumns[key] || []).includes(colKey)}
                                                    onChange={() => handleToggleColumn(key, colKey)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body1">{colData.label}</Typography>
                                                    {colData.description && (
                                                        <Typography variant="caption" color="text.secondary">{colData.description}</Typography>
                                                    )}
                                                </Box>
                                            }
                                            sx={{ mb: 1, alignItems: 'flex-start' }}
                                        />
                                    ))}
                                </FormGroup>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default QueryBuilder;

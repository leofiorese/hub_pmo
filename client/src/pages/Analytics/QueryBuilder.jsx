import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Paper, Container, Grid,
    Checkbox, FormGroup, FormControlLabel, Accordion,
    AccordionSummary, AccordionDetails, Button, Divider,
    CircularProgress, Chip, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const TableCard = React.memo(({ tableKey, tableData, selectedColumns, onSelectTable, onToggleColumn }) => (
    <Grid item xs={12} md={6}>
        <Accordion elevation={2}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                    <Typography variant="h6">{tableData.friendlyName}</Typography>
                    <Chip
                        label={`${(selectedColumns || []).length} selecionados`}
                        size="small"
                        color={(selectedColumns || []).length > 0 ? "primary" : "default"}
                    />
                </Box>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                    <Button size="small" onClick={() => onSelectTable(tableKey)}>
                        {(selectedColumns || []).length === Object.keys(tableData.columns).length ? "Desmarcar Todos" : "Selecionar Todos"}
                    </Button>
                </Box>
                <FormGroup>
                    {Object.entries(tableData.columns).map(([colKey, colData]) => (
                        <FormControlLabel
                            key={colKey}
                            control={
                                <Checkbox
                                    checked={(selectedColumns || []).includes(colKey)}
                                    onChange={() => onToggleColumn(tableKey, colKey)}
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
                            sx={{ mb: 1, alignItems: 'center' }}
                        />
                    ))}
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    </Grid>
));

const QueryBuilder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [schema, setSchema] = useState({});

    // Global State from Context
    const { selectedTables, setSelectedTables } = useAnalytics();

    // Local Alias
    const selectedColumns = selectedTables;
    const setSelectedColumns = setSelectedTables;

    const [error, setError] = useState(null);

    // Fetch Schema on Mount
    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const response = await api.get('/analytics/schema');
                setSchema(response.data);
            } catch (err) {
                console.error(err);
                try {
                    console.warn("API Schema falhou, usando mock local para dev UI");
                    setSchema({
                        PROJECTS: { friendlyName: "Projetos", columns: { name: { label: "Nome" }, budget: { label: "Orçamento" } } },
                        USERS: { friendlyName: "Usuários", columns: { name: { label: "Nome" }, email: { label: "Email" } } }
                    });
                    setError("Modo Offline: Não foi possível conectar ao Backend de Analytics.");
                } catch (e) {
                    setError("Erro ao carregar estrutura de dados.");
                }
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
                return { ...prev, [tableKey]: currentTableCols.filter(c => c !== colKey) };
            } else {
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
            setSelectedColumns(prev => ({ ...prev, [tableKey]: [] }));
        } else {
            setSelectedColumns(prev => ({ ...prev, [tableKey]: allColKeys }));
        }
    };

    const countSelected = () => {
        let count = 0;
        Object.values(selectedColumns).forEach(cols => count += cols.length);
        return count;
    };

    const handleProceed = () => {
        navigate('/analytics/preview');
    };

    // Grouping and Sorting Logic
    const groupedSchema = useMemo(() => {
        const omie = [];
        const pso = [];

        Object.entries(schema).forEach(([key, table]) => {
            if (key.startsWith('OMIE_')) {
                omie.push({ key, ...table });
            } else {
                pso.push({ key, ...table });
            }
        });

        omie.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));
        pso.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));

        return { omie, pso };
    }, [schema]);

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

            {/* Omie Section */}
            {groupedSchema.omie.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2' }}>
                        <StorageIcon /> Omie ERP ({groupedSchema.omie.length})
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        {groupedSchema.omie.map(table => (
                            <TableCard
                                key={table.key}
                                tableKey={table.key}
                                tableData={table}
                                selectedColumns={selectedColumns[table.key]}
                                onSelectTable={handleSelectTable}
                                onToggleColumn={handleToggleColumn}
                            />
                        ))}
                    </Grid>
                </Box>
            )}

            {/* PSOffice Section */}
            {groupedSchema.pso.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#ed6c02' }}>
                        <StorageIcon /> PSOffice ({groupedSchema.pso.length})
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                        {groupedSchema.pso.map(table => (
                            <TableCard
                                key={table.key}
                                tableKey={table.key}
                                tableData={table}
                                selectedColumns={selectedColumns[table.key]}
                                onSelectTable={handleSelectTable}
                                onToggleColumn={handleToggleColumn}
                            />
                        ))}
                    </Grid>
                </Box>
            )}

        </Container>
    );
};

export default QueryBuilder;

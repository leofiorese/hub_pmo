import React, { useState, useEffect } from 'react';
import {
    Typography, Box, CircularProgress
} from '@mui/material';
import { useParams } from 'react-router-dom';
import PowerBIEmbed from '../../components/UI/PowerBIEmbed';
import api from '../../services/api';

export default function DynamicPowerBI() {
    const { key } = useParams(); // Pega a chave da URL (ex: pbi_1736780923)

    const [reportUrl, setReportUrl] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetchLink();
    }, [key]);

    const fetchLink = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await api.get(`/links/${key}`);
            if (response.data && response.data.url) {
                setReportUrl(response.data.url);
                setTitle(response.data.title || 'Power BI Report');
            } else {
                setError(true);
            }
        } catch (error) {
            console.error('Erro ao buscar link:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !reportUrl) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" color="error">Erro</Typography>
                <Typography>Não foi possível carregar o relatório. Verifique se o link existe.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <PowerBIEmbed
                    title={title}
                    src={reportUrl}
                />
            </Box>
        </Box>
    );
}

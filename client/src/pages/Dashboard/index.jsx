import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

export default function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
        Visão Geral do PMO
      </Typography>

      <Grid container spacing={3}>
        {/* Card de Boas Vindas */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Bem-vindo ao Hub Central
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecione uma ferramenta no menu lateral para começar. 
              Aqui você terá acesso rápido aos indicadores de faturamento e controle de projetos.
            </Typography>
          </Paper>
        </Grid>

        {/* Placeholders para Métricas (Conforme seu desenho) */}
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} md={3} key={item}>
            <Paper 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                height: 140,
                justifyContent: 'center'
              }}
            >
              <Typography variant="h3" color="primary">0</Typography>
              <Typography variant="subtitle2">Indicador {item}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
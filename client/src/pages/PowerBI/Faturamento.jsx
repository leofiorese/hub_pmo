import React from 'react';
import { Typography, Box } from '@mui/material';
import PowerBIEmbed from '../../components/UI/PowerBIEmbed';

export default function Faturamento() {
  // O link exato que você me passou
  const reportUrl = "https://app.powerbi.com/view?r=eyJrIjoiNWYyOGQzYTYtZDgxYy00YTYxLTg0NGQtZWVjYzRmN2UxMTVjIiwidCI6ImMzN2RhMWY3LWE3MzctNDJjNS1hMDQ1LTIzMGE2NjM2ZjQ0NiJ9";

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
        Dashboard de Faturamento
      </Typography>
      
      {/* Aqui usamos o componente reutilizável */}
      <PowerBIEmbed 
        title="FATURAMENTO" 
        src={reportUrl} 
      />
    </Box>
  );
}
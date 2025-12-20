// client/src/pages/PowerBI/PMO.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';
import PowerBIEmbed from '../../components/UI/PowerBIEmbed';

export default function PMO() {
  // URL extraída do iframe que você enviou
  const reportUrl = "https://app.powerbi.com/view?r=eyJrIjoiNzE4NDdjY2ItZTVhYy00NThiLTg0ZmQtNmY5YmFjOTE1YTQzIiwidCI6ImMzN2RhMWY3LWE3MzctNDJjNS1hMDQ1LTIzMGE2NjM2ZjQ0NiJ9";

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
        Dashboard PMO
      </Typography>
      
      {/* Reutilizando nosso componente de Embed */}
      <PowerBIEmbed 
        title="Dashboard PMO" 
        src={reportUrl} 
      />
    </Box>
  );
}
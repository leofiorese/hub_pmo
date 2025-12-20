import React from 'react';
import { Box, Paper, CircularProgress } from '@mui/material';

const PowerBIEmbed = ({ title, src }) => {
  const [loading, setLoading] = React.useState(true);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        width: '100%', 
        height: 'calc(100vh - 120px)', // Ajuste fino: Altura total menos o Header/Padding
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {loading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 0
          }}
        >
          <CircularProgress />
        </Box>
      )}

      <iframe 
        title={title}
        width="100%" 
        height="100%" 
        src={src} 
        frameBorder="0" 
        allowFullScreen={true}
        onLoad={() => setLoading(false)}
        style={{ position: 'relative', zIndex: 1 }} // Garante que o iframe fique acima do loading
      ></iframe>
    </Paper>
  );
};

export default PowerBIEmbed;
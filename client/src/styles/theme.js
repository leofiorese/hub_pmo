// client/src/styles/theme.js
import { createTheme } from '@mui/material/styles';

// Função que retorna as configurações de design baseadas no modo
export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // --- LIGHT MODE (Padrão Corporativo) ---
          primary: {
            main: '#91121F', // Vermelho Sandech
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#2c3e50',
          },
          background: {
            default: '#F4F6F8', // Cinza gelo para fundo
            paper: '#ffffff',   // Branco para cards
          },
          text: {
            primary: '#1c1e21',
            secondary: '#5c6b7f',
          },
        }
      : {
          // --- DARK MODE (Modo Noturno / "Engenheiro") ---
          primary: {
            main: '#91121F', // Vermelho mais suave para não cansar a vista
            contrastText: '#000000',
          },
          secondary: {
            main: '#90caf9',
          },
          background: {
            default: '#121212', // Cinza muito escuro (Padrão Material)
            paper: '#1E1E1E',   // Cinza chumbo para cards
          },
          text: {
            primary: '#e3f2fd',
            secondary: '#b0bec5',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    // Ajuste global para que os Scrollbars fiquem bonitos no Dark Mode
    MuiCssBaseline: {
      styleOverrides: {
        body: mode === 'dark' ? {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
            border: "3px solid #2b2b2b",
          },
        } : {},
      },
    },
  },
});
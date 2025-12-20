import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Podemos mudar para 'dark' depois via contexto
    primary: {
      main: '#91121F', // Vermelho Sandech (Oficial)
      light: '#c64347',
      dark: '#5e0000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c3e50', // Azul Petróleo (Corporativo)
    },
    background: {
      default: '#F4F6F8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, // Botões sem ALL CAPS
  },
});

export default theme;
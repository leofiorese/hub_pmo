// client/src/contexts/ThemeContext.jsx
import React, { createContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { getDesignTokens } from '../styles/theme';

export const ThemeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light',
});

export const CustomThemeProvider = ({ children }) => {
  // 1. Tenta ler do localStorage, se não tiver, usa 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // 2. Salva no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      // Função que alterna os modos
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  // 3. Cria o tema MUI real baseado no estado atual
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
// client/src/styles/theme.js
import { createTheme } from '@mui/material/styles';

const ROUNDNESS = 16;
const PRIMARY_MAIN = '#91121F';

export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        // LIGHT MODE
        primary: {
          main: PRIMARY_MAIN,
          light: '#C72F3E',
          dark: '#6A0B14',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#2D3748',
        },
        background: {
          default: '#F4F6F8',
          paper: '#ffffff',
        },
        text: {
          primary: '#1A202C',
          secondary: '#718096',
        },
        action: {
          active: '#718096',
          hover: 'rgba(0, 0, 0, 0.04)',
          selected: 'rgba(145, 18, 31, 0.08)',
        }
      }
      : {
        // DARK MODE
        primary: {
          main: '#E53E3E',
          contrastText: '#ffffff',
        },
        secondary: {
          main: '#A0AEC0',
        },
        background: {
          default: '#121212',
          paper: '#1E1E1E',
        },
        text: {
          primary: '#F7FAFC',
          secondary: '#A0AEC0',
        },
        action: {
          active: '#A0AEC0',
          hover: 'rgba(255, 255, 255, 0.08)',
          selected: 'rgba(229, 62, 62, 0.16)',
        }
      }),
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  },
  shape: {
    borderRadius: ROUNDNESS,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
          }
        },
        containedPrimary: {
          background: mode === 'light'
            ? `linear-gradient(45deg, ${PRIMARY_MAIN} 30%, #C72F3E 90%)`
            : undefined,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: ROUNDNESS,
        },
        elevation1: {
          boxShadow: mode === 'light' ? "0px 4px 20px rgba(0,0,0,0.05)" : undefined,
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'light' ? "0px 12px 30px rgba(0,0,0,0.08)" : "0px 8px 24px rgba(0,0,0,0.5)",
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: mode === 'light' ? "0px 20px 60px rgba(0,0,0,0.15)" : undefined,
        },
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '8px 16px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? 'rgba(145, 18, 31, 0.08)' : 'rgba(229, 62, 62, 0.15)',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(145, 18, 31, 0.12)' : 'rgba(229, 62, 62, 0.25)',
            },
            color: mode === 'light' ? PRIMARY_MAIN : '#E53E3E',
            fontWeight: 'bold',
          }
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // FORCE background color to match palette.background.default
          backgroundColor: mode === 'light' ? '#F4F6F8' : '#121212',
          scrollbarColor: mode === 'dark' ? "#6b6b6b #2b2b2b" : "#cbd5e0 #f7fafc",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: '8px',
            height: '8px',
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: mode === 'dark' ? "#6b6b6b" : "#cbd5e0",
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
        }
      },
    },
  },
});
'use client';

import { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Create theme inside the client component
const theme = createTheme({
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  palette: {
    primary: {
      main: '#EE3741',
    },
    secondary: {
      main: '#4CAF50',
    },
    background: {
      default: '#F6F6F6',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 500,
          },
          '& .MuiInputLabel-root.Mui-focused': {
            background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          },
        },
      },
    },
  },
});

interface ThemeRegistryProps {
  children: ReactNode;
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

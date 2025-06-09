'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress 
        size={48} 
        sx={{ 
          color: 'primary.main',
          mb: 2 
        }} 
      />
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'text.secondary',
          fontFamily: 'Inter',
        }}
      >
        Redirecting to login...
      </Typography>
    </Box>
  );
}

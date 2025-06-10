'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  useTheme,
} from '@mui/material';

// Types
interface RemarksData {
  open: { current: number; total: number };
  closed: { current: number; total: number };
}

interface FollowUpsData {
  completed: { current: number; total: number };
  pending: { current: number; total: number };
}

type CardType = 'remarks' | 'followups' | null;

const MyReports: React.FC = () => {
  const [clickedCard, setClickedCard] = useState<CardType>(null);
  const router = useRouter();
  const theme = useTheme();

  // Mock data - replace with real backend data later
  const remarksData: RemarksData = {
    open: { current: 4, total: 5 },
    closed: { current: 7, total: 7 }
  };

  const followUpsData: FollowUpsData = {
    completed: { current: 5, total: 7 },
    pending: { current: 2, total: 10 }
  };

  // Calculate totals (big numbers)
  const totalRemarksDone: number = remarksData.open.current + remarksData.closed.current;
  const totalFollowUpsDone: number = followUpsData.completed.current + followUpsData.pending.current;

  // Calculate progress percentages
  const openProgress: number = remarksData.open.total > 0 ? (remarksData.open.current / remarksData.open.total) * 100 : 0;
  const closedProgress: number = remarksData.closed.total > 0 ? (remarksData.closed.current / remarksData.closed.total) * 100 : 0;
  const completedProgress: number = followUpsData.completed.total > 0 ? (followUpsData.completed.current / followUpsData.completed.total) * 100 : 0;
  const pendingProgress: number = followUpsData.pending.total > 0 ? (followUpsData.pending.current / followUpsData.pending.total) * 100 : 0;

  // Handle card click with animation
  const handleCardClick = (cardType: Exclude<CardType, null>, scrollTarget?: string): void => {
    setClickedCard(cardType);
    
    // Reset animation after 200ms
    setTimeout(() => {
      setClickedCard(null);
      
      // Navigate to working hours page with scroll target
      router.push('/working-hours');
    }, 200);
  };

  // Handle see all button click
  const handleSeeAllClick = (): void => {
    router.push('/working-hours');
  };

  return (
    <Box sx={{ width: '100%', pt: 3, pr: 3, pb: 3, pl: 2}}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.75rem',
            fontWeight: 600,
            margin: 0,
            fontFamily: 'Inter',
          }}
        >
          My Reports
        </Typography>
        
        <Button
          onClick={handleSeeAllClick}
          variant="text"
          sx={{
            background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '1.125rem',
            fontWeight: 500,
            textTransform: 'none',
            fontFamily: 'Inter',
            '&:hover': {
              backgroundColor: 'rgba(238, 55, 65, 0.04)',
              textDecoration: 'underline',
            },
          }}
        >
          See All
        </Button>
      </Box>

      {/* Cards Container */}
      <Box sx={{ display: 'flex', gap: 3, width: '100%', flexWrap: 'wrap' }}>
        
        {/* Remarks Done Card - Clickable */}
        <Paper
          onClick={() => handleCardClick('remarks', 'remarks-section')}
          elevation={clickedCard === 'remarks' ? 8 : 3}
          sx={{
            flex: 1,
            minWidth: 300,
            borderRadius: 5,
            p: 4,
            minHeight: 280,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #FEF6F6 40%, #F9D5BD 100%)',
            transform: clickedCard === 'remarks' ? 'scale(1.05)' : 'scale(1)',
            '&:hover': {
              transform: clickedCard === 'remarks' ? 'scale(1.05)' : 'scale(1.02)',
              elevation: 6,
            },
          }}
        >
          {/* Click ripple effect */}
          {clickedCard === 'remarks' && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 100,
                height: 100,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%) scale(0)',
                pointerEvents: 'none',
                animation: 'ripple 0.6s ease-out',
                '@keyframes ripple': {
                  '0%': {
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) scale(4)',
                    opacity: 0,
                  },
                },
              }}
            />
          )}

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: 'black',
                fontSize: 'clamp(20px, 4vw, 24px)',
                fontWeight: 700,
                margin: 0,
                mb: 2,
                fontFamily: 'Inter',
              }}
            >
              Total Calls
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: 'black',
                fontSize: 'clamp(36px, 8vw, 48px)',
                fontWeight: 800,
                margin: 0,
                fontFamily: 'Inter',
              }}
            >
              {totalRemarksDone}
            </Typography>
          </Box>

          {/* Progress Bars */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Open Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'black', mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  Open
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  {remarksData.open.current}/{remarksData.open.total}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 8, bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#E76D73',
                    borderRadius: 1,
                    transition: 'width 0.3s ease',
                    width: `${openProgress}%`,
                  }}
                />
              </Box>
            </Box>

            {/* Closed Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'black', mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  Closed
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  {remarksData.closed.current}/{remarksData.closed.total}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 8, bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#E76D73',
                    borderRadius: 1,
                    transition: 'width 0.3s ease',
                    width: `${closedProgress}%`,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Follow Ups Done Card - Clickable */}
        <Paper
          onClick={() => handleCardClick('followups', 'followups-section')}
          elevation={clickedCard === 'followups' ? 8 : 3}
          sx={{
            flex: 1,
            minWidth: 300,
            bgcolor: 'white',
            borderRadius: 5,
            p: 4,
            color: '#343C6A',
            minHeight: 280,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'grey.100',
            transform: clickedCard === 'followups' ? 'scale(1.05)' : 'scale(1)',
            '&:hover': {
              transform: clickedCard === 'followups' ? 'scale(1.05)' : 'scale(1.02)',
              elevation: 6,
            },
          }}
        >
          {/* Click ripple effect */}
          {clickedCard === 'followups' && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 100,
                height: 100,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%) scale(0)',
                pointerEvents: 'none',
                animation: 'ripple 0.6s ease-out',
                '@keyframes ripple': {
                  '0%': {
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) scale(4)',
                    opacity: 0,
                  },
                },
              }}
            />
          )}

          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                color: 'black',
                fontSize: 'clamp(20px, 4vw, 24px)',
                fontWeight: 700,
                margin: 0,
                mb: 2,
                fontFamily: 'Inter',
              }}
            >
              Follow Ups Taken
            </Typography>
            <Typography
              variant="h2"
              sx={{
                color: 'black',
                fontSize: 'clamp(36px, 8vw, 48px)',
                fontWeight: 800,
                margin: 0,
                fontFamily: 'Inter',
              }}
            >
              {totalFollowUpsDone}
            </Typography>
          </Box>

          {/* Progress Bars */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Completed Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'black', mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  Completed
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  {followUpsData.completed.current}/{followUpsData.completed.total}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 8, bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#E76D73',
                    borderRadius: 1,
                    transition: 'width 0.3s ease',
                    width: `${completedProgress}%`,
                  }}
                />
              </Box>
            </Box>

            {/* Pending Progress */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'black', mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  Pending
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  {followUpsData.pending.current}/{followUpsData.pending.total}
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 8, bgcolor: 'black', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#E76D73',
                    borderRadius: 1,
                    transition: 'width 0.3s ease',
                    width: `${pendingProgress}%`,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default MyReports;

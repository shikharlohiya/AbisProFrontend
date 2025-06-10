'use client';

import React, { useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  IconButton, 
  Typography,
  Button,
  Avatar,
  Paper
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  PersonAdd as PersonAddIcon,
  CallMerge as CallMergeIcon,
  CallEnd as CallEndIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { useCallState } from '@/components/CallStateContext';
import callingApiService from '@/service/callingApi';
import callStorage from '@/service/callStorage';

// Pulse animation for incoming calls
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CallControls: React.FC = () => {
  const { 
    callState, 
    setCallState, 
    dialedNumber,
    isMuted, 
    setIsMuted, 
    callDuration, 
    setCallDuration 
  } = useCallState();

  // Update call duration for active calls
  useEffect(() => {
    if (callState === 'active') {
      const interval = setInterval(() => {
        setCallDuration(callDuration + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState, callDuration, setCallDuration]);

  // Format duration
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Call action handlers with API integration
  const handleCall = useCallback(async () => {
    try {
      setCallState('connecting');
      setCallDuration(0);
      
      // Get stored phone number from dialer or use dialed number
      const phoneNumber = localStorage.getItem('currentPhoneNumber') || dialedNumber;
      
      const response = await callingApiService.initiateCall(phoneNumber);
      
      if (response.status === 1 && response.message.Response === 'success') {
        const callId = response.message.callid;
        callStorage.setCurrentCall(callId, phoneNumber);
        
        // Simulate connection delay
        setTimeout(() => setCallState('active'), 2000);
      } else {
        throw new Error('Call initiation failed');
      }
    } catch (error) {
      console.error('Call failed:', error);
      setCallState('ended');
    }
  }, [setCallState, setCallDuration, dialedNumber]);

  const handleAccept = useCallback(() => {
    setCallState('active');
    setCallDuration(0);
  }, [setCallState, setCallDuration]);

  const handleReject = useCallback(async () => {
    const callId = callStorage.getCurrentCallId();
    
    if (callId) {
      try {
        await callingApiService.endCall(callId);
      } catch (error) {
        console.error('Failed to end call via API:', error);
      }
      callStorage.endCurrentCall(callDuration);
    }
    
    setCallState('ended');
    setCallDuration(0);
  }, [setCallState, setCallDuration, callDuration]);

  const handleEndCall = useCallback(async () => {
    const callId = callStorage.getCurrentCallId();
    
    if (callId) {
      try {
        await callingApiService.endCall(callId);
        console.log('✅ Call ended via API');
      } catch (error) {
        console.error('❌ Failed to end call via API:', error);
      }
      callStorage.endCurrentCall(callDuration);
    }
    
    setCallState('ended');
    setCallDuration(0);
    setIsMuted(false);
  }, [setCallState, setCallDuration, setIsMuted, callDuration]);

  const handleMute = useCallback(() => {
    setIsMuted(!isMuted);
    // TODO: Implement mute API call when available
    console.log(`🔇 Call ${isMuted ? 'unmuted' : 'muted'}`);
  }, [isMuted, setIsMuted]);

  const handleAddCall = useCallback(() => {
    console.log('📞 Add call functionality - API integration pending');
  }, []);

  const handleMerge = useCallback(() => {
    console.log('🔀 Merge calls functionality - API integration pending');
  }, []);

  // Memoized styles
  const containerStyles = useMemo(() => ({
    bgcolor: 'white',
    borderRadius: 3,
    border: '1px solid #E5E7EB',
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center'
  }), []);

  // Call ended state
  if (callState === 'ended') {
    return (
      <Paper elevation={3} sx={containerStyles}>
        <Typography variant="h6" sx={{ 
          color: '#1F2937', 
          fontWeight: 600, 
          mb: 1,
          fontFamily: 'Inter'
        }}>
          Unknown
        </Typography>
        
        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          mb: 4,
          fontFamily: 'Inter'
        }}>
          {dialedNumber || '+91 00000 00000'}
        </Typography>

        <Button
          onClick={handleCall}
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#22C55E',
            color: 'white',
            minWidth: 'unset',
            '&:hover': {
              backgroundColor: '#16A34A',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease',
            mb: 2
          }}
        >
          <PhoneIcon sx={{ fontSize: 32 }} />
        </Button>

        <Typography variant="body2" sx={{ 
          color: '#6B7280',
          fontFamily: 'Inter',
          fontWeight: 500
        }}>
          Call Again
        </Typography>
      </Paper>
    );
  }

  // Incoming call state
  if (callState === 'incoming') {
    return (
      <Paper elevation={3} sx={containerStyles}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: '#3B82F6',
            fontSize: 36,
            fontWeight: 'bold',
            mb: 3,
            animation: `${pulseAnimation} 2s infinite`
          }}
        >
          U
        </Avatar>

        <Typography variant="h6" sx={{ 
          color: '#1F2937', 
          fontWeight: 600, 
          mb: 1,
          fontFamily: 'Inter'
        }}>
          Unknown
        </Typography>
        
        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          mb: 2,
          fontFamily: 'Inter'
        }}>
          {dialedNumber || '+91 00000 00000'}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 4,
          color: '#6B7280'
        }}>
          <PhoneIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontFamily: 'Inter' }}>
            incoming...
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button
            onClick={handleReject}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              color: 'white',
              minWidth: 'unset',
              '&:hover': {
                backgroundColor: '#DC2626',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CallEndIcon sx={{ fontSize: 24 }} />
          </Button>

          <Typography variant="body2" sx={{ 
            alignSelf: 'center',
            color: '#6B7280',
            fontFamily: 'Inter',
            mx: 2
          }}>
            Reject
          </Typography>

          <Typography variant="body2" sx={{ 
            alignSelf: 'center',
            color: '#6B7280',
            fontFamily: 'Inter',
            mx: 2
          }}>
            Accept
          </Typography>

          <Button
            onClick={handleAccept}
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#22C55E',
              color: 'white',
              minWidth: 'unset',
              '&:hover': {
                backgroundColor: '#16A34A',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <PhoneIcon sx={{ fontSize: 24 }} />
          </Button>
        </Box>
      </Paper>
    );
  }

  // Active/Connecting call state
  return (
    <Paper elevation={3} sx={containerStyles}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: '#3B82F6',
          fontSize: 28,
          fontWeight: 'bold',
          mb: 2
        }}
      >
        U
      </Avatar>

      <Typography variant="h6" sx={{ 
        color: '#1F2937', 
        fontWeight: 600, 
        mb: 1,
        fontFamily: 'Inter'
      }}>
        Unknown
      </Typography>
      
      <Typography variant="body2" sx={{ 
        color: '#6B7280', 
        mb: 1,
        fontFamily: 'Inter'
      }}>
        {dialedNumber || '+91 00000 00000'}
      </Typography>

      {/* Call Duration */}
      <Typography variant="body1" sx={{ 
        color: callState === 'connecting' ? '#F59E0B' : '#22C55E',
        fontFamily: 'monospace',
        fontWeight: 600,
        mb: 3
      }}>
        {callState === 'connecting' ? 'Connecting...' : formatDuration(callDuration)}
      </Typography>

      {/* Call Controls Grid */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 3,
        mb: 4,
        width: '100%',
        maxWidth: 240
      }}>
        {/* Add Call */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleAddCall}
            disabled={callState === 'connecting'}
            sx={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              width: 56,
              height: 56,
              '&:hover': {
                backgroundColor: '#E5E7EB',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                backgroundColor: '#F9FAFB',
                color: '#D1D5DB'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <PersonAddIcon />
          </IconButton>
          <Typography variant="caption" sx={{ 
            mt: 1, 
            color: '#6B7280',
            fontFamily: 'Inter'
          }}>
            Add Call
          </Typography>
        </Box>

        {/* Mute */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleMute}
            disabled={callState === 'connecting'}
            sx={{
              backgroundColor: isMuted ? '#EF4444' : '#F3F4F6',
              color: isMuted ? 'white' : '#6B7280',
              width: 56,
              height: 56,
              '&:hover': {
                backgroundColor: isMuted ? '#DC2626' : '#E5E7EB',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                backgroundColor: '#F9FAFB',
                color: '#D1D5DB'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isMuted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          <Typography variant="caption" sx={{ 
            mt: 1, 
            color: '#6B7280',
            fontFamily: 'Inter'
          }}>
            Mute
          </Typography>
        </Box>

        {/* Merge */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleMerge}
            disabled={callState === 'connecting'}
            sx={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              width: 56,
              height: 56,
              '&:hover': {
                backgroundColor: '#E5E7EB',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                backgroundColor: '#F9FAFB',
                color: '#D1D5DB'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CallMergeIcon />
          </IconButton>
          <Typography variant="caption" sx={{ 
            mt: 1, 
            color: '#6B7280',
            fontFamily: 'Inter'
          }}>
            Merge
          </Typography>
        </Box>
      </Box>

      {/* End Call Button */}
      <Button
        onClick={handleEndCall}
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#EF4444',
          color: 'white',
          minWidth: 'unset',
          '&:hover': {
            backgroundColor: '#DC2626',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <CallEndIcon sx={{ fontSize: 28 }} />
      </Button>
    </Paper>
  );
};

export default React.memo(CallControls);

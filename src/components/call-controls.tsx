'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { 
  Box, 
  IconButton, 
  Typography,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  PersonAdd as PersonAddIcon,
  CallEnd as CallEndIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { useCallState } from '@/components/CallStateContext';
import { useSocket } from '@/components/socket-context';

// Pulse animation for incoming calls
const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CallControls: React.FC = () => {
  const { 
    callState, 
    dialedNumber,
    currentCallId,
    callError,
    endCall,
    resetCallState,
    // ✅ LEGACY PATTERN: Use legacy state variables
    isConnected,
    timer,
    getCallStatus,
    // ✅ NEW: Last called number for callback
    lastCalledNumber,
    initiateCall,
    // ✅ NEW: Hold/Resume functionality
    isOnHold,
    holdOrResumeCall,
    // ✅ NEW: Merge call functionality
    mergeCall
  } = useCallState();

  const { isConnected: socketConnected } = useSocket();

  // ✅ NEW: Add call input state
  const [showAddCallInput, setShowAddCallInput] = useState(false);
  const [addCallNumber, setAddCallNumber] = useState('');
  
  // ✅ NEW: Customer name state (defaulting to 'Unknown')
  const [customerName, setCustomerName] = useState('Unknown');

  // ✅ FIXED: Display both numbers when both calls are active
  const displayNumbers = useMemo(() => {
    const numbers = [dialedNumber, lastCalledNumber].filter(Boolean);
    return numbers.length > 1 ? numbers.join(' / ') : numbers[0] || '';
  }, [dialedNumber, lastCalledNumber]);

  // ✅ LEGACY PATTERN: Format timer like legacy
  const formatTimer = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Call action handlers
  const handleCall = useCallback(async () => {
    if (!socketConnected) {
      console.error('Cannot initiate call - no socket connection');
      return;
    }

    try {
      if (lastCalledNumber) {
        console.log('📞 CallControls: Callback to:', lastCalledNumber);
        await initiateCall(lastCalledNumber);
      }
    } catch (error) {
      console.error('📞 CallControls: Callback failed:', error);
    }
  }, [socketConnected, lastCalledNumber, initiateCall]);

  const handleEndCall = useCallback(async () => {
    console.log('📞 CallControls: Ending call');
    
    try {
      await endCall();
    } catch (error) {
      console.error('❌ CallControls: Failed to end call:', error);
      resetCallState();
    }
  }, [endCall, resetCallState]);

  // ✅ NEW: Add call handler with input toggle
  const handleAddCall = useCallback(() => {
    setShowAddCallInput(true);
    setAddCallNumber('');
  }, []);

  // ✅ NEW: Submit merge call
  const handleSubmitMergeCall = useCallback(async () => {
    if (!addCallNumber.trim()) return;
    
    try {
      console.log('📞 CallControls: Merging call with:', addCallNumber);
      await mergeCall(addCallNumber.trim());
      
      // Reset input state
      setShowAddCallInput(false);
      setAddCallNumber('');
    } catch (error) {
      console.error('❌ CallControls: Failed to merge call:', error);
    }
  }, [addCallNumber, mergeCall]);

  // ✅ NEW: Cancel add call
  const handleCancelAddCall = useCallback(() => {
    setShowAddCallInput(false);
    setAddCallNumber('');
  }, []);

  // ✅ NEW: Handle Enter key in input
  const handleAddCallKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmitMergeCall();
    } else if (event.key === 'Escape') {
      handleCancelAddCall();
    }
  }, [handleSubmitMergeCall, handleCancelAddCall]);

  // ✅ NEW: Hold/Resume handler
  const handleHoldResume = useCallback(async () => {
    try {
      await holdOrResumeCall();
    } catch (error) {
      console.error('❌ CallControls: Failed to hold/resume call:', error);
    }
  }, [holdOrResumeCall]);

  // Get contact initials from phone number
  const getContactInitials = useCallback((phoneNumber: string): string => {
    if (!phoneNumber) return 'UN';
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.slice(-2) || 'UN';
  }, []);

  // ✅ FIXED: Simplified status display (no duplication)
  const getCallStatusInfo = useCallback(() => {
    const status = getCallStatus();
    
    switch (status) {
      case 'Ringing Agent...':
        return { 
          color: '#F59E0B', 
          displayText: 'Ringing Agent...'
        };
      case 'Ringing Customer...':
        return { 
          color: '#3B82F6', 
          displayText: 'Ringing Customer...'
        };
      case 'Connected':
        return { 
          color: '#22C55E', 
          displayText: 'Connected'
        };
      case 'On Hold':
        return { 
          color: '#F59E0B', 
          displayText: 'On Hold'
        };
      case 'Call Ended':
        return { 
          color: '#6B7280', 
          displayText: 'Call Ended'
        };
      case 'Call Failed':
        return { 
          color: '#EF4444', 
          displayText: 'Call Failed'
        };
      default:
        return { 
          color: '#6B7280', 
          displayText: 'Ready'
        };
    }
  }, [getCallStatus]);

  const containerStyles = useMemo(() => ({
    bgcolor: 'white',
    borderRadius: 3,
    border: '1px solid #E5E7EB',
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    minHeight: '400px'
  }), []);

  const statusInfo = getCallStatusInfo();

  // Call ended state with callback functionality
  if (callState === 'ended' || callState === 'idle' || callState === 'failed') {
    return (
      <Paper elevation={3} sx={containerStyles}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: callState === 'failed' ? '#EF4444' : '#6B7280',
            fontSize: 28,
            fontWeight: 'bold',
            mb: 2
          }}
        >
          {getContactInitials(displayNumbers)}
        </Avatar>

        <Typography variant="h6" sx={{ 
          color: '#1F2937', 
          fontWeight: 600, 
          mb: 1,
          fontFamily: 'Inter'
        }}>
          {callState === 'failed' ? 'Call Failed' : 
           lastCalledNumber ? 'Call Back' : 'Ready'}
        </Typography>
        
        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          mb: 1,
          fontFamily: 'Inter'
        }}>
          {displayNumbers || '+91 00000 00000'}
        </Typography>

        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          mb: 4,
          fontFamily: 'Inter'
        }}>
          {customerName}
        </Typography>

        {/* Call Error Display */}
        {callError && (
          <Typography variant="body2" sx={{ 
            color: '#EF4444', 
            mb: 2,
            fontFamily: 'Inter',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            {callError}
          </Typography>
        )}

        {/* Callback Button */}
        {lastCalledNumber && (
          <Button
            onClick={handleCall}
            disabled={!socketConnected}
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: socketConnected ? '#22C55E' : '#D1D5DB',
              color: 'white',
              minWidth: 'unset',
              '&:hover': {
                backgroundColor: socketConnected ? '#16A34A' : '#D1D5DB',
                transform: socketConnected ? 'scale(1.05)' : 'none'
              },
              '&:disabled': {
                backgroundColor: '#D1D5DB',
                color: '#9CA3AF'
              },
              transition: 'all 0.2s ease',
              mb: 2
            }}
          >
            <PhoneIcon sx={{ fontSize: 32 }} />
          </Button>
        )}

        <Typography variant="body2" sx={{ 
          color: '#6B7280',
          fontFamily: 'Inter',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          {lastCalledNumber ? 'Call Back' : 'No Recent Call'}
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
          {getContactInitials(displayNumbers)}
        </Avatar>

        <Typography variant="h6" sx={{ 
          color: '#1F2937', 
          fontWeight: 600, 
          mb: 1,
          fontFamily: 'Inter'
        }}>
          Incoming Call
        </Typography>
        
        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          mb: 1,
          fontFamily: 'Inter'
        }}>
          {displayNumbers || '+91 00000 00000'}
        </Typography>

        <Typography variant="body2" sx={{ 
          color: '#6B7280', 
          mb: 2,
          fontFamily: 'Inter'
        }}>
          {customerName}
        </Typography>

        <Box sx={{ display: 'flex', gap: 4 }}>
          <Button
            onClick={handleEndCall}
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

          <Button
            onClick={handleCall}
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

  // ✅ UPDATED: Active call state with clean design
  return (
    <Paper elevation={3} sx={containerStyles}>
      {/* Avatar */}
      <Avatar
        sx={{
          width: 90,
          height: 90,
          bgcolor: statusInfo.color,
          fontSize: 32,
          fontWeight: 'bold',
          mb: 2
        }}
      >
        {getContactInitials(displayNumbers)}
      </Avatar>

      {/* ✅ FIXED: Single status display (no duplication) */}
      <Typography variant="h6" sx={{ 
        color: statusInfo.color, 
        fontWeight: 600, 
        mb: 1,
        fontFamily: 'Inter'
      }}>
        {statusInfo.displayText}
      </Typography>
      
      {/* ✅ FIXED: Phone Number(s) - shows both when both calls active */}
      <Typography variant="body1" sx={{ 
        color: '#1F2937', 
        mb: 1,
        fontFamily: 'Inter',
        fontWeight: 500,
        textAlign: 'center'
      }}>
        {displayNumbers || '+91 00000 00000'}
      </Typography>

      {/* ✅ NEW: Customer Name */}
      <Typography variant="body2" sx={{ 
        color: '#6B7280', 
        mb: 2,
        fontFamily: 'Inter'
      }}>
        {customerName}
      </Typography>

      {/* Timer Display */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        {!isConnected && (
          <CircularProgress size={16} sx={{ color: statusInfo.color }} />
        )}
        <Typography variant="h5" sx={{ 
          color: statusInfo.color,
          fontFamily: 'monospace',
          fontWeight: 600
        }}>
          {isOnHold ? `On Hold - ${formatTimer(timer)}` : formatTimer(timer)}
        </Typography>
      </Box>

      {/* ✅ NEW: Add Call Input Field */}
      {showAddCallInput && (
        <Box sx={{ 
          width: '100%', 
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Enter phone number"
            value={addCallNumber}
            onChange={(e) => setAddCallNumber(e.target.value)}
            onKeyDown={handleAddCallKeyPress}
            sx={{
              maxWidth: '280px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#F9FAFB'
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSubmitMergeCall}
                    disabled={!addCallNumber.trim()}
                    size="small"
                    sx={{ 
                      color: '#22C55E',
                      '&:disabled': { color: '#D1D5DB' }
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={handleCancelAddCall}
                    size="small"
                    sx={{ color: '#EF4444', ml: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Typography variant="caption" sx={{ 
            mt: 1, 
            color: '#6B7280',
            fontFamily: 'Inter'
          }}>
            Press Enter to merge call or Escape to cancel
          </Typography>
        </Box>
      )}

      {/* ✅ UPDATED: Three buttons in a row with proper spacing */}
      <Box sx={{ 
        display: 'flex',
        gap: 3,
        mb: 4,
        alignItems: 'center'
      }}>
        {/* Add Call Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleAddCall}
            disabled={!isConnected || showAddCallInput}
            sx={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              width: 60,
              height: 60,
              borderRadius: 2,
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
            <PersonAddIcon sx={{ fontSize: 24 }} />
          </IconButton>
          <Typography variant="caption" sx={{ 
            mt: 1, 
            color: '#6B7280',
            fontFamily: 'Inter',
            fontSize: '0.75rem'
          }}>
            Add Call
          </Typography>
        </Box>

        {/* Hold/Resume Button */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <IconButton
            onClick={handleHoldResume}
            disabled={!isConnected}
            sx={{
              backgroundColor: isOnHold ? '#F59E0B' : '#F3F4F6',
              color: isOnHold ? 'white' : '#6B7280',
              width: 60,
              height: 60,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: isOnHold ? '#D97706' : '#E5E7EB',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                backgroundColor: '#F9FAFB',
                color: '#D1D5DB'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isOnHold ? <PlayArrowIcon sx={{ fontSize: 24 }} /> : <PauseIcon sx={{ fontSize: 24 }} />}
          </IconButton>
          <Typography variant="caption" sx={{ 
            mt: 1, 
            color: '#6B7280',
            fontFamily: 'Inter',
            fontSize: '0.75rem'
          }}>
            {isOnHold ? 'Resume' : 'Hold'}
          </Typography>
        </Box>
      </Box>

      {/* ✅ FIXED: End Call Button - Perfect Circle */}
      <Button
        onClick={handleEndCall}
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: '#EF4444',
          color: 'white',
          minWidth: 'unset',
          aspectRatio: '1/1',
          '&:hover': {
            backgroundColor: '#DC2626',
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}
      >
        <CallEndIcon sx={{ fontSize: 32 }} />
      </Button>
    </Paper>
  );
};

export default React.memo(CallControls);

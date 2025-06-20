'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  useTheme,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Phone as PhoneIcon, Backspace as BackspaceIcon } from '@mui/icons-material';
import { useCallState } from '@/components/CallStateContext';
import { useSocket } from '@/components/socket-context';

// Local dialer states (different from global CallState)
type LocalDialerState = 'idle' | 'dialing' | 'failed';
type KeypadButton = number | '*' | '#';

interface DialerProps {
  isCollapsed?: boolean;
  initialNumber?: string;
  onCall?: () => void;
}

const Dialer: React.FC<DialerProps> = ({ 
  isCollapsed = false, 
  initialNumber, 
  onCall
}) => {
  // Global call state management
  const { 
    callState, 
    dialedNumber, 
    setDialedNumber, 
    currentCallId,
    callError,
    initiateCall,
    resetCallState
  } = useCallState();
  
  // Socket connection
  const { isConnected: socketConnected } = useSocket();
  
  // Local dialer state
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [localDialerState, setLocalDialerState] = useState<LocalDialerState>('idle');
  const [clickedButton, setClickedButton] = useState<KeypadButton | 'backspace' | null>(null);
  const [isDialerFocused, setIsDialerFocused] = useState<boolean>(false);
  const [lastInitialNumber, setLastInitialNumber] = useState<string>('');
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [isInitiating, setIsInitiating] = useState(false);
  
  // ✅ NEW: Track if we should clear on next idle state
  const [shouldClearOnIdle, setShouldClearOnIdle] = useState(false);
  
  const dialerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // ✅ FIXED: Only listen for clear events, don't auto-clear on every change
  useEffect(() => {
    const handleClearDialer = () => {
      console.log('🧹 Dialer received clear event');
      setPhoneNumber('');
      setIsInitiating(false);
      setLocalDialerState('idle');
      setShouldClearOnIdle(false);
    };

    window.addEventListener('clearDialer', handleClearDialer);
    
    return () => {
      window.removeEventListener('clearDialer', handleClearDialer);
    };
  }, []);

  // Memoized keypad layout
  const keypadRows: KeypadButton[][] = useMemo(() => [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['*', 0, '#']
  ], []);

  // Memoized time formatting function
  const formatTime = useCallback((date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    };
    const time = date.toLocaleTimeString('en-US', options);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    return `🇮🇳 ${time} IST, ${dateStr}`;
  }, []);

  // Memoized phone number formatting
  const formatPhoneDisplay = useCallback((number: string): string => {
    if (number.length === 0) return '+91';
    return `+91 ${number}`;
  }, []);

  // Memoized status message
  const getStatusMessage = useCallback((): string => {
    // Show call state if there's an active call
    if (callState !== 'idle') {
      switch (callState) {
        case 'connecting':
          return `📞 Connecting to +91 ${phoneNumber}...`;
        case 'active':
          return `📞 Call Active - +91 ${phoneNumber}`;
        case 'ended':
          return `📞 Call Ended`;
        default:
          return `📞 ${callState}`;
      }
    }
    
    // Show socket connection status
    if (!socketConnected) {
      return '🔴 Offline - No connection';
    }
    
    // Show local dialer state
    switch (localDialerState) {
      case 'idle':
        return `${formatTime(currentTime)} ${isDialerFocused ? '⌨️' : ''}`;
      case 'dialing':
        return `📞 Initiating call...`;
      case 'failed':
        return '❌ Call failed - Try again';
      default:
        return '';
    }
  }, [callState, localDialerState, currentTime, isDialerFocused, phoneNumber, socketConnected, formatTime]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync with global dialed number
  useEffect(() => {
    if (dialedNumber && dialedNumber !== phoneNumber) {
      // Extract number from formatted string like "+91 98765 43210"
      const cleanNumber = dialedNumber.replace(/^\+91\s*/, '').replace(/\s/g, '');
      setPhoneNumber(cleanNumber);
    }
  }, [dialedNumber, phoneNumber]);

  // ✅ FIXED: Only clear when call actually ends, not on every state change
  useEffect(() => {
    switch (callState) {
      case 'connecting':
        setLocalDialerState('idle');
        setIsInitiating(false);
        if (onCall) {
          onCall(); // Switch to call interface
        }
        break;
      case 'active':
        setLocalDialerState('idle');
        setIsInitiating(false);
        break;
      case 'ended':
        setLocalDialerState('idle');
        setIsInitiating(false);
        // ✅ FIXED: Mark for clearing but don't clear immediately
        setShouldClearOnIdle(true);
        break;
      case 'failed':
        setLocalDialerState('failed');
        setIsInitiating(false);
        // ✅ FIXED: Mark for clearing but don't clear immediately
        setShouldClearOnIdle(true);
        break;
      case 'idle':
        setLocalDialerState('idle');
        setIsInitiating(false);
        // ✅ FIXED: Only clear if we're supposed to clear
        if (shouldClearOnIdle) {
          console.log('🧹 Clearing dialer after call ended');
          setPhoneNumber('');
          setShouldClearOnIdle(false);
        }
        break;
    }
  }, [callState, onCall, shouldClearOnIdle]); // ✅ REMOVED phoneNumber dependency

  // Handle call errors
  useEffect(() => {
    if (callError) {
      setError(callError);
      setShowError(true);
      setLocalDialerState('failed');
      setIsInitiating(false);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setLocalDialerState('idle');
      }, 5000);
    }
  }, [callError]);

  // Keyboard handler
  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
    if (!isDialerFocused) return;
    
    const key = event.key;
    
    if (/^[0-9]$/.test(key) && phoneNumber.length < 10) {
      event.preventDefault();
      setPhoneNumber(prev => prev + key);
    }
    else if ((key === '*' || key === '#') && phoneNumber.length < 10) {
      event.preventDefault();
      setPhoneNumber(prev => prev + key);
    }
    else if (key === 'Backspace') {
      event.preventDefault();
      setPhoneNumber(prev => prev.slice(0, -1));
    }
    else if (key === 'Enter' && phoneNumber.length === 10) {
      event.preventDefault();
      handleCall();
    }
  }, [phoneNumber, isDialerFocused]);

  // Handle keyboard input
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Click outside handler
  const handleClickOutside = useCallback((event: MouseEvent): void => {
    if (dialerRef.current && !dialerRef.current.contains(event.target as Node)) {
      setIsDialerFocused(false);
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Handle initial number from URL parameters or recent calls
  useEffect(() => {
    if (initialNumber && initialNumber !== lastInitialNumber && initialNumber !== phoneNumber) {
      const cleanNumber = initialNumber.replace(/^\+91\s*/, '').replace(/\s/g, '');
      setPhoneNumber(cleanNumber);
      setLastInitialNumber(initialNumber);
      setTimeout(() => {
        if (dialerRef.current) {
          dialerRef.current.focus();
          setIsDialerFocused(true);
        }
      }, 100);
    }
  }, [initialNumber, lastInitialNumber, phoneNumber]);

  // ✅ FIXED: Keypad button handler - no clearing logic here
  const handleKeypadClick = useCallback((digit: KeypadButton): void => {
    if (phoneNumber.length < 10) {
      setClickedButton(digit);
      setPhoneNumber(prev => prev + digit.toString());
      setTimeout(() => setClickedButton(null), 200);
    }
  }, [phoneNumber.length]);

  // ✅ FIXED: Backspace handler - no clearing logic here
  const handleBackspace = useCallback((): void => {
    setClickedButton('backspace');
    setPhoneNumber(prev => prev.slice(0, -1));
    setTimeout(() => setClickedButton(null), 200);
    
    if (dialerRef.current) {
      dialerRef.current.focus();
      setIsDialerFocused(true);
    }
  }, []);

  // Enhanced call handler with real API integration
  const handleCall = useCallback(async (): Promise<void> => {
    if (phoneNumber.length !== 10 || isInitiating || callState !== 'idle') return;

    // Check socket connection
    if (!socketConnected) {
      setError('No connection - Please check your internet');
      setShowError(true);
      return;
    }

    setIsInitiating(true);
    setLocalDialerState('dialing');
    setError(null);
    
    try {
      console.log('📞 Dialer: Starting call to:', `+91${phoneNumber}`);
      
      // Format and store dialed number
      const formattedNumber = `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
      setDialedNumber(formattedNumber);
      
      // Use the enhanced initiateCall from CallStateContext
      await initiateCall(`+91${phoneNumber}`);
      
      console.log('📞 Dialer: Call initiated successfully');
      
    } catch (error: any) {
      console.error('📞 Dialer: Call failed:', error);
      setError(error.message || 'Failed to initiate call');
      setShowError(true);
      setLocalDialerState('failed');
      setIsInitiating(false);
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setLocalDialerState('idle');
      }, 3000);
    }
  }, [phoneNumber, isInitiating, callState, socketConnected, setDialedNumber, initiateCall]);

  // Dialer focus handler
  const handleDialerClick = useCallback((): void => {
    setIsDialerFocused(true);
    if (dialerRef.current) {
      dialerRef.current.focus();
    }
  }, []);

  // Error close handler
  const handleCloseError = useCallback(() => {
    setShowError(false);
  }, []);

  // Button state calculations
  const isCallButtonEnabled = useMemo(() => 
    phoneNumber.length === 10 && 
    callState === 'idle' && 
    !isInitiating && 
    socketConnected, 
    [phoneNumber.length, callState, isInitiating, socketConnected]
  );

  const isKeypadDisabled = useMemo(() => 
    phoneNumber.length >= 10 || 
    isInitiating || 
    callState !== 'idle',
    [phoneNumber.length, isInitiating, callState]
  );

  return (
    <>
      <Box sx={{ 
        width: '100%',
        height: '100%',
        p: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box
          ref={dialerRef}
          onClick={handleDialerClick}
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
            boxShadow: isDialerFocused 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: isDialerFocused ? '2px solid #2563eb' : '1px solid #f3f4f6',
            position: 'relative',
          }}
          tabIndex={0}
        >
          {/* Focus Indicator */}
          {isDialerFocused && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: socketConnected ? '#2563eb' : '#ef4444',
                zIndex: 10,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
            />
          )}

          {/* Phone Number Display */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              px: 2.5,
              pt: 2,
              pb: 1.5,
              borderBottom: '1px solid #e5e7eb',
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'Inter',
                letterSpacing: 'wide',
                flex: 1,
              }}
            >
              {formatPhoneDisplay(phoneNumber)}
            </Typography>
            
            {/* Backspace Button */}
            {phoneNumber.length > 0 && !isInitiating && (
              <IconButton
                onClick={handleBackspace}
                disabled={isKeypadDisabled}
                sx={{
                  bgcolor: 'transparent',
                  p: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  transform: clickedButton === 'backspace' ? 'scale(0.9)' : 'scale(1)',
                  '&:hover': { bgcolor: '#f3f4f6' },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                <BackspaceIcon sx={{ width: 20, height: 20, color: '#6b7280' }} />
              </IconButton>
            )}
          </Box>

          {/* Status Bar */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              px: 2.5,
              py: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              borderTop: `1px solid ${socketConnected ? '#3b82f6' : '#ef4444'}`,
              bgcolor: !socketConnected ? '#FEF2F2' : 
                       callState === 'connecting' ? '#FEF3C7' :
                       callState === 'active' ? '#ECFDF5' :
                       localDialerState === 'failed' ? '#FEF2F2' : '#eff6ff',
              animation: (isInitiating || callState === 'connecting') ? 
                'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Inter',
                fontSize: '0.75rem',
                fontWeight: 500,
                lineHeight: 1.25,
                textAlign: 'center',
                color: !socketConnected ? '#dc2626' :
                       callState === 'connecting' ? '#d97706' :
                       callState === 'active' ? '#059669' :
                       localDialerState === 'failed' ? '#dc2626' : '#374151',
              }}
            >
              {getStatusMessage()}
            </Typography>
          </Box>

          {/* Keypad */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            flex: 1,
            minHeight: 0
          }}>
            {keypadRows.map((row, rowIndex) => (
              <Box 
                key={rowIndex}
                sx={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flex: 1,
                  borderBottom: rowIndex < keypadRows.length - 1 ? '1px solid #e5e7eb' : 'none',
                }}
              >
                {row.map((button, buttonIndex) => (
                  <Button
                    key={button}
                    onClick={() => handleKeypadClick(button)}
                    disabled={isKeypadDisabled}
                    sx={{
                      display: 'flex',
                      height: '100%',
                      py: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1,
                      border: 'none',
                      bgcolor: 'transparent',
                      transition: 'all 0.3s ease',
                      borderRight: buttonIndex !== row.length - 1 ? '1px solid #e5e7eb' : 'none',
                      cursor: isKeypadDisabled ? 'not-allowed' : 'pointer',
                      transform: clickedButton === button ? 'scale(0.95)' : 'scale(1)',
                      minWidth: 'auto',
                      borderRadius: 0,
                      '&:hover': {
                        bgcolor: isKeypadDisabled ? 'transparent' : '#f9fafb',
                      },
                      '&:disabled': { color: '#9ca3af' },
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: 'center',
                        fontFamily: 'Inter',
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        lineHeight: 2,
                        letterSpacing: 'tight',
                        color: isKeypadDisabled ? '#9ca3af' : '#374151',
                      }}
                    >
                      {button}
                    </Typography>
                  </Button>
                ))}
              </Box>
            ))}
          </Box>

          {/* Call Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid #e5e7eb',
              flexShrink: 0,
            }}
          >
            <IconButton
              onClick={handleCall}
              disabled={!isCallButtonEnabled}
              sx={{
                display: 'flex',
                width: 56,
                height: 56,
                p: 2,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
                border: '1px solid',
                transition: 'all 0.3s ease',
                bgcolor: isCallButtonEnabled ? '#22c55e' : '#f3f4f6',
                borderColor: isCallButtonEnabled ? '#22c55e' : '#d1d5db',
                cursor: isCallButtonEnabled ? 'pointer' : 'not-allowed',
                transform: isCallButtonEnabled ? 'scale(1)' : 'scale(0.95)',
                boxShadow: isCallButtonEnabled ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none',
                '&:hover': {
                  bgcolor: isCallButtonEnabled ? '#16a34a' : '#f3f4f6',
                },
              }}
            >
              {isInitiating ? (
                <CircularProgress size={22} sx={{ color: 'white' }} />
              ) : (
                <PhoneIcon
                  sx={{
                    width: 22,
                    height: 22,
                    color: isCallButtonEnabled ? 'white' : '#9ca3af',
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Dialer;

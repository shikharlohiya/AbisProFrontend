'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { Phone as PhoneIcon, Backspace as BackspaceIcon } from '@mui/icons-material';

// Types
type CallState = 'idle' | 'ringing' | 'failed';
type KeypadButton = number | '*' | '#';

interface DialerProps {
  isCollapsed?: boolean;
  initialNumber?: string;
}

const Dialer: React.FC<DialerProps> = ({ isCollapsed = false, initialNumber }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [callState, setCallState] = useState<CallState>('idle');
  const [clickedButton, setClickedButton] = useState<KeypadButton | 'backspace' | null>(null);
  const [isDialerFocused, setIsDialerFocused] = useState<boolean>(false);
  const [lastInitialNumber, setLastInitialNumber] = useState<string>('');
  const dialerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const theme = useTheme();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle keyboard input - ONLY when dialer is focused
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phoneNumber, isDialerFocused]);

  // Handle click outside to unfocus dialer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dialerRef.current && !dialerRef.current.contains(event.target as Node)) {
        setIsDialerFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle initial number from recent calls
  useEffect(() => {
    if (initialNumber && initialNumber !== lastInitialNumber && initialNumber !== phoneNumber) {
      setPhoneNumber(initialNumber);
      setLastInitialNumber(initialNumber);
      setTimeout(() => {
        if (dialerRef.current) {
          dialerRef.current.focus();
          setIsDialerFocused(true);
        }
      }, 100);
    }
  }, [initialNumber, lastInitialNumber, phoneNumber]);

  // Format time display
  const formatTime = (date: Date): string => {
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
    return `${time} IST, ${dateStr}`;
  };

  // Format phone number display
  const formatPhoneDisplay = (number: string): string => {
    if (number.length === 0) return '+91';
    return `+91 ${number}`;
  };

  // Handle keypad button click
  const handleKeypadClick = (digit: KeypadButton): void => {
    if (phoneNumber.length < 10) {
      setClickedButton(digit);
      setPhoneNumber(prev => prev + digit.toString());
      setTimeout(() => setClickedButton(null), 200);
    }
  };

  // Handle backspace
  const handleBackspace = (): void => {
    setClickedButton('backspace');
    setPhoneNumber(prev => {
      const newNumber = prev.slice(0, -1);
      return newNumber;
    });
    setTimeout(() => setClickedButton(null), 200);
    
    if (dialerRef.current) {
      dialerRef.current.focus();
      setIsDialerFocused(true);
    }
  };

  // Handle call button click
  const handleCall = (): void => {
    if (phoneNumber.length === 10) {
      setCallState('ringing');
      
      setTimeout(() => {
        const callSuccess = Math.random() > 0.4;
        
        if (callSuccess) {
          router.push(`/active-call?phone=${encodeURIComponent(`+91${phoneNumber}`)}`);
        } else {
          setCallState('failed');
          setTimeout(() => {
            setCallState('idle');
          }, 3000);
        }
      }, 5000);
    }
  };

  // Handle dialer focus
  const handleDialerClick = (): void => {
    setIsDialerFocused(true);
    if (dialerRef.current) {
      dialerRef.current.focus();
    }
  };

  // Keypad layout
  const keypadRows: KeypadButton[][] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['*', 0, '#']
  ];

  const getStatusMessage = (): string => {
    switch (callState) {
      case 'idle':
        return `🇮🇳 ${formatTime(currentTime)} ${isDialerFocused ? '⌨️' : ''}`;
      case 'ringing':
        return `📞 Ringing... +91 ${phoneNumber}`;
      case 'failed':
        return '❌ Call didn\'t connect';
      default:
        return '';
    }
  };

  return (
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
              bgcolor: '#2563eb',
              zIndex: 10,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  opacity: 1,
                },
                '50%': {
                  opacity: 0.5,
                },
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
          {phoneNumber.length > 0 && (
            <IconButton
              onClick={handleBackspace}
              sx={{
                bgcolor: 'transparent',
                p: 1,
                borderRadius: 2,
                transition: 'all 0.2s',
                transform: clickedButton === 'backspace' ? 'scale(0.9)' : 'scale(1)',
                '&:hover': {
                  bgcolor: '#f3f4f6',
                },
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
            borderTop: '1px solid #3b82f6',
            bgcolor: '#eff6ff',
            animation: callState === 'ringing' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
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
              color: callState === 'failed' ? '#dc2626' : '#374151',
            }}
          >
            {getStatusMessage()}
          </Typography>
        </Box>

        {/* Keypad - Takes remaining space */}
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
                  disabled={phoneNumber.length >= 10}
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
                    cursor: phoneNumber.length >= 10 ? 'not-allowed' : 'pointer',
                    transform: clickedButton === button ? 'scale(0.95)' : 'scale(1)',
                    minWidth: 'auto',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: phoneNumber.length >= 10 ? 'transparent' : '#f9fafb',
                    },
                    '&:disabled': {
                      color: '#9ca3af',
                    },
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
                      color: phoneNumber.length >= 10 ? '#9ca3af' : '#374151',
                    }}
                  >
                    {button}
                  </Typography>
                </Button>
              ))}
            </Box>
          ))}
        </Box>

        {/* Call Button - MOVED UP */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2, // REDUCED padding from 3 to 2
            borderTop: '1px solid #e5e7eb',
            flexShrink: 0,
          }}
        >
          <IconButton
            onClick={handleCall}
            disabled={phoneNumber.length !== 10 || callState !== 'idle'}
            sx={{
              display: 'flex',
              width: 56, // REDUCED from 64 to 56
              height: 56, // REDUCED from 64 to 56
              p: 2,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              border: '1px solid',
              transition: 'all 0.3s ease',
              bgcolor: phoneNumber.length === 10 && callState === 'idle' ? '#22c55e' : '#f3f4f6',
              borderColor: phoneNumber.length === 10 && callState === 'idle' ? '#22c55e' : '#d1d5db',
              cursor: phoneNumber.length === 10 && callState === 'idle' ? 'pointer' : 'not-allowed',
              transform: phoneNumber.length === 10 && callState === 'idle' ? 'scale(1)' : 'scale(0.95)',
              boxShadow: phoneNumber.length === 10 && callState === 'idle' ? '0 4px 12px rgba(34, 197, 94, 0.3)' : 'none',
              '&:hover': {
                bgcolor: phoneNumber.length === 10 && callState === 'idle' ? '#16a34a' : '#f3f4f6',
              },
            }}
          >
            <PhoneIcon
              sx={{
                width: 22, // REDUCED from 24 to 22
                height: 22, // REDUCED from 24 to 22
                color: phoneNumber.length === 10 && callState === 'idle' ? 'white' : '#9ca3af',
                transition: 'all 0.3s ease',
              }}
            />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Dialer;

'use client';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Avatar,
  useTheme,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  SignalWifiOff as OfflineIcon,
  SignalWifi4Bar as OnlineIcon,
} from '@mui/icons-material';
import { useCallState } from '@/components/CallStateContext';
import { useSocket } from '@/components/socket-context';

interface HeaderProps {
  onGoBack?: () => void;
  currentView?: 'dashboard' | 'call-interface' | 'calls';
}

const Header: React.FC<HeaderProps> = ({ onGoBack, currentView }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  
  // ✅ ONLY CHANGE: Added lastCalledNumber to existing useCallState
  const { 
    callState, 
    callDuration, 
    dialedNumber,
    lastCalledNumber // ✅ ADDED THIS LINE ONLY
  } = useCallState();
  
  const { isConnected: socketConnected, isConnecting, connectionError, on, off } = useSocket();
  const theme = useTheme();

  // Format call duration for display
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Socket event listeners for real-time notifications
  useEffect(() => {
    if (!socketConnected) return;

    // Handle form submission notifications
    const handleFormSubmission = (data: any) => {
      console.log('📬 Header: Form submission notification:', data);
      setNotificationCount(prev => prev + 1);
    };

    // Handle general notifications
    const handleNotification = (data: any) => {
      console.log('📬 Header: New notification:', data);
      setNotificationCount(prev => prev + 1);
    };

    // Register socket event listeners
    on('form:complaint:submitted', handleFormSubmission);
    on('form:feedback:submitted', handleFormSubmission);
    on('notification:new', handleNotification);

    // Cleanup
    return () => {
      off('form:complaint:submitted', handleFormSubmission);
      off('form:feedback:submitted', handleFormSubmission);
      off('notification:new', handleNotification);
    };
  }, [socketConnected, on, off]);

  // Load notification count from localStorage on mount
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('notificationCount');
      if (savedCount) {
        setNotificationCount(parseInt(savedCount, 10));
      }
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, []);

  // Save notification count to localStorage
  useEffect(() => {
    localStorage.setItem('notificationCount', notificationCount.toString());
  }, [notificationCount]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };

  const handleSearchFocus = (): void => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = (): void => {
    setIsSearchFocused(false);
  };

  const handleGoBack = (): void => {
    if (onGoBack) {
      onGoBack();
    }
  };

  // Handle notification click
  const handleNotificationClick = useCallback(() => {
    console.log('📬 Header: Notification clicked');
    // Future: Open notifications panel
    // For now, just reset count
    setNotificationCount(0);
  }, []);

  // Get page title with call status
  const getPageTitle = () => {
    // Show call status in title when there's an active call
    if (callState === 'active' || callState === 'connecting') {
      const baseTitle = currentView === 'calls' ? 'Calls' : 
                       currentView === 'call-interface' ? 'Call Interface' : 'Overview';
      
      if (callState === 'active') {
        return `${baseTitle} • ${formatDuration(callDuration)}`;
      } else if (callState === 'connecting') {
        return `${baseTitle} • Connecting...`;
      }
    }

    switch (currentView) {
      case 'calls':
        return 'Calls';
      case 'call-interface':
        return 'Call Interface';
      case 'dashboard':
      default:
        return 'Overview';
    }
  };

  // ✅ ONLY CHANGE: Updated back button logic to include lastCalledNumber
  const showBackButton = currentView === 'call-interface' && 
                        (callState === 'ended' || (callState === 'idle' && lastCalledNumber));

  // Get connection status info
  const getConnectionStatus = () => {
    if (isConnecting) {
      return { color: '#F59E0B', text: 'Connecting...', icon: <OnlineIcon /> };
    } else if (socketConnected) {
      return { color: '#10B981', text: 'Connected', icon: <OnlineIcon /> };
    } else {
      return { color: '#EF4444', text: 'Offline', icon: <OfflineIcon /> };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 100,
        bgcolor: 'background.default',
        px: 3,
        transition: 'all 0.3s',
        borderBottom: 'none',
        boxShadow: 'none',
        position: 'relative',
      }}
    >
      {/* Left Side - Go Back Button + Page Title + Call Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Go Back Button */}
        {showBackButton && (
          <IconButton
            onClick={handleGoBack}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: '1px solid #E5E7EB',
              '&:hover': {
                backgroundColor: '#E5E7EB',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}

        {/* Page Title with Call Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{
              background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Inter',
              fontSize: '1.75rem',
              fontWeight: 600,
              lineHeight: 'normal',
              margin: 0,
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* Active Call Indicator */}
          {(callState === 'active' || callState === 'connecting') && (
            <Chip
              icon={<PhoneIcon sx={{ fontSize: '0.8rem' }} />}
              label={callState === 'active' ? 'On Call' : 'Connecting'}
              size="small"
              sx={{
                backgroundColor: callState === 'active' ? '#ECFDF5' : '#FEF3C7',
                color: callState === 'active' ? '#059669' : '#D97706',
                border: `1px solid ${callState === 'active' ? '#BBF7D0' : '#FDE68A'}`,
                height: 24,
                fontSize: '0.7rem',
                fontWeight: 600,
                animation: callState === 'connecting' ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Right Side - Connection Status + Search + Notification + Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        
        {/* Connection Status Indicator */}
        <Tooltip 
          title={connectionError || connectionStatus.text}
          arrow
        >
          <Chip
            icon={React.cloneElement(connectionStatus.icon, { 
              sx: { fontSize: '0.9rem', color: connectionStatus.color } 
            })}
            label={connectionStatus.text}
            size="small"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: connectionStatus.color,
              border: `1px solid ${connectionStatus.color}`,
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
              },
              transition: 'all 0.2s ease',
            }}
          />
        </Tooltip>
        
        {/* Search Bar */}
        <TextField
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Search for something"
          variant="outlined"
          size="small"
          sx={{
            width: 313,
            '& .MuiOutlinedInput-root': {
              height: 50,
              borderRadius: 5,
              bgcolor: 'white',
              border: isSearchFocused ? '2px solid #000000' : '2px solid transparent',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              color: '#343C6A',
              fontFamily: 'Inter',
              fontSize: '0.9375rem',
              fontWeight: 400,
              '&::placeholder': {
                color: '#A0A0A0',
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666', width: 20, height: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Enhanced Notification Icon with Real-time Count */}
        <Tooltip title="Notifications" arrow>
          <IconButton
            onClick={handleNotificationClick}
            sx={{
              width: 50,
              height: 50,
              transition: 'all 0.2s',
              '&:hover': {
                opacity: 0.7,
                transform: 'scale(1.05)',
              },
            }}
          >
            <Badge
              badgeContent={notificationCount}
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  height: 18,
                  minWidth: 18,
                  fontWeight: 600,
                  animation: notificationCount > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                  },
                },
              }}
            >
              <NotificationsIcon sx={{ width: 24, height: 24, color: '#666' }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Avatar */}
        <Tooltip title="User Profile" arrow>
          <IconButton
            sx={{
              width: 50,
              height: 50,
              transition: 'all 0.2s',
              '&:hover': {
                opacity: 0.8,
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#343C6A',
                color: 'white',
                fontFamily: 'Inter',
                fontSize: '1.125rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              A
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Header;

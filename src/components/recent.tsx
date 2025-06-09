'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, IconButton, useTheme } from '@mui/material';
import { HiPhoneIncoming, HiPhoneOutgoing, HiPhone } from 'react-icons/hi';

// Types
interface CallRecord {
  id: string;
  phoneNumber: string;
  contactName?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: number;
  timestamp: string;
  status: 'completed' | 'missed' | 'busy' | 'no-answer' | 'connected';
}

type CallFilter = 'all' | 'incoming' | 'outgoing' | 'missed';

interface RecentCallsProps {
  onNumberSelect?: (number: string) => void; // Callback to pass number to dialer
}

// Format duration according to your specifications
const formatDuration = (seconds: number, status: string): string => {
  if (status === 'missed' || status === 'no-answer') {
    return '--:--';
  }
  if (seconds === 0) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes}m ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

const RecentCalls: React.FC<RecentCallsProps> = ({ onNumberSelect }) => {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<CallFilter>('all');
  const [isPanelHovered, setIsPanelHovered] = useState<boolean>(false);
  const router = useRouter();
  const theme = useTheme();

  // Generate mock call data with contact names
  const generateMockCalls = useCallback((): CallRecord[] => {
    const mockCalls: CallRecord[] = [
      {
        id: '1',
        phoneNumber: '+91-9876543210',
        contactName: 'John Doe',
        type: 'incoming',
        duration: 0,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'connected'
      },
      {
        id: '2',
        phoneNumber: '+91-9876543211',
        contactName: 'Sarah Wilson',
        type: 'outgoing',
        duration: 245,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: '3',
        phoneNumber: '+91-9876543212',
        type: 'incoming',
        duration: 0,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'missed'
      },
      {
        id: '4',
        phoneNumber: '+91-9876543213',
        contactName: 'Mike Johnson',
        type: 'outgoing',
        duration: 180,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: '5',
        phoneNumber: '+91-9876543214',
        type: 'incoming',
        duration: 0,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        status: 'missed'
      },
      {
        id: '6',
        phoneNumber: '+91-9876543215',
        contactName: 'Emma Davis',
        type: 'outgoing',
        duration: 320,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: '7',
        phoneNumber: '+91-9876543216',
        contactName: 'Alex Brown',
        type: 'incoming',
        duration: 150,
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: '8',
        phoneNumber: '+91-9876543217',
        type: 'outgoing',
        duration: 0,
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        status: 'missed'
      }
    ];
    return mockCalls;
  }, []);

  useEffect(() => {
    setCallHistory(generateMockCalls());
  }, [generateMockCalls]);

  const filteredCalls = useCallback(() => {
    return callHistory.filter(call => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'missed') return call.status === 'missed' || call.status === 'no-answer';
      return call.type === selectedFilter;
    });
  }, [callHistory, selectedFilter]);

  // Get call icon with correct colors
  const getCallIcon = useCallback((call: CallRecord): React.ReactElement => {
    const iconSize = "w-4 h-4";
    
    if (call.status === 'missed' || call.status === 'no-answer') {
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#FF6B6B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HiPhone className={`${iconSize} text-white`} />
        </Box>
      );
    }
    
    if (call.type === 'incoming') {
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#4ECDC4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HiPhoneIncoming className={`${iconSize} text-white`} />
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#74A9FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <HiPhoneOutgoing className={`${iconSize} text-white`} />
        </Box>
      );
    }
  }, []);

  const handleCallClick = useCallback((call: CallRecord): void => {
    router.push(`/call-details/${call.id}`);
  }, [router]);

  // Function to add number to dialer
  const handleAddToDialer = useCallback((phoneNumber: string, event: React.MouseEvent): void => {
    event.stopPropagation();
    // Extract just the 10-digit number from the phone number
    const cleanNumber = phoneNumber.replace(/^\+91-?/, '').replace(/\D/g, '');
    
    // Call the callback function to update the dialer
    if (onNumberSelect) {
      onNumberSelect(cleanNumber);
    }
  }, [onNumberSelect]);

  const handleFilterChange = useCallback((filter: CallFilter): void => {
    setSelectedFilter(filter);
  }, []);

  const handlePanelMouseEnter = useCallback((): void => {
    setIsPanelHovered(true);
  }, []);

  const handlePanelMouseLeave = useCallback((): void => {
    setIsPanelHovered(false);
  }, []);

  const filterOptions = useCallback(() => [
    { key: 'all' as CallFilter, label: 'All', count: callHistory.length },
    { key: 'incoming' as CallFilter, label: 'In', count: callHistory.filter(c => c.type === 'incoming').length },
    { key: 'outgoing' as CallFilter, label: 'Out', count: callHistory.filter(c => c.type === 'outgoing').length },
    { key: 'missed' as CallFilter, label: 'Missed', count: callHistory.filter(c => c.status === 'missed' || c.status === 'no-answer').length }
  ], [callHistory]);

  const calls = filteredCalls();
  const options = filterOptions();

  return (
    <Box
      onMouseEnter={handlePanelMouseEnter}
      onMouseLeave={handlePanelMouseLeave}
      sx={{
        bgcolor: 'white',
        borderRadius: 5,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.50',
        borderTop: '4px solid #EE3741',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isPanelHovered ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isPanelHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: isPanelHovered ? 10 : 1,
        height: '100%',
        minHeight: 500, // Increased to show at least 4 items
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'grey.100', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#1f2937',
                fontFamily: 'Inter',
                margin: 0,
                mb: 0.5,
              }}
            >
              Recent Calls
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: '#6b7280',
                fontFamily: 'Inter',
                margin: 0,
              }}
            >
              {calls.length} calls
            </Typography>
          </Box>
          
          <Button
            variant="text"
            sx={{
              color: '#2563eb',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'none',
              fontFamily: 'Inter',
              '&:hover': {
                bgcolor: 'rgba(37, 99, 235, 0.04)',
                textDecoration: 'underline',
              },
            }}
          >
            View All
          </Button>
        </Box>

        {/* Filter Tabs */}
        <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#f8fafc', borderRadius: 2, p: 0.5 }}>
          {options.map((option) => (
            <Button
              key={option.key}
              onClick={() => handleFilterChange(option.key)}
              variant="text"
              sx={{
                flex: 1,
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                fontSize: '0.7rem',
                fontWeight: 500,
                fontFamily: 'Inter',
                textTransform: 'none',
                minWidth: 'auto',
                bgcolor: selectedFilter === option.key ? 'white' : 'transparent',
                color: selectedFilter === option.key ? '#1f2937' : '#6b7280',
                boxShadow: selectedFilter === option.key ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
                '&:hover': {
                  bgcolor: selectedFilter === option.key ? 'white' : 'rgba(107, 114, 128, 0.05)',
                  color: selectedFilter === option.key ? '#1f2937' : '#374151',
                },
              }}
            >
              {option.label} ({option.count})
            </Button>
          ))}
        </Box>
      </Box>

      {/* Calls List - Larger size to show at least 4 items */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        minHeight: 320, // Ensure space for at least 4 items (4 * 80px)
      }}>
        {calls.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {calls.map((call) => (
              <Box
                key={call.id}
                onClick={() => handleCallClick(call)}
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'grey.100',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  minHeight: 80, // Ensure consistent height for each item
                  '&:hover': {
                    bgcolor: '#f9fafb',
                  },
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Left Side - Icon and Contact Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
                    {/* Call Icon with colored circle */}
                    {getCallIcon(call)}
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* Contact Name or Unknown - Increased text size */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: call.status === 'missed' || call.status === 'no-answer' ? '#FF6B6B' : '#1f2937',
                          fontFamily: 'Inter',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {call.contactName || 'Unknown'}
                      </Typography>
                      
                      {/* Phone Number - smaller text below name */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          fontFamily: 'Inter',
                          display: 'block',
                        }}
                      >
                        {call.phoneNumber}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Side - Duration and Dial Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    {/* Duration */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: call.status === 'missed' || call.status === 'no-answer' ? '#FF6B6B' : '#1f2937',
                        fontFamily: 'Inter',
                        fontFeatureSettings: '"tnum"',
                        minWidth: 50,
                        textAlign: 'right',
                      }}
                    >
                      {formatDuration(call.duration, call.status)}
                    </Typography>

                    {/* Add to Dialer Button */}
                    <IconButton
                      onClick={(e) => handleAddToDialer(call.phoneNumber, e)}
                      size="small"
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#f3f4f6',
                        color: '#6b7280',
                        '&:hover': {
                          bgcolor: '#e5e7eb',
                          color: '#374151',
                        },
                        transition: 'all 0.2s',
                      }}
                      title="Add to dialer"
                    >
                      <HiPhone className="w-4 h-4" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          /* Empty State */
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, px: 3, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <HiPhone className="w-8 h-8 text-gray-400" />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#6b7280',
                fontFamily: 'Inter',
                mb: 0.5,
              }}
            >
              No {selectedFilter !== 'all' ? selectedFilter : ''} calls
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: 'Inter',
              }}
            >
              Call history will appear here
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecentCalls;

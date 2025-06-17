'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  CallReceived as CallReceivedIcon,
  CallMade as CallMadeIcon,
  CallEnd as CallEndIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';

// Comprehensive mock data for demonstration
const generateMockCalls = (count: number) => {
  const names = [
    'Jacob Wright', 'Adison Rosser', 'Jared Black', 'Maria Garcia', 'David Wilson',
    'Sarah Johnson', 'Michael Brown', 'Lisa Anderson', 'Robert Taylor', 'Jennifer Davis',
    'Alex Thompson', 'Emma Rodriguez', 'James Wilson', 'Sophia Chen', 'Daniel Kumar',
    'Olivia Martinez', 'Ryan Patel', 'Isabella Lee', 'Noah Singh', 'Ava Sharma',
    'Ethan Gupta', 'Mia Verma', 'Lucas Jain', 'Charlotte Agarwal', 'Mason Reddy',
    'Grace Kim', 'William Zhang', 'Zoe Thompson', 'Henry Davis', 'Lily Wilson'
  ];

  const callTypes: ('incoming' | 'outgoing' | 'missed')[] = ['incoming', 'outgoing', 'missed'];
  
  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length];
    const callType = callTypes[i % 3];
    const baseTime = new Date('2024-01-15T12:00:00');
    const timestamp = new Date(baseTime.getTime() - (i * 1800000)); // 30 min intervals
    
    return {
      id: `call-${String(i + 1).padStart(3, '0')}`,
      contactName: i < names.length ? name : `${name} ${Math.floor(i / names.length) + 1}`,
      phoneNumber: `+91 98765${String(43210 + i).slice(-5)}`,
      callType,
      timestamp,
      duration: callType === 'missed' ? 0 : Math.floor(Math.random() * 400) + 60,
      avatar: name.split(' ').map(n => n[0]).join('')
    };
  });
};

const mockCallsData = generateMockCalls(100); // Generate 100 calls for testing

interface CallsListProps {
  selectedCallId: string;
  onCallSelect: (callId: string) => void;
  searchQuery: string;
  activeFilter: 'all' | 'incoming' | 'outgoing' | 'missed';
}

const CallsList: React.FC<CallsListProps> = ({
  selectedCallId,
  onCallSelect,
  searchQuery,
  activeFilter,
}) => {
  const [displayedCalls, setDisplayedCalls] = useState<typeof mockCallsData>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const INITIAL_LOAD = 15;
  const LOAD_MORE_COUNT = 10;

  // Modern filtering with useMemo for performance
  const filteredCalls = useMemo(() => {
    let filtered = mockCallsData;

    // Apply call type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(call => call.callType === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(call =>
        call.contactName.toLowerCase().includes(query) ||
        call.phoneNumber.includes(query)
      );
    }

    return filtered;
  }, [activeFilter, searchQuery]);

  // Initialize data when filters change
  useEffect(() => {
    const initialCalls = filteredCalls.slice(0, INITIAL_LOAD);
    setDisplayedCalls(initialCalls);
    setHasMore(filteredCalls.length > INITIAL_LOAD);
    setIsLoading(false);
  }, [filteredCalls]);

  // Modern async data loading with useCallback
  const fetchMoreData = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Simulate API delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentLength = displayedCalls.length;
    const nextCalls = filteredCalls.slice(currentLength, currentLength + LOAD_MORE_COUNT);
    
    if (nextCalls.length === 0) {
      setHasMore(false);
    } else {
      setDisplayedCalls(prev => [...prev, ...nextCalls]);
      setHasMore(currentLength + nextCalls.length < filteredCalls.length);
    }
    
    setIsLoading(false);
  }, [displayedCalls.length, filteredCalls, isLoading]);

  // Modern utility functions
  const formatTime = useCallback((date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }, []);

  const formatDuration = useCallback((seconds: number): string => {
    if (seconds === 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const getCallIcon = useCallback((callType: string) => {
    const iconProps = { fontSize: '0.9rem' as const };
    switch (callType) {
      case 'incoming':
        return <CallReceivedIcon sx={{ ...iconProps, color: '#10B981' }} />;
      case 'outgoing':
        return <CallMadeIcon sx={{ ...iconProps, color: '#3B82F6' }} />;
      case 'missed':
        return <CallEndIcon sx={{ ...iconProps, color: '#EF4444' }} />;
      default:
        return null;
    }
  }, []);

  // Modern call item component with proper memoization
  const CallItem = React.memo(({ call, index }: { call: typeof mockCallsData[0], index: number }) => {
    const isSelected = call.id === selectedCallId;
    const isMissed = call.callType === 'missed';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
      >
        <Box
          onClick={() => onCallSelect(call.id)}
          sx={{
            p: 2,
            cursor: 'pointer',
            backgroundColor: isSelected 
              ? '#EFF6FF' 
              : isMissed 
              ? '#FEF2F2' 
              : 'transparent',
            borderLeft: isSelected ? '4px solid #EE3741' : '4px solid transparent',
            borderBottom: '1px solid #F3F4F6',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isSelected 
                ? '#EFF6FF' 
                : isMissed 
                ? '#FEF2F2'
                : '#F9FAFB',
              transform: 'translateX(2px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                backgroundColor: isMissed ? '#EF4444' : '#EE3741',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              {call.avatar}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: isMissed ? '#EF4444' : '#1F2937',
                    fontSize: '0.9rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {call.contactName}
                </Typography>
                {getCallIcon(call.callType)}
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  color: isMissed ? '#DC2626' : '#6B7280',
                  fontSize: '0.8rem',
                  mb: 0.3,
                }}
              >
                {call.phoneNumber}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: isMissed ? '#B91C1C' : '#9CA3AF',
                    fontSize: '0.7rem',
                  }}
                >
                  {formatTime(call.timestamp)}
                </Typography>
                <Chip
                  label={formatDuration(call.duration)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    backgroundColor: isMissed ? '#FEE2E2' : '#F3F4F6',
                    color: isMissed ? '#B91C1C' : '#6B7280',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </motion.div>
    );
  });

  CallItem.displayName = 'CallItem';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          // FIXED: Set explicit height constraints to prevent expansion
          height: '600px', // Fixed height
          maxHeight: '600px', // Maximum height constraint
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Modern Header with Statistics */}
        <Box sx={{ p: 3, pb: 2, flexShrink: 0, backgroundColor: '#FAFAFA' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1F2937',
              fontSize: '1.1rem',
              mb: 0.5,
            }}
          >
            Call History
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontSize: '0.85rem',
              }}
            >
              {filteredCalls.length} total calls
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#EE3741',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              • Showing {displayedCalls.length}
            </Typography>
          </Box>
        </Box>

        {/* FIXED: Scrollable Container with explicit height */}
        <Box 
          sx={{ 
            flex: 1,
            position: 'relative',
            // CRITICAL: Set explicit height for scrollable area
            height: 'calc(600px - 100px)', // Total height minus header
            maxHeight: 'calc(600px - 100px)',
            overflow: 'hidden'
          }}
        >
          <Box
            id="calls-scroll-container"
            sx={{
              height: '100%',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#F3F4F6',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#D1D5DB',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: '#9CA3AF',
                },
              },
            }}
          >
            <InfiniteScroll
              dataLength={displayedCalls.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  p: 3,
                  gap: 2
                }}>
                  <CircularProgress 
                    size={24} 
                    sx={{ color: '#EE3741' }} 
                    thickness={4}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6B7280',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    Loading more calls...
                  </Typography>
                </Box>
              }
              endMessage={
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  backgroundColor: '#F9FAFB',
                  borderTop: '1px solid #F3F4F6'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#6B7280',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    🎉 All calls loaded • {displayedCalls.length} total
                  </Typography>
                </Box>
              }
              scrollableTarget="calls-scroll-container"
              style={{ height: '100%' }}
            >
              {displayedCalls.length > 0 ? (
                displayedCalls.map((call, index) => (
                  <CallItem key={call.id} call={call} index={index} />
                ))
              ) : (
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  p: 4,
                  textAlign: 'center'
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#6B7280',
                      mb: 1,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    📞 No calls found
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#9CA3AF',
                      fontSize: '0.9rem'
                    }}
                  >
                    Try adjusting your search or filter criteria
                  </Typography>
                </Box>
              )}
            </InfiniteScroll>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CallsList;

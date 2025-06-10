'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar,
  Divider,
  Skeleton,
  Button,
  Alert
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { useCallState } from '@/components/CallStateContext';

// Global keyframes definition
const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

interface CustomerData {
  name: string;
  phone: string;
  location: string;
  orderId: string;
  status: 'open' | 'in-progress' | 'closed';
  avatarUrl?: string;
  customerId: string;
}

interface CustomerInfoProps {
  phoneNumber?: string;
  customerId?: string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ 
  phoneNumber: propPhoneNumber,
  customerId: propCustomerId 
}) => {
  const { callState, dialedNumber } = useCallState();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use dialed number from context, then props, then fallback
  const displayPhoneNumber = dialedNumber || propPhoneNumber || '+91 00000 00000';

  // Memoized helper functions
  const getStatusColor = useCallback((status: CustomerData['status']) => {
    switch (status) {
      case 'open': return { backgroundColor: '#DBEAFE', color: '#1D4ED8' };
      case 'in-progress': return { backgroundColor: '#FED7AA', color: '#C2410C' };
      case 'closed': return { backgroundColor: '#D1FAE5', color: '#059669' };
      default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  }, []);

  const getCallStateInfo = useCallback((callState: string) => {
    switch (callState) {
      case 'connecting':
        return { 
          color: '#FC7900', 
          text: 'Call connecting...', 
          animation: `${pulseAnimation} 1.5s infinite` 
        };
      case 'active':
        return { 
          color: '#22C55E', 
          text: 'Call in progress', 
          animation: `${pulseAnimation} 2s infinite` 
        };
      case 'ended':
        return { 
          color: '#EE3741', 
          text: 'Call ended', 
          animation: 'none' 
        };
      case 'incoming':
        return { 
          color: '#3B82F6', 
          text: 'Incoming call', 
          animation: `${pulseAnimation} 1s infinite` 
        };
      default:
        return null;
    }
  }, []);

  // Memoized computed values
  const statusColor = useMemo(() => 
    customerData ? getStatusColor(customerData.status) : null, 
    [customerData, getStatusColor]
  );

  const callStateInfo = useMemo(() => 
    getCallStateInfo(callState), 
    [callState, getCallStateInfo]
  );

  const isCallActive = useMemo(() => 
    callState !== 'idle' && callState !== 'ended', 
    [callState]
  );

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock customer data with "Unknown" details
        setCustomerData({
          name: 'Unknown',
          phone: displayPhoneNumber,
          location: 'Unknown Location',
          orderId: 'A1×34562q',
          status: 'open',
          customerId: 'UNKNOWN-ID'
        });
        
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error fetching customer data:', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [displayPhoneNumber]);

  const retryFetch = useCallback(() => {
    setError(null);
    setLoading(true);
    setCustomerData(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <Paper 
        elevation={3}
        sx={{
          borderRadius: 3,
          height: '100%',
          p: 3,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          flex: 1, 
          justifyContent: 'center',
          mt: 4
        }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 2 }} />
          <Skeleton variant="text" width={140} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={160} height={20} />
        </Box>
      </Paper>
    );
  }

  // Error state
  if (error || !customerData) {
    return (
      <Paper 
        elevation={3}
        sx={{
          borderRadius: 3,
          height: '100%',
          p: 3,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={retryFetch}
              startIcon={<RefreshIcon />}
              sx={{ fontFamily: 'Inter' }}
            >
              Retry
            </Button>
          }
          sx={{ fontFamily: 'Inter' }}
        >
          {error || 'Failed to load customer information'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        border: isCallActive ? '2px solid #EE3741' : '1px solid #E5E7EB',
        boxShadow: isCallActive 
          ? '0 20px 25px -5px rgba(238, 55, 65, 0.1), 0 10px 10px -5px rgba(238, 55, 65, 0.04)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Border Animation */}
      {isCallActive && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: callState === 'connecting' 
              ? 'linear-gradient(90deg, #FC7900 0%, #FFB366 100%)'
              : callState === 'incoming'
              ? 'linear-gradient(90deg, #3B82F6 0%, #93C5FD 100%)'
              : 'linear-gradient(90deg, #22C55E 0%, #86EFAC 100%)',
            animation: `${pulseAnimation} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
          }}
        />
      )}

      {/* Header with Order ID and Status */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: '1px solid #F3F4F6'
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6B7280',
            fontFamily: 'Inter',
            fontWeight: 500
          }}
        >
          Order ID: {customerData.orderId}
        </Typography>
        {statusColor && (
          <Box
            sx={{
              ...statusColor,
              px: 2,
              py: 0.5,
              borderRadius: 4,
              fontSize: '11px',
              fontWeight: 500,
              fontFamily: 'Inter',
              textTransform: 'capitalize'
            }}
          >
            Status: {customerData.status.charAt(0).toUpperCase() + customerData.status.slice(1).replace('-', ' ')}
          </Box>
        )}
      </Box>

      {/* Main Content - Centered */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center'
      }}>
        {/* Avatar with Call State Indicator */}
        <Box sx={{ position: 'relative', mb: 2 }}>
          <Avatar
            src={customerData.avatarUrl}
            alt={`${customerData.name} avatar`}
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: '#EE3741',
              fontSize: 28, 
              fontWeight: 'bold',
              fontFamily: 'Inter',
              boxShadow: '0 8px 16px rgba(238, 55, 65, 0.2)'
            }}
          >
            U
          </Avatar>
          
          {/* Online Indicator with ARIA label */}
          {isCallActive && callState !== 'ended' && (
            <>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: callState === 'connecting' ? '#FC7900' : '#22C55E',
                  border: '3px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  animation: callState === 'connecting' 
                    ? `${pulseAnimation} 1.5s infinite` 
                    : `${pulseAnimation} 2s infinite`
                }}
                aria-label={callStateInfo?.text}
              />
              <span 
                style={{ 
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0
                }}
              >
                {callStateInfo?.text}
              </span>
            </>
          )}
        </Box>

        {/* Name */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            fontFamily: 'Inter',
            color: '#1F2937',
            mb: 1
          }}
        >
          {customerData.name}
        </Typography>

        {/* Customer ID */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#9CA3AF',
            fontFamily: 'Inter',
            fontWeight: 500,
            mb: 2
          }}
        >
          Customer ID: {customerData.customerId}
        </Typography>

        {/* Phone */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PhoneIcon sx={{ fontSize: 16, color: '#6B7280' }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#374151',
              fontFamily: 'Inter',
              fontWeight: 500
            }}
          >
            {customerData.phone}
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon sx={{ fontSize: 16, color: '#6B7280' }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6B7280',
              fontFamily: 'Inter'
            }}
          >
            {customerData.location}
          </Typography>
        </Box>
      </Box>

      {/* Call Status Footer with ARIA live region */}
      {callStateInfo && (
        <>
          <Divider sx={{ borderColor: '#F1F5F9' }} />
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            py: 2
          }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: callStateInfo.color,
                animation: callStateInfo.animation
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: callStateInfo.color,
                fontFamily: 'Inter',
                fontWeight: 500
              }}
              aria-live="polite"
            >
              {callStateInfo.text}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default React.memo(CustomerInfo);

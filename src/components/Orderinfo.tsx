'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider,
  Skeleton,
  Button,
  Alert,
  Chip
} from '@mui/material';
import { 
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallState } from '@/components/CallStateContext';
import { useOrderManagement } from '@/components/OrderManagementContext';

// Global keyframes definition
const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

interface OrderDetailEntry {
  id: string;
  type: 'order_placed' | 'processing' | 'delivered' | 'feedback' | 'complaint';
  timestamp: string;
  description: string;
  details?: string;
  status?: string;
}

interface OrderData {
  orderId: string;
  orders: string;
  status: 'Closed' | 'In-Progress';
  category: 'Completed' | 'Feedback Given' | 'Complain Given' | 'Feedback+Complain';
  numItems: number;
  date: string;
  amount: string;
  details: OrderDetailEntry[];
}

// Mock order data
const mockOrdersData: Record<string, OrderData> = {
  'ORD-001': {
    orderId: 'ORD-001',
    orders: 'Spotify Premium, Netflix Basic',
    status: 'Closed',
    category: 'Completed',
    numItems: 2,
    date: '28 Jan, 12:30 AM',
    amount: '₹2,500',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '28 Jan, 12:30 AM',
        description: 'Order placed successfully',
        details: 'Customer ordered Spotify Premium (₹1,500) and Netflix Basic (₹1,000)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'processing',
        timestamp: '28 Jan, 1:15 AM',
        description: 'Order processing started',
        details: 'Payment verified, account setup initiated',
        status: 'Processing'
      },
      {
        id: '3',
        type: 'delivered',
        timestamp: '28 Jan, 2:45 AM',
        description: 'Services activated',
        details: 'Both accounts activated successfully',
        status: 'Delivered'
      }
    ]
  },
  'ORD-002': {
    orderId: 'ORD-002',
    orders: 'Amazon Prime, Disney+ Hotstar',
    status: 'Closed',
    category: 'Feedback Given',
    numItems: 2,
    date: '25 Jan, 10:40 PM',
    amount: '₹1,200',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '25 Jan, 10:40 PM',
        description: 'Order placed successfully',
        details: 'Customer ordered Amazon Prime (₹700) and Disney+ Hotstar (₹500)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'processing',
        timestamp: '25 Jan, 11:20 PM',
        description: 'Order processing',
        details: 'Payment processed, account creation in progress',
        status: 'Processing'
      },
      {
        id: '3',
        type: 'delivered',
        timestamp: '26 Jan, 12:15 AM',
        description: 'Services delivered',
        details: 'Accounts created and activated',
        status: 'Delivered'
      },
      {
        id: '4',
        type: 'feedback',
        timestamp: '26 Jan, 8:30 AM',
        description: 'Customer feedback received',
        details: 'Customer appreciated the quick setup process. Rated 5/5 stars.',
        status: 'Positive'
      }
    ]
  },
  'ORD-003': {
    orderId: 'ORD-003',
    orders: 'YouTube Premium, Canva Pro',
    status: 'In-Progress',
    category: 'Complain Given',
    numItems: 2,
    date: '20 Jan, 10:40 PM',
    amount: '₹850',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '20 Jan, 10:40 PM',
        description: 'Order placed',
        details: 'Customer ordered YouTube Premium (₹450) and Canva Pro (₹400)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'complaint',
        timestamp: '21 Jan, 9:15 AM',
        description: 'Customer complaint received',
        details: 'Customer complained about delayed activation of YouTube Premium.',
        status: 'Open'
      }
    ]
  },
  'ORD-004': {
    orderId: 'ORD-004',
    orders: 'Adobe Creative Suite, Microsoft Office',
    status: 'Closed',
    category: 'Feedback+Complain',
    numItems: 2,
    date: '15 Jan, 03:29 PM',
    amount: '₹3,200',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '15 Jan, 03:29 PM',
        description: 'Order placed',
        details: 'Customer ordered Adobe Creative Suite (₹2,000) and Microsoft Office (₹1,200)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'delivered',
        timestamp: '15 Jan, 6:45 PM',
        description: 'Adobe Creative Suite delivered',
        details: 'Adobe license activated successfully',
        status: 'Delivered'
      },
      {
        id: '3',
        type: 'feedback',
        timestamp: '16 Jan, 9:00 AM',
        description: 'Positive feedback for Adobe',
        details: 'Customer appreciated Adobe service quality.',
        status: 'Positive'
      },
      {
        id: '4',
        type: 'complaint',
        timestamp: '16 Jan, 2:30 PM',
        description: 'Complaint about Microsoft Office',
        details: 'Customer complained about license activation issues.',
        status: 'Resolved'
      }
    ]
  },
  'ORD-005': {
    orderId: 'ORD-005',
    orders: 'Grammarly Premium, Notion Pro',
    status: 'Closed',
    category: 'Completed',
    numItems: 2,
    date: '14 Jan, 10:40 PM',
    amount: '₹650',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '14 Jan, 10:40 PM',
        description: 'Order placed',
        details: 'Customer ordered Grammarly Premium (₹350) and Notion Pro (₹300)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'delivered',
        timestamp: '14 Jan, 11:30 PM',
        description: 'Services delivered',
        details: 'Both accounts activated successfully',
        status: 'Delivered'
      }
    ]
  },
  'ORD-006': {
    orderId: 'ORD-006',
    orders: 'Figma Pro, Slack Premium',
    status: 'In-Progress',
    category: 'Feedback Given',
    numItems: 2,
    date: '12 Jan, 02:15 PM',
    amount: '₹1,800',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '12 Jan, 02:15 PM',
        description: 'Order placed',
        details: 'Customer ordered Figma Pro (₹1,000) and Slack Premium (₹800)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'delivered',
        timestamp: '12 Jan, 4:30 PM',
        description: 'Services delivered',
        details: 'Both accounts activated successfully',
        status: 'Delivered'
      },
      {
        id: '3',
        type: 'feedback',
        timestamp: '13 Jan, 9:00 AM',
        description: 'Customer feedback received',
        details: 'Customer praised the quick setup process.',
        status: 'Positive'
      }
    ]
  },
  'ORD-007': {
    orderId: 'ORD-007',
    orders: 'Zoom Pro, Dropbox Plus',
    status: 'Closed',
    category: 'Completed',
    numItems: 2,
    date: '10 Jan, 11:20 AM',
    amount: '₹950',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '10 Jan, 11:20 AM',
        description: 'Order placed',
        details: 'Customer ordered Zoom Pro (₹500) and Dropbox Plus (₹450)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'delivered',
        timestamp: '10 Jan, 1:45 PM',
        description: 'Services delivered',
        details: 'Both accounts activated successfully',
        status: 'Delivered'
      }
    ]
  },
  'ORD-008': {
    orderId: 'ORD-008',
    orders: 'GitHub Pro, Jira Premium',
    status: 'In-Progress',
    category: 'Feedback+Complain',
    numItems: 2,
    date: '08 Jan, 04:45 PM',
    amount: '₹2,100',
    details: [
      {
        id: '1',
        type: 'order_placed',
        timestamp: '08 Jan, 04:45 PM',
        description: 'Order placed',
        details: 'Customer ordered GitHub Pro (₹1,200) and Jira Premium (₹900)',
        status: 'Confirmed'
      },
      {
        id: '2',
        type: 'delivered',
        timestamp: '08 Jan, 7:30 PM',
        description: 'GitHub Pro delivered',
        details: 'GitHub Pro account activated successfully',
        status: 'Partial Delivery'
      },
      {
        id: '3',
        type: 'feedback',
        timestamp: '09 Jan, 10:00 AM',
        description: 'Positive feedback for GitHub',
        details: 'Customer liked GitHub features.',
        status: 'Positive'
      },
      {
        id: '4',
        type: 'complaint',
        timestamp: '09 Jan, 2:15 PM',
        description: 'Complaint about Jira',
        details: 'Customer reported Jira integration issues.',
        status: 'In Progress'
      }
    ]
  }
};

const OrderInfo: React.FC = () => {
  const { selectedOrderId } = useOrderManagement();
  const { callState } = useCallState();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
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

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Closed': return { backgroundColor: '#D1FAE5', color: '#059669' };
      case 'In-Progress': return { backgroundColor: '#FED7AA', color: '#C2410C' };
      default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  }, []);

  const getDetailTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'order_placed': return { backgroundColor: '#E0F2FE', color: '#0369A1' };
      case 'processing': return { backgroundColor: '#FEF3C7', color: '#D97706' };
      case 'delivered': return { backgroundColor: '#D1FAE5', color: '#059669' };
      case 'feedback': return { backgroundColor: '#F0FDF4', color: '#16A34A' };
      case 'complaint': return { backgroundColor: '#FEF2F2', color: '#DC2626' };
      default: return { backgroundColor: '#F3F4F6', color: '#374151' };
    }
  }, []);

  // Memoized computed values
  const callStateInfo = useMemo(() => 
    getCallStateInfo(callState), 
    [callState, getCallStateInfo]
  );

  const statusColor = useMemo(() => 
    orderData ? getStatusColor(orderData.status) : null, 
    [orderData, getStatusColor]
  );

  const isCallActive = useMemo(() => 
    callState !== 'idle' && callState !== 'ended', 
    [callState]
  );

  // Context-based data fetching
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        console.log('📦 OrderInfo: Fetching data for orderId:', selectedOrderId);
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const data = mockOrdersData[selectedOrderId];
        if (data) {
          setOrderData(data);
          console.log('✅ OrderInfo: Data loaded for:', selectedOrderId);
        } else {
          throw new Error('Order not found');
        }
        
      } catch (err) {
        console.error('❌ OrderInfo: Error fetching order data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedOrderId) {
      fetchOrderData();
    }
  }, [selectedOrderId]);

  const retryFetch = useCallback(() => {
    setError(null);
    setLoading(true);
    setOrderData(null);
  }, []);

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Paper 
          elevation={3}
          sx={{
            borderRadius: 3,
            height: '500px',
            p: 3,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Paper>
      </motion.div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper 
          elevation={3}
          sx={{
            borderRadius: 3,
            height: '500px',
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
            {error || 'Failed to load order information'}
          </Alert>
        </Paper>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`order-info-${selectedOrderId}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
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
          // FIXED: Set exact height to prevent white space
          height: '500px',
          maxHeight: '500px',
          minHeight: '500px',
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
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid #F3F4F6',
            flexShrink: 0
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                fontFamily: 'Inter',
                fontWeight: 500
              }}
            >
              Order ID: {orderData.orderId}
            </Typography>
            {statusColor && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Chip
                  label={orderData.status}
                  size="small"
                  sx={{
                    backgroundColor: statusColor.backgroundColor,
                    color: statusColor.color,
                    border: `1px solid ${statusColor.color}20`,
                    fontSize: '11px',
                    fontWeight: 500,
                    fontFamily: 'Inter',
                    textTransform: 'capitalize'
                  }}
                />
              </motion.div>
            )}
          </Box>
        </motion.div>

        {/* Compact Order Summary */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box sx={{ 
            p: 2,
            borderBottom: '1px solid #F3F4F6',
            flexShrink: 0
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                fontFamily: 'Inter',
                color: '#1F2937',
                mb: 0.5,
                fontSize: '1rem'
              }}
            >
              {orderData.orders}
            </Typography>

            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6B7280',
                fontFamily: 'Inter',
                fontSize: '0.85rem'
              }}
            >
              {orderData.numItems} items • {orderData.amount} • {orderData.date}
            </Typography>
          </Box>
        </motion.div>

        {/* FIXED: Scrollable Order Details with exact height */}
        <Box sx={{ 
          overflow: 'auto',
          p: 2,
          height: '280px',
          flexShrink: 0,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F1F5F9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94A3B8',
          }
        }}>
          <AnimatePresence>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {orderData.details.map((detail, index) => {
                const typeColor = getDetailTypeColor(detail.type);
                return (
                  <motion.div
                    key={detail.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                  >
                    <Box 
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #F3F4F6',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={detail.type.replace('_', ' ').toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: typeColor.backgroundColor,
                            color: typeColor.color,
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            fontFamily: 'Inter',
                            height: '20px'
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6B7280',
                            fontFamily: 'Inter',
                            fontSize: '0.7rem'
                          }}
                        >
                          {detail.timestamp}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600,
                          color: '#374151',
                          fontFamily: 'Inter',
                          mb: 0.5,
                          fontSize: '0.85rem'
                        }}
                      >
                        {detail.description}
                      </Typography>
                      
                      {detail.details && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#6B7280',
                            fontFamily: 'Inter',
                            fontSize: '0.75rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {detail.details}
                        </Typography>
                      )}
                      
                    </Box>
                  </motion.div>
                );
              })}
            </Box>
          </AnimatePresence>
        </Box>

        {/* Call Status Footer */}
        {callStateInfo && (
          <>
            <Divider sx={{ borderColor: '#F1F5F9' }} />
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                py: 1.5,
                flexShrink: 0
              }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
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
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                  aria-live="polite"
                >
                  {callStateInfo.text}
                </Typography>
              </Box>
            </motion.div>
          </>
        )}
      </Paper>
    </motion.div>
  );
};

export default React.memo(OrderInfo);

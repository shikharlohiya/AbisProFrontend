'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import { 
  Phone as PhoneIcon,
  CallEnd as CallEndIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  ShoppingCart as ShoppingCartIcon,
  Notes as NotesIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Mock contact data with call recording info
const mockContactData: Record<string, any> = {
  'call-001': {
    name: 'Jacob Wright',
    phone: '+91 9876543210',
    email: 'jacob.wright@email.com',
    birthday: 'March 15, 1990',
    age: 34,
    customerId: 'CUST-001',
    callStatus: 'Missed Call',
    callDuration: '02:30',
    recordingUrl: '/audio/call-001.mp3',
    remarks: 'Customer was interested in premium subscription packages. Discussed various entertainment services including Netflix, Spotify, and Amazon Prime. Customer mentioned budget constraints but showed strong interest in bundled offers.',
    lastOrder: {
      orderId: 'ORD-001',
      items: 'Spotify Premium, Netflix Basic',
      amount: '₹2,500',
      date: '28 Jan, 12:30 AM'
    },
    notes: 'Customer interested in premium subscriptions. Prefers entertainment services.',
    history: [
      {
        id: 1,
        type: 'payment',
        timestamp: '06/21 - 12:07 PM',
        description: 'Payment received for order ORD-001',
        agent: 'Hannah Wells',
        details: 'Payment of ₹2,500 processed successfully via UPI'
      },
      {
        id: 2,
        type: 'client',
        timestamp: '06/20 - 03:45 PM',
        description: 'Customer inquiry about subscription plans',
        agent: 'Sarah Johnson',
        details: 'Customer asked about available streaming service packages'
      },
      {
        id: 3,
        type: 'sms',
        timestamp: '06/19 - 10:30 AM',
        description: 'Order confirmation SMS sent',
        agent: 'System',
        details: 'SMS sent to +91 9876543210 with order details'
      }
    ]
  },
  'call-002': {
    name: 'Adison Rosser',
    phone: '+91 9876543211',
    email: 'adison.rosser@email.com',
    birthday: 'July 22, 1988',
    age: 36,
    customerId: 'CUST-002',
    callStatus: 'Answered',
    callDuration: '05:45',
    recordingUrl: '/audio/call-002.mp3',
    remarks: 'Regular customer inquiry about family entertainment packages. Customer was satisfied with current services and interested in upgrading to premium plans.',
    lastOrder: {
      orderId: 'ORD-002',
      items: 'Amazon Prime, Disney+ Hotstar',
      amount: '₹1,200',
      date: '25 Jan, 10:40 PM'
    },
    notes: 'Regular customer, prefers family entertainment packages.',
    history: [
      {
        id: 1,
        type: 'email',
        timestamp: '06/21 - 09:15 AM',
        description: 'Welcome email sent',
        agent: 'System',
        details: 'Welcome email with account details sent to customer'
      }
    ]
  },
  'call-003': {
    name: 'Jared Black',
    phone: '+91 9876543212',
    email: 'jared.black@email.com',
    birthday: 'December 5, 1992',
    age: 32,
    customerId: 'CUST-003',
    callStatus: 'Completed',
    callDuration: '03:15',
    recordingUrl: '/audio/call-003.mp3',
    remarks: 'Professional user interested in productivity tools. Discussed YouTube Premium for ad-free experience and Canva Pro for design work.',
    lastOrder: {
      orderId: 'ORD-003',
      items: 'YouTube Premium, Canva Pro',
      amount: '₹850',
      date: '20 Jan, 10:40 PM'
    },
    notes: 'Professional user, interested in productivity tools.',
    history: [
      {
        id: 1,
        type: 'lead',
        timestamp: '06/20 - 02:30 PM',
        description: 'Lead converted to customer',
        agent: 'Mike Johnson',
        details: 'Successfully converted lead after product demonstration'
      }
    ]
  }
};

interface CallDetailsProps {
  selectedCallId: string;
}

const CallDetails: React.FC<CallDetailsProps> = ({ selectedCallId }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const router = useRouter();
  
  const contactData = mockContactData[selectedCallId];

  if (!contactData) {
    return (
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select a call to view details
        </Typography>
      </Paper>
    );
  }

  const handleCallBack = () => {
    router.push(`/dashboard?dialerNumber=${encodeURIComponent(contactData.phone)}`);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ShoppingCartIcon sx={{ fontSize: '1.2rem', color: '#10B981' }} />;
      case 'client':
        return <PersonIcon sx={{ fontSize: '1.2rem', color: '#3B82F6' }} />;
      case 'email':
        return <EmailIcon sx={{ fontSize: '1.2rem', color: '#8B5CF6' }} />;
      case 'sms':
        return <PhoneIcon sx={{ fontSize: '1.2rem', color: '#F59E0B' }} />;
      case 'lead':
        return <BadgeIcon sx={{ fontSize: '1.2rem', color: '#EF4444' }} />;
      default:
        return <NotesIcon sx={{ fontSize: '1.2rem', color: '#6B7280' }} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <Paper
        elevation={1}
        sx={{
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // MODERN: Remove all unnecessary spacing
          margin: 0,
          padding: 0,
        }}
      >
        {/* MODERN: Compact Header with Stack */}
        <Stack spacing={0} sx={{ flexShrink: 0 }}>
          {/* Contact Header */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#EE3741',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                }}
              >
                {contactData.name.split(' ').map((n: string) => n[0]).join('')}
              </Avatar>
              <Stack spacing={0.5} sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: '#1F2937',
                    fontSize: '1.1rem',
                    lineHeight: 1.2,
                  }}
                >
                  {contactData.name}
                </Typography>
                <Chip
                  icon={<CallEndIcon />}
                  label={contactData.callStatus}
                  size="small"
                  sx={{
                    backgroundColor: contactData.callStatus === 'Missed Call' ? '#FEF2F2' : '#F0FDF4',
                    color: contactData.callStatus === 'Missed Call' ? '#DC2626' : '#16A34A',
                    border: `1px solid ${contactData.callStatus === 'Missed Call' ? '#FCA5A5' : '#BBF7D0'}`,
                    height: 24,
                    alignSelf: 'flex-start',
                  }}
                />
              </Stack>
            </Stack>

            {/* Call Back Button */}
            <Button
              variant="contained"
              startIcon={<PhoneIcon />}
              onClick={handleCallBack}
              fullWidth
              sx={{
                backgroundColor: '#EE3741',
                color: 'white',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#DC2626',
                },
              }}
            >
              Call Back
            </Button>
          </Box>

          {/* MODERN: Compact Call Recording Section */}
          <Box sx={{ px: 3, pb: 2 }}>
            <Card
              sx={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: 2,
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Call Status Header */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneIcon sx={{ color: 'white', fontSize: '1rem' }} />
                  </Box>
                  <Stack spacing={0}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: '#1F2937',
                        fontSize: '0.9rem',
                      }}
                    >
                      Finished Call
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontSize: '0.8rem',
                      }}
                    >
                      {contactData.phone} • {contactData.callDuration}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Compact Remarks */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6B7280',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                    mb: 2,
                  }}
                >
                  {contactData.remarks}
                </Typography>

                {/* Compact Audio Player */}
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 1.5,
                    border: '1px solid #E5E7EB',
                    p: 1.5,
                    mb: 1.5,
                  }}
                >
                  <IconButton
                    onClick={handlePlayPause}
                    size="small"
                    sx={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: '#2563EB',
                      },
                    }}
                  >
                    {isPlaying ? <PauseIcon sx={{ fontSize: '1rem' }} /> : <PlayArrowIcon sx={{ fontSize: '1rem' }} />}
                  </IconButton>
                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#6B7280',
                        fontSize: '0.7rem',
                      }}
                    >
                      Call Recording • {contactData.callDuration}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={playProgress}
                      sx={{
                        height: 3,
                        borderRadius: 1.5,
                        backgroundColor: '#F3F4F6',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#3B82F6',
                        },
                      }}
                    />
                  </Stack>
                  <VolumeUpIcon sx={{ color: '#6B7280', fontSize: '1rem' }} />
                </Stack>

                {/* Know More Button */}
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 1.5,
                    fontSize: '0.8rem',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: '#EFF6FF',
                    },
                  }}
                >
                  Know More
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* MODERN: Compact Tabs */}
          <Box sx={{ px: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                minHeight: 40,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#EE3741',
                  height: 2,
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: '#6B7280',
                  minHeight: 40,
                  py: 1,
                  '&.Mui-selected': {
                    color: '#EE3741',
                    fontWeight: 600,
                  },
                },
              }}
            >
              <Tab label="Details" value="details" />
              <Tab label="History" value="history" />
            </Tabs>
          </Box>

          <Divider />
        </Stack>

        {/* MODERN: Scrollable Content Area with proper height management */}
        <Box 
          sx={{ 
            flex: 1,
            overflow: 'auto',
            minHeight: 0, // CRITICAL: Allows flex child to shrink
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F3F4F6',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D1D5DB',
              borderRadius: '2px',
            },
          }}
        >
          <Box sx={{ p: 3, pt: 2 }}>
            <AnimatePresence mode="wait">
              {activeTab === 'details' ? (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Stack spacing={2.5}>
                    {/* MODERN: Personal Information with Stack */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#1F2937',
                          mb: 1.5,
                          fontSize: '0.95rem',
                        }}
                      >
                        Personal Information
                      </Typography>
                      <Stack spacing={1.5}>
                        {[
                          { icon: PersonIcon, label: 'Full Name', value: contactData.name },
                          { icon: PhoneIcon, label: 'Phone Number', value: contactData.phone },
                          { icon: EmailIcon, label: 'Email', value: contactData.email },
                          { icon: CakeIcon, label: 'Birthday', value: `${contactData.birthday} (Age: ${contactData.age})` },
                          { icon: BadgeIcon, label: 'Customer ID', value: contactData.customerId },
                        ].map((item, index) => (
                          <Stack key={index} direction="row" spacing={2} alignItems="center">
                            <item.icon sx={{ color: '#6B7280', fontSize: '1.1rem' }} />
                            <Stack spacing={0}>
                              <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.7rem' }}>
                                {item.label}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                {item.value}
                              </Typography>
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>

                    {/* MODERN: Last Order Card */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#1F2937',
                          mb: 1.5,
                          fontSize: '0.95rem',
                        }}
                      >
                        Last Order
                      </Typography>
                      <Card
                        sx={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: 2,
                          boxShadow: 'none',
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.8rem' }}>
                            {contactData.lastOrder.orderId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                            {contactData.lastOrder.items}
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={600} color="primary" sx={{ fontSize: '0.8rem' }}>
                              {contactData.lastOrder.amount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {contactData.lastOrder.date}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* MODERN: Notes */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#1F2937',
                          mb: 1.5,
                          fontSize: '0.95rem',
                        }}
                      >
                        Notes
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {contactData.notes}
                      </Typography>
                    </Box>
                  </Stack>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Stack spacing={1.5}>
                    {contactData.history.map((entry: any) => (
                      <Card
                        key={entry.id}
                        sx={{
                          border: '1px solid #E5E7EB',
                          borderRadius: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            backgroundColor: '#F9FAFB',
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack direction="row" spacing={2}>
                            <Box sx={{ mt: 0.5 }}>
                              {getHistoryIcon(entry.type)}
                            </Box>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                                  {entry.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {entry.timestamp}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                                {entry.details}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                Agent: {entry.agent}
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default CallDetails;

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useSidebar } from '@/components/sidebarcontext';
import { useCallState } from '@/components/CallStateContext';
import { OrderManagementProvider } from '@/components/OrderManagementContext';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import MyReports from '@/components/reports';
import StatusSummary from '@/components/status';
import CallsPerMonth from '@/components/callspm';
import Remarks from '@/components/remarks';
import Dialer from '@/components/dialer';
import RecentCalls from '@/components/recent';

// Call Interface Components
import OrderInfo from '@/components/Orderinfo';
import DynamicForms from '@/components/dynamic-forms';
import CallControls from '@/components/call-controls';
import OrdersTimeline from '@/components/orders-timeline';

const Dashboard: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { callState } = useCallState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // Simple view state management
  const [currentView, setCurrentView] = useState<'dashboard' | 'call-interface'>('dashboard');
  const [dialerNumber, setDialerNumber] = useState<string>('');

  // ADD THIS: Handle URL parameters for call back functionality
  const searchParams = useSearchParams();
  
  // ADD THIS: Effect to handle dialer number from URL params
  useEffect(() => {
    const urlDialerNumber = searchParams.get('dialerNumber');
    if (urlDialerNumber) {
      // Extract just the number part (remove +91 and spaces)
      const cleanNumber = urlDialerNumber.replace(/^\+91\s*/, '').replace(/\s/g, '');
      setDialerNumber(cleanNumber);
      
      // Clear the URL parameter after setting the number
      const url = new URL(window.location.href);
      url.searchParams.delete('dialerNumber');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  // Clean handlers
  const handleNumberSelect = useCallback((number: string) => {
    setDialerNumber(number);
  }, []);

  const handleCallStart = useCallback(() => {
    setCurrentView('call-interface');
  }, []);

  const handleGoBack = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  return (
    <OrderManagementProvider>
      <Box
        sx={{
          display: 'flex',
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: '100vw',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <Sidebar />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            bgcolor: 'background.default',
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            marginLeft: isCollapsed ? '80px' : '224px',
            transition: 'margin-left 0.3s ease',
          }}
        >
          <Header onGoBack={handleGoBack} currentView={currentView} />

          <Box
            component="main"
            sx={{
              bgcolor: 'background.default',
              p: 3,
              flex: 1,
              display: 'flex',
              gap: 3,
              alignItems: 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
              minHeight: 0,
            }}
          >
            {currentView === 'dashboard' ? (
              // DASHBOARD CONTENT
              <>
                {/* Left Column */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ ml: -1, width: '100%' }}>
                    <MyReports />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      height: 400,
                      flexDirection: isMobile ? 'column' : 'row',
                      width: '100%',
                      alignItems: 'stretch',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          width: '100%',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'grey.100',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <StatusSummary />
                      </Paper>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
                      <Paper
                        elevation={1}
                        sx={{
                          width: '100%',
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'grey.100',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <CallsPerMonth />
                      </Paper>
                    </Box>
                  </Box>
                  <Paper
                    elevation={1}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      height: 500,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Remarks />
                  </Paper>
                </Box>

                {/* Right Column */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    width: { xs: '100%', lg: 380 },
                    flexShrink: 0,
                    height: 'fit-content',
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      bgcolor: 'transparent',
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: 'none',
                      height: 500,
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'none',
                    }}
                  >
                    <Dialer
                      isCollapsed={isCollapsed}
                      initialNumber={dialerNumber}
                      onCall={handleCallStart}
                    />
                  </Paper>
                  <Paper
                    elevation={1}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'grey.100',
                      flex: 1,
                      minHeight: 400,
                      display: 'flex',
                      flexDirection: 'column',
                      marginTop: 2,
                    }}
                  >
                    <RecentCalls onNumberSelect={handleNumberSelect} />
                  </Paper>
                </Box>
              </>
            ) : (
              // CALL INTERFACE - FIXED: Proper grid sizing
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '350px 1fr 350px',
                    gap: 3,
                    height: '500px', // FIXED: Use height instead of minHeight
                    alignItems: 'stretch',
                    '& > *': {
                      height: '100%',
                      maxHeight: '500px',
                    }
                  }}
                >
                  <Box 
                    id="order-info-component" 
                    sx={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      margin: 0,
                      padding: 0
                    }}
                  >
                    <OrderInfo />
                  </Box>

                  <DynamicForms />
                  <CallControls />
                </Box>
                
                <OrdersTimeline />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </OrderManagementProvider>
  );
};

export default Dashboard;

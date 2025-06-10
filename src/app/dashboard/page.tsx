'use client';

import { useState } from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useSidebar } from '@/components/sidebarcontext';
import { useCallState } from '@/components/CallStateContext';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import MyReports from '@/components/reports';
import StatusSummary from '@/components/status';
import CallsPerMonth from '@/components/callspm';
import Remarks from '@/components/remarks';
import Dialer from '@/components/dialer';
import RecentCalls from '@/components/recent';

// Call Interface Components
import CustomerInfo from '@/components/customer-info';
import DynamicForms from '@/components/dynamic-forms';
import CallControls from '@/components/call-controls';
import CallTimeline from '@/components/call-timeline';

const Dashboard: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const { callState } = useCallState();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // View state: 'dashboard' or 'call-interface'
  const [currentView, setCurrentView] = useState<'dashboard' | 'call-interface'>('dashboard');
  // For passing number from recent calls to dialer
  const [dialerNumber, setDialerNumber] = useState<string>('');

  // When user selects a number from recent calls
  const handleNumberSelect = (number: string) => {
    setDialerNumber(number);
  };

  // When user places a call from dialer
  const handleCallStart = () => {
    setCurrentView('call-interface');
  };

  // When user clicks the go back button after call ends
  const handleGoBack = () => {
    setCurrentView('dashboard');
  };

  return (
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
        {/* Pass currentView to Header for go back button logic */}
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
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                    }}
                  >
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
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                    }}
                  >
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
                    borderColor: 'none',
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
            // CALL INTERFACE CONTENT (Exact layout from call-interface.tsx)
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '350px 1fr 350px',
                  gap: 3,
                  minHeight: 500,
                }}
              >
                <CustomerInfo />
                <DynamicForms />
                <CallControls />
              </Box>
              <CallTimeline />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

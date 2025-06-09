'use client';

import { useState } from 'react';
import { Box, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useSidebar } from '@/components/sidebarcontext';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import MyReports from '@/components/reports';
import StatusSummary from '@/components/status';
import CallsPerMonth from '@/components/callspm';
import Remarks from '@/components/remarks';
import Dialer from '@/components/dialer';
import RecentCalls from '@/components/recent';

const Dashboard: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Shared state for dialer number
  const [dialerNumber, setDialerNumber] = useState<string>('');

  // Function to handle number selection from recent calls
  const handleNumberSelect = (number: string) => {
    setDialerNumber(number);
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
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - ACCOUNT FOR FIXED SIDEBAR */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          marginLeft: isCollapsed ? '80px' : '224px', // ACCOUNT FOR FIXED SIDEBAR
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Header />
        
        {/* Dashboard Content */}
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
            {/* My Reports */}
            <Box sx={{ ml: -1, width: '100%' }}>
              <MyReports />
            </Box>
            
            {/* Status and Calls Row */}
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
              {/* Status Summary */}
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
              
              {/* Calls Per Month */}
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
            
            {/* Remarks */}
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
              width: { 
                xs: '100%', 
                lg: 380
              },
              flexShrink: 0,
            }}
          >
            {/* Dialer */}
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
              <Dialer isCollapsed={isCollapsed} initialNumber={dialerNumber} />
            </Paper>
            
            {/* Recent Calls */}
            <Paper
              elevation={1}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'grey.100',
                height: 400,
                display: 'flex',
                flexDirection: 'column',
                marginTop: 2,
              }}
            >
              <RecentCalls onNumberSelect={handleNumberSelect} />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

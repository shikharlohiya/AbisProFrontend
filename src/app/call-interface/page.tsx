'use client';

import React from 'react';
import { Box } from '@mui/material';
import { SidebarProvider, useSidebar } from '@/components/sidebarcontext';
import { CallStateProvider } from '@/components/CallStateContext';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import CustomerInfo from '@/components/customer-info';
import DynamicForms from '@/components/dynamic-forms';
import CallControls from '@/components/call-controls';
import CallTimeline from '@/components/call-timeline';

const CallInterfaceContent: React.FC = () => {
  const { isCollapsed } = useSidebar();

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
      
      {/* Main Content Area */}
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
        <Header />
        
        {/* Call Interface Content */}
        <Box
          component="main"
          sx={{
            bgcolor: 'background.default',
            p: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            minHeight: 0,
          }}
        >
          {/* Top Section - 3 Column Grid Layout */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '350px 1fr 350px',
              gap: 3,
              minHeight: 500,
            }}
          >
            {/* Left Column - Customer Info (Connected to Context) */}
            <CustomerInfo />

            {/* Center Column - Dynamic Forms (Self-contained) */}
            <DynamicForms />

            {/* Right Column - Call Controls (Connected to Context) */}
            <CallControls />
          </Box>

          {/* Bottom Section - Timeline (Self-contained) */}
          <CallTimeline />
        </Box>
      </Box>
    </Box>
  );
};

const CallInterface: React.FC = () => {
  return (
    <SidebarProvider>
      <CallStateProvider>
        <CallInterfaceContent />
      </CallStateProvider>
    </SidebarProvider>
  );
};

export default CallInterface;

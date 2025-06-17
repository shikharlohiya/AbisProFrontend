'use client';

import React from 'react';
import { Box } from '@mui/material';
import { SidebarProvider, useSidebar } from '@/components/sidebarcontext';
import { CallStateProvider } from '@/components/CallStateContext';
import { OrderManagementProvider } from '@/components/OrderManagementContext';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import OrderInfo from '@/components/Orderinfo';
import DynamicForms from '@/components/dynamic-forms';
import CallControls from '@/components/call-controls';
import OrdersTimeline from '@/components/orders-timeline';

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
          {/* FIXED: Top Section with proper height constraints */}
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
            {/* Left Column - Order Info */}
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

            {/* Center Column - Dynamic Forms */}
            <DynamicForms />

            {/* Right Column - Call Controls */}
            <CallControls />
          </Box>

          {/* Bottom Section - Orders Timeline */}
          <OrdersTimeline />
        </Box>
      </Box>
    </Box>
  );
};

const CallInterface: React.FC = () => {
  return (
    <SidebarProvider>
      <CallStateProvider>
        <OrderManagementProvider>
          <CallInterfaceContent />
        </OrderManagementProvider>
      </CallStateProvider>
    </SidebarProvider>
  );
};

export default CallInterface;

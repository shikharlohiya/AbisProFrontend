'use client';

import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { useSidebar } from '@/components/sidebarcontext';
import Sidebar from '@/components/sidebar';
import Header from '@/components/header';
import CallsStats from '@/components/calls-stats';
import CallsSearch from '@/components/calls-search';
import CallsList from '@/components/calls-list';
import CallDetails from '@/components/call-details';

const CallsPage: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [selectedCallId, setSelectedCallId] = useState<string>('call-001');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'incoming' | 'outgoing' | 'missed'>('all');

  const handleCallSelect = useCallback((callId: string) => {
    setSelectedCallId(callId);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter: 'all' | 'incoming' | 'outgoing' | 'missed') => {
    setActiveFilter(filter);
  }, []);

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
        <Header currentView="calls" />
        
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
          <CallsStats />
          
          <CallsSearch 
            searchQuery={searchQuery}
            onSearch={handleSearch}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '400px 1fr',
              gap: 3,
              flex: 1,
              minHeight: 600,
            }}
          >
            {/* UPDATED: Removed pagination props for infinite scroll */}
            <CallsList
              selectedCallId={selectedCallId}
              onCallSelect={handleCallSelect}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
            />
            
            <CallDetails selectedCallId={selectedCallId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CallsPage;

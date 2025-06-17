'use client';

import React from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment, 
  Tabs, 
  Tab, 
  IconButton,
  Paper 
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface CallsSearchProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeFilter: 'all' | 'incoming' | 'outgoing' | 'missed';
  onFilterChange: (filter: 'all' | 'incoming' | 'outgoing' | 'missed') => void;
}

const CallsSearch: React.FC<CallsSearchProps> = ({
  searchQuery,
  onSearch,
  activeFilter,
  onFilterChange,
}) => {
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onFilterChange(newValue as 'all' | 'incoming' | 'outgoing' | 'missed');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search calls by name or phone number..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6B7280' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            sx={{
              border: '1px solid #E5E7EB',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#F9FAFB',
              },
            }}
          >
            <FilterIcon sx={{ color: '#6B7280' }} />
          </IconButton>
        </Box>

        {/* Filter Tabs */}
        <Tabs
          value={activeFilter}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#EE3741',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              color: '#6B7280',
              '&.Mui-selected': {
                color: '#EE3741',
                fontWeight: 600,
              },
            },
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Incoming" value="incoming" />
          <Tab label="Outgoing" value="outgoing" />
          <Tab label="Missed" value="missed" />
        </Tabs>
      </Paper>
    </motion.div>
  );
};

export default CallsSearch;

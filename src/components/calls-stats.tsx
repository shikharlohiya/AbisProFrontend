'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Phone as PhoneIcon,
  PhoneCallback as PhoneCallbackIcon,
  PhoneMissed as PhoneMissedIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid #E5E7EB',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
        },
        transition: 'all 0.3s ease',
      }}
    >
      {/* Background Icon */}
      <Box
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          opacity: 0.1,
          transform: 'scale(2)',
        }}
      >
        {icon}
      </Box>
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 2, color: '#EE3741' }}>
            {icon}
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#1F2937',
            mb: 1,
            fontSize: '2rem',
          }}
        >
          {value}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isPositive ? (
            <TrendingUpIcon sx={{ color: '#10B981', fontSize: '1rem', mr: 0.5 }} />
          ) : (
            <TrendingDownIcon sx={{ color: '#EF4444', fontSize: '1rem', mr: 0.5 }} />
          )}
          <Typography
            variant="body2"
            sx={{
              color: isPositive ? '#10B981' : '#EF4444',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {change} this month
          </Typography>
        </Box>
      </Box>
    </Paper>
  </motion.div>
);

const CallsStats: React.FC = () => {
  const statsData = [
    {
      title: 'Total Calls',
      value: '5,423',
      change: '↑ 16%',
      isPositive: true,
      icon: <PhoneIcon fontSize="large" />,
    },
    {
      title: 'Answered Calls',
      value: '1,893',
      change: '↓ 1%',
      isPositive: false,
      icon: <PhoneCallbackIcon fontSize="large" />,
    },
    {
      title: 'Missed Calls',
      value: '893',
      change: '↓ 10%',
      isPositive: true, // Decrease in missed calls is positive
      icon: <PhoneMissedIcon fontSize="large" />,
    },
    {
      title: 'Total Connected Time',
      value: '01:49:32',
      change: '↑ 16%',
      isPositive: true,
      icon: <AccessTimeIcon fontSize="large" />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 3,
        mb: 1,
      }}
    >
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          isPositive={stat.isPositive}
          icon={stat.icon}
          index={index}
        />
      ))}
    </Box>
  );
};

export default CallsStats;

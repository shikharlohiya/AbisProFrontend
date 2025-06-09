'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Box, Typography, Button, ButtonGroup } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSidebar } from '@/components/sidebarcontext';

const CallsPerMonth: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [selectedRange, setSelectedRange] = useState<'3M' | '6M' | '12M' | 'Custom'>('6M');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // FIXED: Client-only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // FIXED: Static data instead of Math.random()
  const getStaticData = useCallback((months: number) => {
    const allData = [
      { month: 'Jan', calls: 398 },
      { month: 'Feb', calls: 473 },
      { month: 'Mar', calls: 511 },
      { month: 'Apr', calls: 398 },
      { month: 'May', calls: 473 },
      { month: 'Jun', calls: 511 },
      { month: 'Jul', calls: 548 },
      { month: 'Aug', calls: 438 },
      { month: 'Sep', calls: 511 },
      { month: 'Oct', calls: 473 },
      { month: 'Nov', calls: 398 },
      { month: 'Dec', calls: 361 }
    ];
    return allData.slice(-months);
  }, []);

  const chartData = useMemo(() => {
    const months = selectedRange === '3M' ? 3 : selectedRange === '6M' ? 6 : 12;
    return getStaticData(months);
  }, [selectedRange, getStaticData]);

  const handleRangeChange = useCallback((range: '3M' | '6M' | '12M' | 'Custom') => {
    if (range === 'Custom') {
      router.push('/charts/custom-range');
      return;
    }
    setSelectedRange(range);
  }, [router]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: 'white',
          p: 2,
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E5E7EB'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1F2937' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: '#3B82F6' }}>
            Calls: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Don't render until client-side
  if (!isClient) {
    return (
      <Box sx={{ 
        width: '100%',
        height: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Typography variant="h6" sx={{ color: '#6B7280' }}>
          Loading chart...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      p: 3,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 2,
        flexShrink: 0
      }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1F2937',
              fontSize: '18px',
              fontFamily: 'Inter, sans-serif',
              mb: 0.5
            }}
          >
            Calls Done per Month
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#6B7280',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Agent Performance Trend
          </Typography>
        </Box>

        {/* Time Range Selector */}
        <ButtonGroup size="small" variant="outlined">
          {(['3M', '6M', '12M', 'Custom'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => handleRangeChange(range)}
              sx={{
                backgroundColor: selectedRange === range ? '#3B82F6' : 'transparent',
                color: selectedRange === range ? '#FFFFFF' : '#6B7280',
                borderColor: '#E5E7EB',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                minWidth: '45px',
                '&:hover': {
                  backgroundColor: selectedRange === range ? '#2563EB' : '#F9FAFB',
                  borderColor: '#E5E7EB'
                }
              }}
            >
              {range}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* ACTUAL CHART - This was missing! */}
      <Box sx={{ 
        width: '100%', 
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center'
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
              domain={[300, 600]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#callsGradient)"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default CallsPerMonth;

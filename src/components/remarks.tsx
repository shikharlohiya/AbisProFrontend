'use client';

import React, { useState } from 'react';
import { 
  Paper, 
  Box, 
  Typography
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useSidebar } from '@/components/sidebarcontext';

const Remarks: React.FC = () => {
  const { isCollapsed } = useSidebar();
  const [hoveredData, setHoveredData] = useState<any>(null);

  // Chart data
  const chartData = [
    {
      day: 'Mon',
      Total: 320,
      Open: 250,
      Closed: 190,
      'Follow Ups': 250
    },
    {
      day: 'Tue',
      Total: 480,
      Open: 320,
      Closed: 280,
      'Follow Ups': 200
    },
    {
      day: 'Wed',
      Total: 480,
      Open: 330,
      Closed: 290,
      'Follow Ups': 200
    },
    {
      day: 'Thu',
      Total: 480,
      Open: 330,
      Closed: 290,
      'Follow Ups': 200
    },
    {
      day: 'Fri',
      Total: 480,
      Open: 330,
      Closed: 290,
      'Follow Ups': 200
    }
  ];

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3, 
        mb: 2,
        flexWrap: 'wrap'
      }}>
        {payload.map((entry: any, index: number) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color
              }}
            />
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '12px' }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            p: 1.5,
            px: 2,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontFamily: 'Inter',
            minWidth: 160,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.75,
              color: '#60a5fa',
              fontSize: '0.875rem',
              textAlign: 'center',
            }}
          >
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 0.5, 
                fontSize: '0.75rem' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: entry.color,
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {entry.dataKey}:
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {entry.value}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      p: 3,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Chart Header */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: '#EE3741',
          mb: 3,
          fontSize: '18px',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        Remarks
      </Typography>

      {/* Chart Container */}
      <Box sx={{ width: '100%', flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
            onMouseMove={(data) => setHoveredData(data)}
            onMouseLeave={() => setHoveredData(null)}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E2E8F0" 
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748B' }}
              domain={[0, 500]}
              ticks={[0, 100, 200, 300, 400, 500]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Bar 
              dataKey="Total" 
              fill="#6366F1" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar 
              dataKey="Open" 
              fill="#06B6D4" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar 
              dataKey="Closed" 
              fill="#EC4899" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
            <Bar 
              dataKey="Follow Ups" 
              fill="#F59E0B" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Remarks;

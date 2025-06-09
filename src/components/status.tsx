'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';

// Types
interface StatusDataItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
  description: string;
}

interface ContainerSize {
  width: number;
  height: number;
}

interface ChartDimensions {
  chartSize: number;
}

interface PieSegment extends StatusDataItem {
  pathData: string;
  labelX: number;
  labelY: number;
  index: number;
}

const StatusSummary: React.FC = () => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isPanelHovered, setIsPanelHovered] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  // Updated data - removed Entertainment entirely
  const statusData: StatusDataItem[] = [
    { 
      label: 'Open', 
      value: 45, 
      percentage: 45, 
      color: '#16DBCC', // Green
      description: 'Active cases requiring attention and follow-up'
    },
    { 
      label: 'In Progress', 
      value: 30, 
      percentage: 30, 
      color: '#FC7900', // Yellow
      description: 'Cases currently being worked on by team members'
    },
    { 
      label: 'Closed', 
      value: 25, 
      percentage: 25, 
      color: '#FF4B4A', // Red
      description: 'Completed and resolved cases with final status'
    }
  ];

  const total: number = statusData.reduce((sum, item) => sum + item.value, 0);

  // Dynamic resize observer
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Chart dimensions calculation - Bigger chart
  const getChartDimensions = (): ChartDimensions => {
    const availableWidth = containerSize.width - 20; // Reduced margins
    const availableHeight = containerSize.height - 120; // Reduced margins for bigger chart
    
    const chartSize = Math.min(availableWidth, availableHeight);
    return {
      chartSize: Math.max(220, Math.min(chartSize, 350)) // Increased min and max size
    };
  };

  const { chartSize } = getChartDimensions();
  const centerX: number = chartSize / 2;
  const centerY: number = chartSize / 2;
  const baseRadius: number = chartSize * 0.45; // Bigger radius

  // Create pie chart segments
  const createPieSegments = (): PieSegment[] => {
    let cumulativePercentage = 0;

    return statusData.map((segment, index) => {
      const startAngle = (cumulativePercentage / 100) * 360 - 90;
      const endAngle = ((cumulativePercentage + segment.percentage) / 100) * 360 - 90;
      
      const hoverIncrease = 10; // Increased hover effect
      const radius = hoveredSegment === index ? baseRadius + hoverIncrease : baseRadius;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const largeArcFlag = segment.percentage > 50 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Label position
      const labelAngle = (startAngle + endAngle) / 2;
      const labelAngleRad = (labelAngle * Math.PI) / 180;
      const labelRadius = radius * 0.65; // Adjusted for better positioning
      const labelX = centerX + labelRadius * Math.cos(labelAngleRad);
      const labelY = centerY + labelRadius * Math.sin(labelAngleRad);

      cumulativePercentage += segment.percentage;

      return {
        ...segment,
        pathData,
        labelX,
        labelY,
        index
      };
    });
  };

  const segments: PieSegment[] = createPieSegments();

  const handleMouseEnterSegment = (index: number): void => {
    setHoveredSegment(index);
  };

  const handleMouseLeaveSegment = (): void => {
    setHoveredSegment(null);
  };

  const handlePanelMouseEnter = (): void => {
    setIsPanelHovered(true);
  };

  const handlePanelMouseLeave = (): void => {
    setIsPanelHovered(false);
  };

  return (
    <Box
      ref={containerRef}
      onMouseEnter={handlePanelMouseEnter}
      onMouseLeave={handlePanelMouseLeave}
      sx={{
        height: '100%',
        width: '100%',
        bgcolor: 'white',
        borderRadius: 5,
        p: 2, // Reduced padding
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.50',
        borderTop: '4px solid #EE3741',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        transform: isPanelHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isPanelHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: isPanelHovered ? 10 : 1,
      }}
    >
      {/* Header - Reduced margin */}
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#1f2937',
            fontFamily: 'Inter',
            margin: 0,
            mb: 0.5,
          }}
        >
          Status Wise Summary
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            color: '#6b7280',
            fontFamily: 'Inter',
            margin: 0,
          }}
        >
          Total Cases: {total}
        </Typography>
      </Box>

      {/* Pie Chart Container - Bigger chart with reduced margins */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          position: 'relative',
          mb: 1.5,
        }}
      >
        <svg
          width={chartSize}
          height={chartSize}
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          style={{
            cursor: 'default',
            maxWidth: '100%',
            height: 'auto',
          }}
        >
          {segments.map((segment) => (
            <g key={segment.index}>
              <path
                d={segment.pathData}
                fill={segment.color}
                stroke="#ffffff"
                strokeWidth="5" // Increased stroke width
                style={{
                  cursor: 'default',
                  transition: 'all 0.3s ease-out',
                  filter: hoveredSegment === segment.index 
                    ? 'brightness(1.1) drop-shadow(0 6px 12px rgba(0,0,0,0.4))' 
                    : 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))',
                }}
                onMouseEnter={() => handleMouseEnterSegment(segment.index)}
                onMouseLeave={handleMouseLeaveSegment}
              />
              
              {/* Percentage Labels */}
              <text
                x={segment.labelX}
                y={segment.labelY - 3}
                textAnchor="middle"
                style={{
                  fill: 'white',
                  fontWeight: 800,
                  fontFamily: 'Inter',
                  pointerEvents: 'none',
                  fontSize: `${Math.max(18, chartSize * 0.08)}px`, // Bigger text
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                }}
              >
                {segment.percentage}%
              </text>
              
              {/* Status Labels */}
              <text
                x={segment.labelX}
                y={segment.labelY + Math.max(14, chartSize * 0.065)}
                textAnchor="middle"
                style={{
                  fill: 'white',
                  fontWeight: 600,
                  fontFamily: 'Inter',
                  pointerEvents: 'none',
                  fontSize: `${Math.max(12, chartSize * 0.05)}px`, // Bigger text
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
                }}
              >
                {segment.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Enhanced Tooltip */}
        {hoveredSegment !== null && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              p: 1.5,
              px: 2,
              borderRadius: 1.5,
              fontSize: '0.75rem',
              fontFamily: 'Inter',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: 140,
              maxWidth: 180,
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                fontSize: '0.8rem',
                color: segments[hoveredSegment].color,
              }}
            >
              {segments[hoveredSegment].label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                mb: 0.5,
                display: 'block',
              }}
            >
              {segments[hoveredSegment].value} cases ({segments[hoveredSegment].percentage}%)
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6rem',
                opacity: 0.8,
                lineHeight: 1.3,
              }}
            >
              {segments[hoveredSegment].description}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Legend - Same size as before */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#f8fafc',
          borderRadius: 1.5,
          p: 1,
          px: 1.5,
          flexShrink: 0,
          gap: 1.5,
          flexWrap: 'wrap',
          border: '1px solid #e2e8f0',
        }}
      >
        {statusData.map((item, index) => (
          <Box
            key={index}
            onMouseEnter={() => handleMouseEnterSegment(index)}
            onMouseLeave={handleMouseLeaveSegment}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'default',
              p: 0.25,
              px: 0.5,
              borderRadius: 1,
              transition: 'all 0.2s ease-out',
              bgcolor: hoveredSegment === index ? '#e2e8f0' : 'transparent',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                flexShrink: 0,
                bgcolor: item.color,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.625rem',
                fontWeight: 600,
                color: '#374151',
                fontFamily: 'Inter',
              }}
            >
              {item.label}: {item.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default StatusSummary;

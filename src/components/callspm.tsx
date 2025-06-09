'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  useTheme,
} from '@mui/material';

// Types
interface CallDetails {
  incoming: number;
  outgoing: number;
  completed: number;
  missed: number;
}

interface ChartDataPoint {
  month: string;
  calls: number;
  date: string;
  details: CallDetails;
}

interface ContainerSize {
  width: number;
  height: number;
}

interface ChartDimensions {
  width: number;
  height: number;
}

interface ChartPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface YAxisLabel {
  value: number;
  y: string;
}

type TimeRange = '3M' | '6M' | '12M' | 'Custom';

const CallsPerMonth: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [isPanelHovered, setIsPanelHovered] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange>('6M');
  const [containerSize, setContainerSize] = useState<ContainerSize>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const theme = useTheme();

  // Generate mock data - simplified without custom range complexity
  const generateMockData = useCallback((months: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const currentDate = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const baseCalls = 450;
      const variation = Math.floor(Math.random() * 200) - 100;
      const calls = Math.max(200, baseCalls + variation);
      
      data.push({
        month: months > 12 ? `${monthName} ${year.toString().slice(-2)}` : monthName,
        calls: calls,
        date: date.toISOString(),
        details: {
          incoming: Math.floor(calls * 0.6),
          outgoing: Math.floor(calls * 0.4),
          completed: Math.floor(calls * 0.85),
          missed: Math.floor(calls * 0.15)
        }
      });
    }
    return data;
  }, []);

  const getMonthsFromRange = useCallback((range: TimeRange): number => {
    switch(range) {
      case '3M': return 3;
      case '6M': return 6;
      case '12M': return 12;
      default: return 6; // Default fallback
    }
  }, []);

  // Simplified chart data calculation - always available for standard ranges
  const chartData = useMemo(() => {
    if (selectedRange === 'Custom') {
      // Don't generate data for custom, we'll redirect instead
      return [];
    }
    const months = getMonthsFromRange(selectedRange);
    return generateMockData(months);
  }, [selectedRange, generateMockData, getMonthsFromRange]);

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

  const getChartDimensions = useCallback((): ChartDimensions => {
    const availableWidth = containerSize.width - 60;
    const availableHeight = containerSize.height - 100;
    return {
      width: Math.max(280, availableWidth),
      height: Math.max(200, availableHeight)
    };
  }, [containerSize]);

  // Dynamic label density calculation
  const getLabelDensity = useCallback((): number => {
    const dataLength = chartData.length;
    const chartWidth = getChartDimensions().width;
    const isNarrow = chartWidth < 400;
    const availableWidth = chartWidth - 100;
    const minLabelWidth = isNarrow ? 25 : 35;
    const maxLabels = Math.floor(availableWidth / minLabelWidth);
    
    if (dataLength <= maxLabels) {
      return 1;
    } else if (dataLength <= maxLabels * 2) {
      return 2;
    } else if (dataLength <= maxLabels * 3) {
      return 3;
    } else {
      return Math.ceil(dataLength / maxLabels);
    }
  }, [chartData.length, getChartDimensions]);

  const { width: chartWidth, height: chartHeight } = getChartDimensions();
  const isNarrow = chartWidth < 400;
  const padding: ChartPadding = { 
    top: 20, 
    right: isNarrow ? 20 : 30, 
    bottom: 35, 
    left: isNarrow ? 45 : 65 
  };

  const innerWidth: number = chartWidth - padding.left - padding.right;
  const innerHeight: number = chartHeight - padding.top - padding.bottom;

  const maxCalls: number = Math.max(...chartData.map(d => d.calls));
  const minCalls: number = Math.min(...chartData.map(d => d.calls));
  const callsRange: number = maxCalls - minCalls || 100;
  const yPadding: number = callsRange * 0.1;
  const yScale: number = innerHeight / (callsRange + yPadding * 2);
  const xScale: number = chartData.length > 1 ? innerWidth / (chartData.length - 1) : innerWidth;

  const generateLinePath = useCallback((): string => {
    return chartData.map((point, index) => {
      const x = padding.left + (index * xScale);
      const y = padding.top + innerHeight - ((point.calls - minCalls + yPadding) * yScale);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  }, [chartData, xScale, yScale, minCalls, yPadding, padding, innerHeight]);

  const generateAreaPath = useCallback((): string => {
    const linePath = generateLinePath();
    const firstX = padding.left;
    const lastX = padding.left + ((chartData.length - 1) * xScale);
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${lastX.toFixed(2)} ${bottomY.toFixed(2)} L ${firstX.toFixed(2)} ${bottomY.toFixed(2)} Z`;
  }, [generateLinePath, chartData.length, xScale, padding, innerHeight]);

  const generateGridLines = useCallback((): React.ReactElement[] => {
    const lines: React.ReactElement[] = [];
    const gridCount = 5;

    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (i * innerHeight / gridCount);
      lines.push(
        <line
          key={`h-grid-${i}`}
          x1={padding.left - 5}
          y1={y.toFixed(2)}
          x2={padding.left + innerWidth + 5}
          y2={y.toFixed(2)}
          stroke="#E5E7EB"
          strokeWidth="0.8"
          opacity={i === 0 || i === gridCount ? 0.9 : 0.5}
        />
      );
    }

    const labelStep = getLabelDensity();
    chartData.forEach((_, index) => {
      if (index % labelStep === 0 || index === chartData.length - 1) {
        const x = padding.left + (index * xScale);
        lines.push(
          <line
            key={`v-grid-${index}`}
            x1={x.toFixed(2)}
            y1={padding.top - 5}
            x2={x.toFixed(2)}
            y2={padding.top + innerHeight + 5}
            stroke="#E5E7EB"
            strokeWidth="0.4"
            opacity="0.3"
          />
        );
      }
    });

    return lines;
  }, [chartData, getLabelDensity, xScale, padding, innerHeight, innerWidth]);

  const handleRangeChange = useCallback((range: TimeRange): void => {
    if (range === 'Custom') {
      // Redirect to custom chart page instead of handling locally
      router.push('/charts/custom-range');
      return;
    }
    setSelectedRange(range);
  }, [router]);

  const handleMouseEnterPoint = useCallback((index: number): void => {
    setHoveredPoint(index);
  }, []);

  const handleMouseLeavePoint = useCallback((): void => {
    setHoveredPoint(null);
  }, []);

  const handlePanelMouseEnter = useCallback((): void => {
    setIsPanelHovered(true);
  }, []);

  const handlePanelMouseLeave = useCallback((): void => {
    setIsPanelHovered(false);
    setHoveredPoint(null);
  }, []);

  const getYAxisLabels = useCallback((): YAxisLabel[] => {
    const labels: YAxisLabel[] = [];
    const stepCount = 5;
    const step = callsRange / stepCount;

    for (let i = 0; i <= stepCount; i++) {
      const value = minCalls + (step * i);
      const y = padding.top + innerHeight - (i * innerHeight / stepCount);
      labels.push({ value: Math.round(value), y: y.toFixed(2) });
    }
    return labels;
  }, [callsRange, minCalls, padding, innerHeight]);

  const yAxisLabels: YAxisLabel[] = getYAxisLabels();
  const labelStep = getLabelDensity();

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
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'grey.50',
        borderTop: '4px solid #EE3741',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        position: 'relative',
        transform: isPanelHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isPanelHovered 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        zIndex: isPanelHovered ? 10 : 1,
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 2.5, 
          flexShrink: 0, 
          pb: 1, 
          borderBottom: '1px solid',
          borderColor: 'grey.50'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#1f2937',
              fontFamily: 'Inter',
              margin: 0,
              mb: 0.75,
              lineHeight: 'tight',
              letterSpacing: 'tight',
            }}
          >
            Calls Done per Month
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontFamily: 'Inter',
              margin: 0,
              lineHeight: 'relaxed',
              fontWeight: 'normal',
            }}
          >
            Agent Performance Trend • {chartData.length} months
          </Typography>
        </Box>

        {/* Simplified Time Range Selector - Always Visible */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '& .MuiButton-root': {
                minWidth: 32,
                px: 1.5,
                py: 0.75,
                fontSize: '0.75rem',
                fontWeight: 500,
                fontFamily: 'Inter',
                textTransform: 'none',
                border: 'none !important',
              },
            }}
          >
            {(['3M', '6M', '12M', 'Custom'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                onClick={() => handleRangeChange(range)}
                sx={{
                  bgcolor: selectedRange === range ? '#2563eb' : 'transparent',
                  color: selectedRange === range ? 'white' : '#6b7280',
                  '&:hover': {
                    bgcolor: selectedRange === range ? '#1d4ed8' : '#f1f5f9',
                    color: selectedRange === range ? 'white' : '#374151',
                  },
                }}
              >
                {range}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>

      {/* Chart Container */}
      <Box 
        sx={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'visible', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 280 
        }}
      >
        <svg
          ref={svgRef}
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4556EF" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#4556EF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#4556EF" stopOpacity="0.02" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4556EF" floodOpacity="0.1"/>
            </filter>
          </defs>

          {/* Grid Lines */}
          {generateGridLines()}

          {/* Area Fill */}
          <path d={generateAreaPath()} fill="url(#areaGradient)" stroke="none" />
          
          {/* Main Line */}
          <path 
            d={generateLinePath()} 
            fill="none" 
            stroke="#4556EF" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#shadow)" 
          />

          {/* Data Points */}
          {chartData.map((point, index) => {
            const x = padding.left + (index * xScale);
            const y = padding.top + innerHeight - ((point.calls - minCalls + yPadding) * yScale);
            return (
              <g key={index}>
                <circle
                  cx={x.toFixed(2)}
                  cy={y.toFixed(2)}
                  r={hoveredPoint === index ? 8 : 0}
                  fill="#4556EF"
                  opacity="0.1"
                  style={{
                    transition: 'all 0.2s ease-out',
                  }}
                />
                <circle
                  cx={x.toFixed(2)}
                  cy={y.toFixed(2)}
                  r={hoveredPoint === index ? 5 : 3.5}
                  fill="#4556EF"
                  stroke="#ffffff"
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                    filter: hoveredPoint === index ? 'drop-shadow(0 2px 4px rgba(69, 86, 239, 0.3))' : 'none'
                  }}
                  onMouseEnter={() => handleMouseEnterPoint(index)}
                  onMouseLeave={handleMouseLeavePoint}
                />
              </g>
            );
          })}

          {/* Dynamic X-Axis Labels - Fixed positioning */}
          {chartData.map((point, index) => {
            if (index % labelStep !== 0 && index !== chartData.length - 1) {
              return null;
            }

            const x = padding.left + (index * xScale);
            const y = padding.top + innerHeight + 15; // Fixed: closer to chart
            return (
              <text
                key={index}
                x={x.toFixed(2)}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fill: '#6b7280',
                  fontSize: chartData.length > 12 ? '9px' : '11px',
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  letterSpacing: 'wide',
                }}
              >
                {point.month}
              </text>
            );
          })}

          {/* Y-Axis Labels */}
          {yAxisLabels.map((label, index) => (
            <text
              key={index}
              x={padding.left - 15}
              y={label.y}
              textAnchor="end"
              dominantBaseline="middle"
              style={{
                fill: '#6b7280',
                fontSize: '10px',
                fontFamily: 'Inter',
                fontWeight: 500,
                letterSpacing: 'wide',
              }}
            >
              {label.value}
            </text>
          ))}
        </svg>

        {/* Enhanced Tooltip */}
        {hoveredPoint !== null && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              p: 1.5,
              px: 2,
              borderRadius: 2,
              fontSize: '0.75rem',
              fontFamily: 'Inter',
              pointerEvents: 'none',
              zIndex: 10,
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
              {chartData[hoveredPoint].month}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.75rem' }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Total:</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>{chartData[hoveredPoint].calls}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: '0.625rem', opacity: 0.7 }}>
              <Typography variant="caption">In: {chartData[hoveredPoint].details.incoming}</Typography>
              <Typography variant="caption">Out: {chartData[hoveredPoint].details.outgoing}</Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CallsPerMonth;

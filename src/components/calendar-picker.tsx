'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Button,
  Fade,
  Portal
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface CalendarDate {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isInRange?: boolean;
}

interface CalendarPickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  onClose: () => void;
  label?: string;
  position?: 'absolute' | 'relative';
  anchorEl?: HTMLElement | null;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  showToday?: boolean;
  theme?: 'default' | 'dark' | 'custom';
  customColors?: {
    primary?: string;
    hover?: string;
    background?: string;
    text?: string;
  };
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ 
  value, 
  onChange, 
  onClose, 
  label = "Select Date",
  position = 'absolute',
  anchorEl,
  minDate,
  maxDate,
  disabledDates = [],
  showToday = true,
  theme = 'default',
  customColors
}) => {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

  // Theme colors
  const getThemeColors = () => {
    if (customColors) return customColors;
    
    switch (theme) {
      case 'dark':
        return {
          primary: '#3B82F6',
          hover: '#2563EB',
          background: '#1F2937',
          text: '#F9FAFB'
        };
      case 'custom':
        return customColors || {
          primary: '#10B981',
          hover: '#059669',
          background: '#FFFFFF',
          text: '#111827'
        };
      default:
        return {
          primary: '#EE3741',
          hover: '#DC2626',
          background: '#FEFEFE',
          text: '#111827'
        };
    }
  };

  const colors = getThemeColors();

  // Calculate position for absolute positioning
  useEffect(() => {
    if (position === 'absolute' && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setCalendarPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.left + scrollLeft
      });
    }
  }, [position, anchorEl]);

  const generateCalendarDays = useCallback((month: Date): CalendarDate[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    const firstDay = new Date(year, monthIndex, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDate[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isDisabled = disabledDates.some(disabledDate => 
        disabledDate.toDateString() === date.toDateString()
      );
      
      const isBeforeMin = minDate && date < minDate;
      const isAfterMax = maxDate && date > maxDate;
      
      days.push({
        date,
        isCurrentMonth: date.getMonth() === monthIndex && !isDisabled && !isBeforeMin && !isAfterMax,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: value?.toDateString() === date.toDateString()
      });
    }
    
    return days;
  }, [value, disabledDates, minDate, maxDate]);

  const days = generateCalendarDays(currentMonth);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    onChange(today);
    onClose();
  }, [onChange, onClose]);

  const handleDateSelect = useCallback((date: Date) => {
    onChange(date);
    onClose();
  }, [onChange, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-calendar-picker]')) {
        onClose();
      }
    };

    if (position === 'absolute') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [position, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const CalendarContent = (
    <Fade in={true}>
      <Paper
        data-calendar-picker
        elevation={8}
        sx={{
          p: 3,
          borderRadius: 3,
          border: `2px solid ${colors.primary}`,
          backgroundColor: colors.background,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          minWidth: 320,
          maxWidth: 400,
          position: position === 'absolute' ? 'absolute' : 'relative',
          top: position === 'absolute' ? calendarPosition.top : 'auto',
          left: position === 'absolute' ? calendarPosition.left : 'auto',
          zIndex: 9999,
          color: colors.text
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ 
            color: colors.primary, 
            fontWeight: 600,
            backgroundColor: `${colors.primary}20`,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: '0.9rem'
          }}>
            {label}
          </Typography>
          
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{
              color: colors.text,
              '&:hover': {
                backgroundColor: `${colors.primary}20`
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Calendar Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigateMonth('prev')}
            sx={{
              backgroundColor: `${colors.primary}10`,
              color: colors.text,
              '&:hover': {
                backgroundColor: colors.primary,
                color: 'white',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            color: colors.text,
            minWidth: 180,
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Typography>
          
          <IconButton 
            onClick={() => navigateMonth('next')}
            sx={{
              backgroundColor: `${colors.primary}10`,
              color: colors.text,
              '&:hover': {
                backgroundColor: colors.primary,
                color: 'white',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Days of Week */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 1, 
          mb: 2 
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Box key={day} sx={{ 
              textAlign: 'center', 
              py: 1,
              fontWeight: 600,
              color: `${colors.text}80`,
              fontSize: '0.75rem'
            }}>
              {day}
            </Box>
          ))}
        </Box>

        {/* Calendar Days */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: 1,
          mb: showToday ? 3 : 2
        }}>
          {days.map((day, index) => (
            <Button
              key={index}
              onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
              onMouseEnter={() => setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
              disabled={!day.isCurrentMonth}
              sx={{
                minWidth: 36,
                height: 36,
                p: 0,
                borderRadius: 2,
                fontSize: '0.875rem',
                fontWeight: day.isToday ? 600 : 400,
                color: !day.isCurrentMonth 
                  ? `${colors.text}30` 
                  : day.isSelected 
                  ? 'white'
                  : day.isToday 
                  ? colors.primary
                  : colors.text,
                backgroundColor: day.isSelected 
                  ? colors.primary
                  : day.isToday 
                  ? `${colors.primary}20`
                  : hoveredDate?.toDateString() === day.date.toDateString()
                  ? `${colors.primary}40`
                  : 'transparent',
                border: day.isToday ? `2px solid ${colors.primary}` : 'none',
                cursor: day.isCurrentMonth ? 'pointer' : 'not-allowed',
                '&:hover': {
                  backgroundColor: day.isCurrentMonth ? (
                    day.isSelected 
                      ? colors.hover 
                      : `${colors.primary}40`
                  ) : `${colors.text}10`,
                  color: day.isCurrentMonth ? 'white' : `${colors.text}50`,
                  transform: day.isCurrentMonth ? 'scale(1.1)' : 'none',
                  boxShadow: day.isCurrentMonth ? `0 4px 8px ${colors.primary}40` : 'none'
                },
                '&:disabled': {
                  backgroundColor: 'transparent',
                  color: `${colors.text}30`,
                  cursor: 'not-allowed'
                },
                transition: 'all 0.2s ease',
                textTransform: 'none'
              }}
            >
              {day.date.getDate()}
            </Button>
          ))}
        </Box>

        {/* Today Button */}
        {showToday && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              onClick={goToToday}
              startIcon={<TodayIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  backgroundColor: colors.primary,
                  color: 'white'
                }
              }}
            >
              Today
            </Button>
          </Box>
        )}
      </Paper>
    </Fade>
  );

  // Render with Portal for absolute positioning
  if (position === 'absolute') {
    return <Portal>{CalendarContent}</Portal>;
  }

  return CalendarContent;
};

export default CalendarPicker;

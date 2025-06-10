'use client';

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button,
  Typography,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// Lazy load calendar for better performance
const CalendarPicker = lazy(() => import('./calendar-picker'));

// Production theme configuration
const theme = createTheme({
  palette: {
    primary: { 
      main: '#EE3741',
      dark: '#DC2626',
      light: '#F98087'
    },
    secondary: {
      main: '#F3F4F6',
      dark: '#6B7280'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 8
        }
      }
    }
  }
});

// FIXED: Separate schemas for form data vs persisted data
const enquiryFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  label: z.string().min(1, 'Label is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.string().min(1, 'Priority is required'),
});

const promotionFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  discount: z.string().min(1, 'Discount is required'),
  criteria: z.string().min(1, 'Criteria is required'),
  description: z.string().min(1, 'Description is required'),
  fromDate: z.date().nullable(),
  toDate: z.date().nullable(),
});

const feedbackFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(1, 'Description is required'),
});

// Persistence schemas (for localStorage)
const promotionPersistenceSchema = z.object({
  code: z.string(),
  discount: z.string(),
  criteria: z.string(),
  description: z.string(),
  fromDate: z.string().nullable(),
  toDate: z.string().nullable(),
});

type FormType = 'enquiry' | 'promotion' | 'feedback';
type EnquiryFormData = z.infer<typeof enquiryFormSchema>;
type PromotionFormData = z.infer<typeof promotionFormSchema>;
type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
type PromotionPersistenceData = z.infer<typeof promotionPersistenceSchema>;

// Utility functions
const formatDateToISO = (date: Date | null): string | null => {
  return date ? date.toISOString().split('T')[0] : null;
};

const parseISODate = (dateString: string | null): Date | null => {
  return dateString ? new Date(dateString) : null;
};

const isDate = (value: any): value is Date => value instanceof Date && !isNaN(value.getTime());

// FIXED: Debounced localStorage hook with proper typing
const useDebouncedPersistence = <T,>(key: string, defaultValue: T, delay = 300) => {
  const [state, setState] = useState<T>(defaultValue);
  const [isClient, setIsClient] = useState(false);

  const debouncedSave = useMemo(
    () => debounce((data: T) => {
      if (isClient) {
        try {
          localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error writing to localStorage:', error);
          }
        }
      }
    }, delay),
    [key, delay, isClient]
  );

  useEffect(() => {
    setIsClient(true);
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setState(JSON.parse(item));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error reading from localStorage:', error);
      }
    }
  }, [key]);

  const setPersistedState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      debouncedSave(newValue);
      return newValue;
    });
  }, [debouncedSave]);

  return [state, setPersistedState, isClient] as const;
};

// Style objects with theme integration
const getButtonStyles = (theme: any) => ({
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  py: 1.5,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: `${theme.palette.primary.main}10`
  }
});

const getSubmitButtonStyles = (theme: any) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  py: 2,
  borderRadius: 2,
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '1rem',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 16px ${theme.palette.primary.main}40`
  },
  '&:disabled': {
    background: theme.palette.secondary.main,
    color: theme.palette.secondary.dark
  },
  transition: 'all 0.2s ease'
});

const DynamicForms: React.FC = () => {
  const [activeForm, setActiveForm, isClient] = useDebouncedPersistence<FormType>('activeForm', 'feedback');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<'from' | 'to' | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<HTMLElement | null>(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const mockAmount = useMemo(() => '2,500.00', []);

  const formatTime = useMemo(() => (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  }, []);

  // FIXED: Form instances with correct typing
  const enquiryForm = useForm<EnquiryFormData>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: { subject: '', label: '', description: '', priority: '' },
    shouldUnregister: true
  });

  const promotionForm = useForm<PromotionFormData>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: { 
      code: '0.00', 
      discount: '', 
      criteria: '', 
      description: '', 
      fromDate: null, 
      toDate: null 
    },
    shouldUnregister: true
  });

  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { subject: '', description: '' },
    shouldUnregister: true
  });

  const getCurrentForm = useCallback(() => {
    switch (activeForm) {
      case 'enquiry': return enquiryForm;
      case 'promotion': return promotionForm;
      case 'feedback': return feedbackForm;
      default: return feedbackForm;
    }
  }, [activeForm, enquiryForm, promotionForm, feedbackForm]);

  const currentForm = getCurrentForm();

// Form persistence with form-specific handling
useEffect(() => {
  if (!isClient) return;

  let subscription: any;

  switch (activeForm) {
    case 'promotion':
      subscription = promotionForm.watch((value) => {
        try {
          const serializedValue = {
            ...value,
            fromDate: value.fromDate ? formatDateToISO(value.fromDate) : null,
            toDate: value.toDate ? formatDateToISO(value.toDate) : null
          };
          localStorage.setItem(`form-data-${activeForm}`, JSON.stringify(serializedValue));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error persisting form data:', error);
          }
        }
      });
      break;
      
    case 'enquiry':
      subscription = enquiryForm.watch((value) => {
        try {
          localStorage.setItem(`form-data-${activeForm}`, JSON.stringify(value));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error persisting form data:', error);
          }
        }
      });
      break;
      
    case 'feedback':
      subscription = feedbackForm.watch((value) => {
        try {
          localStorage.setItem(`form-data-${activeForm}`, JSON.stringify(value));
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Error persisting form data:', error);
          }
        }
      });
      break;
  }

  return () => {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  };
}, [activeForm, promotionForm, enquiryForm, feedbackForm, isClient]);


  // Load persisted form data
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedData = localStorage.getItem(`form-data-${activeForm}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Only handle date parsing for promotion form
        if (activeForm === 'promotion') {
          if (parsed.fromDate) parsed.fromDate = parseISODate(parsed.fromDate);
          if (parsed.toDate) parsed.toDate = parseISODate(parsed.toDate);
        }
        
        currentForm.reset(parsed);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error loading form data:', error);
      }
    }
  }, [activeForm, currentForm, isClient]);

  // Update time every second
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isClient]);

  // Form switching with cleanup
  const handleFormSwitch = useCallback((newFormType: FormType) => {
    getCurrentForm().reset({}, { keepValues: false, keepErrors: false, keepDirty: false });
    setActiveForm(newFormType);
    setShowCalendar(false);
    setActiveCalendar(null);
    setSubmitStatus(null);
  }, [getCurrentForm, setActiveForm]);

  // Enhanced discount handling
  const handleDiscountChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.%]/g, '');
    let calculatedDiscount = sanitized;
    
    if (sanitized.includes('%')) {
      const percentage = parseFloat(sanitized.replace('%', ''));
      if (!isNaN(percentage) && mockAmount) {
        const baseAmount = parseFloat(mockAmount.replace(/,/g, ''));
        const discountAmount = (baseAmount * percentage) / 100;
        calculatedDiscount = discountAmount.toFixed(2);
      }
    }
    
    promotionForm.setValue('discount', calculatedDiscount);
  }, [promotionForm, mockAmount]);

  // Calendar handlers
  const openCalendar = useCallback((type: 'from' | 'to', event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const buttonElement = event.currentTarget;
    setCalendarAnchor(buttonElement);
    setActiveCalendar(type);
    setShowCalendar(true);
  }, []);

  const closeCalendar = useCallback(() => {
    setShowCalendar(false);
    setActiveCalendar(null);
    setCalendarAnchor(null);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    if (activeCalendar) {
      promotionForm.setValue(
        activeCalendar === 'from' ? 'fromDate' : 'toDate', 
        date
      );
    }
  }, [activeCalendar, promotionForm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCalendar) {
        switch (event.key) {
          case 'Escape':
            closeCalendar();
            break;
          case 'Enter':
            if (activeCalendar) {
              const today = new Date();
              handleDateSelect(today);
              closeCalendar();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCalendar, activeCalendar, closeCalendar, handleDateSelect]);

  // Form submission
  const onSubmit = useCallback(async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Form submitted:', { type: activeForm, data });
      }
      
      setSubmitStatus('success');
      currentForm.reset();
      localStorage.removeItem(`form-data-${activeForm}`);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Form submission error:', error);
      }
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeForm, currentForm]);

  const formatDate = useCallback((date: Date | null): string => {
    if (!isDate(date)) return 'SELECT DATE';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Form renderers
  const renderEnquiryForm = useMemo(() => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="subject"
          control={enquiryForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Subject"
              placeholder="Enter subject"
              error={!!enquiryForm.formState.errors.subject}
              helperText={enquiryForm.formState.errors.subject?.message}
              sx={{ flex: 1 }}
              variant="outlined"
              size="small"
            />
          )}
        />
        <Controller
          name="label"
          control={enquiryForm.control}
          render={({ field }) => (
            <FormControl sx={{ flex: 1 }} size="small" error={!!enquiryForm.formState.errors.label}>
              <InputLabel>Label</InputLabel>
              {isClient ? (
                <Select {...field} label="Label">
                  <MenuItem value="">Select label</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="billing">Billing</MenuItem>
                </Select>
              ) : (
                <Select value="" label="Label">
                  <MenuItem value="">Select label</MenuItem>
                </Select>
              )}
              {enquiryForm.formState.errors.label && (
                <Typography color="error" variant="caption">
                  {enquiryForm.formState.errors.label.message}
                </Typography>
              )}
            </FormControl>
          )}
        />
      </Box>

      <Controller
        name="description"
        control={enquiryForm.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            placeholder="Enter description"
            error={!!enquiryForm.formState.errors.description}
            helperText={enquiryForm.formState.errors.description?.message}
            multiline
            rows={4}
            variant="outlined"
            size="small"
          />
        )}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="priority"
          control={enquiryForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Priority"
              placeholder="Enter priority"
              error={!!enquiryForm.formState.errors.priority}
              helperText={enquiryForm.formState.errors.priority?.message}
              sx={{ flex: 1 }}
              variant="outlined"
              size="small"
            />
          )}
        />
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.secondary.main,
          borderRadius: 1,
          px: 2,
          gap: 1,
          minHeight: 40
        }}>
          <TimeIcon sx={{ color: theme.palette.secondary.dark, fontSize: 20 }} />
          <Typography 
            sx={{ 
              color: theme.palette.secondary.dark, 
              fontSize: '0.9rem', 
              fontFamily: 'monospace' 
            }}
            suppressHydrationWarning
          >
            {isClient ? formatTime(currentTime) : '12:00:00 AM'}
          </Typography>
        </Box>
      </Box>
    </Box>
  ), [enquiryForm.control, enquiryForm.formState.errors, currentTime, formatTime, isClient]);

  const renderPromotionForm = useMemo(() => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="code"
          control={promotionForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Code"
              placeholder={mockAmount}
              error={!!promotionForm.formState.errors.code}
              helperText={promotionForm.formState.errors.code?.message}
              sx={{ flex: 1 }}
              variant="outlined"
              size="small"
            />
          )}
        />
        <Controller
          name="discount"
          control={promotionForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Discount"
              placeholder={mockAmount}
              error={!!promotionForm.formState.errors.discount}
              helperText={promotionForm.formState.errors.discount?.message || "Enter amount or percentage (e.g., 15% or 375.00)"}
              onChange={(e) => handleDiscountChange(e.target.value)}
              sx={{ flex: 1 }}
              variant="outlined"
              size="small"
            />
          )}
        />
      </Box>

      <Controller
        name="criteria"
        control={promotionForm.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Criteria"
            placeholder="Enter criteria"
            error={!!promotionForm.formState.errors.criteria}
            helperText={promotionForm.formState.errors.criteria?.message}
            variant="outlined"
            size="small"
          />
        )}
      />

      <Controller
        name="description"
        control={promotionForm.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            placeholder="Enter description"
            error={!!promotionForm.formState.errors.description}
            helperText={promotionForm.formState.errors.description?.message}
            multiline
            rows={4}
            variant="outlined"
            size="small"
          />
        )}
      />

      {/* Date Selection Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 200px',
        gap: 2,
        alignItems: 'stretch'
      }}>
        <Controller
          name="fromDate"
          control={promotionForm.control}
          render={({ field }) => (
            <Button
              onClick={(e) => openCalendar('from', e)}
              variant="outlined"
              startIcon={<CalendarIcon />}
              endIcon={showCalendar && activeCalendar === 'from' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ 
                ...getButtonStyles(theme),
                justifyContent: 'space-between',
                minHeight: 56,
                px: 2
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1, fontSize: '0.75rem' }}>
                  FROM
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1, fontSize: '0.875rem' }}>
                  {formatDate(field.value)}
                </Typography>
              </Box>
            </Button>
          )}
        />
        
        <Controller
          name="toDate"
          control={promotionForm.control}
          render={({ field }) => (
            <Button
              onClick={(e) => openCalendar('to', e)}
              variant="outlined"
              startIcon={<CalendarIcon />}
              endIcon={showCalendar && activeCalendar === 'to' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ 
                ...getButtonStyles(theme),
                justifyContent: 'space-between',
                minHeight: 56,
                px: 2
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1, fontSize: '0.75rem' }}>
                  TO
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1, fontSize: '0.875rem' }}>
                  {formatDate(field.value)}
                </Typography>
              </Box>
            </Button>
          )}
        />

        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.palette.secondary.main,
          borderRadius: 1,
          px: 2,
          gap: 1,
          minHeight: 56,
          justifyContent: 'center'
        }}>
          <TimeIcon sx={{ color: theme.palette.secondary.dark, fontSize: 20 }} />
          <Typography 
            sx={{ 
              color: theme.palette.secondary.dark, 
              fontSize: '0.9rem', 
              fontFamily: 'monospace',
              whiteSpace: 'nowrap'
            }}
            suppressHydrationWarning
          >
            {isClient ? formatTime(currentTime) : '12:00:00 AM'}
          </Typography>
        </Box>
      </Box>

      {/* Calendar Component */}
      {showCalendar && isClient && (
        <Suspense fallback={<CircularProgress size={24} />}>
          <CalendarPicker
            value={activeCalendar === 'from' ? promotionForm.watch('fromDate') : promotionForm.watch('toDate')}
            onChange={handleDateSelect}
            onClose={closeCalendar}
            label={`Select ${activeCalendar === 'from' ? 'From' : 'To'} Date`}
            position="absolute"
            anchorEl={calendarAnchor}
            theme="default"
          />
        </Suspense>
      )}
    </Box>
  ), [
    promotionForm.control, 
    promotionForm.formState.errors, 
    promotionForm.watch,
    currentTime, 
    formatTime, 
    mockAmount, 
    handleDiscountChange, 
    openCalendar, 
    showCalendar, 
    activeCalendar, 
    formatDate, 
    closeCalendar,
    handleDateSelect,
    calendarAnchor,
    isClient
  ]);

  const renderFeedbackForm = useMemo(() => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Controller
        name="subject"
        control={feedbackForm.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Subject"
            placeholder="Enter subject"
            error={!!feedbackForm.formState.errors.subject}
            helperText={feedbackForm.formState.errors.subject?.message}
            variant="outlined"
            size="small"
          />
        )}
      />

      <Controller
        name="description"
        control={feedbackForm.control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            placeholder="Enter your feedback"
            error={!!feedbackForm.formState.errors.description}
            helperText={feedbackForm.formState.errors.description?.message}
            multiline
            rows={8}
            variant="outlined"
            size="small"
          />
        )}
      />
    </Box>
  ), [feedbackForm.control, feedbackForm.formState.errors]);

  if (!isClient) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 3,
          border: `1px solid ${theme.palette.secondary.main}`,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2, color: theme.palette.secondary.dark }}>
            Loading form...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        bgcolor: 'white',
        borderRadius: 3,
        border: `1px solid ${theme.palette.secondary.main}`,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        <FormControl sx={{ mb: 3, maxWidth: 200 }} size="small">
          <InputLabel>Form Type</InputLabel>
          <Select
            value={activeForm}
            onChange={(e) => handleFormSwitch(e.target.value as FormType)}
            label="Form Type"
          >
            <MenuItem value="enquiry">Enquiry</MenuItem>
            <MenuItem value="promotion">Promotion</MenuItem>
            <MenuItem value="feedback">Feedback</MenuItem>
          </Select>
        </FormControl>

        {submitStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Form submitted successfully!
          </Alert>
        )}
        {submitStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to submit form. Please try again.
          </Alert>
        )}

        <Box 
          component="form" 
          onSubmit={currentForm.handleSubmit(onSubmit)} 
          sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {activeForm === 'enquiry' && renderEnquiryForm}
          {activeForm === 'promotion' && renderPromotionForm}
          {activeForm === 'feedback' && renderFeedbackForm}

          <Box sx={{ mt: 4, width: '100%' }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              sx={{
                width: '100%',
                ...getSubmitButtonStyles(theme)
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  Submitting...
                </Box>
              ) : (
                'Submit'
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DynamicForms;

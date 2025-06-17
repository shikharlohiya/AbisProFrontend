'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
// ADD: Import the real API service
import { formsApi, ComplaintData, FeedbackData } from '@/lib/forms-api';

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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Production theme configuration (unchanged)
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

// Form schemas (unchanged)
const complaintsFormSchema = z.object({
  issue: z.string().min(1, 'Issue is required'),
  orders: z.string().min(1, 'Order is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.string().min(1, 'Status is required'),
  followUpDate: z.date().nullable().optional(),
  assignedTo: z.string().min(1, 'Assigned to is required'),
});

const feedbackFormSchema = z.object({
  orders: z.string().optional(),
  feedback: z.string().min(1, 'Feedback is required'),
});

type FormType = 'complaints' | 'promotion' | 'feedback';
type ComplaintsFormData = z.infer<typeof complaintsFormSchema>;
type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

// FIXED: Proper currency symbols
const mockLast5Orders = [
  { id: 'ORD-001', display: '₹2,500 - Spotify Premium, Netflix Basic' },
  { id: 'ORD-002', display: '₹1,200 - Amazon Prime, Disney+ Hotstar' },
  { id: 'ORD-003', display: '₹850 - YouTube Premium, Canva Pro' },
  { id: 'ORD-004', display: '₹3,200 - Adobe Creative Suite, Microsoft Office' },
  { id: 'ORD-005', display: '₹650 - Grammarly Premium, Notion Pro' }
];

const mockLast10Orders = [
  ...mockLast5Orders,
  { id: 'ORD-006', display: '₹1,800 - Figma Pro, Slack Premium' },
  { id: 'ORD-007', display: '₹950 - Zoom Pro, Dropbox Plus' },
  { id: 'ORD-008', display: '₹2,100 - GitHub Pro, Jira Premium' },
  { id: 'ORD-009', display: '₹750 - Evernote Premium, LastPass' },
  { id: 'ORD-010', display: '₹1,450 - Trello Gold, Asana Premium' }
];

// Mock data (unchanged)
const issueTypes = [
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'deliveryboy', label: 'Delivery Boy' },
  { id: 'others', label: 'Others' }
];

const assignedToOptions = [
  { id: 'john_doe', label: 'John Doe - Support Lead' },
  { id: 'jane_smith', label: 'Jane Smith - Customer Service' },
  { id: 'mike_johnson', label: 'Mike Johnson - Technical Support' },
  { id: 'sarah_wilson', label: 'Sarah Wilson - Escalation Team' },
  { id: 'david_brown', label: 'David Brown - Manager' },
  { id: 'lisa_garcia', label: 'Lisa Garcia - Quality Assurance' }
];

// Utility functions (unchanged)
const formatDateToISO = (date: Date | null): string | null => {
  return date ? date.toISOString().split('T')[0] : null;
};

const parseISODate = (dateString: string | null): Date | null => {
  return dateString ? new Date(dateString) : null;
};

// useDebouncedPersistence hook (unchanged)
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

// Style objects (unchanged)
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
  const [submitError, setSubmitError] = useState<string>('');

  // Form instances (unchanged)
  const complaintsForm = useForm<ComplaintsFormData>({
    resolver: zodResolver(complaintsFormSchema),
    defaultValues: { 
      issue: '', 
      orders: '', 
      description: '', 
      status: 'Closed',
      followUpDate: null,
      assignedTo: ''
    },
    shouldUnregister: true
  });

  const feedbackForm = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { 
      orders: 'Overall',
      feedback: '' 
    },
    shouldUnregister: true
  });

  const getCurrentForm = useCallback(() => {
    switch (activeForm) {
      case 'complaints': return complaintsForm;
      case 'feedback': return feedbackForm;
      default: return feedbackForm;
    }
  }, [activeForm, complaintsForm, feedbackForm]);

  const currentForm = getCurrentForm();

  // Form persistence (unchanged - keeping existing logic)
  useEffect(() => {
    if (!isClient) return;

    let subscription: any;

    switch (activeForm) {
      case 'complaints':
        subscription = complaintsForm.watch((value) => {
          try {
            const serializedValue = {
              ...value,
              followUpDate: value.followUpDate ? formatDateToISO(value.followUpDate) : null
            };
            localStorage.setItem(`form-data-${activeForm}`, JSON.stringify(serializedValue));
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
  }, [activeForm, complaintsForm, feedbackForm, isClient]);

  // Load persisted form data (unchanged)
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedData = localStorage.getItem(`form-data-${activeForm}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        if (activeForm === 'complaints') {
          if (parsed.followUpDate) parsed.followUpDate = parseISODate(parsed.followUpDate);
        }
        
        currentForm.reset(parsed);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error loading form data:', error);
      }
    }
  }, [activeForm, currentForm, isClient]);

  // FIXED: Form switching with proper emoji
  const handleFormSwitch = useCallback((newFormType: FormType) => {
    if (newFormType === 'promotion') {
      console.log('⚠️ Promotion form is currently disabled');
      return;
    }
    
    getCurrentForm().reset({}, { keepValues: false, keepErrors: false, keepDirty: false });
    setActiveForm(newFormType);
    setSubmitStatus(null);
    setSubmitError('');
  }, [getCurrentForm, setActiveForm]);

  // FIXED: Real API integration instead of mock
  const onSubmit = useCallback(async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitError('');

    try {
      let response;
      
      // REAL API CALLS based on form type
      switch (activeForm) {
        case 'complaints':
          const complaintsData = data as ComplaintsFormData;
          const complaintPayload: ComplaintData = {
            customerId: 1, // TODO: Get from user context when available
            formtype: 'complaint',
            description: complaintsData.description,
            issue: complaintsData.issue,
            status: complaintsData.status.toLowerCase() as 'open' | 'closed',
            followUpDate: complaintsData.followUpDate?.toISOString() || new Date().toISOString(),
            assignedTo: complaintsData.assignedTo,
            orders: complaintsData.orders
          };
          
          response = await formsApi.submitComplaint(complaintPayload);
          break;
          
        case 'feedback':
          const feedbackData = data as FeedbackFormData;
          const feedbackPayload: FeedbackData = {
            customerId: 1, // TODO: Get from user context when available
            formtype: 'feedback',
            description: feedbackData.feedback,
            orders: feedbackData.orders === 'Overall' ? undefined : feedbackData.orders
          };
          
          response = await formsApi.submitFeedback(feedbackPayload);
          break;
          
        default:
          throw new Error('Invalid form type');
      }

      // Handle API response
      if (response?.success) {
        setSubmitStatus('success');
        currentForm.reset();
        localStorage.removeItem(`form-data-${activeForm}`);
        
        console.log('✅ Form submitted successfully:', response.data);
      } else {
        throw new Error(response?.error || 'Submission failed');
      }
      
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      
      // IMPROVED: Better error handling with API-specific messages
      let errorMessage = 'Failed to submit form. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeForm, currentForm]);

  // IMPROVED: Error display with detailed messages
  const renderErrorAlert = () => {
    if (submitStatus === 'error') {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError || 'Failed to submit form. Please try again.'}
        </Alert>
      );
    }
    return null;
  };

  // Form renderers (keeping existing with fixed emojis)
  const renderComplaintsForm = useMemo(() => (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* First Row: Issue and Orders */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="issue"
            control={complaintsForm.control}
            render={({ field }) => (
              <FormControl sx={{ flex: 1 }} size="small" error={!!complaintsForm.formState.errors.issue}>
                <InputLabel>Issue</InputLabel>
                <Select 
                  {...field} 
                  value={field.value || ''} 
                  label="Issue"
                >
                  <MenuItem value="">Select issue type</MenuItem>
                  {issueTypes.map((issue) => (
                    <MenuItem key={issue.id} value={issue.id}>
                      {issue.label}
                    </MenuItem>
                  ))}
                </Select>
                {complaintsForm.formState.errors.issue && (
                  <Typography color="error" variant="caption">
                    {complaintsForm.formState.errors.issue.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
          <Controller
            name="orders"
            control={complaintsForm.control}
            render={({ field }) => (
              <FormControl sx={{ flex: 1 }} size="small" error={!!complaintsForm.formState.errors.orders}>
                <InputLabel>Orders</InputLabel>
                <Select 
                  {...field} 
                  value={field.value || ''} 
                  label="Orders"
                >
                  <MenuItem value="">Select order</MenuItem>
                  {mockLast5Orders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.display}
                    </MenuItem>
                  ))}
                </Select>
                {complaintsForm.formState.errors.orders && (
                  <Typography color="error" variant="caption">
                    {complaintsForm.formState.errors.orders.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Box>

        {/* Description field */}
        <Controller
          name="description"
          control={complaintsForm.control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value || ''}
              label="Description"
              placeholder="Enter description"
              error={!!complaintsForm.formState.errors.description}
              helperText={complaintsForm.formState.errors.description?.message}
              multiline
              rows={4}
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiInputLabel-root': {
                  backgroundColor: 'white',
                  paddingX: 0.5,
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  transform: 'translate(14px, -9px) scale(0.75)',
                },
              }}
            />
          )}
        />

        {/* Status, Follow-up Date, and Assigned To Row */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="status"
            control={complaintsForm.control}
            render={({ field }) => (
              <FormControl sx={{ flex: 1 }} size="small" error={!!complaintsForm.formState.errors.status}>
                <InputLabel>Status</InputLabel>
                <Select 
                  {...field} 
                  value={field.value || 'Closed'} 
                  label="Status"
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
                {complaintsForm.formState.errors.status && (
                  <Typography color="error" variant="caption">
                    {complaintsForm.formState.errors.status.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
          
          <Controller
            name="followUpDate"
            control={complaintsForm.control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Follow-up Date"
                value={field.value}
                onChange={(newValue) => field.onChange(newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    placeholder: 'Follow up date',
                    variant: 'outlined',
                    sx: { flex: 1 },
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message
                  }
                }}
              />
            )}
          />

          <Controller
            name="assignedTo"
            control={complaintsForm.control}
            render={({ field }) => (
              <FormControl sx={{ flex: 1 }} size="small" error={!!complaintsForm.formState.errors.assignedTo}>
                <InputLabel>Assigned To</InputLabel>
                <Select 
                  {...field} 
                  value={field.value || ''} 
                  label="Assigned To"
                >
                  <MenuItem value="">Select assignee</MenuItem>
                  {assignedToOptions.map((person) => (
                    <MenuItem key={person.id} value={person.id}>
                      {person.label}
                    </MenuItem>
                  ))}
                </Select>
                {complaintsForm.formState.errors.assignedTo && (
                  <Typography color="error" variant="caption">
                    {complaintsForm.formState.errors.assignedTo.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  ), [complaintsForm.control, complaintsForm.formState.errors]);

  // FIXED: Promotion form with proper emoji
  const renderPromotionForm = useMemo(() => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2.5,
      opacity: 0.5,
      pointerEvents: 'none',
      position: 'relative'
    }}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 3,
        borderRadius: 2,
        border: '2px solid #EE3741',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <Typography variant="h6" sx={{ color: '#EE3741', fontWeight: 600, mb: 1 }}>
          🚧 Feature Under Development
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          Promotion form will be available soon
        </Typography>
      </Box>

      {/* Disabled form fields remain the same */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Code"
          placeholder="Promotion code"
          disabled
          sx={{ flex: 1 }}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Discount"
          placeholder="Discount amount"
          disabled
          sx={{ flex: 1 }}
          variant="outlined"
          size="small"
        />
      </Box>

      <TextField
        label="Criteria"
        placeholder="Enter criteria"
        disabled
        variant="outlined"
        size="small"
      />

      <TextField
        label="Description"
        placeholder="Enter description"
        disabled
        multiline
        rows={4}
        variant="outlined"
        size="small"
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="From Date"
            value={null}
            onChange={() => {}}
            disabled
            slotProps={{
              textField: {
                size: 'small',
                variant: 'outlined',
                placeholder: 'Select from date',
                sx: { flex: 1 }
              }
            }}
          />
          
          <DatePicker
            label="To Date"
            value={null}
            onChange={() => {}}
            disabled
            slotProps={{
              textField: {
                size: 'small',
                variant: 'outlined',
                placeholder: 'Select to date',
                sx: { flex: 1 }
              }
            }}
          />
        </LocalizationProvider>
      </Box>
    </Box>
  ), []);

  const renderFeedbackForm = useMemo(() => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Controller
        name="orders"
        control={feedbackForm.control}
        render={({ field }) => (
          <FormControl sx={{ flex: 1 }} size="small">
            <InputLabel>Orders (Optional)</InputLabel>
            <Select 
              {...field} 
              value={field.value || 'Overall'} 
              label="Orders (Optional)"
            >
              <MenuItem value="Overall">Overall</MenuItem>
              {mockLast10Orders.map((order) => (
                <MenuItem key={order.id} value={order.id}>
                  {order.display}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      <Controller
        name="feedback"
        control={feedbackForm.control}
        render={({ field }) => (
          <TextField
            {...field}
            value={field.value || ''}
            label="Feedback"
            placeholder="Enter your feedback"
            error={!!feedbackForm.formState.errors.feedback}
            helperText={feedbackForm.formState.errors.feedback?.message}
            multiline
            rows={8}
            variant="outlined"
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              '& .MuiInputLabel-root': {
                backgroundColor: 'white',
                paddingX: 0.5,
                transform: 'translate(14px, -9px) scale(0.75)',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                transform: 'translate(14px, -9px) scale(0.75)',
              },
            }}
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
        {/* Form selector */}
        <FormControl sx={{ mb: 3, maxWidth: 200 }} size="small">
          <InputLabel>Form Type</InputLabel>
          <Select
            value={activeForm}
            onChange={(e) => handleFormSwitch(e.target.value as FormType)}
            label="Form Type"
          >
            <MenuItem value="complaints">Complaints</MenuItem>
            <MenuItem 
              value="promotion" 
              disabled
              sx={{ 
                color: '#9CA3AF !important',
                '&.Mui-disabled': {
                  color: '#9CA3AF !important'
                }
              }}
            >
              Promotion (Coming Soon)
            </MenuItem>
            <MenuItem value="feedback">Feedback</MenuItem>
          </Select>
        </FormControl>

        {submitStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Form submitted successfully!
          </Alert>
        )}
        
        {renderErrorAlert()}

        <Box 
          component="form" 
          onSubmit={currentForm.handleSubmit(onSubmit)} 
          sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {activeForm === 'complaints' && renderComplaintsForm}
          {activeForm === 'promotion' && renderPromotionForm}
          {activeForm === 'feedback' && renderFeedbackForm}

          <Box sx={{ mt: 4, width: '100%' }}>
            <Button
              type="submit"
              disabled={isSubmitting || activeForm === 'promotion'}
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
              ) : activeForm === 'promotion' ? (
                'Feature Coming Soon'
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

export default React.memo(DynamicForms);

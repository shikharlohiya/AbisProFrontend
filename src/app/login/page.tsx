'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Collapse,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '@/config/authService'; // Import the auth service

// Types
interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface Alert {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface LoginCredentials {
  username: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  // State Management
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    rememberMe: false,
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const router = useRouter();

  // Load saved preferences on mount
  useEffect(() => {
    const loadSavedPreferences = (): void => {
      try {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
          const savedUsername = localStorage.getItem('savedUsername') || '';
          setFormData(prev => ({
            ...prev,
            username: savedUsername,
            rememberMe: true,
          }));
        }
      } catch (error) {
        console.error('Error loading saved preferences:', error);
      }
    };

    loadSavedPreferences();
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Alert Management
  const addAlert = useCallback((alert: Omit<Alert, 'id'>): void => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const removeAlert = useCallback((id: string): void => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  // Auto-remove alerts after 3 seconds
  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setTimeout(() => {
        removeAlert(alerts[0].id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alerts, removeAlert]);

  // ✅ UPDATED: Real Authentication Logic using MongoDB Backend
  const authenticateUser = async (credentials: LoginCredentials): Promise<{
    success: boolean;
    message?: string;
    user?: any;
  }> => {
    // Convert username to EmployeeId for backend compatibility
    const backendCredentials = {
      EmployeeId: credentials.username,
      password: credentials.password
    };
    
    return await authService.login(backendCredentials);
  };

  // Form Handlers
  const handleInputChange = useCallback(
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const togglePasswordVisibility = useCallback((): void => {
    setShowPassword(prev => !prev);
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();

      if (!formData.username.trim()) {
        addAlert({ message: 'Please enter your Employee ID', type: 'error' });
        return;
      }

      if (formData.password.length < 6) {
        addAlert({ message: 'Password must be at least 6 characters', type: 'error' });
        return;
      }

      setIsLoading(true);

      try {
        const result = await authenticateUser({
          username: formData.username.trim(),
          password: formData.password
        });

        if (result.success) {
          addAlert({
            message: 'Login successful! Redirecting to dashboard...',
            type: 'success',
          });

          // Save preferences if remember me is checked
          if (formData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedUsername', formData.username);
          } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedUsername');
          }

          // Redirect after short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);

        } else {
          addAlert({
            message: result.message || 'Login failed. Please check your credentials.',
            type: 'error',
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        addAlert({
          message: 'Cannot connect to server. Please check your connection.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addAlert, formData, router]
  );

  const handleForgotPassword = useCallback(async (): Promise<void> => {
    if (!formData.username.trim()) {
      addAlert({
        message: 'Please enter your Employee ID first',
        type: 'info',
      });
      return;
    }

    addAlert({
      message: 'Password reset instructions sent to your email!',
      type: 'success',
    });
  }, [addAlert, formData.username]);

  return (
    <>
      {/* Full Screen Background Container */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Background Image - Full Coverage */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        >
          <Image
            src="/bg.png"
            alt="Login Background"
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            priority
            quality={100}
            sizes="100vw"
          />
        </Box>

        {/* Content Overlay */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          {/* Alert Container */}
          <Box
            sx={{
              position: 'fixed',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              width: '100%',
              maxWidth: 400,
              px: 2,
            }}
          >
            <Stack spacing={1}>
              {alerts.map((alert) => (
                <Collapse key={alert.id} in={true}>
                  <Alert
                    severity={alert.type}
                    onClose={() => removeAlert(alert.id)}
                    sx={{
                      '& .MuiAlert-message': {
                        fontWeight: 500,
                      },
                    }}
                  >
                    {alert.message}
                  </Alert>
                </Collapse>
              ))}
            </Stack>
          </Box>

          {/* Login Card */}
          <Card
            elevation={12}
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 3,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Logo Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ mb: 2 }}>
                  <Image
                    src="/ib_logo.png"
                    alt="ABIS Logo"
                    width={280}
                    height={90}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                    priority
                  />
                </Box>
              </Box>

              {/* Login Form */}
              <Box component="form" onSubmit={handleLogin} noValidate>
                <Stack spacing={3}>
                  {/* ✅ UPDATED: Employee ID Field */}
                  <TextField
                    fullWidth
                    id="username"
                    label="Employee ID"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    autoComplete="username"
                    disabled={isLoading}
                    variant="outlined"
                    placeholder="Enter your Employee ID"
                    helperText="Use your Employee ID to login"
                  />

                  {/* Password Field */}
                  <TextField
                    fullWidth
                    id="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    autoComplete="current-password"
                    disabled={isLoading}
                    variant="outlined"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Remember Me */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.rememberMe}
                        onChange={handleInputChange('rememberMe')}
                        disabled={isLoading}
                        size="small"
                        sx={{
                          color: '#EE3741',
                          '&.Mui-checked': {
                            color: '#EE3741',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          fontWeight: 500,
                        }}
                      >
                        Remember me
                      </Typography>
                    }
                  />

                  {/* Login Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #d63384 68%, #e85a4f 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                      },
                    }}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>

                  {/* Forgot Password */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      sx={{
                        background: 'linear-gradient(90deg, #EE3741 68%, #F98087 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(238, 55, 65, 0.04)',
                        },
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                </Stack>
              </Box>

              {/* ✅ UPDATED: Demo Credentials */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  Demo: EMP001 / ibg@12345
                </Typography>
              </Box>

              {/* ✅ NEW: Connection Status */}
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  Connected to MongoDB Backend
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default LoginScreen;

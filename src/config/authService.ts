import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';

interface LoginCredentials {
  EmployeeId: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    EmployeeId: string;
    name: string;
    email: string;
    role: string;
  };
}

interface SignupData {
  name: string;
  EmployeeId: string;
  EmployeePhoneNumber: string;
  email: string;
  password: string;
  role?: string;
}

class AuthService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: true, // Important: Include cookies for JWT
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (API_CONFIG.ENVIRONMENT === 'development') {
          console.log('🚀 Auth Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data
          });
        }
        return config;
      },
      (error) => {
        console.error('❌ Auth Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (API_CONFIG.ENVIRONMENT === 'development') {
          console.log('✅ Auth Response:', {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      (error) => {
        console.error('❌ Auth Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    message?: string;
    user?: any;
  }> {
    try {
      console.log('🔐 Attempting login for:', credentials.EmployeeId);
      
      const response = await this.axiosInstance.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.data && response.data.user) {
        console.log('✅ Login successful:', response.data.user);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        
        return {
          success: true,
          message: response.data.message,
          user: response.data.user
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Signup user
  async signup(userData: SignupData): Promise<{
    success: boolean;
    message?: string;
    user?: any;
  }> {
    try {
      console.log('📝 Attempting signup for:', userData.EmployeeId);
      
      const response = await this.axiosInstance.post(
        API_ENDPOINTS.AUTH.SIGNUP,
        userData
      );

      return {
        success: true,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error: any) {
      console.error('❌ Signup failed:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      console.log('🔓 User logged out');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  // Get current user
  getCurrentUser(): any {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Clear auth data
  clearAuth(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;

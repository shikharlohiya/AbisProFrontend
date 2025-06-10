// services/callingApi.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api';

// Types for API requests and responses
interface AuthTokenResponse {
  token: {
    idToken: string;
    expiresIn: number;
  };
}

interface InitiateCallRequest {
  cli: string;
  apartyno: string;
  bpartyno: string;
  reference_id: string;
  dtmfflag: string;
  recordingflag: string;
}

interface InitiateCallResponse {
  status: number;
  message: {
    RespId: number;
    Response: string;
    ReqId: number;
    callid: number;
  };
  requestid: string;
}

interface CallStatusResponse {
  callId: number;
  status: 'ringing' | 'answered' | 'busy' | 'failed' | 'ended';
  duration?: number;
}

class CallingApiService {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken && config.url !== '/api/calling/get-auth-token') {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Log requests in development
        if (API_CONFIG.ENVIRONMENT === 'development') {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling errors and logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (API_CONFIG.ENVIRONMENT === 'development') {
          console.log('✅ API Response:', {
            status: response.status,
            data: response.data
          });
        }
        return response;
      },
      async (error) => {
        console.error('❌ API Error:', error);
        
        // If token expired, try to refresh and retry
        if (error.response?.status === 401 && this.authToken) {
          try {
            await this.getAuthToken();
            // Retry the original request
            return this.axiosInstance.request(error.config);
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Get authentication token
  async getAuthToken(): Promise<string> {
    try {
      // Check if token is still valid
      if (this.authToken && Date.now() < this.tokenExpiry) {
        return this.authToken;
      }

      console.log('🔑 Getting auth token...');
      
      const response: AxiosResponse<AuthTokenResponse> = await this.axiosInstance.post(
        '/api/calling/get-auth-token',
        {} // Empty body - add credentials if needed
      );

      this.authToken = response.data.token.idToken;
      // Set expiry time (subtract 5 minutes for safety)
      this.tokenExpiry = Date.now() + (response.data.token.expiresIn - 300) * 1000;

      console.log('✅ Auth token obtained successfully');
      return this.authToken;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      throw new Error('Authentication failed');
    }
  }

  // Initiate a call
  async initiateCall(phoneNumber: string): Promise<InitiateCallResponse> {
    try {
      // Ensure we have a valid token
      await this.getAuthToken();

      // Clean phone number (remove +91 and non-digits)
      const cleanNumber = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
      
      const requestBody: InitiateCallRequest = {
        cli: API_CONFIG.CLI_NUMBER,
        apartyno: API_CONFIG.APARTY_NUMBER,
        bpartyno: cleanNumber,
        reference_id: `call_${Date.now()}`, // Unique reference ID
        dtmfflag: "0",
        recordingflag: "0"
      };

      console.log('📞 Initiating call to:', cleanNumber);

      const response: AxiosResponse<InitiateCallResponse> = await this.axiosInstance.post(
        '/api/calling/initiate-call',
        requestBody
      );

      console.log('✅ Call initiated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      throw this.handleApiError(error);
    }
  }

  // Get call status (implement when endpoint is available)
  async getCallStatus(callId: number): Promise<CallStatusResponse> {
    try {
      await this.getAuthToken();

      const response: AxiosResponse<CallStatusResponse> = await this.axiosInstance.get(
        `/api/calling/call-status/${callId}`
      );

      return response.data;
    } catch (error) {
      console.error('❌ Failed to get call status:', error);
      throw this.handleApiError(error);
    }
  }

  // End call (implement when endpoint is available)
  async endCall(callId: number): Promise<void> {
    try {
      await this.getAuthToken();

      await this.axiosInstance.post(`/api/calling/end-call/${callId}`);
      console.log('✅ Call ended successfully:', callId);
    } catch (error) {
      console.error('❌ Failed to end call:', error);
      throw this.handleApiError(error);
    }
  }

  // Error handler
  private handleApiError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'API request failed';
      return new Error(`${message} (Status: ${error.response.status})`);
    } else if (error.request) {
      // Network error
      return new Error('Network error - please check your connection');
    } else {
      // Other error
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  // Clear stored token (for logout)
  clearAuth(): void {
    this.authToken = null;
    this.tokenExpiry = 0;
    console.log('🔒 Auth token cleared');
  }
}

// Export singleton instance
export const callingApiService = new CallingApiService();
export default callingApiService;

import apiClient from './api-client';

export interface ComplaintData {
  customerId: number;
  formtype: string;
  description: string;
  issue: string;
  status: 'open' | 'closed';
  followUpDate: string;
  assignedTo: string;
  orders: string;
}

export interface FeedbackData {
  customerId: number;
  formtype: string;
  description: string;
  orders?: string;
}

export interface CustomerFeedbackParams {
  customerId?: number;
  customerPhoneNo?: string;
  orderId?: number;
  status?: string;
  formtype?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

export const formsApi = {
  // Submit complaint to real backend with orders field
  submitComplaint: async (data: ComplaintData): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/forms-complaints', data);
      
      // Store success locally for website persistence
      localStorage.setItem('lastComplaintSubmission', JSON.stringify({
        ...response.data.data,
        submittedAt: new Date().toISOString()
      }));
      
      // Update complaints history
      const existingComplaints = JSON.parse(localStorage.getItem('complaintsHistory') || '[]');
      existingComplaints.unshift({
        ...response.data.data,
        submittedAt: new Date().toISOString()
      });
      
      // Keep only last 10 complaints
      if (existingComplaints.length > 10) {
        existingComplaints.splice(10);
      }
      
      localStorage.setItem('complaintsHistory', JSON.stringify(existingComplaints));
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit complaint:', error);
      
      // Store error for debugging
      localStorage.setItem('lastComplaintError', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        data: data
      }));
      
      throw error;
    }
  },

  // Submit feedback to real backend with orders field
  submitFeedback: async (data: FeedbackData): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.post('/forms-feedback', data);
      
      // Store success locally for website persistence
      localStorage.setItem('lastFeedbackSubmission', JSON.stringify({
        ...response.data.data,
        submittedAt: new Date().toISOString()
      }));
      
      // Update feedback history
      const existingFeedback = JSON.parse(localStorage.getItem('feedbackHistory') || '[]');
      existingFeedback.unshift({
        ...response.data.data,
        submittedAt: new Date().toISOString()
      });
      
      // Keep only last 10 feedback entries
      if (existingFeedback.length > 10) {
        existingFeedback.splice(10);
      }
      
      localStorage.setItem('feedbackHistory', JSON.stringify(existingFeedback));
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      
      // Store error for debugging
      localStorage.setItem('lastFeedbackError', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        data: data
      }));
      
      throw error;
    }
  },

  // Get customer feedback from real backend
  getCustomerFeedback: async (params: CustomerFeedbackParams): Promise<ApiResponse<any>> => {
    try {
      const response = await apiClient.get('/customer-feedback', { params });
      
      // Store fetched data locally for persistence
      if (response.data.data) {
        localStorage.setItem('currentCustomerFeedback', JSON.stringify(response.data.data));
        
        // Update last fetch timestamp
        localStorage.setItem('lastFeedbackFetch', new Date().toISOString());
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch customer feedback:', error);
      
      // Store error for debugging
      localStorage.setItem('lastFetchError', JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
        params: params
      }));
      
      throw error;
    }
  },

  // Get complaint/feedback history from localStorage
  getLocalHistory: () => {
    try {
      const complaints = JSON.parse(localStorage.getItem('complaintsHistory') || '[]');
      const feedback = JSON.parse(localStorage.getItem('feedbackHistory') || '[]');
      
      return {
        complaints,
        feedback,
        total: complaints.length + feedback.length
      };
    } catch (error) {
      console.error('Failed to get local history:', error);
      return {
        complaints: [],
        feedback: [],
        total: 0
      };
    }
  },

  // Clear local storage data
  clearLocalData: () => {
    try {
      const keysToRemove = [
        'lastComplaintSubmission',
        'lastFeedbackSubmission',
        'currentCustomerFeedback',
        'complaintsHistory',
        'feedbackHistory',
        'lastComplaintError',
        'lastFeedbackError',
        'lastFetchError',
        'lastFeedbackFetch'
      ];
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ Local form data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear local data:', error);
      return false;
    }
  },

  // Get last submission status
  getLastSubmissionStatus: () => {
    try {
      const lastComplaint = localStorage.getItem('lastComplaintSubmission');
      const lastFeedback = localStorage.getItem('lastFeedbackSubmission');
      const lastComplaintError = localStorage.getItem('lastComplaintError');
      const lastFeedbackError = localStorage.getItem('lastFeedbackError');
      
      return {
        lastComplaint: lastComplaint ? JSON.parse(lastComplaint) : null,
        lastFeedback: lastFeedback ? JSON.parse(lastFeedback) : null,
        lastComplaintError: lastComplaintError ? JSON.parse(lastComplaintError) : null,
        lastFeedbackError: lastFeedbackError ? JSON.parse(lastFeedbackError) : null,
      };
    } catch (error) {
      console.error('Failed to get submission status:', error);
      return {
        lastComplaint: null,
        lastFeedback: null,
        lastComplaintError: null,
        lastFeedbackError: null,
      };
    }
  }
};

export default formsApi;

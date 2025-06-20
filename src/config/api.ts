export const API_CONFIG = {
  // Update to point to your MongoDB backend
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000'),
  CLI_NUMBER: process.env.NEXT_PUBLIC_CLI_NUMBER || '7610233333',
  APARTY_NUMBER: process.env.NEXT_PUBLIC_APARTY_NUMBER || '9669664944',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  // ✅ NEW: Unified token management configuration
  TOKEN_MANAGEMENT: {
    BACKEND_HANDLES_TOKENS: true, // Backend manages all Vodafone tokens internally
    FRONTEND_TOKEN_REQUIRED: false, // No frontend token management needed
  },
};

export const isDevelopment = API_CONFIG.ENVIRONMENT === 'development';
export const isProduction = API_CONFIG.ENVIRONMENT === 'production';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/user/login',
    SIGNUP: '/api/user/signup',
    LOGOUT: '/api/user/logout',
  },
  CALLING: {
    GET_TOKEN: '/api/calling/get-auth-token', // ✅ Available but not needed for disconnection
    INITIATE_CALL: '/api/calling/initiate-call',
    HANGUP_CALL: '/api/calling/hangup-call',
    // ✅ NEW: Unified call disconnection endpoint
    CALL_DISCONNECTION: '/api/calling/call-disconnection',
    // ✅ NEW: Call status endpoint
    CALL_STATUS: '/api/calling/call-status',
    // ✅ NEW: Hold or Resume endpoint
    HOLD_OR_RESUME: '/api/calling/hold-or-resume',
    // ✅ NEW: Merge call endpoint
    MERGE_CALL: '/api/calling/merge-call',
  },
  CUSTOMER: {
    LIST: '/api/customer/customers',
    FEEDBACK: '/api/customer-feedback/new-feedback',
  }
};

// ✅ NEW: Unified call disconnection configuration
export const UNIFIED_CALL_CONFIG = {
  // Request format for unified disconnection
  DISCONNECTION_FORMAT: {
    CLI_FIELD: 'cli',
    CALL_ID_FIELD: 'call_id', // Note: call_id not callId (legacy format)
  },
  // ✅ FIXED: Hold/Resume format for Vodafone API
  HOLD_RESUME_FORMAT: {
    CLI_FIELD: 'cli',
    CALL_ID_FIELD: 'call_id',
    HOLDORRESUME_FIELD: 'HoldorResume', // ✅ FIXED: Capital H and R
  },
  // ✅ NEW: Merge call format for Vodafone API
  MERGE_CALL_FORMAT: {
    CLI_FIELD: 'cli',
    CALL_ID_FIELD: 'call_id',
    CPARTY_NUMBER_FIELD: 'cparty_number',
  },
  // Headers for unified requests (no auth needed)
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    // No Authorization header - backend manages tokens
  },
  // Default values
  DEFAULTS: {
    CLI: API_CONFIG.CLI_NUMBER,
    REASON: 'user_hangup',
    HOLD_VALUE: '1', // ✅ FIXED: Vodafone expects "1" for hold
    RESUME_VALUE: '0', // ✅ FIXED: Vodafone expects "0" for resume
  },
  // Token management approach
  TOKEN_APPROACH: 'BACKEND_INTERNAL', // Backend handles all token logic
};

// ✅ NEW: Helper functions for unified call handling
export const CALL_HELPERS = {
  // Format phone number for calls
  formatPhoneNumber: (phoneNumber: string): string => {
    return phoneNumber.replace(/^\+91/, '').replace(/\D/g, '');
  },
  
  // Create unified disconnection payload (no token needed)
  createDisconnectionPayload: (callId: string, cli?: string) => ({
    [UNIFIED_CALL_CONFIG.DISCONNECTION_FORMAT.CLI_FIELD]: cli || UNIFIED_CALL_CONFIG.DEFAULTS.CLI,
    [UNIFIED_CALL_CONFIG.DISCONNECTION_FORMAT.CALL_ID_FIELD]: callId,
  }),
  
  // ✅ FIXED: Create hold/resume payload with correct Vodafone format
  createHoldResumePayload: (callId: string, action?: 'hold' | 'resume', cli?: string) => ({
    [UNIFIED_CALL_CONFIG.HOLD_RESUME_FORMAT.CLI_FIELD]: cli || UNIFIED_CALL_CONFIG.DEFAULTS.CLI,
    [UNIFIED_CALL_CONFIG.HOLD_RESUME_FORMAT.CALL_ID_FIELD]: callId,
    [UNIFIED_CALL_CONFIG.HOLD_RESUME_FORMAT.HOLDORRESUME_FIELD]: 
      action === 'hold' ? UNIFIED_CALL_CONFIG.DEFAULTS.HOLD_VALUE : 
      action === 'resume' ? UNIFIED_CALL_CONFIG.DEFAULTS.RESUME_VALUE : 
      UNIFIED_CALL_CONFIG.DEFAULTS.HOLD_VALUE // Default to hold
  }),
  
  // ✅ NEW: Create merge call payload with correct Vodafone format
  createMergeCallPayload: (callId: string, phoneNumber: string, cli?: string) => ({
    [UNIFIED_CALL_CONFIG.MERGE_CALL_FORMAT.CLI_FIELD]: cli || UNIFIED_CALL_CONFIG.DEFAULTS.CLI,
    [UNIFIED_CALL_CONFIG.MERGE_CALL_FORMAT.CALL_ID_FIELD]: callId,
    [UNIFIED_CALL_CONFIG.MERGE_CALL_FORMAT.CPARTY_NUMBER_FIELD]: CALL_HELPERS.formatPhoneNumber(phoneNumber),
  }),
  
  // Create call initiation payload
  createInitiationPayload: (phoneNumber: string, agentId?: string) => ({
    phoneNumber: CALL_HELPERS.formatPhoneNumber(phoneNumber),
    agentId: agentId || 'agent-001',
    timestamp: new Date().toISOString(),
    callType: 'outgoing'
  }),
  
  // Check if environment supports logging
  shouldLog: (type: 'requests' | 'responses' | 'tokens'): boolean => {
    if (type === 'tokens') return false; // Never log tokens
    return API_CONFIG.ENVIRONMENT === 'development';
  },
  
  // ✅ NEW: Validate hold/resume action
  validateHoldResumeAction: (action?: string): boolean => {
    if (!action) return true; // Optional parameter
    return ['hold', 'resume'].includes(action.toLowerCase());
  },
  
  // ✅ FIXED: Convert action to Vodafone format
  actionToVodafoneValue: (action: 'hold' | 'resume'): string => {
    return action === 'hold' ? '1' : '0';
  },
};

// ✅ NEW: Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
    LOG_TOKENS: false, // Never log tokens even in dev
    SHOW_DEBUG_INFO: true,
    ENABLE_HOLD_RESUME: true, // ✅ NEW: Feature flag for hold/resume
    ENABLE_MERGE_CALL: true, // ✅ NEW: Feature flag for merge call
  },
  production: {
    LOG_REQUESTS: false,
    LOG_RESPONSES: false,
    LOG_TOKENS: false,
    SHOW_DEBUG_INFO: false,
    ENABLE_HOLD_RESUME: true, // ✅ NEW: Feature flag for hold/resume
    ENABLE_MERGE_CALL: true, // ✅ NEW: Feature flag for merge call
  },
};

// Get current environment config
export const getCurrentEnvConfig = () => ENV_CONFIG[API_CONFIG.ENVIRONMENT as keyof typeof ENV_CONFIG] || ENV_CONFIG.development;

// ✅ NEW: API request helpers for consistent usage
export const API_HELPERS = {
  // Get backend URL
  getBackendUrl: (): string => {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  },
  
  // Create standard headers (no auth for unified approach)
  createHeaders: (): Record<string, string> => ({
    'Content-Type': 'application/json',
  }),
  
  // Create request config
  createRequestConfig: (timeout?: number) => ({
    headers: API_HELPERS.createHeaders(),
    timeout: timeout || API_CONFIG.TIMEOUT,
  }),
  
  // Log request if enabled
  logRequest: (method: string, url: string, data?: any) => {
    if (CALL_HELPERS.shouldLog('requests')) {
      console.log(`🚀 ${method.toUpperCase()} Request:`, { url, data });
    }
  },
  
  // Log response if enabled
  logResponse: (status: number, data: any) => {
    if (CALL_HELPERS.shouldLog('responses')) {
      console.log(`✅ Response:`, { status, data });
    }
  },
  
  // ✅ FIXED: Hold/Resume specific helpers with correct Vodafone format
  holdResume: {
    // Create hold request with Vodafone format
    createHoldRequest: (callId: string, cli?: string) => 
      CALL_HELPERS.createHoldResumePayload(callId, 'hold', cli),
    
    // Create resume request with Vodafone format
    createResumeRequest: (callId: string, cli?: string) => 
      CALL_HELPERS.createHoldResumePayload(callId, 'resume', cli),
    
    // Create toggle request based on current state
    createToggleRequest: (callId: string, isCurrentlyOnHold: boolean, cli?: string) => 
      CALL_HELPERS.createHoldResumePayload(callId, isCurrentlyOnHold ? 'resume' : 'hold', cli),
    
    // Validate request payload for Vodafone format
    validatePayload: (payload: any): boolean => {
      if (!payload.cli) return false;
      if (!payload.call_id) return false;
      if (!payload.HoldorResume || !['0', '1'].includes(payload.HoldorResume)) return false;
      return true;
    },
    
    // Convert frontend action to Vodafone format
    convertActionToVodafone: (action: 'hold' | 'resume'): string => {
      return CALL_HELPERS.actionToVodafoneValue(action);
    },
  },
  
  // ✅ NEW: Merge call specific helpers
  mergeCall: {
    // Create merge call request
    createMergeRequest: (callId: string, phoneNumber: string, cli?: string) => 
      CALL_HELPERS.createMergeCallPayload(callId, phoneNumber, cli),
    
    // Validate merge call payload
    validatePayload: (payload: any): boolean => {
      if (!payload.cli) return false;
      if (!payload.call_id) return false;
      if (!payload.cparty_number) return false;
      return true;
    },
    
    // Validate phone number format
    validatePhoneNumber: (phoneNumber: string): boolean => {
      const cleaned = CALL_HELPERS.formatPhoneNumber(phoneNumber);
      return cleaned.length >= 10;
    },
  },
};

// ✅ NEW: Feature flags
export const FEATURE_FLAGS = {
  HOLD_RESUME_ENABLED: getCurrentEnvConfig().ENABLE_HOLD_RESUME,
  MERGE_CALL_ENABLED: getCurrentEnvConfig().ENABLE_MERGE_CALL, // ✅ NEW: Merge call feature flag
  LEGACY_DISCONNECTION: true,
  UNIFIED_TOKEN_MANAGEMENT: API_CONFIG.TOKEN_MANAGEMENT.BACKEND_HANDLES_TOKENS,
  DEBUG_MODE: getCurrentEnvConfig().SHOW_DEBUG_INFO,
  VODAFONE_HOLD_FORMAT: true, // ✅ NEW: Use Vodafone's HoldorResume format
};

// ✅ NEW: Call operation types for type safety
export type CallOperation = 'initiate' | 'disconnect' | 'hangup' | 'hold' | 'resume' | 'merge' | 'status';

export interface CallOperationConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  requiresAuth: boolean;
  payloadCreator?: (callId: string, ...args: any[]) => any;
  vodafoneFormat?: boolean; // ✅ NEW: Indicates if uses Vodafone-specific format
}

// ✅ UPDATED: Call operations configuration with Vodafone format support
export const CALL_OPERATIONS: Record<CallOperation, CallOperationConfig> = {
  initiate: {
    endpoint: API_ENDPOINTS.CALLING.INITIATE_CALL,
    method: 'POST',
    requiresAuth: false,
    payloadCreator: CALL_HELPERS.createInitiationPayload,
    vodafoneFormat: true,
  },
  disconnect: {
    endpoint: API_ENDPOINTS.CALLING.CALL_DISCONNECTION,
    method: 'POST',
    requiresAuth: false,
    payloadCreator: CALL_HELPERS.createDisconnectionPayload,
    vodafoneFormat: true,
  },
  hangup: {
    endpoint: API_ENDPOINTS.CALLING.HANGUP_CALL,
    method: 'POST',
    requiresAuth: false,
    vodafoneFormat: true,
  },
  hold: {
    endpoint: API_ENDPOINTS.CALLING.HOLD_OR_RESUME,
    method: 'POST',
    requiresAuth: false,
    payloadCreator: API_HELPERS.holdResume.createHoldRequest,
    vodafoneFormat: true, // ✅ NEW: Uses cli, call_id, HoldorResume format
  },
  resume: {
    endpoint: API_ENDPOINTS.CALLING.HOLD_OR_RESUME,
    method: 'POST',
    requiresAuth: false,
    payloadCreator: API_HELPERS.holdResume.createResumeRequest,
    vodafoneFormat: true, // ✅ NEW: Uses cli, call_id, HoldorResume format
  },
  merge: {
    endpoint: API_ENDPOINTS.CALLING.MERGE_CALL,
    method: 'POST',
    requiresAuth: false,
    payloadCreator: API_HELPERS.mergeCall.createMergeRequest,
    vodafoneFormat: true, // ✅ NEW: Uses cli, call_id, cparty_number format
  },
  status: {
    endpoint: API_ENDPOINTS.CALLING.CALL_STATUS,
    method: 'GET',
    requiresAuth: false,
    vodafoneFormat: false,
  },
};

// ✅ NEW: Vodafone API format constants
export const VODAFONE_API_FORMAT = {
  HOLD_RESUME: {
    REQUIRED_FIELDS: ['cli', 'call_id', 'HoldorResume'],
    HOLD_VALUE: '1',
    RESUME_VALUE: '0',
    FIELD_NAMES: {
      CLI: 'cli',
      CALL_ID: 'call_id',
      ACTION: 'HoldorResume',
    },
  },
  MERGE_CALL: {
    REQUIRED_FIELDS: ['cli', 'call_id', 'cparty_number'],
    FIELD_NAMES: {
      CLI: 'cli',
      CALL_ID: 'call_id',
      CPARTY_NUMBER: 'cparty_number',
    },
  },
  DISCONNECTION: {
    REQUIRED_FIELDS: ['cli', 'call_id'],
    FIELD_NAMES: {
      CLI: 'cli',
      CALL_ID: 'call_id',
    },
  },
  INITIATION: {
    REQUIRED_FIELDS: ['cli', 'apartyno', 'bpartyno'],
    FIELD_NAMES: {
      CLI: 'cli',
      AGENT_NUMBER: 'apartyno',
      CUSTOMER_NUMBER: 'bpartyno',
      REFERENCE_ID: 'reference_id',
    },
  },
};

// ✅ NEW: Validation functions for Vodafone API formats
export const VODAFONE_VALIDATORS = {
  validateHoldResumePayload: (payload: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!payload.cli) errors.push('CLI is required');
    if (!payload.call_id) errors.push('call_id is required');
    if (!payload.HoldorResume) errors.push('HoldorResume is required');
    if (payload.HoldorResume && !['0', '1'].includes(payload.HoldorResume)) {
      errors.push('HoldorResume must be "1" (hold) or "0" (resume)');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
  
  validateMergeCallPayload: (payload: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!payload.cli) errors.push('CLI is required');
    if (!payload.call_id) errors.push('call_id is required');
    if (!payload.cparty_number) errors.push('cparty_number is required');
    
    // Validate phone number format
    if (payload.cparty_number) {
      const cleaned = CALL_HELPERS.formatPhoneNumber(payload.cparty_number);
      if (cleaned.length < 10) {
        errors.push('cparty_number must be a valid phone number');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
  
  validateDisconnectionPayload: (payload: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!payload.cli) errors.push('CLI is required');
    if (!payload.call_id) errors.push('call_id is required');
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

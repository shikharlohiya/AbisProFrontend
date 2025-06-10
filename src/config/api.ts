// config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.0.33.240:5000',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  CLI_NUMBER: process.env.NEXT_PUBLIC_CLI_NUMBER || '7610233333',
  APARTY_NUMBER: process.env.NEXT_PUBLIC_APARTY_NUMBER || '9669664944',
  ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
};

export const isDevelopment = API_CONFIG.ENVIRONMENT === 'development';
export const isProduction = API_CONFIG.ENVIRONMENT === 'production';

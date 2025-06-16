import { ENV_CONFIG } from './env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  ENDPOINTS: {
    JOBS: '/jobs',
    QUESTIONS: '/questions',
    FEEDBACK: '/feedback',
    // Add other endpoints here as you create them
    // INTERVIEWS: '/interviews',
    // USER_PROFILE: '/user/profile',
    // etc.
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}; 
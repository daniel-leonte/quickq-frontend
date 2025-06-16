// Environment Configuration
const getApiBaseUrl = (): string => {
  // Always use the full backend URL (requires backend CORS configuration)
  return import.meta.env.VITE_API_BASE_URL;
};

export const ENV_CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const; 
/**
 * Application Configuration
 * Centralized configuration file for all environment-specific settings
 */

// Type for environment variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DEBUG: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const config = {
  // API Configuration
  api: {
    baseURL: ((import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL) || 'http://localhost:8000/api',
    timeout: 10000,
  },

  // Debug Mode
  debug: ((import.meta as unknown as { env: Record<string, string> }).env.VITE_DEBUG === 'true'),

  // App Information
  app: {
    name: 'WAR Admin Panel',
    version: '1.0.0',
  },

  // Environment
  environment: ((import.meta as unknown as { env: Record<string, string> }).env.MODE),

  // Feature Flags
  features: {
    enableLogging: ((import.meta as unknown as { env: Record<string, string> }).env.VITE_DEBUG === 'true'),
  },
} as const;

// Log config in development
if (config.debug) {
  console.log('🔧 App Configuration:', {
    apiBaseURL: config.api.baseURL,
    environment: config.environment,
    debug: config.debug,
  });
}

export default config;

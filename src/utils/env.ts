/**
 * Environment variables utility
 *
 * This utility provides a secure way to access environment variables with proper typing,
 * default values, and validation.
 */

// Define the shape of our environment variables
interface EnvVariables {
  // Firebase Configuration
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_MEASUREMENT_ID: string;

  // MongoDB Connection
  MONGODB_URI: string;

  // Food API Keys
  OPENFOODFACT_API_KEY: string;
  EDAMAM_APP_ID: string;
  EDAMAM_APP_KEY: string;
  CALORIENINJAS_API_KEY: string;
  FATSECRET_CONSUMER_KEY: string;
  FATSECRET_CONSUMER_SECRET: string;

  // AI Services
  GEMINI_API_KEY: string;

  // Backend API
  API_BASE_URL: string;

  // Feature Flags
  ENABLE_FOOD_DELIVERY: boolean;
  ENABLE_GROCERY_SCRAPING: boolean;
  ENABLE_GEMINI_AI: boolean;
  ENABLE_HEALTH_CHARTS: boolean;

  // Session Configuration
  LOGGED_IN_SESSION_DURATION_HOURS: number;
  GUEST_SESSION_DURATION_HOURS: number;
}

// Get environment variable with type checking and default value
function getEnvVariable<T>(key: string, defaultValue?: T): T {
  const value = import.meta.env[`VITE_${key}`];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    console.warn(`Environment variable ${key} is not defined and no default value was provided.`);
    return '' as unknown as T;
  }

  // Type conversion based on defaultValue type or expected return type
  if (typeof defaultValue === 'boolean' || typeof value === 'boolean') {
    return (value === 'true' || value === true) as unknown as T;
  }

  if (typeof defaultValue === 'number') {
    return Number(value) as unknown as T;
  }

  return value as unknown as T;
}

// Create and export the environment variables object
export const env: EnvVariables = {
  // Firebase Configuration - with fallback values for development
  FIREBASE_API_KEY: getEnvVariable('FIREBASE_API_KEY', 'AIzaSyBuaEOWCEYeV2AknrXhqzuTdIp0rApYPw0'),
  FIREBASE_AUTH_DOMAIN: getEnvVariable('FIREBASE_AUTH_DOMAIN', 'safebite-a5a03.firebaseapp.com'),
  FIREBASE_PROJECT_ID: getEnvVariable('FIREBASE_PROJECT_ID', 'safebite-a5a03'),
  FIREBASE_STORAGE_BUCKET: getEnvVariable('FIREBASE_STORAGE_BUCKET', 'safebite-a5a03.firebasestorage.app'),
  FIREBASE_MESSAGING_SENDER_ID: getEnvVariable('FIREBASE_MESSAGING_SENDER_ID', '203093821661'),
  FIREBASE_APP_ID: getEnvVariable('FIREBASE_APP_ID', '1:203093821661:web:127b2d80f7e08e6c23b334'),
  FIREBASE_MEASUREMENT_ID: getEnvVariable('FIREBASE_MEASUREMENT_ID', 'G-P4KG3JTM4N'),

  // MongoDB Connection
  MONGODB_URI: getEnvVariable('MONGODB_URI', ''),

  // Food API Keys
  OPENFOODFACT_API_KEY: getEnvVariable('OPENFOODFACT_API_KEY', ''),
  EDAMAM_APP_ID: getEnvVariable('EDAMAM_APP_ID', ''),
  EDAMAM_APP_KEY: getEnvVariable('EDAMAM_APP_KEY', ''),
  CALORIENINJAS_API_KEY: getEnvVariable('CALORIENINJAS_API_KEY', ''),
  FATSECRET_CONSUMER_KEY: getEnvVariable('FATSECRET_CONSUMER_KEY', ''),
  FATSECRET_CONSUMER_SECRET: getEnvVariable('FATSECRET_CONSUMER_SECRET', ''),

  // AI Services
  GEMINI_API_KEY: getEnvVariable('GEMINI_API_KEY', ''),

  // Backend API
  API_BASE_URL: getEnvVariable('API_BASE_URL', 'https://safebite-backend.onrender.com'),

  // Feature Flags
  ENABLE_FOOD_DELIVERY: getEnvVariable('ENABLE_FOOD_DELIVERY', true),
  ENABLE_GROCERY_SCRAPING: getEnvVariable('ENABLE_GROCERY_SCRAPING', true),
  ENABLE_GEMINI_AI: getEnvVariable('ENABLE_GEMINI_AI', true),
  ENABLE_HEALTH_CHARTS: getEnvVariable('ENABLE_HEALTH_CHARTS', true),

  // Session Configuration
  LOGGED_IN_SESSION_DURATION_HOURS: getEnvVariable('LOGGED_IN_SESSION_DURATION_HOURS', 3),
  GUEST_SESSION_DURATION_HOURS: getEnvVariable('GUEST_SESSION_DURATION_HOURS', 1),
};

// Validate required environment variables
function validateEnv() {
  const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'API_BASE_URL'
  ];

  const missingVars = requiredVars.filter(key => !env[key as keyof EnvVariables]);

  if (missingVars.length > 0) {
    console.warn(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Run validation in development mode
if (import.meta.env.DEV) {
  validateEnv();
}

export default env;

// Guest Rate Limiting Service
// This service manages rate limiting for guest users

// Define the rate limit structure
interface RateLimit {
  count: number;
  lastReset: number;
  features: {
    [key: string]: {
      count: number;
      lastUsed: number;
    }
  }
}

// Constants
const MAX_USES_PER_HOUR = 5;
const HOUR_IN_MS = 60 * 60 * 1000;

/**
 * Initialize rate limit tracking for guest users
 */
export const initRateLimit = (): void => {
  const existing = localStorage.getItem('guestRateLimit');
  if (!existing) {
    const rateLimit: RateLimit = {
      count: 0,
      lastReset: Date.now(),
      features: {}
    };
    localStorage.setItem('guestRateLimit', JSON.stringify(rateLimit));
  }
};

/**
 * Get the current rate limit data
 * @returns The current rate limit data
 */
export const getRateLimit = (): RateLimit => {
  const data = localStorage.getItem('guestRateLimit');
  if (!data) {
    initRateLimit();
    return getRateLimit();
  }
  return JSON.parse(data);
};

/**
 * Check if a guest user can use a specific feature
 * @param featureName The name of the feature to check
 * @returns Boolean indicating if the user can use the feature
 */
export const canUseFeature = (featureName: string): boolean => {
  // Only apply rate limiting to guest users
  if (localStorage.getItem('userType') !== 'guest') {
    return true;
  }

  const rateLimit = getRateLimit();
  const now = Date.now();
  
  // Check if we need to reset the global counter (hourly)
  if (now - rateLimit.lastReset > HOUR_IN_MS) {
    rateLimit.count = 0;
    rateLimit.lastReset = now;
    rateLimit.features = {};
    localStorage.setItem('guestRateLimit', JSON.stringify(rateLimit));
    return true;
  }
  
  // Check if the feature exists in our tracking
  if (!rateLimit.features[featureName]) {
    rateLimit.features[featureName] = {
      count: 0,
      lastUsed: now
    };
  }
  
  // Check if we need to reset this specific feature counter
  const feature = rateLimit.features[featureName];
  if (now - feature.lastUsed > HOUR_IN_MS) {
    feature.count = 0;
    feature.lastUsed = now;
  }
  
  // Check if the user has exceeded the rate limit
  return feature.count < MAX_USES_PER_HOUR;
};

/**
 * Record usage of a feature by a guest user
 * @param featureName The name of the feature being used
 * @returns Boolean indicating if the usage was recorded successfully
 */
export const recordFeatureUsage = (featureName: string): boolean => {
  // Only apply rate limiting to guest users
  if (localStorage.getItem('userType') !== 'guest') {
    return true;
  }

  if (!canUseFeature(featureName)) {
    return false;
  }
  
  const rateLimit = getRateLimit();
  const now = Date.now();
  
  // Initialize feature if it doesn't exist
  if (!rateLimit.features[featureName]) {
    rateLimit.features[featureName] = {
      count: 0,
      lastUsed: now
    };
  }
  
  // Increment usage count
  rateLimit.features[featureName].count++;
  rateLimit.features[featureName].lastUsed = now;
  rateLimit.count++;
  
  // Save updated rate limit data
  localStorage.setItem('guestRateLimit', JSON.stringify(rateLimit));
  return true;
};

/**
 * Get the remaining uses for a specific feature
 * @param featureName The name of the feature to check
 * @returns Number of remaining uses for the feature
 */
export const getRemainingUses = (featureName: string): number => {
  // Only apply rate limiting to guest users
  if (localStorage.getItem('userType') !== 'guest') {
    return Infinity;
  }

  const rateLimit = getRateLimit();
  
  // If feature doesn't exist, user has max uses available
  if (!rateLimit.features[featureName]) {
    return MAX_USES_PER_HOUR;
  }
  
  const feature = rateLimit.features[featureName];
  const now = Date.now();
  
  // If it's been more than an hour since last use, reset the counter
  if (now - feature.lastUsed > HOUR_IN_MS) {
    return MAX_USES_PER_HOUR;
  }
  
  return Math.max(0, MAX_USES_PER_HOUR - feature.count);
};

/**
 * Get the time remaining until the rate limit resets for a feature
 * @param featureName The name of the feature to check
 * @returns Time in milliseconds until the rate limit resets
 */
export const getTimeUntilReset = (featureName: string): number => {
  // Only apply rate limiting to guest users
  if (localStorage.getItem('userType') !== 'guest') {
    return 0;
  }

  const rateLimit = getRateLimit();
  
  // If feature doesn't exist, return 0
  if (!rateLimit.features[featureName]) {
    return 0;
  }
  
  const feature = rateLimit.features[featureName];
  const now = Date.now();
  const resetTime = feature.lastUsed + HOUR_IN_MS;
  
  return Math.max(0, resetTime - now);
};

/**
 * Format the time until reset in a human-readable format
 * @param timeInMs Time in milliseconds
 * @returns Formatted time string (e.g., "45 minutes")
 */
export const formatTimeUntilReset = (timeInMs: number): string => {
  if (timeInMs <= 0) {
    return 'now';
  }
  
  const minutes = Math.ceil(timeInMs / (60 * 1000));
  
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
};

export default {
  initRateLimit,
  canUseFeature,
  recordFeatureUsage,
  getRemainingUses,
  getTimeUntilReset,
  formatTimeUntilReset
};

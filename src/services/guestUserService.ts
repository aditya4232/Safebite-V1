// Guest User Service - Manages guest user data and rate limiting

// Guest user data interface
export interface GuestUserData {
  name: string;
  featureUsage: {
    [key: string]: {
      count: number;
      lastUsed: number;
    }
  };
  createdAt: number;
  lastActive: number;
}

// Default guest user data
const defaultGuestData: GuestUserData = {
  name: '',
  featureUsage: {},
  createdAt: Date.now(),
  lastActive: Date.now()
};

// Get guest user data from localStorage
export const getGuestUserData = (): GuestUserData => {
  const storedData = localStorage.getItem('guestUserData');
  if (storedData) {
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing guest user data:', error);
      return { ...defaultGuestData };
    }
  }
  return { ...defaultGuestData };
};

// Save guest user data (excluding name) to localStorage
export const saveGuestUserData = (data: Omit<GuestUserData, 'name'>): void => {
  try {
    // Retrieve name from session storage to keep it separate
    const name = getSessionGuestName();
    const fullData: GuestUserData = {
      ...data,
      name: name, // Keep name consistent if needed elsewhere, but primary source is session
      lastActive: Date.now()
    };
    localStorage.setItem('guestUserData', JSON.stringify(fullData));
  } catch (error) {
    console.error('Error saving guest user data:', error);
  }
};

// --- Functions for Session-Based Guest Name ---

// Set guest user name in sessionStorage and localStorage for redundancy
export const setSessionGuestName = (name: string): void => {
  try {
    // Store in both storage types for redundancy
    sessionStorage.setItem('guestUserName', name);
    localStorage.setItem('guestUserName', name);
    console.log('Guest name saved to storage:', name);
  } catch (error) {
    console.error('Error saving guest name to storage:', error);
  }
};

// Get guest user name from sessionStorage
export const getSessionGuestName = (): string => {
  try {
    // Try to get from sessionStorage first
    const sessionName = sessionStorage.getItem('guestUserName');
    if (sessionName) return sessionName;

    // Fall back to localStorage if not in sessionStorage
    const localName = localStorage.getItem('guestUserName');
    if (localName) {
      // If found in localStorage but not in sessionStorage, sync it to sessionStorage
      sessionStorage.setItem('guestUserName', localName);
      return localName;
    }

    return '';
  } catch (error) {
    console.error('Error retrieving guest name from storage:', error);
    return '';
  }
};

// Clear guest user name from sessionStorage
export const clearSessionGuestName = (): void => {
  try {
    sessionStorage.removeItem('guestUserName');
  } catch (error) {
    console.error('Error clearing guest name from session storage:', error);
  }
};


// --- Original Functions (Modified to use Session Name) ---

// Set guest user name (now uses session storage)
export const setGuestName = (name: string): void => {
  setSessionGuestName(name);
  // Update the name field in localStorage as well for potential legacy checks or consistency,
  // but sessionStorage remains the primary source.
  const userData = getGuestUserData(); // Gets other localStorage data (usage, etc.)
  saveGuestUserData({ // Saves updated data (including name from session) back to localStorage
    ...userData, // Spread existing localStorage data (like usage)
    // The 'name' property will be correctly set inside saveGuestUserData by reading from session storage
  });
};

// Get guest user name (now reads from multiple storage locations)
export const getGuestName = (): string => {
  const name = getSessionGuestName();
  console.log('getGuestName() returning:', name);
  return name;
};

// --- Rate Limiting Functions (Continue using localStorage) ---

// Check if a feature can be used (rate limiting)
// Returns true if the feature can be used, false if rate limited
export const canUseFeature = (featureName: string): boolean => {
  const userData = getGuestUserData(); // Reads from localStorage
  const now = Date.now();
  const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  // If feature hasn't been used before, initialize it
  if (!userData.featureUsage[featureName]) {
    userData.featureUsage[featureName] = {
      count: 0,
      lastUsed: 0
    };
  }

  const featureUsage = userData.featureUsage[featureName];

  // Reset count if it's been more than 2 hours since last use
  if (now - featureUsage.lastUsed > twoHoursInMs) {
    featureUsage.count = 0;
  }

  // Check if user has exceeded the limit (2 times per 2 hours)
  if (featureUsage.count >= 2) {
    return false;
  }

  return true;
};

// Record feature usage
export const recordFeatureUsage = (featureName: string): void => {
  const userData = getGuestUserData(); // Reads from localStorage
  const now = Date.now();
  const twoHoursInMs = 2 * 60 * 60 * 1000;

  // If feature hasn't been used before, initialize it
  if (!userData.featureUsage[featureName]) {
    userData.featureUsage[featureName] = {
      count: 0,
      lastUsed: 0
    };
  }

  const featureUsage = userData.featureUsage[featureName];

  // Reset count if it's been more than 2 hours since last use
  if (now - featureUsage.lastUsed > twoHoursInMs) {
    featureUsage.count = 0;
  }

  // Increment usage count and update last used timestamp
  featureUsage.count += 1;
  featureUsage.lastUsed = now;

  // Save updated data
  saveGuestUserData(userData);
};

// Get remaining uses for a feature
export const getRemainingUses = (featureName: string): number => {
  const userData = getGuestUserData(); // Reads from localStorage
  const now = Date.now();
  const twoHoursInMs = 2 * 60 * 60 * 1000;

  // If feature hasn't been used before, return max uses
  if (!userData.featureUsage[featureName]) {
    return 2;
  }

  const featureUsage = userData.featureUsage[featureName];

  // Reset count if it's been more than 2 hours since last use
  if (now - featureUsage.lastUsed > twoHoursInMs) {
    return 2;
  }

  // Return remaining uses (max 2 - current count)
  return Math.max(0, 2 - featureUsage.count);
};

// Get time until reset for a feature (in milliseconds)
export const getTimeUntilReset = (featureName: string): number => {
  const userData = getGuestUserData(); // Reads from localStorage

  // If feature hasn't been used before, return 0
  if (!userData.featureUsage[featureName]) {
    return 0;
  }

  const featureUsage = userData.featureUsage[featureName];
  const now = Date.now();
  const twoHoursInMs = 2 * 60 * 60 * 1000;
  const resetTime = featureUsage.lastUsed + twoHoursInMs;

  // Return time until reset (or 0 if already reset)
  return Math.max(0, resetTime - now);
};

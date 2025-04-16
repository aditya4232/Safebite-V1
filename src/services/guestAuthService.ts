import { getAuth } from "firebase/auth";
import { app } from "../firebase";
// Removed duplicate imports below
import { getGuestUserData, saveGuestUserData, getGuestName, setGuestName } from "./guestUserService";
import { useToast } from "@/hooks/use-toast";

// Extend the Window interface to declare the custom timer property
declare global {
  interface Window {
    guestSessionTimer?: NodeJS.Timeout | null; // Use NodeJS.Timeout for setInterval return type
  }
}

// Guest user data structure
export interface GuestUserData {
  displayName: string;
  createdAt: Date;
  lastLoginAt: Date;
  sessionExpiresAt: Date; // Added session expiration timestamp
  preferences: Record<string, any>;
  healthData: Record<string, any>;
}

/**
 * Service to handle guest authentication
 */
class GuestAuthService {
  private auth = getAuth(app);

  /**
   * Sign in as a guest user (simulated, no Firebase anonymous auth)
   * @returns Promise that resolves when guest login is complete
   */
  async signInAsGuest(name?: string): Promise<void> {
    try {
      // Check if already in guest mode
      const isAlreadyGuest = localStorage.getItem('userType') === 'guest';

      // Calculate session expiration time (1 hour from now)
      const now = new Date();
      const expirationTime = new Date(now.getTime() + 60 * 60 * 1000); // 60 minutes (1 hour) in milliseconds

      // If already in guest mode and no new name provided, just extend the session
      if (isAlreadyGuest && !name) {
        console.log('Already in guest mode, extending session');
        this.extendGuestSession();
        return;
      }

      // Generate a random guest ID if not already a guest
      const guestId = isAlreadyGuest
        ? localStorage.getItem('guestId') || 'guest_' + Math.random().toString(36).substring(2, 15)
        : 'guest_' + Math.random().toString(36).substring(2, 15);

      // Set flags to identify guest users
      localStorage.setItem('userType', 'guest');
      sessionStorage.setItem('safebite-guest-mode', 'true');
      localStorage.setItem('guestId', guestId);

      // Store session expiration time
      localStorage.setItem('guestSessionExpires', expirationTime.toISOString());

      // Check if we already have a guest name in persistent storage
      const existingName = getGuestName();
      const displayName = name || existingName || 'Guest User';

      // If a name was provided or we don't have one yet, save it
      if (name || !existingName) {
        setGuestName(displayName);

        // Also store directly in localStorage for redundancy
        localStorage.setItem('guestUserName', displayName);
        sessionStorage.setItem('guestUserName', displayName);

        console.log('Guest name set in auth service:', displayName, {
          localStorage: localStorage.getItem('guestUserName'),
          sessionStorage: sessionStorage.getItem('guestUserName')
        });
      }

      // Create a temporary user profile in memory
      const guestData: GuestUserData = {
        displayName: displayName,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        sessionExpiresAt: expirationTime,
        preferences: {
          theme: 'dark',
          notifications: false,
        },
        healthData: {
          // Default health data for guest users
          healthScore: 75,
          weeklyProgress: [65, 68, 70, 72, 75],
          nutritionGoals: {
            calories: 2000,
            protein: 100,
            carbs: 250,
            fat: 65
          }
        }
      };

      // Store guest data in session storage (not persisted)
      sessionStorage.setItem('guestUserData', JSON.stringify(guestData));

      // Set a flag to indicate that guest name has been set
      localStorage.setItem('guestNameSet', 'true');

      // Start the session timer
      this.startSessionTimer();

      console.log('Guest login successful', guestId, 'with name', displayName, 'expires at', expirationTime);
      return;
    } catch (error) {
      console.error('Error setting up guest mode:', error);
      throw error;
    }
  }

  /**
   * Check if the current user is a guest and has a valid session
   * @returns boolean indicating if user is in guest mode with valid session
   */
  isGuestUser(): boolean {
    const isGuest = localStorage.getItem('userType') === 'guest' ||
                  sessionStorage.getItem('safebite-guest-mode') === 'true';

    if (isGuest) {
      // Check if session is still valid
      return this.isSessionValid();
    }

    return false;
  }

  /**
   * Check if the guest session is still valid
   * @returns boolean indicating if the session is valid
   */
  isSessionValid(): boolean {
    const expirationTimeStr = localStorage.getItem('guestSessionExpires');

    if (!expirationTimeStr) {
      return false;
    }

    try {
      const expirationTime = new Date(expirationTimeStr);
      const now = new Date();

      return now < expirationTime;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return false;
    }
  }

  /**
   * Extend the guest session by another 1 hour
   */
  extendGuestSession(): void {
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 60 * 60 * 1000); // 60 minutes (1 hour)

    localStorage.setItem('guestSessionExpires', expirationTime.toISOString());

    // Update the session expiration in guest data
    const guestData = this.getGuestUserData();
    if (guestData) {
      guestData.sessionExpiresAt = expirationTime;
      sessionStorage.setItem('guestUserData', JSON.stringify(guestData));
    }

    console.log('Guest session extended to', expirationTime);

    // Restart the session timer
    this.startSessionTimer();
  }

  /**
   * Start a timer to check session validity and redirect if expired
   */
  startSessionTimer(): void {
    // Clear any existing timer
    if (window.guestSessionTimer) {
      clearInterval(window.guestSessionTimer);
    }

    // Set up a timer to check session validity every 30 seconds
    window.guestSessionTimer = setInterval(() => {
      if (!this.isSessionValid()) {
        console.log('Guest session expired, redirecting to login');
        this.exitGuestMode();

        // Redirect to login page
        const baseUrl = window.location.pathname.includes('/SafeBite-V1')
          ? '/SafeBite-V1'
          : '';

        window.location.href = `${baseUrl}/auth/login`;
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get guest user data from session storage
   * @returns Guest user data or null if not found
   */
  getGuestUserData(): GuestUserData | null {
    const data = sessionStorage.getItem('guestUserData');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Update guest user data in session storage
   * @param data Partial guest user data to update
   */
  updateGuestUserData(data: Partial<GuestUserData>): void {
    const currentData = this.getGuestUserData() || {
      displayName: 'Guest User',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {},
      healthData: {}
    };

    const updatedData = {
      ...currentData,
      ...data,
      lastLoginAt: new Date() // Always update last login time
    };

    sessionStorage.setItem('guestUserData', JSON.stringify(updatedData));
  }

  /**
   * Exit guest mode and clear all guest data
   */
  exitGuestMode(): void {
    localStorage.removeItem('userType');
    localStorage.removeItem('guestId');
    localStorage.removeItem('guestSessionExpires');
    localStorage.removeItem('guestUserName');
    localStorage.removeItem('guestNameSet');
    sessionStorage.removeItem('safebite-guest-mode');
    sessionStorage.removeItem('guestUserData');
    sessionStorage.removeItem('guestUserName');

    // Clear the session timer
    if (window.guestSessionTimer) {
      clearInterval(window.guestSessionTimer);
      window.guestSessionTimer = null;
    }

    // No need to sign out since we're not using Firebase anonymous auth
    console.log('Exited guest mode');
  }

  /**
   * Convert guest account to permanent account
   * This would typically involve creating a new account and transferring data
   * @param email User email
   * @param password User password
   * @returns Promise that resolves when conversion is complete
   */
  async convertGuestToPermanent(email: string, password: string): Promise<void> {
    // This is a placeholder for future implementation
    // In a real implementation, you would:
    // 1. Create a new account with email/password
    // 2. Transfer any guest data to the new account
    // 3. Delete the anonymous account

    console.log('Converting guest to permanent account is not implemented yet');
    throw new Error('Not implemented');
  }
}

// Create and export a singleton instance
const guestAuthService = new GuestAuthService();
export default guestAuthService;

import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getGuestUserData, saveGuestUserData, getGuestName, setGuestName } from "./guestUserService";

// Guest user data structure
export interface GuestUserData {
  displayName: string;
  createdAt: Date;
  lastLoginAt: Date;
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

      // If already in guest mode and no new name provided, just return
      if (isAlreadyGuest && !name) {
        console.log('Already in guest mode, no need to sign in again');
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

      // Check if we already have a guest name in persistent storage
      const existingName = getGuestName();
      const displayName = name || existingName || 'Guest User';

      // If a name was provided or we don't have one yet, save it
      if (name || !existingName) {
        setGuestName(displayName);
      }

      // Create a temporary user profile in memory
      const guestData: GuestUserData = {
        displayName: displayName,
        createdAt: new Date(),
        lastLoginAt: new Date(),
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

      console.log('Guest login successful', guestId, 'with name', displayName);
      return;
    } catch (error) {
      console.error('Error setting up guest mode:', error);
      throw error;
    }
  }

  /**
   * Check if the current user is a guest
   * @returns boolean indicating if user is in guest mode
   */
  isGuestUser(): boolean {
    return localStorage.getItem('userType') === 'guest' ||
           sessionStorage.getItem('safebite-guest-mode') === 'true';
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
    sessionStorage.removeItem('safebite-guest-mode');
    sessionStorage.removeItem('guestUserData');

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

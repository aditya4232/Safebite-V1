// Window Close Service for SafeBite
// Handles logging out users when they close the window or browser

import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';
import simpleSessionService from './simpleSessionService';
import guestAuthService from './guestAuthService';

class WindowCloseService {
  private auth = getAuth(app);
  private isInitialized = false;

  /**
   * Initialize the window close service
   * This should be called once when the app starts
   */
  public initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Add event listener for beforeunload event - only triggers when browser/tab is closed
    window.addEventListener('beforeunload', this.handleWindowClose);

    // We're removing the visibilitychange event as it causes logout on tab switching
    // which is not the desired behavior

    this.isInitialized = true;
    console.log('Window close service initialized - will only logout on browser close');
  }

  /**
   * Clean up event listeners
   * This should be called when the app is unmounted
   */
  public cleanup(): void {
    window.removeEventListener('beforeunload', this.handleWindowClose);
    this.isInitialized = false;
    console.log('Window close service cleaned up');
  }

  /**
   * Handle window close event
   * This will be called when the user closes the window or browser
   */
  private handleWindowClose = (event: BeforeUnloadEvent): void => {
    // Check if user is logged in
    if (this.auth.currentUser) {
      console.log('Window closing, logging out user');

      // Clear session data
      simpleSessionService.clearSession();

      // No need to call signOut here as the page is unloading anyway
      // and Firebase will handle the cleanup
    } else if (guestAuthService.isGuestUser()) {
      console.log('Window closing, exiting guest mode');

      // Exit guest mode
      guestAuthService.exitGuestMode();
    }
  };

  // We've removed the handleVisibilityChange method as it was causing logout on tab switching
}

// Create and export a singleton instance
const windowCloseService = new WindowCloseService();
export default windowCloseService;

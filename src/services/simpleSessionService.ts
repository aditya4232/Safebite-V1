// Simple Session Service for SafeBite
// Handles session duration, persistence, and cleanup

import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../firebase';

// Session durations in milliseconds
const LOGGED_IN_SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours for logged-in users
const GUEST_SESSION_DURATION = 1 * 60 * 60 * 1000; // 1 hour for guest users

// Session keys
const SESSION_ID_KEY = 'safebite-session-id';
const SESSION_TYPE_KEY = 'safebite-session-type';
const SESSION_EXPIRES_KEY = 'safebite-session-expires';
const USER_TYPE_KEY = 'userType';
const GUEST_MODE_KEY = 'safebite-guest-mode';
const GUEST_NAME_KEY = 'guestUserName';

class SimpleSessionService {
  private auth = getAuth(app);
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize session monitoring
    this.initSessionMonitoring();
  }

  // Initialize session monitoring
  private initSessionMonitoring() {
    // Check for existing session
    this.checkExistingSession();

    // Set up auth state change listener
    onAuthStateChanged(this.auth, (user) => {
      const isGuest = localStorage.getItem(USER_TYPE_KEY) === 'guest' ||
                     sessionStorage.getItem(GUEST_MODE_KEY) === 'true';

      if (user) {
        // User is signed in
        this.refreshSession('logged-in');
        console.log('Session refreshed for logged-in user:', user.email);
      } else if (isGuest) {
        // User is in guest mode
        this.refreshSession('guest');
        console.log('Session refreshed for guest user');
      }
      // We've removed the else block that was clearing sessions
      // This prevents logout when navigating between pages
    });

    // Set up interval to check session expiry
    this.sessionCheckInterval = setInterval(() => {
      this.checkSessionExpiry();
    }, 60000); // Check every minute
  }

  // Check for existing session
  private checkExistingSession() {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    const sessionType = localStorage.getItem(SESSION_TYPE_KEY);
    const sessionExpires = localStorage.getItem(SESSION_EXPIRES_KEY);

    if (sessionId && sessionType && sessionExpires) {
      const expiryTime = parseInt(sessionExpires, 10);
      const currentTime = Date.now();

      if (currentTime < expiryTime) {
        // Session is still valid
        console.log('Existing session found:', { sessionType, expiresIn: (expiryTime - currentTime) / 1000 / 60 + ' minutes' });

        // Refresh the session
        this.refreshSession(sessionType as 'logged-in' | 'guest');
      } else {
        // Session has expired
        console.log('Session expired, clearing...');
        this.clearSession();
      }
    }
  }

  // Check if session has expired
  private checkSessionExpiry() {
    const sessionExpires = localStorage.getItem(SESSION_EXPIRES_KEY);

    if (sessionExpires) {
      const expiryTime = parseInt(sessionExpires, 10);
      const currentTime = Date.now();

      // Check if the session has actually expired
      if (currentTime < expiryTime) {
        // If session is still valid but about to expire (less than 30 minutes), refresh it
        const remainingMinutes = Math.round((expiryTime - currentTime) / 1000 / 60);
        if (remainingMinutes < 30) {
          const sessionType = localStorage.getItem(SESSION_TYPE_KEY) as 'logged-in' | 'guest' || 'logged-in';
          this.refreshSession(sessionType);
          console.log(`Session refreshed, was about to expire in ${remainingMinutes} minutes`);
        }
      }
      // We've removed the session expiration handling that was causing logout
      // The session will only be cleared when the browser is closed
    }
  }

  // Create a new session
  public createSession(type: 'logged-in' | 'guest'): string {
    const sessionId = this.generateSessionId();
    const expiryTime = Date.now() + (type === 'logged-in' ? LOGGED_IN_SESSION_DURATION : GUEST_SESSION_DURATION);

    // Store session data
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(SESSION_TYPE_KEY, type);
    localStorage.setItem(SESSION_EXPIRES_KEY, expiryTime.toString());

    // Set user type
    localStorage.setItem(USER_TYPE_KEY, type === 'logged-in' ? 'user' : 'guest');

    if (type === 'guest') {
      sessionStorage.setItem(GUEST_MODE_KEY, 'true');
    }

    console.log(`Created new ${type} session, expires in ${type === 'logged-in' ? '3 hours' : '1 hour'}`);

    return sessionId;
  }

  // Refresh existing session
  public refreshSession(type: 'logged-in' | 'guest'): string {
    const currentSessionId = localStorage.getItem(SESSION_ID_KEY);
    const sessionId = currentSessionId || this.generateSessionId();
    const expiryTime = Date.now() + (type === 'logged-in' ? LOGGED_IN_SESSION_DURATION : GUEST_SESSION_DURATION);

    // Store session data
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(SESSION_TYPE_KEY, type);
    localStorage.setItem(SESSION_EXPIRES_KEY, expiryTime.toString());

    // Set user type
    localStorage.setItem(USER_TYPE_KEY, type === 'logged-in' ? 'user' : 'guest');

    if (type === 'guest') {
      sessionStorage.setItem(GUEST_MODE_KEY, 'true');
    }

    console.log(`Refreshed ${type} session, expires in ${type === 'logged-in' ? '3 hours' : '1 hour'}`);

    return sessionId;
  }

  // Clear session data
  public clearSession() {
    const sessionType = localStorage.getItem(SESSION_TYPE_KEY);

    // If this was a guest session, clean up guest data
    if (sessionType === 'guest') {
      this.cleanupGuestData();
    }

    // Clear session storage
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SESSION_TYPE_KEY);
    localStorage.removeItem(SESSION_EXPIRES_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
    sessionStorage.removeItem(GUEST_MODE_KEY);
    sessionStorage.removeItem(GUEST_NAME_KEY);

    console.log('Session cleared');
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  // Clean up guest user data
  private cleanupGuestData() {
    // Clear all guest-related data from localStorage
    const keysToRemove: string[] = [];

    // Find all guest-related keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('guest') || key.includes('temp'))) {
        keysToRemove.push(key);
      }
    }

    // Remove the keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear all sessionStorage
    sessionStorage.clear();

    console.log('Guest data cleaned up');
  }

  // Get current session info
  public getSessionInfo() {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    const sessionType = localStorage.getItem(SESSION_TYPE_KEY);
    const sessionExpires = localStorage.getItem(SESSION_EXPIRES_KEY);

    if (!sessionId || !sessionType || !sessionExpires) {
      return null;
    }

    const expiryTime = parseInt(sessionExpires, 10);
    const currentTime = Date.now();
    const remainingTime = expiryTime - currentTime;

    return {
      sessionId,
      sessionType,
      expiryTime,
      remainingTime,
      isExpired: remainingTime <= 0,
      remainingMinutes: Math.round(remainingTime / 1000 / 60)
    };
  }

  // Check if user is authenticated (either logged in or guest)
  public isAuthenticated(): boolean {
    // First check Firebase auth directly
    if (this.auth.currentUser) {
      // If we have a Firebase user but no session, create one
      if (!this.getSessionInfo()) {
        this.refreshSession('logged-in');
        console.log('Created new session for Firebase user without session');
      }
      return true;
    }

    // Then check session storage
    const sessionInfo = this.getSessionInfo();
    const isValid = sessionInfo !== null && !sessionInfo.isExpired;

    // If we have a valid session but it's about to expire, refresh it
    if (isValid && sessionInfo && sessionInfo.remainingMinutes < 60) {
      this.refreshSession(sessionInfo.sessionType as 'logged-in' | 'guest');
      console.log(`Auto-refreshed session that was about to expire in ${sessionInfo.remainingMinutes} minutes`);
    }

    return isValid;
  }

  // Check if user is a guest
  public isGuestUser(): boolean {
    const sessionType = localStorage.getItem(SESSION_TYPE_KEY);
    return sessionType === 'guest';
  }

  // Get session ID
  public getSessionId(): string | null {
    return localStorage.getItem(SESSION_ID_KEY);
  }

  // Clean up on service destruction
  public destroy() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }
}

// Create and export a singleton instance
export const simpleSessionService = new SimpleSessionService();
export default simpleSessionService;

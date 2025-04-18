// Simple Session Service for SafeBite
// Handles session duration, persistence, and cleanup

import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../firebase';

// Session durations in milliseconds
const LOGGED_IN_SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours
const GUEST_SESSION_DURATION = 1 * 60 * 60 * 1000; // 1 hour

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
      } else if (isGuest) {
        // User is in guest mode
        this.refreshSession('guest');
      } else {
        // No user is signed in and not in guest mode
        this.clearSession();
      }
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

      if (currentTime >= expiryTime) {
        console.log('Session expired during check, clearing...');
        this.clearSession();
        
        // Redirect to login page if session expired
        window.location.href = '/auth/login?session_expired=true';
      }
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
    const sessionInfo = this.getSessionInfo();
    return sessionInfo !== null && !sessionInfo.isExpired;
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

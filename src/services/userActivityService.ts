import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { app } from "../firebase";

// Types for user activity tracking
export interface UserActivity {
  type: string;
  action: string;
  details?: any;
  timestamp: Date | Timestamp;
}

export interface UserActivityLog {
  activities: UserActivity[];
  lastUpdated: Date | Timestamp;
}

/**
 * Service to track user activities and save them to Firebase
 */
class UserActivityService {
  private auth = getAuth(app);
  private db = getFirestore(app);
  private localActivities: UserActivity[] = [];
  private isGuest: boolean = false;
  private syncInterval: number | null = null;
  private maxLocalActivities: number = 10; // Max number of activities to store locally before syncing

  constructor() {
    // Check if user is in guest mode
    this.isGuest = localStorage.getItem('userType') === 'guest' ||
                   sessionStorage.getItem('safebite-guest-mode') === 'true';

    // Set up sync interval for logged-in users
    this.setupSyncInterval();

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.isGuest = !user && (localStorage.getItem('userType') === 'guest' ||
                              sessionStorage.getItem('safebite-guest-mode') === 'true');
      this.setupSyncInterval();
    });
  }

  /**
   * Track a user activity
   * @param type Activity type (e.g., 'search', 'view', 'calculate')
   * @param action Specific action (e.g., 'food-search', 'bmi-calculate')
   * @param details Additional details about the activity
   */
  async trackActivity(type: string, action: string, details?: any): Promise<void> {
    const activity: UserActivity = {
      type,
      action,
      details,
      timestamp: new Date()
    };

    // Add to local activities
    this.localActivities.push(activity);

    // Save to cookies for ML learning
    this.saveActivityToCookies(activity);

    // If user is logged in and we've reached the threshold, sync with Firebase
    if (!this.isGuest && this.localActivities.length >= this.maxLocalActivities) {
      await this.syncActivitiesWithFirebase();
    }

    console.log(`Activity tracked: ${type} - ${action}`);
  }

  /**
   * Save activity to cookies for ML learning
   * @param activity Activity to save
   */
  private saveActivityToCookies(activity: UserActivity): void {
    try {
      // Get existing activities from cookies
      const cookieActivities = this.getActivitiesFromCookies();

      // Add new activity
      cookieActivities.push({
        type: activity.type,
        action: activity.action,
        timestamp: activity.timestamp.getTime()
      });

      // Keep only the last 50 activities
      const trimmedActivities = cookieActivities.slice(-50);

      // Save back to cookies
      document.cookie = `safebite_activities=${JSON.stringify(trimmedActivities)};path=/;max-age=2592000`; // 30 days
    } catch (error) {
      console.error('Error saving activity to cookies:', error);
    }
  }

  /**
   * Get activities from cookies
   * @returns Array of activities from cookies
   */
  private getActivitiesFromCookies(): any[] {
    try {
      const cookies = document.cookie.split(';');
      const activityCookie = cookies.find(cookie => cookie.trim().startsWith('safebite_activities='));

      if (activityCookie) {
        const cookieValue = activityCookie.split('=')[1];
        return JSON.parse(decodeURIComponent(cookieValue));
      }

      return [];
    } catch (error) {
      console.error('Error getting activities from cookies:', error);
      return [];
    }
  }

  /**
   * Sync local activities with Firebase
   */
  async syncActivitiesWithFirebase(): Promise<void> {
    try {
      const user = this.auth.currentUser;

      if (!user || this.isGuest || this.localActivities.length === 0) {
        return;
      }

      const userRef = doc(this.db, 'users', user.uid);
      const activityRef = doc(this.db, 'user_activities', user.uid);

      // Check if user activity document exists
      const activityDoc = await getDoc(activityRef);

      if (activityDoc.exists()) {
        // Update existing document
        await updateDoc(activityRef, {
          activities: arrayUnion(...this.localActivities),
          lastUpdated: Timestamp.now()
        });
      } else {
        // Create new document
        await setDoc(activityRef, {
          activities: this.localActivities,
          lastUpdated: Timestamp.now(),
          userId: user.uid
        });
      }

      // Update user document with last activity
      await updateDoc(userRef, {
        lastActivity: this.localActivities[this.localActivities.length - 1],
        lastActiveAt: Timestamp.now()
      }, { merge: true });

      // Clear local activities after successful sync
      this.localActivities = [];

      console.log('Activities synced with Firebase');
    } catch (error) {
      console.error('Error syncing activities with Firebase:', error);
    }
  }

  /**
   * Set up sync interval for logged-in users
   */
  private setupSyncInterval(): void {
    // Clear existing interval
    if (this.syncInterval) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    // Set up new interval if user is logged in
    if (!this.isGuest) {
      this.syncInterval = window.setInterval(() => {
        if (this.localActivities.length > 0) {
          this.syncActivitiesWithFirebase();
        }
      }, 60000); // Sync every minute if there are activities to sync
    }
  }

  /**
   * Get user's recent activities
   * @param limit Number of activities to return
   * @returns Promise with array of recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<UserActivity[]> {
    try {
      const user = this.auth.currentUser;

      if (!user || this.isGuest) {
        return this.localActivities.slice(-limit);
      }

      const activityRef = doc(this.db, 'user_activities', user.uid);
      const activityDoc = await getDoc(activityRef);

      if (activityDoc.exists()) {
        const data = activityDoc.data() as UserActivityLog;
        return data.activities.slice(-limit);
      }

      return [];
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  /**
   * Get all user activities for a specific user
   * @param userId User ID to get activities for
   * @returns Promise with array of all user activities
   */
  async getUserActivity(userId: string): Promise<UserActivity[]> {
    try {
      if (!userId) {
        return [];
      }

      const activityRef = doc(this.db, 'user_activities', userId);
      const activityDoc = await getDoc(activityRef);

      if (activityDoc.exists()) {
        const data = activityDoc.data() as UserActivityLog;
        return data.activities || [];
      }

      return [];
    } catch (error) {
      console.error('Error getting user activities:', error);
      return [];
    }
  }
}

// Create and export a singleton instance
const userActivityService = new UserActivityService();
export default userActivityService;

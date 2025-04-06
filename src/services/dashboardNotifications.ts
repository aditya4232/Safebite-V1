// src/services/dashboardNotifications.ts
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { app } from "../firebase";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  timestamp: Date;
  read: boolean;
  link?: string;
  icon?: string;
}

// Get user notifications from Firestore
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    if (!userId) {
      console.log('No user ID provided for notifications');
      return [];
    }

    const db = getFirestore(app);
    const notificationsRef = collection(db, "users", userId, "notifications");
    const q = query(
      notificationsRef,
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        title: data.title || 'Notification',
        message: data.message || '',
        type: data.type || 'info',
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read || false,
        link: data.link,
        icon: data.icon
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

// Get food safety alerts
export const getFoodSafetyAlerts = async (userId: string): Promise<Notification[]> => {
  try {
    if (!userId) {
      console.log('No user ID provided for food safety alerts');
      return [];
    }

    const db = getFirestore(app);
    const alertsRef = collection(db, "foodSafetyAlerts");
    const q = query(
      alertsRef,
      where("affectedUsers", "array-contains", userId),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const alerts: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        title: data.title || 'Food Safety Alert',
        message: data.message || '',
        type: 'alert',
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read || false,
        link: data.link,
        icon: data.icon
      });
    });

    return alerts;
  } catch (error) {
    console.error('Error getting food safety alerts:', error);
    return [];
  }
};

// Generate system notifications based on user data
export const generateSystemNotifications = (userData: any): Notification[] => {
  const notifications: Notification[] = [];

  // Check if user has completed their profile
  if (!userData?.profile?.dietary_preferences || !userData?.profile?.health_goals) {
    notifications.push({
      id: 'system-profile',
      title: 'Complete Your Profile',
      message: 'Please complete your health profile to get personalized recommendations.',
      type: 'info',
      timestamp: new Date(),
      read: false,
      link: '/settings'
    });
  }

  // Check if user has completed weekly check-in
  const now = new Date();
  const lastCheckin = userData?.weeklyCheckin?.timestamp?.toDate();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!lastCheckin || lastCheckin < oneWeekAgo) {
    notifications.push({
      id: 'system-weekly-checkin',
      title: 'Weekly Check-in',
      message: 'It\'s time for your weekly health check-in.',
      type: 'info',
      timestamp: new Date(),
      read: false,
      link: '/weekly-questions'
    });
  }

  return notifications;
};

// Get all notifications for a user
export const getAllNotifications = async (userId: string, userData: any): Promise<Notification[]> => {
  try {
    // Get user notifications from Firestore
    const userNotifications = await getUserNotifications(userId);

    // Get food safety alerts
    const foodSafetyAlerts = await getFoodSafetyAlerts(userId);

    // Generate system notifications
    const systemNotifications = generateSystemNotifications(userData);

    // Combine all notifications
    return [...userNotifications, ...foodSafetyAlerts, ...systemNotifications];
  } catch (error) {
    console.error('Error getting all notifications:', error);
    return [];
  }
};

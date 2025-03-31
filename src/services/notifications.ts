
import { toast } from "@/hooks/use-toast";

// Check if the browser supports notifications
const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Check if we have permission to send notifications
const checkNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return false;
  }
  return Notification.permission === 'granted';
};

// Request permission to send notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.log('Notifications not supported in this browser');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Schedule a notification
export const scheduleNotification = (title: string, options: NotificationOptions, delayMs: number) => {
  if (!checkNotificationPermission()) {
    console.log('No permission to send notifications');
    return;
  }
  
  setTimeout(() => {
    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }, delayMs);
};

// Set up daily health reminder notifications
export const setupDailyReminders = () => {
  const hasPermission = checkNotificationPermission();
  
  if (!hasPermission) {
    return false;
  }
  
  // Schedule reminder every 6 hours (in milliseconds)
  const NOTIFICATION_INTERVAL = 6 * 60 * 60 * 1000;
  
  const notifications = [
    {
      title: 'SafeBite Health Reminder',
      options: {
        body: 'Time to update your water intake for the day!',
        icon: '/favicon.ico'
      }
    },
    {
      title: 'SafeBite Health Reminder',
      options: {
        body: 'Have you tracked your meals today?',
        icon: '/favicon.ico'
      }
    },
    {
      title: 'SafeBite Health Reminder',
      options: {
        body: 'Time for a quick health check-in!',
        icon: '/favicon.ico'
      }
    },
    {
      title: 'SafeBite Health Reminder',
      options: {
        body: 'Don\'t forget to update your daily activity!',
        icon: '/favicon.ico'
      }
    }
  ];
  
  // Schedule all notifications
  for (let i = 0; i < notifications.length; i++) {
    const { title, options } = notifications[i];
    scheduleNotification(title, options, NOTIFICATION_INTERVAL * (i + 1));
  }
  
  return true;
};

// Check if the user is on a mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Show notification permission prompt for mobile users
export const promptMobileNotifications = async () => {
  if (isMobileDevice() && !checkNotificationPermission()) {
    const confirmed = window.confirm(
      'Would you like to receive health reminders and updates from SafeBite?'
    );
    
    if (confirmed) {
      const granted = await requestNotificationPermission();
      
      if (granted) {
        setupDailyReminders();
        toast({
          title: "Notifications enabled",
          description: "You'll receive health reminders every 6 hours",
        });
      } else {
        toast({
          title: "Notifications not enabled",
          description: "You can enable them later in your settings",
        });
      }
    }
  }
};

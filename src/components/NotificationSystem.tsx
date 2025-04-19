import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, AlertTriangle, CheckCircle, Calendar, Heart, ShoppingCart, Utensils } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy, limit, Timestamp } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  timestamp: Timestamp;
  read: boolean;
  category?: 'health' | 'food' | 'system' | 'reminder';
  link?: string;
  icon?: string;
}

interface NotificationSystemProps {
  currentPage?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ currentPage = 'dashboard' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();

  // Listen for notifications when component mounts
  useEffect(() => {
    if (!auth.currentUser && !isGuest) return;

    setIsLoading(true);

    const userId = isGuest ? 'guest-user' : auth.currentUser?.uid;
    if (!userId) return;

    // Create a query for user's notifications
    const notificationsRef = collection(db, 'notifications');
    const userNotificationsQuery = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    // Listen for real-time updates
    const unsubscribe = onSnapshot(userNotificationsQuery, (snapshot) => {
      const notificationData: Notification[] = [];
      let unread = 0;

      snapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() } as Notification;
        notificationData.push(notification);

        if (!notification.read) {
          unread++;
        }
      });

      setNotifications(notificationData);
      setUnreadCount(unread);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setIsLoading(false);
    });

    // If no notifications exist yet, add some default ones for new users
    const checkAndAddDefaultNotifications = async () => {
      const snapshot = await getDoc(doc(db, 'users', userId));
      const userData = snapshot.exists() ? snapshot.data() : null;

      if (userData && !userData.notificationsInitialized) {
        // Add welcome notification
        await setDoc(doc(notificationsRef), {
          userId,
          title: 'Welcome to SafeBite!',
          message: 'Thank you for joining SafeBite. Explore your dashboard to discover all features.',
          type: 'success',
          category: 'system',
          timestamp: Timestamp.now(),
          read: false,
          icon: 'sparkles'
        });

        // Add health reminder
        await setDoc(doc(notificationsRef), {
          userId,
          title: 'Complete Your Health Profile',
          message: 'Fill out your health profile to get personalized recommendations.',
          type: 'info',
          category: 'health',
          timestamp: Timestamp.now(),
          read: false,
          link: '/health-check',
          icon: 'heart'
        });

        // Mark notifications as initialized
        await setDoc(doc(db, 'users', userId), { notificationsInitialized: true }, { merge: true });
      }
    };

    if (!isGuest) {
      checkAndAddDefaultNotifications();
    }

    return () => unsubscribe();
  }, [auth.currentUser, db, isGuest]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await setDoc(doc(db, 'notifications', notificationId), {
        read: true
      }, { merge: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const batch = db.batch();

      notifications.forEach((notification) => {
        if (!notification.read) {
          const notificationRef = doc(db, 'notifications', notification.id);
          batch.update(notificationRef, { read: true });
        }
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get icon component based on notification type or specified icon
  const getIcon = (notification: Notification) => {
    if (notification.icon) {
      switch (notification.icon) {
        case 'heart':
          return <Heart className="h-5 w-5 text-red-500" />;
        case 'cart':
          return <ShoppingCart className="h-5 w-5 text-safebite-teal" />;
        case 'food':
          return <Utensils className="h-5 w-5 text-orange-500" />;
        case 'calendar':
          return <Calendar className="h-5 w-5 text-blue-500" />;
        case 'sparkles':
          return <span className="text-yellow-500">✨</span>;
        default:
          break;
      }
    }

    switch (notification.type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" style={{ zIndex: 1000 }}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-safebite-text" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to capture clicks outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0"
              style={{ zIndex: 990 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-safebite-dark-blue border border-safebite-card-bg-alt rounded-lg shadow-lg overflow-hidden"
              style={{ zIndex: 1000, position: 'fixed', top: '60px', right: '20px' }}
            >
            <div className="p-3 border-b border-safebite-card-bg-alt flex items-center justify-between">
              <h3 className="text-safebite-text font-medium flex items-center">
                <Bell className="h-4 w-4 mr-2 text-safebite-teal" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white">{unreadCount} new</Badge>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </Button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-safebite-text-secondary">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-safebite-text-secondary">
                  No notifications yet
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-safebite-card-bg-alt hover:bg-safebite-card-bg-alt/50 transition-colors ${
                        !notification.read ? 'bg-safebite-card-bg-alt/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex">
                        <div className="mr-3 mt-0.5">
                          {getIcon(notification)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-safebite-text mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-safebite-text-secondary mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-safebite-text-secondary opacity-70">
                              {notification.timestamp.toDate().toLocaleString()}
                            </span>
                            {notification.link && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-6 p-0 text-xs text-safebite-teal"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = notification.link!;
                                }}
                              >
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="ml-2 h-2 w-2 rounded-full bg-safebite-teal"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-safebite-card-bg-alt">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;

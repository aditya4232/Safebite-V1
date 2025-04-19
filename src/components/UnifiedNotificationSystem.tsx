import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Bell, X, Check, Info, AlertTriangle, Heart,
  ShoppingBag, Utensils, Activity, Calendar,
  Clock, Trash2, Settings, Filter, RefreshCw
} from 'lucide-react';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";

// Define notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'food' | 'health' | 'activity' | 'promo';
  timestamp: Date;
  read: boolean;
  icon?: string;
  link?: string;
  actionText?: string;
  expiresAt?: Date;
}

interface UnifiedNotificationSystemProps {
  onClose: () => void;
  isOpen: boolean;
}

const UnifiedNotificationSystem: React.FC<UnifiedNotificationSystemProps> = ({ onClose, isOpen }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  // Load notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const notificationsList: Notification[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notificationsList.push({
            id: doc.id,
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type,
            category: data.category,
            timestamp: data.timestamp.toDate(),
            read: data.read,
            icon: data.icon,
            link: data.link,
            actionText: data.actionText,
            expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined
          });
        });

        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user, db, toast]);

  // Mark notification as read
  const markAsRead = async (notification: Notification) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, { read: true });

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notification: Notification) => {
    if (!user) return;

    try {
      const notificationRef = doc(db, 'notifications', notification.id);
      await deleteDoc(notificationRef);

      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      if (!notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      toast({
        title: "Notification Deleted",
        description: "The notification has been removed.",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);

      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit();

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "All Notifications Read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const batch = writeBatch(db);

      notifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.delete(notificationRef);
      });

      await batch.commit();

      // Update local state
      setNotifications([]);
      setUnreadCount(0);

      toast({
        title: "All Notifications Deleted",
        description: "All notifications have been removed.",
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast({
        title: "Error",
        description: "Failed to delete notifications. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);

    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification);
    }
  };

  // Handle action button click
  const handleActionClick = (notification: Notification) => {
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.category === activeTab;
  });

  // Get icon component based on notification type and icon string
  const getIconComponent = (notification: Notification) => {
    const { type, icon } = notification;

    // Default icons based on notification type
    if (type === 'success') return <Check className="h-4 w-4 text-green-500" />;
    if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    if (type === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />;

    // Icons based on category or custom icon
    if (icon === 'food' || notification.category === 'food') return <Utensils className="h-4 w-4 text-orange-500" />;
    if (icon === 'health' || notification.category === 'health') return <Activity className="h-4 w-4 text-blue-500" />;
    if (icon === 'activity' || notification.category === 'activity') return <Calendar className="h-4 w-4 text-purple-500" />;
    if (icon === 'promo' || notification.category === 'promo') return <ShoppingBag className="h-4 w-4 text-pink-500" />;
    if (icon === 'heart') return <Heart className="h-4 w-4 text-red-500" />;
    if (icon === 'clock') return <Clock className="h-4 w-4 text-blue-400" />;

    // Default info icon
    return <Info className="h-4 w-4 text-safebite-teal" />;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Close notification detail view
  const closeDetailView = () => {
    setSelectedNotification(null);
  };

  // Animation variants for the notification panel
  const panelVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1500] flex justify-end"
          onClick={onClose}
        >
          <motion.div
            ref={notificationPanelRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className="w-full max-w-md bg-safebite-dark-blue border-l border-safebite-card-bg-alt h-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-safebite-card-bg-alt flex justify-between items-center">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-safebite-teal mr-2" />
                  <h2 className="text-lg font-semibold text-safebite-text">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge variant="outline" className="ml-2 bg-safebite-teal text-safebite-dark-blue">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-safebite-text-secondary hover:text-safebite-text">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {selectedNotification ? (
                  // Notification detail view
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-safebite-card-bg-alt flex items-center">
                      <Button variant="ghost" size="icon" onClick={closeDetailView} className="mr-2">
                        <X className="h-4 w-4" />
                      </Button>
                      <h3 className="font-medium text-safebite-text">Notification Details</h3>
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start mb-4">
                        <div className="p-2 rounded-full bg-safebite-card-bg-alt mr-3 flex-shrink-0">
                          {getIconComponent(selectedNotification)}
                        </div>
                        <div>
                          <h4 className="font-medium text-safebite-text">{selectedNotification.title}</h4>
                          <p className="text-xs text-safebite-text-secondary">
                            {formatDate(selectedNotification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <p className="text-safebite-text-secondary mb-6">
                        {selectedNotification.message}
                      </p>
                      <div className="flex justify-between">
                        {selectedNotification.link && (
                          <Button
                            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                            onClick={() => handleActionClick(selectedNotification)}
                          >
                            {selectedNotification.actionText || 'View Details'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => {
                            deleteNotification(selectedNotification);
                            closeDetailView();
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Notifications list view
                  <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <div className="px-4 pt-2">
                      <TabsList className="w-full bg-safebite-card-bg grid grid-cols-5">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
                        <TabsTrigger value="food" className="text-xs">Food</TabsTrigger>
                        <TabsTrigger value="health" className="text-xs">Health</TabsTrigger>
                        <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-safebite-teal"></div>
                        </div>
                      ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <Bell className="h-12 w-12 text-safebite-text-secondary mb-4 opacity-20" />
                          <p className="text-safebite-text-secondary">No notifications to display</p>
                          <p className="text-xs text-safebite-text-secondary mt-1">
                            {activeTab !== 'all' ? 'Try selecting a different category' : 'You\'re all caught up!'}
                          </p>
                        </div>
                      ) : (
                        <TabsContent value={activeTab} className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col">
                          <ScrollArea className="flex-1">
                            <div className="p-4 space-y-2">
                              {filteredNotifications.map((notification) => (
                                <div
                                  key={notification.id}
                                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                    notification.read
                                      ? 'bg-safebite-card-bg hover:bg-safebite-card-bg-alt'
                                      : 'bg-safebite-teal/5 hover:bg-safebite-teal/10 border-l-2 border-safebite-teal'
                                  }`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="flex items-start">
                                    <div className={`p-2 rounded-full bg-safebite-card-bg-alt mr-3 flex-shrink-0 ${
                                      !notification.read ? 'bg-safebite-teal/20' : ''
                                    }`}>
                                      {getIconComponent(notification)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start">
                                        <h4 className={`font-medium truncate ${
                                          notification.read ? 'text-safebite-text' : 'text-safebite-teal'
                                        }`}>
                                          {notification.title}
                                        </h4>
                                        <span className="text-xs text-safebite-text-secondary ml-2 flex-shrink-0">
                                          {formatDate(notification.timestamp)}
                                        </span>
                                      </div>
                                      <p className="text-safebite-text-secondary text-sm line-clamp-2">
                                        {notification.message}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>

                          {filteredNotifications.length > 0 && (
                            <div className="p-3 border-t border-safebite-card-bg-alt">
                              <div className="flex justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={markAllAsRead}
                                  disabled={!filteredNotifications.some(n => !n.read)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark all read
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs text-red-400 hover:text-red-500"
                                  onClick={deleteAllNotifications}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Clear all
                                </Button>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      )}
                    </div>
                  </Tabs>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-safebite-card-bg-alt">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-safebite-text-secondary hover:text-safebite-text"
                  onClick={() => navigate('/settings/notifications')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Notification Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnifiedNotificationSystem;

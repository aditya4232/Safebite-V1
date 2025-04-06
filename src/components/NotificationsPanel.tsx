import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Info, AlertTriangle, CheckCircle, X, ArrowRight } from 'lucide-react';
import { Notification, getAllNotifications } from '@/services/dashboardNotifications';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
}

const NotificationsPanel = ({ isOpen, onClose, userData }: NotificationsPanelProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && isOpen) {
        setIsLoading(true);
        try {
          const allNotifications = await getAllNotifications(user.uid, userData);
          setNotifications(allNotifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [user, isOpen, userData]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark notification as read
    if (user && !notification.read) {
      try {
        const notificationRef = doc(db, "users", user.uid, "notifications", notification.id);
        await updateDoc(notificationRef, {
          read: true
        });

        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to link if provided
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Bell className="h-5 w-5 text-safebite-text-secondary" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-md bg-safebite-dark-blue h-full overflow-auto">
        <div className="p-4 border-b border-safebite-card-bg-alt flex justify-between items-center">
          <h2 className="text-xl font-semibold text-safebite-text">Notifications</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-safebite-teal border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-safebite-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-safebite-text-secondary">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`sci-fi-card cursor-pointer transition-all hover:border-safebite-teal ${notification.read ? 'opacity-70' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-safebite-text">{notification.title}</h3>
                          <span className="text-xs text-safebite-text-secondary">
                            {notification.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-safebite-text-secondary mt-1">{notification.message}</p>
                        {notification.link && (
                          <div className="mt-2 flex justify-end">
                            <Button variant="link" className="p-0 h-auto text-xs text-safebite-teal">
                              View <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;

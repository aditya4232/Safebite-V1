import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2, ArrowRight, Utensils, ShoppingBag,
  Clock, AlertTriangle, X, Bell, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';

interface FoodDeliveryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  userData?: any;
}

const FoodDeliveryPopup: React.FC<FoodDeliveryPopupProps> = ({
  isOpen,
  onClose,
  currentPage = '',
  userData = null
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();
  const [isNotifyMeEnabled, setIsNotifyMeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Get content based on current page
  const getPageSpecificContent = () => {
    switch(currentPage) {
      case 'dashboard':
        return {
          title: "Food Delivery Integration",
          subtitle: userData ? `Personalized for ${userData.displayName || 'you'}` : 'Coming Soon',
          description: "Get nutritional insights for your food delivery orders and make healthier choices based on your health profile."
        };
      case 'nutrition':
        return {
          title: "Nutrition-Aware Food Delivery",
          subtitle: 'Coming Soon',
          description: "Track nutrition from your food delivery orders and stay on top of your health goals."
        };
      case 'recipes':
        return {
          title: "Order Instead of Cooking",
          subtitle: 'Coming Soon',
          description: "Don't have time to cook? Order similar healthy options from your favorite restaurants."
        };
      default:
        return {
          title: "Food Delivery Integration",
          subtitle: 'Coming Soon',
          description: "Get nutritional insights for your food delivery orders and make healthier choices."
        };
    }
  };

  const content = getPageSpecificContent();

  const handleNotifyMe = async () => {
    if (isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to get notified when this feature is available.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);

        // Get current user data
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Update notifications preferences
        await setDoc(userRef, {
          notifications: {
            ...userData.notifications,
            foodDeliveryUpdates: true
          }
        }, { merge: true });

        setIsNotifyMeEnabled(true);
        toast({
          title: "Notification enabled",
          description: "You'll be notified when food delivery integration is available.",
        });
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto bg-safebite-dark-blue border-safebite-card-bg-alt">
        <CardHeader className="relative border-b border-safebite-card-bg-alt">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-safebite-text flex items-center">
            <ShoppingBag className="mr-2 h-6 w-6 text-orange-500" />
            {content.title}
            <Badge className="ml-3 bg-orange-500 text-white">{content.subtitle}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Zomato Card */}
            <div className="p-4 border border-orange-500/30 rounded-lg bg-safebite-card-bg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full"></div>

              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-500">Zomato</h3>
                </div>
              </div>

              <p className="text-safebite-text-secondary text-sm mb-3">
                {content.description}
              </p>

              <div className="flex items-center text-xs text-safebite-text-secondary">
                <Loader2 className="h-3 w-3 text-orange-500 animate-spin mr-1" />
                <span>Dataset preparation: 65% complete</span>
              </div>
            </div>

            {/* Swiggy Card */}
            <div className="p-4 border border-orange-400/30 rounded-lg bg-safebite-card-bg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/10 rounded-bl-full"></div>

              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mr-3">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-400">Swiggy</h3>
                </div>
              </div>

              <p className="text-safebite-text-secondary text-sm mb-3">
                {content.description}
              </p>

              <div className="flex items-center text-xs text-safebite-text-secondary">
                <Loader2 className="h-3 w-3 text-orange-400 animate-spin mr-1" />
                <span>Dataset preparation: 42% complete</span>
              </div>
            </div>
          </div>

          <div className="bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-safebite-text mb-3 flex items-center">
              <Info className="mr-2 h-5 w-5 text-safebite-teal" />
              What to expect
            </h3>
            <ul className="space-y-2 text-safebite-text-secondary text-sm">
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Nutritional information for restaurant meals</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Personalized recommendations based on your health profile</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Track your nutrition even when eating out</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Make informed choices that align with your health goals</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Close
            </Button>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                className="flex-1 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                onClick={() => navigate('/food-delivery')}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleNotifyMe}
                disabled={isNotifyMeEnabled || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Bell className="mr-2 h-4 w-4" />
                )}
                {isNotifyMeEnabled ? "Notifications On" : "Notify Me"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodDeliveryPopup;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft, Utensils, ShoppingBag, Clock, AlertTriangle, Truck, Lock, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FoodChatBot from '@/components/FoodChatBot';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';
import { useToast } from "@/hooks/use-toast";

const FoodDelivery: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();
  const { toast } = useToast();

  // User data for personalized chat suggestions
  const [userData, setUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);

  // Check if user is a guest, redirect if so
  useEffect(() => {
    if (isGuest) {
      toast({
        title: "Feature Restricted",
        description: "Food Delivery is only available for registered users. Please sign up to access this feature.",
        variant: "destructive"
      });
      navigate('/dashboard');
    }
  }, [isGuest, navigate, toast]);

  // Load user data for personalized chat
  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        try {
          // Get user profile data
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          // Get user activity data
          const activityRef = doc(db, 'user_activities', auth.currentUser.uid);
          const activityDoc = await getDoc(activityRef);

          if (activityDoc.exists()) {
            const data = activityDoc.data();
            setUserActivity(data.activities || []);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [auth.currentUser, db]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 text-white py-2 px-4 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-yellow-300 mr-2" />
        <span className="font-medium">Coming Soon: Food Delivery Integration</span>
        <Sparkles className="h-4 w-4 text-yellow-300 ml-2" />
      </div>
      <Navbar hideAuthButtons={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-safebite-text mb-2">Food Delivery Integration</h1>
          <p className="text-safebite-text-secondary mb-6">
            Get nutritional insights for your favorite restaurant meals from Zomato and Swiggy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Zomato Card */}
          <Card className="p-6 border border-orange-500/30 bg-safebite-card-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full"></div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-4">
                <Utensils className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-orange-500">Zomato Integration</h2>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <p className="text-safebite-text-secondary mb-4">
              We're working on integrating with Zomato to provide nutritional information and health recommendations for your favorite restaurant meals.
            </p>

            <div className="bg-safebite-card-bg-alt p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-safebite-text-secondary mr-2" />
                <span className="text-sm text-safebite-text-secondary">Status Update</span>
              </div>
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-orange-500 animate-spin mr-2" />
                <span className="text-sm text-safebite-text">Dataset preparation in progress (65%)</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button disabled className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 cursor-not-allowed">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Not Available Yet
              </Button>
            </div>
          </Card>

          {/* Swiggy Card */}
          <Card className="p-6 border border-orange-500/30 bg-safebite-card-bg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-bl-full"></div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mr-4">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-orange-400">Swiggy Integration</h2>
                <Badge variant="outline" className="bg-orange-400/10 text-orange-400 border-orange-400/30">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <p className="text-safebite-text-secondary mb-4">
              We're working on integrating with Swiggy to provide nutritional information and health recommendations for your favorite restaurant meals.
            </p>

            <div className="bg-safebite-card-bg-alt p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-safebite-text-secondary mr-2" />
                <span className="text-sm text-safebite-text-secondary">Status Update</span>
              </div>
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-orange-400 animate-spin mr-2" />
                <span className="text-sm text-safebite-text">Dataset preparation in progress (42%)</span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button disabled className="bg-orange-400/20 text-orange-400 hover:bg-orange-400/30 cursor-not-allowed">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Not Available Yet
              </Button>
            </div>
          </Card>
        </div>

        <div className="bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-safebite-text mb-4">Why We're Building This</h2>
          <p className="text-safebite-text-secondary mb-4">
            Eating out shouldn't mean compromising on your health goals. Our integration with popular food delivery platforms will help you:
          </p>
          <ul className="space-y-2 text-safebite-text-secondary">
            <li className="flex items-start">
              <span className="text-safebite-teal mr-2">•</span>
              <span>Get nutritional information for restaurant meals</span>
            </li>
            <li className="flex items-start">
              <span className="text-safebite-teal mr-2">•</span>
              <span>Receive personalized recommendations based on your health profile</span>
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

        <div className="text-center">
          <p className="text-safebite-text-secondary mb-4">
            We're working hard to bring this feature to you. Check back soon for updates!
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Return to Dashboard
          </Button>
        </div>
      </main>

      {/* AI Chatbot */}
      <FoodChatBot
        currentPage="food-delivery"
        userData={{
          profile: userData,
          recentActivity: userActivity
        }}
        autoOpen={true}
        initialMessage="Welcome to our Food Delivery section! While we're still working on integrating with Zomato and Swiggy, I can help you understand how to make healthier choices when ordering food. Would you like some tips for healthier restaurant ordering?"
      />

      <Footer />
    </div>
  );
};

export default FoodDelivery;

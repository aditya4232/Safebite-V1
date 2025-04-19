
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import Settings from "@/pages/Settings";
import HealthCheck from "@/pages/HealthCheck";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import Questionnaire from "@/pages/Questionnaire";
import Dashboard from "@/pages/Dashboard";
// Removed FoodSearch import as it's redirected
import Community from "@/pages/Community";
import Reports from "@/pages/Reports";
import Recipes from "@/pages/Recipes";
import HealthBox from "@/pages/HealthBox";
import ProductRecommendationsPage from "@/pages/ProductRecommendations";
import GroceryProducts from "@/pages/GroceryProducts";
import Nutrition from "@/pages/Nutrition";
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/Admin/Login";
import AdminPanel from "@/pages/Admin/Panel";
import AboutUs from "@/pages/AboutUs";
import Features from "@/pages/Features";
import FoodDelivery from "@/pages/FoodDelivery";
import Help from "@/pages/Help";
import Changelog from "@/pages/Changelog";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import DevPopup from "@/components/DevPopup";
import FoodChatBot from "@/components/FoodChatBot";
// import { useGuestMode } from "@/hooks/useGuestMode";
import { useEffect, useState, lazy, Suspense } from "react";
import { isAuthPage, isProtectedPage, redirectToLogin, fixAuthState } from "@/utils/authUtils";
import guestAuthService from "@/services/guestAuthService";
import UserActivityService from "@/services/userActivityService";
import simpleSessionService from "@/services/simpleSessionService";
import windowCloseService from "@/services/windowCloseService";
import SimpleAuthGuard from "@/components/SimpleAuthGuard";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import WeeklyQuestionsForm from "@/components/WeeklyQuestionsForm";
import SimpleDashboard from "@/components/SimpleDashboard";

const queryClient = new QueryClient();

// We're now using the AuthGuard component instead of ProtectedRoute

const App = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [userProfile, setUserProfile] = useState<any>(null); // Use a more specific type if available

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.log("No user profile found in App component!");
          }
        } catch (error) {
          console.error("Error fetching user profile in App:", error);
        }
      } else {
        setUserProfile(null); // Clear profile if user logs out
      }
    };

    fetchUserProfile();

    // Listen for auth state changes to update profile
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProfile();
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);


  // Global authentication check with improved handling
  useEffect(() => {
    // Fix any authentication state issues
    fixAuthState();

    // Initialize window close service to handle logout on window/browser close
    windowCloseService.initialize();

    // Set up an interval to periodically check and fix auth state
    const authCheckInterval = setInterval(() => {
      // Only run checks if we're on a protected page
      if (isProtectedPage() && !isAuthPage()) {
        fixAuthState();
      }
    }, 60000); // Check every minute

    // Log the current auth state for debugging
    const user = auth.currentUser;
    const isGuestMode = guestAuthService.isGuestUser();
    const isSessionValid = simpleSessionService.isAuthenticated();

    console.log('App - Initial auth state:', {
      path: window.location.pathname,
      isProtectedPage: isProtectedPage(),
      isAuthPage: isAuthPage(),
      hasUser: !!user,
      isGuestMode,
      isSessionValid
    });

    // Clean up window close service and interval when component unmounts
    return () => {
      windowCloseService.cleanup();
      clearInterval(authCheckInterval);
    };
  }, [auth]);

  const [open, setOpen] = React.useState(false);
  const [hasCompletedWeeklyCheckin, setHasCompletedWeeklyCheckin] = useState(false);

  useEffect(() => {
    const checkWeeklyCheckin = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.weeklyCheckin && userData.weeklyCheckin.lastSubmitted) {
              const lastCheckinTime = userData.weeklyCheckin.lastSubmitted.toDate();
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - lastCheckinTime.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isSameWeek = diffDays < 7;

              setHasCompletedWeeklyCheckin(isSameWeek);
              setOpen(!isSameWeek); // Open the modal if not completed this week
            } else {
              setOpen(true); // Open the modal if never completed
            }
          } else {
            setOpen(true); // Open the modal if user data doesn't exist
          }
        } catch (error) {
          console.error("Error checking weekly check-in status:", error);
        }
      }
    };

    checkWeeklyCheckin();
  }, [auth, db]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DevPopup />
          <BrowserRouter basename="/SafeBite-V1/">
            <Routes>
              {/* Public Routes - Only auth and info pages */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/help" element={<Help />} />
              <Route path="/changelog" element={<Changelog />} />

              {/* Public pages that don't require login */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<Features />} />

              {/* Pages that require authentication */}
              <Route path="/questionnaire" element={<SimpleAuthGuard allowGuest={true}><Questionnaire /></SimpleAuthGuard>} />
              <Route path="/health-check" element={<SimpleAuthGuard><HealthCheck /></SimpleAuthGuard>} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <SimpleAuthGuard>
                  <ErrorBoundary fallback={<SimpleDashboard />}>
                    <Dashboard />
                  </ErrorBoundary>
                </SimpleAuthGuard>
              } />
              <Route path="/nutrition" element={<SimpleAuthGuard><Nutrition userProfile={userProfile} /></SimpleAuthGuard>} />
              {/* Redirect old food search to nutrition page */}
              <Route path="/food-search" element={<Navigate to="/nutrition" replace />} />
              <Route path="/food-delivery" element={<SimpleAuthGuard><FoodDelivery /></SimpleAuthGuard>} />
              <Route path="/product-recommendations" element={<SimpleAuthGuard><ProductRecommendationsPage /></SimpleAuthGuard>} />
              {/* Redirect from old products page to grocery products */}
              <Route path="/products" element={<Navigate to="/grocery-products" replace />} />
              <Route path="/grocery-products" element={<SimpleAuthGuard><GroceryProducts /></SimpleAuthGuard>} />
              <Route path="/community" element={<SimpleAuthGuard><Community /></SimpleAuthGuard>} />
              <Route path="/healthbox" element={<SimpleAuthGuard><HealthBox /></SimpleAuthGuard>} />
              <Route path="/reports" element={<SimpleAuthGuard><Reports /></SimpleAuthGuard>} />
              <Route path="/recipes" element={<SimpleAuthGuard><Recipes /></SimpleAuthGuard>} />
              <Route path="/settings" element={<SimpleAuthGuard><Settings /></SimpleAuthGuard>} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/panel" element={<AdminPanel />} />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        {/* Global ChatBot available on all pages */}
        <FoodChatBot
          initialMessage="Hi! I'm your SafeBite AI assistant. Ask me anything about food, nutrition, or health!"
          currentPage="global"
          userData={{
            profile: userProfile,
            recentActivity: []
          }}
          autoOpen={false}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Weekly Health Check-in</DialogTitle>
              <DialogDescription>
                Help us personalize your SafeBite experience by answering a few questions.
              </DialogDescription>
            </DialogHeader>
            <WeeklyQuestionsForm onComplete={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

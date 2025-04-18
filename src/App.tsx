
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
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import DevPopup from "@/components/DevPopup";
import FoodChatBot from "@/components/FoodChatBot";
// import { useGuestMode } from "@/hooks/useGuestMode";
import { useEffect, useState } from "react";
import { isAuthPage, redirectToLogin } from "@/utils/authUtils";
import guestAuthService from "@/services/guestAuthService";
import UserActivityService from "@/services/userActivityService";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import WeeklyQuestionsForm from "@/components/WeeklyQuestionsForm";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const auth = getAuth(app);
  const [authState, setAuthState] = useState<'authenticated' | 'unauthenticated' | 'loading'>('loading');

  useEffect(() => {
    // Check if user is logged in or in guest mode with valid session
    const checkAuth = () => {
      const user = auth.currentUser;
      const isGuestMode = guestAuthService.isGuestUser(); // This checks for valid session

      // Add detailed logging for authentication state
      console.log('ProtectedRoute - Auth check:', {
        user: user ? 'Logged in' : 'Not logged in',
        isGuestMode,
        userType: localStorage.getItem('userType'),
        guestMode: sessionStorage.getItem('safebite-guest-mode'),
        guestSessionExpires: localStorage.getItem('guestSessionExpires'),
        path: window.location.pathname
      });

      if (user || isGuestMode) {
        setAuthState('authenticated');

        // If in guest mode, extend the session to keep it active while using the app
        if (isGuestMode && !user) {
          guestAuthService.extendGuestSession();
          console.log('Guest session extended in ProtectedRoute');
        }
      } else {
        setAuthState('unauthenticated');

        // If not on an auth page, redirect to login
        if (!isAuthPage()) {
          console.log('Not authenticated and not on auth page, redirecting to login');
          redirectToLogin();
        }
      }
    };

    // Check immediately
    checkAuth();

    // Also listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkAuth();
    });

    return () => unsubscribe();
  }, [auth]);

  // Show loading state while checking authentication
  if (authState === 'loading') {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safebite-teal"></div>
    </div>;
  }

  // If authenticated, render children, otherwise redirect to login
  if (authState === 'authenticated') {
    return <>{children}</>;
  }

  // Redirect to login page
  return <Navigate to="/auth/login" replace />;
};

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


  // Global authentication check
  useEffect(() => {
    // Check if we're on a protected route
    const path = window.location.pathname;
    const protectedRoutes = [
      '/dashboard',
      '/nutrition',
      '/food-search',
      '/food-delivery',
      '/product-recommendations',
      '/products',
      '/community',
      '/healthbox',
      '/reports',
      '/recipes',
      '/settings',
      '/tools',
      '/features'
    ];

    const isProtectedRoute = protectedRoutes.some(route =>
      path.toLowerCase().includes(route.toLowerCase())
    );

    // Check if we're on an auth page
    const isOnAuthPage = path.includes('/auth/login') ||
                        path.includes('/auth/signup') ||
                        path.includes('/auth/forgot-password') ||
                        path === '/' ||
                        path === '/SafeBite-V1/' ||
                        path.includes('/about') ||
                        path.includes('/features');

    // Only check auth on protected pages, not on auth pages
    if (isProtectedRoute && !isOnAuthPage) {
      const user = auth.currentUser;
      const isGuestMode = guestAuthService.isGuestUser(); // This checks for valid session

      if (!user && !isGuestMode) {
        // Get the base URL for the application
        const baseUrl = window.location.pathname.includes('/SafeBite-V1')
          ? '/SafeBite-V1'
          : '';

        // Redirect to login page
        window.location.href = `${baseUrl}/auth/login`;
      }
    }
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
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/features" element={<Features />} />
              <Route path="/help" element={<Help />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/health-check" element={<ProtectedRoute><HealthCheck /></ProtectedRoute>} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/nutrition" element={<ProtectedRoute><Nutrition userProfile={userProfile} /></ProtectedRoute>} />
              {/* Redirect old food search to nutrition page */}
              <Route path="/food-search" element={<Navigate to="/nutrition" replace />} />
              <Route path="/food-delivery" element={<ProtectedRoute><FoodDelivery /></ProtectedRoute>} />
              <Route path="/product-recommendations" element={<ProtectedRoute><ProductRecommendationsPage /></ProtectedRoute>} />
              {/* Redirect from old products page to grocery products */}
              <Route path="/products" element={<Navigate to="/grocery-products" replace />} />
              <Route path="/grocery-products" element={<ProtectedRoute><GroceryProducts /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
              <Route path="/healthbox" element={<ProtectedRoute><HealthBox /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

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

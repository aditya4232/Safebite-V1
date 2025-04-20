
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState, lazy, Suspense } from "react";
import { isAuthPage, isProtectedPage, redirectToLogin, fixAuthState } from "@/utils/authUtils";
import guestAuthService from "@/services/guestAuthService";
import simpleSessionService from "@/services/simpleSessionService";
import windowCloseService from "@/services/windowCloseService";
import { startPerformanceMonitoring, mark, measure } from "@/services/performanceService";
import useResponsive from "@/hooks/useResponsive";
import SimpleAuthGuard from "@/components/SimpleAuthGuard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Core components that are needed immediately
import DevPopup from "@/components/DevPopup";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import CookieConsent from "@/components/CookieConsent";
import WeeklyQuestionsForm from "@/components/WeeklyQuestionsForm";
import SimpleDashboard from "@/components/SimpleDashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy-loaded components for better performance
const FoodChatBot = lazy(() => import("@/components/FoodChatBot"));

// Lazy-loaded pages
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Signup = lazy(() => import("@/pages/Auth/Signup"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const AboutUs = lazy(() => import("@/pages/AboutUs"));
const Help = lazy(() => import("@/pages/Help"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const Features = lazy(() => import("@/pages/Features"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Lazy-loaded authenticated pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Nutrition = lazy(() => import("@/pages/Nutrition"));
const FoodDelivery = lazy(() => import("@/pages/FoodDelivery"));
const ProductRecommendationsPage = lazy(() => import("@/pages/ProductRecommendations"));
const GroceryProducts = lazy(() => import("@/pages/GroceryProducts"));
const Community = lazy(() => import("@/pages/Community"));
const HealthBox = lazy(() => import("@/pages/HealthBox"));
const Reports = lazy(() => import("@/pages/Reports"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const Settings = lazy(() => import("@/pages/Settings"));
const HealthCheck = lazy(() => import("@/pages/HealthCheck"));
const Questionnaire = lazy(() => import("@/pages/Questionnaire"));

// Admin pages
const AdminLogin = lazy(() => import("@/pages/Admin/Login"));
const AdminPanel = lazy(() => import("@/pages/Admin/Panel"));

const queryClient = new QueryClient();

// We're now using the AuthGuard component instead of ProtectedRoute

const App = () => {
  // Start performance monitoring
  useEffect(() => {
    startPerformanceMonitoring();
    mark('app-init-start');

    return () => {
      measure('total-app-lifetime', 'app-init-start', 'app-unmount');
    };
  }, []);

  // Get responsive information
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
    mark('auth-listener-setup-start');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      mark('auth-state-changed');
      if (user) {
        fetchUserProfile();
      } else {
        setUserProfile(null);
      }
      measure('auth-state-change-time', 'auth-state-changed', 'auth-state-processed');
      mark('auth-state-processed');
    });
    measure('auth-listener-setup-time', 'auth-listener-setup-start', 'auth-listener-setup-end');
    mark('auth-listener-setup-end');

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
      <ThemeProvider defaultTheme="dark" storageKey="safebite-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <DevPopup />
            <ScrollToTopButton />
            <CookieConsent />
            <BrowserRouter basename="/SafeBite-V1/">
            <Routes>
              {/* Public Routes - Only auth and info pages */}
              <Route path="/auth/login" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/auth/signup" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <Signup />
                </Suspense>
              } />
              <Route path="/auth/forgot-password" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <ForgotPassword />
                </Suspense>
              } />
              <Route path="/about" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <AboutUs />
                </Suspense>
              } />
              <Route path="/help" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <Help />
                </Suspense>
              } />
              <Route path="/changelog" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <Changelog />
                </Suspense>
              } />

              {/* Public pages that don't require login */}
              <Route path="/" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <LandingPage />
                </Suspense>
              } />
              <Route path="/features" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                  <Features />
                </Suspense>
              } />

              {/* Pages that require authentication */}
              <Route path="/questionnaire" element={
                <SimpleAuthGuard allowGuest={true}>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                    <Questionnaire />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/health-check" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading..." />}>
                    <HealthCheck />
                  </Suspense>
                </SimpleAuthGuard>
              } />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <SimpleAuthGuard>
                  <ErrorBoundary fallback={<SimpleDashboard />}>
                    <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  </ErrorBoundary>
                </SimpleAuthGuard>
              } />
              <Route path="/nutrition" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading nutrition data..." />}>
                    <Nutrition userProfile={userProfile} />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              {/* Redirect old food search to nutrition page */}
              <Route path="/food-search" element={<Navigate to="/nutrition" replace />} />
              <Route path="/food-delivery" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading food delivery..." />}>
                    <FoodDelivery />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/product-recommendations" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading recommendations..." />}>
                    <ProductRecommendationsPage />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              {/* Redirect from old products page to grocery products */}
              <Route path="/products" element={<Navigate to="/grocery-products" replace />} />
              <Route path="/grocery-products" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading grocery products..." />}>
                    <GroceryProducts />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/community" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading community..." />}>
                    <Community />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/healthbox" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading health box..." />}>
                    <HealthBox />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/reports" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading reports..." />}>
                    <Reports />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/recipes" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading recipes..." />}>
                    <Recipes />
                  </Suspense>
                </SimpleAuthGuard>
              } />
              <Route path="/settings" element={
                <SimpleAuthGuard>
                  <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading settings..." />}>
                    <Settings />
                  </Suspense>
                </SimpleAuthGuard>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading admin login..." />}>
                  <AdminLogin />
                </Suspense>
              } />
              <Route path="/admin/panel" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Loading admin panel..." />}>
                  <AdminPanel />
                </Suspense>
              } />

              {/* Catch-all route for 404 */}
              <Route path="*" element={
                <Suspense fallback={<LoadingSpinner size="lg" fullScreen text="Page not found..." />}>
                  <NotFound />
                </Suspense>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        {/* Global ChatBot available on all pages */}
        <Suspense fallback={null}>
          <FoodChatBot
            initialMessage="Hi! I'm your SafeBite AI assistant. Ask me anything about food, nutrition, or health!"
            currentPage="global"
            userData={{
              profile: userProfile,
              recentActivity: []
            }}
            autoOpen={false}
          />
        </Suspense>
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
    </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

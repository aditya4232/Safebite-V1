
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import Settings from "@/pages/Settings";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import Questionnaire from "@/pages/Questionnaire";
import Dashboard from "@/pages/Dashboard";
import FoodSearch from "@/pages/FoodSearch";
import Community from "@/pages/Community";
import WeeklyQuestions from "@/pages/WeeklyQuestions";
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
import { useGuestMode } from "@/hooks/useGuestMode";
import { useEffect, useState } from "react";
import { isAuthenticated, isAuthPage, redirectToLogin } from "@/utils/authUtils";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth(app);
  const [authState, setAuthState] = useState<'authenticated' | 'unauthenticated' | 'loading'>('loading');
  const { isGuest } = useGuestMode();

  useEffect(() => {
    // Check if user is logged in or in guest mode
    const checkAuth = () => {
      const user = auth.currentUser;
      const isGuestMode = localStorage.getItem('userType') === 'guest' ||
                         sessionStorage.getItem('safebite-guest-mode') === 'true';

      if (user || isGuestMode) {
        setAuthState('authenticated');
      } else {
        setAuthState('unauthenticated');

        // If not on an auth page, redirect to login
        if (!isAuthPage()) {
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
      const isGuestMode = localStorage.getItem('userType') === 'guest' ||
                         sessionStorage.getItem('safebite-guest-mode') === 'true';

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
            <Route path="/weekly-questions" element={<WeeklyQuestions />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
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
      <FoodChatBot initialMessage="Hi! I'm your SafeBite AI assistant. Ask me anything about food, nutrition, or health!" />
    </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;


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
import NotFound from "@/pages/NotFound";
import AdminLogin from "@/pages/Admin/Login";
import AdminPanel from "@/pages/Admin/Panel";
import AboutUs from "@/pages/AboutUs";
import Features from "@/pages/Features";
import FoodDelivery from "@/pages/FoodDelivery";
import { getAuth } from "firebase/auth";
import { app } from "./firebase";
import DevPopup from "@/components/DevPopup";
import FoodChatBot from "@/components/FoodChatBot";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  return user ? (
    <>{children}</>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};

const App = () => (
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
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          <Route path="/weekly-questions" element={<WeeklyQuestions />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/food-search" element={<ProtectedRoute><FoodSearch /></ProtectedRoute>} />
          <Route path="/food-delivery" element={<ProtectedRoute><FoodDelivery /></ProtectedRoute>} />
          <Route path="/product-recommendations" element={<ProtectedRoute><ProductRecommendationsPage /></ProtectedRoute>} />
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

export default App;

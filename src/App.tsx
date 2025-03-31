
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import Questionnaire from "@/pages/Questionnaire";
import Dashboard from "@/pages/Dashboard";
import FoodSearch from "@/pages/FoodSearch";
import Community from "@/pages/Community";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/questionnaire" element={<Questionnaire />} />
          
          {/* Protected Routes (would normally have auth protection) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/food-search" element={<FoodSearch />} />
          <Route path="/community" element={<Community />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, User, AlertTriangle, Moon, Sun } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated, redirectToLogin } from '@/utils/authUtils';
import simpleSessionService from '@/services/simpleSessionService';

interface NavbarProps {
  hideAuthButtons?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ hideAuthButtons }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  // Check if we're on the food-delivery page
  const isFoodDeliveryPage = location.pathname.includes('/food-delivery');

  // Check authentication status
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle navigation to protected routes
  const handleProtectedNavigation = (path: string, needsAuth: boolean = true) => {
    // If the route doesn't need auth or user is authenticated, navigate directly
    if (!needsAuth || isAuthenticated()) {
      navigate(path);
      setIsMenuOpen(false);
      return;
    }

    // Otherwise, show a toast and redirect to login
    toast({
      title: "Authentication Required",
      description: "Please log in or continue as guest to access this page.",
      variant: "destructive",
    });

    // Redirect to login with return URL
    const returnUrl = encodeURIComponent(path);
    navigate(`/auth/login?returnUrl=${returnUrl}`);
    setIsMenuOpen(false);
  };

  // Determine whether to show auth buttons
  // Hide if explicitly told to hide OR if we're on food-delivery page AND user is logged in
  const shouldHideAuthButtons = hideAuthButtons || (isFoodDeliveryPage && isLoggedIn);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-safebite-dark-blue/90 backdrop-blur-md border-b border-safebite-card-bg-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold gradient-text">SafeBite</span>
              <span className="ml-2 text-xs bg-safebite-teal/20 text-safebite-teal px-2 py-0.5 rounded-full">v3.0</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-safebite-text hover:text-safebite-teal transition-colors">Home</Link>
            <Link to="/features" className="text-safebite-text hover:text-safebite-teal transition-colors">Features</Link>
            <Button
              variant="link"
              className="text-safebite-text hover:text-safebite-teal transition-colors p-0 h-auto font-normal"
              onClick={() => handleProtectedNavigation('/food-delivery')}
            >
              Food Delivery
            </Button>
            <Button
              variant="link"
              className="text-safebite-text hover:text-safebite-teal transition-colors p-0 h-auto font-normal"
              onClick={() => handleProtectedNavigation('/nutrition')}
            >
              Nutrition
            </Button>
            <Button
              variant="link"
              className="text-safebite-text hover:text-safebite-teal transition-colors p-0 h-auto font-normal"
              onClick={() => handleProtectedNavigation('/recipes')}
            >
              Recipes
            </Button>
            <Link to="/about" className="text-safebite-text hover:text-safebite-teal transition-colors">About</Link>
            <ThemeToggle variant="ghost" className="text-safebite-text hover:text-safebite-teal hover:bg-transparent" />
            {!shouldHideAuthButtons && (
              <>
                <Button
                  variant="outline"
                  className="sci-fi-button"
                  onClick={() => navigate('/auth/login')}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                  onClick={() => navigate('/auth/signup')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-safebite-text hover:text-safebite-teal focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-safebite-card-bg border-b border-safebite-card-bg-alt transition-all duration-300 ease-in-out transform origin-top">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/features"
              className="block px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Button
              variant="ghost"
              className="block w-full text-left px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => handleProtectedNavigation('/nutrition')}
            >
              Nutrition
            </Button>
            <Button
              variant="ghost"
              className="block w-full text-left px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => handleProtectedNavigation('/recipes')}
            >
              Recipes
            </Button>
            <Button
              variant="ghost"
              className="block w-full text-left px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => handleProtectedNavigation('/food-delivery')}
            >
              Food Delivery
            </Button>
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            <div className="px-3 py-2">
              <ThemeToggle variant="outline" size="default" className="w-full justify-start" />
            </div>

            {!shouldHideAuthButtons && (
              <div className="flex flex-col space-y-2 pt-2">
                <Button
                  variant="outline"
                  className="sci-fi-button w-full justify-center"
                  onClick={() => {
                    navigate('/auth/login');
                    setIsMenuOpen(false);
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button
                  className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 w-full justify-center"
                  onClick={() => {
                    navigate('/auth/signup');
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

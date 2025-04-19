import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, User } from 'lucide-react';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useToast } from '@/hooks/use-toast';
import { isAuthenticated } from '@/utils/authUtils';
import simpleSessionService from '@/services/simpleSessionService';

interface PublicNavbarProps {
  hideAuthButtons?: boolean;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({ hideAuthButtons }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth(app);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

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

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleSignUp = () => {
    navigate('/auth/signup');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      simpleSessionService.clearSession();
      navigate('/');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="bg-safebite-dark-blue/80 backdrop-blur-md border-b border-safebite-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-safebite-teal text-xl font-bold">SafeBite</span>
              <span className="ml-1 px-1.5 py-0.5 bg-safebite-teal text-safebite-dark-blue text-xs rounded-md">v3.0</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-safebite-text hover:text-safebite-teal transition-colors">Home</Link>
            <Link to="/features" className="text-safebite-text hover:text-safebite-teal transition-colors">Features</Link>
            <Link to="/about" className="text-safebite-text hover:text-safebite-teal transition-colors">About</Link>
          </div>

          {/* Auth buttons */}
          {!hideAuthButtons && (
            <div className="hidden md:flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="outline"
                    className="border-safebite-teal text-safebite-teal hover:bg-safebite-teal/10"
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-safebite-text hover:text-safebite-teal hover:bg-transparent"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-safebite-text hover:text-safebite-teal hover:bg-transparent"
                    onClick={handleLogin}
                  >
                    Login
                  </Button>
                  <Button
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    onClick={handleSignUp}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-safebite-text hover:text-safebite-teal focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-safebite-card-bg border-t border-safebite-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
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
            <Link
              to="/about"
              className="block px-3 py-2 rounded-md text-safebite-text hover:bg-safebite-card-bg-alt hover:text-safebite-teal"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            {/* Mobile auth buttons */}
            {!hideAuthButtons && (
              <div className="pt-4 pb-3 border-t border-safebite-border">
                {isLoggedIn ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full mb-2 border-safebite-teal text-safebite-teal hover:bg-safebite-teal/10"
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-safebite-text hover:text-safebite-teal hover:bg-transparent"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full mb-2 text-safebite-text hover:text-safebite-teal hover:bg-transparent"
                      onClick={() => {
                        handleLogin();
                        setIsMenuOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                      onClick={() => {
                        handleSignUp();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;

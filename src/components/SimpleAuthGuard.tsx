import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';
import { useToast } from '@/hooks/use-toast';
import simpleSessionService from '@/services/simpleSessionService';
import { isAuthPage } from '@/utils/authUtils';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
  allowGuest?: boolean;
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({ children, allowGuest = true }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    // Check if we're on an auth page - if so, we don't need to check auth
    if (isAuthPage()) {
      setIsAuthenticated(true);
      setIsChecking(false);
      return () => {};
    }

    // Force immediate check before waiting for Firebase
    const checkAuth = () => {
      // Check if user is authenticated through Firebase
      const isFirebaseAuth = !!auth.currentUser;

      // Check if user is in guest mode
      const isGuestMode = simpleSessionService.isGuestUser();

      // Check if session is valid
      const isSessionValid = simpleSessionService.isAuthenticated();

      // Set authentication state based on allowGuest parameter
      const authenticated = isFirebaseAuth || (allowGuest && isGuestMode && isSessionValid);

      console.log('SimpleAuthGuard - Auth check:', {
        path: location.pathname,
        isFirebaseAuth,
        isGuestMode,
        isSessionValid,
        allowGuest,
        authenticated
      });

      setIsAuthenticated(authenticated);
      setIsChecking(false);

      // If session is invalid but user is logged in, refresh the session
      if (!isSessionValid && isFirebaseAuth) {
        simpleSessionService.refreshSession('logged-in');
      }

      // If not authenticated and not on an auth page, redirect immediately
      if (!authenticated && !isAuthPage()) {
        // Show toast notification
        toast({
          title: "Authentication Required",
          description: allowGuest
            ? "Please log in or continue as guest to access this page."
            : "This feature requires a full account. Please sign up to continue.",
          variant: "destructive",
        });

        // Get the base URL for the application
        const baseUrl = window.location.pathname.includes('/SafeBite-V1')
          ? '/SafeBite-V1'
          : '';

        // Redirect to login page with return URL
        const returnPath = encodeURIComponent(location.pathname);
        const redirectPath = allowGuest
          ? `${baseUrl}/auth/login?returnUrl=${returnPath}`
          : `${baseUrl}/auth/signup?returnUrl=${returnPath}`;

        // Use window.location for a hard redirect to avoid React Router issues
        window.location.href = redirectPath;
      }
    };

    // Run initial check
    checkAuth();

    // Set up auth state change listener
    const unsubscribe = onAuthStateChanged(auth, checkAuth);

    return () => unsubscribe();
  }, [auth, toast, allowGuest, location.pathname]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-safebite-dark-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safebite-teal mx-auto mb-4"></div>
          <p className="text-safebite-text">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on an auth page, show loading while we redirect
  // The actual redirect happens in the useEffect to ensure it's a hard redirect
  if (!isAuthenticated && !isAuthPage()) {
    return (
      <div className="flex items-center justify-center h-screen bg-safebite-dark-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safebite-teal mx-auto mb-4"></div>
          <p className="text-safebite-text">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default SimpleAuthGuard;

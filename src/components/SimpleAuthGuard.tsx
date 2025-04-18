import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase';
import { useToast } from '@/hooks/use-toast';
import simpleSessionService from '@/services/simpleSessionService';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if user is authenticated through Firebase
      const isFirebaseAuth = !!user;
      
      // Check if user is in guest mode
      const isGuestMode = simpleSessionService.isGuestUser();
      
      // Check if session is valid
      const isSessionValid = simpleSessionService.isAuthenticated();
      
      // Set authentication state
      setIsAuthenticated(isFirebaseAuth || (isGuestMode && isSessionValid));
      setIsChecking(false);
      
      // If session is invalid but user is logged in, refresh the session
      if (!isSessionValid && isFirebaseAuth) {
        simpleSessionService.refreshSession('logged-in');
      }
    });

    return () => unsubscribe();
  }, [auth, toast]);

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

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Show toast notification
    toast({
      title: "Authentication Required",
      description: "Please log in or continue as guest to access this page.",
      variant: "destructive",
    });
    
    // Redirect to login page with return URL
    return <Navigate to={`/auth/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default SimpleAuthGuard;

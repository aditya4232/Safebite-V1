
import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import guestAuthService from "@/services/guestAuthService";

// Custom hook to check if the current user is in guest mode
export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    // Function to check guest mode status
    const checkGuestMode = () => {
      // Check if user is logged in
      const user = auth.currentUser;

      // If user is logged in, they are not a guest regardless of other flags
      if (user) {
        setIsGuest(false);
        // Clear any guest flags if a user is logged in
        if (localStorage.getItem('userType') === 'guest' || sessionStorage.getItem('safebite-guest-mode') === 'true') {
          guestAuthService.exitGuestMode();
          console.log('User is logged in, clearing guest mode flags');
        }
      } else {
        // Check if user is in guest mode with a valid session
        const isGuestMode = guestAuthService.isGuestUser();
        setIsGuest(isGuestMode);

        // If session is valid but about to expire (less than 2 minutes left), extend it
        if (isGuestMode && guestAuthService.isSessionValid()) {
          const expirationTimeStr = localStorage.getItem('guestSessionExpires');
          if (expirationTimeStr) {
            const expirationTime = new Date(expirationTimeStr);
            const now = new Date();
            const timeLeft = expirationTime.getTime() - now.getTime();

            // If less than 2 minutes left, extend the session
            if (timeLeft < 2 * 60 * 1000) {
              guestAuthService.extendGuestSession();
              console.log('Guest session automatically extended');
            }
          }
        }

        // If we're in emergency guest mode due to permission denied,
        // we should log this for debugging
        if (sessionStorage.getItem('safebite-guest-mode') === 'true') {
          console.log('Using emergency guest mode due to permission denied');
        }
      }
    };

    // Run the check immediately
    checkGuestMode();

    // Set up an interval to check periodically (every 2 seconds)
    const intervalId = setInterval(checkGuestMode, 2000);

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsGuest(false);
        localStorage.removeItem('userType');
        sessionStorage.removeItem('safebite-guest-mode');
      } else {
        // Check again when auth state changes
        const userType = localStorage.getItem('userType');
        const emergencyGuestMode = sessionStorage.getItem('safebite-guest-mode');
        setIsGuest(userType === 'guest' || emergencyGuestMode === 'true');
      }
    });

    // Cleanup subscription and interval
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [auth]);

  // Function to exit guest mode (for logout)
  const exitGuestMode = () => {
    guestAuthService.exitGuestMode();
    setIsGuest(false);
  };

  // Function to enter emergency guest mode (for permission denied)
  const enterEmergencyGuestMode = () => {
    // Only enter guest mode if not logged in
    if (!auth.currentUser) {
      // Use the guest auth service to sign in as guest
      guestAuthService.signInAsGuest('Emergency Guest');
      setIsGuest(true);
    }
  };

  return { isGuest, exitGuestMode, enterEmergencyGuestMode };
};


import { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

// Custom hook to check if the current user is in guest mode
export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    // Function to check guest mode status
    const checkGuestMode = () => {
      // Check if user is logged in
      const user = auth.currentUser;

      // Check localStorage for the guest flag
      const userType = localStorage.getItem('userType');
      // Check sessionStorage for permission-denied emergency guest mode
      const emergencyGuestMode = sessionStorage.getItem('safebite-guest-mode');

      // If user is logged in, they are not a guest regardless of other flags
      if (user) {
        setIsGuest(false);
        // Clear any guest flags if a user is logged in
        if (userType === 'guest' || emergencyGuestMode === 'true') {
          localStorage.removeItem('userType');
          sessionStorage.removeItem('safebite-guest-mode');
          console.log('User is logged in, clearing guest mode flags');
        }
      } else {
        // Set guest mode if either condition is true and no user is logged in
        const isGuestMode = userType === 'guest' || emergencyGuestMode === 'true';
        setIsGuest(isGuestMode);

        console.log('Guest mode check:', { userType, emergencyGuestMode, isGuestMode });

        // If we're in emergency guest mode due to permission denied,
        // we should log this for debugging
        if (emergencyGuestMode === 'true') {
          console.log('Using emergency guest mode due to permission denied');
        }
      }
    };

    // Run the check immediately
    checkGuestMode();

    // Set up an interval to check periodically (every 2 seconds)
    const intervalId = setInterval(checkGuestMode, 2000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);

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

    // Cleanup subscription
    return () => unsubscribe();
  }, [auth]);

  // Function to exit guest mode (for logout)
  const exitGuestMode = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('guestId');
    sessionStorage.removeItem('safebite-guest-mode');
    sessionStorage.removeItem('guestUserData');
    setIsGuest(false);
  };

  // Function to enter emergency guest mode (for permission denied)
  const enterEmergencyGuestMode = () => {
    // Only enter guest mode if not logged in
    if (!auth.currentUser) {
      sessionStorage.setItem('safebite-guest-mode', 'true');
      setIsGuest(true);
    }
  };

  return { isGuest, exitGuestMode, enterEmergencyGuestMode };
};

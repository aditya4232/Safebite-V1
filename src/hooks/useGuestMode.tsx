
import { useEffect, useState } from 'react';

// Custom hook to check if the current user is in guest mode
export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check localStorage for the guest flag
    const userType = localStorage.getItem('userType');
    // Check sessionStorage for permission-denied emergency guest mode
    const emergencyGuestMode = sessionStorage.getItem('safebite-guest-mode');

    // Set guest mode if either condition is true
    setIsGuest(userType === 'guest' || emergencyGuestMode === 'true');

    // If we're in emergency guest mode due to permission denied,
    // we should log this for debugging
    if (emergencyGuestMode === 'true') {
      console.log('Using emergency guest mode due to permission denied');
    }
  }, []);

  // Function to exit guest mode (for logout)
  const exitGuestMode = () => {
    localStorage.removeItem('userType');
    sessionStorage.removeItem('safebite-guest-mode');
    setIsGuest(false);
  };

  // Function to enter emergency guest mode (for permission denied)
  const enterEmergencyGuestMode = () => {
    sessionStorage.setItem('safebite-guest-mode', 'true');
    setIsGuest(true);
  };

  return { isGuest, exitGuestMode, enterEmergencyGuestMode };
};

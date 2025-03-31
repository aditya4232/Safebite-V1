
import { useEffect, useState } from 'react';

// Custom hook to check if the current user is in guest mode
export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);
  
  useEffect(() => {
    // Check localStorage for the guest flag
    const userType = localStorage.getItem('userType');
    setIsGuest(userType === 'guest');
  }, []);
  
  // Function to exit guest mode (for logout)
  const exitGuestMode = () => {
    localStorage.removeItem('userType');
    setIsGuest(false);
  };
  
  return { isGuest, exitGuestMode };
};

// src/services/locationService.ts

/**
 * Interface for user location data
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  address?: string;
  timestamp: number;
}

/**
 * Gets the user's current location using browser geolocation API
 * @returns Promise with UserLocation object
 */
export const getCurrentLocation = (): Promise<UserLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          latitude,
          longitude,
          timestamp: Date.now()
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
};

/**
 * Gets the city name from coordinates using reverse geocoding
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with city name
 */
export const getCityFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );
    const data = await response.json();
    
    if (data.address) {
      // Try to get the most specific location name
      return data.address.city || data.address.town || data.address.village || data.address.suburb || 'Unknown';
    }
    return 'Unknown';
  } catch (error) {
    console.error('Error getting city from coordinates:', error);
    return 'Unknown';
  }
};

/**
 * Gets the full address from coordinates using reverse geocoding
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with address string
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`
    );
    const data = await response.json();
    
    if (data.display_name) {
      return data.display_name;
    }
    return 'Unknown address';
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    return 'Unknown address';
  }
};

/**
 * Calculates the distance between two coordinates in kilometers
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Haversine formula to calculate distance between two points on Earth
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Saves the user's location to localStorage
 * @param location UserLocation object
 */
export const saveUserLocation = (location: UserLocation): void => {
  localStorage.setItem('userLocation', JSON.stringify(location));
};

/**
 * Gets the user's saved location from localStorage
 * @returns UserLocation object or null if not found
 */
export const getSavedUserLocation = (): UserLocation | null => {
  const savedLocation = localStorage.getItem('userLocation');
  if (savedLocation) {
    const location = JSON.parse(savedLocation) as UserLocation;
    
    // Check if the location is still valid (less than 30 minutes old)
    const thirtyMinutesInMs = 30 * 60 * 1000;
    if (Date.now() - location.timestamp < thirtyMinutesInMs) {
      return location;
    }
  }
  return null;
};

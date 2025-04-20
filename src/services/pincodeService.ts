/**
 * Pincode Service
 *
 * This service handles pincode-related functionality for location-based availability
 */

// Interface for pincode data
export interface PincodeData {
  pincode: string;
  city: string;
  state: string;
  district?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}

// Interface for availability data
export interface AvailabilityData {
  available: boolean;
  deliveryTime?: string;
  message?: string;
  stores?: string[];
}

// Cache for pincode data to avoid repeated API calls
const pincodeCache: Record<string, PincodeData> = {};

/**
 * Get pincode data from user's location
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 * @returns Promise with pincode data
 */
export const getPincodeFromCoordinates = async (latitude: number, longitude: number): Promise<PincodeData | null> => {
  try {
    // Use OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );

    if (!response.ok) {
      throw new Error(`Failed to get location data: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.address) {
      throw new Error('Invalid location data received');
    }

    // Extract postal code from address
    const pincode = data.address.postcode;

    if (!pincode) {
      throw new Error('No postal code found for this location');
    }

    // Create pincode data object
    const pincodeData: PincodeData = {
      pincode,
      city: data.address.city || data.address.town || data.address.village || '',
      state: data.address.state || '',
      district: data.address.county || data.address.district || '',
      area: data.address.suburb || data.address.neighbourhood || '',
      latitude,
      longitude
    };

    // Cache the pincode data
    pincodeCache[pincode] = pincodeData;

    return pincodeData;
  } catch (error) {
    console.error('Error getting pincode from coordinates:', error);
    return null;
  }
};

/**
 * Get pincode data from pincode string
 * @param pincode Pincode string
 * @returns Promise with pincode data
 */
export const getPincodeData = async (pincode: string): Promise<PincodeData | null> => {
  try {
    // Check cache first
    if (pincodeCache[pincode]) {
      return pincodeCache[pincode];
    }

    // Use India Post API or alternative
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);

    if (!response.ok) {
      throw new Error(`Failed to get pincode data: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0 || data[0].Status !== 'Success') {
      throw new Error('Invalid pincode data received');
    }

    const postOffice = data[0].PostOffice[0];

    // Create pincode data object
    const pincodeData: PincodeData = {
      pincode,
      city: postOffice.Block || postOffice.Name,
      state: postOffice.State,
      district: postOffice.District,
      area: postOffice.Name
    };

    // Cache the pincode data
    pincodeCache[pincode] = pincodeData;

    return pincodeData;
  } catch (error) {
    console.error('Error getting pincode data:', error);

    // Fallback to mock data for common city pincodes
    const mockPincodeMap: Record<string, PincodeData> = {
      '110001': { pincode: '110001', city: 'New Delhi', state: 'Delhi' },
      '400001': { pincode: '400001', city: 'Mumbai', state: 'Maharashtra' },
      '700001': { pincode: '700001', city: 'Kolkata', state: 'West Bengal' },
      '600001': { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu' },
      '500001': { pincode: '500001', city: 'Hyderabad', state: 'Telangana' },
      '560001': { pincode: '560001', city: 'Bangalore', state: 'Karnataka' },
      '380001': { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat' },
      '411001': { pincode: '411001', city: 'Pune', state: 'Maharashtra' },
      '302001': { pincode: '302001', city: 'Jaipur', state: 'Rajasthan' },
      '226001': { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh' }
    };

    // Check if we have mock data for this pincode
    if (mockPincodeMap[pincode]) {
      return mockPincodeMap[pincode];
    }

    // If pincode starts with a known prefix, create a mock entry
    const prefix = pincode.substring(0, 2);
    const mockCityMap: Record<string, { city: string, state: string }> = {
      '11': { city: 'Delhi', state: 'Delhi' },
      '40': { city: 'Mumbai', state: 'Maharashtra' },
      '70': { city: 'Kolkata', state: 'West Bengal' },
      '60': { city: 'Chennai', state: 'Tamil Nadu' },
      '50': { city: 'Hyderabad', state: 'Telangana' },
      '56': { city: 'Bangalore', state: 'Karnataka' },
      '38': { city: 'Ahmedabad', state: 'Gujarat' },
      '41': { city: 'Pune', state: 'Maharashtra' },
      '30': { city: 'Jaipur', state: 'Rajasthan' },
      '22': { city: 'Lucknow', state: 'Uttar Pradesh' }
    };

    if (mockCityMap[prefix]) {
      const mockData: PincodeData = {
        pincode,
        city: mockCityMap[prefix].city,
        state: mockCityMap[prefix].state
      };

      // Cache the mock data
      pincodeCache[pincode] = mockData;

      return mockData;
    }

    return null;
  }
};

/**
 * Check if a product is available at a given pincode
 * @param productId Product ID
 * @param pincode Pincode string
 * @returns Promise with availability data
 */
export const checkProductAvailability = async (productId: string, pincode: string): Promise<AvailabilityData> => {
  try {
    // Get pincode data
    const pincodeData = await getPincodeData(pincode);

    if (!pincodeData) {
      return {
        available: false,
        message: 'Invalid pincode'
      };
    }

    // In a real implementation, we would call an API to check availability
    // For now, we'll simulate availability based on the product ID and pincode

    // Generate a deterministic availability based on product ID and pincode
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) +
                 pincode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const isAvailable = hash % 10 < 8; // 80% chance of availability

    if (isAvailable) {
      // Generate delivery time (1-3 days)
      const deliveryDays = (hash % 3) + 1;

      // Generate nearby stores
      const storeNames = [
        'BigBasket', 'Blinkit', 'Zepto', 'JioMart', 'Amazon Fresh',
        'Instamart', 'Flipkart Grocery', 'Nature\'s Basket', 'Spencer\'s'
      ];

      // Select 2-4 stores based on hash
      const numStores = ((hash % 3) + 2);
      const storeIndices = new Set<number>();

      // Prevent infinite loop by using different indices
      for (let i = 0; i < numStores + 3; i++) {
        storeIndices.add((hash + i) % storeNames.length);
        if (storeIndices.size >= numStores) break;
      }

      const stores = Array.from(storeIndices).map(index => storeNames[index]);

      return {
        available: true,
        deliveryTime: `${deliveryDays} day${deliveryDays > 1 ? 's' : ''}`,
        stores
      };
    } else {
      return {
        available: false,
        message: 'Product not available in your area'
      };
    }
  } catch (error) {
    console.error('Error checking product availability:', error);
    return {
      available: false,
      message: 'Error checking availability'
    };
  }
};

/**
 * Save user's pincode to localStorage
 * @param pincode Pincode string
 * @param pincodeData Optional pincode data
 */
export const saveUserPincode = (pincode: string, pincodeData?: PincodeData): void => {
  try {
    localStorage.setItem('userPincode', pincode);

    if (pincodeData) {
      localStorage.setItem('userPincodeData', JSON.stringify(pincodeData));
    }
  } catch (error) {
    console.error('Error saving user pincode:', error);
  }
};

/**
 * Get user's saved pincode from localStorage
 * @returns User's pincode or null if not found
 */
export const getUserPincode = (): string | null => {
  try {
    return localStorage.getItem('userPincode');
  } catch (error) {
    console.error('Error getting user pincode:', error);
    return null;
  }
};

/**
 * Get user's saved pincode data from localStorage
 * @returns User's pincode data or null if not found
 */
export const getUserPincodeData = (): PincodeData | null => {
  try {
    const data = localStorage.getItem('userPincodeData');

    if (data) {
      return JSON.parse(data);
    }

    return null;
  } catch (error) {
    console.error('Error getting user pincode data:', error);
    return null;
  }
};

export default {
  getPincodeFromCoordinates,
  getPincodeData,
  checkProductAvailability,
  saveUserPincode,
  getUserPincode,
  getUserPincodeData
};

// src/services/nutritionApiService.ts
import { cacheService } from './cacheService';

// API Keys from environment variables with fallbacks
const CALORIENINJAS_API_KEY = import.meta.env.VITE_CALORIENINJAS_API_KEY || 'Rl0Rl5Hs9Hn9Yx9Nt9Ht9A==Ck9Nt9Ht9A==Ck9Nt9Ht9A==';
const FATSECRET_API_KEY = import.meta.env.VITE_FATSECRET_API_KEY || 'a742d2c9f5982d5d0f3c1c92a372f0c928617b56';
const FATSECRET_API_SECRET = import.meta.env.VITE_FATSECRET_API_SECRET || '0c3e9d7f9546b5be3b6405f0c9903f25';

// API Base URLs
const CALORIENINJAS_BASE_URL = 'https://api.calorieninjas.com/v1';
const FATSECRET_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// Interface for nutrition data
export interface NutritionData {
  name: string;
  calories: number;
  serving_size_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  protein_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  carbohydrates_total_g: number;
  fiber_g: number;
  sugar_g: number;
}

// Interface for food item
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  serving_size: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  image_url?: string;
  source: string;
}

// Interface for barcode scan result
export interface BarcodeScanResult {
  success: boolean;
  product?: FoodItem;
  error?: string;
}

// Interface for image analysis result
export interface ImageAnalysisResult {
  success: boolean;
  foods?: FoodItem[];
  error?: string;
}

// API Status tracking
interface ApiStatus {
  name: string;
  isAvailable: boolean;
  lastChecked: Date;
}

let apiStatus: { [key: string]: ApiStatus } = {
  calorieNinjas: {
    name: 'CalorieNinjas',
    isAvailable: true,
    lastChecked: new Date()
  },
  fatSecret: {
    name: 'FatSecret',
    isAvailable: true,
    lastChecked: new Date()
  }
};

/**
 * Get the status of all nutrition APIs
 */
export const getNutritionApiStatus = () => {
  return apiStatus;
};

/**
 * Check if an API is available
 * @param apiName - Name of the API to check
 */
export const checkApiAvailability = async (apiName: 'calorieNinjas' | 'fatSecret'): Promise<boolean> => {
  try {
    if (apiName === 'calorieNinjas') {
      const response = await fetch(`${CALORIENINJAS_BASE_URL}/nutrition?query=apple`, {
        method: 'GET',
        headers: {
          'X-Api-Key': CALORIENINJAS_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      apiStatus.calorieNinjas.isAvailable = response.ok;
      apiStatus.calorieNinjas.lastChecked = new Date();
      return response.ok;
    } else {
      // For FatSecret, we'll just check if we can get an OAuth token
      const response = await fetch(`${FATSECRET_BASE_URL}?method=foods.search&search_expression=apple&format=json`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FATSECRET_API_KEY}`
        }
      });

      apiStatus.fatSecret.isAvailable = response.ok;
      apiStatus.fatSecret.lastChecked = new Date();
      return response.ok;
    }
  } catch (error) {
    console.error(`Error checking ${apiName} availability:`, error);
    apiStatus[apiName].isAvailable = false;
    apiStatus[apiName].lastChecked = new Date();
    return false;
  }
};

/**
 * Search for nutrition data using CalorieNinjas API
 * @param query - Food item to search for
 */
export const searchCalorieNinjas = async (query: string): Promise<FoodItem[]> => {
  try {
    // Create a cache key for this specific query
    const cacheKey = `calorieninjas_${query}`;

    // Try to get results from cache first
    return await cacheService.getOrSet(cacheKey, async () => {
      const response = await fetch(`${CALORIENINJAS_BASE_URL}/nutrition?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': CALORIENINJAS_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`CalorieNinjas API error: ${response.status}`);
      }

      const data = await response.json();

      // Update API status
      apiStatus.calorieNinjas.isAvailable = true;
      apiStatus.calorieNinjas.lastChecked = new Date();

      // Transform the data to our FoodItem format
      return data.items.map((item: NutritionData, index: number) => ({
        id: `cn-${index}-${Date.now()}`,
        name: item.name,
        calories: item.calories,
        serving_size: `${item.serving_size_g}g`,
        nutrients: {
          protein: item.protein_g,
          carbs: item.carbohydrates_total_g,
          fat: item.fat_total_g,
          fiber: item.fiber_g,
          sugar: item.sugar_g,
          sodium: item.sodium_mg
        },
        source: 'CalorieNinjas'
      }));
    }, 30 * 60 * 1000); // Cache for 30 minutes
  } catch (error) {
    console.error('Error searching CalorieNinjas:', error);

    // Update API status
    apiStatus.calorieNinjas.isAvailable = false;
    apiStatus.calorieNinjas.lastChecked = new Date();

    return [];
  }
};

/**
 * Search for nutrition data using FatSecret API
 * @param query - Food item to search for
 */
export const searchFatSecret = async (query: string): Promise<FoodItem[]> => {
  try {
    // Create a cache key for this specific query
    const cacheKey = `fatsecret_${query}`;

    // Try to get results from cache first
    return await cacheService.getOrSet(cacheKey, async () => {
      // In a real implementation, we would need to handle OAuth 2.0 authentication
      // For simplicity, we're assuming we already have a valid access token

      const response = await fetch(`${FATSECRET_BASE_URL}?method=foods.search&search_expression=${encodeURIComponent(query)}&format=json`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${FATSECRET_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`FatSecret API error: ${response.status}`);
      }

      const data = await response.json();

      // Update API status
      apiStatus.fatSecret.isAvailable = true;
      apiStatus.fatSecret.lastChecked = new Date();

      // Transform the data to our FoodItem format
      // Note: This is a simplified transformation as the actual FatSecret API response is more complex
      if (data.foods && data.foods.food) {
        return data.foods.food.map((item: any, index: number) => ({
          id: `fs-${item.food_id || index}-${Date.now()}`,
          name: item.food_name,
          brand: item.brand_name,
          calories: parseFloat(item.food_description.split('|')[0].replace('kcal', '').trim()),
          serving_size: item.serving_description || '100g',
          nutrients: {
            protein: parseFloat(item.food_description.split('|')[1].replace('g', '').trim()),
            carbs: parseFloat(item.food_description.split('|')[2].replace('g', '').trim()),
            fat: parseFloat(item.food_description.split('|')[3].replace('g', '').trim()),
            fiber: 0, // Not provided in basic search
            sugar: 0, // Not provided in basic search
            sodium: 0 // Not provided in basic search
          },
          image_url: item.food_image,
          source: 'FatSecret'
        }));
      }

      return [];
    }, 30 * 60 * 1000); // Cache for 30 minutes
  } catch (error) {
    console.error('Error searching FatSecret:', error);

    // Update API status
    apiStatus.fatSecret.isAvailable = false;
    apiStatus.fatSecret.lastChecked = new Date();

    return [];
  }
};

/**
 * Search for nutrition data using both APIs
 * @param query - Food item to search for
 * @param preferredApi - Preferred API to use (optional)
 */
export const searchNutrition = async (
  query: string,
  preferredApi?: 'calorieNinjas' | 'fatSecret'
): Promise<FoodItem[]> => {
  try {
    // Create a cache key based on the query and preferred API
    const cacheKey = `nutrition_search_${query}_${preferredApi || 'both'}`;

    // Try to get results from cache first
    return await cacheService.getOrSet(cacheKey, async () => {
      let results: FoodItem[] = [];

      // If a preferred API is specified, try that first
      if (preferredApi) {
        if (preferredApi === 'calorieNinjas') {
          results = await searchCalorieNinjas(query);

          // If no results or API failed, fall back to FatSecret
          if (results.length === 0 && apiStatus.fatSecret.isAvailable) {
            const fatSecretResults = await searchFatSecret(query);
            results = [...results, ...fatSecretResults];
          }
        } else {
          results = await searchFatSecret(query);

          // If no results or API failed, fall back to CalorieNinjas
          if (results.length === 0 && apiStatus.calorieNinjas.isAvailable) {
            const calorieNinjasResults = await searchCalorieNinjas(query);
            results = [...results, ...calorieNinjasResults];
          }
        }
      } else {
        // Try both APIs in parallel
        const [calorieNinjasResults, fatSecretResults] = await Promise.all([
          apiStatus.calorieNinjas.isAvailable ? searchCalorieNinjas(query) : Promise.resolve([]),
          apiStatus.fatSecret.isAvailable ? searchFatSecret(query) : Promise.resolve([])
        ]);

        results = [...calorieNinjasResults, ...fatSecretResults];
      }

      // Add a small delay to prevent rate limiting
      if (results.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      return results;
    }, 15 * 60 * 1000); // Cache for 15 minutes
  } catch (error) {
    console.error('Error searching nutrition data:', error);
    return [];
  }
};

/**
 * Analyze an image to identify food items (using CalorieNinjas)
 * @param imageUrl - URL of the image to analyze
 */
export const analyzeImage = async (imageUrl: string): Promise<ImageAnalysisResult> => {
  try {
    // In a real implementation, we would send the image to an API for analysis
    // For now, we'll simulate a response

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a successful response with some food items
    const simulatedFoods: FoodItem[] = [
      {
        id: `img-1-${Date.now()}`,
        name: 'Apple',
        calories: 52,
        serving_size: '100g',
        nutrients: {
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          fiber: 2.4,
          sugar: 10.3,
          sodium: 1
        },
        source: 'Image Analysis'
      },
      {
        id: `img-2-${Date.now()}`,
        name: 'Banana',
        calories: 89,
        serving_size: '100g',
        nutrients: {
          protein: 1.1,
          carbs: 22.8,
          fat: 0.3,
          fiber: 2.6,
          sugar: 12.2,
          sodium: 1
        },
        source: 'Image Analysis'
      }
    ];

    return {
      success: true,
      foods: simulatedFoods
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: 'Failed to analyze image. Please try again.'
    };
  }
};

/**
 * Scan a barcode to identify a food item
 * @param barcode - Barcode to scan
 */
export const scanBarcode = async (barcode: string): Promise<BarcodeScanResult> => {
  try {
    // In a real implementation, we would send the barcode to an API for lookup
    // For now, we'll simulate a response

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate a successful response
    const simulatedProduct: FoodItem = {
      id: `barcode-${barcode}-${Date.now()}`,
      name: 'Chocolate Bar',
      brand: 'Hershey\'s',
      calories: 214,
      serving_size: '43g (1 bar)',
      nutrients: {
        protein: 3,
        carbs: 26,
        fat: 13,
        fiber: 1.5,
        sugar: 24,
        sodium: 25
      },
      image_url: 'https://example.com/chocolate.jpg',
      source: 'Barcode Scan'
    };

    return {
      success: true,
      product: simulatedProduct
    };
  } catch (error) {
    console.error('Error scanning barcode:', error);
    return {
      success: false,
      error: 'Failed to scan barcode. Please try again.'
    };
  }
};

export default {
  searchNutrition,
  searchCalorieNinjas,
  searchFatSecret,
  analyzeImage,
  scanBarcode,
  getNutritionApiStatus,
  checkApiAvailability
};

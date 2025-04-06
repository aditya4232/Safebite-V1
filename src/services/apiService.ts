// src/services/apiService.ts
import { FoodItem } from './foodApiService';

// API base URL - using Render-deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://safebite-backend.onrender.com/api';

// Ensure we're using the latest backend URL
console.log('Backend API URL:', API_BASE_URL);

// MongoDB URI
const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/';

// Log the API URL being used
console.log('Using API URL:', API_BASE_URL);

// Always use real data
const USE_MOCK_DATA = false;

// Interface for MongoDB product
export interface MongoDBProduct {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  ingredients?: string[];
  allergens?: string[];
  additives?: string[];
  nutritionScore?: 'green' | 'yellow' | 'red';
  image?: string;
  source?: string;
}

// Convert MongoDB product to FoodItem
export const convertProductToFoodItem = (product: MongoDBProduct): FoodItem => {
  // Calculate nutrition score if not already present
  let nutritionScore = product.nutritionScore || 'yellow';
  if (!product.nutritionScore) {
    if (product.nutrients.protein > 15 &&
        (product.nutrients.fiber || 0) > 3 &&
        (product.nutrients.sugar || 0) < 10) {
      nutritionScore = 'green';
    } else if (product.nutrients.fat > 20 || (product.nutrients.sugar || 0) > 15) {
      nutritionScore = 'red';
    }
  }

  return {
    id: `mongodb-${product._id}`,
    name: product.name,
    brand: product.brand,
    calories: product.calories,
    nutritionScore: nutritionScore as 'green' | 'yellow' | 'red',
    image: product.image || `https://source.unsplash.com/random/100x100/?${encodeURIComponent(product.name)}`,
    nutrients: {
      protein: product.nutrients.protein,
      carbs: product.nutrients.carbs,
      fat: product.nutrients.fat,
      fiber: product.nutrients.fiber,
      sugar: product.nutrients.sugar
    },
    details: {
      protein: product.nutrients.protein,
      carbs: product.nutrients.carbs,
      fat: product.nutrients.fat,
      sodium: product.nutrients.sodium || 0,
      sugar: product.nutrients.sugar || 0,
      calories: product.calories,
      ingredients: product.ingredients || [],
      allergens: product.allergens || [],
      additives: product.additives || []
    },
    source: 'MongoDB'
  };
};

// Search products in MongoDB via API
export const searchProductsInMongoDB = async (query: string): Promise<FoodItem[]> => {
  // Try multiple methods to get data from MongoDB
  const results = await Promise.allSettled([
    searchViaAPI(query),
    searchViaRenderBackend(query)
  ]);

  // Check if any method succeeded
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      return result.value;
    }
  }

  // If all methods failed or returned empty results, return empty array
  console.warn('All MongoDB search methods failed or returned no results');
  return [];
};

// Method 1: Search via configured API
const searchViaAPI = async (query: string): Promise<FoodItem[]> => {
  try {
    const url = `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`;
    console.log('Searching MongoDB via API:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send credentials
      signal: controller.signal
    });

    console.log('API response status:', response.status);

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API error: ${response.status} - ${response.statusText}`);
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const products: MongoDBProduct[] = await response.json();
    console.log(`Found ${products.length} products from MongoDB via API`);

    // Handle empty array case
    if (!Array.isArray(products)) {
      console.warn('API did not return an array:', products);
      return [];
    }

    // Convert to FoodItem format
    return products.map(product => convertProductToFoodItem(product));
  } catch (error) {
    console.error('Error searching MongoDB via API:', error);
    return [];
  }
};

// Method 2: Search via Render backend directly
const searchViaRenderBackend = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log('Trying direct Render backend...');
    const fallbackUrl = `https://safebite-backend.onrender.com/api/products/search?query=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!fallbackResponse.ok) {
      throw new Error(`Render API error: ${fallbackResponse.status}`);
    }

    const products: MongoDBProduct[] = await fallbackResponse.json();
    console.log(`Found ${products.length} products from MongoDB via Render backend`);

    if (!Array.isArray(products)) {
      console.warn('Render API did not return an array:', products);
      return [];
    }

    return products.map(product => convertProductToFoodItem(product));
  } catch (fallbackError) {
    console.error('Render backend search failed:', fallbackError);
    return [];
  }
};

// No mock data - using real data from MongoDB

// Get product by ID
export const getProductById = async (id: string): Promise<FoodItem | null> => {
  try {
    const url = `${API_BASE_URL}/products/${id}`;
    console.log('Getting product by ID:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const product: MongoDBProduct = await response.json();

    return convertProductToFoodItem(product);
  } catch (error) {
    console.error('Error getting product by ID:', error);

    // Try fallback to Render backend
    if (!API_BASE_URL.includes('safebite-backend.onrender.com')) {
      try {
        console.log('Trying fallback to Render backend for product ID...');
        const fallbackUrl = `https://safebite-backend.onrender.com/api/products/${id}`;
        const fallbackResponse = await fetch(fallbackUrl);

        if (fallbackResponse.ok) {
          const product: MongoDBProduct = await fallbackResponse.json();
          return convertProductToFoodItem(product);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return null;
  }
};

// Get similar products
export const getSimilarProducts = async (productId: string): Promise<FoodItem[]> => {
  try {
    const url = `${API_BASE_URL}/products/${productId}/similar`;
    console.log('Getting similar products:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const products: MongoDBProduct[] = await response.json();

    // Handle empty array case
    if (!Array.isArray(products)) {
      console.warn('API did not return an array for similar products:', products);
      return [];
    }

    return products.map(product => convertProductToFoodItem(product));
  } catch (error) {
    console.error('Error getting similar products:', error);

    // Try fallback to Render backend
    if (!API_BASE_URL.includes('safebite-backend.onrender.com')) {
      try {
        console.log('Trying fallback to Render backend for similar products...');
        const fallbackUrl = `https://safebite-backend.onrender.com/api/products/${productId}/similar`;
        const fallbackResponse = await fetch(fallbackUrl);

        if (fallbackResponse.ok) {
          const fallbackProducts: MongoDBProduct[] = await fallbackResponse.json();
          if (Array.isArray(fallbackProducts)) {
            return fallbackProducts.map(product => convertProductToFoodItem(product));
          }
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return [];
  }
};

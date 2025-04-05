// src/services/apiService.ts
import { FoodItem } from './foodApiService';

// API base URL - change this to your Render-deployed backend URL when available
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000/api';

// Flag to use mock data when API is not available
// Set to false when your Render backend is deployed
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'false' ? false : true;

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
  try {
    // If using mock data, return mock results
    if (USE_MOCK_DATA) {
      console.log('Using mock data for MongoDB search');
      return getMockFoodItems(query);
    }
    
    console.log('Searching MongoDB via API:', `${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`);
    const response = await fetch(`${API_BASE_URL}/products/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const products: MongoDBProduct[] = await response.json();
    console.log(`Found ${products.length} products from MongoDB`);
    
    // Convert to FoodItem format
    return products.map(product => convertProductToFoodItem(product));
  } catch (error) {
    console.error('Error searching MongoDB via API:', error);
    // Fallback to mock data if API fails
    console.log('Falling back to mock data');
    return getMockFoodItems(query);
  }
};

// Get mock food items for testing
const getMockFoodItems = (query: string): FoodItem[] => {
  const normalizedQuery = query.toLowerCase();
  
  // Sample food items
  const mockItems: FoodItem[] = [
    {
      id: 'mock-1',
      name: 'Apple',
      brand: 'Organic Farms',
      calories: 95,
      nutritionScore: 'green',
      image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      nutrients: {
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        fiber: 4.4,
        sugar: 19
      },
      details: {
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        sodium: 2,
        sugar: 19,
        calories: 95,
        ingredients: ['Apple'],
        allergens: [],
        additives: []
      },
      source: 'Mock Database'
    },
    {
      id: 'mock-2',
      name: 'Chicken Breast',
      brand: 'Premium Poultry',
      calories: 165,
      nutritionScore: 'green',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      nutrients: {
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0
      },
      details: {
        protein: 31,
        carbs: 0,
        fat: 3.6,
        sodium: 74,
        sugar: 0,
        calories: 165,
        ingredients: ['Chicken Breast'],
        allergens: [],
        additives: []
      },
      source: 'Mock Database'
    },
    {
      id: 'mock-3',
      name: 'Chocolate Chip Cookies',
      brand: 'Sweet Treats',
      calories: 450,
      nutritionScore: 'red',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      nutrients: {
        protein: 5,
        carbs: 63,
        fat: 21,
        fiber: 2,
        sugar: 35
      },
      details: {
        protein: 5,
        carbs: 63,
        fat: 21,
        sodium: 210,
        sugar: 35,
        calories: 450,
        ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate Chips', 'Eggs', 'Vanilla Extract', 'Baking Soda', 'Salt'],
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        additives: []
      },
      source: 'Mock Database'
    },
    {
      id: 'mock-4',
      name: 'Greek Yogurt',
      brand: 'Healthy Dairy',
      calories: 100,
      nutritionScore: 'green',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      nutrients: {
        protein: 17,
        carbs: 6,
        fat: 0.4,
        fiber: 0,
        sugar: 6
      },
      details: {
        protein: 17,
        carbs: 6,
        fat: 0.4,
        sodium: 65,
        sugar: 6,
        calories: 100,
        ingredients: ['Milk', 'Live Active Cultures'],
        allergens: ['Milk'],
        additives: []
      },
      source: 'Mock Database'
    },
    {
      id: 'mock-5',
      name: 'Spinach',
      brand: 'Fresh Greens',
      calories: 23,
      nutritionScore: 'green',
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      nutrients: {
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        sugar: 0.4
      },
      details: {
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        sodium: 24,
        sugar: 0.4,
        calories: 23,
        ingredients: ['Spinach'],
        allergens: [],
        additives: []
      },
      source: 'Mock Database'
    }
  ];
  
  // Filter based on query
  if (!query) {
    return mockItems.slice(0, 3); // Return first 3 items if no query
  }
  
  return mockItems.filter(item => 
    item.name.toLowerCase().includes(normalizedQuery) ||
    item.brand?.toLowerCase().includes(normalizedQuery) ||
    item.details?.ingredients?.some(ing => ing.toLowerCase().includes(normalizedQuery))
  );
};

// Get product by ID
export const getProductById = async (id: string): Promise<FoodItem | null> => {
  try {
    if (USE_MOCK_DATA) {
      // Return a mock item if using mock data
      const mockItems = getMockFoodItems('');
      const mockItem = mockItems.find(item => item.id === id);
      return mockItem || null;
    }
    
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    const product: MongoDBProduct = await response.json();
    
    return convertProductToFoodItem(product);
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
};

// Get similar products
export const getSimilarProducts = async (productId: string): Promise<FoodItem[]> => {
  try {
    if (USE_MOCK_DATA) {
      // Return some mock items if using mock data
      return getMockFoodItems('').slice(0, 3);
    }
    
    const response = await fetch(`${API_BASE_URL}/products/${productId}/similar`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const products: MongoDBProduct[] = await response.json();
    
    return products.map(product => convertProductToFoodItem(product));
  } catch (error) {
    console.error('Error getting similar products:', error);
    return [];
  }
};

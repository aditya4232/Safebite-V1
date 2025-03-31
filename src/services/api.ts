
// API configuration
const EDAMAM_APP_ID = 'demo_app_id'; // Replace with your actual Edamam API ID
const EDAMAM_APP_KEY = 'demo_app_key'; // Replace with your actual Edamam API key
const FATSECRET_CLIENT_ID = 'demo_client_id'; // Replace with your actual FatSecret API client ID
const FATSECRET_CLIENT_SECRET = 'demo_client_secret'; // Replace with your actual FatSecret API client secret

// Types
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  calories: number;
  serving_size?: string;
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
  health_score?: number;
  source: 'edamam' | 'fatsecret' | 'openfoodfacts';
}

export interface Recipe {
  id: string;
  title: string;
  image?: string;
  source_url?: string;
  source: string;
  calories: number;
  servings: number;
  cook_time?: number;
  prep_time?: number;
  health_labels?: string[];
  ingredients: string[];
  instructions?: string[];
  nutrients?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
  };
}

// Error handling
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  return {
    error: true,
    message: error.message || 'An unexpected error occurred',
  };
};

// Edamam API
export const searchFoodInEdamam = async (query: string): Promise<FoodItem[]> => {
  try {
    // This would normally be a real API call
    console.log(`Searching Edamam for: ${query}`);
    
    // Mock response
    return [
      {
        id: 'edamam_1',
        name: 'Paneer Tikka',
        brand: 'Homemade',
        image: 'https://source.unsplash.com/random/100x100/?paneer',
        calories: 320,
        serving_size: '100g',
        nutrients: {
          protein: 18,
          carbs: 9,
          fat: 22,
          sodium: 450
        },
        ingredients: ['Paneer', 'Yogurt', 'Spices', 'Bell Peppers'],
        source: 'edamam'
      },
      {
        id: 'edamam_2',
        name: 'Dal Makhani',
        brand: 'Indian Kitchen',
        image: 'https://source.unsplash.com/random/100x100/?dal',
        calories: 280,
        serving_size: '100g',
        nutrients: {
          protein: 12,
          carbs: 30,
          fat: 15,
          fiber: 8,
          sodium: 380
        },
        ingredients: ['Black Lentils', 'Kidney Beans', 'Butter', 'Cream', 'Spices'],
        source: 'edamam'
      }
    ];
  } catch (error) {
    return handleApiError(error) as any;
  }
};

export const searchRecipesInEdamam = async (query: string): Promise<Recipe[]> => {
  try {
    // This would normally be a real API call
    console.log(`Searching Edamam recipes for: ${query}`);
    
    // Mock response
    return [
      {
        id: 'edamam_recipe_1',
        title: 'Homemade Butter Chicken',
        image: 'https://source.unsplash.com/random/300x200/?butter_chicken',
        source: 'Edamam',
        calories: 450,
        servings: 4,
        cook_time: 30,
        prep_time: 15,
        health_labels: ['High-Protein', 'Low-Carb'],
        ingredients: [
          '500g chicken breast, cubed',
          '2 tbsp butter',
          '1 cup tomato puree',
          '1/2 cup cream',
          '1 tbsp garam masala',
          'Salt to taste'
        ],
        instructions: [
          'Marinate chicken in yogurt and spices',
          'Cook chicken until browned',
          'Add tomato puree and simmer',
          'Finish with cream and butter'
        ],
        nutrients: {
          protein: 28,
          carbs: 12,
          fat: 22,
          sodium: 480
        }
      }
    ];
  } catch (error) {
    return handleApiError(error) as any;
  }
};

// FatSecret API
export const searchFoodInFatSecret = async (query: string): Promise<FoodItem[]> => {
  try {
    // This would normally be a real API call
    console.log(`Searching FatSecret for: ${query}`);
    
    // Mock response
    return [
      {
        id: 'fatsecret_1',
        name: 'Roti',
        brand: 'Homemade',
        image: 'https://source.unsplash.com/random/100x100/?roti',
        calories: 120,
        serving_size: '1 piece (30g)',
        nutrients: {
          protein: 3,
          carbs: 20,
          fat: 2,
          fiber: 1
        },
        source: 'fatsecret'
      },
      {
        id: 'fatsecret_2',
        name: 'Samosa',
        brand: 'Street Food',
        image: 'https://source.unsplash.com/random/100x100/?samosa',
        calories: 250,
        serving_size: '1 piece (60g)',
        nutrients: {
          protein: 4,
          carbs: 30,
          fat: 14,
          sodium: 320
        },
        ingredients: ['Potato', 'Peas', 'Flour', 'Oil', 'Spices'],
        source: 'fatsecret'
      }
    ];
  } catch (error) {
    return handleApiError(error) as any;
  }
};

// OpenFoodFacts API
export const searchFoodInOpenFoodFacts = async (query: string): Promise<FoodItem[]> => {
  try {
    // This would normally be a real API call
    console.log(`Searching OpenFoodFacts for: ${query}`);
    
    // Mock response
    return [
      {
        id: 'off_1',
        name: 'Parle-G Biscuits',
        brand: 'Parle',
        image: 'https://source.unsplash.com/random/100x100/?biscuits',
        calories: 180,
        serving_size: '4 biscuits (40g)',
        nutrients: {
          protein: 3,
          carbs: 28,
          fat: 7,
          sugar: 12
        },
        ingredients: ['Wheat Flour', 'Sugar', 'Vegetable Oil', 'Invert Syrup', 'Milk Solids'],
        allergens: ['Wheat', 'Milk'],
        additives: ['Raising Agents', 'Emulsifiers'],
        health_score: 4,
        source: 'openfoodfacts'
      },
      {
        id: 'off_2',
        name: 'Maggi Noodles',
        brand: 'Nestle',
        image: 'https://source.unsplash.com/random/100x100/?noodles',
        calories: 420,
        serving_size: '1 packet (70g)',
        nutrients: {
          protein: 8,
          carbs: 56,
          fat: 18,
          sodium: 950
        },
        ingredients: ['Wheat Flour', 'Palm Oil', 'Salt', 'Sugar', 'Spices'],
        additives: ['Flavor Enhancers (E621)', 'Acidity Regulators'],
        health_score: 2,
        source: 'openfoodfacts'
      }
    ];
  } catch (error) {
    return handleApiError(error) as any;
  }
};

// Barcode scanning (using OpenFoodFacts)
export const getFoodByBarcode = async (barcode: string): Promise<FoodItem | null> => {
  try {
    // This would normally be a real API call
    console.log(`Searching for barcode: ${barcode}`);
    
    // Mock response
    return {
      id: `barcode_${barcode}`,
      name: 'Amul Butter',
      brand: 'Amul',
      image: 'https://source.unsplash.com/random/100x100/?butter',
      calories: 720,
      serving_size: '100g',
      nutrients: {
        protein: 0.5,
        carbs: 0.4,
        fat: 80,
        sodium: 750
      },
      ingredients: ['Milk Fat', 'Salt'],
      allergens: ['Milk'],
      health_score: 3,
      source: 'openfoodfacts'
    };
  } catch (error) {
    console.error('Barcode Scan Error:', error);
    return null;
  }
};

// Comprehensive search across all APIs
export const searchFoodAcrossAllAPIs = async (query: string): Promise<FoodItem[]> => {
  try {
    // This would make three parallel API calls in a real implementation
    const [edamamResults, fatSecretResults, openFoodFactsResults] = await Promise.all([
      searchFoodInEdamam(query),
      searchFoodInFatSecret(query),
      searchFoodInOpenFoodFacts(query)
    ]);
    
    // Combine results
    return [...edamamResults, ...fatSecretResults, ...openFoodFactsResults];
  } catch (error) {
    return handleApiError(error) as any;
  }
};

// Get health recommendations based on food data
export const getHealthRecommendations = (foodItem: FoodItem) => {
  const recommendations = [];
  
  // Add basic recommendations based on nutritional content
  if (foodItem.nutrients.sodium && foodItem.nutrients.sodium > 500) {
    recommendations.push("This food is high in sodium. Consider limiting intake if you have high blood pressure.");
  }
  
  if (foodItem.nutrients.sugar && foodItem.nutrients.sugar > 10) {
    recommendations.push("This food contains added sugars. Try to find alternatives with less sugar.");
  }
  
  if (foodItem.nutrients.fat > 20) {
    recommendations.push("This food is high in fat. Consider portion control.");
  }
  
  if (foodItem.additives && foodItem.additives.length > 0) {
    recommendations.push("This product contains food additives. Consider more natural alternatives.");
  }
  
  // If no concerns are found
  if (recommendations.length === 0) {
    recommendations.push("This food appears to be nutritionally balanced within its category.");
  }
  
  return recommendations;
};

// Get alternative food suggestions
export const getHealthierAlternatives = (foodItem: FoodItem): FoodItem[] => {
  // This would normally query the database or API for healthier alternatives
  // Returning mock data for now
  
  const mockAlternatives: FoodItem[] = [
    {
      id: 'alt_1',
      name: 'Homemade Version of ' + foodItem.name,
      calories: Math.floor(foodItem.calories * 0.7),
      nutrients: {
        protein: foodItem.nutrients.protein,
        carbs: Math.floor(foodItem.nutrients.carbs * 0.8),
        fat: Math.floor(foodItem.nutrients.fat * 0.6),
        sodium: foodItem.nutrients.sodium ? Math.floor(foodItem.nutrients.sodium * 0.5) : undefined,
        sugar: foodItem.nutrients.sugar ? Math.floor(foodItem.nutrients.sugar * 0.3) : undefined
      },
      health_score: 8,
      source: 'openfoodfacts'
    },
    {
      id: 'alt_2',
      name: 'Organic ' + foodItem.name,
      calories: Math.floor(foodItem.calories * 0.9),
      nutrients: {
        protein: Math.floor(foodItem.nutrients.protein * 1.1),
        carbs: foodItem.nutrients.carbs,
        fat: Math.floor(foodItem.nutrients.fat * 0.8),
        sodium: foodItem.nutrients.sodium ? Math.floor(foodItem.nutrients.sodium * 0.7) : undefined,
        sugar: foodItem.nutrients.sugar ? Math.floor(foodItem.nutrients.sugar * 0.5) : undefined
      },
      health_score: 7,
      source: 'edamam'
    }
  ];
  
  return mockAlternatives;
};

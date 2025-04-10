// src/services/foodApiService.ts

// API Keys from environment variables with fallbacks
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID || '64b66d05';
const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY || '7598859c968254ec27441ad9ed9197d3';
const CALORIENINJAS_API_KEY = import.meta.env.VITE_CALORIENINJAS_API_KEY || 'Rl0Rl5Hs9Hn9Yx9Nt9Ht9A==Ck9Nt9Ht9A==Ck9Nt9Ht9A==';

// Backup API keys in case the primary ones reach their rate limits
const EDAMAM_BACKUP_APP_IDS = [
  '64b66d05',
  '83bf3c12',
  'a742d2c9'
];

const EDAMAM_BACKUP_APP_KEYS = [
  '7598859c968254ec27441ad9ed9197d3',
  'f5982d5d0f3c1c92a372f0c928617b56',
  '0c3e9d7f9546b5be3b6405f0c9903f25'
];

// API Base URLs
const CALORIENINJAS_BASE_URL = 'https://api.calorieninjas.com/v1';
const OPENFOODFACTS_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

// Track API key usage to rotate through them
let currentApiKeyIndex = 0;

// API Status tracking
interface ApiStatus {
  name: string;
  isWorking: boolean;
  lastChecked: number;
  errorCount: number;
}

const apiStatus: Record<string, ApiStatus> = {
  edamam: { name: 'Edamam', isWorking: true, lastChecked: 0, errorCount: 0 },
  calorieninjas: { name: 'CalorieNinjas', isWorking: true, lastChecked: 0, errorCount: 0 },
  openfoodfacts: { name: 'OpenFoodFacts', isWorking: true, lastChecked: 0, errorCount: 0 },
  mongodb: { name: 'MongoDB', isWorking: true, lastChecked: 0, errorCount: 0 }
};

// Log API key status for debugging
console.log('Edamam API Key loaded:', EDAMAM_APP_ID ? 'Available' : 'Missing');
console.log('CalorieNinjas API Key loaded:', CALORIENINJAS_API_KEY !== 'YOUR_API_KEY' ? 'Available' : 'Missing');
console.log('Backup API Keys available:', EDAMAM_BACKUP_APP_IDS.length);

// Food item interface
export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  nutritionScore: 'green' | 'yellow' | 'red';
  brand?: string;
  image?: string;
  nutrients?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  source?: string;
  apiSource?: string; // Which API the result came from
  details?: {
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    sugar: number;
    calories?: number;
    ingredients: string[];
    allergens: string[];
    additives: string[];
  };
  tracked?: boolean; // Whether the food has been added to the tracker
}

// Function to check API status and update tracking
const checkApiStatus = (api: string, isWorking: boolean, error?: any) => {
  if (!apiStatus[api]) return;

  apiStatus[api].lastChecked = Date.now();
  apiStatus[api].isWorking = isWorking;

  if (!isWorking) {
    apiStatus[api].errorCount++;
    console.error(`${apiStatus[api].name} API error:`, error);
  } else {
    apiStatus[api].errorCount = 0;
  }
};

// Get all API statuses
export const getApiStatus = (): Record<string, ApiStatus> => {
  return { ...apiStatus };
};

// Main search function that tries all APIs with fallback mechanism
export const searchFoods = async (query: string, preferredApi?: string): Promise<FoodItem[]> => {
  if (!query) return [];

  try {
    console.log(`Searching for: ${query}`);
    let results: FoodItem[] = [];

    // Define the order of APIs to try based on preference and status
    const apiOrder = determineApiOrder(preferredApi);

    // Try each API in order until we get results
    for (const api of apiOrder) {
      try {
        switch (api) {
          case 'mongodb':
            results = await searchMongoDB(query);
            break;
          case 'calorieninjas':
            results = await searchCalorieNinjas(query);
            break;
          case 'openfoodfacts':
            results = await searchOpenFoodFacts(query);
            break;
          case 'edamam':
            results = await searchEdamamWithFallback(query);
            break;
        }

        if (results.length > 0) {
          console.log(`Found ${results.length} results from ${apiStatus[api].name}`);
          checkApiStatus(api, true);
          return results.map(item => ({
            ...item,
            apiSource: apiStatus[api].name
          }));
        }
      } catch (error) {
        checkApiStatus(api, false, error);
      }
    }

    // If all APIs fail, return fallback data
    console.log('No results found from any API, using fallback data');
    return await getFallbackResults(query);
  } catch (error) {
    console.error('Error searching foods:', error);
    return await getFallbackResults(query);
  }
};

// Determine the order of APIs to try based on preference and status
const determineApiOrder = (preferredApi?: string): string[] => {
  const defaultOrder = ['mongodb', 'calorieninjas', 'openfoodfacts', 'edamam'];

  if (!preferredApi) return defaultOrder;

  // If preferred API is specified and working, try it first
  if (apiStatus[preferredApi]?.isWorking) {
    return [
      preferredApi,
      ...defaultOrder.filter(api => api !== preferredApi)
    ];
  }

  return defaultOrder;
};

// Search MongoDB
const searchMongoDB = async (query: string): Promise<FoodItem[]> => {
  try {
    // Import the searchProductsInMongoDB function
    const { searchProductsInMongoDB } = await import('./apiService');
    return await searchProductsInMongoDB(query);
  } catch (error) {
    console.error('MongoDB search failed:', error);
    throw error;
  }
};

// Search Edamam with fallback keys
const searchEdamamWithFallback = async (query: string): Promise<FoodItem[]> => {
  // Try with primary API key
  let results = await searchEdamam(query, EDAMAM_APP_ID, EDAMAM_APP_KEY);

  // If primary key fails or returns no results, try backup keys
  if (results.length === 0) {
    console.log('Primary API key returned no results, trying backup keys');

    // Try each backup key until we get results
    for (let i = 0; i < EDAMAM_BACKUP_APP_IDS.length; i++) {
      const backupId = EDAMAM_BACKUP_APP_IDS[i];
      const backupKey = EDAMAM_BACKUP_APP_KEYS[i];

      try {
        results = await searchEdamam(query, backupId, backupKey);
        if (results.length > 0) {
          console.log(`Got results using backup key ${i+1}`);
          break;
        }
      } catch (err) {
        console.error(`Backup key ${i+1} failed:`, err);
      }
    }
  }

  return results;
};

// Search CalorieNinjas API
const searchCalorieNinjas = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching CalorieNinjas for: ${query}`);

    const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
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
    console.log('CalorieNinjas response:', data);

    // Check if the API returned items in the expected format
    if (data && data.items && data.items.length > 0) {
      return transformCalorieNinjasResults(data.items);
    }
    // Handle the case where the API returns a different format
    else if (data && Array.isArray(data.items)) {
      return transformCalorieNinjasResults(data.items);
    }
    // Handle the case where the API returns a different format with no items property
    else if (data) {
      // Try to extract items from the response
      const items = data.items || [];
      return transformCalorieNinjasResults(items);
    }

    return [];
  } catch (error) {
    console.error('CalorieNinjas API error:', error);
    // Return empty array instead of throwing to allow fallback to other APIs
    return [];
  }
};

// Search OpenFoodFacts API
const searchOpenFoodFacts = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching OpenFoodFacts for: ${query}`);

    // Try multiple OpenFoodFacts API endpoints for better results
    const results = await Promise.allSettled([
      searchOpenFoodFactsV2(query),
      searchOpenFoodFactsV1(query)
    ]);

    // Check if any method succeeded
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        return result.value;
      }
    }

    // If all methods failed or returned empty results, return empty array
    return [];
  } catch (error) {
    console.error('OpenFoodFacts API error:', error);
    return []; // Return empty array instead of throwing to allow fallback to other APIs
  }
};

// Search OpenFoodFacts using V2 API
const searchOpenFoodFactsV2 = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching OpenFoodFacts V2 API for: ${query}`);

    // OpenFoodFacts doesn't require an API key
    const response = await fetch(
      `${OPENFOODFACTS_BASE_URL}/search?search_terms=${encodeURIComponent(query)}&fields=code,product_name,brands,nutriments,image_url,ingredients_text,allergens,additives_tags,nutriscore_grade&page_size=15`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'SafeBite/1.0 (contact@safebite.app)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts V2 API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return [];
    }

    // Transform OpenFoodFacts data to our format
    return transformOpenFoodFactsResults(data.products);
  } catch (error) {
    console.error('OpenFoodFacts V2 API error:', error);
    return [];
  }
};

// Search OpenFoodFacts using V1 API (fallback)
const searchOpenFoodFactsV1 = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching OpenFoodFacts V1 API for: ${query}`);

    // Use the older V1 API as fallback
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'SafeBite/1.0 (contact@safebite.app)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts V1 API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      return [];
    }

    // Transform OpenFoodFacts data to our format
    return transformOpenFoodFactsResults(data.products);
  } catch (error) {
    console.error('OpenFoodFacts V1 API error:', error);
    return [];
  }
};

// Function to search foods by barcode
export const searchByBarcode = async (barcode: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching for barcode: ${barcode}`);

    // Try multiple barcode search methods
    const results = await Promise.allSettled([
      searchBarcodeOpenFoodFactsV2(barcode),
      searchBarcodeOpenFoodFactsV1(barcode),
      searchBarcodeEdamam(barcode)
    ]);

    // Check if any method succeeded
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        return result.value;
      }
    }

    // If all methods failed, return empty array
    console.log('No results found for barcode from any source');
    return [];
  } catch (error) {
    console.error('Error searching by barcode:', error);
    return [];
  }
};

// Search barcode using OpenFoodFacts V2 API
const searchBarcodeOpenFoodFactsV2 = async (barcode: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching OpenFoodFacts V2 API for barcode: ${barcode}`);

    const response = await fetch(
      `${OPENFOODFACTS_BASE_URL}/product/${barcode}?fields=code,product_name,brands,nutriments,image_url,ingredients_text,allergens,additives_tags,nutriscore_grade`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'SafeBite/1.0 (contact@safebite.app)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts V2 API barcode error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.product) {
      return [];
    }

    // Transform the data to our format
    const results = transformOpenFoodFactsResults([data.product]);
    return results.map((item: FoodItem) => ({
      ...item,
      apiSource: 'OpenFoodFacts V2 (Barcode)'
    }));
  } catch (error) {
    console.error('OpenFoodFacts V2 barcode search failed:', error);
    return [];
  }
};

// Search barcode using OpenFoodFacts V1 API
const searchBarcodeOpenFoodFactsV1 = async (barcode: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching OpenFoodFacts V1 API for barcode: ${barcode}`);

    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'SafeBite/1.0 (contact@safebite.app)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts V1 API barcode error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.product || data.status !== 1) {
      return [];
    }

    // Transform the data to our format
    const results = transformOpenFoodFactsResults([data.product]);
    return results.map((item: FoodItem) => ({
      ...item,
      apiSource: 'OpenFoodFacts V1 (Barcode)'
    }));
  } catch (error) {
    console.error('OpenFoodFacts V1 barcode search failed:', error);
    return [];
  }
};

// Search barcode using Edamam API
const searchBarcodeEdamam = async (barcode: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching Edamam for barcode: ${barcode}`);

    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&upc=${barcode}`
    );

    if (!response.ok) {
      throw new Error(`Edamam API barcode error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.hints || data.hints.length === 0) {
      return [];
    }

    // Transform the data to our format
    const results = transformEdamamResults(data.hints);

    return results.map((item: FoodItem) => ({
      ...item,
      apiSource: 'Edamam (Barcode)'
    }));
  } catch (error) {
    console.error('Edamam barcode search failed:', error);
    return [];
  }
};

// Function to search foods by image using CalorieNinjas API
export const searchByImage = async (imageFile: File): Promise<FoodItem[]> => {
  try {
    console.log('Searching by image...');

    // Check if CalorieNinjas API key is available
    if (CALORIENINJAS_API_KEY === 'YOUR_API_KEY') {
      console.error('CalorieNinjas API key not configured');
      throw new Error('CalorieNinjas API key not configured');
    }

    // Create FormData to send the image
    const formData = new FormData();
    formData.append('file', imageFile);

    // Call the CalorieNinjas image text nutrition API
    try {
      const response = await fetch(`${CALORIENINJAS_BASE_URL}/imagetextnutrition`, {
        method: 'POST',
        headers: {
          'X-Api-Key': CALORIENINJAS_API_KEY
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`CalorieNinjas API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        // Transform the data to our format
        const results = transformCalorieNinjasResults(data.items);
        return results.map(item => ({
          ...item,
          apiSource: 'CalorieNinjas (Image)'
        }));
      }
    } catch (calorieNinjasError) {
      console.error('CalorieNinjas image search failed:', calorieNinjasError);
    }

    // Fallback to text-based search if image recognition fails
    // Extract a food name from the image file name
    const fileName = imageFile.name.toLowerCase();
    const foodKeywords = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, '').split(/[_\-\s]/);

    // Filter out common words and keep only potential food names
    const commonWords = ['image', 'photo', 'pic', 'img', 'food', 'scan'];
    const potentialFoodNames = foodKeywords.filter(word =>
      word.length > 2 && !commonWords.includes(word)
    );

    // Use the first potential food name or a default
    const searchQuery = potentialFoodNames.length > 0 ?
      potentialFoodNames[0] : 'food';

    console.log(`Image search fallback: searching for "${searchQuery}"`);

    // Search for the identified food
    const results = await searchFoods(searchQuery);

    return results.map(item => ({
      ...item,
      apiSource: 'Image Recognition (Fallback)'
    }));
  } catch (error) {
    console.error('Error searching by image:', error);
    return [];
  }
};

// Helper function to transform CalorieNinjas results
const transformCalorieNinjasResults = (items: any[]): FoodItem[] => {
  return items.map((item: any, index: number) => {
    // Calculate nutrition score based on nutrient values
    let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

    if (item.protein_g > 15 && (item.fiber_g > 3 || !item.fiber_g) && (item.sugar_g < 10 || !item.sugar_g)) {
      nutritionScore = 'green';
    } else if ((item.fat_total_g > 20 || !item.fat_total_g) || (item.sugar_g > 15 || !item.sugar_g)) {
      nutritionScore = 'red';
    }

    return {
      id: `calorieninjas-${Date.now()}-${index}`,
      name: item.name || 'Unknown Food',
      brand: '',
      calories: Math.round(item.calories) || 0,
      image: '', // CalorieNinjas doesn't provide images
      nutritionScore,
      nutrients: {
        protein: Math.round(item.protein_g) || 0,
        carbs: Math.round(item.carbohydrates_total_g) || 0,
        fat: Math.round(item.fat_total_g) || 0,
        fiber: Math.round(item.fiber_g) || 0,
        sugar: Math.round(item.sugar_g) || 0
      },
      details: {
        protein: Math.round(item.protein_g) || 0,
        carbs: Math.round(item.carbohydrates_total_g) || 0,
        fat: Math.round(item.fat_total_g) || 0,
        sodium: Math.round(item.sodium_mg) || 0,
        sugar: Math.round(item.sugar_g) || 0,
        calories: Math.round(item.calories) || 0,
        ingredients: [],
        allergens: [],
        additives: []
      },
      servingSizes: [{
        label: 'Serving',
        weight: item.serving_size_g || 100
      }],
      source: 'CalorieNinjas'
    };
  });
};

// Helper function to transform OpenFoodFacts results
const transformOpenFoodFactsResults = (products: any[]): FoodItem[] => {
  return products.map((product: any) => {
    const nutrients = product.nutriments || {};

    // Extract ingredients if available
    const ingredients = product.ingredients_text ?
      product.ingredients_text.split(', ') : [];

    // Extract allergens
    const allergens = product.allergens ?
      product.allergens.split(',').map((a: string) => a.trim()) : [];

    // Extract additives
    const additives = product.additives_tags ?
      product.additives_tags.map((a: string) => a.replace('en:', '')) : [];

    // Determine nutrition score
    let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';
    if (product.nutriscore_grade) {
      switch (product.nutriscore_grade.toLowerCase()) {
        case 'a':
        case 'b':
          nutritionScore = 'green';
          break;
        case 'c':
          nutritionScore = 'yellow';
          break;
        case 'd':
        case 'e':
          nutritionScore = 'red';
          break;
      }
    }

    return {
      id: `openfoodfacts-${product.code}`,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      calories: Math.round(nutrients.energy_kcal) || 0,
      image: product.image_url || '',
      nutritionScore,
      nutrients: {
        protein: Math.round(nutrients.proteins) || 0,
        carbs: Math.round(nutrients.carbohydrates) || 0,
        fat: Math.round(nutrients.fat) || 0,
        fiber: Math.round(nutrients.fiber) || 0,
        sugar: Math.round(nutrients.sugars) || 0
      },
      details: {
        protein: Math.round(nutrients.proteins) || 0,
        carbs: Math.round(nutrients.carbohydrates) || 0,
        fat: Math.round(nutrients.fat) || 0,
        sodium: Math.round(nutrients.sodium) || 0,
        sugar: Math.round(nutrients.sugars) || 0,
        calories: Math.round(nutrients.energy_kcal) || 0,
        ingredients: ingredients,
        allergens: allergens,
        additives: additives
      },
      source: 'OpenFoodFacts'
    };
  });
};

// Edamam API search with specific app ID and key
const searchEdamam = async (query: string, appId: string, appKey: string): Promise<FoodItem[]> => {
  try {
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(query)}&nutrition-type=logging`
    );

    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.hints || data.hints.length === 0) {
      return [];
    }

    // Transform Edamam data to our format
    return transformEdamamResults(data.hints);
  } catch (error) {
    console.error('Edamam API error:', error);
    return [];
  }
};

// Helper function to transform Edamam results
const transformEdamamResults = (hints: any[]): FoodItem[] => {
  return hints.slice(0, 10).map((hint: any) => {
    const food = hint.food;
    const nutrients = food.nutrients || {};
    const measures = hint.measures || [];

    // Get serving sizes
    const servingSizes = measures.map((measure: any) => ({
      label: measure.label,
      weight: measure.weight
    }));

// Helper function to transform CalorieNinjas results
const transformCalorieNinjasResults = (items: any[]): FoodItem[] => {
  return items.map((item: any) => {
    // Calculate nutrition score based on nutrient values
    let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

    if (item.protein_g > 15 && (item.fiber_g > 3 || !item.fiber_g) && (item.sugar_g < 10 || !item.sugar_g)) {
      nutritionScore = 'green';
    } else if ((item.fat_total_g > 20 || !item.fat_total_g) || (item.sugar_g > 15 || !item.sugar_g)) {
      nutritionScore = 'red';
    }

    return {
      id: `calorieninjas-${item.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      name: item.name || 'Unknown Food',
      brand: '',
      calories: Math.round(item.calories) || 0,
      image: '', // CalorieNinjas doesn't provide images
      nutritionScore,
      nutrients: {
        protein: Math.round(item.protein_g) || 0,
        carbs: Math.round(item.carbohydrates_total_g) || 0,
        fat: Math.round(item.fat_total_g) || 0,
        fiber: Math.round(item.fiber_g) || 0,
        sugar: Math.round(item.sugar_g) || 0
      },
      details: {
        protein: Math.round(item.protein_g) || 0,
        carbs: Math.round(item.carbohydrates_total_g) || 0,
        fat: Math.round(item.fat_total_g) || 0,
        sodium: Math.round(item.sodium_mg) || 0,
        sugar: Math.round(item.sugar_g) || 0,
        calories: Math.round(item.calories) || 0,
        ingredients: [],
        allergens: [],
        additives: []
      },
      servingSizes: [{
        label: 'Serving',
        weight: item.serving_size_g || 100
      }],
      source: 'CalorieNinjas'
    };
  });
};

    // Calculate nutrition score based on nutrient values
    let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

    if (nutrients.PROCNT > 15 && (nutrients.FIBTG > 3 || !nutrients.FIBTG) && (nutrients.SUGAR < 10 || !nutrients.SUGAR)) {
      nutritionScore = 'green';
    } else if ((nutrients.FAT > 20 || !nutrients.FAT) || (nutrients.SUGAR > 15 || !nutrients.SUGAR)) {
      nutritionScore = 'red';
    }

    // Extract ingredients if available
    const ingredients = food.foodContentsLabel ?
      food.foodContentsLabel.split(', ') :
      [];

    // Extract potential allergens (simplified approach)
    const allergens: string[] = [];
    const commonAllergens = ['milk', 'egg', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soy', 'gluten'];

    ingredients.forEach((ingredient: string) => {
      commonAllergens.forEach(allergen => {
        if (ingredient.toLowerCase().includes(allergen.toLowerCase()) && !allergens.includes(allergen)) {
          allergens.push(allergen);
        }
      });
    });

    return {
      id: `edamam-${food.foodId}`,
      name: food.label,
      brand: food.brand || '',
      calories: Math.round(nutrients.ENERC_KCAL) || 0,
      image: food.image,
      nutritionScore,
      nutrients: {
        protein: Math.round(nutrients.PROCNT) || 0,
        carbs: Math.round(nutrients.CHOCDF) || 0,
        fat: Math.round(nutrients.FAT) || 0,
        fiber: Math.round(nutrients.FIBTG) || 0,
        sugar: Math.round(nutrients.SUGAR) || 0
      },
      details: {
        protein: Math.round(nutrients.PROCNT) || 0,
        carbs: Math.round(nutrients.CHOCDF) || 0,
        fat: Math.round(nutrients.FAT) || 0,
        sodium: Math.round(nutrients.NA) || 0,
        sugar: Math.round(nutrients.SUGAR) || 0,
        calories: Math.round(nutrients.ENERC_KCAL) || 0,
        ingredients: ingredients,
        allergens: allergens,
        additives: []
      },
      servingSizes: servingSizes,
      source: 'Edamam'
    };
  });
};



// Fallback to MongoDB when APIs fail
const getFallbackResults = async (query: string): Promise<FoodItem[]> => {
  try {
    // Import the searchProductsInMongoDB function
    const { searchProductsInMongoDB } = await import('./apiService');

    // Try to get results from MongoDB
    const mongoResults = await searchProductsInMongoDB(query);

    if (mongoResults.length > 0) {
      return mongoResults;
    }

    // If no results from MongoDB, return empty array
    return [];
  } catch (error) {
    console.error('Error getting fallback results from MongoDB:', error);
    return [];
  }
};

// Function to save search history
export const saveSearchHistory = (query: string): string => {
  try {
    const historyId = `search-${Date.now()}`;
    const historyItem = {
      id: historyId,
      query,
      timestamp: Date.now(),
      isFavorite: false,
      tags: []
    };

    // Get existing history
    const historyJson = localStorage.getItem('foodSearchHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Add new item to history
    history.unshift(historyItem);

    // Keep only the last 20 items
    const trimmedHistory = history.slice(0, 20);

    // Save back to localStorage
    localStorage.setItem('foodSearchHistory', JSON.stringify(trimmedHistory));

    return historyId;
  } catch (error) {
    console.error('Error saving search history:', error);
    return '';
  }
};

// Function to get search history
export const getSearchHistory = (): any[] => {
  try {
    const historyJson = localStorage.getItem('foodSearchHistory');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

// Function to toggle favorite status
export const toggleFavorite = (id: string): boolean => {
  try {
    const historyJson = localStorage.getItem('foodSearchHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    const updatedHistory = history.map((item: any) => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });

    localStorage.setItem('foodSearchHistory', JSON.stringify(updatedHistory));

    // Return the new favorite status
    const item = updatedHistory.find((item: any) => item.id === id);
    return item ? item.isFavorite : false;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }
};

// Function to add tag to search history item
export const addTagToSearch = (id: string, tag: string): boolean => {
  try {
    const historyJson = localStorage.getItem('foodSearchHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    const updatedHistory = history.map((item: any) => {
      if (item.id === id) {
        const tags = item.tags || [];
        if (!tags.includes(tag)) {
          return { ...item, tags: [...tags, tag] };
        }
      }
      return item;
    });

    localStorage.setItem('foodSearchHistory', JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error adding tag:', error);
    return false;
  }
};

// Function to remove tag from search history item
export const removeTagFromSearch = (id: string, tag: string): boolean => {
  try {
    const historyJson = localStorage.getItem('foodSearchHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    const updatedHistory = history.map((item: any) => {
      if (item.id === id && item.tags) {
        return { ...item, tags: item.tags.filter((t: string) => t !== tag) };
      }
      return item;
    });

    localStorage.setItem('foodSearchHistory', JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error removing tag:', error);
    return false;
  }
};

// Function to remove search history item
export const removeSearchHistoryItem = (id: string): boolean => {
  try {
    const historyJson = localStorage.getItem('foodSearchHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    const updatedHistory = history.filter((item: any) => item.id !== id);

    localStorage.setItem('foodSearchHistory', JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error('Error removing search history item:', error);
    return false;
  }
};
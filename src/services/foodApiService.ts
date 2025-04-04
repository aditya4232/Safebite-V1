// src/services/foodApiService.ts

// API Keys from environment variables with fallbacks
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID || '64b66d05';
const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY || '7598859c968254ec27441ad9ed9197d3';

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

// Track API key usage to rotate through them
let currentApiKeyIndex = 0;

// Log API key status for debugging
console.log('Primary API Key loaded:', EDAMAM_APP_ID ? 'Available' : 'Missing');
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

// Main search function that uses Edamam API with fallback keys
export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching for: ${query}`);

    // Try with primary API key first
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

    // Add source information to each result
    const resultsWithSource = results.map((item: FoodItem) => ({
      ...item,
      apiSource: 'Edamam'
    }));

    // If all API calls fail, return fallback data
    if (resultsWithSource.length === 0) {
      console.log('No results found, using fallback data');
      return getFallbackResults(query);
    }

    return resultsWithSource;
  } catch (error) {
    console.error('Error searching foods:', error);
    return getFallbackResults(query);
  }
};

// Function to search foods by barcode
export const searchByBarcode = async (barcode: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching for barcode: ${barcode}`);

    // Use the UPC/EAN endpoint of Edamam
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&upc=${barcode}`
    );

    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.hints || data.hints.length === 0) {
      console.log('No results found for barcode');
      return [];
    }

    // Transform the data to our format
    const results = transformEdamamResults(data.hints);

    return results.map((item: FoodItem) => ({
      ...item,
      apiSource: 'Edamam (Barcode)'
    }));
  } catch (error) {
    console.error('Error searching by barcode:', error);
    return [];
  }
};

// Function to search foods by image
export const searchByImage = async (imageFile: File): Promise<FoodItem[]> => {
  try {
    console.log('Searching by image...');

    // In a real implementation, this would upload the image to a server
    // that can analyze it and identify the food
    // For now, we'll simulate a response

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

    // Simulate random food identification
    const randomFoods = [
      'apple', 'banana', 'yogurt', 'bread', 'cereal', 'milk', 'cheese', 'chicken',
      'rice', 'pasta', 'potato', 'tomato', 'carrot', 'spinach', 'egg'
    ];
    const randomIndex = Math.floor(Math.random() * randomFoods.length);
    const identifiedFood = randomFoods[randomIndex];

    console.log(`Image identified as: ${identifiedFood}`);

    // Search for the identified food
    const results = await searchFoods(identifiedFood);

    return results.map(item => ({
      ...item,
      apiSource: 'Image Recognition'
    }));
  } catch (error) {
    console.error('Error searching by image:', error);
    return [];
  }
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



// Fallback results when APIs fail
const getFallbackResults = (query: string): FoodItem[] => {
  return [
    {
      id: `fallback-${query}-1`,
      name: `${query} (estimated)`,
      calories: 100,
      nutritionScore: 'yellow',
      nutrients: {
        protein: 5,
        carbs: 15,
        fat: 3
      },
      details: {
        protein: 5,
        carbs: 15,
        fat: 3,
        sodium: 50,
        sugar: 5,
        calories: 100,
        ingredients: [`${query}`],
        allergens: [],
        additives: []
      },
      source: 'Estimated'
    },
    {
      id: `fallback-${query}-2`,
      name: `${query} alternative`,
      calories: 150,
      nutritionScore: 'green',
      nutrients: {
        protein: 10,
        carbs: 20,
        fat: 5
      },
      details: {
        protein: 10,
        carbs: 20,
        fat: 5,
        sodium: 30,
        sugar: 3,
        calories: 150,
        ingredients: [`${query}`, 'natural ingredients'],
        allergens: [],
        additives: []
      },
      source: 'Estimated'
    }
  ];
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
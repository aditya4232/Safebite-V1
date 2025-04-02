// src/services/foodApiService.ts

// API Keys from environment variables
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID || '64b66d05';
const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY || '7598859c968254ec27441ad9ed9197d3';
const CALORIENINJAS_API_KEY = import.meta.env.VITE_CALORIENINJAS_API_KEY || 'xxtcYPKPQyJ4NascI0BlQZNMmleexcaUMxrIPOAJ';
const FATSECRET_CONSUMER_KEY = import.meta.env.VITE_FATSECRET_CONSUMER_KEY || 'e183372840d64335a3541530080e4303';

// Log API key status for debugging
console.log('API Keys loaded:', {
  EDAMAM: EDAMAM_APP_ID ? 'Available' : 'Missing',
  CALORIENINJAS: CALORIENINJAS_API_KEY ? 'Available' : 'Missing',
  FATSECRET: FATSECRET_CONSUMER_KEY ? 'Available' : 'Missing'
});

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

// Main search function that aggregates results from all APIs
export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  try {
    console.log(`Searching for: ${query}`);

    // Make parallel API calls with better error handling
    const [edamamResults, calorieNinjasResults, fatSecretResults] = await Promise.all([
      searchEdamam(query).catch((err) => {
        console.error('Edamam search error:', err);
        return [];
      }),
      searchCalorieNinjas(query).catch((err) => {
        console.error('CalorieNinjas search error:', err);
        return [];
      }),
      searchFatSecret(query).catch((err) => {
        console.error('FatSecret search error:', err);
        return [];
      })
    ]);

    console.log('Search results:', {
      edamam: edamamResults.length,
      calorieNinjas: calorieNinjasResults.length,
      fatSecret: fatSecretResults.length
    });

    // Add source information to each result
    const edamamWithSource = edamamResults.map((item: FoodItem) => ({
      ...item,
      apiSource: 'Edamam'
    }));

    const calorieNinjasWithSource = calorieNinjasResults.map((item: FoodItem) => ({
      ...item,
      apiSource: 'CalorieNinjas'
    }));

    const fatSecretWithSource = fatSecretResults.map((item: FoodItem) => ({
      ...item,
      apiSource: 'FatSecret'
    }));

    // Combine results
    const allResults = [...edamamWithSource, ...calorieNinjasWithSource, ...fatSecretWithSource];

    // If all APIs fail, return fallback data
    if (allResults.length === 0) {
      console.log('No results found, using fallback data');
      return getFallbackResults(query);
    }

    return allResults;
  } catch (error) {
    console.error('Error searching foods:', error);
    return getFallbackResults(query);
  }
};

// Edamam API search
const searchEdamam = async (query: string): Promise<FoodItem[]> => {
  try {
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}&nutrition-type=logging`
    );

    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Edamam data to our format
    return data.hints.slice(0, 5).map((hint: any) => {
      const food = hint.food;
      const nutrients = food.nutrients || {};

      // Calculate nutrition score based on nutrient values
      let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

      if (nutrients.PROCNT > 15 && nutrients.FIBTG > 3 && nutrients.SUGAR < 10) {
        nutritionScore = 'green';
      } else if (nutrients.FAT > 20 || nutrients.SUGAR > 15) {
        nutritionScore = 'red';
      }

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
        source: 'Edamam'
      };
    });
  } catch (error) {
    console.error('Edamam API error:', error);
    return [];
  }
};

// CalorieNinjas API search
const searchCalorieNinjas = async (query: string): Promise<FoodItem[]> => {
  try {
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'X-Api-Key': CALORIENINJAS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CalorieNinjas API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform CalorieNinjas data to our format
    return data.items.slice(0, 5).map((item: any, index: number) => {
      // Calculate nutrition score
      let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

      if (item.protein_g > 10 && item.fiber_g > 2 && item.sugar_g < 10) {
        nutritionScore = 'green';
      } else if (item.fat_total_g > 15 || item.sugar_g > 15) {
        nutritionScore = 'red';
      }

      return {
        id: `calorieninjas-${query}-${index}`,
        name: item.name,
        calories: Math.round(item.calories),
        nutritionScore,
        nutrients: {
          protein: Math.round(item.protein_g),
          carbs: Math.round(item.carbohydrates_total_g),
          fat: Math.round(item.fat_total_g),
          fiber: Math.round(item.fiber_g),
          sugar: Math.round(item.sugar_g)
        },
        source: 'CalorieNinjas'
      };
    });
  } catch (error) {
    console.error('CalorieNinjas API error:', error);
    return [];
  }
};

// FatSecret API search (simplified OAuth implementation)
const searchFatSecret = async (query: string): Promise<FoodItem[]> => {
  try {
    // Note: A proper implementation would require OAuth 1.0a
    // This is a simplified version that may not work without a proper OAuth library
    const response = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(query)}&format=json`,
      {
        headers: {
          'Authorization': `Bearer ${FATSECRET_CONSUMER_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`FatSecret API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform FatSecret data to our format
    if (!data.foods || !data.foods.food) {
      return [];
    }

    const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];

    return foods.slice(0, 5).map((food: any) => {
      // Parse nutrition data
      const description = food.food_description || '';
      const caloriesMatch = description.match(/Calories: (\d+)/);
      const proteinMatch = description.match(/Protein: ([\d.]+)g/);
      const carbsMatch = description.match(/Carbs: ([\d.]+)g/);
      const fatMatch = description.match(/Fat: ([\d.]+)g/);

      const calories = caloriesMatch ? parseInt(caloriesMatch[1]) : 0;
      const protein = proteinMatch ? parseFloat(proteinMatch[1]) : 0;
      const carbs = carbsMatch ? parseFloat(carbsMatch[1]) : 0;
      const fat = fatMatch ? parseFloat(fatMatch[1]) : 0;

      // Calculate nutrition score
      let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

      if (protein > 15 && carbs < 30 && fat < 10) {
        nutritionScore = 'green';
      } else if (fat > 20 || carbs > 50) {
        nutritionScore = 'red';
      }

      return {
        id: `fatsecret-${food.food_id}`,
        name: food.food_name,
        brand: food.brand_name || '',
        calories,
        nutritionScore,
        nutrients: {
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat)
        },
        source: 'FatSecret'
      };
    });
  } catch (error) {
    console.error('FatSecret API error:', error);
    return [];
  }
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
      source: 'Estimated'
    }
  ];
};
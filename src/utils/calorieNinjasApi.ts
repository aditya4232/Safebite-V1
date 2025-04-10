// CalorieNinjas API key
export const CALORIE_NINJAS_API_KEY = 'c2bd47af-11fb-45dd-9cac-c3aa89289d75';

// API base URL
export const CALORIE_NINJAS_API_URL = 'https://api.calorieninjas.com/v1';

/**
 * Search for recipes using CalorieNinjas API
 * @param query Search query
 * @returns Promise with recipe data
 */
export const searchRecipes = async (query: string): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${CALORIE_NINJAS_API_URL}/recipe?query=${encodeURIComponent(query)}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'X-Api-Key': CALORIE_NINJAS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CalorieNinjas API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

/**
 * Get nutrition information from text using CalorieNinjas API
 * @param text Food text to analyze
 * @returns Promise with nutrition data
 */
export const getNutritionFromText = async (text: string): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${CALORIE_NINJAS_API_URL}/nutrition?query=${encodeURIComponent(text)}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'X-Api-Key': CALORIE_NINJAS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CalorieNinjas API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting nutrition from text:', error);
    throw error;
  }
};

/**
 * Get nutrition information from an image using CalorieNinjas API
 * @param imageFile Image file to analyze
 * @returns Promise with nutrition data
 */
export const getNutritionFromImage = async (imageFile: File): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const formData = new FormData();
    formData.append('media', imageFile);
    
    const response = await fetch(`${CALORIE_NINJAS_API_URL}/imagetextnutrition`, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'X-Api-Key': CALORIE_NINJAS_API_KEY
      },
      body: formData
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`CalorieNinjas API returned status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting nutrition from image:', error);
    throw error;
  }
};

export default {
  CALORIE_NINJAS_API_KEY,
  CALORIE_NINJAS_API_URL,
  searchRecipes,
  getNutritionFromText,
  getNutritionFromImage
};

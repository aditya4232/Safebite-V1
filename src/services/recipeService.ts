// src/services/recipeService.ts
import { searchProductsInMongoDB } from './apiService';

export interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  servings: number;
  cookTime: number;
  prepTime?: number;
  healthLabels: string[];
  source: string;
  ingredients?: string[];
  instructions?: string[];
  nutrients?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sodium?: number;
  };
}

// Convert MongoDB product to Recipe format
const convertProductToRecipe = (product: any): Recipe => {
  return {
    id: product.id || `mongodb-${product._id}`,
    title: product.name,
    image: product.image || `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.name)}`,
    calories: product.calories || 0,
    servings: product.servings || 4,
    cookTime: product.cookTime || product.cook_time || 30,
    prepTime: product.prepTime || product.prep_time,
    healthLabels: product.healthLabels || product.health_labels || [],
    source: 'MongoDB',
    ingredients: product.ingredients || [],
    instructions: product.instructions || [],
    nutrients: {
      protein: product.nutrients?.protein || 0,
      carbs: product.nutrients?.carbs || 0,
      fat: product.nutrients?.fat || 0,
      fiber: product.nutrients?.fiber,
      sodium: product.nutrients?.sodium
    }
  };
};

// Search recipes from MongoDB
export const searchRecipesFromMongoDB = async (query: string): Promise<Recipe[]> => {
  try {
    console.log('Searching recipes from MongoDB:', query);

    // Use the existing MongoDB search function with recipe-specific terms
    const recipeQuery = `${query} recipe`;
    const products = await searchProductsInMongoDB(recipeQuery);

    // Also search with the original query as fallback
    let allProducts = [...products];
    if (query.toLowerCase().indexOf('recipe') === -1) {
      const regularProducts = await searchProductsInMongoDB(query);
      allProducts = [...products, ...regularProducts];
    }

    // Filter for items that are likely recipes (have ingredients or instructions)
    const recipeProducts = allProducts.filter(product =>
      (product.details?.ingredients && product.details.ingredients.length > 0) ||
      product.category?.toLowerCase().includes('recipe') ||
      product.name?.toLowerCase().includes('recipe') ||
      // Also include food items that might be recipe ingredients
      (query.toLowerCase().includes('recipe') && product.details?.ingredients)
    );

    // Remove duplicates based on ID
    const uniqueRecipes = recipeProducts.filter((product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
    );

    // Convert to Recipe format
    return uniqueRecipes.map(product => {
      // Generate cooking instructions if not available
      let instructions = product.details?.instructions || [];
      if (instructions.length === 0 && product.details?.ingredients && product.details.ingredients.length > 0) {
        instructions = generateBasicInstructions(product.name, product.details.ingredients);
      }

      return {
        id: product.id,
        title: product.name,
        image: product.image || `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.name + ' food')}`,
        calories: product.calories || 0,
        servings: product.servings || 4,
        cookTime: product.cookTime || product.cook_time || 30,
        prepTime: product.prepTime || product.prep_time || 15,
        healthLabels: generateHealthLabels(product),
        source: product.source || 'MongoDB',
        ingredients: product.details?.ingredients || [],
        instructions: instructions,
        nutrients: {
          protein: product.nutrients?.protein || 0,
          carbs: product.nutrients?.carbs || 0,
          fat: product.nutrients?.fat || 0,
          fiber: product.nutrients?.fiber || 0,
          sodium: product.details?.sodium || 0
        }
      };
    });
  } catch (error) {
    console.error('Error searching recipes from MongoDB:', error);
    return [];
  }
};

// Generate health labels based on product data
const generateHealthLabels = (product: any): string[] => {
  const labels: string[] = [];

  // Add label based on nutrition score
  if (product.nutritionScore === 'green') {
    labels.push('Healthy');
  } else if (product.nutritionScore === 'red') {
    labels.push('High-Calorie');
  } else {
    labels.push('Balanced');
  }

  // Add more labels based on nutrients
  if (product.nutrients?.protein > 15) {
    labels.push('High-Protein');
  }

  if (product.nutrients?.fiber > 5) {
    labels.push('High-Fiber');
  }

  if (product.nutrients?.fat < 5) {
    labels.push('Low-Fat');
  }

  // Check for vegetarian/vegan based on ingredients
  if (product.details?.ingredients) {
    const ingredients = product.details.ingredients.join(' ').toLowerCase();
    const meatTerms = ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb'];
    const dairyTerms = ['milk', 'cheese', 'yogurt', 'cream', 'butter'];

    if (!meatTerms.some(term => ingredients.includes(term))) {
      labels.push('Vegetarian');

      if (!dairyTerms.some(term => ingredients.includes(term))) {
        labels.push('Vegan');
      }
    }
  }

  return labels;
};

// Note: The detailed generateBasicInstructions function is defined later in this file

// Get Edamam API keys from environment variables
// Recipe Search API
const EDAMAM_RECIPE_APP_ID = import.meta.env.VITE_EDAMAM_RECIPE_APP_ID || 'a522a439';
const EDAMAM_RECIPE_APP_KEY = import.meta.env.VITE_EDAMAM_RECIPE_APP_KEY || '636a3e9b2dd910c9b39f42bfdcbcf61a';

// Food Database API
const EDAMAM_FOOD_APP_ID = import.meta.env.VITE_EDAMAM_FOOD_APP_ID || '07d50733';
const EDAMAM_FOOD_APP_KEY = import.meta.env.VITE_EDAMAM_FOOD_APP_KEY || '80fcb49b500737827a9a23f7049653b9';

// Get real recipes from MongoDB or API
export const getRecipes = async (query: string): Promise<Recipe[]> => {
  try {
    console.log('Getting recipes for query:', query);

    // Try Edamam API first since it's more reliable
    try {
      const edamamRecipes = await searchRecipesFromEdamam(query);
      console.log(`Edamam returned ${edamamRecipes.length} recipes`);

      if (edamamRecipes.length > 0) {
        return edamamRecipes;
      }
    } catch (edamamError) {
      console.error('Edamam search failed:', edamamError);
    }

    // If Edamam fails or returns no results, try MongoDB
    try {
      const mongoRecipes = await searchRecipesFromMongoDB(query);
      console.log(`MongoDB returned ${mongoRecipes.length} recipes`);

      if (mongoRecipes.length > 0) {
        return mongoRecipes;
      }
    } catch (mongoError) {
      console.error('MongoDB search failed:', mongoError);
    }

    // If both sources fail, try a more generic search with Edamam
    if (query.includes(' ')) {
      const simpleQuery = query.split(' ')[0]; // Use just the first word
      console.log(`Trying simplified query: ${simpleQuery}`);

      try {
        const simpleRecipes = await searchRecipesFromEdamam(simpleQuery);
        console.log(`Simplified query returned ${simpleRecipes.length} recipes`);

        if (simpleRecipes.length > 0) {
          return simpleRecipes;
        }
      } catch (simpleError) {
        console.error('Simplified query search failed:', simpleError);
      }
    }

    // If all attempts fail, return empty array
    console.log('No recipes found for query:', query);
    return [];
  } catch (error) {
    console.error('Error getting recipes:', error);
    return [];
  }
};

// Search recipes from Edamam API
const searchRecipesFromEdamam = async (query: string): Promise<Recipe[]> => {
  try {
    console.log('Searching recipes from Edamam:', query);

    // Try multiple Edamam API endpoints for better results
    const results = await Promise.allSettled([
      searchEdamamRecipeAPI(query),
      searchEdamamFoodAPI(query)
    ]);

    // Combine all successful results
    let allRecipes: Recipe[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allRecipes = [...allRecipes, ...result.value];
      }
    }

    return allRecipes;
  } catch (error) {
    console.error('Error searching recipes from Edamam:', error);
    return [];
  }
};

// Search Edamam Recipe API
const searchEdamamRecipeAPI = async (query: string): Promise<Recipe[]> => {
  try {
    console.log('Searching Edamam Recipe API:', query);

    // Use the correct API endpoint and parameters for Edamam API v2
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(query)}&app_id=${EDAMAM_RECIPE_APP_ID}&app_key=${EDAMAM_RECIPE_APP_KEY}`;
    console.log('Edamam Recipe API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Edamam Recipe API error: ${response.status}`);
      throw new Error(`Edamam Recipe API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.hits || data.hits.length === 0) {
      return [];
    }

    // Transform Edamam data to our Recipe format
    return data.hits.map((hit: any) => {
      const recipe = hit.recipe;

      return {
        id: `edamam-${recipe.uri.split('#recipe_')[1]}`,
        title: recipe.label,
        image: recipe.image,
        calories: Math.round(recipe.calories / recipe.yield),
        servings: recipe.yield,
        cookTime: recipe.totalTime > 0 ? recipe.totalTime : 30,
        prepTime: Math.round(recipe.totalTime / 3) || 10,
        healthLabels: recipe.healthLabels || [],
        source: 'Edamam',
        ingredients: recipe.ingredientLines || [],
        instructions: generateBasicInstructions(recipe.label, recipe.ingredientLines || []), // Generate basic instructions
        nutrients: {
          protein: Math.round(recipe.totalNutrients?.PROCNT?.quantity / recipe.yield) || 0,
          carbs: Math.round(recipe.totalNutrients?.CHOCDF?.quantity / recipe.yield) || 0,
          fat: Math.round(recipe.totalNutrients?.FAT?.quantity / recipe.yield) || 0,
          fiber: Math.round(recipe.totalNutrients?.FIBTG?.quantity / recipe.yield) || 0,
          sodium: Math.round(recipe.totalNutrients?.NA?.quantity / recipe.yield) || 0
        }
      };
    });
  } catch (error) {
    console.error('Error searching Edamam Recipe API:', error);
    return [];
  }
};

// Search Edamam Food API and convert to recipes
const searchEdamamFoodAPI = async (query: string): Promise<Recipe[]> => {
  try {
    console.log('Searching Edamam Food API for recipes:', query);

    // Use the correct parameters for Edamam Food API
    const url = `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_FOOD_APP_ID}&app_key=${EDAMAM_FOOD_APP_KEY}&ingr=${encodeURIComponent(query)}`;
    console.log('Edamam Food API URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Edamam Food API error: ${response.status}`);
      throw new Error(`Edamam Food API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.hints || data.hints.length === 0) {
      return [];
    }

    // Transform food data to recipes (only for items that could be recipes)
    return data.hints
      .filter((hint: any) => {
        const food = hint.food;
        // Only include items that could be recipes (meals, dishes, etc.)
        return food.category === 'Generic meals' ||
               food.category === 'Generic dishes' ||
               food.foodContentsLabel; // Has ingredients list
      })
      .map((hint: any) => {
        const food = hint.food;
        const measures = hint.measures;
        const measure = measures.find((m: any) => m.label === 'Serving') || measures[0];

        // Extract ingredients from foodContentsLabel if available
        const ingredientsList = food.foodContentsLabel ?
          food.foodContentsLabel.split(';').map((item: string) => item.trim()) :
          [food.label];

        return {
          id: `edamam-food-${food.foodId}`,
          title: food.label,
          image: food.image || `https://source.unsplash.com/random/300x200/?${encodeURIComponent(food.label + ' food')}`,
          calories: Math.round(food.nutrients.ENERC_KCAL) || 0,
          servings: 4, // Default value
          cookTime: 30, // Default value
          prepTime: 15, // Default value
          healthLabels: food.healthLabels || [],
          source: 'Edamam Food',
          ingredients: ingredientsList,
          instructions: generateBasicInstructions(food.label, ingredientsList),
          nutrients: {
            protein: Math.round(food.nutrients.PROCNT) || 0,
            carbs: Math.round(food.nutrients.CHOCDF) || 0,
            fat: Math.round(food.nutrients.FAT) || 0,
            fiber: Math.round(food.nutrients.FIBTG) || 0,
            sodium: Math.round(food.nutrients.NA) || 0
          }
        };
      });
  } catch (error) {
    console.error('Error searching Edamam Food API for recipes:', error);
    return [];
  }
};

// Generate basic instructions for recipes that don't have them
const generateBasicInstructions = (title: string, ingredients: string[]): string[] => {
  // Basic template for cooking instructions
  const instructions = [
    `Prepare all ingredients for ${title}.`,
    'Wash and chop all vegetables and herbs as needed.',
  ];

  // Add ingredient-specific instructions
  const hasMeat = ingredients.some(ing =>
    /chicken|beef|pork|turkey|lamb|meat|fish|seafood|shrimp/i.test(ing));

  const hasVegetables = ingredients.some(ing =>
    /vegetable|carrot|onion|pepper|tomato|potato|broccoli|spinach|lettuce|kale|cabbage/i.test(ing));

  const hasDairy = ingredients.some(ing =>
    /milk|cheese|cream|yogurt|butter/i.test(ing));

  const hasGrains = ingredients.some(ing =>
    /rice|pasta|noodle|bread|flour|grain|wheat|oat|barley|quinoa/i.test(ing));

  // Add cooking steps based on ingredients
  if (hasMeat) {
    instructions.push(
      'Season the meat with salt and pepper.',
      'Cook the meat until it reaches the appropriate internal temperature.'
    );
  }

  if (hasVegetables) {
    instructions.push(
      'Sauté the vegetables until tender.'
    );
  }

  if (hasGrains) {
    instructions.push(
      'Cook the grains according to package instructions.'
    );
  }

  if (hasMeat && hasVegetables) {
    instructions.push(
      'Combine the cooked meat and vegetables.'
    );
  }

  if (hasDairy) {
    instructions.push(
      'Add dairy ingredients and stir until well incorporated.'
    );
  }

  // Add final steps
  instructions.push(
    'Adjust seasoning to taste.',
    `Serve ${title} hot and enjoy!`
  );

  return instructions;
};

// Remove duplicate recipes based on title similarity
const removeDuplicateRecipes = (recipes: Recipe[]): Recipe[] => {
  const uniqueRecipes: Recipe[] = [];
  const titles = new Set<string>();

  for (const recipe of recipes) {
    // Normalize title for comparison
    const normalizedTitle = recipe.title.toLowerCase().replace(/\s+/g, ' ').trim();

    // Check if we already have a similar title
    let isDuplicate = false;
    for (const title of titles) {
      if (title.includes(normalizedTitle) || normalizedTitle.includes(title)) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      titles.add(normalizedTitle);
      uniqueRecipes.push(recipe);
    }
  }

  return uniqueRecipes;
};

// This function is kept for backward compatibility but will be removed
export const getMockRecipes = async (query: string): Promise<Recipe[]> => {
  // Just call the real getRecipes function
  return await getRecipes(query);

};

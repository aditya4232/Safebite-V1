// Simple Gemini AI integration service for SafeBite
// This service provides AI-powered food analysis and recommendations

// Mock Gemini API response for development
// In production, this would call the actual Gemini API
const mockGeminiResponse = async (prompt: string): Promise<string> => {
  console.log('Gemini AI prompt:', prompt);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Extract food name from prompt if possible
  const foodNameMatch = prompt.match(/analyze\s+(.+?)(\s+for|$)/i);
  const foodName = foodNameMatch ? foodNameMatch[1] : 'food item';
  
  // Generate response based on prompt type
  if (prompt.includes('analyze') || prompt.includes('nutrition')) {
    return `
Nutritional Analysis for ${foodName}:

1. Nutritional Value:
${foodName} is generally considered a ${Math.random() > 0.5 ? 'healthy' : 'moderate'} food choice. It provides essential nutrients including vitamins, minerals, and macronutrients that contribute to overall health.

2. Health Benefits:
- Good source of vitamins and minerals
- Contains essential nutrients for body function
- Can be part of a balanced diet when consumed in appropriate portions

3. Potential Concerns:
- May be high in calories if consumed in large portions
- Some preparations may add unhealthy fats or sodium
- May contain allergens for some individuals

4. Recommendations:
- Consume in moderate portions as part of a balanced diet
- Pair with vegetables and whole grains for a more complete meal
- Choose whole food versions when possible to maximize nutritional benefits
- Consider your personal dietary needs and restrictions
`;
  } else if (prompt.includes('alternative') || prompt.includes('substitute')) {
    return `
Healthier Alternatives for ${foodName}:

1. Nutritious Substitutes:
- ${foodName} can be replaced with healthier versions that maintain similar taste profiles
- Look for options with less processing, lower sodium, and fewer additives
- Consider plant-based alternatives that provide similar textures and flavors

2. Specific Recommendations:
- Instead of regular ${foodName}, try the whole grain or low-sodium version
- Replace with homemade versions where you control the ingredients
- Consider naturally flavored alternatives without artificial additives

3. Benefits of Switching:
- Reduced calorie intake while maintaining satisfaction
- Increased fiber and nutrient content
- Better alignment with health goals
- Potential improvement in energy levels and digestion
`;
  } else {
    // Generic response
    return `
Food Information for ${foodName}:

${foodName} is a food item that can vary in nutritional content depending on preparation methods, ingredients, and portion sizes. For more specific information, try asking about nutrition, alternatives, or recipes.

To make the most informed choices:
- Read ingredient labels carefully
- Consider portion sizes
- Look for minimally processed options
- Balance your overall diet with a variety of foods
`;
  }
};

// Simple Gemini service with basic functions
const simpleGeminiService = {
  // Analyze a food item
  analyzeFood: async (foodName: string): Promise<string> => {
    try {
      const prompt = `Analyze ${foodName} for nutritional value, health benefits, and potential concerns.`;
      return await mockGeminiResponse(prompt);
    } catch (error) {
      console.error('Error analyzing food with Gemini:', error);
      throw error;
    }
  },
  
  // Get healthy alternatives for a food item
  getHealthyAlternatives: async (foodName: string): Promise<string> => {
    try {
      const prompt = `Suggest healthier alternatives or substitutes for ${foodName}.`;
      return await mockGeminiResponse(prompt);
    } catch (error) {
      console.error('Error getting alternatives with Gemini:', error);
      throw error;
    }
  },
  
  // Ask a custom question about food
  askFoodQuestion: async (question: string): Promise<string> => {
    try {
      return await mockGeminiResponse(question);
    } catch (error) {
      console.error('Error asking food question with Gemini:', error);
      throw error;
    }
  }
};

export default simpleGeminiService;

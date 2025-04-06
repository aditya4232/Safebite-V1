// src/services/geminiService.ts

// Google Gemini API key
const GOOGLE_GENAI_API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || '';

// Check if API key is available
const isGeminiAvailable = GOOGLE_GENAI_API_KEY !== '';

// Log API key status for debugging
console.log('Google Gemini API Key loaded:', isGeminiAvailable ? 'Available' : 'Missing');

// Interface for chat message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Function to get food recommendations based on query
export const getFoodRecommendations = async (query: string): Promise<string> => {
  if (!isGeminiAvailable) {
    console.error('Google Gemini API key not configured');
    return "I'm sorry, but the AI recommendation service is not available at the moment. Please try again later.";
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_GENAI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `As a nutrition expert, please provide 3 healthy food recommendations based on this query: "${query}". 
                For each recommendation, include a brief explanation of its nutritional benefits. 
                Format your response in a concise, easy-to-read way.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error getting food recommendations from Gemini:', error);
    return "I'm sorry, but I couldn't generate food recommendations at the moment. Please try again later.";
  }
};

// Function to chat with Gemini about food and nutrition
export const chatWithGemini = async (messages: ChatMessage[]): Promise<string> => {
  if (!isGeminiAvailable) {
    console.error('Google Gemini API key not configured');
    return "I'm sorry, but the AI chat service is not available at the moment. Please try again later.";
  }

  try {
    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_GENAI_API_KEY
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error chatting with Gemini:', error);
    return "I'm sorry, but I couldn't process your message at the moment. Please try again later.";
  }
};

// Function to analyze food item and provide health insights
export const analyzeFoodItem = async (foodItem: any): Promise<string> => {
  if (!isGeminiAvailable) {
    console.error('Google Gemini API key not configured');
    return "Food analysis service unavailable at the moment.";
  }

  try {
    // Create a detailed prompt about the food item
    const prompt = `
      As a nutrition expert, please analyze this food item and provide health insights:
      
      Name: ${foodItem.name}
      Brand: ${foodItem.brand || 'N/A'}
      Calories: ${foodItem.calories || 0} kcal
      
      Nutrients:
      - Protein: ${foodItem.nutrients?.protein || 0}g
      - Carbs: ${foodItem.nutrients?.carbs || 0}g
      - Fat: ${foodItem.nutrients?.fat || 0}g
      - Fiber: ${foodItem.nutrients?.fiber || 0}g
      - Sugar: ${foodItem.nutrients?.sugar || 0}g
      
      ${foodItem.details?.ingredients?.length > 0 ? 
        `Ingredients: ${foodItem.details.ingredients.join(', ')}` : ''}
      
      ${foodItem.details?.allergens?.length > 0 ? 
        `Allergens: ${foodItem.details.allergens.join(', ')}` : ''}
      
      ${foodItem.details?.additives?.length > 0 ? 
        `Additives: ${foodItem.details.additives.join(', ')}` : ''}
      
      Please provide:
      1. A brief nutritional assessment (is it healthy, balanced, etc.)
      2. Key health benefits
      3. Any potential concerns
      4. A suggestion for how this food could fit into a healthy diet
      
      Keep your response concise and easy to understand.
    `;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_GENAI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error analyzing food item with Gemini:', error);
    return "I'm sorry, but I couldn't analyze this food item at the moment. Please try again later.";
  }
};

// src/services/enhancedGeminiService.ts
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

// Google Gemini API key
const GOOGLE_GENAI_API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || '';

// Check if API key is available
const isGeminiAvailable = GOOGLE_GENAI_API_KEY !== '';

// Log API key status for debugging
console.log('Enhanced Gemini Service - API Key loaded:', isGeminiAvailable ? 'Available' : 'Missing');

// Interface for chat message
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Interface for user context
export interface UserContext {
  userId?: string;
  displayName?: string;
  isGuest: boolean;
  dietaryPreferences?: string[];
  healthGoals?: string[];
  healthConditions?: string[];
  recentActivity?: any[];
  weeklyCheckin?: any;
  currentPage?: string;
}

// Function to build system prompt with user context
const buildSystemPrompt = (context: UserContext): string => {
  const { 
    displayName, 
    isGuest, 
    dietaryPreferences, 
    healthGoals, 
    healthConditions, 
    recentActivity,
    weeklyCheckin,
    currentPage
  } = context;

  let systemPrompt = `You are SafeBite AI, a helpful and friendly nutrition and health assistant. 
Your primary goal is to provide accurate, personalized advice about food, nutrition, and healthy eating.
Always be supportive, encouraging, and non-judgmental.

Current date: ${new Date().toLocaleDateString()}
Current page: ${currentPage || 'Unknown'}
`;

  // Add user-specific context if available
  if (isGuest) {
    systemPrompt += `\nUser type: Guest (limited features)
User name: ${displayName || 'Guest'}

As this is a guest user, focus on providing general information and encouraging them to create an account for personalized features.
`;
  } else if (displayName) {
    systemPrompt += `\nUser type: Registered user
User name: ${displayName}
`;

    // Add dietary preferences if available
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      systemPrompt += `\nDietary preferences: ${dietaryPreferences.join(', ')}`;
    }

    // Add health goals if available
    if (healthGoals && healthGoals.length > 0) {
      systemPrompt += `\nHealth goals: ${healthGoals.join(', ')}`;
    }

    // Add health conditions if available
    if (healthConditions && healthConditions.length > 0) {
      systemPrompt += `\nHealth conditions: ${healthConditions.join(', ')}`;
    }

    // Add weekly check-in data if available
    if (weeklyCheckin) {
      systemPrompt += `\nWeekly check-in data:`;
      for (const [key, value] of Object.entries(weeklyCheckin)) {
        if (key !== 'timestamp') {
          systemPrompt += `\n- ${key.replace(/_/g, ' ')}: ${value}`;
        }
      }
    }

    // Add recent activity if available
    if (recentActivity && recentActivity.length > 0) {
      systemPrompt += `\nRecent activity (last 3):`;
      recentActivity.slice(0, 3).forEach((activity: any) => {
        systemPrompt += `\n- ${activity.type}: ${activity.query || activity.action || 'Unknown'}`;
      });
    }
  }

  // Add page-specific context
  if (currentPage) {
    switch(currentPage) {
      case 'dashboard':
        systemPrompt += `\nPage context: User is on the dashboard, which shows health metrics, recent activity, and quick access to features.`;
        break;
      case 'nutrition':
        systemPrompt += `\nPage context: User is on the nutrition page, which allows searching for food items and viewing nutritional information.`;
        break;
      case 'recipes':
        systemPrompt += `\nPage context: User is on the recipes page, which provides healthy recipe suggestions and meal planning.`;
        break;
      case 'healthbox':
        systemPrompt += `\nPage context: User is on the healthbox page, which contains health calculators and tools for tracking health metrics.`;
        break;
      case 'food-delivery':
        systemPrompt += `\nPage context: User is on the food delivery page, which helps find healthy options from food delivery services.`;
        break;
      case 'weekly-questions':
        systemPrompt += `\nPage context: User is completing their weekly health check-in, which tracks progress and provides personalized recommendations.`;
        break;
      case 'settings':
        systemPrompt += `\nPage context: User is on the settings page, where they can update their profile, preferences, and notification settings.`;
        break;
    }
  }

  // Add general guidelines
  systemPrompt += `\n
Guidelines for your responses:
1. Be concise and easy to understand, using simple language.
2. When discussing nutrition, focus on balanced eating rather than strict diets.
3. Acknowledge that individual needs vary and avoid one-size-fits-all advice.
4. For health conditions, provide general information but remind users to consult healthcare professionals.
5. Personalize responses based on the user's dietary preferences, health goals, and conditions when available.
6. Provide specific, actionable advice when possible.
7. Be encouraging and positive, focusing on what users can add to their diet rather than what to restrict.
8. When appropriate, suggest relevant features within the SafeBite app that might help the user.
9. If you don't know something, admit it rather than providing potentially incorrect information.
10. Keep responses friendly and conversational, but professional.
`;

  return systemPrompt;
};

// Function to chat with enhanced Gemini with user context
export const enhancedChatWithGemini = async (
  messages: ChatMessage[], 
  userContext: UserContext
): Promise<string> => {
  if (!isGeminiAvailable) {
    console.error('Google Gemini API key not configured');
    return "I'm sorry, but the AI chat service is not available at the moment. Please try again later.";
  }

  try {
    // Build system prompt with user context
    const systemPrompt = buildSystemPrompt(userContext);
    
    // Add system message to the beginning of the conversation
    const allMessages = [
      { role: 'system', parts: [{ text: systemPrompt }] },
      ...messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_GENAI_API_KEY
      },
      body: JSON.stringify({
        contents: allMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
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
    console.error('Error chatting with Enhanced Gemini:', error);
    return "I'm sorry, but I couldn't process your message at the moment. Please try again later.";
  }
};

// Function to generate proactive suggestions based on user context
export const generateProactiveSuggestion = async (userContext: UserContext): Promise<string | null> => {
  if (!isGeminiAvailable) {
    return null;
  }

  try {
    const systemPrompt = buildSystemPrompt(userContext);
    
    const promptText = `Based on the user context provided, generate a single, helpful proactive suggestion that would be valuable to the user right now. 
The suggestion should be specific, actionable, and directly relevant to the current page (${userContext.currentPage}) and the user's profile information.
Keep it concise (1-2 sentences) and friendly. Don't be too pushy or sales-like.
If there's not enough context to make a meaningful suggestion, respond with "NO_SUGGESTION".`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_GENAI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: promptText }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
          topP: 0.95,
          topK: 40
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
      const suggestion = data.candidates[0].content.parts[0].text.trim();
      return suggestion === "NO_SUGGESTION" ? null : suggestion;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error generating proactive suggestion:', error);
    return null;
  }
};

// Function to extract topics and entities from user message
export const extractTopicsAndEntities = async (message: string): Promise<{topics: string[], entities: string[]}> => {
  if (!isGeminiAvailable || !message) {
    return { topics: [], entities: [] };
  }

  try {
    const promptText = `Extract the main topics and entities from this message:
"${message}"

Return ONLY a JSON object with two arrays:
1. "topics": General categories or subjects (like "nutrition", "weight loss", "recipes", etc.)
2. "entities": Specific items mentioned (like "apples", "protein", "vitamin C", etc.)

Format: 
{
  "topics": ["topic1", "topic2"],
  "entities": ["entity1", "entity2"]
}`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_GENAI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: promptText }] }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 200
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
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            topics: Array.isArray(parsed.topics) ? parsed.topics : [],
            entities: Array.isArray(parsed.entities) ? parsed.entities : []
          };
        } catch (e) {
          console.error('Error parsing JSON from Gemini response:', e);
        }
      }
    }
    
    // Fallback to simple keyword extraction
    const simpleTopics = extractSimpleTopics(message);
    return { topics: simpleTopics, entities: [] };
  } catch (error) {
    console.error('Error extracting topics and entities:', error);
    return { topics: [], entities: [] };
  }
};

// Simple keyword extraction as fallback
const extractSimpleTopics = (message: string): string[] => {
  const keywords = [
    'nutrition', 'calories', 'protein', 'carbs', 'fat', 'diet',
    'vegetarian', 'vegan', 'gluten', 'allergy', 'organic', 'healthy',
    'recipe', 'meal', 'breakfast', 'lunch', 'dinner', 'snack',
    'vitamin', 'mineral', 'supplement', 'weight', 'exercise',
    'diabetes', 'heart', 'cholesterol', 'blood pressure'
  ];

  const foundTopics: string[] = [];
  const lowerMessage = message.toLowerCase();

  for (const keyword of keywords) {
    if (lowerMessage.includes(keyword)) {
      foundTopics.push(keyword);
    }
  }

  return foundTopics.length > 0 ? foundTopics : ['general'];
};

// Get current user context
export const getCurrentUserContext = async (): Promise<UserContext> => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  
  // Default context for guest users
  const defaultContext: UserContext = {
    isGuest: true,
    currentPage: getCurrentPage()
  };
  
  if (!user) {
    // Check if user is in guest mode
    const isGuestMode = localStorage.getItem('userType') === 'guest' || 
                       sessionStorage.getItem('safebite-guest-mode') === 'true';
    
    if (isGuestMode) {
      const guestName = localStorage.getItem('guestUserName') || 'Guest';
      return {
        ...defaultContext,
        displayName: guestName
      };
    }
    
    return defaultContext;
  }
  
  // User is logged in
  return {
    userId: user.uid,
    displayName: user.displayName || undefined,
    isGuest: false,
    currentPage: getCurrentPage()
    // Note: Additional user data like dietary preferences would be fetched from Firestore
    // in the actual implementation in the FoodChatBot component
  };
};

// Helper to get current page
const getCurrentPage = (): string => {
  const path = window.location.pathname;
  
  if (path.includes('/dashboard')) return 'dashboard';
  if (path.includes('/nutrition')) return 'nutrition';
  if (path.includes('/recipes')) return 'recipes';
  if (path.includes('/healthbox')) return 'healthbox';
  if (path.includes('/food-delivery')) return 'food-delivery';
  if (path.includes('/weekly-questions')) return 'weekly-questions';
  if (path.includes('/settings')) return 'settings';
  
  return 'unknown';
};

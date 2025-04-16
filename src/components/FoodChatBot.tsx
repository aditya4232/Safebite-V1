import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatMessage, chatWithGemini } from '@/services/geminiService';
import { Loader2 } from 'lucide-react';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../firebase";
import { useToast } from "@/hooks/use-toast";
import { useGuestMode } from '@/hooks/useGuestMode';
import { isAuthenticated, isAuthPage, redirectToLogin } from "@/utils/authUtils";

interface FoodChatBotProps {
  initialMessage?: string;
  currentPage?: string;
  userData?: any;
  autoOpen?: boolean;
}

const FoodChatBot: React.FC<FoodChatBotProps> = ({
  initialMessage = "Hi! I'm your SafeBite AI assistant. Ask me anything about food, nutrition, or healthy eating!",
  currentPage = '',
  userData = null,
  autoOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(!autoOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: initialMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shouldDisplay, setShouldDisplay] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();
  const { isGuest } = useGuestMode();

  // Determine if the chatbot should be displayed
  useEffect(() => {
    const path = window.location.pathname;
    const isLandingPage = path === '/' || path === '/SafeBite-V1/' || path === '/SafeBite-V1';
    const isAuthPage = path.includes('/auth/');
    const isLoggedIn = auth.currentUser !== null;

    // Show chatbot for both logged-in users and guest users, but not on landing/auth pages
    // Also wait for the profile to load for logged-in users
    const shouldBeDisplayed = (isLoggedIn || isGuest) && !isLandingPage && !isAuthPage && (isGuest || userData !== null);
    console.log('FoodChatBot - shouldDisplay:', shouldBeDisplayed, { isLoggedIn, isGuest, isLandingPage, isAuthPage, userData });
    setShouldDisplay(shouldBeDisplayed);
  }, [auth.currentUser, isGuest, userData]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-open chatbot after a delay if autoOpen is true
  useEffect(() => {
    if (autoOpen) {
      // Open automatically after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsMinimized(false);
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  // Check if user is logged in and generate context-aware messages
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);

      // If we have a current page, generate a context-aware welcome message
      if (currentPage && user) {
        generateContextAwareMessage(currentPage, user);
      } else if (currentPage) {
        // For guest users, still provide context-aware messages
        generateContextAwareMessage(currentPage, null);
      }
    });

    return () => unsubscribe();
  }, [auth, currentPage]);

  // Track user actions to provide personalized suggestions
  useEffect(() => {
    if (userData && isLoggedIn && currentPage) {
      generatePersonalizedSuggestion(userData, currentPage);
    }
  }, [userData, isLoggedIn, currentPage]);

  // Generate context-aware welcome message based on current page
  const generateContextAwareMessage = async (page: string, user: any) => {
    let contextMessage = '';
    let isGuest = !user;
    const guestName = isGuest ? localStorage.getItem('guestUserName') || 'Guest' : null;

    // Don't send another message if we already have more than the initial message
    if (messages.length > 1) return;

    switch(page) {
      case 'dashboard':
        if (isGuest) {
          contextMessage = `Welcome to the SafeBite dashboard, ${guestName}! As a guest user, you can explore basic features. Would you like me to explain what's available to you, or would you like to sign up for full access?`;
        } else {
          contextMessage = `Welcome to your personalized dashboard, ${user.displayName || 'there'}! I can help you understand your health metrics or suggest ways to improve your nutrition based on your data. What would you like to know about today?`;
        }
        break;

      case 'nutrition':
        if (isGuest) {
          contextMessage = `I see you're exploring nutrition information. You can search for foods to see their nutritional content. Would you like help finding details for a specific food, or would you like some healthy meal suggestions?`;
        } else {
          contextMessage = `Welcome to the Nutrition page! Based on your profile, I can help you find foods that match your dietary preferences and health goals. Would you like personalized recommendations or help with searching for specific foods?`;
        }
        break;

      case 'recipes':
        if (isGuest) {
          contextMessage = `Looking for recipe ideas? You can search for recipes here. What kind of dishes are you interested in today? I can suggest options based on ingredients or cuisine types.`;
        } else {
          contextMessage = `Welcome to Recipes! Based on your previous activity and preferences, I can suggest personalized recipe ideas. Would you like recommendations for quick meals, healthy options, or something specific to your dietary needs?`;
        }
        break;

      case 'healthbox':
        if (isGuest) {
          contextMessage = `Welcome to Healthbox! Here you can access various health calculators and tools. As a guest, you can try them out, but your results won't be saved. Would you like me to guide you through the available tools?`;
        } else {
          contextMessage = `Welcome to Healthbox! I can help you understand the different health tools available or assist with interpreting your results. Your data will be saved to your profile for tracking progress. Which health aspect would you like to focus on today?`;
        }
        break;

      case 'food-delivery':
        if (isGuest) {
          contextMessage = `Looking for food delivery options? You can explore healthy choices from popular restaurants here. Would you like suggestions for nutritious takeout options?`;
        } else {
          contextMessage = `Welcome to Food Delivery! Based on your health profile and preferences, I can suggest healthier options from your favorite restaurants. Would you like recommendations from Zomato, Swiggy, or based on your dietary preferences?`;
        }
        break;

      case 'weekly-questions':
        if (isGuest) {
          contextMessage = `This is the weekly health check-in page. As a guest, you can try it out, but your answers won't be saved. Would you like to sign up to track your progress over time?`;
        } else {
          contextMessage = `Welcome to your weekly health check-in! Answering these questions helps us provide personalized recommendations and track your progress. Would you like me to explain how this information is used to improve your experience?`;
        }
        break;

      case 'settings':
        if (isGuest) {
          contextMessage = `As a guest user, your settings options are limited. Would you like to create an account to access all features and save your preferences?`;
        } else {
          contextMessage = `You can customize your SafeBite experience here. Would you like help with setting up your dietary preferences, health goals, or notification settings?`;
        }
        break;

      default:
        if (isGuest) {
          contextMessage = `Welcome to SafeBite! I'm your AI assistant and can help you navigate the site. As a guest user, some features are limited. Would you like to know more about creating an account?`;
        } else {
          contextMessage = `Welcome to SafeBite! I'm your personal AI assistant and can help with nutrition information, recipe suggestions, and health insights. What can I help you with today?`;
        }
    }

    // Add the context-aware message
    if (contextMessage) {
      setMessages(prev => [...prev, { role: 'assistant', content: contextMessage }]);

      // Save this interaction to Firebase
      if (isLoggedIn && user) {
        try {
          const chatRef = collection(db, 'users', user.uid, 'chatHistory');
          await addDoc(chatRef, {
            aiMessage: contextMessage,
            timestamp: serverTimestamp(),
            context: page,
            isAutoGenerated: true
          });
        } catch (error) {
          console.error('Error saving context message to Firebase:', error);
        }
      }
    }
  };

  // Generate personalized suggestions based on user data and current page
  const generatePersonalizedSuggestion = async (userData: any, page: string) => {
    // Don't send suggestions if we already have multiple messages
    if (messages.length > 2) return;

    // Wait a bit before showing personalized suggestions
    setTimeout(async () => {
      let suggestion = '';

      // Generate personalized suggestions based on user data and current page
      if (userData) {
        // Check for health goals
        const healthGoals = userData.profile?.health_goals;
        // Check for dietary preferences
        const dietaryPreferences = userData.profile?.dietary_preferences;
        // Check for health conditions
        const healthConditions = userData.profile?.health_conditions;
        // Check for recent activity
        const recentActivity = userData.recentActivity || [];
        // Check for weekly check-in data
        const weeklyCheckin = userData.profile?.weeklyCheckin?.answers;

        // Generate suggestions based on page and user data
        switch(page) {
          case 'dashboard':
            if (weeklyCheckin) {
              // If they have weekly check-in data, provide specific insights
              if (weeklyCheckin.exercise_minutes < 150) {
                suggestion = `I noticed from your weekly check-in that you're getting ${weeklyCheckin.exercise_minutes} minutes of exercise. The recommended amount is 150 minutes per week. Would you like some tips for increasing your activity level?`;
              } else if (weeklyCheckin.water_intake < 6) {
                suggestion = `Your weekly check-in shows you're drinking ${weeklyCheckin.water_intake} cups of water daily. Increasing to 8 cups could improve your hydration. Would you like some hydration tips?`;
              } else if (weeklyCheckin.stress_level > 3) {
                suggestion = `I see your stress level is rated ${weeklyCheckin.stress_level}/5. Would you like me to suggest some stress management techniques or foods that can help reduce stress?`;
              }
            } else if (healthGoals === 'Weight Loss') {
              suggestion = `I noticed your goal is weight loss. Would you like me to suggest some low-calorie meal options or exercise routines that could help? Completing your weekly health check-in would also help me provide more personalized recommendations.`;
            } else if (healthGoals === 'Muscle Gain') {
              suggestion = `Since you're focusing on muscle gain, would you like some high-protein recipe suggestions or nutrition tips? I can also recommend specific health tools in Healthbox to track your progress.`;
            } else if (healthConditions && healthConditions.includes('Diabetes')) {
              suggestion = `I see you're managing diabetes. Would you like me to help you find low-glycemic food options or meal planning tips? I can also suggest specific health monitoring tools in Healthbox.`;
            }
            break;

          case 'nutrition':
            // Check if they've completed weekly check-in for more personalized suggestions
            if (weeklyCheckin) {
              if (weeklyCheckin.junk_food_consumption > 5) {
                suggestion = `Based on your weekly check-in, you might want to reduce processed food intake. Would you like me to suggest some healthier alternatives to common junk foods?`;
              } else if (weeklyCheckin.fruit_vegetable_servings < 5) {
                suggestion = `Your weekly check-in shows you're getting ${weeklyCheckin.fruit_vegetable_servings} servings of fruits and vegetables daily. Would you like suggestions for increasing your intake to the recommended 5+ servings?`;
              }
            } else if (dietaryPreferences) {
              if (dietaryPreferences.includes('Vegetarian')) {
                suggestion = `As a vegetarian, would you like me to suggest some plant-based protein sources or vegetarian recipes? I can also help you ensure you're getting all essential nutrients.`;
              } else if (dietaryPreferences.includes('Vegan')) {
                suggestion = `For your vegan diet, would you like me to suggest some nutrient-dense plant foods or vegan recipes? I can also help you identify potential nutrient gaps to watch for.`;
              } else if (dietaryPreferences.includes('Keto')) {
                suggestion = `For your keto diet, would you like me to suggest some low-carb, high-fat food options? I can also help you track your macronutrient ratios to stay in ketosis.`;
              }
            }
            break;

          case 'recipes':
            // Check recent searches or activity
            if (recentActivity.length > 0) {
              const recentSearches = recentActivity
                .filter((activity: any) => activity.type === 'search')
                .map((activity: any) => activity.query);

              if (recentSearches.length > 0) {
                const mostRecentSearch = recentSearches[0];
                suggestion = `I see you recently searched for "${mostRecentSearch}". Would you like me to suggest similar recipes or nutrition information? I can also help you modify recipes to match your dietary preferences.`;
              }
            } else if (weeklyCheckin && weeklyCheckin.home_cooked_meals < 10) {
              suggestion = `Your weekly check-in shows you had ${weeklyCheckin.home_cooked_meals} home-cooked meals. Would you like some quick and easy recipe ideas to help you cook at home more often?`;
            } else if (dietaryPreferences) {
              suggestion = `Based on your dietary preferences, I can suggest some ${dietaryPreferences.toLowerCase()} recipes. Would you like quick meals, batch cooking ideas, or special occasion recipes?`;
            }
            break;

          case 'healthbox':
            if (weeklyCheckin) {
              // Suggest specific tools based on their weekly check-in data
              if (weeklyCheckin.sleep_hours < 7) {
                suggestion = `I noticed from your weekly check-in that you're getting ${weeklyCheckin.sleep_hours} hours of sleep. Would you like to try the Sleep Calculator tool to help improve your sleep quality?`;
              } else if (weeklyCheckin.stress_level > 3) {
                suggestion = `Based on your stress level of ${weeklyCheckin.stress_level}/5, you might find the Stress Analyzer tool helpful. Would you like to try it?`;
              } else if (weeklyCheckin.health_symptoms && weeklyCheckin.health_symptoms.includes('joint_pain')) {
                suggestion = `I see you mentioned joint pain in your weekly check-in. The Body Mass Index and Exercise Planner tools might be helpful for managing this. Would you like to try them?`;
              }
            } else if (healthConditions) {
              suggestion = `Since you've mentioned ${healthConditions}, would you like me to suggest specific health tools that might be helpful for monitoring your condition? Regular weekly check-ins can also help track your progress.`;
            } else {
              suggestion = `Would you like me to recommend which health tools might be most relevant for your health goals? Completing a weekly health check-in would also help me provide more personalized recommendations.`;
            }
            break;

          case 'weekly-questions':
            suggestion = `Completing your weekly health check-in helps us provide personalized recommendations. Your answers are used to track progress, suggest relevant health tools, and customize nutrition advice. Would you like me to explain more about any specific question?`;
            break;

          case 'food-delivery':
            if (dietaryPreferences) {
              suggestion = `When ordering food delivery, look for ${dietaryPreferences.toLowerCase()} options. Would you like tips for making healthier choices when ordering from restaurants?`;
            } else if (healthGoals === 'Weight Loss') {
              suggestion = `When ordering food delivery while focusing on weight loss, look for options with vegetables, lean proteins, and ask for dressings on the side. Would you like more specific recommendations?`;
            } else {
              suggestion = `Would you like some tips for identifying healthier options when ordering food delivery? I can help you decode menu descriptions and make better choices.`;
            }
            break;
        }

        // Add the personalized suggestion if we have one
        if (suggestion) {
          setMessages(prev => [...prev, { role: 'assistant', content: suggestion }]);

          // Save this interaction to Firebase
          if (isLoggedIn) {
            try {
              const user = auth.currentUser;
              if (user) {
                const chatRef = collection(db, 'users', user.uid, 'chatHistory');
                await addDoc(chatRef, {
                  aiMessage: suggestion,
                  timestamp: serverTimestamp(),
                  context: page,
                  isPersonalized: true,
                  basedOn: {
                    healthGoals: healthGoals || 'General Health',
                    dietaryPreferences: dietaryPreferences || 'None',
                    healthConditions: healthConditions || 'None',
                    weeklyCheckin: weeklyCheckin ? true : false,
                    recentActivity: recentActivity?.slice(0, 3) || [] // Just store a few recent activities
                  }
                });
              }
            } catch (error) {
              console.error('Error saving personalized suggestion to Firebase:', error);
            }
          }
        }
      }
    }, 8000); // Wait 8 seconds before showing personalized suggestions
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get all messages for context
      const allMessages = [...messages, userMessage];

      // Get response from Gemini
      const response = await chatWithGemini(allMessages);

      // Add assistant message
      const assistantMessage = { role: 'assistant' as const, content: response };
      setMessages(prev => [...prev, assistantMessage]);

      // Save interaction to Firebase if user is logged in
      if (isLoggedIn) {
        try {
          const user = auth.currentUser;
          if (user) {
            // Save to user's chat history
            const chatRef = collection(db, 'users', user.uid, 'chatHistory');
            await addDoc(chatRef, {
              userMessage: userMessage.content,
              aiResponse: response,
              timestamp: serverTimestamp(),
              context: allMessages.map(msg => ({ role: msg.role, content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '') })),
              topics: extractTopics(userMessage.content)
            });

            // Update user's profile with learned preferences
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
              aiLearning: {
                lastInteraction: serverTimestamp(),
                recentTopics: extractTopics(userMessage.content),
                interactionCount: allMessages.length / 2 // Approximate number of exchanges
              }
            }, { merge: true });
          }
        } catch (firebaseError) {
          console.error('Error saving chat to Firebase:', firebaseError);
          // Don't show error to user, just log it
        }
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication before navigating to protected pages
  const checkAuthAndNavigate = (path: string) => {
    // List of protected routes that require authentication
    const protectedRoutes = [
      '/dashboard',
      '/nutrition',
      '/food-search',
      '/food-delivery',
      '/product-recommendations',
      '/products',
      '/community',
      '/healthbox',
      '/reports',
      '/recipes',
      '/settings',
      '/tools',
      '/features'
    ];

    // Check if the path is a protected route
    const isProtectedRoute = protectedRoutes.some(route =>
      path.toLowerCase().includes(route.toLowerCase())
    );

    // Get the base URL for the application
    const baseUrl = window.location.pathname.includes('/SafeBite-V1')
      ? '/SafeBite-V1'
      : '';

    // Force authentication for all protected routes
    if (isProtectedRoute) {
      // Check if user is authenticated - use direct checks
      const hasFirebaseAuth = auth.currentUser !== null;
      const isGuestMode = localStorage.getItem('userType') === 'guest' ||
                         sessionStorage.getItem('safebite-guest-mode') === 'true';

      if (hasFirebaseAuth || isGuestMode) {
        // User is authenticated, allow navigation
        window.location.href = `${baseUrl}${path}`;
      } else {
        // User is not authenticated, redirect to login page with a message
        toast({
          title: "Authentication Required",
          description: "Please log in or continue as guest to access this feature.",
          variant: "destructive"
        });

        // Redirect to login page
        window.location.href = `${baseUrl}/auth/login`;
        return;
      }
    } else {
      // Not a protected route, allow navigation
      window.location.href = `${baseUrl}${path}`;
    }
  };

  // Helper function to extract topics from user message
  const extractTopics = (message: string): string[] => {
    // Simple keyword extraction
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Don't render anything if the chatbot shouldn't be displayed
  if (!shouldDisplay) {
    return null;
  }

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 bg-safebite-teal hover:bg-safebite-teal/80 shadow-xl z-50 border-2 border-white/20 flex items-center justify-center"
          title="SafeBite AI Assistant"
        >
          <Bot size={24} className="text-safebite-dark-blue" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className={`fixed bottom-6 right-6 w-80 sm:w-96 shadow-xl border border-safebite-teal/30 transition-all duration-300 ease-in-out ${
          isMinimized ? 'h-16' : 'h-[500px]'
        }`}>
          <CardHeader className="p-3 border-b border-safebite-teal/30 bg-safebite-teal/10 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/bot-avatar.png" alt="AI" />
                <AvatarFallback className="bg-safebite-teal text-safebite-dark-blue text-xs">AI</AvatarFallback>
              </Avatar>
              SafeBite AI Assistant
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={toggleMinimize} className="h-8 w-8 p-0 hover:bg-safebite-teal/20">
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 p-0 hover:bg-safebite-teal/20">
                <X size={16} />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="p-4 overflow-y-auto h-[380px] bg-safebite-card-bg">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-safebite-teal text-safebite-dark-blue'
                            : 'bg-safebite-card-bg-alt text-safebite-text'
                        }`}
                      >
                        {message.content.split('\n').map((line, i) => {
                          // Check for links to protected pages
                          const protectedRoutes = [
                            '/dashboard',
                            '/nutrition',
                            '/food-search',
                            '/food-delivery',
                            '/product-recommendations',
                            '/products',
                            '/community',
                            '/healthbox',
                            '/reports',
                            '/recipes',
                            '/settings'
                          ];

                          // Check if line contains a link to a protected route
                          let modifiedLine = line;
                          protectedRoutes.forEach(route => {
                            if (line.toLowerCase().includes(route.toLowerCase())) {
                              // Replace the link with a button that checks authentication
                              const routeIndex = line.toLowerCase().indexOf(route.toLowerCase());
                              const actualRoute = line.substring(routeIndex, routeIndex + route.length);
                              const parts = [line.substring(0, routeIndex), line.substring(routeIndex + route.length)];

                              modifiedLine = `${parts[0]}<Button
                                variant="link"
                                className="p-0 h-auto text-current underline"
                                onClick={() => checkAuthAndNavigate(route)}
                              >
                                {actualRoute}
                              </Button>${parts[1]}`;
                            }
                          });

                          return (
                            <React.Fragment key={i}>
                              {modifiedLine}
                              {i < message.content.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-safebite-card-bg-alt text-safebite-text">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Ask about food or nutrition..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-safebite-teal hover:bg-safebite-teal/80"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default FoodChatBot;

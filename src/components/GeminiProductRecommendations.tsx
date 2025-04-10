import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ShoppingCart, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { trackUserInteraction } from '@/services/mlService';

interface GeminiProductRecommendationsProps {
  userPreferences: string[];
  dietaryInfo?: string;
  healthGoals?: string;
  isGuest?: boolean;
}

interface RecommendationResult {
  products: {
    name: string;
    description: string;
    benefits: string;
    category: string;
  }[];
  explanation: string;
}

// This is a simulated Gemini API response
const simulateGeminiResponse = (preferences: string[], dietaryInfo?: string, healthGoals?: string): Promise<RecommendationResult> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Base recommendations
      const baseRecommendations = [
        {
          name: "Chia Seeds",
          description: "Nutrient-dense seeds high in omega-3 fatty acids, fiber, and protein.",
          benefits: "Supports heart health, digestion, and provides sustained energy.",
          category: "superfoods"
        },
        {
          name: "Turmeric",
          description: "Powerful anti-inflammatory spice with curcumin as the active ingredient.",
          benefits: "Reduces inflammation, supports joint health, and has antioxidant properties.",
          category: "spices"
        },
        {
          name: "Kefir",
          description: "Fermented dairy drink rich in probiotics and protein.",
          benefits: "Supports gut health, immune function, and provides calcium.",
          category: "dairy"
        }
      ];
      
      // Dietary preference specific recommendations
      const dietaryRecommendations: Record<string, any[]> = {
        "vegan": [
          {
            name: "Nutritional Yeast",
            description: "Deactivated yeast with a cheesy flavor, rich in B vitamins.",
            benefits: "Provides vitamin B12, protein, and adds savory flavor to dishes.",
            category: "vegan"
          },
          {
            name: "Tempeh",
            description: "Fermented soybean cake with a firm texture and nutty flavor.",
            benefits: "High in protein, probiotics, and contains all essential amino acids.",
            category: "vegan"
          }
        ],
        "vegetarian": [
          {
            name: "Greek Yogurt",
            description: "Strained yogurt with higher protein content than regular yogurt.",
            benefits: "Rich in protein, probiotics, and calcium for gut and bone health.",
            category: "dairy"
          },
          {
            name: "Cottage Cheese",
            description: "Fresh cheese curd product with a mild flavor.",
            benefits: "High in protein, low in calories, and contains casein protein for slow digestion.",
            category: "dairy"
          }
        ],
        "keto": [
          {
            name: "MCT Oil",
            description: "Medium-chain triglyceride oil derived from coconut oil.",
            benefits: "Quickly converted to ketones, provides energy, and supports ketosis.",
            category: "oils"
          },
          {
            name: "Macadamia Nuts",
            description: "High-fat, low-carb nuts with a buttery flavor.",
            benefits: "Rich in monounsaturated fats, low in carbs, and supports heart health.",
            category: "nuts"
          }
        ],
        "paleo": [
          {
            name: "Grass-Fed Beef",
            description: "Beef from cattle fed primarily grass instead of grain.",
            benefits: "Higher in omega-3s, CLA, and vitamins compared to conventional beef.",
            category: "meats"
          },
          {
            name: "Coconut Flour",
            description: "Grain-free flour alternative made from dried coconut meat.",
            benefits: "High in fiber, low in carbs, and suitable for grain-free baking.",
            category: "flours"
          }
        ]
      };
      
      // Health goal specific recommendations
      const healthGoalRecommendations: Record<string, any[]> = {
        "weight loss": [
          {
            name: "Green Tea Extract",
            description: "Concentrated form of green tea rich in catechins.",
            benefits: "May boost metabolism, increase fat oxidation, and provide antioxidants.",
            category: "supplements"
          },
          {
            name: "Konjac Noodles",
            description: "Low-calorie, high-fiber noodles made from konjac yam.",
            benefits: "Very low in calories, high in glucomannan fiber, and promotes fullness.",
            category: "pasta alternatives"
          }
        ],
        "muscle gain": [
          {
            name: "Whey Protein Isolate",
            description: "Highly filtered whey protein with minimal fat and lactose.",
            benefits: "Fast-absorbing protein source, rich in BCAAs for muscle recovery and growth.",
            category: "supplements"
          },
          {
            name: "Tart Cherry Juice",
            description: "Juice from tart cherries with anti-inflammatory properties.",
            benefits: "May reduce exercise-induced muscle soreness and improve recovery.",
            category: "beverages"
          }
        ],
        "general health": [
          {
            name: "Fermented Foods Variety Pack",
            description: "Assortment of kimchi, sauerkraut, and pickled vegetables.",
            benefits: "Rich in probiotics, supports gut health, and enhances immune function.",
            category: "fermented foods"
          },
          {
            name: "Mixed Berry Blend",
            description: "Frozen blend of strawberries, blueberries, raspberries, and blackberries.",
            benefits: "High in antioxidants, fiber, and vitamin C for overall health.",
            category: "fruits"
          }
        ]
      };
      
      // Build personalized recommendations
      let personalizedRecommendations: any[] = [...baseRecommendations];
      let explanation = "These products are generally beneficial for most dietary patterns and health goals.";
      
      // Add dietary-specific recommendations
      if (dietaryInfo && dietaryRecommendations[dietaryInfo.toLowerCase()]) {
        personalizedRecommendations = [
          ...dietaryRecommendations[dietaryInfo.toLowerCase()],
          ...personalizedRecommendations
        ].slice(0, 5);
        explanation = `Products selected specifically for ${dietaryInfo} dietary pattern, focusing on essential nutrients that may be needed.`;
      }
      
      // Add health goal specific recommendations
      if (healthGoals) {
        const goalKey = Object.keys(healthGoalRecommendations).find(key => 
          healthGoals.toLowerCase().includes(key)
        );
        
        if (goalKey && healthGoalRecommendations[goalKey]) {
          personalizedRecommendations = [
            ...healthGoalRecommendations[goalKey],
            ...personalizedRecommendations
          ].slice(0, 5);
          explanation += ` Also included products that support your ${healthGoals} goal.`;
        }
      }
      
      // Add preference-based recommendations
      if (preferences.length > 0) {
        explanation += ` Considered your preferences for ${preferences.join(', ')}.`;
      }
      
      resolve({
        products: personalizedRecommendations.slice(0, 5),
        explanation
      });
    }, 1500); // Simulate 1.5 second API delay
  });
};

const GeminiProductRecommendations = ({ 
  userPreferences, 
  dietaryInfo, 
  healthGoals,
  isGuest = false 
}: GeminiProductRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const getRecommendations = async () => {
      if (!userPreferences.length && !dietaryInfo && !healthGoals) {
        return; // Not enough data to make recommendations
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Track this interaction
        trackUserInteraction('gemini_product_recommendations', { 
          userPreferences, 
          dietaryInfo, 
          healthGoals,
          isGuest 
        });
        
        // In a real implementation, this would call the Gemini API
        // For now, we'll use a simulated response
        const result = await simulateGeminiResponse(userPreferences, dietaryInfo, healthGoals);
        setRecommendations(result);
      } catch (err) {
        console.error('Error getting AI recommendations:', err);
        setError('Failed to generate AI recommendations. Please try again later.');
        toast({
          title: 'AI Recommendation Error',
          description: 'Could not generate personalized recommendations.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getRecommendations();
  }, [userPreferences, dietaryInfo, healthGoals, toast, isGuest]);
  
  if (isLoading) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-safebite-teal" />
            AI Product Recommendations
          </CardTitle>
          <CardDescription>
            Generating personalized recommendations...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-safebite-teal mb-4" />
            <p className="text-safebite-text-secondary text-sm">
              Our AI is analyzing your preferences and health goals
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            AI Recommendations Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-safebite-text-secondary">{error}</p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!recommendations) {
    return null;
  }
  
  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-safebite-teal" />
          AI Product Recommendations
        </CardTitle>
        <CardDescription>
          Personalized suggestions based on your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-safebite-card-bg-alt rounded-md border border-safebite-card-bg-alt">
          <p className="text-sm text-safebite-text-secondary italic">
            "{recommendations.explanation}"
          </p>
        </div>
        
        <div className="space-y-3">
          {recommendations.products.map((product, index) => (
            <div 
              key={index}
              className="p-3 border border-safebite-card-bg-alt rounded-md hover:border-safebite-teal/50 transition-colors"
            >
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 mt-1">
                  <ShoppingCart className="h-4 w-4 text-safebite-teal" />
                </div>
                <div>
                  <h3 className="font-medium text-safebite-text">{product.name}</h3>
                  <p className="text-xs text-safebite-text-secondary mb-1">{product.description}</p>
                  <p className="text-xs text-safebite-teal">{product.benefits}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-safebite-text-secondary">
          <p>Powered by AI - Recommendations based on your profile data</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GeminiProductRecommendations;

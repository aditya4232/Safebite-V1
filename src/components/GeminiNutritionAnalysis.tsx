import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, Loader2, AlertTriangle, ThumbsUp, ThumbsDown,
  Sparkles, Heart, Info, Utensils, Lightbulb, Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeFoodItem, getFoodRecommendations } from '@/services/geminiService';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';

interface GeminiNutritionAnalysisProps {
  foodItem: any;
  onClose?: () => void;
}

const GeminiNutritionAnalysis: React.FC<GeminiNutritionAnalysisProps> = ({
  foodItem,
  onClose
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [activeTab, setActiveTab] = useState('analysis');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis when component mounts
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!foodItem) return;
      
      setIsLoadingAnalysis(true);
      setError(null);
      
      try {
        // Track this interaction
        trackUserInteraction('gemini_nutrition_analysis', {
          isGuest,
          foodName: foodItem.name || foodItem.food_name || 'Unknown food'
        });
        
        // Get analysis from Gemini
        const result = await analyzeFoodItem(foodItem);
        setAnalysis(result);
      } catch (err) {
        console.error('Error fetching food analysis:', err);
        setError('Failed to analyze food. Please try again.');
        toast({
          title: 'Analysis Error',
          description: 'Could not analyze this food item.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [foodItem, isGuest, toast]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // If recommendations tab is selected and we don't have recommendations yet, fetch them
    if (value === 'recommendations' && !recommendations && !isLoadingRecommendations) {
      fetchRecommendations();
    }
  };

  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!foodItem) return;
    
    setIsLoadingRecommendations(true);
    
    try {
      // Track this interaction
      trackUserInteraction('gemini_food_recommendations', {
        isGuest,
        foodName: foodItem.name || foodItem.food_name || 'Unknown food'
      });
      
      // Get recommendations from Gemini
      const query = `healthy alternatives to ${foodItem.name || foodItem.food_name || 'this food'} with similar taste profile`;
      const result = await getFoodRecommendations(query);
      setRecommendations(result);
    } catch (err) {
      console.error('Error fetching food recommendations:', err);
      toast({
        title: 'Recommendations Error',
        description: 'Could not fetch recommendations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Format analysis text with sections
  const formatAnalysisText = (text: string) => {
    // Split by numbered sections or headers
    const sections = text.split(/(\d\.\s+|\n\n|\n(?=[A-Z][a-z]+:))/g);
    
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          // Skip empty sections
          if (!section.trim()) return null;
          
          // Check if this is a header/number
          if (/^\d\.\s+/.test(section) || /^[A-Z][a-z]+:/.test(section)) {
            return (
              <h3 key={index} className="text-safebite-teal font-medium mt-4">
                {section}
              </h3>
            );
          }
          
          // Regular paragraph
          return (
            <p key={index} className="text-safebite-text-secondary">
              {section}
            </p>
          );
        })}
      </div>
    );
  };

  // Format recommendations text
  const formatRecommendationsText = (text: string) => {
    // Split by numbered items or bullet points
    const items = text.split(/(\d\.\s+|\n\n|\n\s*-\s+|\n(?=[A-Z][a-z]+:))/g);
    
    return (
      <div className="space-y-4">
        {items.map((item, index) => {
          // Skip empty items
          if (!item.trim()) return null;
          
          // Check if this is a header/number/bullet
          if (/^\d\.\s+/.test(item) || /^-\s+/.test(item) || /^[A-Z][a-z]+:/.test(item)) {
            return (
              <h3 key={index} className="text-safebite-teal font-medium mt-4">
                {item}
              </h3>
            );
          }
          
          // Regular paragraph
          return (
            <p key={index} className="text-safebite-text-secondary">
              {item}
            </p>
          );
        })}
      </div>
    );
  };

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium">Analysis Failed</p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 text-red-600 border-red-300"
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-safebite-teal/30 bg-safebite-card-bg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-safebite-text flex items-center">
          <Brain className="mr-2 h-5 w-5 text-safebite-teal" />
          AI Nutrition Insights
          <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">Gemini AI</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Tabs defaultValue="analysis" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="analysis">
              <Sparkles className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis">
            {isLoadingAnalysis ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-safebite-teal animate-spin mb-4" />
                <p className="text-safebite-text-secondary">
                  Analyzing nutrition data with AI...
                </p>
              </div>
            ) : analysis ? (
              <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg">
                {formatAnalysisText(analysis)}
              </div>
            ) : (
              <div className="text-center p-8 text-safebite-text-secondary">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <p>No analysis available for this food item.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommendations">
            {isLoadingRecommendations ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 text-safebite-teal animate-spin mb-4" />
                <p className="text-safebite-text-secondary">
                  Finding healthy alternatives...
                </p>
              </div>
            ) : recommendations ? (
              <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg">
                {formatRecommendationsText(recommendations)}
              </div>
            ) : (
              <div className="text-center p-8 text-safebite-text-secondary">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <p>No recommendations available for this food item.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-4">
        <div className="text-xs text-safebite-text-secondary flex items-center">
          <Info className="h-3 w-3 mr-1" />
          Powered by Google Gemini AI
        </div>
        
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GeminiNutritionAnalysis;

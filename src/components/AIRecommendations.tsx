import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Bot, Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { chatWithGemini } from '@/services/geminiService';

interface AIRecommendationsProps {
  userId?: string;
}

const AIRecommendations = ({ userId }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const generateRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user data from Firebase
        let userData: any = {};
        let userName = "there";
        
        if (auth.currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
              userData = userDoc.data();
              userName = userData.displayName || userData.name || auth.currentUser.displayName || "there";
            }
          } catch (firebaseError) {
            console.error('Error fetching user data:', firebaseError);
          }
        }
        
        // Prepare context for AI
        let context = `User name: ${userName}\n`;
        
        // Add questionnaire data if available
        if (userData.questionnaire) {
          const q = userData.questionnaire;
          context += `Age: ${q.age || 'Unknown'}\n`;
          context += `Gender: ${q.gender || 'Unknown'}\n`;
          context += `Height: ${q.height || 'Unknown'}\n`;
          context += `Weight: ${q.weight || 'Unknown'}\n`;
          context += `Activity Level: ${q.activityLevel || 'Unknown'}\n`;
          context += `Health Goals: ${q.healthGoals?.join(', ') || 'Unknown'}\n`;
          context += `Dietary Restrictions: ${q.dietaryRestrictions?.join(', ') || 'None'}\n`;
          context += `Medical Conditions: ${q.medicalConditions?.join(', ') || 'None'}\n`;
        }
        
        // Add food preferences if available
        if (userData.foodPreferences) {
          context += `Food Preferences: ${userData.foodPreferences.join(', ')}\n`;
        }
        
        // Add recent searches if available
        if (userData.recentSearches) {
          context += `Recent Food Searches: ${userData.recentSearches.join(', ')}\n`;
        }
        
        // Generate AI recommendations
        const prompt = `
        Based on the following user information, provide 3 personalized health and nutrition recommendations. 
        Format each recommendation as a concise, actionable bullet point that's friendly and encouraging.
        
        User Information:
        ${context}
        
        If information is limited, provide general healthy eating and lifestyle recommendations.
        
        Your response should ONLY include the 3 bullet points, nothing else.
        `;
        
        // Call Gemini API
        const response = await chatWithGemini([{ role: 'user', content: prompt }]);
        
        // Parse the response into bullet points
        const bulletPoints = response
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line))
          .map(line => line.replace(/^[•\-*]\s*|^\d+\.\s*/, ''));
        
        if (bulletPoints.length > 0) {
          setRecommendations(bulletPoints);
        } else {
          // Fallback recommendations if parsing failed
          setRecommendations([
            "Try to include more colorful vegetables in your meals for better nutrition.",
            "Stay hydrated by drinking at least 8 glasses of water daily.",
            "Consider adding more plant-based proteins to your diet for heart health."
          ]);
        }
      } catch (error) {
        console.error('Error generating AI recommendations:', error);
        setError('Unable to generate personalized recommendations');
        
        // Fallback recommendations
        setRecommendations([
          "Try to include more colorful vegetables in your meals for better nutrition.",
          "Stay hydrated by drinking at least 8 glasses of water daily.",
          "Consider adding more plant-based proteins to your diet for heart health."
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateRecommendations();
  }, [auth, db, toast]);
  
  if (isLoading) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-safebite-text">
            AI Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-safebite-text flex items-center">
          <Brain className="mr-2 h-5 w-5 text-safebite-purple" />
          AI Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-safebite-purple/20 flex items-center justify-center mr-3 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-safebite-purple" />
              </div>
              <p className="text-safebite-text flex-1">{recommendation}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            variant="outline" 
            className="text-safebite-purple border-safebite-purple hover:bg-safebite-purple hover:text-white"
            onClick={() => window.location.href = '/healthbox'}
          >
            Explore Health Tools
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;

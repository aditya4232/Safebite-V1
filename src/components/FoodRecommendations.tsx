import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Apple, Salad, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

interface FoodRecommendationsProps {
  userId?: string;
  healthGoal?: string;
}

// Define food recommendations based on health goals
const foodRecommendationsByGoal: Record<string, string[]> = {
  'Weight Loss': ['Sprouts', 'Ragi', 'Daliya', 'Makhana', 'Moong Dal Chilla'],
  'Muscle Gain': ['Eggs', 'Chicken Breast', 'Greek Yogurt', 'Salmon', 'Quinoa'],
  'Heart Health': ['Walnuts', 'Almonds', 'Oats', 'Olive Oil', 'Berries'],
  'Diabetes Management': ['Bitter Gourd', 'Fenugreek', 'Cinnamon', 'Amla', 'Flaxseeds'],
  'General Health': ['Walnuts', 'Almonds', 'Oats', 'Olive Oil', 'Steamed Vegetables'],
  'Digestive Health': ['Yogurt', 'Papaya', 'Ginger', 'Fennel Seeds', 'Banana'],
  'Immune Boost': ['Citrus Fruits', 'Turmeric', 'Garlic', 'Spinach', 'Almonds']
};

// Default recommendations
const defaultRecommendations = ['Walnuts', 'Almonds', 'Oats', 'Olive Oil', 'Steamed Vegetables'];

const FoodRecommendations = ({ userId, healthGoal }: FoodRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userGoal, setUserGoal] = useState<string | undefined>(healthGoal);
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      
      try {
        // If health goal is provided directly, use it
        if (healthGoal) {
          setUserGoal(healthGoal);
        } 
        // Otherwise try to get it from Firebase if user is logged in
        else if (auth.currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserGoal(userData.health_goals || userData.healthGoals || 'General Health');
            }
          } catch (firebaseError) {
            console.error('Error fetching user data:', firebaseError);
          }
        }
      } catch (error) {
        console.error('Error in food recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [auth, db, healthGoal]);

  useEffect(() => {
    // Set recommendations based on user's health goal
    if (userGoal && foodRecommendationsByGoal[userGoal]) {
      setRecommendations(foodRecommendationsByGoal[userGoal]);
    } else {
      // Default recommendations if no goal is set or goal doesn't match our categories
      setRecommendations(defaultRecommendations);
    }
  }, [userGoal]);
  
  if (isLoading) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-safebite-text">
            Food Recommendations
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
          <Salad className="mr-2 h-5 w-5 text-green-500" />
          Food Recommendations {userGoal ? `for ${userGoal}` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-safebite-text-secondary mb-4">
            Try these healthy options:
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {recommendations.map((food, index) => (
              <div 
                key={index} 
                className="bg-safebite-card-bg-alt rounded-md p-3 flex items-center"
              >
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <Apple className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-safebite-text">{food}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
              onClick={() => window.location.href = '/food-search'}
            >
              Explore Foods
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodRecommendations;

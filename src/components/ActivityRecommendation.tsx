import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight, Dumbbell, Loader2 } from 'lucide-react';
import { chatWithGemini } from '@/services/geminiService';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

interface ActivityRecommendationProps {
  activityLevel?: string;
  weeklyAnswers?: Record<string, any>;
  userId?: string;
}

const ActivityRecommendation: React.FC<ActivityRecommendationProps> = ({ activityLevel: propActivityLevel, weeklyAnswers: propWeeklyAnswers, userId }) => {
  const [recommendation, setRecommendation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activityLevel, setActivityLevel] = useState<string | undefined>(propActivityLevel);
  const [weeklyAnswers, setWeeklyAnswers] = useState<Record<string, any> | undefined>(propWeeklyAnswers);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Fetch user data if not provided as props
  useEffect(() => {
    const fetchUserData = async () => {
      if (propActivityLevel && propWeeklyAnswers) {
        // If props are provided, use them
        setActivityLevel(propActivityLevel);
        setWeeklyAnswers(propWeeklyAnswers);
        return;
      }

      try {
        // Try to get user data from Firebase
        const currentUser = auth.currentUser || (userId ? { uid: userId } : null);
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setActivityLevel(userData.activity_level || userData.activityLevel);
            setWeeklyAnswers(userData.weeklyCheckin?.answers || userData.weeklyAnswers);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [auth, db, propActivityLevel, propWeeklyAnswers, userId]);

  // Generate recommendation using Gemini API or fallback to predefined recommendations
  useEffect(() => {
    const generateRecommendation = async () => {
      setIsLoading(true);

      try {
        // Try to generate a recommendation using Gemini API
        const prompt = `
          As a fitness expert, provide a personalized activity recommendation based on the following user data:
          - Activity Level: ${activityLevel || 'Unknown'}
          - Weekly Exercise Minutes: ${weeklyAnswers?.exerciseMinutes || 'Unknown'}
          - Sleep Hours: ${weeklyAnswers?.sleepHours || 'Unknown'}
          - Stress Level: ${weeklyAnswers?.stressLevel || 'Unknown'}

          Provide a specific, actionable recommendation in 2-3 sentences. Start with "Based on your profile, I recommend...".
          If information is limited, provide general advice for beginners.
        `;

        const response = await chatWithGemini([{ role: 'user', content: prompt }]);
        setRecommendation(response);
      } catch (error) {
        console.error('Error generating activity recommendation:', error);
        // Fallback to predefined recommendations
        setRecommendation(getFallbackRecommendation(activityLevel));
      } finally {
        setIsLoading(false);
      }
    };

    generateRecommendation();
  }, [activityLevel, weeklyAnswers]);

  // Fallback function for predefined recommendations
  const getFallbackRecommendation = (activityLevel: string | undefined): string => {
    if (activityLevel === 'Sedentary') {
      return 'Based on your sedentary activity level, I recommend starting with 15-minute walks a few times a week and gradually increasing the duration and intensity. Try to incorporate simple stretching exercises in the morning to improve flexibility.';
    } else if (activityLevel === 'Lightly Active') {
      return 'Based on your lightly active profile, I recommend incorporating more moderate-intensity activities like brisk walking or cycling into your routine. Aim for 30 minutes of activity 5 days a week, and consider adding basic strength training twice weekly.';
    } else if (activityLevel === 'Active') {
      return 'Based on your active lifestyle, I recommend maintaining your current activity level and consider adding more challenging workouts to further improve your fitness. Try incorporating interval training and varying your routine to prevent plateaus.';
    } else if (activityLevel === 'Very Active') {
      return 'Based on your very active profile, I recommend continuing your active lifestyle while focusing on recovery and injury prevention. Consider adding yoga or mobility work, and ensure you are getting adequate nutrition to support your activity level.';
    } else {
      return 'Based on your profile, I recommend consulting with a healthcare professional or certified trainer to determine the best activity plan for you. Start with activities you enjoy and gradually increase intensity as your fitness improves.';
    }
  };

  if (isLoading) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-safebite-text flex items-center">
            <Activity className="mr-2 h-5 w-5 text-safebite-teal" />
            Personalized Activity Recommendation
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
          <Dumbbell className="mr-2 h-5 w-5 text-safebite-teal" />
          Personalized Activity Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-safebite-card-bg-alt p-4 rounded-md">
            <p className="text-safebite-text">{recommendation}</p>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              className="text-safebite-teal border-safebite-teal hover:bg-safebite-teal hover:text-white"
              onClick={() => window.location.href = '/healthbox'}
            >
              Explore Health Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityRecommendation;
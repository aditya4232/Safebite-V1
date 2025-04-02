import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ActivityRecommendationProps {
  activityLevel: string | undefined;
  weeklyAnswers: Record<string, any> | undefined;
}

const ActivityRecommendation: React.FC<ActivityRecommendationProps> = ({ activityLevel, weeklyAnswers }) => {
  // Placeholder function for Gemini API call
  const getGeminiRecommendation = (activityLevel: string | undefined, weeklyAnswers: Record<string, any> | undefined): string => {
    // In a real implementation, this function would call the Gemini API
    // and return a personalized recommendation based on the user's data.
    // For now, it returns a placeholder recommendation.

    let recommendation = '';

    if (activityLevel === 'Sedentary') {
      recommendation = 'Gemini: Based on your sedentary activity level and weekly answers, we recommend starting with 15-minute walks a few times a week and gradually increasing the duration and intensity.';
    } else if (activityLevel === 'Lightly Active') {
      recommendation = 'Gemini: Based on your lightly active activity level and weekly answers, we recommend incorporating more moderate-intensity activities like brisk walking or cycling into your routine.';
    } else if (activityLevel === 'Active') {
      recommendation = 'Gemini: Based on your active activity level and weekly answers, we recommend maintaining your current activity level and consider adding more challenging workouts to further improve your fitness.';
    } else if (activityLevel === 'Very Active') {
      recommendation = 'Gemini: Based on your very active activity level and weekly answers, we recommend continuing your active lifestyle and focus on varying your workouts to prevent plateaus and injuries.';
    } else {
      recommendation = 'Gemini: We recommend consulting with a healthcare professional or certified trainer to determine the best activity plan for you.';
    }

    return recommendation;
  };

  const recommendation = getGeminiRecommendation(activityLevel, weeklyAnswers);

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle>Personalized Activity Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-safebite-text-secondary">{recommendation}</p>
      </CardContent>
    </Card>
  );
};

export default ActivityRecommendation;
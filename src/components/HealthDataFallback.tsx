import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, AlertTriangle, Heart, Brain, Utensils, 
  Clock, Calendar, RefreshCw, Info, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';

interface HealthDataFallbackProps {
  userProfile?: any;
  onRetry?: () => void;
  errorMessage?: string;
}

const HealthDataFallback: React.FC<HealthDataFallbackProps> = ({
  userProfile,
  onRetry,
  errorMessage
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();

  // Generate health metrics based on user profile or default values
  const generateHealthMetrics = () => {
    // Default metrics
    const defaultMetrics = [
      { name: 'Sleep Quality', value: 72, icon: <Clock className="h-5 w-5 text-blue-400" /> },
      { name: 'Physical Activity', value: 25, icon: <Activity className="h-5 w-5 text-green-400" /> },
      { name: 'Nutrition Balance', value: 24, icon: <Utensils className="h-5 w-5 text-orange-400" /> },
      { name: 'Stress Level', value: 70, icon: <Brain className="h-5 w-5 text-purple-400" /> },
    ];

    // If we have weekly check-in data, use it to adjust metrics
    if (userProfile?.weeklyCheckin?.answers) {
      const answers = userProfile.weeklyCheckin.answers;
      
      // Adjust sleep quality based on sleep hours
      if (answers.sleep_hours) {
        const sleepIndex = defaultMetrics.findIndex(m => m.name === 'Sleep Quality');
        if (sleepIndex >= 0) {
          defaultMetrics[sleepIndex].value = Math.min(100, Math.round(answers.sleep_hours * 10));
        }
      }
      
      // Adjust physical activity based on exercise minutes
      if (answers.exercise_minutes) {
        const activityIndex = defaultMetrics.findIndex(m => m.name === 'Physical Activity');
        if (activityIndex >= 0) {
          defaultMetrics[activityIndex].value = Math.min(100, Math.round(answers.exercise_minutes / 3));
        }
      }
      
      // Adjust nutrition balance based on fruit/vegetable servings
      if (answers.fruit_vegetable_servings) {
        const nutritionIndex = defaultMetrics.findIndex(m => m.name === 'Nutrition Balance');
        if (nutritionIndex >= 0) {
          defaultMetrics[nutritionIndex].value = Math.min(100, Math.round(answers.fruit_vegetable_servings * 15));
        }
      }
      
      // Adjust stress level based on stress level (inverse relationship)
      if (answers.stress_level) {
        const stressIndex = defaultMetrics.findIndex(m => m.name === 'Stress Level');
        if (stressIndex >= 0) {
          defaultMetrics[stressIndex].value = Math.min(100, Math.round(100 - (answers.stress_level * 10)));
        }
      }
    }
    
    return defaultMetrics;
  };

  // Generate health recommendations based on metrics
  const generateRecommendations = () => {
    const recommendations = [];
    const answers = userProfile?.weeklyCheckin?.answers || {};
    
    // Sleep recommendations
    if (!answers.sleep_hours || answers.sleep_hours < 7) {
      recommendations.push({
        title: "Improve Sleep Quality",
        description: "Aim for 7-9 hours of quality sleep each night. Establish a regular sleep schedule and create a restful environment.",
        priority: "medium"
      });
    }
    
    // Exercise recommendations
    if (!answers.exercise_minutes || answers.exercise_minutes < 150) {
      recommendations.push({
        title: "Increase Physical Activity",
        description: "Try to get at least 150 minutes of moderate exercise per week. Even short walks can make a difference.",
        priority: "high"
      });
    }
    
    // Nutrition recommendations
    if (!answers.fruit_vegetable_servings || answers.fruit_vegetable_servings < 5) {
      recommendations.push({
        title: "Boost Nutrition Balance",
        description: "Aim for at least 5 servings of fruits and vegetables daily. Incorporate more whole foods in your diet.",
        priority: "high"
      });
    }
    
    // Stress recommendations
    if (!answers.stress_level || answers.stress_level > 5) {
      recommendations.push({
        title: "Manage Stress Levels",
        description: "Practice stress-reduction techniques like meditation, deep breathing, or yoga. Take regular breaks during the day.",
        priority: "medium"
      });
    }
    
    // Water intake recommendations
    if (!answers.water_intake || answers.water_intake < 8) {
      recommendations.push({
        title: "Stay Hydrated",
        description: "Drink at least 8 cups of water daily. Set reminders or use a water tracking app to help.",
        priority: "medium"
      });
    }
    
    // If no specific recommendations, add a general one
    if (recommendations.length === 0) {
      recommendations.push({
        title: "Maintain Your Healthy Habits",
        description: "You're doing well! Continue your current health practices and consider setting new goals.",
        priority: "low"
      });
    }
    
    return recommendations;
  };

  const healthMetrics = generateHealthMetrics();
  const recommendations = generateRecommendations();

  // Handle retry button click
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
    
    toast({
      title: "Retrying",
      description: "Attempting to load health data charts again.",
    });
    
    // Track this interaction
    trackUserInteraction('retry_health_charts', {
      isGuest
    });
  };

  return (
    <Card className="sci-fi-card border-safebite-teal/30">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-safebite-text flex items-center">
              <Activity className="mr-2 h-5 w-5 text-safebite-teal" />
              Health Insights
              <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">Alternative View</Badge>
            </CardTitle>
            <p className="text-safebite-text-secondary text-sm">
              {errorMessage ? 
                "Charts unavailable - showing alternative health insights" : 
                "Health insights based on your weekly check-in data"}
            </p>
          </div>
          
          {errorMessage && (
            <Button
              variant="outline"
              size="sm"
              className="border-safebite-teal/30 text-safebite-teal"
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading Charts
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Error message if provided */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-safebite-text font-medium">Health Data Charts Error</p>
                <p className="text-safebite-text-secondary text-sm mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="metrics" className="mb-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="metrics">
              <Activity className="h-4 w-4 mr-2" />
              <span>Health Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              <Sparkles className="h-4 w-4 mr-2" />
              <span>Recommendations</span>
            </TabsTrigger>
          </TabsList>

          {/* Health Metrics Tab */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {healthMetrics.map((metric, index) => (
                <Card key={index} className="bg-safebite-card-bg-alt/30 border-safebite-card-bg-alt">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-safebite-text">{metric.name}</h3>
                      {metric.icon}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-safebite-text-secondary">Score</span>
                        <span className="text-safebite-text font-medium">{metric.value}%</span>
                      </div>
                      <div className="h-2.5 bg-safebite-card-bg rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-safebite-teal rounded-full" 
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Weekly Check-in Summary */}
            {userProfile?.weeklyCheckin?.answers && (
              <Card className="mt-6 bg-safebite-card-bg-alt/30 border-safebite-card-bg-alt">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-safebite-text flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-safebite-teal" />
                    Weekly Check-in Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userProfile.weeklyCheckin.answers.sleep_hours && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-blue-400 mr-2" />
                        <div>
                          <p className="text-xs text-safebite-text-secondary">Sleep Hours</p>
                          <p className="text-safebite-text font-medium">{userProfile.weeklyCheckin.answers.sleep_hours} hours</p>
                        </div>
                      </div>
                    )}
                    {userProfile.weeklyCheckin.answers.exercise_minutes && (
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-green-400 mr-2" />
                        <div>
                          <p className="text-xs text-safebite-text-secondary">Exercise</p>
                          <p className="text-safebite-text font-medium">{userProfile.weeklyCheckin.answers.exercise_minutes} minutes</p>
                        </div>
                      </div>
                    )}
                    {userProfile.weeklyCheckin.answers.water_intake && (
                      <div className="flex items-center">
                        <Heart className="h-5 w-5 text-blue-400 mr-2" />
                        <div>
                          <p className="text-xs text-safebite-text-secondary">Water Intake</p>
                          <p className="text-safebite-text font-medium">{userProfile.weeklyCheckin.answers.water_intake} cups</p>
                        </div>
                      </div>
                    )}
                    {userProfile.weeklyCheckin.answers.fruit_vegetable_servings && (
                      <div className="flex items-center">
                        <Utensils className="h-5 w-5 text-orange-400 mr-2" />
                        <div>
                          <p className="text-xs text-safebite-text-secondary">Fruits & Vegetables</p>
                          <p className="text-safebite-text font-medium">{userProfile.weeklyCheckin.answers.fruit_vegetable_servings} servings</p>
                        </div>
                      </div>
                    )}
                    {userProfile.weeklyCheckin.answers.home_cooked_meals && (
                      <div className="flex items-center">
                        <Utensils className="h-5 w-5 text-purple-400 mr-2" />
                        <div>
                          <p className="text-xs text-safebite-text-secondary">Home Cooked Meals</p>
                          <p className="text-safebite-text font-medium">{userProfile.weeklyCheckin.answers.home_cooked_meals} meals</p>
                        </div>
                      </div>
                    )}
                    {userProfile.weeklyCheckin.answers.stress_level && (
                      <div className="flex items-center">
                        <Brain className="h-5 w-5 text-red-400 mr-2" />
                        <div>
                          <p className="text-xs text-safebite-text-secondary">Stress Level</p>
                          <p className="text-safebite-text font-medium">{userProfile.weeklyCheckin.answers.stress_level}/10</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <Card key={index} className={`bg-safebite-card-bg-alt/30 border-l-4 ${
                  recommendation.priority === 'high' ? 'border-l-red-500' :
                  recommendation.priority === 'medium' ? 'border-l-amber-500' :
                  'border-l-green-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className={`rounded-full p-2 mr-3 ${
                        recommendation.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        recommendation.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        <Info className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-safebite-text">{recommendation.title}</h3>
                        <p className="text-safebite-text-secondary text-sm mt-1">{recommendation.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Call to action for weekly check-in */}
              {(!userProfile?.weeklyCheckin || !userProfile?.weeklyCheckin?.answers) && (
                <Card className="bg-safebite-teal/10 border-safebite-teal/30">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Sparkles className="h-5 w-5 text-safebite-teal mr-3 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-safebite-text">Complete Your Weekly Check-in</h3>
                        <p className="text-safebite-text-secondary text-sm mt-1">
                          Get more personalized health insights and recommendations by completing your weekly health check-in.
                        </p>
                        <Button
                          className="mt-3 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                          onClick={() => {
                            // Track this interaction
                            trackUserInteraction('weekly_checkin_cta_click', { isGuest });
                            
                            // Show toast
                            toast({
                              title: "Weekly Check-in",
                              description: "Opening weekly check-in questionnaire...",
                            });
                            
                            // This would typically trigger the weekly check-in modal
                            // For now, we'll just show a toast
                          }}
                        >
                          Start Weekly Check-in
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthDataFallback;

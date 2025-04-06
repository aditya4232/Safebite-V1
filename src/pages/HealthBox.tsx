import React, { useState, useEffect, Suspense } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Calculator, Activity, Heart, Droplet, Scale, Utensils, Brain,
  Microscope, Pill, Stethoscope, Syringe, Bug, Zap, Search,
  PieChart, Clock, AlertTriangle, Flame, Dumbbell, Thermometer, Star, Plus,
  Settings, BookOpen, Bookmark, CheckCircle, ShieldAlert, Eye, XCircle, Loader2
} from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';
import { Button } from '@/components/ui/button';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";

// Import all health tool components
import BMICalculator from '@/components/health-tools/BMICalculator';
import CalorieCalculator from '@/components/health-tools/CalorieCalculator';
import WaterIntakeCalculator from '@/components/health-tools/WaterIntakeCalculator';
import MacroCalculator from '@/components/health-tools/MacroCalculator';
import NutritionScoreCalculator from '@/components/health-tools/NutritionScoreCalculator';
import IdealWeightCalculator from '@/components/health-tools/IdealWeightCalculator';
import BodyFatCalculator from '@/components/health-tools/BodyFatCalculator';
import HeartRateCalculator from '@/components/health-tools/HeartRateCalculator';
import SymptomChecker from '@/components/health-tools/SymptomChecker';
// Import health tool components with error handling
const BloodPressureAnalyzer = React.lazy(() => import('@/components/health-tools/BloodPressureAnalyzer').catch(() => ({ default: PlaceholderTool })));
const SleepCalculator = React.lazy(() => import('@/components/health-tools/SleepCalculator').catch(() => ({ default: PlaceholderTool })));
const StressAnalyzer = React.lazy(() => import('@/components/health-tools/StressAnalyzer').catch(() => ({ default: PlaceholderTool })));
const ExerciseCalorieCalculator = React.lazy(() => import('@/components/health-tools/ExerciseCalorieCalculator').catch(() => ({ default: PlaceholderTool })));
const DiseaseRiskAssessment = React.lazy(() => import('@/components/health-tools/DiseaseRiskAssessment').catch(() => ({ default: PlaceholderTool })));
const MedicationReminder = React.lazy(() => import('@/components/health-tools/MedicationReminder').catch(() => ({ default: PlaceholderTool })));
const FoodSafetyChecker = React.lazy(() => import('@/components/health-tools/FoodSafetyChecker').catch(() => ({ default: PlaceholderTool })));

// Placeholder components for tools we haven't fully implemented yet
const PlaceholderTool = ({ title, icon, description }: { title?: string; icon?: React.ReactNode; description?: string }) => (
  <Card className="sci-fi-card">
    <CardHeader>
      <CardTitle className="flex items-center text-safebite-text">
        {icon || <Activity className="mr-2 h-5 w-5 text-safebite-teal" />}
        {title || 'Health Tool'}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-safebite-text-secondary mb-4">
        {description || 'This health tool is currently under development and will be available soon.'}
      </p>
      <div className="text-center p-4 bg-safebite-card-bg-alt rounded-md">
        <p className="text-safebite-teal">Coming Soon</p>
      </div>
    </CardContent>
  </Card>
);

// Interface for user's favorite tools
interface FavoriteTool {
  id: string;
  category: string;
  addedAt: number;
}

const HealthBox = () => {
  const [activeTab, setActiveTab] = useState('fitness');
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteTools, setFavoriteTools] = useState<FavoriteTool[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);

  // Load user's favorite tools on component mount
  useEffect(() => {
    loadFavoriteTools();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    trackHealthBoxInteraction('tab', value);
  };

  const toggleTool = (toolId: string) => {
    if (activeTools.includes(toolId)) {
      setActiveTools(activeTools.filter(id => id !== toolId));
    } else {
      setActiveTools([...activeTools, toolId]);
    }
    trackHealthBoxInteraction('tool', toolId);
  };

  // Toggle a tool as favorite
  const toggleFavorite = async (toolId: string, category: string) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        console.log('User not logged in, cannot save favorites');
        return;
      }

      // Check if tool is already a favorite
      const isFavorite = favoriteTools.some(tool => tool.id === toolId);

      let updatedFavorites: FavoriteTool[];

      if (isFavorite) {
        // Remove from favorites
        updatedFavorites = favoriteTools.filter(tool => tool.id !== toolId);
      } else {
        // Add to favorites
        updatedFavorites = [
          ...favoriteTools,
          { id: toolId, category, addedAt: Date.now() }
        ];
      }

      // Update state
      setFavoriteTools(updatedFavorites);

      // Save to Firebase
      const db = getFirestore(app);
      const userRef = doc(db, 'users', user.uid);

      await setDoc(userRef, {
        favoriteHealthTools: updatedFavorites
      }, { merge: true });

      trackHealthBoxInteraction(isFavorite ? 'unfavorite' : 'favorite', toolId);
    } catch (error) {
      console.error('Error toggling favorite tool:', error);
    }
  };

  // Load user's favorite tools from Firebase
  const loadFavoriteTools = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        console.log('User not logged in, cannot load favorites');
        return;
      }

      const db = getFirestore(app);
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().favoriteHealthTools) {
        setFavoriteTools(userSnap.data().favoriteHealthTools);
      }
    } catch (error) {
      console.error('Error loading favorite tools:', error);
    }
  };

  // Check if a tool is a favorite
  const isFavorite = (toolId: string): boolean => {
    return favoriteTools.some(tool => tool.id === toolId);
  };

  // Find tool name by ID and category
  const findToolName = (toolId: string, category: string): string => {
    const categoryTools = allTools[category as keyof typeof allTools] || [];
    const tool = categoryTools.find(tool => tool.id === toolId);
    return tool ? tool.name : 'Unknown Tool';
  };

  // Define all available tools (30+ health tools)
  const allTools = {
    fitness: [
      { id: 'bmi', name: 'BMI Calculator', component: <BMICalculator /> },
      { id: 'ideal-weight', name: 'Ideal Weight', component: <IdealWeightCalculator /> },
      { id: 'body-fat', name: 'Body Fat', component: <BodyFatCalculator /> },
      { id: 'heart-rate', name: 'Heart Rate Zones', component: <HeartRateCalculator /> },
      { id: 'exercise-calories', name: 'Exercise Calories', component: <ExerciseCalorieCalculator /> },
      { id: 'sleep', name: 'Sleep Calculator', component: <SleepCalculator /> },
      {
        id: 'fitness-age',
        name: 'Fitness Age',
        component: <PlaceholderTool
          title="Fitness Age Calculator"
          icon={<Activity className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Calculate your fitness age based on your physical activity, resting heart rate, and other metrics."
        />
      },
      {
        id: 'vo2-max',
        name: 'VO2 Max Estimator',
        component: <PlaceholderTool
          title="VO2 Max Estimator"
          icon={<Activity className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Estimate your VO2 max (maximal oxygen uptake) based on your fitness level and exercise performance."
        />
      },
      {
        id: 'workout-planner',
        name: 'Workout Planner',
        component: <PlaceholderTool
          title="Workout Planner"
          icon={<Activity className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Create personalized workout plans based on your fitness goals, available equipment, and time constraints."
        />
      },
      {
        id: 'recovery-calculator',
        name: 'Recovery Calculator',
        component: <PlaceholderTool
          title="Recovery Calculator"
          icon={<Clock className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Calculate optimal recovery time between workouts based on intensity, duration, and muscle groups targeted."
        />
      },
    ],
    nutrition: [
      { id: 'calories', name: 'Calorie Calculator', component: <CalorieCalculator /> },
      { id: 'water', name: 'Water Intake', component: <WaterIntakeCalculator /> },
      { id: 'macros', name: 'Macro Calculator', component: <MacroCalculator /> },
      { id: 'nutrition-score', name: 'Nutrition Score', component: <NutritionScoreCalculator /> },
      { id: 'food-safety', name: 'Food Safety Checker', component: <FoodSafetyChecker /> },
      {
        id: 'meal-planner',
        name: 'Meal Planner',
        component: <PlaceholderTool
          title="Meal Planner"
          icon={<Utensils className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Plan balanced meals based on your nutritional needs, preferences, and health goals."
        />
      },
      {
        id: 'nutrient-deficiency',
        name: 'Nutrient Deficiency',
        component: <PlaceholderTool
          title="Nutrient Deficiency Analyzer"
          icon={<AlertTriangle className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Identify potential nutrient deficiencies based on your diet and symptoms."
        />
      },
      {
        id: 'diet-comparison',
        name: 'Diet Comparison',
        component: <PlaceholderTool
          title="Diet Comparison Tool"
          icon={<PieChart className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Compare different diets (keto, vegan, paleo, etc.) and see which one might be best for your health goals."
        />
      },
      {
        id: 'grocery-list',
        name: 'Healthy Grocery List',
        component: <PlaceholderTool
          title="Healthy Grocery List Generator"
          icon={<CheckCircle className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Generate a healthy grocery list based on your nutritional needs and preferences."
        />
      },
    ],
    health: [
      { id: 'blood-pressure', name: 'Blood Pressure', component: <BloodPressureAnalyzer /> },
      { id: 'stress', name: 'Stress Analyzer', component: <StressAnalyzer /> },
      { id: 'disease-risk', name: 'Disease Risk', component: <DiseaseRiskAssessment /> },
      {
        id: 'metabolic-age',
        name: 'Metabolic Age',
        component: <PlaceholderTool
          title="Metabolic Age Calculator"
          icon={<Zap className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Calculate your metabolic age based on your BMR (Basal Metabolic Rate) compared to the average for your age group."
        />
      },
      {
        id: 'longevity',
        name: 'Longevity Calculator',
        component: <PlaceholderTool
          title="Longevity Calculator"
          icon={<Clock className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Estimate your life expectancy based on lifestyle factors, family history, and health metrics."
        />
      },
      {
        id: 'biological-age',
        name: 'Biological Age',
        component: <PlaceholderTool
          title="Biological Age Calculator"
          icon={<Dumbbell className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Calculate your biological age based on various biomarkers and lifestyle factors."
        />
      },
      {
        id: 'health-score',
        name: 'Health Score',
        component: <PlaceholderTool
          title="Health Score Calculator"
          icon={<Heart className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Get a comprehensive health score based on various health metrics and lifestyle factors."
        />
      },
      {
        id: 'immunity-score',
        name: 'Immunity Score',
        component: <PlaceholderTool
          title="Immunity Score Calculator"
          icon={<ShieldAlert className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Assess your immune system strength based on lifestyle, nutrition, and health factors."
        />
      },
    ],
    medical: [
      { id: 'symptom-checker', name: 'Symptom Checker', component: <SymptomChecker /> },
      { id: 'medication-reminder', name: 'Medication Reminder', component: <MedicationReminder /> },
      {
        id: 'covid-tracker',
        name: 'COVID-19 Tracker',
        component: <PlaceholderTool
          title="COVID-19 Tracker"
          icon={<Bug className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Track COVID-19 statistics and vaccination data worldwide using Disease.sh API."
        />
      },
      {
        id: 'drug-interaction',
        name: 'Drug Interaction',
        component: <PlaceholderTool
          title="Drug Interaction Checker"
          icon={<AlertTriangle className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Check for potential interactions between medications, supplements, and foods."
        />
      },
      {
        id: 'first-aid',
        name: 'First Aid Guide',
        component: <PlaceholderTool
          title="First Aid Guide"
          icon={<Heart className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Step-by-step guides for common first aid situations and emergencies."
        />
      },
      {
        id: 'vaccination-tracker',
        name: 'Vaccination Tracker',
        component: <PlaceholderTool
          title="Vaccination Tracker"
          icon={<Syringe className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Track your vaccinations and get reminders for boosters and recommended vaccines."
        />
      },
      {
        id: 'medical-id',
        name: 'Medical ID Card',
        component: <PlaceholderTool
          title="Medical ID Card Generator"
          icon={<Bookmark className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Create a digital medical ID card with important health information for emergencies."
        />
      },
    ],
    lifestyle: [
      {
        id: 'habit-tracker',
        name: 'Habit Tracker',
        component: <PlaceholderTool
          title="Habit Tracker"
          icon={<CheckCircle className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Track your daily habits and build healthy routines with reminders and progress tracking."
        />
      },
      {
        id: 'screen-time',
        name: 'Screen Time',
        component: <PlaceholderTool
          title="Screen Time Calculator"
          icon={<Clock className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Calculate and track your screen time and get recommendations for digital wellbeing."
        />
      },
      {
        id: 'posture-reminder',
        name: 'Posture Reminder',
        component: <PlaceholderTool
          title="Posture Reminder"
          icon={<Activity className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Set reminders to check and correct your posture throughout the day."
        />
      },
      {
        id: 'blue-light',
        name: 'Blue Light Calculator',
        component: <PlaceholderTool
          title="Blue Light Exposure Calculator"
          icon={<Eye className="mr-2 h-5 w-5 text-safebite-teal" />}
          description="Calculate your daily blue light exposure and get recommendations for eye health."
        />
      },
    ],
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>

      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-safebite-text mb-2">HealthBox</h1>
              <p className="text-safebite-text-secondary">
                30+ health and wellness calculators and tools to help you achieve your health goals
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() => setShowDashboardSettings(!showDashboardSettings)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Dashboard Settings
              </Button>
            </div>
          </div>

          {/* Search and filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-safebite-text-secondary" />
              <Input
                type="text"
                placeholder="Search health tools..."
                className="pl-10 bg-safebite-card-bg border-safebite-card-bg-alt"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="favorites-only"
                checked={showFavoritesOnly}
                onCheckedChange={setShowFavoritesOnly}
              />
              <Label htmlFor="favorites-only" className="text-safebite-text">
                Show favorites only
              </Label>
            </div>
          </div>

          {/* Dashboard settings panel */}
          {showDashboardSettings && (
            <Card className="mb-6 border-safebite-teal/30 bg-safebite-card-bg">
              <CardHeader>
                <CardTitle className="text-safebite-text flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-safebite-teal" />
                  Dashboard Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-safebite-text-secondary mb-4">
                  Select your favorite health tools to display on your dashboard. You can add up to 4 tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {favoriteTools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-3 bg-safebite-card-bg-alt rounded-md">
                      <span className="text-safebite-text">{findToolName(tool.id, tool.category)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(tool.id, tool.category)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {favoriteTools.length === 0 && (
                    <div className="col-span-full text-center py-4 text-safebite-text-secondary">
                      No favorite tools selected. Add tools by clicking the star icon on any tool.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="fitness" className="space-y-6" onValueChange={handleTabChange}>
            <div className="sci-fi-card p-4 overflow-x-auto">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <TabsTrigger value="fitness" className="flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  Fitness
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center">
                  <Utensils className="mr-2 h-4 w-4" />
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center">
                  <Heart className="mr-2 h-4 w-4" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Medical
                </TabsTrigger>
                <TabsTrigger value="lifestyle" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Lifestyle
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tool Selection */}
            <div className="sci-fi-card p-4">
              <h2 className="text-xl font-semibold text-safebite-text mb-4">Available Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allTools[activeTab as keyof typeof allTools]
                  .filter(tool => {
                    // Apply search filter
                    if (searchQuery) {
                      return tool.name.toLowerCase().includes(searchQuery.toLowerCase());
                    }
                    // Apply favorites filter
                    if (showFavoritesOnly) {
                      return isFavorite(tool.id);
                    }
                    return true;
                  })
                  .map(tool => (
                    <Card
                      key={tool.id}
                      className={`border ${activeTools.includes(tool.id) ? 'border-safebite-teal' : 'border-safebite-card-bg-alt'} hover:border-safebite-teal/70 transition-colors cursor-pointer`}
                      onClick={() => toggleTool(tool.id)}
                    >
                      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-md font-medium text-safebite-text">{tool.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1 h-8 w-8 ${isFavorite(tool.id) ? 'text-yellow-500' : 'text-safebite-text-secondary'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(tool.id, activeTab);
                          }}
                        >
                          <Star className={`h-5 w-5 ${isFavorite(tool.id) ? 'fill-yellow-500' : ''}`} />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {activeTools.includes(tool.id) && (
                          <div className="mt-4">
                            <Suspense fallback={<div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-safebite-teal" /></div>}>
                              {tool.component}
                            </Suspense>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                {/* No results message */}
                {allTools[activeTab as keyof typeof allTools].filter(tool => {
                  if (searchQuery) {
                    return tool.name.toLowerCase().includes(searchQuery.toLowerCase());
                  }
                  if (showFavoritesOnly) {
                    return isFavorite(tool.id);
                  }
                  return true;
                }).length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <div className="text-safebite-text-secondary mb-2">
                      {searchQuery ? (
                        <>No tools match your search "{searchQuery}"</>
                      ) : showFavoritesOnly ? (
                        <>No favorite tools in this category. Add favorites by clicking the star icon.</>
                      ) : (
                        <>No tools available in this category</>
                      )}
                    </div>
                    {(searchQuery || showFavoritesOnly) && (
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          setSearchQuery('');
                          setShowFavoritesOnly(false);
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Tools */}
            {activeTools.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTools.map(toolId => {
                  const tool = allTools[activeTab as keyof typeof allTools].find(t => t.id === toolId);
                  return tool ? (
                    <div key={toolId}>
                      {tool.component}
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {/* Empty State */}
            {activeTools.length === 0 && (
              <div className="text-center p-12 sci-fi-card">
                <Activity className="h-12 w-12 text-safebite-teal mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-safebite-text mb-2">No Tools Selected</h3>
                <p className="text-safebite-text-secondary mb-6">
                  Select one or more tools from the options above to get started
                </p>
              </div>
            )}
          </Tabs>

          <div className="mt-8 p-4 sci-fi-card">
            <h2 className="text-xl font-semibold text-safebite-text mb-4">Health Data Integration</h2>
            <p className="text-safebite-text-secondary mb-4">
              Connect your health devices and apps to get personalized recommendations and insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-safebite-card-bg-alt rounded-md flex items-center">
                <Activity className="h-5 w-5 text-safebite-teal mr-2" />
                <span className="text-safebite-text-secondary">Fitness Trackers</span>
              </div>
              <div className="p-4 bg-safebite-card-bg-alt rounded-md flex items-center">
                <Heart className="h-5 w-5 text-safebite-teal mr-2" />
                <span className="text-safebite-text-secondary">Heart Rate Monitors</span>
              </div>
              <div className="p-4 bg-safebite-card-bg-alt rounded-md flex items-center">
                <Scale className="h-5 w-5 text-safebite-teal mr-2" />
                <span className="text-safebite-text-secondary">Smart Scales</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-safebite-text-secondary mt-6 text-right">
            Created by Aditya Shenvi
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthBox;

import React, { useState, useEffect } from 'react';
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
  Settings, BookOpen, Bookmark, CheckCircle, ShieldAlert, Eye, XCircle, Loader2, Sparkles
} from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';
import userActivityService from '@/services/userActivityService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import SaveToDashboardModal from '@/components/SaveToDashboardModal';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import FoodChatBot from '@/components/FoodChatBot';

// Import only the stable health tool components
import BMICalculator from '@/components/health-tools/BMICalculator';
import CalorieCalculator from '@/components/health-tools/CalorieCalculator';
import WaterIntakeCalculator from '@/components/health-tools/WaterIntakeCalculator';
import MacroCalculator from '@/components/health-tools/MacroCalculator';
import NutritionScoreCalculator from '@/components/health-tools/NutritionScoreCalculator';
import IdealWeightCalculator from '@/components/health-tools/IdealWeightCalculator';
import BodyFatCalculator from '@/components/health-tools/BodyFatCalculator';
import HeartRateCalculator from '@/components/health-tools/HeartRateCalculator';

// Placeholder component for tools we haven't fully implemented yet
const PlaceholderTool = ({ title, icon, description }: { title?: string; icon?: React.ReactNode; description?: string }) => (
  <Card className="sci-fi-card border-t-2 border-t-safebite-teal/50 shadow-md">
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
      <div className="text-center p-4 bg-safebite-card-bg-alt rounded-md border border-safebite-teal/20">
        <p className="text-safebite-teal flex items-center justify-center">
          <Clock className="mr-2 h-4 w-4" />
          Coming Soon
        </p>
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
  const { toast } = useToast();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [currentToolData, setCurrentToolData] = useState<{id: string; name: string; data: any}>({id: '', name: '', data: null});
  const { isGuest } = useGuestMode();

  // User data for personalized chat suggestions
  const [userData, setUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);

  // Load user's favorite tools on component mount
  useEffect(() => {
    loadFavoriteTools();
  }, []);

  // Load user data for personalized chat
  useEffect(() => {
    const loadUserData = async () => {
      if (!isGuest && auth.currentUser) {
        try {
          // Get user profile data
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          // Get user activity data
          const activityRef = doc(db, 'user_activities', auth.currentUser.uid);
          const activityDoc = await getDoc(activityRef);

          if (activityDoc.exists()) {
            const data = activityDoc.data();
            setUserActivity(data.activities || []);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [isGuest]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Track this interaction for ML learning
    trackHealthBoxInteraction('tab', value);
    userActivityService.trackActivity('healthbox', 'change-tab', {
      tab: value
    });
  };

  const toggleTool = (toolId: string) => {
    const isActive = activeTools.includes(toolId);
    if (isActive) {
      setActiveTools(activeTools.filter(id => id !== toolId));
    } else {
      setActiveTools([...activeTools, toolId]);
    }

    // Track this interaction for ML learning
    trackHealthBoxInteraction('tool', toolId);
    userActivityService.trackActivity('healthbox', isActive ? 'close-tool' : 'open-tool', {
      tool: toolId
    });
  };

  const toggleFavorite = (toolId: string, category: string) => {
    try {
      const isFavorite = favoriteTools.some(tool => tool.id === toolId);
      let updatedFavorites: FavoriteTool[];

      if (isFavorite) {
        updatedFavorites = favoriteTools.filter(tool => tool.id !== toolId);
      } else {
        updatedFavorites = [...favoriteTools, { id: toolId, category, addedAt: Date.now() }];
      }

      setFavoriteTools(updatedFavorites);
      saveFavoriteTools(updatedFavorites);

      // Track this interaction for ML learning
      trackHealthBoxInteraction('favorite', toolId);
      userActivityService.trackActivity('healthbox', isFavorite ? 'remove-favorite' : 'add-favorite', {
        tool: toolId
      });

      toast({
        title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: `${toolId} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const loadFavoriteTools = async () => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore(app);
        const docRef = doc(db, 'userPreferences', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().favoriteHealthTools) {
          setFavoriteTools(docSnap.data().favoriteHealthTools);
        }
      }
    } catch (error) {
      console.error('Error loading favorite tools:', error);
    }
  };

  const saveFavoriteTools = async (favorites: FavoriteTool[]) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore(app);
        const docRef = doc(db, 'userPreferences', user.uid);
        await setDoc(docRef, { favoriteHealthTools: favorites }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving favorite tools:', error);
    }
  };

  // Handle saving health tool results to dashboard
  const handleSaveResults = (toolId: string, toolName: string, data: any) => {
    if (isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save results to your dashboard.",
        variant: "destructive",
      });
      return;
    }

    setCurrentToolData({
      id: toolId,
      name: toolName,
      data: data
    });
    setSaveModalOpen(true);

    // Track this interaction for ML learning
    trackHealthBoxInteraction('save_results', toolId);
    userActivityService.trackActivity('healthbox', 'save-results', {
      tool: toolId
    });
  };

  // Define all health tools
  const healthTools = {
    fitness: [
      {
        id: 'bmi-calculator',
        title: 'BMI Calculator',
        icon: <Scale className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <BMICalculator onSaveResults={handleSaveResults} />
      },
      {
        id: 'calorie-calculator',
        title: 'Calorie Calculator',
        icon: <Flame className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <CalorieCalculator />
      },
      {
        id: 'water-intake-calculator',
        title: 'Water Intake Calculator',
        icon: <Droplet className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <WaterIntakeCalculator />
      },
      {
        id: 'macro-calculator',
        title: 'Macro Calculator',
        icon: <PieChart className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <MacroCalculator />
      },
      {
        id: 'ideal-weight-calculator',
        title: 'Ideal Weight Calculator',
        icon: <Scale className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <IdealWeightCalculator />
      },
      {
        id: 'body-fat-calculator',
        title: 'Body Fat Calculator',
        icon: <Dumbbell className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <BodyFatCalculator />
      }
    ],
    nutrition: [
      {
        id: 'nutrition-score-calculator',
        title: 'Nutrition Score Calculator',
        icon: <Star className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <NutritionScoreCalculator />
      },
      {
        id: 'sleep-calculator',
        title: 'Sleep Calculator',
        icon: <Clock className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <PlaceholderTool title="Sleep Calculator" icon={<Clock className="mr-2 h-5 w-5 text-safebite-teal" />} />
      }
    ],
    medical: [
      {
        id: 'heart-rate-calculator',
        title: 'Heart Rate Calculator',
        icon: <Heart className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <HeartRateCalculator />
      },
      {
        id: 'blood-pressure-analyzer',
        title: 'Blood Pressure Analyzer',
        icon: <Activity className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <PlaceholderTool title="Blood Pressure Analyzer" icon={<Activity className="mr-2 h-5 w-5 text-safebite-teal" />} />
      },
      {
        id: 'stress-analyzer',
        title: 'Stress Analyzer',
        icon: <Brain className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <PlaceholderTool title="Stress Analyzer" icon={<Brain className="mr-2 h-5 w-5 text-safebite-teal" />} />
      }
    ],
    safety: [
      {
        id: 'food-safety-checker',
        title: 'Food Safety Checker',
        icon: <ShieldAlert className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <PlaceholderTool title="Food Safety Checker" icon={<ShieldAlert className="mr-2 h-5 w-5 text-safebite-teal" />} />
      },
      {
        id: 'medication-reminder',
        title: 'Medication Reminder',
        icon: <Pill className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <PlaceholderTool title="Medication Reminder" icon={<Pill className="mr-2 h-5 w-5 text-safebite-teal" />} />
      },
      {
        id: 'disease-risk-assessment',
        title: 'Disease Risk Assessment',
        icon: <Stethoscope className="mr-2 h-5 w-5 text-safebite-teal" />,
        component: <PlaceholderTool title="Disease Risk Assessment" icon={<Stethoscope className="mr-2 h-5 w-5 text-safebite-teal" />} />
      }
    ]
  };

  // Filter tools based on search query and favorites setting
  const filterTools = (tools: any[]) => {
    let filteredTools = tools;

    if (searchQuery) {
      filteredTools = tools.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showFavoritesOnly) {
      filteredTools = filteredTools.filter(tool =>
        favoriteTools.some(fav => fav.id === tool.id)
      );
    }

    return filteredTools;
  };

  // Get all tools for the current tab
  const currentTabTools = healthTools[activeTab as keyof typeof healthTools] || [];
  const filteredTools = filterTools(currentTabTools);

  // Get favorite tools for the favorites tab
  const allTools = Object.values(healthTools).flat();
  const favoriteToolsList = allTools.filter(tool =>
    favoriteTools.some(fav => fav.id === tool.id)
  );

  return (
    <div className="flex min-h-screen bg-safebite-bg">
      <DashboardSidebar />
      <main className="flex-1 p-6 ml-[220px]">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-safebite-text mb-6">
            <Sparkles className="inline-block mr-2 h-6 w-6 text-safebite-teal" />
            Healthbox
          </h1>
          <p className="text-safebite-text-secondary mb-6">
            Explore our collection of health tools to monitor and improve your wellbeing.
          </p>

          <div className="mb-8 p-4 bg-safebite-card-bg rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-safebite-text-secondary" />
              <Input
                placeholder="Search health tools..."
                className="pl-8 bg-safebite-card-bg border-safebite-card-bg-alt"
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

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8 bg-safebite-card-bg rounded-lg overflow-hidden">
              <TabsTrigger value="fitness" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                <Dumbbell className="mr-2 h-4 w-4" />
                Fitness
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                <Utensils className="mr-2 h-4 w-4" />
                Nutrition
              </TabsTrigger>
              <TabsTrigger value="medical" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                <Stethoscope className="mr-2 h-4 w-4" />
                Medical
              </TabsTrigger>
              <TabsTrigger value="safety" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Safety
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                <Bookmark className="mr-2 h-4 w-4" />
                Favorites
              </TabsTrigger>
            </TabsList>

            {/* Active tools section */}
            {activeTools.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-safebite-text mb-4">Active Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {activeTools.map(toolId => {
                    const tool = allTools.find(t => t.id === toolId);
                    if (!tool) return null;

                    return (
                      <Card key={tool.id} className="sci-fi-card border-t-2 border-t-safebite-teal shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center text-safebite-text">
                            {tool.icon}
                            {tool.title}
                          </CardTitle>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(tool.id, activeTab)}
                              className="h-8 w-8"
                            >
                              {favoriteTools.some(fav => fav.id === tool.id) ? (
                                <Star className="h-4 w-4 fill-safebite-teal text-safebite-teal" />
                              ) : (
                                <Star className="h-4 w-4 text-safebite-text-secondary" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleTool(tool.id)}
                              className="h-8 w-8"
                            >
                              <XCircle className="h-4 w-4 text-safebite-text-secondary" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {tool.component}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab content */}
            <TabsContent value={activeTab} className="mt-0">
              {filteredTools.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="mx-auto h-12 w-12 text-safebite-text-secondary mb-4" />
                  <h3 className="text-xl font-semibold text-safebite-text mb-2">No tools found</h3>
                  <p className="text-safebite-text-secondary">
                    {showFavoritesOnly
                      ? "You don't have any favorite tools in this category yet."
                      : "No tools match your search criteria."}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {filteredTools.map(tool => {
                  const isActive = activeTools.includes(tool.id);
                  if (isActive) return null;

                  return (
                    <Card key={tool.id} className="sci-fi-card border-t-2 border-t-safebite-teal shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center text-safebite-text">
                          {tool.icon}
                          {tool.title}
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(tool.id, activeTab)}
                            className="h-8 w-8"
                          >
                            {favoriteTools.some(fav => fav.id === tool.id) ? (
                              <Star className="h-4 w-4 fill-safebite-teal text-safebite-teal" />
                            ) : (
                              <Star className="h-4 w-4 text-safebite-text-secondary" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTool(tool.id)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-4 w-4 text-safebite-text-secondary" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          onClick={() => toggleTool(tool.id)}
                          className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 font-medium shadow-md"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Open Tool
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-0">
              {favoriteToolsList.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="mx-auto h-12 w-12 text-safebite-text-secondary mb-4" />
                  <h3 className="text-xl font-semibold text-safebite-text mb-2">No favorites yet</h3>
                  <p className="text-safebite-text-secondary">
                    Star your favorite tools to access them quickly from this tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {favoriteToolsList.map(tool => {
                    const isActive = activeTools.includes(tool.id);
                    if (isActive) return null;

                    return (
                      <Card key={tool.id} className="sci-fi-card border-t-2 border-t-safebite-teal shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center text-safebite-text">
                            {tool.icon}
                            {tool.title}
                          </CardTitle>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(tool.id, 'favorites')}
                              className="h-8 w-8"
                            >
                              <Star className="h-4 w-4 fill-safebite-teal text-safebite-teal" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleTool(tool.id)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-4 w-4 text-safebite-text-secondary" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Button
                            onClick={() => toggleTool(tool.id)}
                            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 font-medium shadow-md"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Open Tool
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Save to Dashboard Modal */}
      <SaveToDashboardModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        toolId={currentToolData.id}
        toolName={currentToolData.name}
        toolData={currentToolData.data}
      />

      {/* AI Chatbot */}
      <FoodChatBot
        currentPage="healthbox"
        userData={{
          profile: userData,
          recentActivity: userActivity
        }}
        autoOpen={true}
        initialMessage="Welcome to Healthbox! I can help you find the right health tools for your needs. What health aspect would you like to focus on today?"
      />
    </div>
  );
};

export default HealthBox;

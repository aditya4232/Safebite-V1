import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Info, Zap, ArrowRight, Trophy } from 'lucide-react';
import Footer from '@/components/Footer';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import ProgressChart from '@/components/ProgressChart';
// Food search components removed from dashboard
import HealthBox from '@/components/HealthBox';
import ActivityRecommendation from '@/components/ActivityRecommendation';
import { useGuestMode } from '@/hooks/useGuestMode';
import FoodGroupChart from '@/components/FoodGroupChart';
import MacronutrientChart from '@/components/MacronutrientChart';
import GuestBanner from '@/components/GuestBanner';
import HealthInsights from '@/components/HealthInsights';
import { getAuth } from "firebase/auth";
import { app } from "../main";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
// Import Loader when needed
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { generateHealthTips } from "@/services/healthTipsService";
import TermsPopup from "@/components/TermsPopup";

// Define food recommendations based on health goals
const foodRecommendations: Record<string, string[]> = {
  'Weight Loss': ['Sprouts', 'Ragi', 'Daliya', 'Makhana', 'Moong Dal Chilla'],
  'Muscle Gain': ['Paneer Bhurji', 'Soya Chunks', 'Egg Bhurji', 'Chicken Tikka', 'Rajma Rice'],
  'General Health': ['Walnuts', 'Almonds', 'Oats', 'Olive Oil', 'Steamed Vegetables'],
  'Diabetes': ['Bitter Gourd Juice', 'Oats Upma', 'Chia Seeds', 'Flaxseeds', 'Dalia'],
  'Heart Issues': ['Walnuts', 'Almonds', 'Oats', 'Olive Oil', 'Steamed Vegetables'],
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isGuest } = useGuestMode(); // Keep guest mode logic for now
  const [showWeeklyPrompt, setShowWeeklyPrompt] = useState(false);
  // Recent foods removed from dashboard
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  const [userProfile, setUserProfile] = useState<any>(null); // State for user profile
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Loading state for profile
  const [profileError, setProfileError] = useState(''); // Error state for profile loading
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newHealthGoal, setNewHealthGoal] = useState('');
  const [userXP, setUserXP] = useState(10); // Default XP for all users in beta stage
  // Search functionality removed from dashboard

  const [caloriesToday, setCaloriesToday] = useState(1450);
  const [foodGroupData, setFoodGroupData] = useState([
    { foodGroup: 'Fruits', value: 2 },
    { foodGroup: 'Vegetables', value: 3 },
    { foodGroup: 'Grains', value: 4 },
    { foodGroup: 'Protein', value: 5 },
    { foodGroup: 'Dairy', value: 2 },
    { foodGroup: 'Fats', value: 1 },
    { foodGroup: 'Sugars', value: 1 },
  ]);

  // Nutrient score data for tracking nutritional quality over time
  const [nutrientScoreData, setNutrientScoreData] = useState([
    { date: 'Mon', value: 75 },
    { date: 'Tue', value: 82 },
    { date: 'Wed', value: 78 },
    { date: 'Thu', value: 85 },
    { date: 'Fri', value: 80 },
    { date: 'Sat', value: 72 },
    { date: 'Sun', value: 79 },
  ]);

  // Exercise data for tracking activity
  const [exerciseData, setExerciseData] = useState([
    { date: 'Mon', value: 30 },
    { date: 'Tue', value: 45 },
    { date: 'Wed', value: 20 },
    { date: 'Thu', value: 60 },
    { date: 'Fri', value: 35 },
    { date: 'Sat', value: 75 },
    { date: 'Sun', value: 25 },
  ]);
  const [macronutrientData, setMacronutrientData] = useState([
    { name: 'Carbohydrates', value: 400 },
    { name: 'Protein', value: 300 },
    { name: 'Fat', value: 200 },
  ]);
  const [pieChartColor] = useState(["#8884d8", "#82ca9d", "#ffc658"])
  const [weeklyProteinData] = useState([
    { date: 'Mon', value: 50 },
    { date: 'Tue', value: 60 },
    { date: 'Wed', value: 70 },
    { date: 'Thu', value: 55 },
    { date: 'Fri', value: 45 },
    { date: 'Sat', value: 80 },
    { date: 'Sun', value: 65 },
  ]);
  const [waterIntake, setWaterIntake] = useState('1.8L');
  const [proteinIntake, setProteinIntake] = useState('85g');
  const [activeMinutes, setActiveMinutes] = useState(45);

  // Function to update stats based on user profile and weekly check-in data
  const updateStats = (profile: any, weeklyCheckin: any) => {
    if (profile) {
      // Calculate estimated daily calories based on profile data
      let estimatedCalories = 1450; // Default value

      // Basic calculation based on activity level from questionnaire
      if (profile.activity_level === 'Sedentary') {
        estimatedCalories = 1600;
      } else if (profile.activity_level === 'Lightly Active') {
        estimatedCalories = 1800;
      } else if (profile.activity_level === 'Active') {
        estimatedCalories = 2000;
      } else if (profile.activity_level === 'Very Active') {
        estimatedCalories = 2200;
      }

      // Adjust based on health goal from questionnaire
      if (profile.health_goals === 'Weight Loss') {
        estimatedCalories = Math.round(estimatedCalories * 0.85); // 15% deficit
      } else if (profile.health_goals === 'Muscle Gain') {
        estimatedCalories = Math.round(estimatedCalories * 1.1); // 10% surplus
      }

      // Set calorie target based on questionnaire data
      setCaloriesToday(profile.calories_today || estimatedCalories);

      // Set water intake based on questionnaire data
      let waterIntakeValue = '1.8L';
      if (profile.water_intake) {
        if (profile.water_intake === '<1L') waterIntakeValue = '0.8L';
        else if (profile.water_intake === '1-2L') waterIntakeValue = '1.5L';
        else if (profile.water_intake === '2-3L') waterIntakeValue = '2.5L';
        else if (profile.water_intake === '3L+') waterIntakeValue = '3.5L';
      }
      setWaterIntake(waterIntakeValue);

      // Set protein intake based on questionnaire data
      let proteinValue = '85g';
      if (profile.protein_source) {
        if (profile.protein_source === 'Veg') proteinValue = '60g';
        else if (profile.protein_source === 'Dairy') proteinValue = '70g';
        else if (profile.protein_source === 'Meat') proteinValue = '100g';
        else if (profile.protein_source === 'Eggs') proteinValue = '80g';
        else if (profile.protein_source === 'Mix') proteinValue = '90g';
      }
      setProteinIntake(proteinValue);

      // Set active minutes based on questionnaire data
      let activeMinutesValue = 45;
      if (profile.exercise_frequency) {
        if (profile.exercise_frequency === 'Never') activeMinutesValue = 15;
        else if (profile.exercise_frequency === 'Weekly') activeMinutesValue = 30;
        else if (profile.exercise_frequency === '3-4 Times a Week') activeMinutesValue = 45;
        else if (profile.exercise_frequency === 'Daily') activeMinutesValue = 60;
      }
      setActiveMinutes(activeMinutesValue);

      // Update food group data based on dietary preferences from questionnaire
      if (profile.dietary_preferences) {
        if (profile.dietary_preferences === 'Veg' || profile.dietary_preferences === 'Vegan') {
          setFoodGroupData([
            { foodGroup: 'Fruits', value: 3 },
            { foodGroup: 'Vegetables', value: 4 },
            { foodGroup: 'Grains', value: 5 },
            { foodGroup: 'Plant Protein', value: 4 },
            { foodGroup: 'Dairy', value: profile.dietary_preferences === 'Vegan' ? 0 : 2 },
            { foodGroup: 'Fats', value: 2 },
            { foodGroup: 'Sugars', value: 1 },
          ]);
        } else if (profile.dietary_preferences === 'Keto') {
          setFoodGroupData([
            { foodGroup: 'Fruits', value: 1 },
            { foodGroup: 'Vegetables', value: 3 },
            { foodGroup: 'Grains', value: 1 },
            { foodGroup: 'Protein', value: 5 },
            { foodGroup: 'Dairy', value: 3 },
            { foodGroup: 'Fats', value: 5 },
            { foodGroup: 'Sugars', value: 0 },
          ]);
        } else if (profile.dietary_preferences === 'Non-Veg') {
          setFoodGroupData([
            { foodGroup: 'Fruits', value: 2 },
            { foodGroup: 'Vegetables', value: 3 },
            { foodGroup: 'Grains', value: 4 },
            { foodGroup: 'Protein', value: 5 },
            { foodGroup: 'Dairy', value: 2 },
            { foodGroup: 'Fats', value: 2 },
            { foodGroup: 'Sugars', value: 1 },
          ]);
        }
      }

      // Update macronutrient data based on health goals from questionnaire
      if (profile.health_goals) {
        if (profile.health_goals === 'Weight Loss') {
          setMacronutrientData([
            { name: 'Carbohydrates', value: 300 },
            { name: 'Protein', value: 350 },
            { name: 'Fat', value: 150 },
          ]);
        } else if (profile.health_goals === 'Muscle Gain') {
          setMacronutrientData([
            { name: 'Carbohydrates', value: 450 },
            { name: 'Protein', value: 400 },
            { name: 'Fat', value: 200 },
          ]);
        } else if (profile.health_goals === 'General Health') {
          setMacronutrientData([
            { name: 'Carbohydrates', value: 400 },
            { name: 'Protein', value: 300 },
            { name: 'Fat', value: 200 },
          ]);
        }
      }
    }

    // Update stats based on weekly check-in answers if available
    if (weeklyCheckin && weeklyCheckin.answers) {
      // Update home-cooked meals data
      if (weeklyCheckin.answers.home_cooked !== undefined) {
        const homeCookedMeals = weeklyCheckin.answers.home_cooked;
        // More home-cooked meals generally means healthier eating
        if (homeCookedMeals > 15) {
          // Adjust nutrition score positively
          setNutrientScoreData(prev => prev.map(day => ({
            ...day,
            value: Math.min(100, day.value + 5) // Increase score but cap at 100
          })));
        }
      }

      // Update water intake data
      if (weeklyCheckin.answers.water_intake !== undefined) {
        const waterGlasses = weeklyCheckin.answers.water_intake;
        setWaterIntake(Math.round(waterGlasses * 0.25) + 'L'); // Convert glasses to liters

        // Update weekly water data
        setWeeklyWaterData([
          { date: 'Mon', value: Math.max(0, waterGlasses - 1) },
          { date: 'Tue', value: waterGlasses },
          { date: 'Wed', value: Math.max(0, waterGlasses + 1) },
          { date: 'Thu', value: Math.max(0, waterGlasses - 2) },
          { date: 'Fri', value: Math.max(0, waterGlasses - 1) },
          { date: 'Sat', value: Math.max(0, waterGlasses + 2) },
          { date: 'Sun', value: waterGlasses },
        ]);
      }

      // Update exercise data
      if (weeklyCheckin.answers.exercise !== undefined) {
        const weeklyExercise = weeklyCheckin.answers.exercise;
        setActiveMinutes(Math.round(weeklyExercise / 7)); // Daily average

        // Update exercise data
        setExerciseData([
          { date: 'Mon', value: Math.round(weeklyExercise * 0.2) },
          { date: 'Tue', value: Math.round(weeklyExercise * 0.15) },
          { date: 'Wed', value: Math.round(weeklyExercise * 0.1) },
          { date: 'Thu', value: Math.round(weeklyExercise * 0.25) },
          { date: 'Fri', value: Math.round(weeklyExercise * 0.1) },
          { date: 'Sat', value: Math.round(weeklyExercise * 0.15) },
          { date: 'Sun', value: Math.round(weeklyExercise * 0.05) },
        ]);
      }

      // Update junk food data
      if (weeklyCheckin.answers.junk_food !== undefined) {
        const junkFoodMeals = weeklyCheckin.answers.junk_food;
        // More junk food means lower nutrition score
        if (junkFoodMeals > 5) {
          // Adjust nutrition score negatively
          setNutrientScoreData(prev => prev.map(day => ({
            ...day,
            value: Math.max(50, day.value - (junkFoodMeals - 5) * 2) // Decrease score but floor at 50
          })));
        }
      }

      // Update energy level data
      if (weeklyCheckin.answers.energy_level) {
        // Adjust weekly progress data based on energy levels
        const energyLevel = weeklyCheckin.answers.energy_level;
        let energyMultiplier = 1.0;

        if (energyLevel === 'Very Low') energyMultiplier = 0.8;
        else if (energyLevel === 'Low') energyMultiplier = 0.9;
        else if (energyLevel === 'High') energyMultiplier = 1.1;
        else if (energyLevel === 'Very High') energyMultiplier = 1.2;

        // Apply energy multiplier to weekly progress data
        setWeeklyProgressData(prev => prev.map(day => ({
          ...day,
          value: Math.round(day.value * energyMultiplier)
        })));
      }
    }
  };

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user && !isGuest) {
        setIsLoadingProfile(true);
        setProfileError('');
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserProfile(userData.profile); // Assuming answers are stored under 'profile'
            updateStats(userData.profile, userData.weeklyCheckin); // Update stats based on profile data
            // Set user XP if available, otherwise default to 10 for beta stage
            setUserXP(userData.xp || 10);
            // Check if questionnaire is completed
            if (!userData.questionnaireCompleted) {
              navigate('/questionnaire'); // Redirect if not completed
            }
          } else {
            console.log("No such document! Redirecting to questionnaire.");
            // If no profile exists, redirect to questionnaire
            navigate('/questionnaire');
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfileError("Failed to load your profile. Please try again later.");
          toast({
            title: "Profile Load Error",
            description: "Could not load your profile data.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (!isGuest) {
        // If user is null but not a guest, likely an auth issue, redirect to login
        navigate('/auth/login');
      } else {
        // If it's a guest, stop loading
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user, db, navigate, isGuest, toast]);


  // Weekly prompt logic
  useEffect(() => {
    if (!isGuest && userProfile) { // Only run if logged in and profile loaded
      const lastPromptTime = localStorage.getItem('lastWeeklyPromptTime');
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // Milliseconds in a week

      if (!lastPromptTime || (now - parseInt(lastPromptTime, 10)) > oneWeek) {
         // Show prompt after a delay (e.g., 3 seconds)
         const timer = setTimeout(() => {
            setShowWeeklyPrompt(true);
            localStorage.setItem('lastWeeklyPromptTime', now.toString()); // Update timestamp when shown
         }, 3000);
         return () => clearTimeout(timer);
      }
    }
  }, [isGuest, userProfile]); // Depend on userProfile to ensure it runs after profile load


  // Food search functionality moved to FoodSearch page

  const dismissWeeklyPrompt = () => {
    setShowWeeklyPrompt(false);
  };

  const [weeklyProgressData, setWeeklyProgressData] = useState([
    { date: 'Mon', value: 1200 },
    { date: 'Tue', value: 1350 },
    { date: 'Wed', value: 1500 },
    { date: 'Thu', value: 1400 },
    { date: 'Fri', value: 1800 },
    { date: 'Sat', value: 1600 },
    { date: 'Sun', value: 1450 },
  ]);

  const [weeklyWaterData, setWeeklyWaterData] = useState([
    { date: 'Mon', value: 5 },
    { date: 'Tue', value: 6 },
    { date: 'Wed', value: 7 },
    { date: 'Thu', value: 5 },
    { date: 'Fri', value: 4 },
    { date: 'Sat', value: 8 },
    { date: 'Sun', value: 6 },
  ]);

  // Generate health tips based on user profile and weekly data
  const healthTips = userProfile ? generateHealthTips(
    userProfile,
    userProfile?.weeklyCheckin?.answers || null
  ) : [];

  // Debug information
  useEffect(() => {
    console.log('Dashboard render state:', {
      isGuest,
      isLoadingProfile,
      userProfile: userProfile ? 'exists' : 'null',
      profileError,
      user: user ? 'logged in' : 'not logged in'
    });
  }, [isGuest, isLoadingProfile, userProfile, profileError, user]);

  // Handle terms acceptance
  const handleTermsAccept = () => {
    console.log('Terms accepted');
    // You could trigger additional actions here if needed
  };

  // Handle any errors during rendering
  if (profileError) {
    console.error('Profile error:', profileError);
    return (
      <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
          <p className="text-safebite-text-secondary mb-4">{profileError}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingProfile && !isGuest) {
    return (
      <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-safebite-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-safebite-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TermsPopup onAccept={handleTermsAccept} />
      <div className="min-h-screen bg-safebite-dark-blue">
        <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
          Under Development
        </div>

        <DashboardSidebar />

        <main className="md:ml-64 min-h-screen">
          <div className="p-4 sm:p-6 md:p-8">
            {/* Guest Banner */}
            {isGuest && <GuestBanner />}

          {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-safebite-text mb-2">
                  {isGuest ? 'Welcome, Guest' : user?.displayName ? `Welcome back, ${user.displayName}` : user?.email ? `Welcome back, ${user.email}` : 'Welcome back!'}
                </h1>
                <p className="text-safebite-text-secondary">
                {isLoadingProfile ? "Loading your profile..." : profileError ? profileError : isGuest ? "Explore SafeBite's features (limited in guest mode)" : (
                  <>
                    Your primary goal: {userProfile?.health_goals || 'No Goal'}
                    {!isEditingGoal ? (
                      <Button variant="link" className="ml-2" onClick={() => {setIsEditingGoal(true); setNewHealthGoal(userProfile?.health_goals || '')}}>
                        Edit
                      </Button>
                    ) : null}
                  </>
                )}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center">
                <div className="mr-4 flex items-center bg-safebite-card-bg-alt px-3 py-1 rounded-full">
                  <Trophy className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-safebite-text font-medium">{userXP} XP</span>
                </div>
                <Button variant="outline" className="mr-2 border-safebite-card-bg-alt hover:border-safebite-teal">
                  <Bell className="mr-2 h-5 w-5" />
                  <Badge className="ml-1 bg-safebite-teal text-safebite-dark-blue">3</Badge>
                </Button>
              </div>
            </div>
          </div>

          {/* Edit Health Goal */}
            {!isGuest && userProfile && isEditingGoal && (
            <Card className="mb-8 sci-fi-card">
              <CardHeader>
                <CardTitle>Update Your Health Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={newHealthGoal}
                  onChange={(e) => setNewHealthGoal(e.target.value)}
                  className="w-full sci-fi-input"
                >
                  <option value="">Select a goal</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="General Health">General Health</option>
                  <option value="No Goal">No Goal</option>
                </select>
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" onClick={() => setIsEditingGoal(false)}>Cancel</Button>
                  <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80" onClick={async () => {
                    if (user) {
                      const userRef = doc(db, "users", user.uid);
                      try {
                        await setDoc(userRef, { profile: { ...userProfile, health_goals: newHealthGoal } }, { merge: true });
                        setUserProfile({...userProfile, health_goals: newHealthGoal});
                        updateStats({...userProfile, health_goals: newHealthGoal}, null);
                        toast({ title: "Goal Updated", description: "Your health goal has been updated." });
                      } catch (error: any) {
                        toast({ title: "Error", description: error.message, variant: "destructive" });
                      } finally {
                        setIsEditingGoal(false);
                      }
                    }
                  }}>Save</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly prompt modal - only show for logged-in users */}
            {showWeeklyPrompt && !isGuest && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="sci-fi-card max-w-md w-full">
                <h3 className="text-xl font-bold text-safebite-text mb-4">Weekly Health Check</h3>
                <p className="text-safebite-text-secondary mb-6">
                  Please take a moment to answer a few questions about your health this week.
                  This helps us provide better recommendations.
                </p>
                <div className="flex justify-end gap-4">
                  <Button
                    variant="ghost"
                    onClick={dismissWeeklyPrompt}
                    className="text-safebite-text-secondary hover:text-safebite-text"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/weekly-questions');
                      dismissWeeklyPrompt();
                    }}
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                  >
                    Start Now
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Rest of dashboard */}
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Calories Today"
                value={caloriesToday.toString()}
                icon={<Zap size={24} />}
                change={{ value: "12%", isPositive: true }}
              />
              <StatCard
                title="Water Intake"
                value={waterIntake}
                icon={<div className="text-blue-400">💧</div>}
                change={{ value: "2 cups", isPositive: false }}
              />
              <StatCard
                title="Protein"
                value={proteinIntake}
                icon={<div>🥩</div>}
                change={{ value: "10%", isPositive: true }}
              />
              <StatCard
                title="Active Minutes"
                value={activeMinutes.toString()}
                icon={<div>⚡</div>}
                change={{ value: "5 min", isPositive: true }}
              />
          </div>

            {/* Food Safety Alert */}
            <Card className="mb-8 border-red-500 shadow-md bg-red-500/10 p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <Info size={28} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-red-400">Food Safety Alert</h3>
                  <p className="text-safebite-text-secondary mb-2">
                    A recent product you scanned contains high levels of artificial sweeteners and preservatives that may affect your health goals.
                  </p>
                  <Button variant="link" className="text-red-400 hover:text-red-300 p-0">
                    View Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* HealthBox */}
            <div className="mb-8">
              <HealthBox />
            </div>

            {/* Questionnaire Data Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-safebite-text mb-4">Your Health Profile</h2>
              <div className="sci-fi-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Initial Questionnaire Data */}
                  <div>
                    <h3 className="text-xl font-semibold text-safebite-text mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      {userProfile ? (
                        <>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Age Group:</span>
                            <span className="text-safebite-text font-medium">{userProfile.age || 'Not answered'}</span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Activity Level:</span>
                            <span className="text-safebite-text font-medium">{userProfile.activity_level || 'Not answered'}</span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Health Goal:</span>
                            <span className="text-safebite-text font-medium">{userProfile.health_goals || 'Not answered'}</span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Diet Preference:</span>
                            <span className="text-safebite-text font-medium">{userProfile.dietary_preferences || 'Not answered'}</span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Health Conditions:</span>
                            <span className="text-safebite-text font-medium">{userProfile.health_conditions || 'None'}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-safebite-text-secondary">Complete the initial questionnaire to see your profile data.</p>
                      )}
                    </div>
                  </div>

                  {/* Weekly Check-in Data */}
                  <div>
                    <h3 className="text-xl font-semibold text-safebite-text mb-4">Weekly Check-in</h3>
                    <div className="space-y-3">
                      {userProfile?.weeklyCheckin?.answers ? (
                        <>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Home-cooked Meals:</span>
                            <span className="text-safebite-text font-medium">
                              {userProfile.weeklyCheckin.answers.home_cooked !== undefined ?
                                `${userProfile.weeklyCheckin.answers.home_cooked} meals` : 'Not answered'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Water Intake:</span>
                            <span className="text-safebite-text font-medium">
                              {userProfile.weeklyCheckin.answers.water_intake !== undefined ?
                                `${userProfile.weeklyCheckin.answers.water_intake} glasses` : 'Not answered'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Junk Food:</span>
                            <span className="text-safebite-text font-medium">
                              {userProfile.weeklyCheckin.answers.junk_food !== undefined ?
                                `${userProfile.weeklyCheckin.answers.junk_food} times` : 'Not answered'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Exercise:</span>
                            <span className="text-safebite-text font-medium">
                              {userProfile.weeklyCheckin.answers.exercise !== undefined ?
                                `${userProfile.weeklyCheckin.answers.exercise} minutes` : 'Not answered'}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-safebite-card-bg-alt pb-2">
                            <span className="text-safebite-text-secondary">Energy Level:</span>
                            <span className="text-safebite-text font-medium">
                              {userProfile.weeklyCheckin.answers.energy_level || 'Not answered'}
                            </span>
                          </div>
                          <div className="mt-4">
                            <p className="text-xs text-safebite-text-secondary">
                              Last updated: {userProfile.weeklyCheckin.timestamp ?
                                new Date(userProfile.weeklyCheckin.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p className="text-safebite-text-secondary mb-4">No weekly check-in data available.</p>
                          <Button
                            onClick={() => navigate('/weekly-questions')}
                            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                          >
                            Complete Weekly Check-in
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-safebite-text mb-4">Your Health Dashboard</h2>

              {/* Main Charts Row - 2 columns on large screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Food Group Chart */}
                <FoodGroupChart data={foodGroupData} />
                {/* Macronutrient Chart */}
                <MacronutrientChart data={macronutrientData} colors={pieChartColor} />
              </div>

              {/* Progress Charts Row - 3 columns on large screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProgressChart
                  title="Weekly Calorie Intake"
                  data={weeklyProgressData}
                  color="#00ffcc"
                />
                <ProgressChart
                  title="Water Intake (cups)"
                  data={weeklyWaterData}
                  color="#3b82f6"
                />
                <ProgressChart
                  title="Weekly Protein Intake (grams)"
                  data={weeklyProteinData}
                  color="#f472b6"
                />
              </div>

              {/* Additional Charts Row - 2 columns on medium screens, 3 on large */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <ProgressChart
                  title="Nutrient Score"
                  data={nutrientScoreData}
                  color="#a855f7"
                />
                <ProgressChart
                  title="Exercise Minutes"
                  data={exerciseData}
                  color="#f97316"
                />
                <HealthInsights
                  insights={healthTips.length > 0 ? healthTips : [
                    { color: 'bg-green-500', text: 'Your protein intake is on track with your goals' },
                    { color: 'bg-yellow-500', text: `Consider increasing water intake by ${userProfile?.water_target ? userProfile.water_target - parseInt(waterIntake) : 2} cups` },
                    { color: 'bg-blue-500', text: 'Your nutrient score has improved by 5% this week' },
                    { color: 'bg-purple-500', text: `You're ${userProfile?.exercise_target ? userProfile.exercise_target - activeMinutes : 15} minutes short of your weekly exercise goal` },
                  ]}
                />
              </div>
            </div>

            {/* Coming Soon Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-safebite-text mb-4">Coming Soon</h2>
              <div className="grid grid-cols-1 gap-6">
                <div className="sci-fi-card relative overflow-hidden">
                  {/* Glowing border effect */}
                  <div className="absolute inset-0 border-2 border-orange-500 rounded-lg opacity-50 animate-pulse"></div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-semibold text-orange-500 mb-2">Zomato + Swiggy Integration</h3>
                      <p className="text-safebite-text-secondary mb-4">
                        We're working on integrating with popular food delivery platforms to provide nutritional information and health recommendations for restaurant meals.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                            Coming Soon
                          </Badge>
                          <span className="ml-3 text-xs text-safebite-text-secondary">Working on dataset</span>
                        </div>
                        <Button
                          onClick={() => navigate('/food-delivery')}
                          className="bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/20 animate-pulse"
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Duplicate Stats Row removed */}

            {/* Recommendations based on Health Goal */}
            {!isGuest && userProfile?.health_goals && foodRecommendations[userProfile.health_goals] && (
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-safebite-text mb-4">Food Recommendations for {userProfile.health_goals}</h2>
                <Card className="sci-fi-card">
                  <CardHeader>
                    <CardTitle>Try these healthy options:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-safebite-text-secondary space-y-1">
                      {foodRecommendations[userProfile.health_goals].map((food, index) => (
                        <li key={index}>{food}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Activity Recommendation based on Activity Level */}
            {!isGuest && userProfile?.activity_level && (
              <div className="mt-8">
                <ActivityRecommendation
                  activityLevel={userProfile.activity_level}
                  weeklyAnswers={userProfile.weeklyCheckin?.answers}
                />
              </div>
            )}

            {/* Placeholder for AI Recommendations & Food Safety Alerts */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-safebite-text mb-4">AI Recommendations & Alerts</h2>
              <Card className="sci-fi-card">
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-safebite-text-secondary">
                    Smart AI-based recommendations and food safety alerts tailored to your profile are under development.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-xs text-safebite-text-secondary mt-6 text-right">
              Created by Aditya Shenvi
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;

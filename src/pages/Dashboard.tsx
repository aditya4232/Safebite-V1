import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles, Clock, RefreshCw, UserCircle,
  AlertTriangle, User, Activity, Truck, History, // Added History icon
  Search, Pizza, ShoppingCart, Stethoscope // Added icons for activity types
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import GuestDashboard from '@/components/GuestDashboard';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import userActivityService, { UserActivity } from '@/services/userActivityService';
import FoodDeliveryPopup from '@/components/FoodDeliveryPopup';
import MacronutrientChart from '@/components/MacronutrientChart';
import HighchartsComponent from '@/components/HighchartsComponent';
import FoodChatBot from '@/components/FoodChatBot';
import ProfilePopup from '@/components/ProfilePopup';

// Define a basic interface for UserProfile based on usage
interface UserProfile {
  displayName?: string;
  name?: string;
  email?: string;
  profile?: {
    health_goals?: string;
    health_conditions?: string;
    dietary_preferences?: string;
  };
 healthCheckData?: {
   foodQuery?: string;
   nutritionData?: any;
   processedFoodFrequency?: string;
   dietQuality?: string;
 };
 weeklyCheckin?: {
    answers?: {
      exercise_minutes?: number;
      home_cooked_meals?: number;
      junk_food_consumption?: number;
      water_intake?: number;
      sleep_hours?: number;
      stress_level?: number;
      fruit_vegetable_servings?: number;
      health_symptoms?: string[];
    };
    lastSubmitted?: any;
    weekIdentifier?: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isGuest } = useGuestMode();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptFeature, setLoginPromptFeature] = useState('');
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showFoodDeliveryPopup, setShowFoodDeliveryPopup] = useState(false);
  const chatbotRef = useRef<HTMLDivElement>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [profileError, setProfileError] = useState('');
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false); // State for profile popup

  // Debug guest mode status
  useEffect(() => {
    console.log('Dashboard component - Guest mode status:', {
      isGuest,
      userType: localStorage.getItem('userType'),
      emergencyGuestMode: sessionStorage.getItem('safebite-guest-mode'),
      user: user ? 'Logged in' : 'Not logged in'
    });
  }, [isGuest, user]);

  // Show food delivery popup and load user activity
  useEffect(() => {
    // Check if popup should be shown based on last shown timestamp
    const shouldShowPopup = () => {
      // Don't show for guest users
      if (isGuest || !user) return false;

      // Check if user has permanently dismissed the popup
      if (localStorage.getItem('hideDeliveryPopup') === 'permanent') return false;

      // Get the last time the popup was shown
      const lastShown = localStorage.getItem('lastDeliveryPopupShown');

      // If never shown before, show it
      if (!lastShown) return true;

      // Check if it was shown in the current session
      const currentSession = sessionStorage.getItem('currentSession');
      if (!currentSession) {
        // New session, set session marker
        sessionStorage.setItem('currentSession', Date.now().toString());
        return true;
      }

      // Check if it was shown in the last 24 hours
      const lastShownTime = parseInt(lastShown, 10);
      const currentTime = Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      return (currentTime - lastShownTime) > oneDayInMs;
    };

    // Show food delivery popup after a delay if conditions are met
    const popupTimer = setTimeout(() => {
      if (shouldShowPopup()) {
        setShowFoodDeliveryPopup(true);
        // Record the current time as the last shown time
        localStorage.setItem('lastDeliveryPopupShown', Date.now().toString());
      }
    }, 5000); // 5 seconds delay

    // Load user activity for personalized suggestions
    const loadUserActivity = async () => {
      if (!isGuest && user) {
        try {
          const activities = await userActivityService.getUserActivity(user.uid);
          setUserActivity(activities);
        } catch (error) {
          console.error('Error loading user activity:', error);
        }
      }
    };

    loadUserActivity();

    return () => clearTimeout(popupTimer);
  }, [isGuest, user]);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      // Skip for guest users
      if (isGuest) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        if (!user) {
          setIsLoadingProfile(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          console.log("No user profile found!");
        }

        // Fetch recent activities
        const activities = await userActivityService.getRecentActivities(10);
        setRecentActivities(activities);
      } catch (error) {
        console.error("Error loading user profile:", error);
        setProfileError("Failed to load your profile data. Please try again later.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [isGuest, user, db]);

  // Generate health metrics based on user profile
  const generateHealthMetrics = () => {
    // If we have weekly check-in data, use it to generate more accurate metrics
    if (userProfile?.weeklyCheckin?.answers) {
      const answers = userProfile.weeklyCheckin.answers;

      return [
        {
          name: 'Sleep Quality',
          value: Math.min(100, (answers.sleep_hours || 6) * 12),
          icon: <Clock className="h-4 w-4 text-blue-400" />,
          color: 'blue'
        },
        {
          name: 'Physical Activity',
          value: Math.min(100, (answers.exercise_minutes || 30) / 3),
          icon: <Activity className="h-4 w-4 text-green-400" />,
          color: 'green'
        },
        {
          name: 'Nutrition Balance',
          value: Math.min(100, ((answers.fruit_vegetable_servings || 2) * 10) + ((answers.home_cooked_meals || 3) * 8) - ((answers.junk_food_consumption || 2) * 10)),
          icon: <Clock className="h-4 w-4 text-amber-400" />,
          color: 'amber'
        },
        {
          name: 'Stress Level',
          value: Math.max(0, 100 - ((answers.stress_level || 5) * 10)),
          icon: <RefreshCw className="h-4 w-4 text-purple-400" />,
          color: 'purple'
        }
      ];
    }

    // Default metrics if no weekly check-in is available
    return [
      {
        name: 'Sleep Quality',
        value: 72,
        icon: <Clock className="h-4 w-4 text-blue-400" />,
        color: 'blue'
      },
      {
        name: 'Physical Activity',
        value: 65,
        icon: <Activity className="h-4 w-4 text-green-400" />,
        color: 'green'
      },
      {
        name: 'Nutrition Balance',
        value: 78,
        icon: <Clock className="h-4 w-4 text-amber-400" />,
        color: 'amber'
      },
      {
        name: 'Stress Level',
        value: 60,
        icon: <RefreshCw className="h-4 w-4 text-purple-400" />,
        color: 'purple'
      }
    ];
  };

  // Generate food safety issues based on user profile and activity
  const generateFoodSafetyIssues = () => {
    // If we have user activity data, use it to generate more relevant issues
    if (userActivity && userActivity.length > 0) {
      const recentFoods = userActivity
        .filter(activity => activity.type === 'food_search' || activity.type === 'recipe_view')
        .map(activity => activity.details?.foodName || activity.details?.recipeName || '')
        .filter(Boolean);

      if (recentFoods.length > 0) {
        // Generate issues based on recent food searches
        const issues = [];

        if (recentFoods.some(food => food.toLowerCase().includes('chicken') || food.toLowerCase().includes('poultry'))) {
          issues.push({
            title: 'Poultry Safety Alert',
            description: 'Always cook chicken to an internal temperature of 165°F (74°C) to kill harmful bacteria.',
            severity: 'medium'
          });
        }

        if (recentFoods.some(food => food.toLowerCase().includes('fish') || food.toLowerCase().includes('seafood'))) {
          issues.push({
            title: 'Seafood Storage',
            description: 'Keep seafood refrigerated and consume within 1-2 days for optimal safety and freshness.',
            severity: 'medium'
          });
        }

        if (recentFoods.some(food => food.toLowerCase().includes('rice'))) {
          issues.push({
            title: 'Rice Storage Warning',
            description: 'Refrigerate cooked rice within 1 hour to prevent Bacillus cereus bacteria growth.',
            severity: 'high'
          });
        }

        if (recentFoods.some(food => food.toLowerCase().includes('egg'))) {
          issues.push({
            title: 'Egg Safety',
            description: 'Cook eggs until whites and yolks are firm to reduce risk of Salmonella infection.',
            severity: 'medium'
          });
        }

        // Add some general issues if we don't have enough specific ones
        if (issues.length < 2) {
          issues.push({
            title: 'Cross-Contamination Risk',
            description: 'Use separate cutting boards for raw meat and vegetables to prevent bacterial spread.',
            severity: 'medium'
          });

          issues.push({
            title: 'Refrigeration Reminder',
            description: 'Keep your refrigerator below 40°F (4°C) to slow bacterial growth in foods.',
            severity: 'low'
          });
        }

        return issues;
      }
    }

    // Default issues if no relevant user activity is available
    return [
      {
        title: 'Cross-Contamination Risk',
        description: 'Use separate cutting boards for raw meat and vegetables to prevent bacterial spread.',
        severity: 'medium'
      },
      {
        title: 'Refrigeration Reminder',
        description: 'Keep your refrigerator below 40°F (4°C) to slow bacterial growth in foods.',
        severity: 'low'
      },
      {
        title: 'Leftovers Safety',
        description: 'Consume refrigerated leftovers within 3-4 days to ensure food safety.',
        severity: 'medium'
      }
    ];
  };

  // Function to show login prompt for guest users
  const showLoginPromptForFeature = (feature: string) => {
    if (isGuest) {
      setLoginPromptFeature(feature);
      setShowLoginPrompt(true);
    }
  };

  // Handle profile button click
  const handleProfileClick = () => {
    setShowProfilePopup(true);
  };

  // If user is in guest mode, show the guest dashboard
  // Add more detailed logging to help debug guest mode issues
  useEffect(() => {
    console.log('Dashboard - Detailed guest mode check:', {
      isGuest,
      userType: localStorage.getItem('userType'),
      guestMode: sessionStorage.getItem('safebite-guest-mode'),
      guestName: sessionStorage.getItem('guestUserName') || localStorage.getItem('guestUserName'),
      guestSessionExpires: localStorage.getItem('guestSessionExpires')
    });
  }, [isGuest]);

  if (isGuest) {
    console.log('Rendering GuestDashboard component');
    return <GuestDashboard />;
  }

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-screen bg-safebite-dark-blue">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safebite-teal mx-auto mb-4"></div>
          <p className="text-safebite-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Generate dashboard data
  const healthMetrics = generateHealthMetrics();
  const foodSafetyIssues = generateFoodSafetyIssues();
  const healthCheckData = userProfile?.healthCheckData;

  return (
    <div className="relative" style={{ zIndex: 10 }}>
      {/* Development banner - Can be removed for production */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 text-white py-1 px-4 flex items-center justify-center z-50 text-xs font-medium">
        <Sparkles className="h-3 w-3 text-yellow-300 mr-1.5" />
        <span>SafeBite v2.5 - Production Ready</span>
        <Sparkles className="h-3 w-3 text-yellow-300 ml-1.5" />
      </div>

      {/* Food Delivery Popup */}
      <div style={{ marginRight: '6rem' }}>
        <FoodDeliveryPopup
          isOpen={showFoodDeliveryPopup}
          onClose={() => setShowFoodDeliveryPopup(false)}
          currentPage="dashboard"
          userData={userProfile}
        />
      </div>

      {/* AI Chatbot */}
      <div ref={chatbotRef} style={{ zIndex: 50 }}>
        <FoodChatBot
          currentPage="dashboard"
          userData={{ profile: userProfile, recentActivity: userActivity }}
          autoOpen={false}
          initialMessage="Welcome back! How can I help with your health goals today?"
        />
      </div>

      {/* Sidebar */}
      <DashboardSidebar userProfile={userProfile} />

      {/* Profile Popup */}
      <ProfilePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        userProfile={userProfile}
      />

      {/* Main content */}
      <main className="md:ml-64 min-h-screen bg-gradient-to-br from-safebite-dark-blue to-safebite-dark-blue/95 relative overflow-hidden pt-8">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-4 bg-safebite-card-bg/70 backdrop-blur-md rounded-lg border border-safebite-teal/20 shadow-md">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-3xl font-bold text-safebite-text mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">
                  Welcome back, {isGuest
                    ? (localStorage.getItem('guestUserName') || sessionStorage.getItem('guestUserName') || 'Guest')
                    : (userProfile?.displayName || user?.displayName || userProfile?.name || user?.email?.split('@')[0] || 'Friend')}
                </span>
              </h1>
              <p className="text-safebite-text-secondary flex items-center">
                <UserCircle className="h-5 w-5 mr-2 text-safebite-teal/70" />
                Your dashboard is ready. Check out your health insights and recommendations.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                onClick={handleProfileClick}
              >
                <User className="mr-2 h-4 w-4 text-safebite-teal" />
                Profile
              </Button>
              <Button
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                onClick={() => navigate('/food-delivery')}
              >
                <Truck className="mr-2 h-4 w-4" /> Food Delivery
                <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Coming Soon</span>
              </Button>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {healthMetrics.map((metric, index) => (
              <Card key={index} className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-safebite-text">{metric.name}</h3>
                    {metric.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-safebite-text-secondary">Score</span>
                      <span className="text-safebite-text font-medium">{metric.value}%</span>
                    </div>
                    <Progress value={metric.value} className={`h-2 bg-safebite-card-bg-alt`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Food Safety Analysis Card */}
          <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" /> Food Safety Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary text-xs mb-3">Potential issues based on profile & activity:</p>
              {foodSafetyIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {foodSafetyIssues.map((issue, index) => (
                    <div key={index} className="p-3 bg-safebite-card-bg-alt rounded-lg border border-safebite-card-bg-alt">
                      <div className="flex items-start">
                        <div className={`rounded-full p-1.5 mr-2 ${
                          issue.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                          issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-safebite-text mb-1">{issue.title}</h4>
                          <p className="text-xs text-safebite-text-secondary">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-safebite-text-secondary text-sm">No food safety issues detected based on your recent activity.</p>
              )}
            </CardContent>
          </Card>

          {/* Display Health Check Data if available */}
          {healthCheckData && (
            <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-safebite-text">Recent Health Check</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-safebite-text-secondary text-sm">Food Query: <span className="text-safebite-text">{healthCheckData.foodQuery || 'N/A'}</span></p>
                <p className="text-safebite-text-secondary text-sm">Processed Food Frequency: <span className="text-safebite-text">{healthCheckData.processedFoodFrequency || 'N/A'}</span></p>
                <p className="text-safebite-text-secondary text-sm">Diet Quality: <span className="text-safebite-text">{healthCheckData.dietQuality || 'N/A'}</span></p>
                {/* Optionally display nutrition data if needed */}
                {/* <pre className="text-xs text-safebite-text-secondary mt-2">{JSON.stringify(healthCheckData.nutritionData, null, 2)}</pre> */}
              </CardContent>
            </Card>
          )}

          {/* Display Charts if weekly check-in data is available */}
          {userProfile?.weeklyCheckin?.answers && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-safebite-text">Weekly Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Example: Using MacronutrientChart structure for weekly data */}
                  <MacronutrientChart
                    data={[
                      { name: 'Exercise (min)', value: userProfile.weeklyCheckin.answers.exercise_minutes || 0 },
                      { name: 'Home Meals', value: userProfile.weeklyCheckin.answers.home_cooked_meals || 0 },
                      { name: 'Water (glasses)', value: userProfile.weeklyCheckin.answers.water_intake || 0 },
                      { name: 'Sleep (hrs)', value: userProfile.weeklyCheckin.answers.sleep_hours || 0 },
                    ]}
                    colors={['#FFBB28', '#FF8042', '#00C49F', '#0088FE']}
                  />
                </CardContent>
              </Card>

              <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300">
                 <CardHeader>
                   <CardTitle className="text-lg font-semibold text-safebite-text">Weekly Trends (Example)</CardTitle>
                 </CardHeader>
                 <CardContent>
                  <HighchartsComponent
                    options={{
                      chart: { type: 'line', backgroundColor: 'transparent' },
                      title: { text: 'Example Trend', style: { color: '#e0e0e0' } },
                      xAxis: { categories: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'], labels: { style: { color: '#a0a0a0' } } },
                      yAxis: { title: { text: 'Value', style: { color: '#a0a0a0' } }, labels: { style: { color: '#a0a0a0' } }, gridLineColor: 'rgba(255, 255, 255, 0.1)' },
                      legend: { itemStyle: { color: '#e0e0e0' } },
                      series: [{
                        name: 'Metric',
                        type: 'line', // Ensure type is specified
                        data: [
                          userProfile.weeklyCheckin.answers.junk_food_consumption || 0,
                          (userProfile.weeklyCheckin.answers.stress_level || 0) * 10, // Scale stress level for visibility
                          userProfile.weeklyCheckin.answers.fruit_vegetable_servings || 0,
                          (userProfile.weeklyCheckin.answers.exercise_minutes || 0) / 10 // Scale exercise minutes
                        ],
                        color: '#00C49F'
                      }],
                      credits: { enabled: false }
                    }}
                  />
                 </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity Section */}
          {!isGuest && recentActivities.length > 0 && (
            <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
                  <History className="mr-2 h-5 w-5 text-safebite-teal" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recentActivities.map((activity) => (
                    <li key={activity.timestamp.toString()} className="flex items-center justify-between p-2 bg-safebite-card-bg-alt rounded-md border border-safebite-card-bg-alt hover:border-safebite-teal/30 transition-colors">
                      <div className="flex items-center">
                        {getActivityIcon(activity.type)}
                        <span className="text-sm text-safebite-text ml-3">{formatActivityDescription(activity)}</span>
                      </div>
                      <span className="text-xs text-safebite-text-secondary">
                        {/* Handle both Date and Timestamp objects */}
                        {activity.timestamp instanceof Date
                          ? new Date(activity.timestamp.getTime()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(activity.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
           {!isGuest && recentActivities.length === 0 && !isLoadingProfile && (
             <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 mb-6">
               <CardContent className="p-4 text-center text-safebite-text-secondary text-sm">
                 No recent activity recorded yet. Start exploring SafeBite!
               </CardContent>
             </Card>
           )}

        </div>
      </main>
    </div>
  );
};

// Helper function to get icon based on activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'food_search': return <Search size={18} className="text-blue-400 flex-shrink-0" />;
    case 'recipe_view': return <Pizza size={18} className="text-orange-400 flex-shrink-0" />;
    case 'product_view': return <ShoppingCart size={18} className="text-green-400 flex-shrink-0" />;
    case 'health_check': return <Stethoscope size={18} className="text-red-400 flex-shrink-0" />;
    case 'login': return <UserCircle size={18} className="text-purple-400 flex-shrink-0" />;
    default: return <Activity size={18} className="text-gray-400 flex-shrink-0" />;
  }
};

// Helper function to format activity description
const formatActivityDescription = (activity: UserActivity): string => {
  switch (activity.type) {
    case 'food_search': return `Searched for: ${activity.details?.query || 'food'}`;
    case 'recipe_view': return `Viewed recipe: ${activity.details?.recipeName || 'a recipe'}`;
    case 'product_view': return `Viewed product: ${activity.details?.productName || 'a product'}`;
    case 'health_check': return `Completed Health Check`;
    case 'login': return `Logged in`;
    default: return `Performed action: ${activity.type}`;
  }
};


export default Dashboard;

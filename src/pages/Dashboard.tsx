import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Clock, RefreshCw, UserCircle,
  AlertTriangle, User, Activity, Truck, History, // Added History icon
  Search, Pizza, ShoppingCart, Stethoscope, Bell, // Added icons for activity types
  Trophy, Award, ClipboardCheck // Added icons for achievements and weekly check-in
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import GuestDashboard from '@/components/GuestDashboard';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, getDoc, collection, setDoc } from "firebase/firestore";
import userActivityService, { UserActivity } from '@/services/userActivityService';
// Food delivery popup removed as it's now live
import MacronutrientChart from '@/components/MacronutrientChart';
import HighchartsComponent from '@/components/HighchartsComponent';
import FoodChatBot from '@/components/FoodChatBot';
import EnhancedChatBot from '@/components/EnhancedChatBot';
import UnifiedNotificationSystem from '@/components/UnifiedNotificationSystem';
import HealthDataFallback from '@/components/HealthDataFallback';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProfilePopup from '@/components/ProfilePopup';
import WelcomeAnimation from '@/components/WelcomeAnimation';
import NotificationSystem from '@/components/NotificationSystem';
import HealthDataCharts from '@/components/HealthDataCharts';
import Footer from '@/components/Footer';
import WeeklyQuestionsPopup from '@/components/WeeklyQuestionsPopup';
import WeeklyDataCharts from '@/components/WeeklyDataCharts';
import HealthNewsSection from '@/components/HealthNewsSection';
import AchievementBadges from '@/components/AchievementBadges';

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
  // Food delivery popup state removed as it's now live
  const chatbotRef = useRef<HTMLDivElement>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [profileError, setProfileError] = useState('');
  const [recentActivities, setRecentActivities] = useState<UserActivity[]>([]);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false); // State for welcome animation
  const [showWeeklyQuestions, setShowWeeklyQuestions] = useState(false); // State for weekly questions popup
  const [showNotifications, setShowNotifications] = useState(false); // State for notifications popup
  const [showEnhancedChat, setShowEnhancedChat] = useState(false); // State for enhanced chat
  const [isEnhancedChatExpanded, setIsEnhancedChatExpanded] = useState(false); // State for expanded chat
  const [healthDataError, setHealthDataError] = useState<string | null>(null); // State for health data error

  // Debug guest mode status
  useEffect(() => {
    console.log('Dashboard component - Guest mode status:', {
      isGuest,
      userType: localStorage.getItem('userType'),
      emergencyGuestMode: sessionStorage.getItem('safebite-guest-mode'),
      user: user ? 'Logged in' : 'Not logged in'
    });
  }, [isGuest, user]);

  // Load user activity for personalized suggestions
  useEffect(() => {
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
  }, [isGuest, user]);

  // Check if this is the user's first visit and show notifications
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('safebite-first-visit') !== 'false';
    if (isFirstVisit && !isGuest) {
      setShowWelcomeAnimation(true);
      localStorage.setItem('safebite-first-visit', 'false');
    }

    // Add notification about food delivery being live
    const addFoodDeliveryNotification = async () => {
      if (isGuest || !user) return;

      try {
        const notificationsRef = collection(db, 'notifications');
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Check if we've already sent this notification
        if (!userData.foodDeliveryNotificationSent) {
          // Add notification
          await setDoc(doc(notificationsRef), {
            userId: user.uid,
            title: 'Food Delivery Now Live!',
            message: 'Our food delivery integration is now live! Search and order from multiple platforms directly from SafeBite.',
            type: 'success',
            category: 'food',
            timestamp: new Date(),
            read: false,
            icon: 'food',
            link: '/food-delivery'
          });

          // Mark notification as sent
          await setDoc(userRef, { foodDeliveryNotificationSent: true }, { merge: true });

          // Show toast
          toast({
            title: "Food Delivery Now Live!",
            description: "Check out our new food delivery integration!",
          });
        }
      } catch (error) {
        console.error('Error adding food delivery notification:', error);
      }
    };

    // Check if user needs to complete weekly questions
    const checkWeeklyQuestions = async () => {
      if (isGuest || !user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if user has completed weekly check-in this week
          if (userData.weeklyCheckin?.lastSubmitted) {
            const lastSubmitted = userData.weeklyCheckin.lastSubmitted.toDate();
            const currentDate = new Date();

            // Get week number for both dates
            const getWeekNumber = (d: Date) => {
              const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
              const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
              return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            };

            const lastSubmittedWeek = getWeekNumber(lastSubmitted);
            const currentWeek = getWeekNumber(currentDate);

            // If different week, show weekly questions popup
            if (lastSubmittedWeek !== currentWeek ||
                lastSubmitted.getFullYear() !== currentDate.getFullYear()) {

              // Wait a bit before showing the popup to not overwhelm the user
              setTimeout(() => {
                setShowWeeklyQuestions(true);
              }, 5000); // 5 seconds delay
            }
          } else {
            // User has never completed weekly questions
            setTimeout(() => {
              setShowWeeklyQuestions(true);
            }, 5000); // 5 seconds delay
          }
        }
      } catch (error) {
        console.error('Error checking weekly questions status:', error);
      }
    };

    addFoodDeliveryNotification();
    checkWeeklyQuestions();
  }, [isGuest, user, db, toast]);

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
    if (userActivity && Array.isArray(userActivity) && userActivity.length > 0) {
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

  // Helper function to get color for each metric
  const getColorForMetric = (metricName: string): string => {
    switch (metricName) {
      case 'Sleep Quality':
        return 'bg-blue-500';
      case 'Physical Activity':
        return 'bg-green-500';
      case 'Nutrition Balance':
        return 'bg-amber-500';
      case 'Stress Level':
        return 'bg-purple-500';
      default:
        return 'bg-safebite-teal';
    }
  };

  // Generate dashboard data
  const healthMetrics = generateHealthMetrics();
  const foodSafetyIssues = generateFoodSafetyIssues();
  const healthCheckData = userProfile?.healthCheckData;

  // Mock user stats and achievements for now
  const userStats = { xp: 250 };
  const userAchievements = [
    { name: 'First Login', icon: <UserCircle className="h-6 w-6 text-safebite-teal" /> },
    { name: 'Food Explorer', icon: <Search className="h-6 w-6 text-safebite-teal" /> },
    { name: 'Health Check', icon: <Activity className="h-6 w-6 text-safebite-teal" /> }
  ];

  // Mock nutrition data
  const userNutrition = {
    calories: 2000,
    protein: 50,
    carbs: 250,
    fat: 70,
    fiber: 25,
    sugar: 50
  };

  return (
    <div className="relative" style={{ zIndex: 1 }}>
      {/* Development banner - Can be removed for production */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 text-white py-1 px-4 flex items-center justify-center z-20 text-xs font-medium">
        <Sparkles className="h-3 w-3 text-yellow-300 mr-1.5" />
        <span>SafeBite v3.0 - Production Ready</span>
        <Sparkles className="h-3 w-3 text-yellow-300 ml-1.5" />
      </div>

      {/* Enhanced Notification System */}
      <UnifiedNotificationSystem
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Enhanced Chat Bot */}
      {showEnhancedChat && (
        <div className="fixed bottom-20 right-6 z-40">
          <EnhancedChatBot
            onClose={() => setShowEnhancedChat(false)}
            isExpanded={isEnhancedChatExpanded}
            onToggleExpand={() => setIsEnhancedChatExpanded(!isEnhancedChatExpanded)}
          />
        </div>
      )}

      {/* Welcome Animation for new users */}
      {showWelcomeAnimation && (
        <WelcomeAnimation
          onComplete={() => setShowWelcomeAnimation(false)}
          userName={userProfile?.displayName || user?.displayName || userProfile?.name || user?.email?.split('@')[0] || 'there'}
        />
      )}

      {/* Weekly Questions Popup */}
      <WeeklyQuestionsPopup
        isOpen={showWeeklyQuestions}
        onClose={() => setShowWeeklyQuestions(false)}
        onComplete={() => {
          // Refresh user profile to get the latest weekly check-in data
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            getDoc(userRef).then(docSnap => {
              if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);

                // Show toast notification
                toast({
                  title: "Dashboard Updated",
                  description: "Your dashboard has been updated with your latest check-in data.",
                });
              }
            });
          }
        }}
      />

      {/* Food Delivery Popup removed as it's now live */}

      {/* Sidebar */}
      <DashboardSidebar
        userProfile={userProfile}
        onProfileClick={handleProfileClick}
        onNotificationsClick={() => setShowNotifications(true)}
        onChatClick={() => setShowEnhancedChat(true)}
        isLoadingProfile={isLoadingProfile}
      />

      {/* Profile Popup */}
      <ProfilePopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        userProfile={userProfile}
      />

      {/* AI Chatbot - moved to end for better z-index handling */}
      <div ref={chatbotRef} style={{ zIndex: 100 }}>
        <FoodChatBot
          currentPage="dashboard"
          userData={{ profile: userProfile, recentActivity: userActivity }}
          autoOpen={false}
          initialMessage="Welcome back! How can I help with your health goals today?"
        />
      </div>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen bg-gradient-to-br from-safebite-dark-blue to-safebite-dark-blue/95 relative overflow-hidden pt-8 pb-16">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-5 bg-safebite-card-bg/70 backdrop-blur-md rounded-lg border border-safebite-teal/20 shadow-md">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-safebite-text mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">
                  Welcome back, {isGuest
                    ? (localStorage.getItem('guestUserName') || sessionStorage.getItem('guestUserName') || 'Guest')
                    : (userProfile?.displayName || user?.displayName || userProfile?.name || user?.email?.split('@')[0] || 'Friend')}
                </span>
              </h1>
              <p className="text-safebite-text-secondary flex items-center">
                <UserCircle className="h-5 w-5 mr-2.5 text-safebite-teal/70" />
                Your dashboard is ready. Check out your health insights and recommendations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <NotificationSystem currentPage="dashboard" />
              <Button
                variant="outline"
                className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text h-10"
                onClick={handleProfileClick}
              >
                <User className="mr-2 h-4 w-4 text-safebite-teal" />
                Profile
              </Button>
              <Button
                variant="outline"
                className="border-purple-400/30 hover:border-purple-400/60 text-safebite-text h-10"
                onClick={() => setShowWeeklyQuestions(true)}
              >
                <ClipboardCheck className="mr-2 h-4 w-4 text-purple-400" />
                Weekly Check-in
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 transition-all duration-300 h-10"
                onClick={() => navigate('/food-delivery')}
              >
                <Truck className="mr-2 h-4 w-4" /> Food Delivery
                <span className="ml-2 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Live</span>
              </Button>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {healthMetrics.map((metric, index) => (
              <Card key={index} className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 h-full">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-safebite-text">{metric.name}</h3>
                    {metric.icon}
                  </div>
                  <div className="space-y-2 mt-auto w-full">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-safebite-text-secondary">Score</span>
                      <span className="text-safebite-text font-medium">{metric.value}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-safebite-card-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getColorForMetric(metric.name)}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Food Safety Analysis Card */}
          <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
                <AlertTriangle className="mr-2.5 h-5 w-5 text-amber-500" /> Food Safety Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary text-xs mb-4">Potential issues based on profile & activity:</p>
              {foodSafetyIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {foodSafetyIssues.map((issue, index) => (
                    <div key={index} className="p-4 bg-safebite-card-bg-alt rounded-lg border border-safebite-card-bg-alt hover:border-safebite-teal/30 transition-colors">
                      <div className="flex items-start">
                        <div className={`rounded-full p-1.5 mr-3 flex-shrink-0 ${
                          issue.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                          issue.severity === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-safebite-text mb-1.5">{issue.title}</h4>
                          <p className="text-xs text-safebite-text-secondary leading-relaxed">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-safebite-text-secondary text-sm text-center py-4">No food safety issues detected based on your recent activity.</p>
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
            <div className="mb-6">
              <WeeklyDataCharts weeklyData={userProfile.weeklyCheckin} />
            </div>
          )}


          {/* Health Data Charts with Fallback */}
          {!isGuest && (
            <div className="mb-6">
              {healthDataError ? (
                <HealthDataFallback
                  userProfile={userProfile}
                  errorMessage={healthDataError}
                  onRetry={() => setHealthDataError(null)}
                />
              ) : (
                <ErrorBoundary
                  fallback={(
                    <HealthDataFallback
                      userProfile={userProfile}
                      errorMessage="Could not load health data charts. Please try again later."
                      onRetry={() => setHealthDataError(null)}
                    />
                  )}
                  onError={(error) => {
                    console.error('Health data charts error:', error);
                    setHealthDataError('Could not load health data charts. Please try again later.');
                  }}
                >
                  <HealthDataCharts
                    userId={user?.uid || 'default-user'}
                    initialTab="weight"
                  />
                </ErrorBoundary>
              )}
            </div>
          )}

          {/* Health News Section */}
          <div className="mb-6">
            <HealthNewsSection />
          </div>

          {/* Achievements Card */}
          <div className="mb-6">
            <AchievementBadges />
          </div>

          {/* Recent Activity Section */}
          {!isGuest && recentActivities && Array.isArray(recentActivities) && recentActivities.length > 0 && (
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
           {!isGuest && (!recentActivities || !Array.isArray(recentActivities) || recentActivities.length === 0) && !isLoadingProfile && (
             <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 mb-6">
               <CardContent className="p-4 text-center text-safebite-text-secondary text-sm">
                 No recent activity recorded yet. Start exploring SafeBite!
               </CardContent>
             </Card>
           )}

        </div>
      </main>

      {/* Footer */}
      <Footer />
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

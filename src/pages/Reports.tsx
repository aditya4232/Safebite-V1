import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardSidebar from '@/components/DashboardSidebar';
import ProgressChart from '@/components/ProgressChart';
import {
  Download, Share2, Award, Trophy, Star, Calendar,
  Clock, ArrowUpRight, Facebook, Twitter,
  AlertCircle, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import {
  getUserProgress,
  getAllBadges,
  getAllAchievements,
  shareToSocialMedia
} from '@/services/gamification';
import { getAuth } from "firebase/auth";
import { app } from "../main";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const Reports = () => {
  const [activeTab, setActiveTab] = useState('healthReport');
  const [showShareOptions, setShowShareOptions] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Get user progress from gamification service
  const userProgress = getUserProgress();
  const allBadges = getAllBadges();
  const allAchievements = getAllAchievements();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isGuest) {
        setIsLoading(false);
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) {
          setIsLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserProfile(userData);
          console.log('User profile loaded for reports:', userData);
        } else {
          console.log("No user profile found!");
        }
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [isGuest, auth, db]);

  // Generate weekly health data based on user profile if available
  const generateWeeklyData = () => {
    // If we have weekly check-in data, use it to generate more accurate charts
    if (userProfile?.weeklyCheckin?.answers) {
      const answers = userProfile.weeklyCheckin.answers;

      // Generate calorie data based on user profile and weekly check-in
      const baseCalories = userProfile.profile?.health_goals === 'Weight Loss' ? 1600 :
                          userProfile.profile?.health_goals === 'Muscle Gain' ? 2200 : 1800;

      // Adjust based on activity level from weekly check-in
      const activityMultiplier = answers.exercise > 300 ? 1.2 :
                                answers.exercise > 150 ? 1.1 : 1.0;

      // Adjust based on home-cooked meals (healthier eating)
      const homeCookedMultiplier = answers.home_cooked > 15 ? 0.9 :
                                  answers.home_cooked > 10 ? 0.95 : 1.0;

      // Adjust based on junk food consumption
      const junkFoodMultiplier = answers.junk_food > 10 ? 1.2 :
                               answers.junk_food > 5 ? 1.1 : 1.0;

      // Calculate adjusted daily calories
      const adjustedCalories = baseCalories * activityMultiplier * homeCookedMultiplier * junkFoodMultiplier;

      // Generate random variations for each day
      return {
        calorieData: [
          { date: 'Mon', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
          { date: 'Tue', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
          { date: 'Wed', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
          { date: 'Thu', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
          { date: 'Fri', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
          { date: 'Sat', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
          { date: 'Sun', value: Math.round(adjustedCalories * (0.9 + Math.random() * 0.2)) },
        ],
        waterData: [
          { date: 'Mon', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 0.8)) : 6 },
          { date: 'Tue', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 0.9)) : 5 },
          { date: 'Wed', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 1.1)) : 8 },
          { date: 'Thu', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 1.0)) : 7 },
          { date: 'Fri', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 0.7)) : 4 },
          { date: 'Sat', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 1.2)) : 9 },
          { date: 'Sun', value: answers.water_intake ? Math.max(1, Math.round(answers.water_intake * 0.9)) : 6 },
        ],
        nutrientData: [
          { date: 'Mon', value: answers.junk_food > 5 ? 70 : 85 },
          { date: 'Tue', value: answers.junk_food > 5 ? 65 : 78 },
          { date: 'Wed', value: answers.junk_food > 5 ? 75 : 92 },
          { date: 'Thu', value: answers.junk_food > 5 ? 68 : 76 },
          { date: 'Fri', value: answers.junk_food > 5 ? 72 : 82 },
          { date: 'Sat', value: answers.junk_food > 5 ? 74 : 89 },
          { date: 'Sun', value: answers.junk_food > 5 ? 71 : 86 },
        ]
      };
    }

    // Default data if no user profile or weekly check-in
    return {
      calorieData: [
        { date: 'Mon', value: 1800 },
        { date: 'Tue', value: 1600 },
        { date: 'Wed', value: 2100 },
        { date: 'Thu', value: 1500 },
        { date: 'Fri', value: 1900 },
        { date: 'Sat', value: 2200 },
        { date: 'Sun', value: 1700 },
      ],
      waterData: [
        { date: 'Mon', value: 6 },
        { date: 'Tue', value: 5 },
        { date: 'Wed', value: 8 },
        { date: 'Thu', value: 7 },
        { date: 'Fri', value: 4 },
        { date: 'Sat', value: 9 },
        { date: 'Sun', value: 6 },
      ],
      nutrientData: [
        { date: 'Mon', value: 85 },
        { date: 'Tue', value: 78 },
        { date: 'Wed', value: 92 },
        { date: 'Thu', value: 76 },
        { date: 'Fri', value: 82 },
        { date: 'Sat', value: 89 },
        { date: 'Sun', value: 86 },
      ]
    };
  };

  // Get weekly data
  const { calorieData, waterData, nutrientData } = generateWeeklyData();

  // Generate health metrics based on user profile
  const generateHealthMetrics = () => {
    if (userProfile?.profile) {
      const profile = userProfile.profile;
      const weeklyData = userProfile.weeklyCheckin?.answers;

      // Calculate base values based on profile
      let baseCalories = profile.health_goals === 'Weight Loss' ? 1600 :
                        profile.health_goals === 'Muscle Gain' ? 2200 : 1800;

      let baseProtein = profile.health_goals === 'Muscle Gain' ? 120 :
                       profile.health_goals === 'Weight Loss' ? 100 : 80;

      let baseCarbs = profile.health_goals === 'Weight Loss' ? 150 :
                     profile.health_goals === 'Muscle Gain' ? 250 : 200;

      let baseFat = profile.health_goals === 'Weight Loss' ? 50 :
                  profile.health_goals === 'Muscle Gain' ? 70 : 60;

      // Adjust based on weekly data if available
      if (weeklyData) {
        // Adjust calories based on activity level
        if (weeklyData.exercise > 300) baseCalories += 200;
        else if (weeklyData.exercise > 150) baseCalories += 100;

        // Adjust protein based on activity
        if (weeklyData.exercise > 300) baseProtein += 20;
        else if (weeklyData.exercise > 150) baseProtein += 10;
      }

      // Calculate current values (simulated)
      const currentCalories = Math.round(baseCalories * 0.9);
      const currentWater = weeklyData?.water_intake ? (weeklyData.water_intake * 0.25).toFixed(1) : '6.5';
      const currentProtein = Math.round(baseProtein * 0.9);
      const currentCarbs = Math.round(baseCarbs * 0.92);
      const currentFat = Math.round(baseFat * 0.97);
      const currentSugar = weeklyData?.junk_food > 5 ? 32 : 22;
      const currentExercise = weeklyData?.exercise ? Math.round(weeklyData.exercise / 7) : 35;

      return [
        { name: 'Daily Calories', value: currentCalories.toLocaleString(), target: baseCalories.toLocaleString(), unit: 'kcal', progress: Math.round((currentCalories / baseCalories) * 100) },
        { name: 'Water Intake', value: currentWater, target: '8', unit: 'cups', progress: Math.round((parseFloat(currentWater) / 8) * 100) },
        { name: 'Protein', value: currentProtein.toString(), target: baseProtein.toString(), unit: 'g', progress: Math.round((currentProtein / baseProtein) * 100) },
        { name: 'Carbs', value: currentCarbs.toString(), target: baseCarbs.toString(), unit: 'g', progress: Math.round((currentCarbs / baseCarbs) * 100) },
        { name: 'Fat', value: currentFat.toString(), target: baseFat.toString(), unit: 'g', progress: Math.round((currentFat / baseFat) * 100) },
        { name: 'Sugar', value: currentSugar.toString(), target: '25', unit: 'g', progress: Math.round((currentSugar / 25) * 100) },
        { name: 'Exercise', value: currentExercise.toString(), target: '30', unit: 'min', progress: Math.round((currentExercise / 30) * 100) },
      ];
    }

    // Default metrics if no user profile
    return [
      { name: 'Daily Calories', value: '1,750', target: '2,000', unit: 'kcal', progress: 87 },
      { name: 'Water Intake', value: '6.5', target: '8', unit: 'cups', progress: 81 },
      { name: 'Protein', value: '72', target: '80', unit: 'g', progress: 90 },
      { name: 'Carbs', value: '230', target: '250', unit: 'g', progress: 92 },
      { name: 'Fat', value: '58', target: '60', unit: 'g', progress: 97 },
      { name: 'Sugar', value: '32', target: '25', unit: 'g', progress: 128 },
      { name: 'Exercise', value: '35', target: '30', unit: 'min', progress: 117 },
    ];
  };

  const healthMetrics = generateHealthMetrics();

  // Generate food safety issues based on user profile
  const generateFoodSafetyIssues = () => {
    const issues = [
      {
        name: 'High Sodium Foods',
        count: userProfile?.profile?.health_conditions === 'Hypertension' ? 7 : 4,
        recommendation: 'Try to reduce your sodium intake by choosing low-sodium alternatives.'
      },
      {
        name: 'Artificial Additives',
        count: userProfile?.weeklyCheckin?.answers?.junk_food > 5 ? 10 : 7,
        recommendation: 'Consider choosing more natural food options with fewer additives.'
      },
      {
        name: 'Added Sugar',
        count: userProfile?.profile?.health_conditions === 'Diabetes' ? 8 : 5,
        recommendation: 'Look for sugar-free or reduced sugar alternatives.'
      },
    ];

    // Add condition-specific issues
    if (userProfile?.profile?.health_conditions === 'Diabetes') {
      issues.push({
        name: 'High Glycemic Index Foods',
        count: 6,
        recommendation: 'Choose low glycemic index foods to help manage blood sugar levels.'
      });
    }

    if (userProfile?.profile?.health_conditions === 'Heart Issues') {
      issues.push({
        name: 'Trans Fats',
        count: 3,
        recommendation: 'Avoid foods with trans fats as they can increase risk of heart disease.'
      });
    }

    if (userProfile?.profile?.dietary_preferences === 'Vegan' || userProfile?.profile?.dietary_preferences === 'Vegetarian') {
      issues.push({
        name: 'Hidden Animal Products',
        count: 2,
        recommendation: 'Watch for hidden animal-derived ingredients in processed foods.'
      });
    }

    return issues;
  };

  const foodSafetyIssues = generateFoodSafetyIssues();

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your health report has been downloaded successfully.",
    });
  };

  const handleShare = (itemId: string) => {
    setShowShareOptions(showShareOptions === itemId ? null : itemId);
  };

  const handleShareToSocial = (platform: 'twitter' | 'facebook' | 'instagram', item: any) => {
    // This would normally call the shareToSocialMedia function
    toast({
      title: "Shared successfully",
      description: `Your achievement has been shared to ${platform}.`,
    });

    setShowShareOptions(null);
  };

  const weeklyCalorieData = generateWeeklyData().calorieData;
  const weeklyWaterData = generateWeeklyData().waterData;
  const weeklyNutrientData = generateWeeklyData().nutrientData;

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>

      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 text-safebite-teal animate-spin" />
              <span className="ml-2 text-safebite-text-secondary">Loading your reports...</span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-safebite-text mb-2">Error Loading Reports</h3>
              <p className="text-safebite-text-secondary mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Content State */}
          {!isLoading && !error && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-safebite-text mb-2">Reports & Achievements</h1>
              <p className="text-safebite-text-secondary">
                Track your health progress and earn badges for healthy habits
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                onClick={handleDownloadReport}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
          )}

          <Tabs defaultValue="healthReport" className="mb-6" onValueChange={setActiveTab}>
            <div className="sci-fi-card mb-2 p-4">
              <TabsList className="grid grid-cols-3 gap-2">
                <TabsTrigger
                  value="healthReport"
                  className={activeTab === 'healthReport' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Health Report
                </TabsTrigger>
                <TabsTrigger
                  value="badges"
                  className={activeTab === 'badges' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Badges
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className={activeTab === 'achievements' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="healthReport" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="sci-fi-card">
                  <div className="p-4 border-b border-safebite-card-bg-alt">
                    <h3 className="text-xl font-semibold text-safebite-text flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Weekly Overview
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-medium text-safebite-text">Health Score</h4>
                        <p className="text-safebite-text-secondary">Your weekly health rating</p>
                      </div>
                      <div className="flex items-center">
                        <div className="text-3xl font-bold text-safebite-teal">78</div>
                        <div className="ml-2 text-green-400 flex items-center text-sm">
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          +12%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {healthMetrics.map((metric) => (
                        <div key={metric.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-safebite-text">{metric.name}</span>
                            <span className="text-safebite-text-secondary">
                              {metric.value} / {metric.target} {metric.unit}
                            </span>
                          </div>
                          <Progress
                            value={metric.progress}
                            className={`h-2 ${
                              metric.progress > 100
                                ? (metric.name === 'Exercise' ? 'bg-green-600' : 'bg-amber-600')
                                : ''
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card className="sci-fi-card">
                  <div className="p-4 border-b border-safebite-card-bg-alt">
                    <h3 className="text-xl font-semibold text-safebite-text">Food Safety Analysis</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-medium text-safebite-text">Safety Score</h4>
                        <p className="text-safebite-text-secondary">Based on scanned products</p>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-amber-500 flex items-center justify-center text-safebite-dark-blue text-2xl font-bold">
                        6.5
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-safebite-text-secondary">
                        Food safety issues found in your scanned products this week:
                      </p>

                      {foodSafetyIssues.map((issue, index) => (
                        <div key={index} className="p-3 bg-safebite-card-bg-alt rounded-md">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-safebite-text">{issue.name}</span>
                            <Badge className="bg-amber-500 text-safebite-dark-blue">
                              {issue.count} items
                            </Badge>
                          </div>
                          <p className="text-sm text-safebite-text-secondary">
                            {issue.recommendation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProgressChart
                  title="Calorie Intake"
                  data={weeklyCalorieData}
                  color="#00ffcc"
                />
                <ProgressChart
                  title="Water Intake (cups)"
                  data={weeklyWaterData}
                  color="#3b82f6"
                />
                <ProgressChart
                  title="Nutrient Score"
                  data={weeklyNutrientData}
                  color="#a855f7"
                />
              </div>
            </TabsContent>

            <TabsContent value="badges" className="mt-0">
              <Card className="sci-fi-card mb-6">
                <div className="p-4 border-b border-safebite-card-bg-alt">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-safebite-text flex items-center">
                      <Award className="mr-2 h-5 w-5" />
                      Your Badges
                    </h3>
                  </div>
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 text-safebite-teal animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500">
                        Error loading badges. Please try again.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allBadges && allBadges.map((badge, index) => (
                          <div key={index} className="flex flex-col items-center p-4 rounded-md bg-safebite-card-bg-alt">
                            <div className="mb-2 text-sm text-safebite-text-secondary">{badge.category}</div>
                            <Badge className="mb-2 bg-amber-500 text-safebite-dark-blue">Badge</Badge>
                            <Star className="h-10 w-10 text-amber-500 mb-2" />
                            <h4 className="text-lg font-semibold text-safebite-text text-center mb-2">{badge.name}</h4>
                            <p className="text-safebite-text-secondary text-center">{badge.description}</p>
                            <Button
                              onClick={() => handleShare('badge-' + index)}
                              className="mt-3 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 w-full"
                            >
                              Share
                            </Button>

                            {showShareOptions === 'badge-' + index && (
                              <div className="flex justify-around mt-2 w-full">
                                <Button onClick={() => handleShareToSocial('facebook', badge)} variant="ghost" size="icon"><Facebook className="h-5 w-5" /></Button>
                                <Button onClick={() => handleShareToSocial('twitter', badge)} variant="ghost" size="icon"><Twitter className="h-5 w-5" /></Button>
                                <Button onClick={() => handleShareToSocial('instagram', badge)} variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-0">
              <Card className="sci-fi-card mb-6">
                <div className="p-4 border-b border-safebite-card-bg-alt">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-safebite-text flex items-center">
                      <Trophy className="mr-2 h-5 w-5" />
                      Achievements
                    </h3>
                  </div>
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 text-safebite-teal animate-spin" />
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500">
                        Error loading achievements. Please try again.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allAchievements && allAchievements.map((achievement, index) => (
                          <div key={index} className="flex flex-col items-center p-4 rounded-md bg-safebite-card-bg-alt">
                            <Trophy className="h-10 w-10 text-amber-500 mb-2" />
                            <h4 className="text-lg font-semibold text-safebite-text text-center mb-2">{achievement.name}</h4>
                            <p className="text-safebite-text-secondary text-center">{achievement.description}</p>
                            <p className="text-safebite-text-secondary text-center mb-2">Progress: {achievement.progress}%</p>
                            <Progress value={achievement.progress} className="w-full mb-2" />
                            <Button
                              onClick={() => handleShare('achievement-' + index)}
                              className="mt-3 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 w-full"
                            >
                              Share
                            </Button>

                            {showShareOptions === 'achievement-' + index && (
                              <div className="flex justify-around mt-2 w-full">
                                <Button onClick={() => handleShareToSocial('facebook', achievement)} variant="ghost" size="icon"><Facebook className="h-5 w-5" /></Button>
                                <Button onClick={() => handleShareToSocial('twitter', achievement)} variant="ghost" size="icon"><Twitter className="h-5 w-5" /></Button>
                                <Button onClick={() => handleShareToSocial('instagram', achievement)} variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Reports;

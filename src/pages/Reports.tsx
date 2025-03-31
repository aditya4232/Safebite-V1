
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
  Clock, ArrowUpRight, Facebook, Twitter, Linkedin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { 
  getUserProgress,
  getAllBadges, 
  getAllAchievements,
  shareToSocialMedia
} from '@/services/gamification';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('healthReport');
  const [showShareOptions, setShowShareOptions] = useState<string | null>(null);
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  
  const userProgress = getUserProgress();
  const allBadges = getAllBadges();
  const allAchievements = getAllAchievements();
  
  // Weekly health data
  const weeklyCalorieData = [
    { date: 'Mon', value: 1800 },
    { date: 'Tue', value: 1600 },
    { date: 'Wed', value: 2100 },
    { date: 'Thu', value: 1500 },
    { date: 'Fri', value: 1900 },
    { date: 'Sat', value: 2200 },
    { date: 'Sun', value: 1700 },
  ];
  
  const weeklyWaterData = [
    { date: 'Mon', value: 6 },
    { date: 'Tue', value: 5 },
    { date: 'Wed', value: 8 },
    { date: 'Thu', value: 7 },
    { date: 'Fri', value: 4 },
    { date: 'Sat', value: 9 },
    { date: 'Sun', value: 6 },
  ];
  
  const weeklyNutrientData = [
    { date: 'Mon', value: 85 },
    { date: 'Tue', value: 78 },
    { date: 'Wed', value: 92 },
    { date: 'Thu', value: 76 },
    { date: 'Fri', value: 82 },
    { date: 'Sat', value: 89 },
    { date: 'Sun', value: 86 },
  ];
  
  // Health metrics
  const healthMetrics = [
    { name: 'Daily Calories', value: '1,750', target: '2,000', unit: 'kcal', progress: 87 },
    { name: 'Water Intake', value: '6.5', target: '8', unit: 'cups', progress: 81 },
    { name: 'Protein', value: '72', target: '80', unit: 'g', progress: 90 },
    { name: 'Carbs', value: '230', target: '250', unit: 'g', progress: 92 },
    { name: 'Fat', value: '58', target: '60', unit: 'g', progress: 97 },
    { name: 'Sugar', value: '32', target: '25', unit: 'g', progress: 128 },
    { name: 'Exercise', value: '35', target: '30', unit: 'min', progress: 117 },
  ];
  
  const foodSafetyIssues = [
    { 
      name: 'High Sodium Foods', 
      count: 4, 
      recommendation: 'Try to reduce your sodium intake by choosing low-sodium alternatives.' 
    },
    { 
      name: 'Artificial Additives', 
      count: 7, 
      recommendation: 'Consider choosing more natural food options with fewer additives.' 
    },
    { 
      name: 'Added Sugar', 
      count: 5, 
      recommendation: 'Look for sugar-free or reduced sugar alternatives.' 
    },
  ];

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

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>
      
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
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
                    <Badge className="bg-safebite-teal text-safebite-dark-blue">
                      Level {userProgress.level}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-medium text-safebite-text">{userProgress.points} XP</h4>
                      <p className="text-safebite-text-secondary">
                        {userProgress.nextLevelPoints - userProgress.points} XP until level {userProgress.level + 1}
                      </p>
                    </div>
                    <Progress value={(userProgress.points / userProgress.nextLevelPoints) * 100} className="w-1/2 h-2" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBadges.map((badge) => {
                      const badgeColors = {
                        bronze: 'border-amber-700 text-amber-500',
                        silver: 'border-gray-400 text-gray-300',
                        gold: 'border-yellow-500 text-yellow-400',
                        platinum: 'border-safebite-purple text-safebite-purple'
                      };
                      
                      return (
                        <div 
                          key={badge.id}
                          className={`relative p-4 border rounded-md ${
                            badge.achieved 
                              ? `border-2 ${badgeColors[badge.level]} bg-safebite-card-bg-alt` 
                              : 'border border-safebite-card-bg-alt bg-safebite-card-bg/50'
                          }`}
                        >
                          <div className="absolute -top-3 -right-3">
                            <Badge className={`${
                              badge.achieved 
                                ? 'bg-safebite-teal text-safebite-dark-blue' 
                                : 'bg-safebite-card-bg text-safebite-text-secondary'
                            }`}>
                              {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col items-center text-center">
                            <div className="text-4xl mb-3">{badge.icon}</div>
                            <h4 className={`font-medium mb-2 ${
                              badge.achieved ? 'text-safebite-text' : 'text-safebite-text-secondary'
                            }`}>
                              {badge.name}
                            </h4>
                            <p className="text-xs text-safebite-text-secondary mb-3">
                              {badge.description}
                            </p>
                            
                            {badge.progressMax && (
                              <div className="w-full">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-safebite-text-secondary">
                                    {badge.progress} / {badge.progressMax}
                                  </span>
                                  <span className="text-safebite-text-secondary">
                                    {Math.round((badge.progress! / badge.progressMax!) * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={(badge.progress! / badge.progressMax!) * 100} 
                                  className="h-1"
                                />
                              </div>
                            )}
                            
                            {badge.achieved && (
                              <div className="mt-4 relative">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="sci-fi-button"
                                  onClick={() => handleShare(badge.id)}
                                >
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Share
                                </Button>
                                
                                {showShareOptions === badge.id && (
                                  <div className="absolute bottom-full mb-2 left-0 right-0 bg-safebite-card-bg-alt p-2 rounded-md flex justify-center space-x-2">
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() => handleShareToSocial('twitter', badge)}
                                    >
                                      <Twitter className="h-4 w-4 text-blue-400" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() => handleShareToSocial('facebook', badge)}
                                    >
                                      <Facebook className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      className="h-8 w-8"
                                      onClick={() => handleShareToSocial('instagram', badge)}
                                    >
                                      <Linkedin className="h-4 w-4 text-blue-500" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-0">
              <Card className="sci-fi-card">
                <div className="p-4 border-b border-safebite-card-bg-alt">
                  <h3 className="text-xl font-semibold text-safebite-text flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Your Achievements
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {allAchievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 border rounded-md ${
                          achievement.completed 
                            ? 'border-safebite-teal bg-safebite-card-bg-alt' 
                            : 'border-safebite-card-bg-alt bg-safebite-card-bg/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className={`mt-1 mr-4 text-2xl ${
                              achievement.completed ? 'text-safebite-teal' : 'text-safebite-text-secondary'
                            }`}>
                              {achievement.completed ? <Trophy /> : <Star />}
                            </div>
                            <div>
                              <h4 className={`font-medium ${
                                achievement.completed ? 'text-safebite-text' : 'text-safebite-text-secondary'
                              }`}>
                                {achievement.name}
                              </h4>
                              <p className="text-sm text-safebite-text-secondary mb-2">
                                {achievement.description}
                              </p>
                              
                              {achievement.completed && achievement.date && (
                                <div className="flex items-center text-xs text-safebite-text-secondary">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Achieved on {achievement.date.toLocaleDateString()}
                                </div>
                              )}
                              
                              {achievement.reward && (
                                <div className="mt-2">
                                  <Badge className="bg-safebite-purple text-white">
                                    +{achievement.reward.points} XP
                                  </Badge>
                                  
                                  {achievement.reward.badges && achievement.reward.badges.length > 0 && (
                                    <Badge className="ml-2 bg-transparent border border-safebite-teal text-safebite-teal">
                                      +{achievement.reward.badges.length} Badge
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {achievement.completed && (
                            <div className="relative">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="sci-fi-button"
                                onClick={() => handleShare(achievement.id)}
                              >
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                              
                              {showShareOptions === achievement.id && (
                                <div className="absolute bottom-full mb-2 right-0 bg-safebite-card-bg-alt p-2 rounded-md flex justify-center space-x-2">
                                  <Button 
                                    size="icon" 
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => handleShareToSocial('twitter', achievement)}
                                  >
                                    <Twitter className="h-4 w-4 text-blue-400" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => handleShareToSocial('facebook', achievement)}
                                  >
                                    <Facebook className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="outline"
                                    className="h-8 w-8"
                                    onClick={() => handleShareToSocial('instagram', achievement)}
                                  >
                                    <Linkedin className="h-4 w-4 text-blue-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-safebite-text-secondary mt-6 text-right">
            Created by Aditya Shenvi
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;

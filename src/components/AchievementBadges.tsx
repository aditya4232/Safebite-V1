import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Award, Star, Target, Zap, Heart, 
  Utensils, Dumbbell, Brain, Droplets, Clock, 
  Calendar, CheckCircle2, Lock
} from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useGuestMode } from '@/hooks/useGuestMode';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  xp: number;
  category: 'nutrition' | 'fitness' | 'general' | 'streak';
  dateUnlocked?: Date;
}

const AchievementBadges: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isGuest } = useGuestMode();
  
  useEffect(() => {
    const loadAchievements = async () => {
      setIsLoading(true);
      
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user || isGuest) {
          // For guest users, show mock achievements with some unlocked
          const mockAchievements = generateMockAchievements();
          setAchievements(mockAchievements);
          
          // Calculate total XP
          const xp = mockAchievements
            .filter(a => a.unlocked)
            .reduce((total, achievement) => total + achievement.xp, 0);
          
          setTotalXP(xp);
          return;
        }
        
        // For logged-in users, fetch achievements from Firebase
        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userAchievements = userData.achievements || [];
          
          // Merge user achievements with all possible achievements
          const allAchievements = generateAllAchievements();
          
          const mergedAchievements = allAchievements.map(achievement => {
            const userAchievement = userAchievements.find((a: any) => a.id === achievement.id);
            
            if (userAchievement) {
              return {
                ...achievement,
                unlocked: userAchievement.unlocked || achievement.unlocked,
                progress: userAchievement.progress || achievement.progress,
                dateUnlocked: userAchievement.dateUnlocked ? new Date(userAchievement.dateUnlocked) : undefined
              };
            }
            
            return achievement;
          });
          
          setAchievements(mergedAchievements);
          
          // Calculate total XP
          const xp = mergedAchievements
            .filter(a => a.unlocked)
            .reduce((total, achievement) => total + achievement.xp, 0);
          
          setTotalXP(xp);
        } else {
          // If user document doesn't exist, use mock achievements
          const mockAchievements = generateMockAchievements();
          setAchievements(mockAchievements);
          
          // Calculate total XP
          const xp = mockAchievements
            .filter(a => a.unlocked)
            .reduce((total, achievement) => total + achievement.xp, 0);
          
          setTotalXP(xp);
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
        // Fall back to mock achievements
        const mockAchievements = generateMockAchievements();
        setAchievements(mockAchievements);
        
        // Calculate total XP
        const xp = mockAchievements
          .filter(a => a.unlocked)
          .reduce((total, achievement) => total + achievement.xp, 0);
        
        setTotalXP(xp);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAchievements();
  }, [isGuest]);
  
  // Generate all possible achievements
  const generateAllAchievements = (): Achievement[] => {
    return [
      {
        id: 'first_login',
        name: 'First Steps',
        description: 'Log in to SafeBite for the first time',
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        unlocked: true,
        progress: 1,
        maxProgress: 1,
        xp: 10,
        category: 'general',
        dateUnlocked: new Date()
      },
      {
        id: 'complete_profile',
        name: 'Identity Established',
        description: 'Complete your user profile',
        icon: <User className="h-6 w-6 text-blue-500" />,
        unlocked: true,
        progress: 1,
        maxProgress: 1,
        xp: 20,
        category: 'general'
      },
      {
        id: 'first_search',
        name: 'Curious Mind',
        description: 'Perform your first food search',
        icon: <Search className="h-6 w-6 text-purple-500" />,
        unlocked: true,
        progress: 1,
        maxProgress: 1,
        xp: 15,
        category: 'nutrition'
      },
      {
        id: 'weekly_checkin',
        name: 'Health Tracker',
        description: 'Complete your first weekly health check-in',
        icon: <ClipboardCheck className="h-6 w-6 text-teal-500" />,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        xp: 25,
        category: 'general'
      },
      {
        id: 'search_streak',
        name: 'Consistent Researcher',
        description: 'Search for food items 5 days in a row',
        icon: <Zap className="h-6 w-6 text-yellow-500" />,
        unlocked: false,
        progress: 2,
        maxProgress: 5,
        xp: 30,
        category: 'streak'
      },
      {
        id: 'nutrition_expert',
        name: 'Nutrition Expert',
        description: 'View detailed nutrition information for 20 different foods',
        icon: <Utensils className="h-6 w-6 text-orange-500" />,
        unlocked: false,
        progress: 8,
        maxProgress: 20,
        xp: 40,
        category: 'nutrition'
      },
      {
        id: 'fitness_enthusiast',
        name: 'Fitness Enthusiast',
        description: 'Log exercise activity for 10 days',
        icon: <Dumbbell className="h-6 w-6 text-red-500" />,
        unlocked: false,
        progress: 3,
        maxProgress: 10,
        xp: 35,
        category: 'fitness'
      },
      {
        id: 'hydration_master',
        name: 'Hydration Master',
        description: 'Log drinking 8+ cups of water daily for a week',
        icon: <Droplets className="h-6 w-6 text-blue-400" />,
        unlocked: false,
        progress: 4,
        maxProgress: 7,
        xp: 30,
        category: 'general'
      },
      {
        id: 'sleep_champion',
        name: 'Sleep Champion',
        description: 'Log 7+ hours of sleep for 5 consecutive days',
        icon: <Clock className="h-6 w-6 text-indigo-500" />,
        unlocked: false,
        progress: 2,
        maxProgress: 5,
        xp: 25,
        category: 'general'
      },
      {
        id: 'meal_planner',
        name: 'Meal Planner',
        description: 'Create your first meal plan',
        icon: <Calendar className="h-6 w-6 text-green-600" />,
        unlocked: false,
        progress: 0,
        maxProgress: 1,
        xp: 20,
        category: 'nutrition'
      }
    ];
  };
  
  // Generate mock achievements for guest users or initial state
  const generateMockAchievements = (): Achievement[] => {
    const allAchievements = generateAllAchievements();
    
    // Unlock a few achievements for demo purposes
    return allAchievements.map((achievement, index) => ({
      ...achievement,
      unlocked: index < 3, // First 3 achievements are unlocked
      progress: index < 3 ? achievement.maxProgress : Math.floor(achievement.maxProgress * 0.3) // 30% progress on locked achievements
    }));
  };
  
  // Get level based on XP
  const getLevel = (xp: number): number => {
    return Math.floor(xp / 100) + 1;
  };
  
  // Get progress to next level
  const getLevelProgress = (xp: number): number => {
    const level = getLevel(xp);
    const levelStartXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    return ((xp - levelStartXP) / (nextLevelXP - levelStartXP)) * 100;
  };
  
  return (
    <Card className="sci-fi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Achievements & XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* XP and Level */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-safebite-text font-medium">Level {getLevel(totalXP)}</span>
            </div>
            <span className="text-safebite-text-secondary text-sm">{totalXP} XP</span>
          </div>
          <Progress value={getLevelProgress(totalXP)} className="h-2" />
          <p className="text-xs text-safebite-text-secondary mt-1 text-right">
            {100 - (totalXP % 100)} XP to Level {getLevel(totalXP) + 1}
          </p>
        </div>
        
        {/* Achievement Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`relative flex flex-col items-center justify-center p-3 rounded-lg border ${
                achievement.unlocked 
                  ? 'border-yellow-500/50 bg-yellow-500/10' 
                  : 'border-gray-700 bg-gray-800/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                achievement.unlocked ? 'bg-yellow-500/20' : 'bg-gray-800'
              }`}>
                {achievement.unlocked ? (
                  achievement.icon
                ) : (
                  <Lock className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <h3 className={`text-xs font-medium text-center mb-1 ${
                achievement.unlocked ? 'text-safebite-text' : 'text-gray-500'
              }`}>
                {achievement.name}
              </h3>
              {!achievement.unlocked && achievement.progress > 0 && (
                <div className="w-full mt-1">
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {achievement.progress}/{achievement.maxProgress}
                  </p>
                </div>
              )}
              {achievement.unlocked && (
                <Badge variant="outline" className="text-[10px] mt-1 border-yellow-500/50 text-yellow-500">
                  +{achievement.xp} XP
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Import these icons here to avoid circular dependencies
import { User, Search, ClipboardCheck } from 'lucide-react';

export default AchievementBadges;

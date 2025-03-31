
// Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  achieved: boolean;
  progress?: number;
  progressMax?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  date?: Date;
  reward?: {
    points: number;
    badges?: Badge[];
  };
}

export interface UserProgress {
  level: number;
  points: number;
  badges: Badge[];
  achievements: Achievement[];
  nextLevelPoints: number;
}

// Initial badges
const initialBadges: Badge[] = [
  {
    id: 'food_explorer',
    name: 'Food Explorer',
    description: 'Scan 10 different food products',
    icon: '🔍',
    level: 'bronze',
    achieved: false,
    progress: 2,
    progressMax: 10
  },
  {
    id: 'water_tracker',
    name: 'Hydration Hero',
    description: 'Track your water intake for 7 consecutive days',
    icon: '💧',
    level: 'silver',
    achieved: false,
    progress: 3,
    progressMax: 7
  },
  {
    id: 'recipe_master',
    name: 'Recipe Master',
    description: 'Save and try 5 healthy recipes',
    icon: '🍲',
    level: 'gold',
    achieved: false,
    progress: 1,
    progressMax: 5
  },
  {
    id: 'community_helper',
    name: 'Community Guide',
    description: 'Help 3 users by answering their questions in the community',
    icon: '🤝',
    level: 'bronze',
    achieved: false,
    progress: 0,
    progressMax: 3
  },
  {
    id: 'health_analyst',
    name: 'Health Analyst',
    description: 'Complete all health calculators in the HealthBox',
    icon: '📊',
    level: 'silver',
    achieved: true
  },
];

// Initial achievements
const initialAchievements: Achievement[] = [
  {
    id: 'first_login',
    name: 'First Steps',
    description: 'Log in to SafeBite for the first time',
    completed: true,
    date: new Date(Date.now() - 86400000 * 3), // 3 days ago
    reward: {
      points: 100
    }
  },
  {
    id: 'complete_profile',
    name: 'Getting to Know You',
    description: 'Complete your user profile with all health data',
    completed: true,
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
    reward: {
      points: 150
    }
  },
  {
    id: 'first_scan',
    name: 'Food Detective',
    description: 'Scan your first food product',
    completed: true,
    date: new Date(Date.now() - 86400000), // 1 day ago
    reward: {
      points: 50,
      badges: [
        {
          id: 'first_scan_badge',
          name: 'Scanner Novice',
          description: 'First food product scanned',
          icon: '🔎',
          level: 'bronze',
          achieved: true
        }
      ]
    }
  },
  {
    id: 'first_week',
    name: 'One Week Strong',
    description: 'Use SafeBite for 7 consecutive days',
    completed: false,
    reward: {
      points: 200
    }
  },
  {
    id: 'health_guru',
    name: 'Health Guru',
    description: 'Achieve all health goals for one week',
    completed: false,
    reward: {
      points: 500,
      badges: [
        {
          id: 'health_guru_badge',
          name: 'Health Master',
          description: 'Achieved all health goals for a week',
          icon: '🏆',
          level: 'gold',
          achieved: false
        }
      ]
    }
  }
];

// Initial user progress
const initialUserProgress: UserProgress = {
  level: 2,
  points: 350,
  badges: initialBadges.filter(badge => badge.achieved),
  achievements: initialAchievements.filter(achievement => achievement.completed),
  nextLevelPoints: 500
};

// Get user progress
export const getUserProgress = (): UserProgress => {
  // This would normally fetch from a database or local storage
  return initialUserProgress;
};

// Get all badges (both achieved and unachieved)
export const getAllBadges = (): Badge[] => {
  return initialBadges;
};

// Get all achievements (both completed and incomplete)
export const getAllAchievements = (): Achievement[] => {
  return initialAchievements;
};

// Award a badge to the user
export const awardBadge = (badgeId: string): Badge | null => {
  const badge = initialBadges.find(b => b.id === badgeId && !b.achieved);
  
  if (badge) {
    badge.achieved = true;
    badge.progress = badge.progressMax;
    
    // Add to user's badges
    if (!initialUserProgress.badges.some(b => b.id === badgeId)) {
      initialUserProgress.badges.push(badge);
    }
    
    // Add points based on badge level
    const pointsMap = {
      bronze: 50,
      silver: 100,
      gold: 200,
      platinum: 500
    };
    
    initialUserProgress.points += pointsMap[badge.level];
    
    // Check if level up is needed
    if (initialUserProgress.points >= initialUserProgress.nextLevelPoints) {
      initialUserProgress.level += 1;
      initialUserProgress.nextLevelPoints += 250; // Increase points needed for next level
    }
    
    return badge;
  }
  
  return null;
};

// Complete an achievement
export const completeAchievement = (achievementId: string): Achievement | null => {
  const achievement = initialAchievements.find(a => a.id === achievementId && !a.completed);
  
  if (achievement) {
    achievement.completed = true;
    achievement.date = new Date();
    
    // Add to user's achievements
    if (!initialUserProgress.achievements.some(a => a.id === achievementId)) {
      initialUserProgress.achievements.push(achievement);
    }
    
    // Award points
    if (achievement.reward) {
      initialUserProgress.points += achievement.reward.points;
      
      // Award badge if exists
      if (achievement.reward.badges) {
        achievement.reward.badges.forEach(badge => {
          const existingBadge = initialBadges.find(b => b.id === badge.id);
          if (existingBadge) {
            existingBadge.achieved = true;
            
            if (!initialUserProgress.badges.some(b => b.id === badge.id)) {
              initialUserProgress.badges.push(existingBadge);
            }
          }
        });
      }
    }
    
    // Check if level up is needed
    if (initialUserProgress.points >= initialUserProgress.nextLevelPoints) {
      initialUserProgress.level += 1;
      initialUserProgress.nextLevelPoints += 250; // Increase points needed for next level
    }
    
    return achievement;
  }
  
  return null;
};

// Generate a shareable image for social media
export const generateShareableImage = (achievement: Achievement | Badge): string => {
  // This would normally generate a canvas or image for sharing
  // For now, we'll just return a placeholder URL
  return `https://safebite.app/share/${achievement.id}`;
};

// Share achievement or badge to social media
export const shareToSocialMedia = (achievement: Achievement | Badge, platform: 'twitter' | 'facebook' | 'instagram'): boolean => {
  const imageUrl = generateShareableImage(achievement);
  
  // This would normally integrate with social media APIs
  console.log(`Sharing ${achievement.name} to ${platform} with image: ${imageUrl}`);
  
  // Mock successful share
  return true;
};

// src/services/healthTipsService.ts

interface UserProfile {
  age?: string;
  gender?: string;
  height_weight?: string;
  activity_level?: string;
  health_conditions?: string;
  health_goals?: string;
  dietary_restrictions?: string;
  food_preferences?: string;
  allergies?: string;
  meal_frequency?: string;
  water_intake?: number;
  sleep_hours?: string;
  stress_level?: string;
  supplement_use?: string;
  cooking_frequency?: string;
  eating_out_frequency?: string;
  snacking_habits?: string;
  alcohol_consumption?: string;
  smoking_status?: string;
  family_history?: string;
  [key: string]: any;
}

interface WeeklyData {
  home_cooked?: number;
  water_intake?: number;
  junk_food?: number;
  exercise?: number;
  energy_level?: string;
  [key: string]: any;
}

interface HealthTip {
  text: string;
  color: string;
  priority: number;
}

export const generateHealthTips = (
  userProfile: UserProfile | null,
  weeklyData: WeeklyData | null
): HealthTip[] => {
  const tips: HealthTip[] = [];

  if (!userProfile) {
    return getDefaultTips();
  }

  // Extract basic metrics
  const activityLevel = userProfile.activity_level || '';
  const healthGoal = userProfile.health_goals || '';
  const healthCondition = userProfile.health_conditions || '';
  const dietaryRestrictions = userProfile.dietary_restrictions || '';
  
  // Extract weekly data if available
  const homeCookedMeals = weeklyData?.home_cooked || 0;
  const waterIntake = weeklyData?.water_intake || 0;
  const junkFood = weeklyData?.junk_food || 0;
  const exerciseMinutes = weeklyData?.exercise || 0;
  const energyLevel = weeklyData?.energy_level || '';

  // Activity level based tips
  if (activityLevel === 'Sedentary') {
    tips.push({
      text: 'Try to incorporate more movement into your day, even short walks help',
      color: 'bg-yellow-500',
      priority: 8
    });
  } else if (activityLevel === 'Lightly Active') {
    tips.push({
      text: 'Consider adding 1-2 strength training sessions to your weekly routine',
      color: 'bg-blue-500',
      priority: 6
    });
  }

  // Health goal based tips
  if (healthGoal === 'Weight Loss') {
    tips.push({
      text: 'Focus on protein-rich foods to help maintain muscle while losing fat',
      color: 'bg-green-500',
      priority: 9
    });
    
    if (junkFood > 5) {
      tips.push({
        text: `You had ${junkFood} junk food meals this week. Try to reduce by 2 next week`,
        color: 'bg-red-500',
        priority: 10
      });
    }
  } else if (healthGoal === 'Muscle Gain') {
    tips.push({
      text: 'Ensure you\'re getting 1.6-2.2g of protein per kg of bodyweight daily',
      color: 'bg-blue-500',
      priority: 9
    });
  } else if (healthGoal === 'General Health') {
    tips.push({
      text: 'Aim for 5+ servings of different colored vegetables and fruits daily',
      color: 'bg-green-500',
      priority: 7
    });
  }

  // Health condition based tips
  if (healthCondition === 'Diabetes') {
    tips.push({
      text: 'Monitor your carbohydrate intake and focus on low glycemic index foods',
      color: 'bg-purple-500',
      priority: 10
    });
  } else if (healthCondition === 'Hypertension') {
    tips.push({
      text: 'Reduce sodium intake and increase potassium-rich foods like bananas',
      color: 'bg-purple-500',
      priority: 10
    });
  } else if (healthCondition === 'Heart Issues') {
    tips.push({
      text: 'Include omega-3 rich foods like fatty fish, walnuts, and flaxseeds',
      color: 'bg-purple-500',
      priority: 10
    });
  }

  // Weekly data based tips
  if (homeCookedMeals < 10) {
    tips.push({
      text: `You only had ${homeCookedMeals} home-cooked meals. Aim for 14+ per week`,
      color: 'bg-yellow-500',
      priority: 8
    });
  }

  if (waterIntake < 8) {
    tips.push({
      text: `Your water intake (${waterIntake} glasses/day) is below recommended. Aim for 8+`,
      color: 'bg-yellow-500',
      priority: 9
    });
  }

  if (exerciseMinutes < 150) {
    tips.push({
      text: `You exercised for ${exerciseMinutes} minutes this week. Aim for 150+ minutes`,
      color: 'bg-red-500',
      priority: 8
    });
  }

  if (energyLevel === 'Low' || energyLevel === 'Very Low') {
    tips.push({
      text: 'Your energy levels are low. Consider improving sleep quality and reducing stress',
      color: 'bg-red-500',
      priority: 7
    });
  }

  // Dietary restriction based tips
  if (dietaryRestrictions === 'Vegetarian') {
    tips.push({
      text: 'Ensure you\'re getting enough vitamin B12 and iron from plant sources',
      color: 'bg-green-500',
      priority: 6
    });
  } else if (dietaryRestrictions === 'Vegan') {
    tips.push({
      text: 'Consider supplementing with vitamin B12, D3, and omega-3 fatty acids',
      color: 'bg-green-500',
      priority: 7
    });
  } else if (dietaryRestrictions === 'Gluten-Free') {
    tips.push({
      text: 'Focus on naturally gluten-free whole grains like rice, quinoa, and millet',
      color: 'bg-green-500',
      priority: 6
    });
  }

  // Sort tips by priority (highest first) and take top 4
  return tips.sort((a, b) => b.priority - a.priority).slice(0, 4);
};

const getDefaultTips = (): HealthTip[] => {
  return [
    {
      text: 'Stay hydrated by drinking at least 8 glasses of water daily',
      color: 'bg-blue-500',
      priority: 5
    },
    {
      text: 'Aim for 5+ servings of vegetables and fruits each day',
      color: 'bg-green-500',
      priority: 5
    },
    {
      text: 'Try to get at least 150 minutes of moderate exercise weekly',
      color: 'bg-yellow-500',
      priority: 5
    },
    {
      text: 'Prioritize 7-9 hours of quality sleep each night',
      color: 'bg-purple-500',
      priority: 5
    }
  ];
};

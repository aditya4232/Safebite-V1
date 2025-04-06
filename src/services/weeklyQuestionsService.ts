// src/services/weeklyQuestionsService.ts
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import { analyzeFoodItem } from './geminiService';

// Types
export interface Question {
  id: string;
  text: string;
  type: 'radio' | 'slider' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

// Base questions that are always asked
const baseQuestions: Question[] = [
  {
    id: 'home_cooked',
    text: 'How many home-cooked meals did you have this week?',
    type: 'slider',
    min: 0,
    max: 21,
    step: 1
  },
  {
    id: 'water_intake',
    text: 'On average, how many glasses of water did you drink daily?',
    type: 'slider',
    min: 0,
    max: 15,
    step: 1
  },
  {
    id: 'junk_food',
    text: 'How many times did you consume processed/junk food this week?',
    type: 'slider',
    min: 0,
    max: 20,
    step: 1
  },
  {
    id: 'exercise',
    text: 'How many minutes did you exercise this week in total?',
    type: 'slider',
    min: 0,
    max: 1000,
    step: 10
  },
  {
    id: 'energy_level',
    text: 'How would you rate your energy levels this week?',
    type: 'radio',
    options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  }
];

// Pool of additional questions to choose from based on user profile
const additionalQuestions: Question[] = [
  {
    id: 'stress_level',
    text: 'How would you rate your stress levels this week?',
    type: 'radio',
    options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  },
  {
    id: 'sleep_quality',
    text: 'How would you rate your sleep quality this week?',
    type: 'radio',
    options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  {
    id: 'sleep_hours',
    text: 'On average, how many hours of sleep did you get each night?',
    type: 'slider',
    min: 0,
    max: 12,
    step: 0.5
  },
  {
    id: 'fruit_veg',
    text: 'How many servings of fruits and vegetables did you eat daily on average?',
    type: 'slider',
    min: 0,
    max: 10,
    step: 1
  },
  {
    id: 'protein_intake',
    text: 'How many protein-rich meals did you have this week?',
    type: 'slider',
    min: 0,
    max: 21,
    step: 1
  },
  {
    id: 'alcohol',
    text: 'How many alcoholic drinks did you consume this week?',
    type: 'slider',
    min: 0,
    max: 30,
    step: 1
  },
  {
    id: 'mindfulness',
    text: 'How many minutes did you spend on mindfulness or meditation this week?',
    type: 'slider',
    min: 0,
    max: 500,
    step: 5
  },
  {
    id: 'social_activity',
    text: 'How many social activities did you participate in this week?',
    type: 'slider',
    min: 0,
    max: 20,
    step: 1
  },
  {
    id: 'screen_time',
    text: 'On average, how many hours of screen time did you have daily (excluding work)?',
    type: 'slider',
    min: 0,
    max: 16,
    step: 0.5
  },
  {
    id: 'outdoor_time',
    text: 'How many hours did you spend outdoors this week?',
    type: 'slider',
    min: 0,
    max: 100,
    step: 1
  },
  {
    id: 'new_foods',
    text: 'How many new foods or recipes did you try this week?',
    type: 'slider',
    min: 0,
    max: 20,
    step: 1
  },
  {
    id: 'supplement_use',
    text: 'Did you take your supplements/medications as prescribed this week?',
    type: 'radio',
    options: ['Never', 'Rarely', 'Sometimes', 'Usually', 'Always']
  },
  {
    id: 'mood',
    text: 'How would you describe your overall mood this week?',
    type: 'radio',
    options: ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']
  },
  {
    id: 'digestion',
    text: 'How would you rate your digestive health this week?',
    type: 'radio',
    options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  {
    id: 'sugar_intake',
    text: 'How many sugary foods or drinks did you consume this week?',
    type: 'slider',
    min: 0,
    max: 30,
    step: 1
  }
];

// Health condition specific questions
const conditionSpecificQuestions: Record<string, Question[]> = {
  'Diabetes': [
    {
      id: 'blood_sugar',
      text: 'How many times did your blood sugar levels go outside your target range this week?',
      type: 'slider',
      min: 0,
      max: 30,
      step: 1
    },
    {
      id: 'carb_tracking',
      text: 'How consistently did you track your carbohydrate intake this week?',
      type: 'radio',
      options: ['Not at all', 'Rarely', 'Sometimes', 'Usually', 'Always']
    }
  ],
  'Hypertension': [
    {
      id: 'blood_pressure',
      text: 'How many times did you check your blood pressure this week?',
      type: 'slider',
      min: 0,
      max: 30,
      step: 1
    },
    {
      id: 'salt_intake',
      text: 'How would you rate your salt intake this week?',
      type: 'radio',
      options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
    }
  ],
  'Heart Issues': [
    {
      id: 'cardio_exercise',
      text: 'How many minutes of cardiovascular exercise did you do this week?',
      type: 'slider',
      min: 0,
      max: 500,
      step: 5
    },
    {
      id: 'heart_symptoms',
      text: 'Did you experience any heart-related symptoms this week?',
      type: 'radio',
      options: ['None', 'Mild', 'Moderate', 'Severe']
    }
  ],
  'Digestive Issues': [
    {
      id: 'digestive_symptoms',
      text: 'How many days this week did you experience digestive discomfort?',
      type: 'slider',
      min: 0,
      max: 7,
      step: 1
    },
    {
      id: 'fiber_intake',
      text: 'How would you rate your fiber intake this week?',
      type: 'radio',
      options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
    }
  ]
};

// Goal specific questions
const goalSpecificQuestions: Record<string, Question[]> = {
  'Weight Loss': [
    {
      id: 'calorie_tracking',
      text: 'How consistently did you track your calories this week?',
      type: 'radio',
      options: ['Not at all', 'Rarely', 'Sometimes', 'Usually', 'Always']
    },
    {
      id: 'weight_change',
      text: 'How has your weight changed this week?',
      type: 'radio',
      options: ['Decreased significantly', 'Decreased slightly', 'Stayed the same', 'Increased slightly', 'Increased significantly']
    }
  ],
  'Muscle Gain': [
    {
      id: 'strength_training',
      text: 'How many strength training sessions did you complete this week?',
      type: 'slider',
      min: 0,
      max: 14,
      step: 1
    },
    {
      id: 'protein_goal',
      text: 'How many days did you meet your protein intake goal this week?',
      type: 'slider',
      min: 0,
      max: 7,
      step: 1
    }
  ],
  'General Health': [
    {
      id: 'balanced_meals',
      text: 'How many balanced meals (including protein, carbs, and healthy fats) did you have this week?',
      type: 'slider',
      min: 0,
      max: 21,
      step: 1
    },
    {
      id: 'health_habits',
      text: 'How many days did you maintain all your healthy habits this week?',
      type: 'slider',
      min: 0,
      max: 7,
      step: 1
    }
  ]
};

// Get personalized weekly questions based on user profile and previous answers
export const getPersonalizedWeeklyQuestions = async (): Promise<Question[]> => {
  try {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      console.log('User not logged in, returning base questions');
      return baseQuestions;
    }

    const db = getFirestore(app);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log('User profile not found, returning base questions');
      return baseQuestions;
    }

    const userData = userSnap.data();
    const userProfile = userData.profile || {};
    const previousAnswers = userData.weeklyCheckin?.answers || {};
    const previousQuestions = userData.previousWeeklyQuestions || [];

    // Start with base questions
    let personalizedQuestions = [...baseQuestions];

    // Add condition-specific questions if applicable
    const healthCondition = userProfile.health_conditions;
    if (healthCondition && conditionSpecificQuestions[healthCondition]) {
      personalizedQuestions = [...personalizedQuestions, ...conditionSpecificQuestions[healthCondition]];
    }

    // Add goal-specific questions if applicable
    const healthGoal = userProfile.health_goals;
    if (healthGoal && goalSpecificQuestions[healthGoal]) {
      personalizedQuestions = [...personalizedQuestions, ...goalSpecificQuestions[healthGoal]];
    }

    // Add 2-3 random questions from the additional pool
    // Avoid questions that were asked in the previous 2 weeks
    const availableAdditionalQuestions = additionalQuestions.filter(
      question => !previousQuestions.includes(question.id)
    );

    // Shuffle available questions
    const shuffledQuestions = availableAdditionalQuestions.sort(() => Math.random() - 0.5);

    // Add 2-3 random questions
    const numAdditionalQuestions = Math.floor(Math.random() * 2) + 2; // 2-3 questions
    const selectedAdditionalQuestions = shuffledQuestions.slice(0, numAdditionalQuestions);

    personalizedQuestions = [...personalizedQuestions, ...selectedAdditionalQuestions];

    // Save the IDs of the questions being asked this week
    const questionIds = personalizedQuestions.map(q => q.id);
    await setDoc(userRef, {
      previousWeeklyQuestions: questionIds
    }, { merge: true });

    return personalizedQuestions;
  } catch (error) {
    console.error('Error getting personalized weekly questions:', error);
    return baseQuestions;
  }
};

// Generate AI-powered insights based on weekly answers
export const generateWeeklyInsights = async (answers: Record<string, any>): Promise<string> => {
  try {
    // Create a food-like object to analyze with the AI
    const weeklyData = {
      name: "Weekly Health Data",
      brand: "SafeBite Health Tracker",
      calories: 0,
      nutrients: {
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
      },
      details: {
        ingredients: [],
        allergens: [],
        additives: []
      }
    };

    // Add weekly data as "ingredients"
    for (const [key, value] of Object.entries(answers)) {
      weeklyData.details.ingredients.push(`${key.replace(/_/g, ' ')}: ${value}`);
    }

    // Use the food analysis function to analyze the weekly data
    const analysis = await analyzeFoodItem(weeklyData);

    // Clean up the analysis to make it more appropriate for weekly insights
    const cleanedAnalysis = analysis
      .replace(/nutritional assessment/gi, 'weekly health assessment')
      .replace(/food/gi, 'health data')
      .replace(/meal/gi, 'week')
      .replace(/eat/gi, 'maintain')
      .replace(/diet/gi, 'lifestyle');

    return cleanedAnalysis;
  } catch (error) {
    console.error('Error generating weekly insights:', error);
    return "We couldn't generate insights from your weekly data at this time. Please try again later.";
  }
};

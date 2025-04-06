// src/services/mlService.ts
// Simplified version without TensorFlow.js dependency
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
// Import the existing Firebase app instance
import { app } from "../firebase";

// Interface for user activity data
interface UserActivity {
  timestamp: number;
  action: string;
  data: any;
}

// Interface for user preferences
interface UserPreferences {
  dietaryPreference?: string;
  healthGoal?: string;
  activityLevel?: string;
  foodPreferences?: string[];
  allergies?: string[];
}

// Interface for prediction result
interface PredictionResult {
  category: string;
  score: number;
}

// Using the existing Firebase app instance from main.tsx

// Class to handle user data tracking and recommendations
export class UserMLService {
  private userId: string | null = null;
  private db: Firestore | null = null;
  private auth: Auth | null = null;
  private activityHistory: UserActivity[] = [];
  private userPreferences: UserPreferences = {};
  private initialized = false;

  constructor() {
    // Initialize the service
    this.initialize();
  }

  // Initialize the service
  private async initialize() {
    try {
      // Use the existing Firebase app instance
      if (!this.initialized) {
        // Initialize Firestore and Auth using the existing app
        this.db = getFirestore(app);
        this.auth = getAuth(app);

        this.initialized = true;
        console.log('Firebase services initialized in mlService');
      }

      // Check if user is logged in
      if (this.auth) {
        const user = this.auth.currentUser;
        if (user) {
          this.userId = user.uid;
          await this.loadUserData();
        }

        // Listen for auth state changes
        this.auth.onAuthStateChanged(async (user) => {
          if (user) {
            this.userId = user.uid;
            await this.loadUserData();
          } else {
            this.userId = null;
            this.activityHistory = [];
            this.userPreferences = {};
          }
        });
      }
    } catch (error) {
      console.error('Error initializing mlService:', error);
    }
  }

  // Load user data from Firestore
  private async loadUserData() {
    if (!this.userId || !this.db) return;

    try {
      // Get user profile
      const userRef = doc(this.db, "users", this.userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Load user preferences
        if (userData.profile) {
          this.userPreferences = {
            dietaryPreference: userData.profile.dietary_preferences,
            healthGoal: userData.profile.health_goals,
            activityLevel: userData.profile.activity_level,
            foodPreferences: userData.profile.food_preferences || [],
            allergies: userData.profile.allergies || []
          };
        }

        // Load activity history
        if (userData.activityHistory) {
          this.activityHistory = userData.activityHistory;
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Track user activity
  public async trackActivity(action: string, data: any) {
    if (!this.userId || !this.db) return;

    try {
      // Create activity object
      const activity: UserActivity = {
        timestamp: Date.now(),
        action,
        data
      };

      // Add to local history
      this.activityHistory.push(activity);

      // Save to Firestore
      const userRef = doc(this.db, "users", this.userId);
      await updateDoc(userRef, {
        activityHistory: arrayUnion(activity)
      });

      console.log(`Tracked activity: ${action}`);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Track food search
  public async trackFoodSearch(query: string, selectedItems: any[]) {
    await this.trackActivity('food_search', {
      query,
      selectedItems: selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || 'unknown'
      }))
    });
  }

  // Track recipe search
  public async trackRecipeSearch(query: string, selectedRecipes: any[]) {
    await this.trackActivity('recipe_search', {
      query,
      selectedRecipes: selectedRecipes.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        healthLabels: recipe.healthLabels || []
      }))
    });
  }

  // Track health box interaction
  public async trackHealthBoxInteraction(boxType: string, action: string) {
    await this.trackActivity('health_box', {
      boxType,
      action
    });
  }

  // Track preference change
  public async trackPreferenceChange(preference: string, value: any) {
    await this.trackActivity('preference_change', {
      preference,
      value
    });
  }

  // Get default food recommendations
  private getDefaultRecommendations(): string[] {
    return [
      'Spinach',
      'Chicken Breast',
      'Brown Rice',
      'Greek Yogurt',
      'Almonds'
    ];
  }

  // Get recommendations for a specific category
  private getCategoryRecommendations(category: string): string[] {
    switch (category) {
      case 'protein':
        return ['Chicken Breast', 'Tofu', 'Lentils', 'Salmon', 'Greek Yogurt'];
      case 'carbs':
        return ['Brown Rice', 'Quinoa', 'Sweet Potato', 'Oats', 'Whole Wheat Bread'];
      case 'vegetables':
        return ['Spinach', 'Broccoli', 'Kale', 'Bell Peppers', 'Carrots'];
      case 'fruits':
        return ['Blueberries', 'Apples', 'Bananas', 'Oranges', 'Strawberries'];
      case 'dairy':
        return ['Greek Yogurt', 'Cottage Cheese', 'Milk', 'Cheese', 'Kefir'];
      default:
        return this.getDefaultRecommendations();
    }
  }

  // Get recommendations based on health goal
  private getHealthGoalRecommendations(healthGoal: string): string[] {
    const goal = healthGoal.toLowerCase();

    if (goal.includes('weight loss')) {
      return ['Leafy Greens', 'Lean Protein', 'Berries', 'Green Tea', 'Chia Seeds'];
    } else if (goal.includes('muscle') || goal.includes('gain')) {
      return ['Chicken Breast', 'Eggs', 'Salmon', 'Greek Yogurt', 'Quinoa'];
    } else if (goal.includes('health')) {
      return ['Spinach', 'Blueberries', 'Salmon', 'Walnuts', 'Sweet Potatoes'];
    } else {
      return this.getDefaultRecommendations();
    }
  }

  // Get food recommendations based on user preferences
  public async getFoodRecommendations(): Promise<string[]> {
    // Make sure we're initialized and have a user
    if (!this.initialized || !this.userId || !this.db) {
      return this.getDefaultRecommendations();
    }

    try {
      // Get recommendations based on user preferences
      const recommendations: string[] = [];

      // Add recommendations based on dietary preference
      if (this.userPreferences.dietaryPreference) {
        const pref = this.userPreferences.dietaryPreference.toLowerCase();
        if (pref.includes('vegetarian')) {
          recommendations.push('Tofu', 'Lentils', 'Chickpeas');
        } else if (pref.includes('vegan')) {
          recommendations.push('Tofu', 'Tempeh', 'Nutritional Yeast');
        } else if (pref.includes('keto')) {
          recommendations.push('Avocado', 'Eggs', 'Salmon');
        } else {
          recommendations.push('Chicken Breast', 'Salmon', 'Eggs');
        }
      }

      // Add recommendations based on health goal
      if (this.userPreferences.healthGoal) {
        const goalRecommendations = this.getHealthGoalRecommendations(this.userPreferences.healthGoal);
        recommendations.push(...goalRecommendations.slice(0, 2));
      }

      // Add recommendations based on food preferences
      if (this.userPreferences.foodPreferences && this.userPreferences.foodPreferences.length > 0) {
        // Get a random food preference
        const randomIndex = Math.floor(Math.random() * this.userPreferences.foodPreferences.length);
        const foodPref = this.userPreferences.foodPreferences[randomIndex].toLowerCase();

        if (foodPref.includes('indian')) {
          recommendations.push('Lentils', 'Chickpeas', 'Basmati Rice');
        } else if (foodPref.includes('italian')) {
          recommendations.push('Whole Wheat Pasta', 'Tomatoes', 'Olive Oil');
        } else if (foodPref.includes('chinese')) {
          recommendations.push('Bok Choy', 'Brown Rice', 'Shiitake Mushrooms');
        } else if (foodPref.includes('mexican')) {
          recommendations.push('Black Beans', 'Avocado', 'Bell Peppers');
        }
      }

      // Return unique recommendations
      return [...new Set(recommendations)].slice(0, 5);
    } catch (error) {
      console.error('Error getting food recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

}

// Create a singleton instance
export const userMLService = new UserMLService();

// Export functions for easy access
export const trackFoodSearch = (query: string, selectedItems: any[]) =>
  userMLService.trackFoodSearch(query, selectedItems);

export const trackRecipeSearch = (query: string, selectedRecipes: any[]) =>
  userMLService.trackRecipeSearch(query, selectedRecipes);

export const trackHealthBoxInteraction = (boxType: string, action: string) =>
  userMLService.trackHealthBoxInteraction(boxType, action);

export const trackPreferenceChange = (preference: string, value: any) =>
  userMLService.trackPreferenceChange(preference, value);

export const getFoodRecommendations = () =>
  userMLService.getFoodRecommendations();

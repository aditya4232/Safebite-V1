// src/services/foodTrackerService.ts
import { FoodItem } from './foodApiService';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { app } from "../firebase";

// Interface for tracked food with additional metadata
export interface TrackedFood extends FoodItem {
  dateAdded: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  notes?: string;
  aiAnalysis?: string;
}

// Interface for a day's food log
export interface DayFoodLog {
  date: string; // ISO date string
  breakfast: TrackedFood[];
  lunch: TrackedFood[];
  dinner: TrackedFood[];
  snack: TrackedFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Add a food item to the user's tracker
export const addFoodToTracker = async (
  food: FoodItem,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  quantity: number = 1,
  notes: string = '',
  aiAnalysis: string = ''
): Promise<boolean> => {
  try {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;

    if (!user) {
      console.error('No user logged in');
      return false;
    }

    // Create tracked food object
    const trackedFood: TrackedFood = {
      ...food,
      dateAdded: new Date(),
      mealType,
      quantity,
      notes,
      aiAnalysis,
      tracked: true
    };

    // Get today's date as ISO string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Reference to user's food tracker document
    const userRef = doc(db, "users", user.uid);
    const trackerRef = doc(db, "users", user.uid, "foodTracker", today);

    // Get current tracker data for today if it exists
    const trackerSnap = await getDoc(trackerRef);

    if (trackerSnap.exists()) {
      // Update existing tracker
      const trackerData = trackerSnap.data() as DayFoodLog;

      // Add food to the appropriate meal array
      const updatedMealArray = [...trackerData[mealType], trackedFood];

      // Calculate new totals
      const newTotalCalories = trackerData.totalCalories + (food.calories * quantity);
      const newTotalProtein = trackerData.totalProtein + ((food.nutrients?.protein || 0) * quantity);
      const newTotalCarbs = trackerData.totalCarbs + ((food.nutrients?.carbs || 0) * quantity);
      const newTotalFat = trackerData.totalFat + ((food.nutrients?.fat || 0) * quantity);

      // Update the tracker document
      await setDoc(trackerRef, {
        [mealType]: updatedMealArray,
        totalCalories: newTotalCalories,
        totalProtein: newTotalProtein,
        totalCarbs: newTotalCarbs,
        totalFat: newTotalFat,
        lastUpdated: Timestamp.now()
      }, { merge: true });
    } else {
      // Create new tracker for today
      const newTracker: DayFoodLog = {
        date: today,
        breakfast: mealType === 'breakfast' ? [trackedFood] : [],
        lunch: mealType === 'lunch' ? [trackedFood] : [],
        dinner: mealType === 'dinner' ? [trackedFood] : [],
        snack: mealType === 'snack' ? [trackedFood] : [],
        totalCalories: food.calories * quantity,
        totalProtein: (food.nutrients?.protein || 0) * quantity,
        totalCarbs: (food.nutrients?.carbs || 0) * quantity,
        totalFat: (food.nutrients?.fat || 0) * quantity
      };

      // Save the new tracker
      await setDoc(trackerRef, {
        ...newTracker,
        created: Timestamp.now(),
        lastUpdated: Timestamp.now()
      });
    }

    // Add to recent foods list
    await setDoc(userRef, {
      recentFoods: arrayUnion({
        id: food.id,
        name: food.name,
        calories: food.calories,
        nutritionScore: food.nutritionScore,
        dateAdded: Timestamp.now()
      })
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error adding food to tracker:', error);
    return false;
  }
};

// Get the user's food log for a specific day
export const getFoodLogForDay = async (date: string = new Date().toISOString().split('T')[0]): Promise<DayFoodLog | null> => {
  try {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;

    if (!user) {
      console.error('No user logged in');
      return null;
    }

    // Reference to the day's food tracker document
    const trackerRef = doc(db, "users", user.uid, "foodTracker", date);
    const trackerSnap = await getDoc(trackerRef);

    if (trackerSnap.exists()) {
      return trackerSnap.data() as DayFoodLog;
    } else {
      // Return empty food log if none exists
      return {
        date,
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      };
    }
  } catch (error) {
    console.error('Error getting food log:', error);
    return null;
  }
};

// Get the user's recent foods
export const getRecentFoods = async (limit: number = 5): Promise<FoodItem[]> => {
  try {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;

    if (!user) {
      console.error('No user logged in');
      return [];
    }

    // Reference to user document
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().recentFoods) {
      // Get recent foods and sort by date
      const recentFoods = userSnap.data().recentFoods;

      // Sort by date (newest first) and limit
      return recentFoods
        .sort((a: any, b: any) => b.dateAdded.seconds - a.dateAdded.seconds)
        .slice(0, limit);
    }

    return [];
  } catch (error) {
    console.error('Error getting recent foods:', error);
    return [];
  }
};

// Remove a food from the tracker
export const removeFoodFromTracker = async (
  foodId: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  date: string = new Date().toISOString().split('T')[0]
): Promise<boolean> => {
  try {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;

    if (!user) {
      console.error('No user logged in');
      return false;
    }

    // Reference to the day's food tracker document
    const trackerRef = doc(db, "users", user.uid, "foodTracker", date);
    const trackerSnap = await getDoc(trackerRef);

    if (trackerSnap.exists()) {
      const trackerData = trackerSnap.data() as DayFoodLog;

      // Find the food in the meal array
      const mealArray = trackerData[mealType];
      const foodIndex = mealArray.findIndex(food => food.id === foodId);

      if (foodIndex !== -1) {
        // Get the food to calculate nutrition adjustments
        const food = mealArray[foodIndex];

        // Remove the food from the array
        const updatedMealArray = [
          ...mealArray.slice(0, foodIndex),
          ...mealArray.slice(foodIndex + 1)
        ];

        // Calculate new totals
        const newTotalCalories = trackerData.totalCalories - (food.calories * food.quantity);
        const newTotalProtein = trackerData.totalProtein - ((food.nutrients?.protein || 0) * food.quantity);
        const newTotalCarbs = trackerData.totalCarbs - ((food.nutrients?.carbs || 0) * food.quantity);
        const newTotalFat = trackerData.totalFat - ((food.nutrients?.fat || 0) * food.quantity);

        // Update the tracker document
        await setDoc(trackerRef, {
          [mealType]: updatedMealArray,
          totalCalories: Math.max(0, newTotalCalories),
          totalProtein: Math.max(0, newTotalProtein),
          totalCarbs: Math.max(0, newTotalCarbs),
          totalFat: Math.max(0, newTotalFat),
          lastUpdated: Timestamp.now()
        }, { merge: true });

        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error removing food from tracker:', error);
    return false;
  }
};

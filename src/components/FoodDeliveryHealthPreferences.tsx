import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Heart, Leaf, Flame, Wheat, Egg, Milk, 
  Fish, Nut, Salad, Utensils, Filter, X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';

export interface HealthPreferences {
  dietaryRestrictions: string[];
  calorieRange: [number, number];
  preferHealthy: boolean;
  excludeIngredients: string[];
  preferredCuisines: string[];
}

interface FoodDeliveryHealthPreferencesProps {
  onPreferencesChange: (preferences: HealthPreferences) => void;
  initialPreferences?: Partial<HealthPreferences>;
  isCollapsible?: boolean;
}

const DEFAULT_PREFERENCES: HealthPreferences = {
  dietaryRestrictions: [],
  calorieRange: [300, 800],
  preferHealthy: true,
  excludeIngredients: [],
  preferredCuisines: []
};

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: <Leaf className="h-4 w-4 text-green-500" /> },
  { id: 'vegan', label: 'Vegan', icon: <Salad className="h-4 w-4 text-green-600" /> },
  { id: 'gluten-free', label: 'Gluten Free', icon: <Wheat className="h-4 w-4 text-amber-600" /> },
  { id: 'dairy-free', label: 'Dairy Free', icon: <Milk className="h-4 w-4 text-blue-400" /> },
  { id: 'nut-free', label: 'Nut Free', icon: <Nut className="h-4 w-4 text-amber-800" /> },
  { id: 'low-carb', label: 'Low Carb', icon: <Flame className="h-4 w-4 text-orange-500" /> }
];

const CUISINE_OPTIONS = [
  'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 
  'Japanese', 'Mediterranean', 'American', 'Korean', 'Lebanese'
];

const FoodDeliveryHealthPreferences: React.FC<FoodDeliveryHealthPreferencesProps> = ({
  onPreferencesChange,
  initialPreferences,
  isCollapsible = true
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isCollapsed, setIsCollapsed] = useState(isCollapsible);
  const [preferences, setPreferences] = useState<HealthPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences
  });
  const [excludeInput, setExcludeInput] = useState('');
  
  // Load user preferences from Firebase
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const auth = getAuth(app);
        
        if (isGuest || !auth.currentUser) {
          return;
        }
        
        const db = getFirestore(app);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.healthPreferences) {
            const loadedPreferences = {
              ...DEFAULT_PREFERENCES,
              ...userData.healthPreferences
            };
            
            setPreferences(loadedPreferences);
            onPreferencesChange(loadedPreferences);
          }
        }
      } catch (error) {
        console.error('Error loading health preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [isGuest, onPreferencesChange]);
  
  // Save preferences to Firebase
  const savePreferences = async () => {
    try {
      const auth = getAuth(app);
      
      if (isGuest || !auth.currentUser) {
        toast({
          title: 'Guest Mode',
          description: 'Preferences are temporary in guest mode. Sign in to save them permanently.',
          variant: 'default',
        });
        return;
      }
      
      const db = getFirestore(app);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      await setDoc(userRef, {
        healthPreferences: preferences
      }, { merge: true });
      
      toast({
        title: 'Preferences Saved',
        description: 'Your health preferences have been saved.',
        variant: 'default',
      });
      
      // Track this interaction
      trackUserInteraction('save_health_preferences', {
        dietaryRestrictions: preferences.dietaryRestrictions,
        preferHealthy: preferences.preferHealthy
      });
    } catch (error) {
      console.error('Error saving health preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle dietary restriction changes
  const handleDietaryChange = (id: string, checked: boolean) => {
    setPreferences(prev => {
      const newRestrictions = checked
        ? [...prev.dietaryRestrictions, id]
        : prev.dietaryRestrictions.filter(r => r !== id);
      
      const newPreferences = {
        ...prev,
        dietaryRestrictions: newRestrictions
      };
      
      onPreferencesChange(newPreferences);
      return newPreferences;
    });
  };
  
  // Handle calorie range changes
  const handleCalorieChange = (value: number[]) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        calorieRange: [value[0], value[1]] as [number, number]
      };
      
      onPreferencesChange(newPreferences);
      return newPreferences;
    });
  };
  
  // Handle healthy preference change
  const handleHealthyChange = (checked: boolean) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        preferHealthy: checked
      };
      
      onPreferencesChange(newPreferences);
      return newPreferences;
    });
  };
  
  // Handle excluded ingredients
  const handleAddExcludedIngredient = () => {
    if (!excludeInput.trim()) return;
    
    setPreferences(prev => {
      const ingredient = excludeInput.trim().toLowerCase();
      
      if (prev.excludeIngredients.includes(ingredient)) {
        setExcludeInput('');
        return prev;
      }
      
      const newPreferences = {
        ...prev,
        excludeIngredients: [...prev.excludeIngredients, ingredient]
      };
      
      onPreferencesChange(newPreferences);
      setExcludeInput('');
      return newPreferences;
    });
  };
  
  const handleRemoveExcludedIngredient = (ingredient: string) => {
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        excludeIngredients: prev.excludeIngredients.filter(i => i !== ingredient)
      };
      
      onPreferencesChange(newPreferences);
      return newPreferences;
    });
  };
  
  // Handle cuisine preferences
  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setPreferences(prev => {
      const newCuisines = checked
        ? [...prev.preferredCuisines, cuisine]
        : prev.preferredCuisines.filter(c => c !== cuisine);
      
      const newPreferences = {
        ...prev,
        preferredCuisines: newCuisines
      };
      
      onPreferencesChange(newPreferences);
      return newPreferences;
    });
  };
  
  // Reset all preferences
  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    onPreferencesChange(DEFAULT_PREFERENCES);
    setExcludeInput('');
    
    toast({
      title: 'Preferences Reset',
      description: 'Health preferences have been reset to default.',
      variant: 'default',
    });
  };
  
  return (
    <Card className="sci-fi-card border-safebite-teal/30">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          Health Preferences
        </CardTitle>
        
        {isCollapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <Filter className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? 'Expand' : 'Collapse'}
            </span>
          </Button>
        )}
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="pt-2">
          {/* Dietary Restrictions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-safebite-text mb-2 flex items-center">
              <Utensils className="h-4 w-4 mr-1 text-safebite-teal" />
              Dietary Restrictions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIETARY_OPTIONS.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diet-${option.id}`}
                    checked={preferences.dietaryRestrictions.includes(option.id)}
                    onCheckedChange={(checked) => 
                      handleDietaryChange(option.id, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`diet-${option.id}`}
                    className="text-sm text-safebite-text-secondary flex items-center cursor-pointer"
                  >
                    {option.icon}
                    <span className="ml-1">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Calorie Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-safebite-text mb-2 flex items-center">
              <Flame className="h-4 w-4 mr-1 text-orange-500" />
              Calorie Range (per meal)
            </h3>
            <div className="px-2">
              <Slider
                defaultValue={preferences.calorieRange}
                min={100}
                max={1500}
                step={50}
                onValueChange={handleCalorieChange}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-safebite-text-secondary">
                <span>{preferences.calorieRange[0]} cal</span>
                <span>{preferences.calorieRange[1]} cal</span>
              </div>
            </div>
          </div>
          
          {/* Prefer Healthy */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prefer-healthy"
                checked={preferences.preferHealthy}
                onCheckedChange={(checked) => 
                  handleHealthyChange(checked as boolean)
                }
              />
              <label
                htmlFor="prefer-healthy"
                className="text-sm font-medium text-safebite-text flex items-center cursor-pointer"
              >
                <Leaf className="h-4 w-4 mr-1 text-green-500" />
                Prefer Healthier Options
              </label>
            </div>
          </div>
          
          {/* Excluded Ingredients */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-safebite-text mb-2">
              Exclude Ingredients
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                placeholder="e.g., mushrooms"
                className="flex-1 bg-safebite-card-bg-alt/50 border border-safebite-card-bg-alt rounded-md px-3 py-1 text-sm text-safebite-text focus:outline-none focus:ring-1 focus:ring-safebite-teal focus:border-safebite-teal"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExcludedIngredient();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddExcludedIngredient}
                className="border-safebite-teal/50 text-safebite-teal"
              >
                Add
              </Button>
            </div>
            
            {preferences.excludeIngredients.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {preferences.excludeIngredients.map(ingredient => (
                  <Badge
                    key={ingredient}
                    variant="outline"
                    className="bg-red-500/10 text-red-400 border-red-500/30 flex items-center"
                  >
                    {ingredient}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleRemoveExcludedIngredient(ingredient)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Preferred Cuisines */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-safebite-text mb-2">
              Preferred Cuisines
            </h3>
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.map(cuisine => {
                const isSelected = preferences.preferredCuisines.includes(cuisine);
                
                return (
                  <Badge
                    key={cuisine}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer ${
                      isSelected
                        ? 'bg-safebite-teal text-safebite-dark-blue'
                        : 'bg-transparent text-safebite-text-secondary hover:bg-safebite-teal/10'
                    }`}
                    onClick={() => handleCuisineChange(cuisine, !isSelected)}
                  >
                    {cuisine}
                  </Badge>
                );
              })}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Reset
            </Button>
            
            <Button
              size="sm"
              onClick={savePreferences}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            >
              Save Preferences
            </Button>
          </div>
        </CardContent>
      )}
      
      {isCollapsed && (
        <CardContent className="pt-2">
          <div className="flex flex-wrap gap-1">
            {preferences.dietaryRestrictions.map(restriction => {
              const option = DIETARY_OPTIONS.find(o => o.id === restriction);
              
              return (
                <Badge key={restriction} variant="outline" className="bg-safebite-card-bg-alt/50">
                  {option?.icon}
                  <span className="ml-1">{option?.label || restriction}</span>
                </Badge>
              );
            })}
            
            {preferences.preferHealthy && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                <Leaf className="h-3 w-3 mr-1" />
                Healthier Options
              </Badge>
            )}
            
            {preferences.preferredCuisines.length > 0 && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                <Utensils className="h-3 w-3 mr-1" />
                {preferences.preferredCuisines.length} Cuisines
              </Badge>
            )}
            
            {preferences.excludeIngredients.length > 0 && (
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                <X className="h-3 w-3 mr-1" />
                {preferences.excludeIngredients.length} Excluded
              </Badge>
            )}
            
            {preferences.dietaryRestrictions.length === 0 && 
             !preferences.preferHealthy &&
             preferences.preferredCuisines.length === 0 &&
             preferences.excludeIngredients.length === 0 && (
              <span className="text-xs text-safebite-text-secondary">
                No preferences set. Click to customize.
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FoodDeliveryHealthPreferences;

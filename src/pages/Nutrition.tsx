import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import DashboardSidebar from '@/components/DashboardSidebar';
import Loader from '@/components/Loader';
import FoodItemCard from '@/components/FoodItemCard';
import FoodDetailView from '@/components/FoodDetailView';
import FoodScannerUpload from '@/components/FoodScannerUpload';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/foodApiService';
import { searchCalorieNinjas } from '@/services/nutritionApiService';
import { searchRecipes } from '@/utils/calorieNinjasApi';
import groceryProductService from '@/services/groceryProductService';
import mongoDbService from '@/services/mongoDbService';
import FoodChatBot from '@/components/FoodChatBot';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import {
  Search, Upload, Camera, Utensils, Pizza,
  Clock, Users, ChefHat, ExternalLink, AlertCircle, X,
  Coffee, Zap, Check, Flame, Leaf, AlertTriangle
} from 'lucide-react';

// Types
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  nutritionScore: 'green' | 'yellow' | 'red';
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  source: string;
  image?: string;
  details?: any;
}

interface Recipe {
  title: string;
  ingredients: string;
  servings: string;
  instructions: string;
}

const Nutrition = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isGuest } = useGuestMode();

  const [activeTab, setActiveTab] = useState('food');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foodResults, setFoodResults] = useState<FoodItem[]>([]);
  const [recipeResults, setRecipeResults] = useState<Recipe[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const [showScannerUpload, setShowScannerUpload] = useState(false);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    // Load search history from localStorage if not in guest mode
    if (!isGuest) {
      const savedHistory = localStorage.getItem('foodSearchHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    }
    return [];
  });

  // User data for personalized chat suggestions
  const [userData, setUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Load user data for personalized chat
  useEffect(() => {
    const loadUserData = async () => {
      if (!isGuest && auth.currentUser) {
        try {
          // Get user profile data
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }

          // Get user activity data
          const activityRef = doc(db, 'user_activities', auth.currentUser.uid);
          const activityDoc = await getDoc(activityRef);

          if (activityDoc.exists()) {
            const data = activityDoc.data();
            setUserActivity(data.activities || []);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [isGuest, auth.currentUser, db]);

  // Handle food search
  const handleFoodSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a food item to search",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSelectedFood(null);
    setShowNoResults(false);

    try {
      // Track this interaction
      trackUserInteraction('search', { query: searchQuery });

      // First try MongoDB search using our Flask backend
      const mongoResults = await mongoDbService.searchProducts(searchQuery);

      // If MongoDB search returns results, use them
      if (mongoResults.success && mongoResults.products && mongoResults.products.length > 0) {
        // Process MongoDB results
        const processedResults = mongoResults.products.map(item => {
          // Calculate nutrition score based on nutrient values
          let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

          // Get nutritional info (adapt to your MongoDB schema)
          const nutritionalInfo = item.nutritionalInfo || {};

          // Determine score based on protein, fiber, sugar content
          const protein = nutritionalInfo.protein || 0;
          const fiber = nutritionalInfo.fiber || 0;
          const sugar = nutritionalInfo.sugar || 0;
          const fat = nutritionalInfo.fat || 0;

          if (protein > 15 && fiber > 3 && sugar < 10) {
            nutritionScore = 'green';
          } else if (fat > 20 || sugar > 15) {
            nutritionScore = 'red';
          }

          // Generate a placeholder image if none exists
          const imageUrl = item.imageUrl || `https://source.unsplash.com/featured/?${encodeURIComponent(item.name)},food`;

          return {
            id: item._id || `mongo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            calories: nutritionalInfo.calories || 0,
            nutritionScore,
            nutrients: {
              protein: nutritionalInfo.protein || 0,
              carbs: nutritionalInfo.carbs || 0,
              fat: nutritionalInfo.fat || 0,
              fiber: nutritionalInfo.fiber || 0,
              sugar: nutritionalInfo.sugar || 0,
              sodium: nutritionalInfo.sodium || 0
            },
            source: 'MongoDB',
            image: imageUrl,
            details: {
              protein: nutritionalInfo.protein || 0,
              carbs: nutritionalInfo.carbs || 0,
              fat: nutritionalInfo.fat || 0,
              sodium: nutritionalInfo.sodium || 0,
              sugar: nutritionalInfo.sugar || 0,
              calories: nutritionalInfo.calories || 0,
              ingredients: item.ingredients || [],
              allergens: item.allergens || [],
              additives: item.additives || [],
              servingSize: item.servingSize || '100g',
              nutritionScore,
              brand: item.brand,
              category: item.category
            }
          };
        });

        setFoodResults(processedResults);
        setShowNoResults(false);

        // Save to search history
        const newHistory = [...searchHistory];
        if (!newHistory.includes(searchQuery)) {
          newHistory.unshift(searchQuery);
          if (newHistory.length > 5) newHistory.pop();
          setSearchHistory(newHistory);

          // Save to localStorage if not in guest mode
          if (!isGuest) {
            localStorage.setItem('foodSearchHistory', JSON.stringify(newHistory));
          }
        }

        toast({
          title: "Search Complete",
          description: `Found ${processedResults.length} results from MongoDB for "${searchQuery}"`,
        });
        return;
      }

      // Fallback to CalorieNinjas API if MongoDB search returns no results
      const results = await searchCalorieNinjas(searchQuery);

      if (results && results.length > 0) {
        // Process the results to calculate nutrition scores
        const processedResults = results.map(item => {
          // Calculate nutrition score based on nutrient values
          let nutritionScore: 'green' | 'yellow' | 'red' = 'yellow';

          // Ensure nutrients object exists and has expected properties
          const nutrients = item.nutrients || {};

          // Determine score based on protein, fiber, sugar content
          const protein = nutrients.protein || 0;
          const fiber = nutrients.fiber || 0;
          const sugar = nutrients.sugar || 0;
          const fat = nutrients.fat || 0;

          if (protein > 15 && fiber > 3 && sugar < 10) {
            nutritionScore = 'green';
          } else if (fat > 20 || sugar > 15) {
            nutritionScore = 'red';
          }

          // Generate a placeholder image based on the food name
          const imageUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(item.name)},food`;

          return {
            id: item.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            calories: item.calories,
            nutritionScore,
            nutrients: {
              protein: nutrients.protein || 0,
              carbs: nutrients.carbs || 0,
              fat: nutrients.fat || 0,
              fiber: nutrients.fiber || 0,
              sugar: nutrients.sugar || 0,
              sodium: nutrients.sodium || 0
            },
            source: 'CalorieNinjas',
            image: imageUrl,
            details: {
              protein: nutrients.protein || 0,
              carbs: nutrients.carbs || 0,
              fat: nutrients.fat || 0,
              sodium: nutrients.sodium || 0,
              sugar: nutrients.sugar || 0,
              calories: item.calories,
              ingredients: [],
              allergens: [],
              additives: [],
              servingSize: item.serving_size || '100g',
              nutritionScore
            }
          };
        });

        // Save to search history
        const newHistory = [...searchHistory];
        if (!newHistory.includes(searchQuery)) {
          newHistory.unshift(searchQuery);
          if (newHistory.length > 5) newHistory.pop();
          setSearchHistory(newHistory);

          // Save to localStorage if not in guest mode
          if (!isGuest) {
            localStorage.setItem('foodSearchHistory', JSON.stringify(newHistory));
          }
        }

        setFoodResults(processedResults);
        setShowNoResults(false);

        toast({
          title: "Search Complete",
          description: `Found ${results.length} results for "${searchQuery}"`,
        });
      } else {
        setFoodResults([]);
        setShowNoResults(true);

        toast({
          title: "No Results",
          description: `No results found for "${searchQuery}". Try a different search term.`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setFoodResults([]);
      setShowNoResults(true);

      toast({
        title: "Search Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle recipe search
  const handleRecipeSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a recipe to search",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setShowNoResults(false);

    try {
      // Track this interaction
      trackUserInteraction('recipe_search', { query: searchQuery });

      // Use mock data for now since the API might be having issues
      const mockRecipes = [
        {
          title: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Pasta`,
          ingredients: "2 cups pasta|1 tbsp olive oil|1 onion, chopped|2 cloves garlic, minced|1 can diced tomatoes|1/2 tsp salt|1/4 tsp black pepper|Fresh basil leaves",
          servings: "4 Servings",
          instructions: "1. Cook pasta according to package directions. 2. Heat oil in a large skillet over medium heat. 3. Add onion and garlic, cook until softened. 4. Add tomatoes, salt, and pepper. Simmer for 10 minutes. 5. Drain pasta and toss with sauce. 6. Garnish with fresh basil."
        },
        {
          title: `Healthy ${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Bowl`,
          ingredients: "1 cup quinoa|2 cups vegetable broth|1 cup chickpeas, drained and rinsed|1 avocado, sliced|1 cup cherry tomatoes, halved|1/4 cup red onion, diced|2 tbsp lemon juice|2 tbsp olive oil|Salt and pepper to taste",
          servings: "2 Servings",
          instructions: "1. Rinse quinoa under cold water. 2. In a medium saucepan, bring vegetable broth to a boil. 3. Add quinoa, reduce heat, cover and simmer for 15 minutes. 4. Fluff with a fork and let cool slightly. 5. In a large bowl, combine quinoa, chickpeas, avocado, tomatoes, and red onion. 6. Whisk together lemon juice, olive oil, salt, and pepper. 7. Pour dressing over quinoa mixture and toss to combine."
        },
        {
          title: `${searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)} Stir Fry`,
          ingredients: "2 tbsp vegetable oil|1 lb chicken breast, cut into strips|2 cups mixed vegetables (bell peppers, broccoli, carrots)|3 cloves garlic, minced|1 tbsp ginger, grated|3 tbsp soy sauce|1 tbsp honey|1 tsp sesame oil|2 green onions, sliced|Sesame seeds for garnish",
          servings: "3 Servings",
          instructions: "1. Heat oil in a large wok or skillet over high heat. 2. Add chicken and cook until no longer pink, about 5-6 minutes. 3. Add vegetables, garlic, and ginger. Stir-fry for 3-4 minutes until vegetables are crisp-tender. 4. In a small bowl, whisk together soy sauce, honey, and sesame oil. 5. Pour sauce over chicken and vegetables. Cook for 1-2 minutes until sauce thickens slightly. 6. Garnish with green onions and sesame seeds."
        }
      ];

      // Try to get real recipes first
      try {
        const result = await searchRecipes(searchQuery);
        if (result && Array.isArray(result) && result.length > 0) {
          setRecipeResults(result);
          setShowNoResults(false);

          toast({
            title: "Recipe Search Complete",
            description: `Found ${result.length} recipes for "${searchQuery}"`,
          });
          return;
        }
      } catch (apiError) {
        console.error('API recipe search error:', apiError);
        // Continue with mock data if API fails
      }

      // Use mock data as fallback
      setRecipeResults(mockRecipes);
      setShowNoResults(false);

      toast({
        title: "Recipe Search Complete",
        description: `Found ${mockRecipes.length} recipes for "${searchQuery}"`,
      });
    } catch (error) {
      console.error('Recipe search error:', error);
      setRecipeResults([]);
      setShowNoResults(true);

      toast({
        title: "Recipe Search Error",
        description: "There was a problem with your recipe search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search based on active tab
  const handleSearch = () => {
    if (activeTab === 'food') {
      handleFoodSearch();
    } else if (activeTab === 'recipes') {
      handleRecipeSearch();
    }
  };

  // Handle food selection
  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    // Track this interaction
    trackUserInteraction('view_food_details', { foodId: food.id, foodName: food.name });
  };

  // Handle recipe selection
  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetails(true);
    // Track this interaction
    trackUserInteraction('view_recipe_details', { recipeName: recipe.title });
  };

  // Handle opening the scanner/upload modal
  const handleOpenScannerUpload = () => {
    setShowScannerUpload(true);
  };

  // Handle barcode scanning
  const handleScan = async (imageData: string) => {
    setIsLoading(true);
    setSelectedFood(null);
    setShowScannerUpload(false);

    toast({
      title: "Processing Image",
      description: "Analyzing the scanned image...",
    });

    try {
      // Track this interaction
      trackUserInteraction('scan_barcode', {});

      // Here you would implement barcode scanning logic
      // For now, we'll just show a toast
      setTimeout(() => {
        toast({
          title: "Scan Complete",
          description: "This feature is coming soon!",
        });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Error",
        description: "There was a problem scanning the barcode. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setSelectedFood(null);
    setShowScannerUpload(false);

    toast({
      title: "Processing Image",
      description: "Analyzing the uploaded image...",
    });

    try {
      // Track this interaction
      trackUserInteraction('upload_image', { fileName: file.name });

      // Here you would implement image analysis logic
      // For now, we'll just show a toast
      setTimeout(() => {
        toast({
          title: "Upload Complete",
          description: "This feature is coming soon!",
        });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "There was a problem analyzing the image. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Render food results
  const renderFoodResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" />
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-safebite-text mb-2">No Results Found</h3>
          <p className="text-safebite-text-secondary mb-4">
            We couldn't find any food matching "{searchQuery}"
          </p>
          <Button
            variant="outline"
            className="sci-fi-button"
            onClick={() => setShowNoResults(false)}
          >
            Try a Different Search
          </Button>
        </div>
      );
    }

    if (foodResults.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {foodResults.map(food => (
            <FoodItemCard
              key={food.id}
              name={food.name}
              calories={food.calories}
              nutritionScore={food.nutritionScore}
              nutrients={food.nutrients}
              image={food.image}
              onClick={() => handleFoodSelect(food)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <Utensils className="h-16 w-16 text-safebite-teal mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-safebite-text mb-2">Search for Food</h3>
        <p className="text-safebite-text-secondary mb-4">
          Enter a food item to get detailed nutrition information
        </p>
      </div>
    );
  };

  // Render recipe results
  const renderRecipeResults = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" />
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="text-center py-12">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse opacity-75"></div>
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4 relative z-10" />
          </div>
          <h3 className="text-xl font-semibold text-safebite-text mb-2">No Recipes Found</h3>
          <p className="text-safebite-text-secondary mb-6 max-w-md mx-auto">
            We couldn't find any recipes matching "{searchQuery}". Try a different search term or check out these suggestions.
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-safebite-text-secondary mb-6">
            <Badge
              className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
              onClick={() => {
                setSearchQuery('pasta');
                handleRecipeSearch();
              }}
            >
              Try "pasta"
            </Badge>
            <Badge
              className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
              onClick={() => {
                setSearchQuery('curry');
                handleRecipeSearch();
              }}
            >
              Try "curry"
            </Badge>
            <Badge
              className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
              onClick={() => {
                setSearchQuery('chicken');
                handleRecipeSearch();
              }}
            >
              Try "chicken"
            </Badge>
            <Badge
              className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
              onClick={() => {
                setSearchQuery('vegetarian');
                handleRecipeSearch();
              }}
            >
              Try "vegetarian"
            </Badge>
          </div>
          <Button
            variant="outline"
            className="sci-fi-button bg-safebite-teal/10 hover:bg-safebite-teal/20"
            onClick={() => setShowNoResults(false)}
          >
            Try a Different Search
          </Button>
        </div>
      );
    }

    if (recipeResults.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {recipeResults.map((recipe, index) => {
            // Extract first 3 ingredients for preview
            const ingredientsList = recipe.ingredients.split('|');
            const previewIngredients = ingredientsList.slice(0, 3);
            const remainingCount = ingredientsList.length - 3;

            // Format instructions for preview
            const instructionPreview = recipe.instructions.split('.').slice(0, 2).join('.') + '...';

            return (
              <Card key={index} className="sci-fi-card overflow-hidden border-2 border-safebite-teal/30 hover:border-safebite-teal/70 hover:shadow-lg transition-all duration-300 bg-safebite-card-bg/90">
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                      <ChefHat className="h-5 w-5 text-safebite-teal" />
                    </div>
                    <h3 className="text-xl font-bold text-safebite-text truncate">{recipe.title}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal">
                      <Users className="h-3 w-3 mr-1" />
                      {recipe.servings}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-500 border-purple-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 30) + 15} mins
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-safebite-text mb-2 flex items-center">
                      <span className="inline-block w-1 h-4 bg-safebite-teal mr-2 flex-shrink-0"></span>
                      Ingredients
                    </h4>
                    <ul className="text-safebite-text-secondary text-sm space-y-1">
                      {previewIngredients.map((ingredient, i) => (
                        <li key={i} className="flex items-start">
                          <span className="inline-block h-2 w-2 rounded-full bg-safebite-teal mt-1.5 mr-2 flex-shrink-0"></span>
                          <span className="truncate">{ingredient.trim()}</span>
                        </li>
                      ))}
                      {remainingCount > 0 && (
                        <li className="text-xs text-safebite-text-secondary italic mt-1">
                          +{remainingCount} more ingredients
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-safebite-text mb-2 flex items-center">
                      <span className="inline-block w-1 h-4 bg-purple-500 mr-2 flex-shrink-0"></span>
                      Instructions
                    </h4>
                    <p className="text-safebite-text-secondary text-sm line-clamp-2">
                      {instructionPreview}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      className="sci-fi-button bg-safebite-teal hover:bg-safebite-teal/80 text-safebite-dark-blue font-medium"
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-safebite-teal/10 animate-ping opacity-75"></div>
          <Pizza className="h-16 w-16 text-safebite-teal mx-auto mb-4 relative z-10" />
        </div>
        <h3 className="text-xl font-semibold text-safebite-text mb-2">Discover Delicious Recipes</h3>
        <p className="text-safebite-text-secondary mb-6 max-w-md mx-auto">
          Enter a dish name, ingredient, or cuisine type to find amazing recipes tailored to your search
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-xs text-safebite-text-secondary mb-4">
          <Badge
            className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
            onClick={() => {
              setSearchQuery('pasta');
              setActiveTab('recipes');
              handleRecipeSearch();
            }}
          >
            Try "pasta"
          </Badge>
          <Badge
            className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
            onClick={() => {
              setSearchQuery('curry');
              setActiveTab('recipes');
              handleRecipeSearch();
            }}
          >
            Try "curry"
          </Badge>
          <Badge
            className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
            onClick={() => {
              setSearchQuery('chicken');
              setActiveTab('recipes');
              handleRecipeSearch();
            }}
          >
            Try "chicken"
          </Badge>
          <Badge
            className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
            onClick={() => {
              setSearchQuery('vegetarian');
              setActiveTab('recipes');
              handleRecipeSearch();
            }}
          >
            Try "vegetarian"
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />

      {/* Scanner/Upload Modal */}
      {showScannerUpload && (
        <FoodScannerUpload
          onScan={handleScan}
          onUpload={handleImageUpload}
          onClose={() => setShowScannerUpload(false)}
        />
      )}

      {/* Recipe Details Dialog */}
      <Dialog open={showRecipeDetails} onOpenChange={setShowRecipeDetails}>
        {selectedRecipe && (
          <DialogContent className="max-w-4xl bg-safebite-card-bg border-safebite-teal/30">
            <DialogHeader>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-4">
                  <ChefHat className="h-6 w-6 text-safebite-teal" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-safebite-text">
                    {selectedRecipe.title}
                  </DialogTitle>
                  <DialogDescription className="text-safebite-text-secondary flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedRecipe.servings}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-500 border-purple-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(Math.random() * 30) + 15} mins
                    </Badge>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-safebite-teal/30 to-transparent my-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              <div className="bg-safebite-card-bg-alt p-5 rounded-lg border border-safebite-teal/20">
                <h3 className="text-lg font-semibold text-safebite-text mb-4 flex items-center">
                  <span className="inline-block w-1 h-5 bg-safebite-teal mr-2"></span>
                  Ingredients
                </h3>
                <ul className="space-y-3 text-safebite-text-secondary">
                  {selectedRecipe.ingredients.split('|').map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-safebite-teal/20 text-safebite-teal text-xs font-medium mr-3">
                        {index + 1}
                      </span>
                      {ingredient.trim()}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-safebite-card-bg-alt p-5 rounded-lg border border-purple-500/20">
                <h3 className="text-lg font-semibold text-safebite-text mb-4 flex items-center">
                  <span className="inline-block w-1 h-5 bg-purple-500 mr-2"></span>
                  Instructions
                </h3>
                <div className="text-safebite-text-secondary">
                  {selectedRecipe.instructions.split('.').filter(step => step.trim()).map((step, index) => (
                    <div key={index} className="mb-4 flex items-start">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-500 text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <p>{step.trim()}.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div className="text-safebite-text-secondary text-sm">
                <p className="italic">Recipe generated based on your search query.</p>
              </div>
              <Button
                variant="outline"
                className="sci-fi-button bg-safebite-teal/10 hover:bg-safebite-teal/20"
                onClick={() => setShowRecipeDetails(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <main className="ml-0 md:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-safebite-text mb-2">Nutrition Center</h1>
              <p className="text-safebite-text-secondary">
                Search for food nutrition information and recipes
              </p>
            </div>
          </div>

          <Tabs
            defaultValue="food"
            className="w-full"
            onValueChange={(value) => {
              setActiveTab(value);
              setSearchQuery('');
              setFoodResults([]);
              setRecipeResults([]);
              setSelectedFood(null);
              setShowNoResults(false);
            }}
          >
            <div className="sci-fi-card mb-6">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="grid w-full grid-cols-2 max-w-[70%] border border-safebite-teal/30 p-1 bg-safebite-card-bg-alt/50">
                  <TabsTrigger value="food" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                    <Utensils className="h-4 w-4 mr-2" />
                    Food Nutrition
                  </TabsTrigger>
                  <TabsTrigger value="recipes" className="data-[state=active]:bg-safebite-teal data-[state=active]:text-safebite-dark-blue">
                    <Pizza className="h-4 w-4 mr-2" />
                    Recipes
                  </TabsTrigger>
                </TabsList>
                <Button
                  onClick={() => navigate('/food-delivery')}
                  className="bg-safebite-purple hover:bg-safebite-purple/80 text-white font-medium shadow-md border border-white/10">
                  <span className="mr-2 text-lg">🍔</span> Food Delivery
                </Button>
              </div>

              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-safebite-text-secondary" />
                      <Input
                        placeholder={activeTab === 'food' ? "Search for food (e.g., apple, chicken breast)" : "Search for recipes (e.g., pasta, vegetarian curry)"}
                        className="sci-fi-input pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'food' ? handleFoodSearch() : handleRecipeSearch())}
                      />
                    </div>

                    {/* Search History */}
                    {activeTab === 'food' && searchHistory.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-safebite-text-secondary mb-1">Recent searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((term, index) => (
                            <Badge
                              key={index}
                              className="cursor-pointer bg-safebite-card-bg-alt hover:bg-safebite-teal/20"
                              onClick={() => {
                                setSearchQuery(term);
                                handleFoodSearch();
                              }}
                            >
                              {term}
                              <X className="ml-1 h-3 w-3" onClick={(e) => {
                                e.stopPropagation();
                                const newHistory = searchHistory.filter((_, i) => i !== index);
                                setSearchHistory(newHistory);
                                if (!isGuest) {
                                  localStorage.setItem('foodSearchHistory', JSON.stringify(newHistory));
                                }
                              }} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={activeTab === 'food' ? handleFoodSearch : handleRecipeSearch}
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 font-medium shadow-md border border-white/10"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                  {activeTab === 'food' && (
                    <Button
                      variant="outline"
                      className="sci-fi-button border-safebite-teal/30 hover:bg-safebite-teal/10 shadow-md"
                      onClick={handleOpenScannerUpload}
                    >
                      <Camera className="mr-2 h-5 w-5 text-safebite-teal" />
                      Scan/Upload
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="w-full">
                <TabsContent value="food" className="mt-0">
                  <div className="sci-fi-card">
                    <div className="p-4">
                      <h2 className="text-xl font-semibold text-safebite-text mb-4">
                        {searchQuery ? `Results for "${searchQuery}"` : "Food Nutrition"}
                      </h2>
                      {renderFoodResults()}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="recipes" className="mt-0">
                  <div className="sci-fi-card">
                    <div className="p-4">
                      <h2 className="text-xl font-semibold text-safebite-text mb-4">
                        {searchQuery ? `Recipe Results for "${searchQuery}"` : "Recipe Search"}
                      </h2>
                      {renderRecipeResults()}
                    </div>
                  </div>
                </TabsContent>
              </div>

              {selectedFood && (
                <div className="w-full mt-6">
                  <div className="sci-fi-card">
                    <div className="p-4">
                      <FoodDetailView
                        food={selectedFood}
                        onBack={() => setSelectedFood(null)}
                        onAddToTracker={() => {
                          toast({
                            title: "Added to Tracker",
                            description: `${selectedFood.name} has been added to your food tracker.`,
                          });
                        }}
                        onAddTag={() => {}}
                        onToggleFavorite={() => {}}
                        isFavorite={false}
                        tags={[]}
                        aiAnalysis=""
                        isAnalysisLoading={false}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tabs>

          {/* Recipe Details Dialog */}
          <Dialog open={showRecipeDetails} onOpenChange={setShowRecipeDetails}>
            <DialogContent className="sci-fi-card max-w-4xl">
              {selectedRecipe && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center">
                      <ChefHat className="h-6 w-6 text-safebite-teal mr-3" />
                      {selectedRecipe.title}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="text-lg font-semibold text-safebite-text mb-3 flex items-center">
                        <span className="inline-block w-1 h-5 bg-safebite-teal mr-2 flex-shrink-0"></span>
                        Ingredients
                      </h3>
                      <ul className="space-y-2">
                        {selectedRecipe.ingredients.split('|').map((ingredient, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block h-2 w-2 rounded-full bg-safebite-teal mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>{ingredient.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-safebite-text mb-3 flex items-center">
                        <span className="inline-block w-1 h-5 bg-purple-500 mr-2 flex-shrink-0"></span>
                        Instructions
                      </h3>
                      <div className="space-y-3">
                        {selectedRecipe.instructions.split('.').filter(s => s.trim()).map((step, i) => (
                          <p key={i} className="flex items-start">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-purple-500/20 text-purple-500 text-xs font-medium mr-2 flex-shrink-0">{i+1}</span>
                            <span>{step.trim()}.</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal mr-2">
                        <Users className="h-3 w-3 mr-1" />
                        {selectedRecipe.servings}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-500 border-purple-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(Math.random() * 30) + 15} mins
                      </Badge>
                    </div>
                    <DialogClose asChild>
                      <Button variant="outline" className="sci-fi-button">
                        Close
                      </Button>
                    </DialogClose>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Food Delivery Search Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg z-50 rounded-full h-14 w-14 p-0"
                onClick={() => trackUserInteraction('open_food_delivery', {})}
              >
                <Coffee className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sci-fi-card max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center">
                  <Coffee className="h-6 w-6 text-orange-500 mr-3" />
                  Food Delivery Search
                </DialogTitle>
                <DialogDescription>
                  Search for restaurant meals from Zomato and Swiggy (Coming Soon)
                </DialogDescription>
              </DialogHeader>

              <div className="relative overflow-hidden rounded-lg border border-orange-500/30 p-8 text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10"></div>
                <div className="relative z-10">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-orange-500 mb-2">Coming Soon!</h3>
                  <p className="text-safebite-text-secondary mb-6">
                    We're working on integrating with Zomato and Swiggy to provide nutritional information for restaurant meals.
                  </p>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                      Under Development
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-safebite-text mb-3">Features Coming Soon:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Search for restaurant meals from Zomato and Swiggy</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                    <span>View nutritional information for restaurant meals</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Get health recommendations for restaurant orders</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                    <span>Save favorite restaurant meals</span>
                  </li>
                </ul>
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Chatbot */}
          <FoodChatBot
            currentPage="nutrition"
            userData={{
              profile: userData,
              recentActivity: userActivity
            }}
            autoOpen={true}
          />
        </div>
      </main>
    </div>
  );
};

export default Nutrition;

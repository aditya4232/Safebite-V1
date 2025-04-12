import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import DashboardSidebar from '@/components/DashboardSidebar';
import Loader from '@/components/Loader';
import { Search, Filter, ChefHat, Bookmark, Star, Clock, Users, Flame, Utensils, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getRecipes, Recipe as RecipeType } from '@/services/recipeService';
import { trackRecipeSearch } from '@/services/mlService';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import FoodChatBot from '@/components/FoodChatBot';

// Using the Recipe type from recipeService

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType | null>(null);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // User data for personalized chat suggestions
  const [userData, setUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);

  // Load user data for personalized chat
  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
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
  }, [auth.currentUser, db]);

  // Load initial recipes and user favorites
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load user favorites if logged in
        const user = auth.currentUser;
        if (user) {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists() && userDoc.data().favoriteRecipes) {
              setFavoriteRecipes(userDoc.data().favoriteRecipes);
            }
          } catch (favError) {
            console.error('Error loading favorite recipes:', favError);
          }
        }

        // Get recipes from MongoDB or API
        const recipes = await getRecipes('');
        setRecipes(recipes);

        // If no recipes found, try to get popular recipes
        if (recipes.length === 0) {
          const popularRecipes = await getRecipes('popular');
          setRecipes(popularRecipes);
        }
      } catch (error) {
        console.error('Error loading initial recipes:', error);
        setRecipes([]);
        setError('Unable to load recipes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [auth, db]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Searching for recipes with query:', searchQuery);

      // Get recipes from MongoDB or API
      const results = await getRecipes(searchQuery);

      setRecipes(results);

      // Track the recipe search for ML learning
      trackRecipeSearch(searchQuery, results);

      // Save search to user profile if logged in
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, {
            recipeSearches: {
              recent: searchQuery,
              timestamp: new Date().toISOString(),
              resultCount: results.length
            }
          }, { merge: true });
        } catch (saveError) {
          console.error('Error saving recipe search:', saveError);
        }
      }

      if (results.length > 0) {
        toast({
          title: `Found ${results.length} recipes`,
          description: "Here are your recipe results",
        });
      } else {
        // Try with a more generic search term
        console.log('No results found, trying with a more generic search term');
        const genericTerm = searchQuery.split(' ')[0]; // Use just the first word

        if (genericTerm && genericTerm !== searchQuery) {
          try {
            const genericResults = await getRecipes(genericTerm);

            if (genericResults.length > 0) {
              setRecipes(genericResults);
              toast({
                title: `Found ${genericResults.length} recipes`,
                description: `Showing results for "${genericTerm}" instead`,
              });
              return;
            }
          } catch (genericError) {
            console.error('Error with generic search:', genericError);
          }
        }

        toast({
          title: "No recipes found",
          description: "Try a different search term or check our popular recipes",
          variant: "default"
        });

        // Try to get popular recipes as fallback
        try {
          console.log('Trying popular recipes as fallback');
          const popularRecipes = await getRecipes('popular');
          if (popularRecipes.length > 0) {
            setRecipes(popularRecipes);
            toast({
              title: "Showing popular recipes instead",
              description: "We couldn't find recipes matching your search",
            });
          } else {
            // If all else fails, show error
            setError('No recipes found. Please try a different search term.');
          }
        } catch (fallbackError) {
          console.error('Error getting fallback recipes:', fallbackError);
          setError('Unable to load recipes. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      setRecipes([]);
      setError('Unable to fetch recipes. Please try again later.');

      toast({
        title: "Search Error",
        description: "Unable to fetch recipes. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    setIsLoading(true);
    setError(null);

    try {
      if (tab === 'all') {
        // Get all recipes
        const allRecipes = await getRecipes('popular');
        setRecipes(allRecipes);
      } else if (tab === 'favorites') {
        // Get favorite recipes
        if (favoriteRecipes.length > 0) {
          try {
            // Get recipes by their IDs if possible
            const allRecipes = await getRecipes('popular');
            const favoriteRecipesList = allRecipes.filter(recipe => favoriteRecipes.includes(recipe.id));

            if (favoriteRecipesList.length > 0) {
              setRecipes(favoriteRecipesList);
            } else {
              setRecipes([]);
              setError('Your favorite recipes could not be loaded. Please try again later.');
            }
          } catch (favError) {
            console.error('Error loading favorite recipes:', favError);
            setRecipes([]);
            setError('Your favorite recipes could not be loaded. Please try again later.');
          }
        } else {
          setRecipes([]);
          setError('You have no favorite recipes yet. Click the star icon to add recipes to your favorites.');
        }
      } else if (tab === 'edamam') {
        // Get Edamam recipes
        const edamamRecipes = await getRecipes('popular');
        setRecipes(edamamRecipes.filter(recipe => recipe.source.includes('Edamam')));
      } else if (tab === 'edamam-food') {
        // Get Edamam Food recipes
        const edamamFoodRecipes = await getRecipes('popular');
        setRecipes(edamamFoodRecipes.filter(recipe => recipe.source.includes('Edamam Food')));
      } else {
        // Default to all recipes
        const allRecipes = await getRecipes('popular');
        setRecipes(allRecipes);
      }

      // If no recipes found, show error
      if (recipes.length === 0 && tab !== 'favorites') {
        setError('No recipes found. Please try searching for specific recipes.');
      }
    } catch (error) {
      console.error('Error changing tab:', error);
      setRecipes([]);
      setError('Unable to load recipes. Please try again later.');

      toast({
        title: "Error",
        description: "Unable to load recipes. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle favorite recipe
  const toggleFavorite = async (recipeId: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorite recipes",
        variant: "default"
      });
      return;
    }

    try {
      let updatedFavorites: string[];

      if (favoriteRecipes.includes(recipeId)) {
        // Remove from favorites
        updatedFavorites = favoriteRecipes.filter(id => id !== recipeId);
        toast({
          title: "Removed from favorites",
          description: "Recipe removed from your favorites",
        });
      } else {
        // Add to favorites
        updatedFavorites = [...favoriteRecipes, recipeId];
        toast({
          title: "Added to favorites",
          description: "Recipe added to your favorites",
        });
      }

      // Update state
      setFavoriteRecipes(updatedFavorites);

      // Save to Firebase
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        favoriteRecipes: updatedFavorites
      }, { merge: true });
    } catch (error) {
      console.error('Error toggling favorite recipe:', error);
      toast({
        title: "Error",
        description: "Unable to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveRecipe = (recipeId: string) => {
    // In a real app, this would save to user's account
    toast({
      title: "Recipe saved",
      description: "Recipe added to your favorites",
    });
  };

  // Handle recipe selection for viewing details
  const handleRecipeSelect = (recipe: RecipeType) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetails(true);

    // Track this interaction if needed
    try {
      trackRecipeSearch('view_details', [recipe]);
    } catch (error) {
      console.error('Error tracking recipe view:', error);
    }
  };



  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>

      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Healthy Recipes</h1>
            <p className="text-safebite-text-secondary">
              Discover nutritious and delicious Indian recipes tailored to your health goals
            </p>
          </div>

          <div className="sci-fi-card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-safebite-text-secondary" />
                  <Input
                    placeholder="Search for recipes (e.g., vegetarian curry, low-calorie)"
                    className="sci-fi-input pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button
                onClick={handleSearch}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" className="sci-fi-button">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <div className="sci-fi-card mb-2 p-4">
              <TabsList className="grid grid-cols-3 gap-2">
                <TabsTrigger
                  value="all"
                  onClick={() => handleTabChange('all')}
                  className={activeTab === 'all' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  All Recipes
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  onClick={() => handleTabChange('favorites')}
                  className={activeTab === 'favorites' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <Star className="mr-2 h-4 w-4 text-yellow-400" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger
                  value="edamam"
                  onClick={() => handleTabChange('edamam')}
                  className={activeTab === 'edamam' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  <Utensils className="mr-2 h-4 w-4" />
                  Edamam Recipes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recipes.map(recipe => (
                    <Card key={recipe.id} className="sci-fi-card overflow-hidden hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50">
                      <div className="relative h-48 w-full">
                        <img
                          src={recipe.image || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-safebite-purple text-white">
                          {recipe.source}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-safebite-text mb-2 line-clamp-1">{recipe.title}</h3>
                        <div className="flex items-center mb-2">
                          <Flame className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.calories || 'N/A'} kcal</span>
                          <Clock className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary">{recipe.cookTime || '30'} min</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.healthLabels && recipe.healthLabels.slice(0, 2).map((label, index) => (
                            <Badge key={index} variant="outline" className="bg-safebite-teal/10 text-safebite-teal border-safebite-teal/20">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full sci-fi-button bg-safebite-teal/10 hover:bg-safebite-teal/20"
                          onClick={() => handleRecipeSelect(recipe)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mongodb" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.filter(recipe => recipe.source === 'MongoDB').map(recipe => (
                    <Card key={recipe.id} className="sci-fi-card overflow-hidden">
                      <div className="relative h-48 w-full">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-safebite-purple text-white">
                          {recipe.source}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-safebite-text mb-2">{recipe.title}</h3>
                        <div className="flex items-center mb-2">
                          <Flame className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.calories} kcal</span>
                          <Clock className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.cookTime} min</span>
                          <Users className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary">{recipe.servings} servings</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.healthLabels.map((label, index) => (
                            <Badge key={index} variant="outline" className="bg-safebite-teal/10 text-safebite-teal border-safebite-teal/20">
                              {label}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <Button variant="outline" className="sci-fi-button">
                            View Recipe
                          </Button>
                          <Button
                            variant="outline"
                            className="sci-fi-button"
                            onClick={() => handleSaveRecipe(recipe.id)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="edamam" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.filter(recipe => recipe.source === 'Edamam').map(recipe => (
                    <Card key={recipe.id} className="sci-fi-card overflow-hidden">
                      <div className="relative h-48 w-full">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-safebite-purple text-white">
                          {recipe.source}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-safebite-text mb-2">{recipe.title}</h3>
                        <div className="flex items-center mb-2">
                          <Flame className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.calories} kcal</span>
                          <Clock className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.cookTime} min</span>
                          <Users className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary">{recipe.servings} servings</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.healthLabels.map((label, index) => (
                            <Badge key={index} variant="outline" className="bg-safebite-teal/10 text-safebite-teal border-safebite-teal/20">
                              {label}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <Button variant="outline" className="sci-fi-button">
                            View Recipe
                          </Button>
                          <Button
                            variant="outline"
                            className="sci-fi-button"
                            onClick={() => handleSaveRecipe(recipe.id)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="fatsecret" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.filter(recipe => recipe.source === 'FatSecret').map(recipe => (
                    <Card key={recipe.id} className="sci-fi-card overflow-hidden">
                      <div className="relative h-48 w-full">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-safebite-purple text-white">
                          {recipe.source}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-safebite-text mb-2">{recipe.title}</h3>
                        <div className="flex items-center mb-2">
                          <Flame className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.calories} kcal</span>
                          <Clock className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary mr-3">{recipe.cookTime} min</span>
                          <Users className="h-4 w-4 text-safebite-teal mr-1" />
                          <span className="text-sm text-safebite-text-secondary">{recipe.servings} servings</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.healthLabels.map((label, index) => (
                            <Badge key={index} variant="outline" className="bg-safebite-teal/10 text-safebite-teal border-safebite-teal/20">
                              {label}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <Button variant="outline" className="sci-fi-button">
                            View Recipe
                          </Button>
                          <Button
                            variant="outline"
                            className="sci-fi-button"
                            onClick={() => handleSaveRecipe(recipe.id)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
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
                  <DialogDescription className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedRecipe.servings || '4'} servings
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-500 border-purple-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedRecipe.cookTime || '30'} min
                    </Badge>
                    <Badge className="bg-safebite-card-bg-alt">
                      {selectedRecipe.source}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-safebite-card-bg-alt p-5 rounded-lg border border-safebite-teal/20">
                    <h3 className="text-lg font-semibold text-safebite-text mb-4 flex items-center">
                      <span className="inline-block w-1 h-5 bg-safebite-teal mr-2"></span>
                      Ingredients
                    </h3>
                    {selectedRecipe.ingredients ? (
                      <ul className="space-y-3 text-safebite-text-secondary">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-safebite-teal/20 text-safebite-teal text-xs font-medium mr-3">
                              {index + 1}
                            </span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-safebite-text-secondary">Ingredient information not available</p>
                    )}
                  </div>

                  <div className="bg-safebite-card-bg-alt p-5 rounded-lg border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-safebite-text mb-4 flex items-center">
                      <span className="inline-block w-1 h-5 bg-purple-500 mr-2"></span>
                      Instructions
                    </h3>
                    {selectedRecipe.instructions ? (
                      <div className="text-safebite-text-secondary">
                        {selectedRecipe.instructions.map((step, index) => (
                          <div key={index} className="mb-4 flex items-start">
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-500 text-sm font-medium mr-3">
                              {index + 1}
                            </span>
                            <p>{step}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-safebite-text-secondary">Instruction information not available</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="sci-fi-button"
                      onClick={() => toggleFavorite(selectedRecipe.id)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </Button>
                  </div>
                  <DialogClose asChild>
                    <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* AI Chatbot */}
        <FoodChatBot
          currentPage="recipes"
          userData={{
            profile: userData,
            recentActivity: userActivity
          }}
          autoOpen={true}
          initialMessage="Looking for recipe ideas? I can suggest recipes based on dietary preferences, ingredients you have, or health goals. What kind of recipes are you interested in?"
        />
      </main>
    </div>
  );
};

export default Recipes;

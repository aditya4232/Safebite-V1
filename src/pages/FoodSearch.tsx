import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle, CheckCircle, XCircle,
  Leaf, Flame, Heart
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import FoodSearchBar from '@/components/FoodSearchBar';
import FoodItemCard from '@/components/FoodItemCard';
import { FoodItem, searchFoods } from '@/services/foodApiService';
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../main";
import { addFoodToTracker, getRecentFoods } from '@/services/foodTrackerService';

interface HealthProfile {
  health_goals?: string;
  health_conditions?: string;
  dietary_preferences?: string;
  food_allergies?: string;
}

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);
  // User profile for personalized recommendations
  const [userProfile, setUserProfile] = useState<HealthProfile | null>(null);
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showAddToTrackerModal, setShowAddToTrackerModal] = useState(false);
  const [selectedFoodForTracker, setSelectedFoodForTracker] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const location = useLocation();
  // Navigation for redirects
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Effect to read query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      handleSearch(query); // Perform search automatically
    }

    // Check if scan parameter is present
    const scan = params.get('scan');
    if (scan === 'true') {
      handleScan();
    }

    // Fetch user profile for personalized recommendations
    fetchUserProfile();

    // Fetch recent foods
    fetchRecentFoods();
  }, [location.search]); // Rerun effect if search params change

  // Fetch user's recent foods
  const fetchRecentFoods = async () => {
    try {
      const foods = await getRecentFoods(4);
      setRecentFoods(foods);
    } catch (error) {
      console.error('Error fetching recent foods:', error);
    }
  };

  // Fetch user profile from Firebase
  const fetchUserProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserProfile(userData.profile);

        // Generate food recommendations based on profile
        generateRecommendations(userData.profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Generate food recommendations based on user profile
  const generateRecommendations = (profile: HealthProfile) => {
    if (!profile) return;

    let recommendationQueries: string[] = [];

    // Based on health goals
    if (profile.health_goals === 'Weight Loss') {
      recommendationQueries.push('low calorie');
      recommendationQueries.push('high protein');
    } else if (profile.health_goals === 'Muscle Gain') {
      recommendationQueries.push('high protein');
      recommendationQueries.push('protein rich');
    } else if (profile.health_goals === 'General Health') {
      recommendationQueries.push('balanced meal');
      recommendationQueries.push('nutrient rich');
    }

    // Based on health conditions
    if (profile.health_conditions === 'Diabetes') {
      recommendationQueries.push('low glycemic');
      recommendationQueries.push('sugar free');
    } else if (profile.health_conditions === 'Hypertension') {
      recommendationQueries.push('low sodium');
      recommendationQueries.push('heart healthy');
    } else if (profile.health_conditions === 'Heart Issues') {
      recommendationQueries.push('heart healthy');
      recommendationQueries.push('omega 3');
    }

    // Based on dietary preferences
    if (profile.dietary_preferences === 'Veg') {
      recommendationQueries.push('vegetarian');
    } else if (profile.dietary_preferences === 'Vegan') {
      recommendationQueries.push('vegan');
    } else if (profile.dietary_preferences === 'Keto') {
      recommendationQueries.push('keto');
    } else if (profile.dietary_preferences === 'Gluten-Free') {
      recommendationQueries.push('gluten free');
    }

    // Get a random recommendation query
    if (recommendationQueries.length > 0) {
      const randomIndex = Math.floor(Math.random() * recommendationQueries.length);
      const query = recommendationQueries[randomIndex];

      // Fetch recommendations
      fetchRecommendations(query);
    }
  };

  // Fetch food recommendations
  const fetchRecommendations = async (query: string) => {
    try {
      const results = await searchFoods(query);
      // Filter to only include healthy options
      const healthyOptions = results.filter(food => food.nutritionScore === 'green');
      setRecommendations(healthyOptions.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setSelectedFood(null);
    setShowNoResults(false);

    try {
      // Call the real API service
      const results = await searchFoods(query);

      setSearchResults(results);
      setShowNoResults(results.length === 0);

      // Show toast notification
      toast({
        title: "Search Complete",
        description: `Found ${results.length} results for "${query}"`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "There was a problem with your search. Please try again.",
        variant: "destructive"
      });
      setShowNoResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = () => {
    // Simulate barcode scanning
    setIsLoading(true);
    setSelectedFood(null);

    toast({
      title: "Scanning Barcode",
      description: "Scanning functionality is simulated in this demo",
    });

    // Simulate API call with timeout
    setTimeout(async () => {
      try {
        // Simulate a random food search
        const randomFoods = [
          'apple', 'banana', 'yogurt', 'bread', 'cereal', 'milk', 'cheese', 'chicken',
          'rice', 'pasta', 'potato', 'tomato', 'carrot', 'spinach', 'egg'
        ];
        const randomIndex = Math.floor(Math.random() * randomFoods.length);
        const randomFood = randomFoods[randomIndex];

        // Call the real API with the random food
        const results = await searchFoods(randomFood);

        if (results.length > 0) {
          // Take the first result
          setSearchResults([results[0]]);
          setShowNoResults(false);

          toast({
            title: "Product Found",
            description: `Scanned product identified as ${results[0].name}`,
          });
        } else {
          setShowNoResults(true);
          toast({
            title: "Product Not Found",
            description: "Could not identify the scanned product",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Scan error:', error);
        setShowNoResults(true);
        toast({
          title: "Scan Error",
          description: "There was a problem scanning the product",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
  };

  // Open the Add to Tracker modal
  const handleAddToTracker = (food: FoodItem) => {
    setSelectedFoodForTracker(food);
    setShowAddToTrackerModal(true);
    setQuantity(1);
    setNotes('');
  };

  // Add the selected food to the tracker
  const handleTrackerSubmit = async () => {
    if (!selectedFoodForTracker) return;

    setIsLoading(true);

    try {
      const success = await addFoodToTracker(
        selectedFoodForTracker,
        selectedMealType,
        quantity,
        notes
      );

      if (success) {
        toast({
          title: "Added to Tracker",
          description: `${selectedFoodForTracker.name} added to your ${selectedMealType} tracker.`,
        });

        // Update recent foods
        fetchRecentFoods();
      } else {
        toast({
          title: "Error",
          description: "Could not add food to tracker. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding food to tracker:', error);
      toast({
        title: "Error",
        description: "Could not add food to tracker. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowAddToTrackerModal(false);
      setSelectedFoodForTracker(null);
    }
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-safebite-teal border-t-transparent rounded-full mb-4"></div>
          <p className="text-safebite-text-secondary">Searching for food data...</p>
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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

    if (searchResults.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {searchResults.map(food => (
            <FoodItemCard
              key={food.id}
              name={food.name}
              calories={food.calories}
              nutritionScore={food.nutritionScore}
              onClick={() => handleFoodSelect(food)}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const renderFoodDetail = () => {
    if (!selectedFood) return null;

    const { name, calories, nutritionScore, details } = selectedFood;

    const scoreColors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };

    const scoreLabels = {
      green: 'Good Choice',
      yellow: 'Moderate',
      red: 'Use Caution'
    };

    return (
      <div className="sci-fi-card">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold text-safebite-text">{name}</h3>
          <Badge className={`${scoreColors[nutritionScore]} text-white`}>
            {scoreLabels[nutritionScore]}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-safebite-text mb-2">Nutrition Facts</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Calories</div>
                <div className="text-safebite-text font-bold">{details?.calories || calories} kcal</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Protein</div>
                <div className="text-safebite-text font-bold">{details?.protein}g</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Carbs</div>
                <div className="text-safebite-text font-bold">{details?.carbs}g</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Fat</div>
                <div className="text-safebite-text font-bold">{details?.fat}g</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Sodium</div>
                <div className="text-safebite-text font-bold">{details?.sodium}mg</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Sugar</div>
                <div className="text-safebite-text font-bold">{details?.sugar}g</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-safebite-text mb-2">Ingredients</h4>
            <p className="text-safebite-text-secondary">
              {details?.ingredients.join(', ')}
            </p>
          </div>

          {details?.allergens && details.allergens.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {details.allergens.map((allergen: string) => (
                  <Badge
                    key={allergen}
                    variant="outline"
                    className="border-yellow-500 text-yellow-500"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" /> {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {details?.additives && details.additives.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Additives</h4>
              <div className="flex flex-wrap gap-2">
                {details.additives.map((additive: string) => (
                  <Badge
                    key={additive}
                    variant="outline"
                    className="border-red-500 text-red-500"
                  >
                    {additive}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {nutritionScore === 'red' && (
            <Card className="bg-red-500/10 border-red-500 p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-md font-medium text-red-400 mb-1">Health Concern</h5>
                  <p className="text-safebite-text-secondary text-sm">
                    This product contains high levels of sugar and artificial additives which may impact your health goals.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {nutritionScore === 'green' && (
            <Card className="bg-green-500/10 border-green-500 p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-md font-medium text-green-400 mb-1">Healthy Choice</h5>
                  <p className="text-safebite-text-secondary text-sm">
                    This product is a great fit for your health goals. It contains nutritious ingredients and minimal processing.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              className="sci-fi-button"
              onClick={() => setSelectedFood(null)}
            >
              Back to Results
            </Button>
            <Button
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              onClick={() => handleAddToTracker(selectedFood)}
            >
              Add to Tracker
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Add to Tracker Modal
  const renderAddToTrackerModal = () => {
    if (!showAddToTrackerModal || !selectedFoodForTracker) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-safebite-card-bg rounded-lg max-w-md w-full p-6 border border-safebite-card-bg-alt">
          <h3 className="text-xl font-semibold text-safebite-text mb-4">Add to Food Tracker</h3>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-safebite-text-secondary">Food:</span>
              <span className="text-safebite-text font-medium">{selectedFoodForTracker.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-safebite-text-secondary">Calories:</span>
              <span className="text-safebite-text font-medium">{selectedFoodForTracker.calories} kcal</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-safebite-text-secondary mb-2">Meal Type</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedMealType === 'breakfast' ? 'default' : 'outline'}
                className={selectedMealType === 'breakfast' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('breakfast')}
              >
                Breakfast
              </Button>
              <Button
                variant={selectedMealType === 'lunch' ? 'default' : 'outline'}
                className={selectedMealType === 'lunch' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('lunch')}
              >
                Lunch
              </Button>
              <Button
                variant={selectedMealType === 'dinner' ? 'default' : 'outline'}
                className={selectedMealType === 'dinner' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('dinner')}
              >
                Dinner
              </Button>
              <Button
                variant={selectedMealType === 'snack' ? 'default' : 'outline'}
                className={selectedMealType === 'snack' ? 'bg-safebite-teal text-safebite-dark-blue' : ''}
                onClick={() => setSelectedMealType('snack')}
              >
                Snack
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-safebite-text-secondary mb-2">Quantity</label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="mx-4 text-safebite-text font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-safebite-text-secondary mb-2">Notes (optional)</label>
            <input
              type="text"
              className="w-full p-2 bg-safebite-card-bg-alt border border-safebite-card-bg rounded-md text-safebite-text"
              placeholder="E.g., Before workout, With salad"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddToTrackerModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              onClick={handleTrackerSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add to Tracker'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      {renderAddToTrackerModal()}
      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Food Search</h1>
            <p className="text-safebite-text-secondary">Search for foods, scan barcodes, and get detailed nutrition information</p>
          </div>

          <div className="sci-fi-card mb-6">
            <FoodSearchBar
              onSearch={handleSearch}
              onScan={handleScan}
            />
          </div>

          {selectedFood ? (
            renderFoodDetail()
          ) : (
            <div className="sci-fi-card">
              <h2 className="text-xl font-semibold text-safebite-text mb-4">
                {searchResults.length > 0 ? 'Search Results' : 'Popular Searches'}
              </h2>
              {renderSearchResults()}

              {(!searchResults.length && !showNoResults && !isLoading) && (
                <>
                  {/* Personalized Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-safebite-text mb-4">
                        Recommended for You
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {recommendations.map((food) => (
                          <FoodItemCard
                            key={food.id}
                            name={food.name}
                            calories={food.calories}
                            nutritionScore={food.nutritionScore}
                            onClick={() => handleFoodSelect(food)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-safebite-text mb-4">
                      Popular Categories
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card
                        className="p-4 cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                        onClick={() => handleSearch("healthy breakfast")}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                            <Leaf className="h-6 w-6 text-green-500" />
                          </div>
                          <h4 className="font-medium text-safebite-text">Healthy Breakfast</h4>
                        </div>
                      </Card>

                      <Card
                        className="p-4 cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                        onClick={() => handleSearch("protein rich")}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                            <Flame className="h-6 w-6 text-red-500" />
                          </div>
                          <h4 className="font-medium text-safebite-text">Protein Rich</h4>
                        </div>
                      </Card>

                      <Card
                        className="p-4 cursor-pointer hover:bg-safebite-card-bg-alt transition-colors"
                        onClick={() => handleSearch("heart healthy")}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                            <Heart className="h-6 w-6 text-purple-500" />
                          </div>
                          <h4 className="font-medium text-safebite-text">Heart Healthy</h4>
                        </div>
                      </Card>
                    </div>
                  </div>

                  {/* Recent Foods */}
                  <div>
                    <h3 className="text-xl font-semibold text-safebite-text mb-4">
                      Recent Foods
                    </h3>
                    {recentFoods.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {recentFoods.map((food) => (
                          <FoodItemCard
                            key={food.id}
                            name={food.name}
                            calories={food.calories}
                            nutritionScore={food.nutritionScore}
                            onClick={() => handleFoodSelect(food)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        <FoodItemCard
                          name="Breakfast Cereal"
                          calories={120}
                          nutritionScore="yellow"
                          onClick={() => handleSearch("cereal")}
                        />
                        <FoodItemCard
                          name="Protein Bars"
                          calories={200}
                          nutritionScore="yellow"
                          onClick={() => handleSearch("protein bar")}
                        />
                        <FoodItemCard
                          name="Greek Yogurt"
                          calories={100}
                          nutritionScore="green"
                          onClick={() => handleSearch("greek yogurt")}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FoodSearch;

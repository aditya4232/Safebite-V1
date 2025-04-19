import React, { useState, useEffect } from "react";
import FoodDeliveryPopup from "../components/FoodDeliveryPopup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, AlertTriangle, Navigation, Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/DashboardSidebar";
import { RestaurantResult } from "@/services/foodDeliveryService";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from "@/hooks/useGuestMode";
import FoodDeliveryHealthPreferences, { HealthPreferences } from "@/components/FoodDeliveryHealthPreferences";
import { trackUserInteraction } from "@/services/mlService";
import RelatedOffers from "@/components/RelatedOffers";
import { getCurrentLocation, getCityFromCoordinates, getAddressFromCoordinates, UserLocation } from "@/services/locationService";

const FoodDeliveryPage: React.FC = () => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [foodQuery, setFoodQuery] = useState<string>("");
  const [cityQuery, setCityQuery] = useState<string>("");
  const [submittedQuery, setSubmittedQuery] = useState<{ food: string; city: string } | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<RestaurantResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [healthPreferences, setHealthPreferences] = useState<HealthPreferences | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [exactAddress, setExactAddress] = useState<string>("");

  // Popular food suggestions
  const popularFoods = [
    "Pizza", "Biryani", "Burger", "Sushi", "Pasta", "Curry", "Tacos", "Noodles"
  ];

  // Popular city suggestions
  const popularCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"
  ];

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user && !isGuest) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [auth, db, isGuest]);

  // Get user's location and set default city
  useEffect(() => {
    // Try to get a default city from localStorage
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setCityQuery(savedCity);
    }

    // Get precise location
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);

        // Get city name from coordinates
        const city = await getCityFromCoordinates(location.latitude, location.longitude);
        if (city && city !== 'Unknown') {
          setCityQuery(city);
          localStorage.setItem('userCity', city);
        }

        // Get full address for more precise location
        const address = await getAddressFromCoordinates(location.latitude, location.longitude);
        setExactAddress(address);
      } catch (error) {
        console.error('Error getting user location:', error);
        toast({
          title: "Location Error",
          description: "Could not get your precise location. Please enter your city manually.",
          variant: "default"
        });
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocation();
  }, [toast]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission page reload
    if (foodQuery.trim() && cityQuery.trim()) {
      setIsLoading(true);
      setError(null);
      setSubmittedQuery({ food: foodQuery.trim(), city: cityQuery.trim() });

      try {
        // Save the city for future use
        localStorage.setItem('userCity', cityQuery.trim());

        // Track this search with health preferences and location
        trackUserInteraction('food_delivery_search', {
          food: foodQuery.trim(),
          city: cityQuery.trim(),
          hasExactLocation: !!userLocation,
          healthPreferences: healthPreferences ? {
            dietaryRestrictions: healthPreferences.dietaryRestrictions,
            preferHealthy: healthPreferences.preferHealthy,
            cuisines: healthPreferences.preferredCuisines
          } : null
        });

        // Fetch search results and open the popup
        await fetchSearchResults(foodQuery.trim(), cityQuery.trim());
      } catch (err) {
        setError('Failed to fetch restaurant data. Please try again.');
        toast({
          title: "Search Error",
          description: "There was a problem finding restaurants. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchSearchResults = async (food: string, city: string) => {
    // Call the foodDeliveryService to get the search results
    const { fetchNearbyRestaurants } = await import("../services/foodDeliveryService");

    // Make sure city is properly formatted (capitalize first letter of each word)
    const formattedCity = city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    console.log(`Searching for ${food} in ${formattedCity}`);

    try {
      // Apply health preferences if available and pass user location for distance calculation
      let results = await fetchNearbyRestaurants(food, formattedCity, userLocation || undefined);
      console.log('Search results received:', results);

      if (results && results.length > 0) {
        if (healthPreferences) {
          // Filter results based on health preferences
          results = filterResultsByHealthPreferences(results, healthPreferences);
          console.log('Results after health preferences filtering:', results);
        }

        setSearchResults(results);
        setIsPopupOpen(true);
      } else {
        console.log('No results found');
        toast({
          title: "No restaurants found",
          description: `We couldn't find any restaurants for "${food}" in "${city}". Try a different search.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching food delivery results:', error);
      toast({
        title: "Error fetching results",
        description: "There was a problem finding restaurants. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter results based on health preferences
  const filterResultsByHealthPreferences = (results: RestaurantResult[], preferences: HealthPreferences): RestaurantResult[] => {
    if (!preferences) return results;

    return results.filter(restaurant => {
      // Filter by dietary restrictions
      if (preferences.dietaryRestrictions.includes('vegetarian') &&
          restaurant.cuisine?.toLowerCase().includes('non-veg')) {
        return false;
      }

      // Filter by preferred cuisines if specified
      if (preferences.preferredCuisines.length > 0) {
        const cuisineMatch = preferences.preferredCuisines.some(cuisine =>
          restaurant.cuisine?.toLowerCase().includes(cuisine.toLowerCase())
        );

        if (!cuisineMatch) return false;
      }

      // Filter by excluded ingredients
      if (preferences.excludeIngredients.length > 0) {
        const hasExcludedIngredient = preferences.excludeIngredients.some(ingredient =>
          restaurant.popular_dishes?.some(dish =>
            dish.toLowerCase().includes(ingredient.toLowerCase())
          )
        );

        if (hasExcludedIngredient) return false;
      }

      return true;
    }).map(restaurant => {
      // Add health score based on preferences
      if (preferences.preferHealthy) {
        return {
          ...restaurant,
          health_score: calculateHealthScore(restaurant, preferences),
          health_tags: generateHealthTags(restaurant, preferences)
        };
      }

      return restaurant;
    }).sort((a, b) => {
      // Sort by health score if preferHealthy is true
      if (preferences.preferHealthy) {
        return (b.health_score || 0) - (a.health_score || 0);
      }

      return 0;
    });
  };

  // Calculate health score based on restaurant data and preferences
  const calculateHealthScore = (restaurant: RestaurantResult, preferences: HealthPreferences): number => {
    let score = 50; // Base score

    // Boost score for restaurants with healthy cuisine types
    const healthyCuisines = ['salad', 'healthy', 'vegan', 'vegetarian', 'organic', 'mediterranean'];
    if (restaurant.cuisine && healthyCuisines.some(c => restaurant.cuisine?.toLowerCase().includes(c))) {
      score += 20;
    }

    // Reduce score for restaurants with unhealthy cuisine types
    const unhealthyCuisines = ['fast food', 'fried', 'pizza', 'burger'];
    if (restaurant.cuisine && unhealthyCuisines.some(c => restaurant.cuisine?.toLowerCase().includes(c))) {
      score -= 15;
    }

    // Adjust score based on popular dishes
    const healthyDishTerms = ['salad', 'grilled', 'steamed', 'baked', 'roasted', 'boiled'];
    const unhealthyDishTerms = ['fried', 'cheesy', 'creamy', 'buttery', 'sweet'];

    if (restaurant.popular_dishes) {
      restaurant.popular_dishes.forEach(dish => {
        const dishLower = dish.toLowerCase();

        if (healthyDishTerms.some(term => dishLower.includes(term))) {
          score += 5;
        }

        if (unhealthyDishTerms.some(term => dishLower.includes(term))) {
          score -= 5;
        }
      });
    }

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, score));
  };

  // Generate health tags based on restaurant data and preferences
  const generateHealthTags = (restaurant: RestaurantResult, preferences: HealthPreferences): string[] => {
    const tags: string[] = [];

    // Add tags based on cuisine
    if (restaurant.cuisine) {
      const cuisineLower = restaurant.cuisine.toLowerCase();

      if (cuisineLower.includes('vegetarian') || cuisineLower.includes('vegan')) {
        tags.push('Plant-Based');
      }

      if (cuisineLower.includes('organic')) {
        tags.push('Organic');
      }

      if (cuisineLower.includes('gluten-free')) {
        tags.push('Gluten-Free');
      }
    }

    // Add tags based on health score
    const healthScore = restaurant.health_score || 0;

    if (healthScore >= 80) {
      tags.push('Very Healthy');
    } else if (healthScore >= 60) {
      tags.push('Healthy Option');
    } else if (healthScore <= 30) {
      tags.push('Indulgent');
    }

    return tags;
  };

  const handleFoodSuggestionClick = (food: string) => {
    setFoodQuery(food);
  };

  const handleCitySuggestionClick = (city: string) => {
    setCityQuery(city);
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar userProfile={userData || {}} />

      <main className="flex-1 p-6 ml-[220px]">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold text-safebite-text mb-2">
            Find Food Delivery
          </h1>
          <p className="text-safebite-text-secondary mb-8">
            Search for your favorite food and find delivery options from Swiggy and Zomato
          </p>

          {/* Health Preferences */}
          <div className="mb-6">
            <FoodDeliveryHealthPreferences
              onPreferencesChange={setHealthPreferences}
              isCollapsible={true}
            />
          </div>

          <Card className="p-6 bg-safebite-card-bg border-safebite-card-bg-alt mb-8">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="foodQuery" className="text-safebite-text mb-2 block">
                    What are you craving?
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-safebite-text-secondary" />
                    </div>
                    <Input
                      id="foodQuery"
                      type="text"
                      value={foodQuery}
                      onChange={(e) => setFoodQuery(e.target.value)}
                      placeholder="e.g., Paneer Butter Masala, Pizza"
                      className="pl-10 bg-safebite-card-bg-alt border-safebite-card-bg-alt focus:border-safebite-teal text-safebite-text"
                      required
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {popularFoods.slice(0, 4).map((food) => (
                      <Badge
                        key={food}
                        className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
                        onClick={() => handleFoodSuggestionClick(food)}
                      >
                        {food}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="cityQuery" className="text-safebite-text mb-2 block">
                    Enter your city
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-safebite-text-secondary" />
                    </div>
                    <Input
                      id="cityQuery"
                      type="text"
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="e.g., Hyderabad, Mumbai"
                      className="pl-10 bg-safebite-card-bg-alt border-safebite-card-bg-alt focus:border-safebite-teal text-safebite-text"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 bg-safebite-card-bg-alt border-safebite-card-bg-alt hover:bg-safebite-teal/20"
                      onClick={async () => {
                        setIsLoadingLocation(true);
                        try {
                          const location = await getCurrentLocation();
                          setUserLocation(location);
                          const city = await getCityFromCoordinates(location.latitude, location.longitude);
                          if (city && city !== 'Unknown') {
                            setCityQuery(city);
                            localStorage.setItem('userCity', city);
                          }
                          const address = await getAddressFromCoordinates(location.latitude, location.longitude);
                          setExactAddress(address);
                          toast({
                            title: "Location Updated",
                            description: "Using your current location for better results.",
                            variant: "default"
                          });
                        } catch (error) {
                          console.error('Error getting location:', error);
                          toast({
                            title: "Location Error",
                            description: "Could not get your location. Please enter your city manually.",
                            variant: "destructive"
                          });
                        } finally {
                          setIsLoadingLocation(false);
                        }
                      }}
                      disabled={isLoadingLocation}
                    >
                      {isLoadingLocation ? <Clock className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                    </Button>
                  </div>
                  {exactAddress && (
                    <div className="mt-1 text-xs text-safebite-teal flex items-center">
                      <Navigation className="h-3 w-3 mr-1" />
                      <span className="truncate">{exactAddress}</span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {popularCities.slice(0, 4).map((city) => (
                      <Badge
                        key={city}
                        className="bg-safebite-card-bg-alt hover:bg-safebite-teal/20 cursor-pointer transition-colors"
                        onClick={() => handleCitySuggestionClick(city)}
                      >
                        {city}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-safebite-teal hover:bg-safebite-teal/80 text-safebite-dark-blue font-medium"
                disabled={!foodQuery.trim() || !cityQuery.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search Restaurants'
                )}
              </Button>
            </form>
          </Card>

          {/* Conditionally render the results heading after a search is submitted */}
          {submittedQuery && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-safebite-text mb-2">
                Results for "{submittedQuery.food}" in "{submittedQuery.city}"
              </h2>
              <p className="text-safebite-text-secondary">
                Click on a restaurant to view delivery options
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-safebite-text">{error}</p>
            </div>
          )}

          {/* Related Offers */}
          {submittedQuery && (
            <div className="mb-6">
              <RelatedOffers searchQuery={submittedQuery.food} category="food" maxOffers={4} />
            </div>
          )}

          <FoodDeliveryPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            searchResults={searchResults}
            userData={userData}
            currentPage="food-delivery"
          />
        </div>
      </main>
    </div>
  );
};

export default FoodDeliveryPage;

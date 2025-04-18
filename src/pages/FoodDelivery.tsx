import React, { useState, useEffect } from "react";
import FoodDeliveryPopup from "../components/FoodDeliveryPopup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/DashboardSidebar";
import { RestaurantResult } from "@/services/foodDeliveryService";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from "@/hooks/useGuestMode";

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

  // Set default city based on browser geolocation (if available)
  useEffect(() => {
    // Try to get a default city from localStorage
    const savedCity = localStorage.getItem('userCity');
    if (savedCity) {
      setCityQuery(savedCity);
      return;
    }

    // If no saved city, try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use a reverse geocoding service to get the city name
            // This is a simplified example - in production, use a proper geocoding service
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();
            if (data.address && data.address.city) {
              setCityQuery(data.address.city);
              localStorage.setItem('userCity', data.address.city);
            }
          } catch (error) {
            console.error('Error getting city from coordinates:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission page reload
    if (foodQuery.trim() && cityQuery.trim()) {
      setIsLoading(true);
      setError(null);
      setSubmittedQuery({ food: foodQuery.trim(), city: cityQuery.trim() });

      try {
        // Save the city for future use
        localStorage.setItem('userCity', cityQuery.trim());

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
    const results = await fetchNearbyRestaurants(food, city);
    setSearchResults(results);
    setIsPopupOpen(true);
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
                  </div>
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

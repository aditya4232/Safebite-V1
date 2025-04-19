import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2, ArrowRight, Utensils, ShoppingBag, Heart,
  Clock, AlertTriangle, X, Bell, Info, MapPin, Star,
  Leaf, Award, Navigation, Locate
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';
import { RestaurantData, DishDetail } from '@/services/webScrapingService';
import webScrapingService from '@/services/webScrapingService';
import { trackUserInteraction } from '@/services/mlService';
import { RestaurantResult } from '@/services/foodDeliveryService';

interface FoodDeliveryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  userData?: any;
  searchResults?: RestaurantResult[];
}

const FoodDeliveryPopup: React.FC<FoodDeliveryPopupProps> = ({
  isOpen,
  onClose,
  currentPage = '',
  userData = null,
  searchResults = []
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();
  const [isNotifyMeEnabled, setIsNotifyMeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"restaurants" | "dishes">("restaurants");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [localResults, setLocalResults] = useState<RestaurantData[]>([]);
  const [iframeUrl, setIframeUrl] = useState<string>("");
  const [showIframe, setShowIframe] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('Hyderabad');
  const [showNoResults, setShowNoResults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load favorites when component mounts
  useEffect(() => {
    if (isOpen && auth.currentUser && !isGuest) {
      const fetchFavorites = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFavorites(userData.favoriteRestaurants || []);
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      };
      fetchFavorites();
    }
  }, [isOpen, auth, db, isGuest]);

  // Update local results with favorites
  useEffect(() => {
    console.log('Search results received:', searchResults);
    if (searchResults && Array.isArray(searchResults) && searchResults.length > 0) {
      const updatedResults = searchResults.map(result => ({
        ...result,
        is_favorite: favorites.includes(result.restaurant)
      }));
      console.log('Updated results with favorites:', updatedResults);
      setLocalResults(updatedResults);

      // Ensure we're showing the restaurants tab when results are loaded
      setActiveTab('restaurants');
    } else {
      console.log('No search results or empty array received');
      setLocalResults([]);
    }
  }, [searchResults, favorites]);

  // Search for restaurants
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a food item to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowNoResults(false);

    try {
      // Call our web scraping service
      const results = await webScrapingService.searchRestaurants(searchQuery, searchLocation);

      // Update results with favorite status
      const updatedResults = results.map(result => ({
        ...result,
        is_favorite: favorites.includes(result.restaurant)
      }));

      setLocalResults(updatedResults);
      setShowNoResults(updatedResults.length === 0);

      // Track search in Firebase if user is logged in
      if (auth.currentUser && !isGuest) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Update search history
        await setDoc(userRef, {
          searchHistory: [
            ...(userData.searchHistory || []),
            {
              type: 'food_delivery',
              query: searchQuery,
              location: searchLocation,
              timestamp: new Date(),
              results: updatedResults.length
            }
          ].slice(-20) // Keep only last 20 searches
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
      setError('Failed to search restaurants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling favorites
  const handleToggleFavorite = async (restaurant: string) => {
    if (isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;

      const isFavorite = favorites.includes(restaurant);
      const updatedFavorites = isFavorite
        ? favorites.filter(r => r !== restaurant)
        : [...favorites, restaurant];

      // Update local state
      setFavorites(updatedFavorites);

      // Update Firebase
      await updateDoc(doc(db, 'users', user.uid), {
        favoriteRestaurants: updatedFavorites
      });

      // Track this action for analytics
      await setDoc(doc(db, 'user_actions', `${user.uid}_${Date.now()}`), {
        userId: user.uid,
        action: isFavorite ? 'remove_favorite_restaurant' : 'add_favorite_restaurant',
        restaurant: restaurant,
        timestamp: new Date()
      });

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${restaurant} has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle opening restaurant in iframe
  const handleOpenInIframe = (url: string) => {
    setIframeUrl(url);
    setShowIframe(true);
  };

  if (!isOpen) return null;

  // Get content based on current page
  const getPageSpecificContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return {
          title: "Food Delivery Integration",
          subtitle: userData ? `Personalized for ${userData.displayName || 'you'}` : 'Now Live',
          description: "Get nutritional insights for your food delivery orders and make healthier choices based on your health profile."
        };
      case 'nutrition':
        return {
          title: "Nutrition-Aware Food Delivery",
          subtitle: 'Now Live',
          description: "Track nutrition from your food delivery orders and stay on top of your health goals."
        };
      case 'recipes':
        return {
          title: "Order Instead of Cooking",
          subtitle: 'Now Live',
          description: "Don't have time to cook? Order similar healthy options from your favorite restaurants."
        };
      default:
        return {
          title: "Food Delivery Integration",
          subtitle: 'Now Live',
          description: "Get nutritional insights for your food delivery orders and make healthier choices."
        };
    }
  };

  const content = getPageSpecificContent();

  // Get color for health score
  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green for high scores
    if (score >= 60) return '#22c55e'; // Light green for good scores
    if (score >= 40) return '#eab308'; // Yellow for medium scores
    if (score >= 20) return '#f97316'; // Orange for low scores
    return '#ef4444'; // Red for very low scores
  };

  const handleNotifyMe = async () => {
    if (isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to get notified when this feature is available.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);

        // Get current user data
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Update notifications preferences
        await setDoc(userRef, {
          notifications: {
            ...userData.notifications,
            foodDeliveryUpdates: true
          }
        }, { merge: true });

        setIsNotifyMeEnabled(true);
        toast({
          title: "Notification enabled",
          description: "You'll receive updates about new food delivery features.",
        });
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-safebite-dark-blue border-safebite-card-bg-alt">
        <CardHeader className="relative border-b border-safebite-card-bg-alt">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-safebite-text flex items-center">
            <ShoppingBag className="mr-2 h-6 w-6 text-orange-500" />
            {content.title}
            <Badge className="ml-3 bg-orange-500 text-white">{content.subtitle}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search bar */}
          <div className="mb-6 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="food-search" className="text-xs text-safebite-text-secondary mb-1 block">Food Item</label>
                <div className="relative">
                  <input
                    id="food-search"
                    type="text"
                    placeholder="Search for paneer butter masala, pizza, etc."
                    className="w-full bg-safebite-dark-blue border border-safebite-card-bg-alt rounded-md px-3 py-2 text-safebite-text placeholder:text-safebite-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-safebite-teal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="md:w-1/3">
                <label htmlFor="location-search" className="text-xs text-safebite-text-secondary mb-1 block">Location</label>
                <div className="relative">
                  <input
                    id="location-search"
                    type="text"
                    placeholder="City name"
                    className="w-full bg-safebite-dark-blue border border-safebite-card-bg-alt rounded-md px-3 py-2 text-safebite-text placeholder:text-safebite-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-safebite-teal"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="md:w-auto flex items-end">
                <Button
                  className="w-full md:w-auto bg-safebite-teal hover:bg-safebite-teal/80 text-safebite-dark-blue"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Search
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-3 text-red-500 text-sm">
                <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                {error}
              </div>
            )}
          </div>

          {/* Tabs for switching between restaurants and dishes */}
          <Tabs defaultValue="restaurants" className="mb-6" onValueChange={(value) => setActiveTab(value as "restaurants" | "dishes")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="dishes">Dishes</TabsTrigger>
            </TabsList>

            {/* Restaurants Tab Content */}
            <TabsContent value="restaurants">
              {localResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {localResults.map((r, i) => (
                    <div key={i} className="bg-safebite-card-bg p-4 rounded-xl border border-safebite-teal/30 shadow-md hover:shadow-lg hover:border-safebite-teal/60 transition-all duration-300">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-safebite-text truncate" title={r.restaurant}>
                          {r.restaurant || "Restaurant Name Unavailable"}
                        </h3>
                        <div className="flex items-center gap-2">
                          {r.source && (
                            <Badge className={r.source.toLowerCase() === 'swiggy' ? 'bg-orange-500/20 text-orange-500 border-orange-500' : 'bg-red-500/20 text-red-500 border-red-500'}>
                              {r.source}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-0"
                            onClick={() => handleToggleFavorite(r.restaurant)}
                          >
                            <Heart className={`h-4 w-4 ${r.is_favorite ? 'fill-red-500 text-red-500' : 'text-safebite-text-secondary'}`} />
                          </Button>
                        </div>
                      </div>

                      {/* Restaurant Image */}
                      {r.image_url && (
                        <div className="mb-3 rounded-md overflow-hidden h-40 bg-safebite-card-bg-alt">
                          <img
                            src={r.image_url}
                            alt={r.restaurant}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback image if the original fails to load
                              e.currentTarget.src = `https://source.unsplash.com/random/300x200/?restaurant,${encodeURIComponent(r.restaurant)}`;
                            }}
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {r.rating && (
                          <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                            {typeof r.rating === 'number' ? r.rating.toFixed(1) : r.rating}
                          </Badge>
                        )}
                        {r.delivery_time && (
                          <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {r.delivery_time}
                          </Badge>
                        )}
                        {r.distance_km !== undefined && (
                          <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                            <Navigation className="h-3 w-3 mr-1 text-blue-400" />
                            {r.distance_km} km
                          </Badge>
                        )}
                        {r.restaurant_type && (
                          <Badge variant="outline" className={`${r.restaurant_type === 'veg' ? 'bg-green-500/10 text-green-500' : r.restaurant_type === 'non-veg' ? 'bg-red-500/10 text-red-500' : 'bg-safebite-card-bg-alt text-safebite-text-secondary'}`}>
                            {r.restaurant_type === 'veg' ? '🟢 Veg' : r.restaurant_type === 'non-veg' ? '🔴 Non-veg' : '🟢🔴 Both'}
                          </Badge>
                        )}
                        {r.price_range && (
                          <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                            {r.price_range}
                          </Badge>
                        )}
                        {r.cuisine && (
                          <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                            <Utensils className="h-3 w-3 mr-1" />
                            {r.cuisine}
                          </Badge>
                        )}
                      </div>

                      {r.address && (
                        <p className="text-xs text-safebite-text-secondary mb-2 flex items-start">
                          <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          {r.address}
                          {r.distance_km !== undefined && (
                            <span className="ml-1 text-blue-400">
                              ({r.distance_km} km away)
                            </span>
                          )}
                        </p>
                      )}

                      {/* Offers */}
                      {r.offers && r.offers.length > 0 && (
                        <div className="mb-2">
                          {r.offers.map((offer, idx) => (
                            <div key={idx} className="text-xs flex items-center text-green-500 mb-1">
                              <span className="bg-green-500/10 p-0.5 rounded mr-1">%</span>
                              {offer}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Delivery info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-safebite-text-secondary mb-2">
                        {r.min_order && (
                          <span className="flex items-center">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Min: {r.min_order}
                          </span>
                        )}
                        {r.delivery_fee && (
                          <span className="flex items-center">
                            <Truck className="h-3 w-3 mr-1" />
                            Delivery: {r.delivery_fee === '₹0' ? 'FREE' : r.delivery_fee}
                          </span>
                        )}
                        {r.estimated_delivery_time && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            ETA: {r.estimated_delivery_time}
                          </span>
                        )}
                      </div>

                      {r.popular_dishes && r.popular_dishes.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-safebite-text-secondary mb-1">Popular dishes:</p>
                          <div className="flex flex-wrap gap-1">
                            {r.popular_dishes.map((dish, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-safebite-teal/10 text-safebite-teal">
                                {dish}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Health Score */}
                      {r.health_score !== undefined && (
                        <div className="mt-2 mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center">
                              <Leaf className="h-3.5 w-3.5 text-green-500 mr-1" />
                              <span className="text-xs text-safebite-text-secondary">Health Score</span>
                            </div>
                            <span className="text-xs font-medium">
                              {r.health_score}/100
                            </span>
                          </div>
                          <Progress
                            value={r.health_score}
                            className="h-1.5"
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              '--progress-background': getHealthScoreColor(r.health_score || 0)
                            } as React.CSSProperties}
                          />
                        </div>
                      )}

                      {/* Health Tags */}
                      {r.health_tags && r.health_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {r.health_tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-green-500/10 text-green-400 border-green-500/30 text-xs"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3">
                        {r.redirect && (
                          <Button
                            className="flex-1 bg-safebite-teal hover:bg-safebite-teal/80 text-safebite-dark-blue text-sm h-8"
                            onClick={() => handleOpenInIframe(r.redirect)}
                          >
                            View Menu
                          </Button>
                        )}
                        {r.redirect && (
                          <Button
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm h-8"
                            onClick={() => {
                              // Track this interaction
                              trackUserInteraction('order_food', {
                                restaurant: r.restaurant,
                                source: r.source,
                                healthScore: r.health_score,
                                distance_km: r.distance_km
                              });

                              // Open in new tab
                              window.open(r.redirect, '_blank', 'noopener,noreferrer');

                              // Show toast
                              toast({
                                title: "Opening Restaurant",
                                description: `Taking you to ${r.source} to order from ${r.restaurant}${r.distance_km ? ` (${r.distance_km} km away)` : ''}.`,
                              });
                            }}
                          >
                            Order Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4 opacity-70" />
                  <p className="text-safebite-text-secondary mb-2">No restaurants found for your search.</p>
                  <p className="text-sm text-safebite-text-secondary">Try a different food item or city?</p>
                </div>
              )}
            </TabsContent>

            {/* Dishes Tab Content */}
            <TabsContent value="dishes">
              {localResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {localResults.flatMap((r) =>
                    (r.dish_details || []).map((dish, idx) => (
                      <div key={`${r.restaurant}-${idx}`} className="bg-safebite-card-bg p-4 rounded-xl border border-safebite-teal/30 shadow-md hover:shadow-lg hover:border-safebite-teal/60 transition-all duration-300">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-safebite-text truncate" title={dish.name}>
                            {dish.name}
                          </h3>
                          {dish.is_veg !== undefined && (
                            <Badge className={dish.is_veg ? 'bg-green-500/20 text-green-500 border-green-500' : 'bg-red-500/20 text-red-500 border-red-500'}>
                              {dish.is_veg ? 'Veg' : 'Non-Veg'}
                            </Badge>
                          )}
                        </div>

                        {dish.image_url && (
                          <div className="mb-3 rounded-md overflow-hidden h-32 bg-safebite-card-bg-alt">
                            <img
                              src={dish.image_url}
                              alt={dish.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {dish.description && (
                          <p className="text-xs text-safebite-text-secondary mb-2">
                            {dish.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          {dish.price && (
                            <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                              {dish.price}
                            </Badge>
                          )}
                          {dish.rating && (
                            <Badge variant="outline" className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                              {dish.rating}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 text-xs text-safebite-text-secondary">
                          From: <span className="font-medium text-safebite-text">{r.restaurant}</span>
                          {r.source && (
                            <Badge className="ml-2 text-xs" variant="outline">
                              {r.source}
                            </Badge>
                          )}
                        </div>

                        {r.redirect && (
                          <a
                            href={r.redirect}
                            className="text-sm mt-3 inline-block bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded text-white font-medium transition-colors duration-200 w-full text-center"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Order Now <ArrowRight className="inline-block h-3.5 w-3.5 ml-1" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4 opacity-70" />
                  <p className="text-safebite-text-secondary mb-2">No dishes found for your search.</p>
                  <p className="text-sm text-safebite-text-secondary">Try a different food item or city?</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Iframe for viewing restaurant menu directly */}
          {showIframe && (
            <div className="mb-6 border border-safebite-card-bg-alt rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-safebite-card-bg p-2">
                <h3 className="text-sm font-medium text-safebite-text">Restaurant Menu</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowIframe(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <iframe
                src={iframeUrl}
                className="w-full h-[400px] border-0"
                title="Restaurant Menu"
              />
            </div>
          )}

          <div className="bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-safebite-text mb-3 flex items-center">
              <Info className="mr-2 h-5 w-5 text-safebite-teal" />
              Food Delivery Features
            </h3>
            <ul className="space-y-2 text-safebite-text-secondary text-sm">
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Search for restaurants on Swiggy and Zomato in one place</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>View popular dishes and cuisine information</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Save your favorite restaurants for quick access</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Get nutritional information for restaurant meals</span>
              </li>
              <li className="flex items-start">
                <span className="text-safebite-teal mr-2">•</span>
                <span>Personalized recommendations based on your health profile</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Close
            </Button>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                className="flex-1 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                onClick={() => navigate('/food-delivery')}
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleNotifyMe}
                disabled={isNotifyMeEnabled || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Bell className="mr-2 h-4 w-4" />
                )}
                {isNotifyMeEnabled ? "Notifications On" : "Get Offers"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodDeliveryPopup;

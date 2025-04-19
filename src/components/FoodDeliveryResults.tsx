import React, { useEffect, useState } from "react";
import { fetchNearbyRestaurants } from "../services/foodDeliveryService";
import { Star, Clock, ArrowRight, AlertTriangle, Search, Pizza, Info, Heart, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { trackUserInteraction } from "@/services/mlService";
import { useGuestMode } from "@/hooks/useGuestMode";
import AIRestaurantDetail from "./AIRestaurantDetail";

// Define the expected shape of a result item
interface RestaurantResult {
  restaurant: string;
  redirect: string;
  rating?: number;
  delivery_time?: string;
  price_range?: string;
  cuisine?: string;
  address?: string;
  image_url?: string;
  platform?: string;
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  popular_dishes?: string[];
}

// Define the props for the component
interface FoodDeliveryResultsProps {
  query: string;
  city: string;
}

const FoodDeliveryResults: React.FC<FoodDeliveryResultsProps> = ({ query, city }) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [results, setResults] = useState<RestaurantResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Only fetch if both query and city are provided
    if (query && city) {
      setLoading(true);
      setError(null); // Reset error state on new fetch
      fetchNearbyRestaurants(query, city)
        .then((data) => {
          if (Array.isArray(data)) {
            setResults(data);
          } else {
            // Handle cases where the API might not return an array on error
            console.error("API did not return an array:", data);
            setResults([]);
            setError("Could not fetch results. Please try again later.");
          }
        })
        .catch((err) => {
          console.error("Error fetching restaurant data:", err);
          setError("An error occurred while fetching results.");
          setResults([]); // Clear results on error
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Clear results if query or city is missing
      setResults([]);
    }
  }, [query, city]); // Re-run effect when query or city changes

  // Handle toggling restaurant favorites
  const handleToggleFavorite = (restaurantName: string) => {
    // Check if restaurant is already in favorites
    const isFavorite = favorites.includes(restaurantName);

    // Update local state
    if (isFavorite) {
      setFavorites(favorites.filter(name => name !== restaurantName));
    } else {
      setFavorites([...favorites, restaurantName]);
    }

    // Track this interaction
    trackUserInteraction('toggle_favorite_restaurant', {
      restaurantName,
      action: isFavorite ? 'remove' : 'add',
      isGuest
    });

    // Show toast notification
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? `${restaurantName} removed from your favorites.` : `${restaurantName} added to your favorites.`,
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-safebite-text-secondary mb-4">Loading nearby restaurants...</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-safebite-card-bg p-4 rounded-xl border border-safebite-teal/30 shadow-md animate-pulse">
              {/* Skeleton Image */}
              <div className="h-40 w-full mb-3 rounded-lg bg-safebite-card-bg-alt/50"></div>

              {/* Skeleton Title */}
              <div className="h-6 bg-safebite-card-bg-alt/50 rounded w-3/4 mb-3"></div>

              {/* Skeleton Details */}
              <div className="space-y-2 mb-3">
                <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-1/2"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-1/4"></div>
                  <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-2/3"></div>
              </div>

              {/* Skeleton Badge */}
              <div className="mb-3">
                <div className="h-5 bg-safebite-card-bg-alt/50 rounded w-1/4 inline-block"></div>
              </div>

              {/* Skeleton Button */}
              <div className="h-9 bg-safebite-card-bg-alt/50 rounded w-full mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-safebite-text mb-2">{error}</p>
        <p className="text-safebite-text-secondary text-sm">
          We're having trouble connecting to our food delivery partners. Please try again later or try a different search term.
        </p>
      </div>
    );
  }

  if (!query || !city) {
    return (
      <div className="p-4 text-center">
        <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-safebite-teal/10">
          <Search className="h-6 w-6 text-safebite-teal" />
        </div>
        <p className="text-safebite-text mb-2">Ready to find restaurants?</p>
        <p className="text-safebite-text-secondary text-sm">
          Enter a food item and city to search for nearby restaurants.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="inline-flex items-center justify-center p-4 mb-4 rounded-full bg-amber-500/10">
          <Pizza className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-safebite-text mb-2">No restaurants found</p>
        <p className="text-safebite-text-secondary text-sm">
          We couldn't find any restaurants for "{query}" in "{city}". Try a different food item or city.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {results.map((r, i) => (
        <div key={i} className="bg-safebite-card-bg p-4 rounded-xl border border-safebite-teal/30 shadow-md hover:shadow-lg hover:border-safebite-teal/60 transition-all duration-300 relative">
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full p-1.5 z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(r.restaurant);
            }}
          >
            <Heart
              className={`h-5 w-5 ${favorites.includes(r.restaurant) ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </Button>

          {/* Restaurant Image */}
          {r.image_url && (
            <div className="h-40 w-full mb-3 rounded-lg overflow-hidden bg-safebite-card-bg-alt">
              <img
                src={r.image_url}
                alt={r.restaurant}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://source.unsplash.com/random/300x200/?restaurant,${encodeURIComponent(r.cuisine || 'food')}`;
                }}
              />
            </div>
          )}

          {/* Restaurant Name */}
          <h3 className="text-lg font-semibold text-safebite-text mb-2 truncate" title={r.restaurant}>
            {r.restaurant || "Restaurant Name Unavailable"}
          </h3>

          {/* Restaurant Details */}
          <div className="space-y-2 mb-3">
            {r.cuisine && (
              <div className="text-sm text-safebite-text-secondary">
                Cuisine: {r.cuisine}
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              {r.rating && (
                <div className="flex items-center text-safebite-teal">
                  <Star className="h-4 w-4 mr-1 fill-safebite-teal" />
                  {r.rating.toFixed(1)}
                </div>
              )}

              {r.delivery_time && (
                <div className="flex items-center text-safebite-text-secondary">
                  <Clock className="h-4 w-4 mr-1" />
                  {r.delivery_time}
                </div>
              )}
            </div>

            {r.price_range && (
              <div className="text-sm text-safebite-text-secondary">
                {r.price_range}
              </div>
            )}

            {r.distance_km !== undefined && (
              <div className="text-sm text-safebite-text-secondary">
                Distance: {r.distance_km} km
              </div>
            )}

            {/* Popular Dishes */}
            {r.popular_dishes && r.popular_dishes.length > 0 && (
              <div className="text-sm text-safebite-text-secondary">
                <span className="font-medium">Popular:</span> {r.popular_dishes.join(', ')}
              </div>
            )}
          </div>

          {/* Platform Badge */}
          {r.platform && (
            <div className="mb-3">
              <Badge variant="outline" className="bg-safebite-teal/10 text-safebite-teal border-safebite-teal/30">
                {r.platform}
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
              onClick={() => {
                // Open AI-powered restaurant details
                setSelectedRestaurant(r);
                setIsDetailOpen(true);

                // Track this interaction
                trackUserInteraction('view_restaurant_details', {
                  restaurantName: r.restaurant,
                  cuisine: r.cuisine,
                  platform: r.platform,
                  isGuest
                });
              }}
            >
              <Info className="mr-2 h-4 w-4 text-safebite-teal" />
              Details
            </Button>

            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                // Track this interaction
                trackUserInteraction('order_from_restaurant', {
                  restaurantName: r.restaurant,
                  platform: r.platform,
                  isGuest
                });

                // Open the redirect URL if available
                if (r.redirect) {
                  window.open(r.redirect, '_blank', 'noopener,noreferrer');

                  toast({
                    title: "Opening food delivery app",
                    description: `Taking you to ${r.platform || 'the delivery platform'} to order from ${r.restaurant}.`,
                  });
                } else {
                  // If no redirect URL, create a fallback search based on restaurant name and platform
                  let fallbackUrl = '';

                  if (r.platform === 'Swiggy') {
                    fallbackUrl = `https://www.swiggy.com/search?query=${encodeURIComponent(r.restaurant)}`;
                  } else if (r.platform === 'Zomato') {
                    fallbackUrl = `https://www.zomato.com/search?q=${encodeURIComponent(r.restaurant)}`;
                  } else {
                    fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(r.restaurant)}+food+delivery+order+online`;
                  }

                  window.open(fallbackUrl, '_blank', 'noopener,noreferrer');

                  toast({
                    title: "Searching for restaurant",
                    description: `Searching for ${r.restaurant} on food delivery platforms.`,
                  });
                }
              }}
            >
              <Utensils className="mr-2 h-4 w-4" />
              Order
            </Button>
          </div>
        </div>
      ))}
    </div>

    {/* AI Restaurant Detail Dialog */}
    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
        {selectedRestaurant && (
          <AIRestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => setIsDetailOpen(false)}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.includes(selectedRestaurant.restaurant)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FoodDeliveryResults; // Export as default

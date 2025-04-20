import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Star, Info, Utensils, Sparkles, Award, 
  Leaf, Clock, MapPin, Zap, ShieldCheck, Flame 
} from 'lucide-react';
import { RestaurantResult } from '@/services/foodDeliveryService';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';

interface BestFoodDeliveryResultsProps {
  restaurants: RestaurantResult[];
  searchQuery: string;
  city: string;
  favorites: string[];
  onToggleFavorite: (restaurant: string) => void;
  onViewDetails: (restaurant: RestaurantResult) => void;
  onOrder: (restaurant: RestaurantResult) => void;
}

const BestFoodDeliveryResults: React.FC<BestFoodDeliveryResultsProps> = ({
  restaurants,
  searchQuery,
  city,
  favorites,
  onToggleFavorite,
  onViewDetails,
  onOrder
}) => {
  const { isGuest } = useGuestMode();
  
  // If no restaurants, don't render anything
  if (!restaurants || restaurants.length === 0) {
    return null;
  }
  
  // Get the top 3 restaurants
  const bestRestaurants = restaurants.slice(0, 3);
  
  // Calculate health score for a restaurant
  const calculateHealthScore = (restaurant: RestaurantResult): number => {
    let score = 70; // Base score
    
    // Adjust based on restaurant type
    if (restaurant.restaurant_type === 'veg') {
      score += 15;
    } else if (restaurant.restaurant_type === 'both') {
      score += 5;
    }
    
    // Adjust based on cuisine
    const healthyCuisines = ['salad', 'healthy', 'vegan', 'organic', 'mediterranean', 'japanese'];
    if (restaurant.cuisine && healthyCuisines.some(c => restaurant.cuisine.toLowerCase().includes(c))) {
      score += 10;
    }
    
    // Cap the score at 100
    return Math.min(100, score);
  };
  
  // Determine badges for each restaurant
  const getBadges = (restaurant: RestaurantResult, index: number) => {
    const badges = [];
    
    // Add a badge based on position
    if (index === 0) {
      badges.push({ icon: Award, text: 'Top Rated', color: 'bg-amber-500/90 text-white' });
    } else if (index === 1) {
      badges.push({ icon: Leaf, text: 'Healthiest', color: 'bg-green-500/90 text-white' });
    } else if (index === 2) {
      badges.push({ icon: Zap, text: 'Fastest Delivery', color: 'bg-blue-500/90 text-white' });
    }
    
    // Add additional badges based on restaurant properties
    if (restaurant.restaurant_type === 'veg') {
      badges.push({ icon: Leaf, text: 'Pure Veg', color: 'bg-green-500/90 text-white' });
    }
    
    if (restaurant.rating >= 4.5) {
      badges.push({ icon: Star, text: 'Highly Rated', color: 'bg-yellow-500/90 text-white' });
    }
    
    if (restaurant.distance_km !== undefined && restaurant.distance_km < 2) {
      badges.push({ icon: MapPin, text: 'Nearby', color: 'bg-purple-500/90 text-white' });
    }
    
    if (restaurant.delivery_time && restaurant.delivery_time.includes('20')) {
      badges.push({ icon: Clock, text: 'Fast Delivery', color: 'bg-blue-500/90 text-white' });
    }
    
    // Limit to max 2 badges
    return badges.slice(0, 2);
  };
  
  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
        <h2 className="text-xl font-semibold text-safebite-text">Best Restaurants for "{searchQuery}" in {city}</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bestRestaurants.map((restaurant, index) => {
          // Calculate health score
          const healthScore = calculateHealthScore(restaurant);
          
          // Get badges for this restaurant
          const badges = getBadges(restaurant, index);
          
          return (
            <Card 
              key={restaurant.restaurant} 
              className="sci-fi-card hover:border-orange-500/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl overflow-hidden"
            >
              {/* Restaurant Image */}
              <div className="relative h-52 overflow-hidden bg-safebite-card-bg-alt">
                <img
                  src={restaurant.image_url}
                  alt={restaurant.restaurant}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // Fallback image if the main one fails to load
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(restaurant.restaurant)}`;
                  }}
                />
                {/* Rating overlay */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center bg-amber-500/90 text-white px-2.5 py-1 rounded-full backdrop-blur-sm text-xs font-medium shadow-md">
                    <Star className="h-3.5 w-3.5 mr-1 fill-white" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                  </div>
                </div>
                {/* Favorite button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(restaurant.restaurant);
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full h-9 w-9 p-1.5 shadow-md"
                >
                  <Heart className={`h-4.5 w-4.5 ${favorites.includes(restaurant.restaurant) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                {/* Platform badge */}
                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
                  {restaurant.platform}
                </div>
                
                {/* Best match badge */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  {badges.map((badge, badgeIndex) => (
                    <Badge 
                      key={badgeIndex} 
                      className={`${badge.color} mb-1 flex items-center shadow-md`}
                    >
                      <badge.icon className="h-3.5 w-3.5 mr-1" />
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              </div>

              <CardContent className="flex-grow p-5">
                <h3 className="font-medium text-safebite-text mb-1.5 line-clamp-2 text-base">{restaurant.restaurant}</h3>
                <p className="text-safebite-text-secondary text-sm mb-3">{restaurant.cuisine}</p>

                {/* Restaurant details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-safebite-text-secondary" />
                      <span className="text-xs text-safebite-text-secondary">{restaurant.delivery_time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 text-safebite-text-secondary" />
                      <span className="text-xs text-safebite-text-secondary">
                        {restaurant.distance_km !== undefined ? `${restaurant.distance_km.toFixed(1)} km` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1.5 text-safebite-text-secondary" />
                    <span className="text-xs text-safebite-text-secondary">Health Score: </span>
                    <span className={`text-xs font-medium ml-1 ${getHealthScoreColor(healthScore)}`}>{healthScore}/100</span>
                  </div>
                </div>

                {/* Popular dishes */}
                {restaurant.popular_dishes && restaurant.popular_dishes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-safebite-text-secondary mb-1.5">Popular Dishes:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {restaurant.popular_dishes.slice(0, 3).map((dish, dishIndex) => (
                        <Badge key={dishIndex} variant="outline" className="text-xs bg-safebite-card-bg-alt/50 px-2 py-0.5">
                          {dish}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price range */}
                <div className="text-sm text-safebite-text font-medium">
                  {restaurant.price_range}
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-orange-500/30 hover:border-orange-500/60 text-safebite-text flex items-center justify-center gap-2"
                  onClick={() => onViewDetails(restaurant)}
                >
                  <Info className="h-4 w-4" />
                  Details
                </Button>
                <Button
                  className="bg-orange-500 text-white hover:bg-orange-600 flex items-center justify-center gap-2"
                  onClick={() => onOrder(restaurant)}
                >
                  <Utensils className="h-4 w-4" />
                  Order
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BestFoodDeliveryResults;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  Star,
  Clock,
  Heart,
  Info,
  AlertTriangle,
  Sparkles,
  MapPin,
  Utensils,
  Loader2,
  Zap,
  Award,
  Leaf
} from 'lucide-react';
import { RestaurantResult } from '@/services/foodDeliveryService';
import { useToast } from '@/hooks/use-toast';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getRestaurantInsights, AIRestaurantInsights } from '@/services/aiProductInsightsService';

interface AIRestaurantDetailProps {
  restaurant: RestaurantResult;
  onClose: () => void;
  onToggleFavorite?: (restaurantId: string) => void;
  isFavorite?: boolean;
}

const AIRestaurantDetail: React.FC<AIRestaurantDetailProps> = ({
  restaurant,
  onClose,
  onToggleFavorite,
  isFavorite = false
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [insights, setInsights] = useState<AIRestaurantInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extract restaurant details
  const restaurantName = restaurant.restaurant || 'Unknown Restaurant';
  const restaurantCuisine = restaurant.cuisine || 'Various';
  const restaurantRating = restaurant.rating || 4.0;
  const restaurantDeliveryTime = restaurant.delivery_time || '30-45 mins';
  const restaurantPriceRange = restaurant.price_range || '₹300 for two';
  const restaurantAddress = restaurant.address || '';
  const restaurantImage = restaurant.image_url || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(restaurantName)},restaurant`;
  const restaurantPlatform = restaurant.platform || '';
  const restaurantRedirect = restaurant.redirect || '';
  const restaurantDistance = restaurant.distance_km !== undefined ? `${restaurant.distance_km} km` : '';
  const restaurantPopularDishes = restaurant.popular_dishes || [];

  // Fetch AI insights when component mounts
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const restaurantInsights = await getRestaurantInsights(restaurant);
        setInsights(restaurantInsights);
      } catch (err) {
        console.error('Error fetching restaurant insights:', err);
        setError('Failed to load AI insights for this restaurant.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [restaurant]);

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(restaurantName);
    } else {
      // Track this interaction
      trackUserInteraction('toggle_favorite_restaurant', {
        isGuest,
        restaurantName,
        action: isFavorite ? 'remove' : 'add'
      });

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? `${restaurantName} removed from your favorites.` : `${restaurantName} added to your favorites.`,
      });
    }
  };

  // Handle order now
  const handleOrderNow = () => {
    // Track this interaction
    trackUserInteraction('order_from_restaurant', {
      isGuest,
      restaurantName,
      platform: restaurantPlatform
    });

    // Open the redirect URL if available
    if (restaurantRedirect) {
      // Use window.open with proper parameters
      window.open(restaurantRedirect, '_blank', 'noopener,noreferrer');

      toast({
        title: "Opening food delivery app",
        description: `Taking you to ${restaurantPlatform || 'the delivery platform'} to order from ${restaurantName}.`,
      });
    } else {
      // If no redirect URL, create a fallback search based on restaurant name and platform
      let fallbackUrl = '';

      if (restaurantPlatform === 'Swiggy') {
        fallbackUrl = `https://www.swiggy.com/search?query=${encodeURIComponent(restaurantName)}`;
      } else if (restaurantPlatform === 'Zomato') {
        fallbackUrl = `https://www.zomato.com/search?q=${encodeURIComponent(restaurantName)}`;
      } else {
        fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(restaurantName)}+food+delivery+order+online`;
      }

      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "Searching for restaurant",
        description: `Searching for ${restaurantName} on food delivery platforms.`,
      });
    }
  };

  return (
    <Card className="max-w-4xl mx-auto bg-safebite-card-bg border-safebite-teal/30 overflow-auto max-h-[90vh]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-safebite-text">{restaurantName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-safebite-text-secondary'}`} />
          </Button>
        </div>
        <div className="flex items-center text-sm text-safebite-text-secondary">
          <span>{restaurantCuisine}</span>
          {restaurantRating && (
            <>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500 text-yellow-500" />
                {typeof restaurantRating === 'number' ? restaurantRating.toFixed(1) : restaurantRating}
              </span>
            </>
          )}
          {restaurantPriceRange && (
            <>
              <span className="mx-2">•</span>
              <span>{restaurantPriceRange}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="menu">Menu Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Restaurant Image */}
              <div className="rounded-lg overflow-hidden bg-safebite-card-bg-alt h-64 flex items-center justify-center">
                <img
                  src={restaurantImage}
                  alt={restaurantName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://source.unsplash.com/random/300x300/?${encodeURIComponent(restaurantCuisine)},restaurant`;
                  }}
                />
              </div>

              {/* Restaurant Details */}
              <div className="flex flex-col justify-between">
                {/* Info Section */}
                <div className="mb-4">
                  {/* Delivery Info */}
                  <div className="flex items-center mt-2 text-sm text-safebite-text-secondary">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{restaurantDeliveryTime}</span>

                    {restaurantDistance && (
                      <>
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{restaurantDistance}</span>
                      </>
                    )}
                  </div>

                  {/* Platform Badge */}
                  <div className="mt-2">
                    {restaurantPlatform && (
                      <Badge className="bg-safebite-card-bg-alt text-safebite-text-secondary">
                        {restaurantPlatform}
                      </Badge>
                    )}

                    {restaurantCuisine && (
                      <Badge className="ml-2 bg-safebite-teal/10 text-safebite-teal border-safebite-teal/30">
                        {restaurantCuisine}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Address */}
                {restaurantAddress && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-safebite-text mb-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-safebite-teal" />
                      Address
                    </h3>
                    <p className="text-xs text-safebite-text-secondary">
                      {restaurantAddress}
                    </p>
                  </div>
                )}

                {/* Popular Dishes */}
                {restaurantPopularDishes.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-safebite-text mb-1 flex items-center">
                      <Award className="h-4 w-4 mr-1 text-amber-500" />
                      Popular Dishes
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {restaurantPopularDishes.map((dish, index) => (
                        <Badge key={index} variant="outline" className="bg-safebite-card-bg-alt/50 text-xs">
                          {dish}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Health Rating Preview */}
                {insights && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-safebite-text mb-1 flex items-center">
                      <Sparkles className="h-4 w-4 mr-1 text-safebite-teal" />
                      AI Health Rating
                    </h3>
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        insights.healthRating >= 7 ? 'bg-green-500/20 text-green-500' :
                        insights.healthRating >= 5 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {insights.healthRating}/10
                      </div>
                      <p className="ml-3 text-xs text-safebite-text-secondary">
                        {insights.healthRating >= 7 ? 'Excellent healthy options available' :
                         insights.healthRating >= 5 ? 'Some healthy choices possible' :
                         'Limited healthy options'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleOrderNow}
                    disabled={!restaurantRedirect}
                  >
                    <Utensils className="mr-2 h-4 w-4" />
                    Order Now
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-safebite-teal mb-4" />
                <p className="text-safebite-text-secondary">Analyzing restaurant with AI...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-safebite-text mb-1">Analysis Unavailable</h3>
                <p className="text-safebite-text-secondary">{error}</p>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                {/* Health Rating */}
                <Card className="border-safebite-teal/20 bg-safebite-card-bg-alt/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium text-safebite-text flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-safebite-teal" />
                      AI Health Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                        insights.healthRating >= 7 ? 'bg-green-500/20 text-green-500' :
                        insights.healthRating >= 5 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {insights.healthRating}/10
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-safebite-text">Health Rating</h4>
                        <p className="text-xs text-safebite-text-secondary">
                          {insights.healthRating >= 7 ? 'Excellent healthy options available' :
                           insights.healthRating >= 5 ? 'Some healthy choices possible' :
                           'Limited healthy options'}
                        </p>
                        <p className="text-xs text-safebite-text-secondary mt-1">
                          Avg. meal: ~{insights.averageCaloriesPerMeal} calories
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-safebite-text-secondary">
                      {insights.nutritionTips}
                    </p>
                  </CardContent>
                </Card>

                {/* Healthy Choices */}
                <div>
                  <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-green-500" />
                    Healthier Menu Choices
                  </h3>
                  <ul className="space-y-1.5">
                    {insights.healthyChoices.map((choice, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-sm text-safebite-text-secondary">{choice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dietary Options */}
                <div>
                  <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    Dietary Considerations
                  </h3>
                  <ul className="space-y-1.5">
                    {insights.dietaryOptions.map((option, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-sm text-safebite-text-secondary">{option}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Popular Dishes */}
                <div>
                  <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-amber-500" />
                    Popular Dishes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {insights.popularDishes.map((dish, index) => (
                      <Badge key={index} variant="outline" className="bg-safebite-card-bg-alt/50">
                        {dish}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <Card className="border-safebite-teal/20 bg-safebite-card-bg-alt/30">
                  <CardContent className="pt-4">
                    <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-safebite-teal" />
                      Best For
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {insights.bestFor.map((item, index) => (
                        <Badge key={index} className="bg-safebite-teal/10 text-safebite-teal border-safebite-teal/30">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Disclaimer */}
                <div className="text-xs text-safebite-text-secondary italic text-center pt-2">
                  AI-generated insights are for informational purposes only. Menu items and availability may vary.
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-safebite-text mb-1">No Insights Available</h3>
                <p className="text-safebite-text-secondary">We couldn't generate insights for this restaurant.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ordering Tips */}
              <Card className="border-safebite-teal/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium text-safebite-text">
                    Healthy Ordering Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-safebite-teal mr-2">•</span>
                      <span className="text-sm text-safebite-text-secondary">Ask for dressings and sauces on the side</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-safebite-teal mr-2">•</span>
                      <span className="text-sm text-safebite-text-secondary">Choose grilled over fried options</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-safebite-teal mr-2">•</span>
                      <span className="text-sm text-safebite-text-secondary">Request extra vegetables when possible</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-safebite-teal mr-2">•</span>
                      <span className="text-sm text-safebite-text-secondary">Consider sharing dishes to control portions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-safebite-teal mr-2">•</span>
                      <span className="text-sm text-safebite-text-secondary">Ask about cooking methods and ingredients</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Platform Info */}
              <div className="space-y-4">
                <Card className="border-safebite-teal/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium text-safebite-text">
                      Delivery Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-safebite-card-bg-alt">
                        <span className="text-sm text-safebite-text">Platform</span>
                        <span className="text-sm text-safebite-text-secondary">
                          {restaurantPlatform || 'Multiple platforms'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-safebite-card-bg-alt">
                        <span className="text-sm text-safebite-text">Delivery Time</span>
                        <span className="text-sm text-safebite-text-secondary">
                          {restaurantDeliveryTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-safebite-card-bg-alt">
                        <span className="text-sm text-safebite-text">Price Range</span>
                        <span className="text-sm text-safebite-text-secondary">
                          {restaurantPriceRange}
                        </span>
                      </div>
                      {restaurantDistance && (
                        <div className="flex justify-between items-center py-1 border-b border-safebite-card-bg-alt">
                          <span className="text-sm text-safebite-text">Distance</span>
                          <span className="text-sm text-safebite-text-secondary">
                            {restaurantDistance}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Button */}
                {restaurantRedirect && (
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleOrderNow}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Order on {restaurantPlatform || 'Delivery App'}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIRestaurantDetail;

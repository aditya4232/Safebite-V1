import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, Search, Heart, ArrowRight, Loader2, Tag, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useGuestMode } from '@/hooks/useGuestMode';
import { RestaurantResult } from '@/services/foodDeliveryService';

interface FoodDeliveryDashboardSectionProps {
  className?: string;
}

const FoodDeliveryDashboardSection: React.FC<FoodDeliveryDashboardSectionProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<{query: string, location: string}[]>([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<RestaurantResult[]>([]);
  const [liveOffers, setLiveOffers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth(app);
        if (!auth.currentUser || isGuest) {
          setIsLoading(false);
          return;
        }

        const db = getFirestore(app);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Get recent searches
          const searchHistory = userData.searchHistory || [];
          const foodDeliverySearches = searchHistory
            .filter((search: any) => search.type === 'food_delivery')
            .slice(0, 5)
            .map((search: any) => ({
              query: search.query,
              location: search.location || 'Hyderabad'
            }));
          
          setRecentSearches(foodDeliverySearches);
          
          // Get favorite restaurants
          const favoriteIds = userData.favoriteRestaurants || [];
          
          // For simplicity, we'll just create mock restaurant data based on the favorites
          // In a real app, you would fetch this data from your database
          if (favoriteIds.length > 0) {
            const mockRestaurants = favoriteIds.slice(0, 3).map((name: string, index: number) => ({
              restaurant: name,
              rating: 4.0 + (Math.random() * 0.9),
              delivery_time: `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} mins`,
              price_range: `₹${Math.floor(Math.random() * 300) + 200} for two`,
              cuisine: ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Fast Food'][Math.floor(Math.random() * 5)],
              platform: ['Swiggy', 'Zomato', 'EatSure', 'Uber Eats'][Math.floor(Math.random() * 4)],
              image_url: `https://source.unsplash.com/random/100x100/?restaurant,${encodeURIComponent(name)}`,
              restaurant_type: ['veg', 'non-veg', 'both'][Math.floor(Math.random() * 3)],
              health_score: Math.floor(Math.random() * 30) + 60,
              redirect: `https://www.google.com/search?q=${encodeURIComponent(name + ' restaurant')}`
            }));
            
            setFavoriteRestaurants(mockRestaurants);
          }
          
          // Generate some live offers
          generateLiveOffers(foodDeliverySearches.map(s => s.query));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isGuest]);
  
  // Generate live offers based on user's search history
  const generateLiveOffers = (searches: string[]) => {
    const platforms = ['Swiggy', 'Zomato', 'EatSure', 'Uber Eats'];
    const offerTypes = [
      '60% OFF up to ₹120',
      'FREE DELIVERY',
      'Buy 1 Get 1 Free',
      '40% OFF up to ₹100',
      '50% OFF on first order'
    ];
    
    const offers = [];
    
    // Generate offers based on search history
    if (searches.length > 0) {
      for (let i = 0; i < Math.min(3, searches.length); i++) {
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const offerType = offerTypes[Math.floor(Math.random() * offerTypes.length)];
        
        offers.push({
          platform,
          food: searches[i],
          offer: offerType,
          expiresIn: `${Math.floor(Math.random() * 24) + 1} hours`
        });
      }
    } else {
      // Default offers if no search history
      offers.push(
        {
          platform: 'Swiggy',
          food: 'Biryani',
          offer: '60% OFF up to ₹120',
          expiresIn: '12 hours'
        },
        {
          platform: 'Zomato',
          food: 'Pizza',
          offer: 'FREE DELIVERY',
          expiresIn: '6 hours'
        }
      );
    }
    
    setLiveOffers(offers);
  };
  
  // Handle search click
  const handleSearchClick = (query: string, location: string = 'Hyderabad') => {
    navigate(`/food-delivery?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };
  
  // Handle view all click
  const handleViewAllClick = () => {
    navigate('/food-delivery');
  };

  if (isLoading) {
    return (
      <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-orange-500" /> Food Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <Utensils className="mr-2 h-5 w-5 text-orange-500" /> Food Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="recent">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="recent">Recent Searches</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="offers">Live Offers</TabsTrigger>
          </TabsList>
          
          {/* Recent Searches Tab */}
          <TabsContent value="recent">
            {recentSearches.length > 0 ? (
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 rounded-md bg-safebite-card-bg-alt/30 hover:bg-safebite-card-bg-alt/50 transition-colors cursor-pointer"
                    onClick={() => handleSearchClick(search.query, search.location)}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-safebite-text">{search.query}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {search.location}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-safebite-text-secondary" />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-orange-500/30 hover:border-orange-500/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <Search className="mr-2 h-4 w-4 text-orange-500" />
                  Search Restaurants
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Search className="h-10 w-10 mx-auto text-orange-500/50 mb-2" />
                <p className="text-safebite-text-secondary mb-4">No recent searches found</p>
                <Button 
                  variant="outline" 
                  className="border-orange-500/30 hover:border-orange-500/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <Search className="mr-2 h-4 w-4 text-orange-500" />
                  Search Restaurants
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {favoriteRestaurants.length > 0 ? (
              <div className="space-y-3">
                {favoriteRestaurants.map((restaurant, index) => (
                  <div 
                    key={index} 
                    className="flex items-start justify-between p-2 rounded-md bg-safebite-card-bg-alt/30 hover:bg-safebite-card-bg-alt/50 transition-colors cursor-pointer"
                    onClick={() => handleSearchClick(restaurant.restaurant)}
                  >
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded overflow-hidden bg-safebite-card-bg-alt mr-3 flex-shrink-0">
                        <img 
                          src={restaurant.image_url} 
                          alt={restaurant.restaurant} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/40?text=${encodeURIComponent(restaurant.restaurant.charAt(0))}`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-safebite-text font-medium line-clamp-1">{restaurant.restaurant}</div>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs bg-safebite-card-bg-alt text-safebite-text-secondary mr-2 flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                            {restaurant.rating?.toFixed(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-safebite-card-bg-alt text-safebite-text-secondary flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {restaurant.delivery_time}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Heart className="h-4 w-4 text-red-500 fill-red-500 flex-shrink-0" />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-orange-500/30 hover:border-orange-500/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <Heart className="mr-2 h-4 w-4 text-red-500" />
                  View All Favorites
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="h-10 w-10 mx-auto text-safebite-text-secondary/50 mb-2" />
                <p className="text-safebite-text-secondary mb-4">No favorite restaurants found</p>
                <Button 
                  variant="outline" 
                  className="border-orange-500/30 hover:border-orange-500/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <Utensils className="mr-2 h-4 w-4 text-orange-500" />
                  Browse Restaurants
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Live Offers Tab */}
          <TabsContent value="offers">
            <div className="space-y-3">
              {liveOffers.map((offer, index) => (
                <div 
                  key={index} 
                  className="p-2 rounded-md bg-safebite-card-bg-alt/30 hover:bg-safebite-card-bg-alt/50 transition-colors cursor-pointer"
                  onClick={() => handleSearchClick(offer.food)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-orange-500/90 text-white border-0">
                      {offer.offer}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Expires in {offer.expiresIn}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-safebite-text ml-2">{offer.platform}</span>
                    <span className="mx-2 text-safebite-text-secondary">•</span>
                    <span className="text-safebite-text-secondary">{offer.food}</span>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2 border-orange-500/30 hover:border-orange-500/60 text-safebite-text"
                onClick={handleViewAllClick}
              >
                <Tag className="mr-2 h-4 w-4 text-orange-500" />
                View All Offers
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FoodDeliveryDashboardSection;

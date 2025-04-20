import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Search, Heart, ArrowRight, Loader2, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { useGuestMode } from '@/hooks/useGuestMode';
import { GroceryProduct } from '@/types/groceryTypes';
import { unifiedGrocerySearch } from '@/services/unifiedGroceryService';
import PlatformIcon from './PlatformIcons';

interface GroceryDashboardSectionProps {
  className?: string;
}

const GroceryDashboardSection: React.FC<GroceryDashboardSectionProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<GroceryProduct[]>([]);
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
          const grocerySearches = searchHistory
            .filter((search: any) => search.type === 'grocery_search')
            .slice(0, 5)
            .map((search: any) => search.query);
          
          setRecentSearches([...new Set(grocerySearches)]); // Remove duplicates
          
          // Get favorite product IDs
          const favoriteIds = userData.favoriteProducts || [];
          
          // Fetch favorite products data
          if (favoriteIds.length > 0) {
            // For simplicity, we'll just fetch the first 3 favorites
            // In a real app, you might want to store more product data in Firestore
            const productPromises = favoriteIds.slice(0, 3).map(async (id: string) => {
              // Try to fetch from MongoDB or use a mock product
              try {
                const results = await unifiedGrocerySearch(id.split('_')[0], false);
                return results.length > 0 ? results[0] : null;
              } catch (error) {
                console.error('Error fetching favorite product:', error);
                return null;
              }
            });
            
            const products = await Promise.all(productPromises);
            setFavoriteProducts(products.filter(Boolean) as GroceryProduct[]);
          }
          
          // Generate some live offers
          generateLiveOffers(grocerySearches);
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
    const platforms = ['Blinkit', 'Zepto', 'BigBasket', 'Instamart'];
    const offerTypes = [
      '20% OFF up to ₹100',
      '40% OFF up to ₹150',
      'Buy 1 Get 1 Free',
      'Free Delivery',
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
          product: searches[i],
          offer: offerType,
          expiresIn: `${Math.floor(Math.random() * 24) + 1} hours`
        });
      }
    } else {
      // Default offers if no search history
      offers.push(
        {
          platform: 'Blinkit',
          product: 'Fresh Fruits',
          offer: '20% OFF up to ₹100',
          expiresIn: '12 hours'
        },
        {
          platform: 'Zepto',
          product: 'Dairy Products',
          offer: '40% OFF up to ₹150',
          expiresIn: '6 hours'
        }
      );
    }
    
    setLiveOffers(offers);
  };
  
  // Handle search click
  const handleSearchClick = (query: string) => {
    navigate(`/grocery-products?query=${encodeURIComponent(query)}`);
  };
  
  // Handle view all click
  const handleViewAllClick = () => {
    navigate('/grocery-products');
  };
  
  // Handle view favorites click
  const handleViewFavoritesClick = () => {
    navigate('/grocery-products?favorites=true');
  };

  if (isLoading) {
    return (
      <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-safebite-teal" /> Grocery Products
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5 text-safebite-teal" /> Grocery Products
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
                    onClick={() => handleSearchClick(search)}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 mr-2 text-safebite-teal" />
                      <span className="text-safebite-text">{search}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-safebite-text-secondary" />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <Search className="mr-2 h-4 w-4 text-safebite-teal" />
                  Search Products
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Search className="h-10 w-10 mx-auto text-safebite-teal/50 mb-2" />
                <p className="text-safebite-text-secondary mb-4">No recent searches found</p>
                <Button 
                  variant="outline" 
                  className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <Search className="mr-2 h-4 w-4 text-safebite-teal" />
                  Search Products
                </Button>
              </div>
            )}
          </TabsContent>
          
          {/* Favorites Tab */}
          <TabsContent value="favorites">
            {favoriteProducts.length > 0 ? (
              <div className="space-y-3">
                {favoriteProducts.map((product, index) => (
                  <div 
                    key={index} 
                    className="flex items-start justify-between p-2 rounded-md bg-safebite-card-bg-alt/30 hover:bg-safebite-card-bg-alt/50 transition-colors cursor-pointer"
                    onClick={() => handleSearchClick(product.name)}
                  >
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded overflow-hidden bg-safebite-card-bg-alt mr-3 flex-shrink-0">
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/40?text=${encodeURIComponent(product.name.charAt(0))}`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-safebite-text font-medium line-clamp-1">{product.name}</div>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs bg-safebite-card-bg-alt text-safebite-text-secondary mr-2">
                            ₹{product.price}
                          </Badge>
                          {product.platform && (
                            <Badge variant="outline" className="text-xs flex items-center">
                              <PlatformIcon platform={product.platform} size="xs" />
                              <span className="ml-1">{product.platform}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Heart className="h-4 w-4 text-red-500 fill-red-500 flex-shrink-0" />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                  onClick={handleViewFavoritesClick}
                >
                  <Heart className="mr-2 h-4 w-4 text-red-500" />
                  View All Favorites
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="h-10 w-10 mx-auto text-safebite-text-secondary/50 mb-2" />
                <p className="text-safebite-text-secondary mb-4">No favorite products found</p>
                <Button 
                  variant="outline" 
                  className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                  onClick={handleViewAllClick}
                >
                  <ShoppingBag className="mr-2 h-4 w-4 text-safebite-teal" />
                  Browse Products
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
                  onClick={() => handleSearchClick(offer.product)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge className="bg-green-500/90 text-white border-0">
                      {offer.offer}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Expires in {offer.expiresIn}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-2">
                    <PlatformIcon platform={offer.platform} size="sm" />
                    <span className="text-safebite-text ml-2">{offer.platform}</span>
                    <span className="mx-2 text-safebite-text-secondary">•</span>
                    <span className="text-safebite-text-secondary">{offer.product}</span>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2 border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                onClick={handleViewAllClick}
              >
                <Tag className="mr-2 h-4 w-4 text-green-500" />
                View All Offers
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GroceryDashboardSection;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search, ShoppingBag, Star, Heart, AlertTriangle, Loader2,
  Tag, Info, ExternalLink, Filter, ArrowRight, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';
import groceryScrapingService, { GroceryProduct } from '@/services/groceryScrapingService';
import GroceryProductDetail from './GroceryProductDetail';
import HealthyAlternatives from './HealthyAlternatives';

interface SafeBiteScrapedProductsProps {
  searchQuery?: string;
  onProductSelect?: (product: GroceryProduct) => void;
}

const SafeBiteScrapedProducts: React.FC<SafeBiteScrapedProductsProps> = ({
  searchQuery = '',
  onProductSelect
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedProduct, setSelectedProduct] = useState<GroceryProduct | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showHealthyAlternatives, setShowHealthyAlternatives] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Sources for tabs
  const sources = [
    { id: 'all', name: 'All Sources' },
    { id: 'Blinkit', name: 'Blinkit' },
    { id: 'Zepto', name: 'Zepto' },
    { id: 'Instamart', name: 'Instamart' },
    { id: 'BigBasket', name: 'BigBasket' }
  ];

  // Initial search if query is provided
  useEffect(() => {
    if (searchQuery) {
      setLocalSearchQuery(searchQuery);
      handleSearch();
    }
  }, [searchQuery]);

  // Handle search
  const handleSearch = async () => {
    if (!localSearchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a product to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Track this interaction
      trackUserInteraction('safebite_scrape_search', { 
        isGuest, 
        query: localSearchQuery,
        source: activeTab
      });

      // Get products from scraping service
      const results = await groceryScrapingService.searchGroceryProducts(localSearchQuery);
      
      // Filter by source if not 'all'
      const filteredResults = activeTab === 'all' 
        ? results 
        : results.filter(product => product.source === activeTab);
      
      setProducts(filteredResults);
      
      if (filteredResults.length === 0) {
        toast({
          title: "No products found",
          description: `No products matching "${localSearchQuery}" found${activeTab !== 'all' ? ` from ${activeTab}` : ''}.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Products found",
          description: `Found ${filteredResults.length} products matching "${localSearchQuery}"${activeTab !== 'all' ? ` from ${activeTab}` : ''}.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: "Search error",
        description: "Failed to search for products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Filter existing results by new tab
    if (products.length > 0) {
      const filteredResults = value === 'all' 
        ? products 
        : products.filter(product => product.source === value);
      
      if (filteredResults.length === 0) {
        toast({
          title: "No products found",
          description: `No products from ${value} in current search results.`,
          variant: "default",
        });
      }
    }
  };

  // Handle product selection
  const handleProductSelect = (product: GroceryProduct) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
    
    // Track this interaction
    trackUserInteraction('view_scraped_product_details', { 
      isGuest, 
      productName: product.name,
      productSource: product.source
    });
    
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = (productId: string) => {
    if (isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save favorites.",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = favorites.includes(productId);
    const updatedFavorites = isFavorite
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(updatedFavorites);
    
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: `Product has been ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
      variant: "default",
    });
    
    // Track this interaction
    trackUserInteraction('toggle_favorite_scraped_product', { 
      isGuest, 
      productId,
      isFavorite: !isFavorite
    });
  };

  return (
    <div className="space-y-6">
      <Card className="sci-fi-card border-safebite-teal/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-safebite-text flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-safebite-teal" />
            SafeBite Scraping
            <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">AI-Powered</Badge>
          </CardTitle>
          <p className="text-safebite-text-secondary text-sm">
            Search across multiple grocery delivery services with AI-powered healthy alternatives
          </p>
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search for grocery products..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="sci-fi-input w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search All Sources
            </Button>
          </div>
          
          {/* Source Tabs */}
          <Tabs defaultValue="all" className="mb-6" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-5 mb-4">
              {sources.map(source => (
                <TabsTrigger key={source.id} value={source.id}>
                  {source.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* Products Grid */}
            {sources.map(source => (
              <TabsContent key={source.id} value={source.id}>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
                    <span className="ml-2 text-safebite-text">Searching products...</span>
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(source.id === 'all' 
                      ? products 
                      : products.filter(p => p.source === source.id)
                    ).map((product, index) => (
                      <Card 
                        key={`${product.name}-${index}`} 
                        className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl"
                      >
                        {/* Product Image */}
                        <div className="relative h-48 overflow-hidden rounded-t-lg bg-safebite-card-bg-alt">
                          <img
                            src={product.image_url || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(product.name)},grocery`}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              // Fallback image if the main one fails to load
                              (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`;
                            }}
                          />
                          {/* Rating overlay */}
                          {product.rating && (
                            <div className="absolute top-2 right-2">
                              <div className="flex items-center bg-safebite-teal/80 text-safebite-dark-blue px-2 py-1 rounded-full backdrop-blur-sm text-xs font-medium">
                                <Star className="h-3 w-3 mr-1 fill-safebite-dark-blue" />
                                <span>{product.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          )}
                          {/* Favorite button */}
                          <Button
                            onClick={() => handleToggleFavorite(product._id || `${product.name}-${index}`)}
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full h-8 w-8 p-1"
                          >
                            <Heart className={`h-4 w-4 ${favorites.includes(product._id || `${product.name}-${index}`) ? 'fill-safebite-teal text-safebite-teal' : ''}`} />
                          </Button>
                          {/* Source badge */}
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            {product.source}
                          </div>
                        </div>
                        
                        <CardContent className="flex-grow p-4">
                          <h3 className="font-medium text-safebite-text mb-1 line-clamp-2">{product.name}</h3>
                          {product.brand && (
                            <p className="text-safebite-text-secondary text-sm mb-2">{product.brand}</p>
                          )}
                          
                          {/* Price */}
                          <div className="flex items-center gap-2 mb-2">
                            {product.sale_price && (
                              <span className="text-safebite-teal font-medium">₹{product.sale_price}</span>
                            )}
                            {product.market_price && product.sale_price && product.market_price > product.sale_price && (
                              <span className="text-safebite-text-secondary line-through text-xs">₹{product.market_price}</span>
                            )}
                            {product.price && !product.sale_price && (
                              <span className="text-safebite-teal font-medium">₹{product.price}</span>
                            )}
                          </div>
                          
                          {/* Description */}
                          {product.description && (
                            <p className="text-safebite-text-secondary text-xs mt-2 line-clamp-2">{product.description}</p>
                          )}
                          
                          {/* Offers/Tags */}
                          {product.offers && product.offers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {product.offers.slice(0, 2).map((offer, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-safebite-card-bg-alt">
                                  <Tag className="h-3 w-3 mr-1 text-safebite-teal" />
                                  {offer}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="p-4 pt-0 flex gap-2">
                          <Button
                            className="flex-1 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex items-center justify-center"
                            onClick={() => handleProductSelect(product)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {product.redirect && (
                            <a
                              href={product.redirect}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium h-10 px-4"
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Buy
                            </a>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <AlertTriangle className="h-12 w-12 text-safebite-text-secondary mx-auto mb-4 opacity-70" />
                    <p className="text-safebite-text-secondary mb-2">No products found</p>
                    <p className="text-sm text-safebite-text-secondary">
                      {localSearchQuery 
                        ? `Try searching for a different product or check all sources.` 
                        : `Enter a search term to find products.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Product Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl bg-safebite-dark-blue border-safebite-teal/30 p-0">
          {selectedProduct && (
            <div className="space-y-6">
              <GroceryProductDetail
                product={selectedProduct}
                onClose={() => setIsDetailDialogOpen(false)}
              />
              
              {/* Toggle for Healthy Alternatives */}
              <div className="px-6 pb-6">
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-500 hover:bg-green-500/10"
                  onClick={() => setShowHealthyAlternatives(!showHealthyAlternatives)}
                >
                  {showHealthyAlternatives ? (
                    <>Hide Healthy Alternatives</>
                  ) : (
                    <>Show Healthy Alternatives</>
                  )}
                </Button>
                
                {/* Healthy Alternatives Section */}
                {showHealthyAlternatives && (
                  <div className="mt-4">
                    <HealthyAlternatives product={selectedProduct} />
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SafeBiteScrapedProducts;

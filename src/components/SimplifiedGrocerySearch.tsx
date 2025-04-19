import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search, ShoppingBag, Star, Heart, AlertTriangle, Loader2,
  Tag, Info, ExternalLink, Database, Globe, Clock, ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';
import { GroceryProduct } from '@/types/groceryTypes';
import { unifiedGrocerySearch, generateMockProducts } from '@/services/unifiedGroceryService';
import PlatformIcon, { PLATFORM_COLORS } from './PlatformIcons';
import AIGroceryProductDetail from './AIGroceryProductDetail';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { app } from '../firebase';

interface SimplifiedGrocerySearchProps {
  initialQuery?: string;
}

const SimplifiedGrocerySearch: React.FC<SimplifiedGrocerySearchProps> = ({
  initialQuery = '',
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [useScrapingAPI, setUseScrapingAPI] = useState(false);
  const [relatedOffers, setRelatedOffers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<GroceryProduct | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Load user favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const auth = getAuth(app);
        if (auth.currentUser && !isGuest) {
          const db = getFirestore(app);
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFavorites(userData.favoriteProducts || []);
          }
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, [isGuest]);

  // Handle search with improved error handling and more results
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a product to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Track this interaction
      trackUserInteraction('grocery_search', {
        isGuest,
        query: searchQuery,
        searchType: useScrapingAPI ? 'scraping' : 'mongodb'
      });

      // Try multiple search strategies in parallel for better results
      const searchPromises = [
        // Primary search with the user's query
        unifiedGrocerySearch(searchQuery, useScrapingAPI),

        // Secondary search with related terms (if query has multiple words)
        searchQuery.split(' ').length > 1 ?
          unifiedGrocerySearch(searchQuery.split(' ')[0], useScrapingAPI) :
          Promise.resolve([])
      ];

      // Wait for all search promises to complete
      const [primaryResults, secondaryResults] = await Promise.all(searchPromises);

      // Combine and deduplicate results
      const combinedResults = [...primaryResults];

      // Add secondary results that aren't duplicates
      if (secondaryResults.length > 0) {
        const primaryIds = new Set(primaryResults.map(p => p._id));
        secondaryResults.forEach(product => {
          if (!primaryIds.has(product._id)) {
            combinedResults.push(product);
          }
        });
      }

      if (combinedResults.length > 0) {
        // Sort results by relevance (exact matches first, then by price)
        const sortedResults = combinedResults.sort((a, b) => {
          // Exact name matches first
          const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
          const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());

          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;

          // Then sort by price (lowest first)
          return (a.price || 999) - (b.price || 999);
        });

        setProducts(sortedResults);
        generateRelatedOffers(sortedResults);

        toast({
          title: "Products found",
          description: `Found ${sortedResults.length} products matching "${searchQuery}".`,
          variant: "default",
        });
      } else {
        // If no results, use enhanced mock data
        const mockProducts = generateMockProducts(searchQuery, useScrapingAPI ? 'Scraping' : 'MongoDB');

        // Add more variety to mock products
        const enhancedMockProducts = [
          ...mockProducts,
          ...generateMockProducts(searchQuery + ' premium', useScrapingAPI ? 'Scraping' : 'MongoDB'),
          ...generateMockProducts(searchQuery + ' organic', useScrapingAPI ? 'Scraping' : 'MongoDB')
        ];

        // Deduplicate
        const uniqueProducts = Array.from(new Map(enhancedMockProducts.map(item => [item._id, item])).values());

        setProducts(uniqueProducts);
        generateRelatedOffers(uniqueProducts);

        toast({
          title: "Using sample data",
          description: `Showing sample products for "${searchQuery}".`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Failed to retrieve grocery products. The API may be experiencing issues. Showing sample data instead.');

      // Fallback to enhanced mock data
      const mockProducts = generateMockProducts(searchQuery, useScrapingAPI ? 'Scraping' : 'MongoDB');

      // Add more variety to mock products for better fallback experience
      const enhancedMockProducts = [
        ...mockProducts,
        ...generateMockProducts(searchQuery + ' fresh', useScrapingAPI ? 'Scraping' : 'MongoDB'),
        ...generateMockProducts(searchQuery + ' best', useScrapingAPI ? 'Scraping' : 'MongoDB')
      ];

      // Deduplicate
      const uniqueProducts = Array.from(new Map(enhancedMockProducts.map(item => [item._id, item])).values());

      setProducts(uniqueProducts);
      generateRelatedOffers(uniqueProducts);

      toast({
        title: "Using sample data",
        description: "Showing sample products due to API connection issues.",
        variant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // We're now using the unified service's generateMockProducts function

  // Generate related offers based on search results with more detailed offers
  const generateRelatedOffers = (products: GroceryProduct[]) => {
    // Extract categories and brands from products
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const platforms = [...new Set(products.map(p => p.platform || p.source).filter(Boolean))];

    const offers = [
      {
        title: `Special Deals on ${searchQuery}`,
        description: `Limited time offers on ${searchQuery} products with free delivery`,
        discount: '15% OFF',
        code: `${searchQuery.toUpperCase().substring(0, 4)}15`,
        expiresIn: '2 days',
        platform: platforms[0] || 'All Platforms'
      }
    ];

    // Add category-based offers
    if (categories.length > 0) {
      offers.push({
        title: `${categories[0]} Sale`,
        description: `Save big on all ${categories[0]} products with additional cashback`,
        discount: '10% OFF + 5% Cashback',
        code: `${categories[0].toUpperCase().substring(0, 4)}10`,
        expiresIn: '3 days',
        platform: platforms.length > 1 ? platforms[1] : (platforms[0] || 'All Platforms')
      });
    }

    // Add brand-based offers
    if (brands.length > 0) {
      offers.push({
        title: `${brands[0]} Special`,
        description: `Exclusive deals on ${brands[0]} products with combo offers`,
        discount: 'Buy 1 Get 1 Free',
        code: `${brands[0].toUpperCase().substring(0, 4)}BOGO`,
        expiresIn: '5 days',
        platform: platforms.length > 2 ? platforms[2] : (platforms[0] || 'All Platforms')
      });
    }

    // Add platform-specific offers
    if (platforms.length > 0) {
      const platformNames = ['Blinkit', 'Zepto', 'BigBasket', 'Instamart'];

      // Find which platforms we have in our results
      const matchedPlatforms = platformNames.filter(p =>
        platforms.some(platform => platform.toLowerCase().includes(p.toLowerCase()))
      );

      // If we have matching platforms, add specific offers
      if (matchedPlatforms.length > 0) {
        matchedPlatforms.forEach(platform => {
          offers.push({
            title: `${platform} ${searchQuery} Flash Sale`,
            description: `Next 3 hours only: Get ${searchQuery} products at special prices on ${platform}`,
            discount: '30% OFF up to ₹150',
            code: `${platform.toUpperCase().substring(0, 3)}${searchQuery.toUpperCase().substring(0, 3)}30`,
            expiresIn: '3 hours',
            platform: platform,
            isFlashSale: true
          });
        });
      }
    }

    setRelatedOffers(offers);
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (productId: string) => {
    try {
      const auth = getAuth(app);
      if (!auth.currentUser || isGuest) {
        toast({
          title: "Authentication required",
          description: "Please log in to save favorites.",
          variant: "destructive",
        });
        return;
      }

      const db = getFirestore(app);
      const userRef = doc(db, 'users', auth.currentUser.uid);

      // Check if product is already in favorites
      const isFavorite = favorites.includes(productId);

      if (isFavorite) {
        // Remove from favorites
        await setDoc(userRef, {
          favoriteProducts: arrayRemove(productId)
        }, { merge: true });

        setFavorites(favorites.filter(id => id !== productId));

        toast({
          title: "Removed from favorites",
          description: "Product removed from your favorites.",
          variant: "default",
        });
      } else {
        // Add to favorites
        await setDoc(userRef, {
          favoriteProducts: arrayUnion(productId)
        }, { merge: true });

        setFavorites([...favorites, productId]);

        toast({
          title: "Added to favorites",
          description: "Product added to your favorites.",
          variant: "default",
        });
      }

      // Track this interaction
      trackUserInteraction('toggle_favorite', {
        isGuest,
        productId,
        action: isFavorite ? 'remove' : 'add'
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

  // Handle buy now
  const handleBuyNow = (product: GroceryProduct) => {
    // Track this interaction
    trackUserInteraction('buy_grocery_product', {
      isGuest,
      productName: product.name,
      productSource: product.source
    });

    // Create a fallback Google Shopping search URL that will definitely work
    const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(product.name)}+${encodeURIComponent(product.brand || '')}+buy+online&tbm=shop`;

    try {
      // Try to open the redirect URL if available
      if (product.redirect) {
        // Use window.open with proper parameters
        window.open(product.redirect, '_blank', 'noopener,noreferrer');

        toast({
          title: "Opening Store",
          description: `Taking you to ${product.source} to purchase ${product.name}.`,
        });
      } else {
        // If no redirect URL, use the fallback Google Shopping search
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');

        toast({
          title: "Searching for product",
          description: `Searching online stores for ${product.name}.`,
        });
      }
    } catch (error) {
      console.error('Error opening redirect URL:', error);

      // If there's an error with the redirect URL, use the fallback
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "Using alternative search",
        description: `Searching online stores for ${product.name}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="sci-fi-card border-safebite-teal/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-safebite-text flex items-center">
            <Search className="mr-2 h-5 w-5 text-safebite-teal" />
            Grocery Product Search
            <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">Enhanced</Badge>
          </CardTitle>
          <p className="text-safebite-text-secondary text-sm">
            Search for grocery products using our database or live sources
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {/* Search Bar with Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className={`h-5 w-5 ${!useScrapingAPI ? 'text-safebite-teal' : 'text-safebite-text-secondary'}`} />
                <Switch
                  checked={useScrapingAPI}
                  onCheckedChange={setUseScrapingAPI}
                  id="search-mode"
                />
                <Globe className={`h-5 w-5 ${useScrapingAPI ? 'text-safebite-teal' : 'text-safebite-text-secondary'}`} />
              </div>
              <Label htmlFor="search-mode" className="text-sm text-safebite-text-secondary">
                {useScrapingAPI ? 'Live Scraping' : 'MongoDB Search'}
              </Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search grocery products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                className={useScrapingAPI
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-safebite-text font-medium">API Connection Issue</p>
                  <p className="text-safebite-text-secondary text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['All Products', 'Bakery & Dairy', 'Beverages', 'Snacks', 'Fruits & Vegetables'].map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className={index === 0 ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                onClick={() => {
                  // Set search query based on category
                  if (index > 0) {
                    setSearchQuery(category);
                    handleSearch();
                  }
                }}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex justify-center items-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
            <span className="ml-2 text-safebite-text">Searching products...</span>
          </div>

          {/* Skeleton loading state */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="sci-fi-card border-safebite-teal/30 flex flex-col h-full shadow-lg animate-pulse">
                {/* Skeleton Image */}
                <div className="h-48 bg-safebite-card-bg-alt/50 rounded-t-lg"></div>

                {/* Skeleton Content */}
                <CardContent className="flex-1 flex flex-col p-4 space-y-3">
                  <div className="h-5 bg-safebite-card-bg-alt/50 rounded w-3/4"></div>
                  <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-1/2"></div>
                  <div className="h-6 bg-safebite-card-bg-alt/50 rounded w-1/3"></div>
                  <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-full"></div>
                  <div className="h-4 bg-safebite-card-bg-alt/50 rounded w-5/6"></div>
                  <div className="mt-auto pt-2 flex gap-2">
                    <div className="h-9 bg-safebite-card-bg-alt/50 rounded flex-1"></div>
                    <div className="h-9 bg-safebite-card-bg-alt/50 rounded flex-1"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-6">
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <Card
                key={`${product._id}-${index}`}
                className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`;
                    }}
                  />

                  {/* Favorite button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white rounded-full p-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product._id);
                    }}
                  >
                    <Heart
                      className={`h-5 w-5 ${favorites.includes(product._id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                    />
                  </Button>

                  {/* Source badge */}
                  <div className="absolute bottom-2 left-2 bg-safebite-teal/80 text-safebite-dark-blue text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center">
                    {useScrapingAPI ? (
                      <PlatformIcon platform={product.platform || product.source} size="sm" />
                    ) : (
                      <Database className="h-3 w-3 mr-1" />
                    )}
                    {product.platform || product.source}
                  </div>

                  {/* Price badge */}
                  {product.price > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      ₹{product.sale_price || product.price}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <CardContent className="flex-1 flex flex-col p-4">
                  <h3 className="font-semibold text-safebite-text line-clamp-2 mb-1">{product.name}</h3>

                  {product.brand && (
                    <p className="text-safebite-text-secondary text-sm mb-2">{product.brand}</p>
                  )}

                  {product.category && (
                    <Badge variant="outline" className="self-start mb-2">
                      <Tag className="h-3 w-3 mr-1" />
                      {product.category}
                    </Badge>
                  )}

                  {/* Offers */}
                  {product.offers && product.offers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 mb-2">
                      {product.offers.slice(0, 2).map((offer, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-safebite-card-bg-alt text-safebite-teal">
                          <Tag className="h-3 w-3 mr-1" />
                          {offer}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {product.description && (
                    <p className="text-safebite-text-secondary text-sm line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto pt-2 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                      onClick={() => {
                        // Open AI-powered product details
                        setSelectedProduct(product);
                        setIsDetailOpen(true);

                        // Track this interaction
                        trackUserInteraction('view_product_details', {
                          productName: product.name,
                          productId: product._id,
                          source: product.source,
                          isGuest
                        });
                      }}
                    >
                      <Info className="mr-2 h-4 w-4 text-safebite-teal" />
                      Details
                    </Button>
                    <Button
                      className="flex-1 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                      onClick={() => handleBuyNow(product)}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Related Offers - Enhanced with platform-specific styling */}
          {relatedOffers.length > 0 && (
            <Card className="sci-fi-card border-orange-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-safebite-text flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-orange-500" />
                  Related Offers
                  <Badge className="ml-2 bg-safebite-teal/20 text-safebite-teal border-safebite-teal/30">
                    Based on your search
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedOffers.map((offer, index) => {
                    // Determine platform-specific styling
                    const platformKey = (offer.platform || '').toLowerCase();
                    const platformColor = platformKey.includes('blinkit') ? '#F9D923' :
                                          platformKey.includes('zepto') ? '#8C52FF' :
                                          platformKey.includes('bigbasket') ? '#84C225' :
                                          platformKey.includes('instamart') ? '#FC8019' : '#FF6B6B';

                    return (
                      <Card
                        key={index}
                        className="bg-safebite-card-bg-alt/30 hover:shadow-lg transition-all overflow-hidden"
                        style={{ borderColor: `${platformColor}40` }}
                      >
                        {/* Platform header */}
                        <div
                          className="px-3 py-1.5 flex items-center"
                          style={{ backgroundColor: `${platformColor}20` }}
                        >
                          {offer.platform && (
                            <PlatformIcon platform={offer.platform} size="sm" />
                          )}
                          <span className="text-sm font-medium">{offer.platform || 'All Platforms'}</span>

                          {offer.isFlashSale && (
                            <Badge className="ml-auto bg-red-500/90 text-white border-0 animate-pulse">
                              Flash Sale
                            </Badge>
                          )}
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-medium text-safebite-text mb-1">{offer.title}</h3>
                          <p className="text-safebite-text-secondary text-sm mb-2">{offer.description}</p>

                          <div className="flex justify-between items-center">
                            <Badge
                              className="bg-green-500/90 text-white border-0"
                            >
                              {offer.discount}
                            </Badge>
                            <span className="text-xs text-safebite-text-secondary flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Expires in {offer.expiresIn}
                            </span>
                          </div>

                          {offer.code && (
                            <div className="mt-3 p-2 bg-safebite-card-bg rounded border border-safebite-border">
                              <div className="flex items-center">
                                <span className="text-xs text-safebite-text-secondary mr-2">Code:</span>
                                <code className="px-2 py-1 bg-black/20 rounded text-xs font-bold">{offer.code}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto text-xs h-7 px-2"
                                  onClick={() => {
                                    navigator.clipboard.writeText(offer.code);
                                    toast({
                                      title: "Code Copied",
                                      description: `${offer.code} copied to clipboard`,
                                      variant: "default",
                                    });
                                  }}
                                >
                                  Copy
                                </Button>
                              </div>
                              <Button
                                className="w-full mt-2 text-sm"
                                style={{
                                  backgroundColor: platformColor,
                                  color: platformColor === '#F9D923' ? 'black' : 'white'
                                }}
                                onClick={() => {
                                  // Copy code and open platform website
                                  navigator.clipboard.writeText(offer.code);
                                  window.open(`https://www.google.com/search?q=${encodeURIComponent(offer.platform + ' ' + searchQuery)}`, '_blank');
                                  toast({
                                    title: "Code Copied",
                                    description: `${offer.code} copied and opening ${offer.platform}`,
                                    variant: "default",
                                  });
                                }}
                              >
                                Use Offer
                                <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-safebite-card-bg-alt rounded-lg bg-safebite-card-bg-alt/10">
          {searchQuery ? (
            <>
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-medium text-safebite-text mb-2">No Products Found</h3>
              <p className="text-safebite-text-secondary max-w-md mx-auto mb-4">
                No products matching "{searchQuery}" found. Try a different search term or switch search method.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {['apple', 'milk', 'bread', 'rice', 'chicken'].map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch();
                    }}
                  >
                    Try "{suggestion}"
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <>
              <Search className="h-12 w-12 mx-auto text-safebite-teal mb-4" />
              <h3 className="text-lg font-medium text-safebite-text mb-2">Ready to Search</h3>
              <p className="text-safebite-text-secondary max-w-md mx-auto mb-4">
                Enter a search term above to find grocery products. You can search for specific items, brands, or categories.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {['apple', 'milk', 'bread', 'rice', 'chicken'].map(suggestion => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      handleSearch();
                    }}
                  >
                    Try "{suggestion}"
                  </Button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* AI Product Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          {selectedProduct && (
            <AIGroceryProductDetail
              product={selectedProduct}
              onClose={() => setIsDetailOpen(false)}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(selectedProduct._id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimplifiedGrocerySearch;

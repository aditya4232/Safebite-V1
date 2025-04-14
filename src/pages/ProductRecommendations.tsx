import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';
import {
  Search, Filter, ShoppingCart, Star, Heart, Sparkles,
  ArrowUpDown, Tag, Clock, Loader2, Utensils, Apple,
  AlertTriangle, CheckCircle, Info, Bookmark, Pizza,
  ShoppingBag, ChevronRight, Zap, ExternalLink
} from 'lucide-react';
import Footer from '@/components/Footer';
import LoginPrompt, { LoginPromptProps } from '@/components/LoginPrompt';
import GeminiProductRecommendations, { GeminiProductRecommendationsProps } from '@/components/GeminiProductRecommendations';
import { trackUserInteraction } from '@/services/mlService';
import ApiStatus from '@/components/ApiStatus';
import CompactApiStatus, { CompactApiStatusProps } from '@/components/CompactApiStatus';
import Pagination from '@/components/Pagination';
import RecipeSearch from '@/components/RecipeSearch';
import { API_BASE_URL, fetchProductsWithFallback, FALLBACK_PRODUCTS } from '@/utils/apiUtils';


interface Product {
  _id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  ingredients: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  allergens: string[];
  dietaryInfo: string[];
  healthScore: number;
  imageUrl: string;
  price?: number;
  tags: string[];
}

interface GeminiProductRecommendationsProps {
  userPreferences: string[];
}

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

interface CompactApiStatusProps {
  apiAvailable: boolean;
  onApiStatusChange: (status: boolean) => void;
}

const ProductRecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('healthScore');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  // Grocery products state
  const [groceryProducts, setGroceryProducts] = useState<Product[]>([]);
  const [isLoadingGrocery, setIsLoadingGrocery] = useState(true);
  const [grocerySearchQuery, setGrocerySearchQuery] = useState('');
  const [groceryCategory, setGroceryCategory] = useState('all');
  const [groceryPage, setGroceryPage] = useState(1);
  const [groceryTotalPages, setGroceryTotalPages] = useState(1);
  const [groceryTotalProducts, setGroceryTotalProducts] = useState(0);

  // User state
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptFeature, setLoginPromptFeature] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  // Active tab state
  const [activeTab, setActiveTab] = useState('products');

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'grains', name: 'Grains & Cereals' },
    { id: 'protein', name: 'Protein Foods' },
    { id: 'fruits', name: 'Fruits & Vegetables' },
  ];

  // Function to show login prompt for guest users
  const showLoginPromptForFeature = useCallback((feature: string) => {
    if (isGuest) {
      setLoginPromptFeature(feature);
      setShowLoginPrompt(true);
      return true; // Prompt was shown
    }
    return false; // No prompt needed
  }, [isGuest, setLoginPromptFeature, setShowLoginPrompt]);

  // Fetch user preferences from Firebase
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (auth.currentUser && !isGuest) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Get dietary preferences
            const dietaryPrefs = userData.dietary_preferences || userData.dietaryPreferences || [];
            // Get health goals
            const healthGoals = userData.health_goals || userData.healthGoals || '';
            // Get allergens
            const allergens = userData.allergens || [];

            // Combine all preferences
            const allPreferences = [
              ...(Array.isArray(dietaryPrefs) ? dietaryPrefs : [dietaryPrefs]),
              healthGoals,
              ...allergens
            ].filter(Boolean);

            setUserPreferences(allPreferences);

            // Get favorites
            const userFavorites = userData.favoriteProducts || [];
            setFavorites(userFavorites);
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    fetchUserPreferences();
  }, [auth, db, isGuest]);

  // State for API status
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Function to fetch products from backend
  const fetchProductsData = async (page: number = 1, search: string = '') => {
    setIsLoading(true);
    try {
      // Track this interaction
      trackUserInteraction('product_page_view', { isGuest, page, search });

      // Force a direct dataset call
      try {
        console.log(`Directly fetching from dataset: ${API_BASE_URL}/dataset/products`);

        // Use a longer timeout for the initial load
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Build the query URL with pagination and search parameters
        let url = `${API_BASE_URL}/dataset/products?page=${page}&limit=${productsPerPage}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Dataset returned status ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Dataset response:', responseData);

        // Handle different response formats
        let formattedData;
        if (Array.isArray(responseData)) {
          // If the dataset returns an array, format it
          formattedData = {
            products: responseData,
            total: responseData.length,
            page: page,
            totalPages: Math.ceil(responseData.length / productsPerPage)
          };
        } else if (responseData.products && Array.isArray(responseData.products)) {
          // If the dataset returns an object with a products array
          formattedData = {
            products: responseData.products,
            total: responseData.total || responseData.products.length,
            page: responseData.page || page,
            totalPages: responseData.totalPages || Math.ceil((responseData.total || responseData.products.length) / productsPerPage)
          };
        } else {
          throw new Error('Invalid response format from dataset');
        }

        // Update state with the dataset data
        setProducts(formattedData.products);
        setFilteredProducts(formattedData.products);
        setCurrentPage(formattedData.page);
        setTotalPages(formattedData.totalPages);
        setTotalProducts(formattedData.total);
        setApiAvailable(true);

        console.log('Successfully loaded products from dataset');
        return formattedData;
      } catch (error) {
        console.error('Direct dataset call failed:', error);
        setApiAvailable(false);
        toast({
          title: 'Dataset Unavailable',
          description: 'Could not connect to the product dataset.',
          variant: 'destructive',
        });
        setProducts([]);
        setFilteredProducts([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalProducts(0);
        return { products: [], total: 0, page: 1, totalPages: 1 };
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setApiAvailable(false);
      toast({
        title: 'Dataset Unavailable',
        description: 'Could not connect to the product dataset.',
        variant: 'destructive',
      });
      setProducts([]);
      setFilteredProducts([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalProducts(0);
      return { products: [], total: 0, page: 1, totalPages: 1 };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch grocery products
  const fetchGroceryProducts = async (page = 1, search = '') => {
    setIsLoadingGrocery(true);
    try {
      // Track this interaction
      trackUserInteraction('grocery_page_view', { isGuest, page, search });

      // Create fallback data with pagination (using a subset of FALLBACK_PRODUCTS as grocery items)
      const groceryFallbackData = {
        products: FALLBACK_PRODUCTS.slice(0, 4),
        total: 4,
        page: page,
        totalPages: 1
      };

      // Force a direct API call without checking status first
      try {
        console.log(`Directly fetching from dataset: ${API_BASE_URL}/dataset/groceryProducts`);

        // Use a longer timeout for the initial load
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Build the query URL with pagination and search parameters
        let url = `${API_BASE_URL}/dataset/groceryProducts?page=${page}&limit=${productsPerPage}`;
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Grocery API response:', responseData);

        // Handle different response formats
        let formattedData;
        if (Array.isArray(responseData)) {
          // If the API returns an array, format it
          formattedData = {
            products: responseData,
            total: responseData.length,
            page: page,
            totalPages: Math.ceil(responseData.length / productsPerPage)
          };
        } else if (responseData.products && Array.isArray(responseData.products)) {
          // If the API returns an object with a products array
          formattedData = {
            products: responseData.products,
            total: responseData.total || responseData.products.length,
            page: responseData.page || page,
            totalPages: responseData.totalPages || Math.ceil((responseData.total || responseData.products.length) / productsPerPage)
          };
        } else {
          throw new Error('Invalid response format from API');
        }

        // Update state with the API data
        setGroceryProducts(formattedData.products);
        setGroceryPage(formattedData.page);
        setGroceryTotalPages(formattedData.totalPages);
        setGroceryTotalProducts(formattedData.total);
        setApiAvailable(true);

        console.log('Successfully loaded grocery products from API');
        return formattedData;
      } catch (apiError) {
        console.error('Direct grocery API call failed:', apiError);

        // Fall back to the utility function
        console.log('Falling back to utility function with status check');
        const data = await fetchProductsWithFallback(
          'groceryProducts',
          page,
          productsPerPage,
          search,
          groceryFallbackData
        );

        // Update state based on result
        setGroceryProducts(data.products);
        setGroceryPage(data.page);
        setGroceryTotalPages(data.totalPages);
        setGroceryTotalProducts(data.total);

        return data;
      }
    } catch (error) {
      console.error('Error fetching grocery products:', error);

      // Use fallback data
      const groceryFallbackData = FALLBACK_PRODUCTS.slice(0, 4);
      setGroceryProducts(groceryFallbackData);
      setGroceryPage(1);
      setGroceryTotalPages(1);
      setGroceryTotalProducts(4);

      return {
        products: groceryFallbackData,
        total: 4,
        page: 1,
        totalPages: 1
      };
    } finally {
      setIsLoadingGrocery(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchGroceryProducts(1, grocerySearchQuery);
  }, []);

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'grocery') {
      fetchGroceryProducts(1, grocerySearchQuery);
    }
  }, [activeTab, grocerySearchQuery]);

  // Handle API status change
  const handleApiStatusChange = (status: boolean) => {
    setApiAvailable(status);
  };

  // Handle search for grocery products
  const handleGrocerySearch = () => {
    fetchGroceryProducts(1, grocerySearchQuery);
  };

  // Handle category change
  useEffect(() => {
    if (selectedCategory === 'all') {
      // If 'all' is selected, just use the products from the API
      setFilteredProducts(products);
    } else {
      // Otherwise, filter the products by category
      const filtered = products.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products, setFilteredProducts]);

  // Handle sort by change
  useEffect(() => {
    let result = [...filteredProducts];
    result.sort((a, b) => {
      switch (sortBy) {
        case 'healthScore':
          return b.healthScore - a.healthScore;
        case 'price':
          return a.price ? (b.price ? b.price - a.price : -1) : 1;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
    setFilteredProducts(result);
  }, [sortBy, filteredProducts, setFilteredProducts]);

  // Handle toggle favorite
  const handleToggleFavorite = async (productId: string) => {
    if (showLoginPromptForFeature('favorites')) return;

    try {
      const updatedFavorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];

      setFavorites(updatedFavorites);
      // Update Firebase
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { favoriteProducts: updatedFavorites });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Could not update favorites.',
        variant: 'destructive',
      });
    }
  };

  // Function to get personalized health score
  const getPersonalizedScore = (product: Product) => {
    let score = product.healthScore;

    userPreferences.forEach(pref => {
      if (product.dietaryInfo.includes(pref) || product.allergens.includes(pref)) {
        score -= 5; // Reduce score if dietary restrictions or allergens are present
      }
      if (product.tags.includes(pref)) {
        score += 5; // Increase score if tags match user preferences
      }
    });

    return score;
  };

  return (
    <div className="flex min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-8 flex justify-between items-start">
          {isLoading ? (
            <Loader2 className="animate-spin h-8 w-8 text-white" />
          ) : (
            <>
              <CompactApiStatus apiAvailable={apiAvailable} onApiStatusChange={handleApiStatusChange} />
              <div className="relative flex-grow">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleProductSearch}
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          <Tabs defaultValue="grocery" className="mb-8">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="grocery" className="flex items-center">
                <Apple className="h-4 w-4 mr-2" /> Grocery Products
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center">
                <Utensils className="h-4 w-4 mr-2" /> Recipes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipes">
              <div className="grid grid-cols-1 gap-6 mb-6">
                <GeminiProductRecommendations userPreferences={userPreferences}/>
              </div>
            </TabsContent>
            <TabsContent value="grocery">
              <div className="mb-6">
                <select
                  value={groceryCategory}
                  onChange={(e) => setGroceryCategory(e.target.value)}
                  className="w-full p-2 mb-4 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-md text-safebite-text"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Search grocery products..."
                      value={grocerySearchQuery}
                      onChange={(e) => setGrocerySearchQuery(e.target.value)}
                      className="sci-fi-input w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleGrocerySearch}
                      className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex-shrink-0"
                      disabled={isLoadingGrocery}
                    >
                      {isLoadingGrocery ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
                      Search
                    </Button>
                  </div>
                </div>
              </div>

              {isLoadingGrocery ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
                  <span className="ml-2 text-safebite-text">Loading grocery products...</span>
                </div>
              ) : groceryProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groceryProducts.map((product) => (
                    <Card key={product._id} className="sci-fi-card overflow-hidden flex flex-col h-full hover:shadow-neon-teal transition-all duration-300">
                      <div className="relative h-48 overflow-hidden bg-safebite-card-bg-alt">
                        <img
                          src={product.imageUrl || `https://source.unsplash.com/random/400x300/?${encodeURIComponent(product.name || 'food')},food`}
                          alt={product.name}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Fallback image if the main one fails to load
                            const productName = product.name || 'Food Product';
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(productName)}`;
                          }}
                        />
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(product._id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white"
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(product._id) ? 'fill-safebite-teal text-safebite-teal' : ''}`} />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                          {product.category}
                        </div>
                      </div>
                      <CardContent className="flex-grow p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-safebite-text">{product.name}</h3>
                          <div className="flex items-center bg-safebite-teal/10 text-safebite-teal px-1.5 py-0.5 rounded text-xs">
                            <Star className="h-3 w-3 mr-0.5 fill-safebite-teal" />
                            <span>{product.healthScore?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>
                        <p className="text-safebite-text-secondary text-sm mb-2">{product.brand}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags?.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-safebite-card-bg-alt">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                          onClick={() => {
                            // Handle view details
                            trackUserInteraction('view_grocery_details', { productId: product._id, productName: product.name });
                          }}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="sci-fi-card mb-4">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-safebite-text-secondary mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-safebite-text mb-2">No Grocery Products Found</h3>
                    <p className="text-safebite-text-secondary mb-4">
                      No grocery products match your search criteria. Try adjusting your filters or search terms.
                    </p>
                    <Button
                      onClick={() => {
                        setGrocerySearchQuery('');
                        setGroceryCategory('all');
                      }}
                      className="mt-4 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    >
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {groceryTotalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={groceryPage}
                    totalPages={groceryTotalPages}
                    onPageChange={(page) => {
                      setGroceryPage(page);
                      fetchGroceryProducts(page, grocerySearchQuery);
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        {showLoginPrompt && (
          <LoginPrompt isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} feature={loginPromptFeature} />
        )}
      </div>
    </div>
  );
};

export default ProductRecommendationsPage;

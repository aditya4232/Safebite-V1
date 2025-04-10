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
    fetchProductsData(1, searchQuery);
  }, [searchQuery]);

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'grocery' && groceryProducts.length === 0) {
      fetchGroceryProducts(1, grocerySearchQuery);
    }
  }, [activeTab, grocerySearchQuery, groceryProducts]);

  // Handle API status change
  const handleApiStatusChange = (status: boolean) => {
    setApiAvailable(status);
  };

  const handleProductSearch = useCallback(() => {
    // If category is not 'all', we'll filter client-side
    // Otherwise, we'll fetch from the API with the search query
    if (selectedCategory === 'all') {
      fetchProductsData(1, searchQuery);
    } else {
      // Filter the existing products by category and search query
      let result = [...products];

      // Apply category filter
      result = result.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      setFilteredProducts(result);
    }
  }, [selectedCategory, searchQuery, products, fetchProductsData, setFilteredProducts]);

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
          <Tabs defaultValue="products" className="mb-8">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="products" className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-2" /> Products
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center">
                <Utensils className="h-4 w-4 mr-2" /> Recipes
              </TabsTrigger>
              <TabsTrigger value="grocery" className="flex items-center">
                <Apple className="h-4 w-4 mr-2" /> Grocery
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <div className="mb-6">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-safebite-blue focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={() => {
                    setSortBy('healthScore');
                  }}
                  className={`mb-2 ${sortBy === 'healthScore' ? 'bg-safebite-blue text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Health Score
                </Button>
                <Button
                  onClick={() => {
                    setSortBy('price');
                  }}
                  className={`mb-2 ${sortBy === 'price' ? 'bg-safebite-blue text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Price
                </Button>
                <Button
                  onClick={() => {
                    setSortBy('name');
                  }}
                  className={`mb-2 ${sortBy === 'name' ? 'bg-safebite-blue text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Name
                </Button>
              </div>
              {isLoading ? (
                <Loader2 className="animate-spin h-8 w-8 text-white" />
              ) : filteredProducts.length === 0 ? (
                <Card className="sci-fi-card p-8 text-center">
                  <div className="flex flex-col items-center">
                    <AlertTriangle className="h-8 w-8 text-safebite-teal mb-4" />
                    <p className="text-lg font-medium text-safebite-text">No products found.</p>
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        handleProductSearch();
                      }}
                      className="mt-4 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    >
                      Clear Search
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => {
                    return (
                      <Card key={product._id} className="sci-fi-card overflow-hidden flex flex-col h-full hover:shadow-neon-teal transition-all duration-300">
                        <div className="relative h-48 overflow-hidden bg-safebite-card-bg-alt">
                          <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(product._id);
                            }}
                            className="absolute top-2 right-2 bg-transparent hover:bg-gray-200 text-white rounded-full p-1"
                          >
                            {favorites.includes(product._id) ? <CheckCircle className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                          </Button>
                        </div>
                        <CardContent className="flex-grow p-4">
                          <CardTitle>{product.name}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">{product.brand}</CardDescription>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {product.dietaryInfo.slice(0, 3).map((info, index) => (
                              <Badge key={index} className="bg-gray-200 text-gray-700">{info}</Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Button
                            onClick={() => {
                              navigate(`/product/${product._id}`);
                            }}
                            className="w-full bg-safebite-blue text-white"
                          >
                            View Details <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
              {!isLoading && filteredProducts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    fetchProductsData(page, searchQuery);
                  }}
                />
              )}
            </TabsContent>
            <TabsContent value="recipes">
              <div className="grid grid-cols-1 gap-6 mb-6">
                <GeminiProductRecommendations userPreferences={userPreferences}/>
              </div>
            </TabsContent>
            <TabsContent value="grocery">
              <Card className="sci-fi-card mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Apple className="h-4 w-4 mr-2" /> Grocery Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Grocery items will be displayed here */}
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-safebite-blue text-white">View All</Button>
                </CardFooter>
              </Card>
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

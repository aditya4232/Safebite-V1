import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';
import {
  Search, Filter, ShoppingCart, Star, Heart, Sparkles,
  ArrowUpDown, Tag, Clock, Loader2, Utensils, Apple,
  AlertTriangle, CheckCircle, Info, Bookmark, Pizza,
  ShoppingBag, ChevronRight, Zap, ExternalLink
} from 'lucide-react';
import Footer from '@/components/Footer';
import LoginPrompt from '@/components/LoginPrompt';
import GeminiProductRecommendations from '@/components/GeminiProductRecommendations';
import { trackUserInteraction } from '@/services/mlService';
import ApiStatus from '@/components/ApiStatus';
import CompactApiStatus from '@/components/CompactApiStatus';
import Pagination from '@/components/Pagination';
import RecipeSearch from '@/components/RecipeSearch';
import { API_BASE_URL, fetchProductsWithFallback } from '@/utils/apiUtils';

// Fallback product data for when the API is unavailable
const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'p1',
    name: 'Organic Greek Yogurt',
    brand: 'HealthyChoice',
    category: 'dairy',
    description: 'High-protein, probiotic-rich Greek yogurt made from organic milk.',
    ingredients: ['Organic Milk', 'Live Active Cultures'],
    nutritionalInfo: {
      calories: 120,
      protein: 15,
      carbs: 7,
      fat: 5,
      fiber: 0,
      sugar: 5
    },
    allergens: ['Milk'],
    dietaryInfo: ['High Protein', 'Gluten Free', 'Probiotic'],
    healthScore: 8.5,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['breakfast', 'snack', 'protein']
  },
  {
    _id: 'p2',
    name: 'Quinoa & Vegetable Bowl',
    brand: 'MealPrep',
    category: 'grains',
    description: 'Ready-to-eat bowl with quinoa, roasted vegetables, and tahini dressing.',
    ingredients: ['Quinoa', 'Bell Peppers', 'Zucchini', 'Chickpeas', 'Tahini', 'Olive Oil', 'Lemon Juice', 'Spices'],
    nutritionalInfo: {
      calories: 350,
      protein: 12,
      carbs: 45,
      fat: 14,
      fiber: 8,
      sugar: 4
    },
    allergens: ['Sesame'],
    dietaryInfo: ['Vegan', 'Gluten Free', 'High Fiber'],
    healthScore: 9.2,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['lunch', 'dinner', 'plant-based']
  },
  {
    _id: 'p3',
    name: 'Almond Butter',
    brand: 'NutWorks',
    category: 'protein',
    description: 'Stone-ground almond butter with no added sugar or oils.',
    ingredients: ['Almonds'],
    nutritionalInfo: {
      calories: 190,
      protein: 7,
      carbs: 6,
      fat: 17,
      fiber: 3,
      sugar: 1
    },
    allergens: ['Tree Nuts'],
    dietaryInfo: ['Keto', 'Paleo', 'Vegan'],
    healthScore: 7.8,
    imageUrl: 'https://images.unsplash.com/photo-1501012259-39cd25f3eda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['spread', 'snack', 'breakfast']
  },
  {
    _id: 'p4',
    name: 'Mixed Berry Smoothie',
    brand: 'FruitFusion',
    category: 'beverages',
    description: 'Ready-to-drink smoothie with mixed berries, banana, and chia seeds.',
    ingredients: ['Strawberries', 'Blueberries', 'Banana', 'Chia Seeds', 'Almond Milk', 'Honey'],
    nutritionalInfo: {
      calories: 180,
      protein: 4,
      carbs: 35,
      fat: 3,
      fiber: 6,
      sugar: 22
    },
    allergens: ['Tree Nuts'],
    dietaryInfo: ['Gluten Free', 'Antioxidant Rich'],
    healthScore: 7.5,
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a90bb0ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['breakfast', 'snack', 'drink']
  },
  {
    _id: 'p5',
    name: 'Lentil Chips',
    brand: 'SnackSmart',
    category: 'snacks',
    description: 'Crunchy chips made from lentil flour with sea salt.',
    ingredients: ['Lentil Flour', 'Sunflower Oil', 'Sea Salt'],
    nutritionalInfo: {
      calories: 130,
      protein: 5,
      carbs: 18,
      fat: 6,
      fiber: 3,
      sugar: 1
    },
    allergens: [],
    dietaryInfo: ['Gluten Free', 'Vegan', 'Non-GMO'],
    healthScore: 6.8,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['snack', 'chips', 'plant-based']
  },
  {
    _id: 'p6',
    name: 'Wild Salmon Fillet',
    brand: 'OceanFresh',
    category: 'protein',
    description: 'Sustainably caught wild salmon fillets, individually vacuum-sealed.',
    ingredients: ['Wild Salmon'],
    nutritionalInfo: {
      calories: 180,
      protein: 25,
      carbs: 0,
      fat: 9,
      fiber: 0,
      sugar: 0
    },
    allergens: ['Fish'],
    dietaryInfo: ['High Protein', 'Keto', 'Paleo', 'Omega-3 Rich'],
    healthScore: 9.5,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    tags: ['dinner', 'seafood', 'protein']
  }
];

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

const ProductRecommendationsPage = () => {
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
  const showLoginPromptForFeature = (feature: string) => {
    if (isGuest) {
      setLoginPromptFeature(feature);
      setShowLoginPrompt(true);
      return true; // Prompt was shown
    }
    return false; // No prompt needed
  };

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

      // Create fallback data with pagination
      const fallbackData = {
        products: FALLBACK_PRODUCTS,
        total: FALLBACK_PRODUCTS.length,
        page: page,
        totalPages: Math.ceil(FALLBACK_PRODUCTS.length / productsPerPage)
      };

      // Force a direct API call without checking status first
      try {
        console.log(`Directly fetching from API: ${API_BASE_URL}/api/products`);

        // Use a longer timeout for the initial load
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Build the query URL with pagination and search parameters
        let url = `${API_BASE_URL}/api/products?page=${page}&limit=${productsPerPage}`;
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
        console.log('API response:', responseData);

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
        setProducts(formattedData.products);
        setFilteredProducts(formattedData.products);
        setCurrentPage(formattedData.page);
        setTotalPages(formattedData.totalPages);
        setTotalProducts(formattedData.total);
        setApiAvailable(true);

        console.log('Successfully loaded products from API');
        return formattedData;
      } catch (apiError) {
        console.error('Direct API call failed:', apiError);

        // Fall back to the utility function
        console.log('Falling back to utility function with status check');
        const data = await fetchProductsWithFallback(
          'products',
          page,
          productsPerPage,
          search,
          fallbackData
        );

        // Update state based on result
        setProducts(data.products);
        setFilteredProducts(data.products);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalProducts(data.total);

        // Check if we're using fallback data
        const usingFallback = data.products === FALLBACK_PRODUCTS;
        setApiAvailable(!usingFallback);

        // Show a toast notification if using fallback
        if (usingFallback) {
          toast({
            title: 'Using Demo Data',
            description: 'Connected to demo database instead of live API.',
            variant: 'default',
          });
        }

        return data;
      }
    } catch (error) {
      console.error('Error fetching products:', error);

      // Use fallback data
      console.log('Using fallback product data');
      setProducts(FALLBACK_PRODUCTS);
      setFilteredProducts(FALLBACK_PRODUCTS);
      setCurrentPage(1);
      setTotalPages(Math.ceil(FALLBACK_PRODUCTS.length / productsPerPage));
      setTotalProducts(FALLBACK_PRODUCTS.length);
      setApiAvailable(false);

      // Show a toast notification
      toast({
        title: 'Using Demo Data',
        description: 'Connected to demo database instead of live API.',
        variant: 'default',
      });

      return {
        products: FALLBACK_PRODUCTS,
        total: FALLBACK_PRODUCTS.length,
        page: 1,
        totalPages: Math.ceil(FALLBACK_PRODUCTS.length / productsPerPage)
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch grocery products
  const fetchGroceryProducts = async (page: number = 1, search: string = '') => {
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
        console.log(`Directly fetching from API: ${API_BASE_URL}/api/groceryProducts`);

        // Use a longer timeout for the initial load
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        // Build the query URL with pagination and search parameters
        let url = `${API_BASE_URL}/api/groceryProducts?page=${page}&limit=${productsPerPage}`;
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
  }, []);

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'grocery' && groceryProducts.length === 0) {
      fetchGroceryProducts(1, grocerySearchQuery);
    }
  }, [activeTab]);

  // Handle API status change
  const handleApiStatusChange = (status: boolean) => {
    setApiAvailable(status);
  };

  // Handle search for products
  const handleProductSearch = () => {
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
  }, [selectedCategory, products]);

  // Apply sorting
  useEffect(() => {
    let result = [...filteredProducts];

    result.sort((a, b) => {
      switch (sortBy) {
        case 'healthScore':
          return b.healthScore - a.healthScore;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'calories':
          return a.nutritionalInfo.calories - b.nutritionalInfo.calories;
        case 'protein':
          return b.nutritionalInfo.protein - a.nutritionalInfo.protein;
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [sortBy, filteredProducts]);

  // Handle favorite toggle
  const handleToggleFavorite = async (productId: string) => {
    if (isGuest) {
      showLoginPromptForFeature('save favorite products');
      return;
    }

    try {
      const newFavorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];

      setFavorites(newFavorites);

      // Track this interaction
      trackUserInteraction('toggle_favorite_product', {
        productId,
        action: favorites.includes(productId) ? 'remove' : 'add'
      });

      // Save to Firebase
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { favoriteProducts: newFavorites }, { merge: true });

        toast({
          title: favorites.includes(productId) ? 'Removed from favorites' : 'Added to favorites',
          description: favorites.includes(productId)
            ? 'Product removed from your favorites'
            : 'Product added to your favorites',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Calculate personalized score based on user preferences
  const getPersonalizedScore = (product: Product) => {
    if (!userPreferences.length) return product.healthScore;

    let score = product.healthScore;

    // Boost score if product matches user preferences
    userPreferences.forEach(pref => {
      if (pref && product.dietaryInfo.some(info =>
        info.toLowerCase().includes(pref.toLowerCase())
      )) {
        score += 1;
      }

      if (pref && product.tags.some(tag =>
        tag.toLowerCase().includes(pref.toLowerCase())
      )) {
        score += 0.5;
      }
    });

    // Cap score at 10
    return Math.min(10, score);
  };

  return (
    <div className="flex min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen w-full">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-safebite-text mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">
                  Product Recommendations
                </span>
              </h1>
              <p className="text-safebite-text-secondary">
                Discover healthy food products tailored to your preferences
              </p>
            </div>

            {/* Compact API Status Indicator */}
            <CompactApiStatus
              onStatusChange={handleApiStatusChange}
              className="mt-2"
            />
          </div>

          {/* Tabs for different sections */}
          <Tabs defaultValue="products" className="mb-8">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="products" className="flex items-center">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="recipes" className="flex items-center">
                <Pizza className="mr-2 h-4 w-4" />
                Recipes
              </TabsTrigger>
              <TabsTrigger value="grocery" className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Grocery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">

          {/* Search and filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-safebite-text-secondary" />
                <Input
                  placeholder="Search products..."
                  className="sci-fi-input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProductSearch()}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                  onClick={handleProductSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>

                <select
                  className="sci-fi-input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="healthScore">Health Score</option>
                  <option value="name">Name</option>
                  <option value="calories">Calories (Low to High)</option>
                  <option value="protein">Protein (High to Low)</option>
                </select>

                <Button
                  variant="outline"
                  className="border-safebite-card-bg-alt hover:border-safebite-teal"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSortBy('healthScore');
                    fetchProductsData(1, '');
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="mb-2 flex flex-wrap">
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* API Status Indicator */}
          {apiAvailable === false && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-safebite-text mb-1">Using Demo Data</h3>
                  <p className="text-sm text-safebite-text-secondary">
                    The SafeBite backend API is currently unavailable. We're showing demo product data instead.
                    Some features may be limited until the API connection is restored.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Products grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-safebite-teal" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="sci-fi-card p-8 text-center">
              <div className="flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 text-safebite-text-secondary mb-4" />
                <h3 className="text-xl font-medium text-safebite-text mb-2">No Products Found</h3>
                <p className="text-safebite-text-secondary mb-4">
                  We couldn't find any products matching your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const personalizedScore = getPersonalizedScore(product);
                const isFavorite = favorites.includes(product._id);

                return (
                  <Card key={product._id} className="sci-fi-card overflow-hidden flex flex-col h-full">
                    {/* Product image */}
                    <div className="relative h-48 overflow-hidden bg-safebite-card-bg-alt">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="h-12 w-12 text-safebite-text-secondary" />
                        </div>
                      )}

                      {/* Health score badge */}
                      <div className="absolute top-2 left-2 bg-safebite-dark-blue/80 backdrop-blur-sm rounded-full p-1 px-2 flex items-center">
                        <Star className={`h-4 w-4 ${personalizedScore >= 8 ? 'text-yellow-400 fill-yellow-400' : 'text-safebite-text-secondary'}`} />
                        <span className="ml-1 text-xs font-medium text-safebite-text">
                          {personalizedScore.toFixed(1)}
                        </span>
                      </div>

                      {/* Favorite button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-safebite-dark-blue/80 backdrop-blur-sm rounded-full p-1 hover:bg-safebite-dark-blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(product._id);
                        }}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-safebite-text-secondary'}`} />
                      </Button>
                    </div>

                    <CardContent className="flex-grow p-4">
                      <div className="mb-2">
                        <h3 className="font-medium text-safebite-text line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-safebite-text-secondary">{product.brand}</p>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.dietaryInfo.slice(0, 3).map((info, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-safebite-teal/10 text-safebite-teal border-safebite-teal/30">
                            {info}
                          </Badge>
                        ))}
                        {product.dietaryInfo.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{product.dietaryInfo.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Calories</p>
                          <p className="text-sm font-medium text-safebite-text">{product.nutritionalInfo.calories}</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Protein</p>
                          <p className="text-sm font-medium text-safebite-text">{product.nutritionalInfo.protein}g</p>
                        </div>
                        <div className="text-center p-1 bg-safebite-card-bg-alt rounded">
                          <p className="text-xs text-safebite-text-secondary">Carbs</p>
                          <p className="text-sm font-medium text-safebite-text">{product.nutritionalInfo.carbs}g</p>
                        </div>
                      </div>

                      <p className="text-xs text-safebite-text-secondary line-clamp-2 mb-2">
                        {product.description || 'No description available'}
                      </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button
                        className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                        onClick={() => {
                          // Track this interaction
                          trackUserInteraction('view_product_details', { productId: product._id });

                          // Show product details (could navigate to a details page)
                          toast({
                            title: 'Product Details',
                            description: 'Product details view is coming soon!',
                            variant: 'default',
                          });
                        }}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && filteredProducts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemsPerPage={productsPerPage}
              onPageChange={(page) => {
                // If we're filtering by category, we don't need to fetch from the API
                if (selectedCategory !== 'all') {
                  setCurrentPage(page);
                  // We would normally slice the filtered products here,
                  // but since we're showing all filtered products on one page, we don't need to
                } else {
                  // Otherwise, fetch the new page from the API
                  fetchProductsData(page, searchQuery);
                }
              }}
            />
          )}

          {/* API Status */}
            </TabsContent>

            <TabsContent value="recipes">
              <div className="grid grid-cols-1 gap-6 mb-6">
                {/* AI Recommendations */}
                <GeminiProductRecommendations
                  userPreferences={userPreferences}
                  dietaryInfo={userPreferences[0]}
                  healthGoals={userPreferences[1]}
                  isGuest={isGuest}
                />
              </div>

              {/* CalorieNinjas Recipe Search */}
              <RecipeSearch isGuest={isGuest} />
            </TabsContent>

            <TabsContent value="grocery">
              <Card className="sci-fi-card mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="mr-2 h-5 w-5 text-safebite-teal" />
                    Grocery Delivery Integration
                  </CardTitle>
                  <CardDescription>
                    Order healthy groceries from your favorite stores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Coming Soon Message */}
                    <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/10">
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <Zap className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-safebite-text mb-1">Zomato + Swiggy Integration Coming Soon</h3>
                          <p className="text-sm text-safebite-text-secondary">
                            We're working on integrating with popular food delivery platforms to provide nutritional information
                            and health recommendations for restaurant meals and grocery delivery.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sample Grocery Stores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="border border-safebite-card-bg-alt rounded-lg p-4 hover:border-safebite-teal/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-safebite-text mb-1">Zomato Grocery</h3>
                            <p className="text-xs text-safebite-text-secondary">Fresh produce and pantry essentials</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-safebite-text-secondary" />
                        </div>
                      </div>

                      <div className="border border-safebite-card-bg-alt rounded-lg p-4 hover:border-safebite-teal/50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-safebite-text mb-1">Swiggy Instamart</h3>
                            <p className="text-xs text-safebite-text-secondary">Quick delivery of groceries and essentials</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-safebite-text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700"
                    onClick={() => navigate('/food-delivery')}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          {/* API Status - Removed from bottom as it's now in the header */}

          <Footer />
        </div>
      </main>

      {/* Login prompt modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature={loginPromptFeature}
      />
    </div>
  );
};

export default ProductRecommendationsPage;

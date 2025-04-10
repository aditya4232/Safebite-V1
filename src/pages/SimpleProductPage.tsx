import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Filter, ShoppingCart, Star, Heart, 
  AlertTriangle, CheckCircle, Info, Loader2
} from 'lucide-react';
import userActivityService from '@/services/userActivityService';
import Pagination from '@/components/Pagination';

// API URL - Change this to your Render backend URL
const API_BASE_URL = 'https://safebite-backend.onrender.com';

// Product interface
interface Product {
  _id: string;
  name?: string;
  ProductName?: string; // For grocery products
  brand?: string;
  Brand?: string; // For grocery products
  category?: string;
  Category?: string; // For grocery products
  description?: string;
  ingredients?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  allergens?: string[];
  dietaryInfo?: string[];
  healthScore?: number;
  imageUrl?: string;
  price?: number;
  tags?: string[];
}

const SimpleProductPage: React.FC = () => {
  const { toast } = useToast();
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<'products' | 'grocery'>('products');
  const productsPerPage = 20;

  // Load products on component mount and when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, activeTab]);

  // Function to fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    
    try {
      // Determine endpoint based on active tab and search query
      let endpoint = '';
      
      if (searchQuery) {
        endpoint = `${API_BASE_URL}/${activeTab}/search?q=${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = `${API_BASE_URL}/${activeTab}`;
      }
      
      // Fetch data
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update state
      setProducts(data);
      setTotalPages(Math.ceil(data.length / productsPerPage));
      
      // Track user activity
      userActivityService.trackActivity('product', 'view-products', {
        page: currentPage,
        search: searchQuery,
        type: activeTab,
        count: data.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again later.',
        variant: 'destructive'
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchProducts();
  };

  // Handle tab change
  const handleTabChange = (tab: 'products' | 'grocery') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setSearchQuery(''); // Clear search query when changing tabs
  };

  // Get product name based on the active tab
  const getProductName = (product: Product): string => {
    return activeTab === 'products' 
      ? product.name || 'Unknown Product'
      : product.ProductName || 'Unknown Product';
  };

  // Get product brand based on the active tab
  const getProductBrand = (product: Product): string => {
    return activeTab === 'products'
      ? product.brand || ''
      : product.Brand || '';
  };

  // Get product category based on the active tab
  const getProductCategory = (product: Product): string => {
    return activeTab === 'products'
      ? product.category || ''
      : product.Category || '';
  };

  // Get health score or calculate it
  const getHealthScore = (product: Product): number => {
    if (product.healthScore !== undefined) {
      return product.healthScore;
    }
    
    // Simple algorithm to calculate health score for grocery products
    if (activeTab === 'grocery') {
      // This is a placeholder - you would implement a real algorithm
      return Math.floor(Math.random() * 10) + 1; // Random score between 1-10
    }
    
    return 5; // Default score
  };

  // Render health score badge
  const renderHealthScore = (score: number) => {
    let color = 'bg-yellow-500';
    let icon = <Info className="h-4 w-4" />;
    
    if (score >= 8) {
      color = 'bg-green-500';
      icon = <CheckCircle className="h-4 w-4" />;
    } else if (score <= 4) {
      color = 'bg-red-500';
      icon = <AlertTriangle className="h-4 w-4" />;
    }
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        {icon}
        {score}/10
      </Badge>
    );
  };

  // Get paginated products
  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Product Search</h1>
            <p className="text-safebite-text-secondary">
              Search for food products and get detailed nutritional information
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex mb-6 border-b border-safebite-card-bg-alt">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'products'
                  ? 'text-safebite-teal border-b-2 border-safebite-teal'
                  : 'text-safebite-text-secondary hover:text-safebite-text'
              }`}
              onClick={() => handleTabChange('products')}
            >
              Products
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'grocery'
                  ? 'text-safebite-teal border-b-2 border-safebite-teal'
                  : 'text-safebite-text-secondary hover:text-safebite-text'
              }`}
              onClick={() => handleTabChange('grocery')}
            >
              Grocery Products
            </button>
          </div>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-safebite-text-secondary" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-safebite-card-bg border-safebite-card-bg-alt"
                />
              </div>
              <Button type="submit" className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
                Search
              </Button>
            </div>
          </form>
          
          {/* API Status */}
          <div className="mb-4 p-4 bg-safebite-card-bg rounded-md">
            <h3 className="text-safebite-text font-medium mb-2">API Connection</h3>
            <p className="text-safebite-text-secondary text-sm">
              Connected to: <code className="bg-safebite-card-bg-alt px-2 py-1 rounded">{API_BASE_URL}</code>
            </p>
            <p className="text-safebite-text-secondary text-sm mt-1">
              Endpoint: <code className="bg-safebite-card-bg-alt px-2 py-1 rounded">/{activeTab}{searchQuery ? `/search?q=${searchQuery}` : ''}</code>
            </p>
          </div>
          
          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mb-4 text-safebite-text-secondary">
                Showing {getPaginatedProducts().length} of {products.length} products
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {getPaginatedProducts().map((product) => (
                  <Card key={product._id} className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium text-safebite-text">
                          {getProductName(product)}
                        </CardTitle>
                        {renderHealthScore(getHealthScore(product))}
                      </div>
                      {getProductBrand(product) && (
                        <p className="text-sm text-safebite-text-secondary">
                          {getProductBrand(product)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {getProductCategory(product) && (
                        <Badge variant="outline" className="mb-2">
                          {getProductCategory(product)}
                        </Badge>
                      )}
                      
                      <div className="flex justify-between mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-safebite-text-secondary hover:text-safebite-text"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-safebite-teal hover:text-safebite-teal/80 hover:bg-safebite-teal/10"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4 text-safebite-text-secondary">
                No products found. Try a different search term.
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                  fetchProducts();
                }}
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SimpleProductPage;

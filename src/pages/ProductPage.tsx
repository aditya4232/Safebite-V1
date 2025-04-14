import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Filter, ShoppingCart, Star, Heart,
  AlertTriangle, CheckCircle, Info, Loader2,
  Package, Tag, Bookmark, ExternalLink,
  Database, Server
} from 'lucide-react';
import { fetchProducts, fetchGroceryProducts, searchProducts, Product } from '@/services/productService';
import userActivityService from '@/services/userActivityService';
import Pagination from '@/components/Pagination';

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeTab, setActiveTab] = useState<'products' | 'grocery'>('products');
  const productsPerPage = 20;

  // Load products on component mount and when dependencies change
  useEffect(() => {
    loadProducts();
  }, [currentPage, searchQuery, activeTab]);

  // Function to load products
  const loadProducts = async () => {
    setIsLoading(true);

    try {
      let result;

      if (activeTab === 'products') {
        result = await fetchProducts(currentPage, productsPerPage, searchQuery);
        console.log('Products result:', result);
      } else {
        result = await fetchGroceryProducts(currentPage, productsPerPage, searchQuery);
        console.log('Grocery products result:', result);
      }

      // Make sure we have products array and add collection type if missing
      let productsWithCollection: Product[] = [];

      if (result.products && Array.isArray(result.products)) {
        // Add collection type to each product if not already set
        productsWithCollection = result.products.map(product => ({
          ...product,
          _collection: product._collection || (activeTab === 'products' ? 'products' : 'grocery')
        }));

        setProducts(productsWithCollection);
        setTotalProducts(result.total || result.products.length);
        setTotalPages(result.totalPages || Math.ceil((result.total || result.products.length) / productsPerPage));
      } else if (Array.isArray(result)) {
        // Handle case where API returns array directly
        productsWithCollection = result.map(product => ({
          ...product,
          _collection: product._collection || (activeTab === 'products' ? 'products' : 'grocery')
        }));

        setProducts(productsWithCollection);
        setTotalProducts(result.length);
        setTotalPages(Math.ceil(result.length / productsPerPage));
      } else {
        console.warn('Unexpected response format:', result);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }

      // Track user activity
      userActivityService.trackActivity('product', 'view-products', {
        page: currentPage,
        search: searchQuery,
        type: activeTab,
        count: Array.isArray(result.products) ? result.products.length : 0
      });
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again later.',
        variant: 'destructive'
      });
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching

    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        // Use the unified search endpoint if query is provided
        const searchResults = await searchProducts(searchQuery, productsPerPage);

        // Add collection type to each product if not already set
        const productsWithCollection = searchResults.map(product => ({
          ...product,
          _collection: product._collection || 'unknown'
        }));

        setProducts(productsWithCollection);
        setTotalProducts(searchResults.length);
        setTotalPages(Math.ceil(searchResults.length / productsPerPage));

        // Track search activity
        userActivityService.trackActivity('product', 'search', {
          query: searchQuery,
          results: searchResults.length
        });
      } catch (error) {
        console.error('Error searching products:', error);
        toast({
          title: 'Search Error',
          description: 'Failed to search products. Please try again.',
          variant: 'destructive'
        });
        // Fall back to regular loading
        loadProducts();
      } finally {
        setIsLoading(false);
      }
    } else {
      // If no query, just load products normally
      loadProducts();
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'products' | 'grocery') => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
    setSearchQuery(''); // Clear search query when changing tabs
  };

  // Get product name based on the collection type and MongoDB structure
  const getProductName = (product: Product): string => {
    // Determine collection type from product or active tab
    const collectionType = product._collection || activeTab;

    // For debugging
    console.log('Product data:', {
      id: product._id,
      collection: collectionType,
      name: product.name,
      product: product.product,
      ProductName: product.ProductName
    });

    // Check for MongoDB structure (product field) first
    if (product.product) {
      return product.product;
    }

    // Check for index field (sometimes used as a name in MongoDB)
    if (typeof product.index === 'string' && product.index.trim()) {
      return product.index;
    }

    // Handle based on collection type
    if (collectionType === 'products') {
      return product.name || product.product || product.ProductName ||
             (product.type ? `${product.type} Product` : 'Food Product');
    } else { // grocery or unknown
      return product.ProductName || product.product || product.name ||
             (product.type ? `${product.type} Grocery` : 'Grocery Item');
    }
  };

  // Get product brand based on the collection type and MongoDB structure
  const getProductBrand = (product: Product): string => {
    // Determine collection type from product or active tab
    const collectionType = product._collection || activeTab;

    // Check for MongoDB structure first
    if (product.brand) {
      return product.brand;
    }

    // Handle based on collection type
    if (collectionType === 'products') {
      return product.brand || product.Brand || 'Generic Brand';
    } else { // grocery or unknown
      return product.Brand || product.brand || 'Generic Brand';
    }
  };

  // Get product category based on the collection type and MongoDB structure
  const getProductCategory = (product: Product): string => {
    // Determine collection type from product or active tab
    const collectionType = product._collection || activeTab;

    // Check for MongoDB structure first
    if (product.category) {
      return product.category;
    }

    // Check for sub_category as well
    if (product.sub_category) {
      return product.sub_category;
    }

    // Check for type field
    if (product.type) {
      return product.type;
    }

    // Handle based on collection type
    if (collectionType === 'products') {
      return product.category || product.Category || 'Food';
    } else { // grocery or unknown
      return product.Category || product.category || 'Grocery';
    }
  };

  // Helper function to render rating text
  const renderRatingText = (rating: number): string => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Average';
    if (rating >= 2.0) return 'Below Average';
    return 'Poor';
  };

  // Get health score or calculate it based on available data
  const getHealthScore = (product: Product): number => {
    // Use explicit health score if available
    if (product.healthScore !== undefined) {
      return product.healthScore;
    }

    // Use product rating if available (convert from 5-star to 10-point scale)
    if (product.rating !== undefined) {
      return Math.round(product.rating * 2);
    }

    // Calculate based on nutritional info if available
    if (product.nutritionalInfo) {
      const nutrition = product.nutritionalInfo;
      let score = 5; // Start with neutral score

      // Increase score for high protein
      if (nutrition.protein > 15) score += 1;

      // Increase score for high fiber
      if (nutrition.fiber > 5) score += 1;

      // Decrease score for high sugar
      if (nutrition.sugar > 15) score -= 1;

      // Decrease score for high fat
      if (nutrition.fat > 20) score -= 1;

      // Ensure score is between 1-10
      return Math.max(1, Math.min(10, score));
    }

    // Generate a consistent score based on product ID
    // This ensures the same product always gets the same score
    if (product._id) {
      // Use the last character of the ID to generate a number between 4-8
      const lastChar = product._id.charAt(product._id.length - 1);
      const charCode = lastChar.charCodeAt(0);
      return 4 + (charCode % 5); // Score between 4-8
    }

    // Default score based on collection type
    const collectionType = product._collection || activeTab;
    return collectionType === 'grocery' ? 6 : 5;
  };

  // Render health score badge with clear labeling
  const renderHealthScore = (score: number) => {
    let color = 'bg-yellow-500';
    let icon = <Info className="h-4 w-4" />;
    let label = 'Average';

    if (score >= 8) {
      color = 'bg-green-500';
      icon = <CheckCircle className="h-4 w-4" />;
      label = 'Healthy';
    } else if (score >= 6) {
      color = 'bg-blue-500';
      icon = <Info className="h-4 w-4" />;
      label = 'Good';
    } else if (score <= 4) {
      color = 'bg-red-500';
      icon = <AlertTriangle className="h-4 w-4" />;
      label = 'Poor';
    }

    return (
      <div className="flex flex-col items-end backdrop-blur-sm bg-black/30 p-1 rounded">
        <Badge className={`${color} text-white flex items-center gap-1`}>
          {icon}
          {score}/10
        </Badge>
        <span className="text-xs text-white mt-1">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-safebite-text">Product Search</h1>
              <Badge variant="outline" className="text-safebite-teal border-safebite-teal">
                {activeTab === 'products' ? 'Products' : 'Grocery'}
              </Badge>
            </div>
            <p className="text-safebite-text-secondary">
              Search for {activeTab === 'products' ? 'food products' : 'grocery items'} and get detailed nutritional information
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-safebite-card-bg-alt">
            <button
              className={`px-4 py-2 font-medium flex items-center gap-1 ${
                activeTab === 'products'
                  ? 'text-safebite-teal border-b-2 border-safebite-teal'
                  : 'text-safebite-text-secondary hover:text-safebite-text'
              }`}
              onClick={() => handleTabChange('products')}
            >
              <Database className="h-4 w-4" />
              <span className="flex flex-col items-start">
                <span>Products</span>
                <span className="text-xs opacity-70">MongoDB Collection</span>
              </span>
              <Badge variant="outline" className="ml-1 text-xs bg-safebite-card-bg-alt">{activeTab === 'products' ? totalProducts : ''}</Badge>
            </button>
            <button
              className={`px-4 py-2 font-medium flex items-center gap-1 ${
                activeTab === 'grocery'
                  ? 'text-safebite-teal border-b-2 border-safebite-teal'
                  : 'text-safebite-text-secondary hover:text-safebite-text'
              }`}
              onClick={() => handleTabChange('grocery')}
            >
              <Database className="h-4 w-4" />
              <span className="flex flex-col items-start">
                <span>Grocery Products</span>
                <span className="text-xs opacity-70">MongoDB Collection</span>
              </span>
              <Badge variant="outline" className="ml-1 text-xs bg-safebite-card-bg-alt">{activeTab === 'grocery' ? totalProducts : ''}</Badge>
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6 relative">
            <div className="flex gap-2">
              <div className="absolute -top-3 right-0 flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full text-xs">
                <Database className="h-3 w-3 text-safebite-teal" />
                <span className="text-safebite-text-secondary">MongoDB Atlas Search</span>
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-safebite-text-secondary" />
                <Input
                  type="text"
                  placeholder={`Search MongoDB ${activeTab === 'products' ? 'products' : 'Grocery Products'} collection...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-safebite-card-bg border-safebite-card-bg-alt"
                />
              </div>
              <Button
                type="submit"
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex items-center gap-1"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search MongoDB
              </Button>
            </div>
          </form>

          {/* Results */}
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-safebite-card-bg rounded-lg border border-safebite-card-bg-alt shadow-inner">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-safebite-teal mb-4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="h-6 w-6 text-safebite-text-secondary" />
                </div>
              </div>
              <p className="text-lg font-medium text-safebite-text mt-4">
                Loading {activeTab === 'products' ? 'products' : 'grocery products'}
              </p>
              <p className="text-sm text-safebite-text-secondary mt-1">
                Connecting to MongoDB Atlas to fetch real product data...
              </p>
              <div className="mt-4 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs">
                <Server className="h-3 w-3 text-safebite-teal" />
                <span className="text-safebite-text-secondary">MongoDB Atlas Search</span>
              </div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-safebite-text-secondary">
                  Showing <span className="font-medium text-safebite-text">{products.length}</span> of <span className="font-medium text-safebite-text">{totalProducts}</span> {activeTab === 'products' ? 'products' : 'grocery products'}
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-safebite-text-secondary hover:text-safebite-text"
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                      loadProducts();
                    }}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Clear search for "{searchQuery}"
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {products.map((product) => (
                  <Card key={product._id} className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300 flex flex-col h-full">
                    {/* Product Image */}
                    <div className="relative h-40 overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl || `https://source.unsplash.com/random/400x300/?${encodeURIComponent(getProductName(product).replace('Unknown Product', 'food'))},food`}
                        alt={getProductName(product)}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          // Fallback image if the main one fails to load
                          const productName = getProductName(product).replace('Unknown Product', 'Food Product');
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(productName)}`;
                        }}
                      />
                      {/* Health score overlay */}
                      <div className="absolute top-2 right-2">
                        {renderHealthScore(getHealthScore(product))}
                      </div>
                      {/* Collection type badge */}
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                        {product._collection === 'products' ? (
                          <>
                            <Package className="h-3 w-3" />
                            <span>Product</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3 w-3" />
                            <span>Grocery</span>
                          </>
                        )}
                      </div>
                    </div>

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium text-safebite-text line-clamp-2">
                          {getProductName(product)}
                        </CardTitle>
                      </div>
                      {getProductBrand(product) && (
                        <p className="text-sm text-safebite-text-secondary">
                          <strong>Brand:</strong> {getProductBrand(product)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                      {/* Category and tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getProductCategory(product) && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {getProductCategory(product)}
                          </Badge>
                        )}
                        {product.sub_category && (
                          <Badge variant="outline" className="flex items-center gap-1 bg-safebite-card-bg-alt">
                            <Bookmark className="h-3 w-3" />
                            {product.sub_category}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-safebite-text-secondary mt-2 line-clamp-2">
                        {product.description || `${getProductName(product)} - ${getProductCategory(product) || 'Food product'} by ${getProductBrand(product) || 'Generic Brand'}`}
                      </p>

                      {/* Price information */}
                      <div className="mt-3 flex items-center bg-safebite-card-bg-alt p-2 rounded-md">
                        <Package className="h-4 w-4 text-safebite-teal mr-2" />
                        {(product.sale_price || product.price) ? (
                          <>
                            <span className="text-base font-medium text-safebite-teal">
                              ₹{product.sale_price || product.price}
                            </span>
                            {product.market_price && product.market_price > (product.sale_price || 0) && (
                              <div className="ml-2 flex items-center">
                                <span className="text-xs line-through text-safebite-text-secondary">
                                  ₹{product.market_price}
                                </span>
                                <span className="ml-1 text-xs bg-green-500/20 text-green-500 px-1 rounded">
                                  {Math.round(((product.market_price - (product.sale_price || 0)) / product.market_price) * 100)}% off
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-safebite-text-secondary">
                            Price not available
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mt-2 flex items-center">
                        {product.rating ? (
                          <>
                            <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded">
                              <Star className="h-4 w-4 text-yellow-400 mr-1 fill-yellow-400" />
                              <span className="text-sm font-medium text-yellow-400">
                                {product.rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="ml-2 text-xs text-safebite-text-secondary">
                              {renderRatingText(product.rating)}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center bg-gray-500/10 px-2 py-1 rounded">
                            <Star className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-400">
                              Not rated yet
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Spacer to push buttons to bottom */}
                      <div className="flex-grow"></div>

                      {/* Action buttons */}
                      <div className="flex justify-between mt-4 pt-2 border-t border-safebite-card-bg-alt">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-safebite-text-secondary hover:text-safebite-teal hover:border-safebite-teal flex-grow mr-2"
                          onClick={() => {
                            // Track user activity
                            userActivityService.trackActivity('product', 'view-details', {
                              productId: product._id,
                              productName: getProductName(product),
                              collection: product._collection || activeTab
                            });
                            // Navigate to product details page
                            navigate(`/product/${product._id}?type=${product._collection || activeTab}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-safebite-teal hover:text-safebite-teal/80 hover:bg-safebite-teal/10"
                            onClick={() => {
                              toast({
                                title: 'Added to Favorites',
                                description: `${getProductName(product)} has been added to your favorites.`,
                                variant: 'default'
                              });
                              userActivityService.trackActivity('product', 'add-favorite', {
                                productId: product._id,
                                productName: getProductName(product)
                              });
                            }}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-safebite-teal hover:text-safebite-teal/80 hover:bg-safebite-teal/10"
                            onClick={() => {
                              toast({
                                title: 'Added to Cart',
                                description: `${getProductName(product)} has been added to your cart.`,
                                variant: 'default'
                              });
                              userActivityService.trackActivity('product', 'add-cart', {
                                productId: product._id,
                                productName: getProductName(product)
                              });
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-8 bg-safebite-card-bg rounded-lg p-8 border border-safebite-card-bg-alt shadow-inner">
              <div className="flex flex-col items-center gap-4">
                {searchQuery ? (
                  <>
                    <div className="relative bg-black/20 p-6 rounded-full">
                      <Search className="h-12 w-12 text-safebite-teal opacity-80" />
                      <div className="absolute -top-1 -right-1 bg-red-500/20 text-red-400 rounded-full p-1">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-safebite-text mb-2">No products found</h3>
                      <p className="text-safebite-text-secondary">
                        We couldn't find any {activeTab === 'products' ? 'products' : 'grocery products'} matching "{searchQuery}" in our MongoDB database.
                      </p>
                      <p className="text-xs text-safebite-text-secondary mt-2">
                        This search uses MongoDB Atlas Search to find real products in our database.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 text-safebite-teal border-safebite-teal/30 hover:bg-safebite-teal/10 flex items-center gap-2"
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentPage(1);
                          loadProducts();
                        }}
                      >
                        <Database className="h-4 w-4" />
                        Show all products from MongoDB
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative bg-black/20 p-6 rounded-full">
                      <Database className="h-12 w-12 text-safebite-text-secondary opacity-80" />
                      <div className="absolute -top-1 -right-1 bg-yellow-500/20 text-yellow-400 rounded-full p-1">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-safebite-text mb-2">No products available</h3>
                      <p className="text-safebite-text-secondary">
                        There are no {activeTab === 'products' ? 'products' : 'grocery products'} available in the MongoDB database at the moment.
                      </p>
                      <p className="text-xs text-safebite-text-secondary mt-2">
                        This could be due to a connection issue with MongoDB Atlas or because the collection is empty.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 text-safebite-teal border-safebite-teal/30 hover:bg-safebite-teal/10 flex items-center gap-2"
                        onClick={() => handleTabChange(activeTab === 'products' ? 'grocery' : 'products')}
                      >
                        <Server className="h-4 w-4" />
                        Try {activeTab === 'products' ? 'grocery products' : 'products'} collection instead
                      </Button>
                      <div className="mt-4 flex items-center justify-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs">
                        <Database className="h-3 w-3 text-safebite-teal" />
                        <span className="text-safebite-text-secondary">MongoDB Atlas Collection: {activeTab === 'products' ? 'products' : 'Grocery Products'}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductPage;

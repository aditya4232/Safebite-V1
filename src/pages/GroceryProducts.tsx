import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Filter, ShoppingCart, Star, Heart,
  AlertTriangle, CheckCircle, Info, Loader2,
  Apple, Tag, Bookmark, ExternalLink,
  Database, Server
} from 'lucide-react';
import { fetchGroceryProducts, Product, API_BASE_URL } from '@/services/productService';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebase";
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';

const GroceryProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();

  // Products state
  const [groceryProducts, setGroceryProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;
  const [favorites, setFavorites] = useState<string[]>([]);

  // Categories for filtering - based on actual categories in the MongoDB database
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Bakery, Cakes & Dairy', name: 'Bakery & Dairy' },
    { id: 'Beverages', name: 'Beverages' },
    { id: 'Snacks & Branded Foods', name: 'Snacks' },
    { id: 'Foodgrains, Oil & Masala', name: 'Foodgrains & Oil' },
    { id: 'Fruits & Vegetables', name: 'Fruits & Vegetables' },
    { id: 'Beauty & Hygiene', name: 'Beauty & Hygiene' },
    { id: 'Cleaning & Household', name: 'Household' },
    { id: 'Kitchen, Garden & Pets', name: 'Kitchen & Pets' },
    { id: 'Gourmet & World Food', name: 'Gourmet Food' },
    { id: 'Baby Care', name: 'Baby Care' },
  ];

  // Fetch user favorites from Firebase
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (auth.currentUser && !isGuest) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Get favorites
            const userFavorites = userData.favoriteProducts || [];
            setFavorites(userFavorites);
          }
        } catch (error) {
          console.error('Error fetching user favorites:', error);
        }
      }
    };

    fetchUserFavorites();
  }, [auth, db, isGuest]);

  // Function to fetch grocery products
  const fetchGroceryProductsData = async (page: number = 1, search: string = '', category: string = 'all') => {
    setIsLoading(true);
    try {
      // Track this interaction
      trackUserInteraction('grocery_page_view', { isGuest, page, search, category });

      // Fetch products with category filter if not 'all'
      const categoryFilter = category !== 'all' ? category : '';
      const result = await fetchGroceryProducts(page, productsPerPage, search, categoryFilter);

      // Process the results
      const processedProducts = result.products.map(product => {
        // Ensure name field exists (use product field if name doesn't exist)
        if (!product.name && product.product) {
          product.name = product.product;
        }

        // Ensure collection field is set
        if (!product._collection) {
          product._collection = 'grocery';
        }

        return product;
      });

      setGroceryProducts(processedProducts);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotalProducts(result.total);

      if (processedProducts.length === 0) {
        if (search) {
          toast({
            title: 'No products found',
            description: `No grocery products match "${search}". Try a different search term.`,
            variant: 'destructive',
          });
        } else if (category !== 'all') {
          toast({
            title: 'No products in category',
            description: `No grocery products found in the "${category}" category.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'API Connection Issue',
            description: 'Could not retrieve grocery products from the database. The API may be experiencing issues.',
            variant: 'destructive',
          });
        }
      } else {
        // Success message for search
        if (search) {
          toast({
            title: 'Search Results',
            description: `Found ${processedProducts.length} grocery products matching "${search}".`,
            variant: 'default',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching grocery products:', error);
      toast({
        title: 'Backend API Error',
        description: 'Could not connect to the grocery products database. The backend API may be down or experiencing issues.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchGroceryProductsData(1, searchQuery);
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchGroceryProductsData(1, searchQuery, selectedCategory);
  };

  // Handle category change
  useEffect(() => {
    // Always fetch from API when category changes to get fresh data
    fetchGroceryProductsData(1, searchQuery, selectedCategory);
  }, [selectedCategory]);

  // Handle toggle favorite
  const handleToggleFavorite = async (productId: string) => {
    if (isGuest) {
      toast({
        title: 'Guest Mode',
        description: 'Please log in to save favorites.',
        variant: 'default',
      });
      return;
    }

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

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />

      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-safebite-text">Grocery Products</h1>
              <Badge variant="outline" className="text-safebite-teal border-safebite-teal">
                MongoDB
              </Badge>
            </div>
            <p className="text-safebite-text-secondary">
              Search for grocery items and get detailed nutritional information
            </p>
          </div>

          {/* Search and Filter Section */}
          <Card className="sci-fi-card mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearch}
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex-shrink-0"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
                    Search
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className={selectedCategory === category.id
                      ? "bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                      : "text-safebite-text-secondary border-safebite-card-bg-alt hover:bg-safebite-card-bg-alt/50"}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
              <span className="ml-2 text-safebite-text">Loading grocery products...</span>
            </div>
          ) : groceryProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-safebite-text">
                  <span className="font-medium">{totalProducts}</span> grocery products found
                </div>
                <Button
                  variant="outline"
                  className="text-safebite-text-secondary border-safebite-card-bg-alt"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    fetchGroceryProductsData(1, '');
                  }}
                >
                  <Filter className="h-4 w-4 mr-1" /> Clear Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {groceryProducts.map((product) => {
                  // Get product name (handle different field names)
                  const productName = product.name || product.product || 'Unknown Product';
                  const productBrand = product.brand || product.Brand || 'Generic Brand';
                  const productCategory = product.category || product.sub_category || product.Category || 'Grocery';
                  const productType = product.type || product.Type || '';
                  const productRating = product.rating || product.healthScore || 4.0;
                  const productPrice = product.price || product.sale_price || null;
                  const productMarketPrice = product.market_price || null;

                  // Generate image URL
                  const imageQuery = encodeURIComponent(productName.replace('Unknown Product', 'food'));
                  const imageUrl = product.imageUrl || `https://source.unsplash.com/random/400x300/?${imageQuery},food`;

                  return (
                    <Card key={product._id} className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl">
                      {/* Product Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-lg bg-safebite-card-bg-alt">
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            // Fallback image if the main one fails to load
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(productName)}`;
                          }}
                        />
                        {/* Health score overlay */}
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center bg-safebite-teal/80 text-safebite-dark-blue px-2 py-1 rounded-full backdrop-blur-sm text-xs font-medium">
                            <Star className="h-3 w-3 mr-1 fill-safebite-dark-blue" />
                            <span>{typeof productRating === 'number' ? productRating.toFixed(1) : '4.0'}</span>
                          </div>
                        </div>
                        {/* Favorite button */}
                        <Button
                          onClick={() => handleToggleFavorite(product._id)}
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full h-8 w-8 p-1"
                        >
                          <Heart className={`h-4 w-4 ${favorites.includes(product._id) ? 'fill-safebite-teal text-safebite-teal' : ''}`} />
                        </Button>
                        {/* Category badge */}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                          {productCategory}
                        </div>
                      </div>

                      <CardContent className="flex-grow p-4">
                        <h3 className="font-medium text-safebite-text mb-1 line-clamp-2">{productName}</h3>
                        <p className="text-safebite-text-secondary text-sm mb-2">{productBrand}</p>

                        {/* Price if available */}
                        {productPrice && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-safebite-teal font-medium">₹{productPrice}</span>
                            {productMarketPrice && productMarketPrice > productPrice && (
                              <span className="text-safebite-text-secondary line-through text-xs">₹{productMarketPrice}</span>
                            )}
                          </div>
                        )}

                        {/* Description if available */}
                        {product.description && (
                          <p className="text-safebite-text-secondary text-xs mt-2 line-clamp-2">{product.description}</p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-safebite-card-bg-alt">
                              {tag}
                            </Badge>
                          ))}
                          {productType && (
                            <Badge variant="outline" className="text-xs bg-safebite-card-bg-alt">
                              {productType}
                            </Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0">
                        <Button
                          className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex items-center justify-center gap-1"
                          onClick={() => {
                            // Track this interaction
                            trackUserInteraction('view_grocery_details', {
                              productId: product._id,
                              productName: productName,
                              productCategory: productCategory
                            });

                            // Show product details in a modal or navigate to details page
                            toast({
                              title: 'Product Details',
                              description: `Viewing details for ${productName}`,
                              variant: 'default',
                            });
                          }}
                        >
                          <Info className="h-4 w-4" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      fetchGroceryProductsData(page, searchQuery);
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <Card className="sci-fi-card mb-4">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-safebite-text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-medium text-safebite-text mb-2">No Grocery Products Found</h3>
                <p className="text-safebite-text-secondary mb-4">
                  No grocery products match your search criteria. Try adjusting your filters or search terms.
                </p>
                <p className="text-safebite-text-secondary text-xs mb-4">
                  Note: The backend API may be experiencing issues. Please try again later or contact support if the problem persists.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    fetchGroceryProductsData(1, '');
                  }}
                  className="mt-4 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                >
                  Clear Search
                </Button>
                <div className="mt-4 flex items-center justify-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs">
                  <Database className="h-3 w-3 text-safebite-teal" />
                  <span className="text-safebite-text-secondary">MongoDB Atlas Collection: Grocery Products</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs">
                  <Server className="h-3 w-3 text-safebite-teal" />
                  <span className="text-safebite-text-secondary">API Status: {isLoading ? 'Checking...' : 'Connection Failed'}</span>
                </div>
                <p className="mt-4 text-xs text-safebite-text-secondary">
                  Backend URL: {API_BASE_URL}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default GroceryProductsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Filter, ShoppingCart, Star, Heart,
  AlertTriangle, CheckCircle, Info, Loader2,
  Apple, Tag, Bookmark, ExternalLink,
  Database, Server, X, RefreshCw,
  Globe, Sparkles
} from 'lucide-react';
import { fetchGroceryProducts, Product, API_BASE_URL } from '@/services/productService';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebase";
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';
import GroceryProductDetail from "@/components/GroceryProductDetail";
import RelatedOffers from "@/components/RelatedOffers";
import SimplifiedGrocerySearch from "@/components/SimplifiedGrocerySearch";

const GroceryProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();

  // Products state
  const [groceryProducts, setGroceryProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
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

          {/* Simplified Grocery Search Component */}
          <SimplifiedGrocerySearch initialQuery={searchQuery} />

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-safebite-teal mb-3" />
                <span className="text-safebite-text">Loading grocery products...</span>
              </div>
            </div>
          ) : groceryProducts.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-5">
                <div className="text-safebite-text">
                  <span className="font-medium">{totalProducts}</span> grocery products found
                </div>
                <Button
                  variant="outline"
                  className="text-safebite-text-secondary border-safebite-card-bg-alt h-9"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    fetchGroceryProductsData(1, '');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
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
                    <Card key={product._id} className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl overflow-hidden">
                      {/* Product Image */}
                      <div className="relative h-52 overflow-hidden bg-safebite-card-bg-alt">
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
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center bg-safebite-teal/90 text-safebite-dark-blue px-2.5 py-1 rounded-full backdrop-blur-sm text-xs font-medium shadow-md">
                            <Star className="h-3.5 w-3.5 mr-1 fill-safebite-dark-blue" />
                            <span>{typeof productRating === 'number' ? productRating.toFixed(1) : '4.0'}</span>
                          </div>
                        </div>
                        {/* Favorite button */}
                        <Button
                          onClick={() => handleToggleFavorite(product._id)}
                          variant="ghost"
                          size="icon"
                          className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full h-9 w-9 p-1.5 shadow-md"
                        >
                          <Heart className={`h-4.5 w-4.5 ${favorites.includes(product._id) ? 'fill-safebite-teal text-safebite-teal' : ''}`} />
                        </Button>
                        {/* Category badge */}
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md">
                          {productCategory}
                        </div>
                      </div>

                      <CardContent className="flex-grow p-5">
                        <h3 className="font-medium text-safebite-text mb-1.5 line-clamp-2 text-base">{productName}</h3>
                        <p className="text-safebite-text-secondary text-sm mb-3">{productBrand}</p>

                        {/* Price if available */}
                        {productPrice && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-safebite-teal font-medium text-base">₹{productPrice}</span>
                            {productMarketPrice && productMarketPrice > productPrice && (
                              <span className="text-safebite-text-secondary line-through text-xs">₹{productMarketPrice}</span>
                            )}
                          </div>
                        )}

                        {/* Description if available */}
                        {product.description && (
                          <p className="text-safebite-text-secondary text-xs mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {product.tags?.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-safebite-card-bg-alt/50 px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                          {productType && (
                            <Badge variant="outline" className="text-xs bg-safebite-card-bg-alt/50 px-2 py-0.5">
                              {productType}
                            </Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0">
                        <Button
                          className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex items-center justify-center gap-2 h-10"
                          onClick={() => {
                            // Track this interaction
                            trackUserInteraction('view_grocery_details', {
                              productId: product._id,
                              productName: productName,
                              productCategory: productCategory
                            });

                            // Show product details in dialog
                            setSelectedProduct(product);
                            setIsDetailDialogOpen(true);
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
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      fetchGroceryProductsData(page, searchQuery);
                      // Scroll to top when changing pages
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <Card className="sci-fi-card mb-8 border-amber-500/20">
              <CardContent className="p-8 text-center">
                <div className="bg-amber-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-5 flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium text-safebite-text mb-3">No Grocery Products Found</h3>
                <p className="text-safebite-text-secondary mb-5 max-w-md mx-auto">
                  No grocery products match your search criteria. Try adjusting your filters or search terms.
                </p>
                <p className="text-safebite-text-secondary text-xs mb-5 max-w-md mx-auto bg-black/20 p-3 rounded-lg">
                  Note: The backend API may be experiencing issues. Please try again later or contact support if the problem persists.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    fetchGroceryProductsData(1, '');
                  }}
                  className="mt-4 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 h-10 px-6"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Search & Reload
                </Button>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs">
                    <Database className="h-3 w-3 text-safebite-teal" />
                    <span className="text-safebite-text-secondary">MongoDB Atlas Collection: Grocery Products</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full text-xs">
                    <Server className="h-3 w-3 text-safebite-teal" />
                    <span className="text-safebite-text-secondary">API Status: {isLoading ? 'Checking...' : 'Connection Failed'}</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-safebite-text-secondary">
                  Backend URL: {API_BASE_URL}
                </p>
              </CardContent>
            </Card>
          )}

          {/* We've removed the duplicate GrocerySearchTabs section to avoid confusion */}

          {/* Related Offers Section */}
          {searchQuery && (
            <div className="mt-10 mb-10">
              <RelatedOffers searchQuery={searchQuery} category="grocery" maxOffers={4} />
            </div>
          )}
        </div>
        <Footer />

        {/* Product Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl bg-safebite-dark-blue border-safebite-teal/30 p-0">
            {selectedProduct && (
              <GroceryProductDetail
                product={selectedProduct}
                onClose={() => setIsDetailDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default GroceryProductsPage;

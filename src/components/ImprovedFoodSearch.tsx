import React, { useState, useEffect } from 'react';
import { useGuestMode } from '@/hooks/useGuestMode';
import { Search, Filter, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from '@/utils/apiUtils';

interface FoodItem {
  _id: string;
  name?: string;
  product?: string;
  food_name?: string;
  recipe_name?: string;
  brand?: string;
  category?: string;
  description?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  sale_price?: number;
  market_price?: number;
  rating?: number;
  imageUrl?: string;
}

interface ImprovedFoodSearchProps {
  onSelectFood?: (food: FoodItem) => void;
  className?: string;
}

const ImprovedFoodSearch: React.FC<ImprovedFoodSearchProps> = ({ onSelectFood, className = '' }) => {
  const { isGuest } = useGuestMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'recipes'>('all');
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      setApiStatus(response.ok);
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // First try the new API endpoint
      const url = `${API_BASE_URL}/api/food/search?query=${encodeURIComponent(searchQuery)}`;
      console.log(`Searching food: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.items && Array.isArray(data.items)) {
        setSearchResults(data.items);
        console.log(`Found ${data.items.length} results`);
      } else {
        setSearchResults([]);
        console.log('No results found or invalid response format');
      }
    } catch (error) {
      console.error('Error searching food:', error);
      setError('Failed to search for food. Please try again later.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const getFoodName = (food: FoodItem): string => {
    return food.name || food.product || food.food_name || food.recipe_name || 'Unknown Food';
  };

  const getBrand = (food: FoodItem): string => {
    return food.brand || 'Unknown Brand';
  };

  const getCalories = (food: FoodItem): number | undefined => {
    if (food.nutritionalInfo?.calories) {
      return food.nutritionalInfo.calories;
    }
    return undefined;
  };

  const filteredResults = searchResults.filter(food => {
    if (activeTab === 'all') return true;
    if (activeTab === 'products' && food.product) return true;
    if (activeTab === 'recipes' && food.recipe_name) return true;
    return false;
  });

  return (
    <Card className={`sci-fi-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Food Search</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={apiStatus ? "default" : "destructive"} className="h-6">
              {apiStatus === null ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : apiStatus ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              API {apiStatus === null ? 'Checking...' : apiStatus ? 'Online' : 'Offline'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={checkApiStatus}
              disabled={apiStatus === null}
            >
              Refresh
            </Button>
          </div>
        </div>
        <CardDescription>
          Search for food products, recipes, and nutritional information
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search for food, recipes, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sci-fi-input flex-1"
            />
            <Button
              type="submit"
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
              Search
            </Button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">All ({searchResults.length})</TabsTrigger>
              <TabsTrigger value="products">Products ({searchResults.filter(f => f.product).length})</TabsTrigger>
              <TabsTrigger value="recipes">Recipes ({searchResults.filter(f => f.recipe_name).length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-4" />
                        <div className="flex space-x-2 mb-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredResults.length > 0 ? (
                filteredResults.map((food) => (
                  <Card
                    key={food._id}
                    className="overflow-hidden hover:border-safebite-teal transition-colors cursor-pointer"
                    onClick={() => onSelectFood && onSelectFood(food)}
                  >
                    <CardContent className="p-0">
                      <div className="p-4">
                        <h3 className="font-medium text-safebite-text">{getFoodName(food)}</h3>
                        <p className="text-sm text-safebite-text-secondary">{getBrand(food)}</p>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {food.category && (
                            <Badge variant="outline">{food.category}</Badge>
                          )}
                          {getCalories(food) !== undefined && (
                            <Badge className="bg-safebite-purple/20 text-safebite-purple border-safebite-purple">
                              <Flame className="h-3 w-3 mr-1" />
                              {getCalories(food)} kcal
                            </Badge>
                          )}
                          {food.rating && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              ★ {food.rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>

                        {food.description && (
                          <p className="text-xs text-safebite-text-secondary mt-2 line-clamp-2">
                            {food.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-safebite-text-secondary">
                  No results found for "{searchQuery}" in this category.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!isLoading && searchResults.length === 0 && !error && searchQuery && (
          <div className="text-center py-8 text-safebite-text-secondary">
            No results found for "{searchQuery}". Try a different search term.
          </div>
        )}

        {!isLoading && searchResults.length === 0 && !error && !searchQuery && (
          <div className="text-center py-8 text-safebite-text-secondary">
            Enter a search term to find food products and recipes.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedFoodSearch;

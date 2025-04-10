import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, Clock, Tag, ChefHat, BookOpen, ExternalLink } from 'lucide-react';
import { searchRecipes } from '@/utils/calorieNinjasApi';
import { trackUserInteraction } from '@/services/mlService';

interface Recipe {
  title: string;
  ingredients: string[];
  servings: string;
  instructions: string[];
  tags: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
}

interface RecipeSearchProps {
  isGuest?: boolean;
}

const RecipeSearch = ({ isGuest = false }: RecipeSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search query required',
        description: 'Please enter a search term to find recipes.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Track this interaction
      trackUserInteraction('recipe_search', { query: searchQuery, isGuest });
      
      const result = await searchRecipes(searchQuery);
      
      if (result && result.recipes && Array.isArray(result.recipes)) {
        setRecipes(result.recipes);
        
        if (result.recipes.length === 0) {
          toast({
            title: 'No recipes found',
            description: `No recipes found for "${searchQuery}". Try a different search term.`,
            variant: 'default',
          });
        } else {
          toast({
            title: 'Recipes found',
            description: `Found ${result.recipes.length} recipes for "${searchQuery}".`,
            variant: 'default',
          });
        }
      } else {
        setRecipes([]);
        setError('Invalid response from recipe API');
        toast({
          title: 'Search error',
          description: 'Received invalid data from the recipe API.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Recipe search error:', error);
      setRecipes([]);
      setError(error.message || 'Failed to search recipes');
      toast({
        title: 'Search failed',
        description: error.message || 'An error occurred while searching for recipes.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChefHat className="mr-2 h-5 w-5 text-safebite-teal" />
            Recipe Search
          </CardTitle>
          <CardDescription>
            Search for recipes using CalorieNinjas API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-safebite-text-secondary" />
              <Input
                placeholder="Search recipes (e.g., chicken pasta, vegan dessert)..."
                className="sci-fi-input pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recipe Results */}
      {recipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-safebite-text">
            Found {recipes.length} recipes for "{searchQuery}"
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <Card key={index} className="sci-fi-card overflow-hidden flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipe.tags && recipe.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className="text-xs px-2 py-1 rounded-full bg-safebite-teal/10 text-safebite-teal">
                        {tag}
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center gap-4 mb-4">
                    {recipe.prepTimeMinutes && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-safebite-text-secondary mr-1" />
                        <span className="text-xs text-safebite-text-secondary">
                          Prep: {recipe.prepTimeMinutes} min
                        </span>
                      </div>
                    )}
                    {recipe.cookTimeMinutes && (
                      <div className="flex items-center">
                        <ChefHat className="h-4 w-4 text-safebite-text-secondary mr-1" />
                        <span className="text-xs text-safebite-text-secondary">
                          Cook: {recipe.cookTimeMinutes} min
                        </span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-safebite-text-secondary mr-1" />
                        <span className="text-xs text-safebite-text-secondary">
                          Serves: {recipe.servings}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-safebite-text mb-2">Ingredients:</h4>
                    <ul className="text-xs text-safebite-text-secondary space-y-1">
                      {recipe.ingredients.slice(0, 5).map((ingredient, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-safebite-teal mr-1">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                      {recipe.ingredients.length > 5 && (
                        <li className="text-xs text-safebite-text-secondary">
                          +{recipe.ingredients.length - 5} more ingredients
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    onClick={() => {
                      // Track this interaction
                      trackUserInteraction('view_recipe_details', { 
                        recipe: recipe.title,
                        isGuest 
                      });
                      
                      // Show recipe details in a modal or navigate to a details page
                      toast({
                        title: 'Recipe Details',
                        description: 'Full recipe details view is coming soon!',
                        variant: 'default',
                      });
                    }}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Full Recipe
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* API Attribution */}
      <div className="text-center">
        <a
          href="https://calorieninjas.com/api"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-safebite-text-secondary hover:text-safebite-teal"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Powered by CalorieNinjas API
        </a>
      </div>
    </div>
  );
};

export default RecipeSearch;

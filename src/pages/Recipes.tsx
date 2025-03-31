
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from '@/components/DashboardSidebar';
import Loader from '@/components/Loader';
import { Search, Filter, ChefHat, Bookmark, Star, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  servings: number;
  cookTime: number;
  healthLabels: string[];
  source: string;
}

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Mock recipe data (in real app, this would come from Edamam API)
  const mockRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Chickpea Curry with Brown Rice',
      image: 'https://source.unsplash.com/random/300x200/?curry',
      calories: 450,
      servings: 4,
      cookTime: 30,
      healthLabels: ['Vegetarian', 'High Protein', 'Dairy-Free'],
      source: 'Edamam'
    },
    {
      id: '2',
      title: 'Spinach and Paneer Paratha',
      image: 'https://source.unsplash.com/random/300x200/?paratha',
      calories: 320,
      servings: 2,
      cookTime: 20,
      healthLabels: ['Vegetarian', 'Low Carb'],
      source: 'FatSecret'
    },
    {
      id: '3',
      title: 'Masala Dosa with Sambhar',
      image: 'https://source.unsplash.com/random/300x200/?dosa',
      calories: 380,
      servings: 2,
      cookTime: 25,
      healthLabels: ['Vegetarian', 'Low Fat'],
      source: 'OpenSource'
    },
    {
      id: '4',
      title: 'Rajma Chawal (Kidney Bean Curry with Rice)',
      image: 'https://source.unsplash.com/random/300x200/?beans',
      calories: 520,
      servings: 4,
      cookTime: 40,
      healthLabels: ['Vegetarian', 'High Fiber', 'Protein Rich'],
      source: 'Edamam'
    },
    {
      id: '5',
      title: 'Aloo Gobi (Potato and Cauliflower Curry)',
      image: 'https://source.unsplash.com/random/300x200/?cauliflower',
      calories: 290,
      servings: 3,
      cookTime: 25,
      healthLabels: ['Vegan', 'Low Calorie'],
      source: 'FatSecret'
    }
  ];

  useEffect(() => {
    // Default recipes when page loads
    setRecipes(mockRecipes);
  }, []);

  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRecipes(filteredRecipes);
      setIsLoading(false);
      
      toast({
        title: `Found ${filteredRecipes.length} recipes`,
        description: filteredRecipes.length > 0 
          ? "Here are your recipe results" 
          : "Try a different search term",
      });
    }, 1000);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'all') {
      setRecipes(mockRecipes);
    } else {
      const source = tab.charAt(0).toUpperCase() + tab.slice(1);
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.source === source
      );
      setRecipes(filteredRecipes);
    }
  };

  const handleSaveRecipe = (recipeId: string) => {
    // In a real app, this would save to user's account
    toast({
      title: "Recipe saved",
      description: "Recipe added to your favorites",
    });
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <div className="absolute top-0 left-0 right-0 p-1 text-center bg-red-500 text-white text-xs">
        Under Development
      </div>
      
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Healthy Recipes</h1>
            <p className="text-safebite-text-secondary">
              Discover nutritious and delicious Indian recipes tailored to your health goals
            </p>
          </div>
          
          <div className="sci-fi-card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-safebite-text-secondary" />
                  <Input
                    placeholder="Search for recipes (e.g., vegetarian curry, low-calorie)"
                    className="sci-fi-input pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" className="sci-fi-button">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="mb-6">
            <div className="sci-fi-card mb-2 p-4">
              <TabsList className="grid grid-cols-4 gap-2">
                <TabsTrigger 
                  value="all" 
                  onClick={() => handleTabChange('all')}
                  className={activeTab === 'all' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  All Recipes
                </TabsTrigger>
                <TabsTrigger 
                  value="edamam" 
                  onClick={() => handleTabChange('edamam')}
                  className={activeTab === 'edamam' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  Edamam
                </TabsTrigger>
                <TabsTrigger 
                  value="fatsecret" 
                  onClick={() => handleTabChange('fatsecret')}
                  className={activeTab === 'fatsecret' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  FatSecret
                </TabsTrigger>
                <TabsTrigger 
                  value="opensource" 
                  onClick={() => handleTabChange('opensource')}
                  className={activeTab === 'opensource' ? "bg-safebite-teal text-safebite-dark-blue" : ""}
                >
                  Open Source
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="lg" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map(recipe => (
                    <Card key={recipe.id} className="sci-fi-card overflow-hidden">
                      <div className="relative h-48 w-full">
                        <img 
                          src={recipe.image} 
                          alt={recipe.title}
                          className="h-full w-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-safebite-purple text-white">
                          {recipe.source}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-safebite-text mb-2">{recipe.title}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {recipe.healthLabels.map((label, idx) => (
                            <Badge key={idx} variant="outline" className="border-safebite-teal text-safebite-teal">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-safebite-text-secondary mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{recipe.cookTime} min</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{recipe.servings} servings</span>
                          </div>
                          <div className="flex items-center">
                            <ChefHat className="h-4 w-4 mr-1" />
                            <span>{recipe.calories} cal</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <Button variant="outline" className="sci-fi-button">
                            View Recipe
                          </Button>
                          <Button 
                            variant="outline"
                            className="sci-fi-button"
                            onClick={() => handleSaveRecipe(recipe.id)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="edamam" className="mt-0">
              {/* Same content structure as "all" tab */}
            </TabsContent>
            
            <TabsContent value="fatsecret" className="mt-0">
              {/* Same content structure as "all" tab */}
            </TabsContent>
            
            <TabsContent value="opensource" className="mt-0">
              {/* Same content structure as "all" tab */}
            </TabsContent>
          </Tabs>
          
          <div className="text-xs text-safebite-text-secondary mt-6 text-right">
            Created by Aditya Shenvi
          </div>
        </div>
      </main>
    </div>
  );
};

export default Recipes;

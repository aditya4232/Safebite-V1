
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Search, Scan, AlertTriangle, CheckCircle, 
  XCircle, ArrowRight 
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import FoodSearchBar from '@/components/FoodSearchBar';
import FoodItemCard from '@/components/FoodItemCard';

interface FoodItem {
  id: number;
  name: string;
  image?: string;
  calories: number;
  nutritionScore: 'green' | 'yellow' | 'red';
  details?: {
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
    sugar: number;
    ingredients: string[];
    allergens: string[];
    additives: string[];
  };
}

const FoodSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showNoResults, setShowNoResults] = useState(false);

  const mockFoodData: FoodItem[] = [
    {
      id: 1,
      name: 'Organic Greek Yogurt',
      calories: 120,
      nutritionScore: 'green',
      details: {
        protein: 15,
        carbs: 6,
        fat: 4,
        sodium: 50,
        sugar: 5,
        ingredients: ['Milk', 'Live active cultures'],
        allergens: ['Milk'],
        additives: []
      }
    },
    {
      id: 2,
      name: 'Whole Wheat Bread',
      calories: 80,
      nutritionScore: 'green',
      details: {
        protein: 4,
        carbs: 15,
        fat: 1,
        sodium: 150,
        sugar: 2,
        ingredients: ['Whole wheat flour', 'Water', 'Yeast', 'Salt'],
        allergens: ['Wheat', 'Gluten'],
        additives: []
      }
    },
    {
      id: 3,
      name: 'Chocolate Chip Cookies',
      calories: 180,
      nutritionScore: 'red',
      details: {
        protein: 2,
        carbs: 24,
        fat: 9,
        sodium: 100,
        sugar: 15,
        ingredients: ['Wheat flour', 'Sugar', 'Butter', 'Chocolate chips'],
        allergens: ['Wheat', 'Milk', 'Soy'],
        additives: ['Artificial flavors', 'Preservatives']
      }
    },
    {
      id: 4,
      name: 'Veggie Burger',
      calories: 250,
      nutritionScore: 'yellow',
      details: {
        protein: 12,
        carbs: 30,
        fat: 8,
        sodium: 350,
        sugar: 3,
        ingredients: ['Black beans', 'Brown rice', 'Onions', 'Spices'],
        allergens: ['Soy'],
        additives: ['Natural flavors']
      }
    }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    setSelectedFood(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const results = mockFoodData.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(results);
      setShowNoResults(results.length === 0);
      setIsLoading(false);
    }, 1500);
  };

  const handleScan = () => {
    // Simulate barcode scanning
    setIsLoading(true);
    setSelectedFood(null);
    
    setTimeout(() => {
      // Return a random food item from our mock data
      const randomIndex = Math.floor(Math.random() * mockFoodData.length);
      const randomFood = mockFoodData[randomIndex];
      
      setSearchResults([randomFood]);
      setShowNoResults(false);
      setIsLoading(false);
    }, 1500);
  };

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-safebite-teal border-t-transparent rounded-full mb-4"></div>
          <p className="text-safebite-text-secondary">Searching for food data...</p>
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-safebite-text mb-2">No Results Found</h3>
          <p className="text-safebite-text-secondary mb-4">
            We couldn't find any food matching "{searchQuery}"
          </p>
          <Button 
            variant="outline" 
            className="sci-fi-button"
            onClick={() => setShowNoResults(false)}
          >
            Try a Different Search
          </Button>
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="grid grid-cols-1 gap-4">
          {searchResults.map(food => (
            <FoodItemCard
              key={food.id}
              name={food.name}
              calories={food.calories}
              nutritionScore={food.nutritionScore}
              onClick={() => handleFoodSelect(food)}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const renderFoodDetail = () => {
    if (!selectedFood) return null;

    const { name, calories, nutritionScore, details } = selectedFood;
    
    const scoreColors = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500'
    };

    const scoreLabels = {
      green: 'Good Choice',
      yellow: 'Moderate',
      red: 'Use Caution'
    };

    return (
      <div className="sci-fi-card">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold text-safebite-text">{name}</h3>
          <Badge className={`${scoreColors[nutritionScore]} text-white`}>
            {scoreLabels[nutritionScore]}
          </Badge>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-safebite-text mb-2">Nutrition Facts</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Calories</div>
                <div className="text-safebite-text font-bold">{details?.calories || calories} kcal</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Protein</div>
                <div className="text-safebite-text font-bold">{details?.protein}g</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Carbs</div>
                <div className="text-safebite-text font-bold">{details?.carbs}g</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Fat</div>
                <div className="text-safebite-text font-bold">{details?.fat}g</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Sodium</div>
                <div className="text-safebite-text font-bold">{details?.sodium}mg</div>
              </div>
              <div className="p-3 bg-safebite-card-bg-alt rounded-md">
                <div className="text-safebite-text-secondary text-sm">Sugar</div>
                <div className="text-safebite-text font-bold">{details?.sugar}g</div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-safebite-text mb-2">Ingredients</h4>
            <p className="text-safebite-text-secondary">
              {details?.ingredients.join(', ')}
            </p>
          </div>

          {details?.allergens && details.allergens.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {details.allergens.map(allergen => (
                  <Badge 
                    key={allergen} 
                    variant="outline"
                    className="border-yellow-500 text-yellow-500"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" /> {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {details?.additives && details.additives.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Additives</h4>
              <div className="flex flex-wrap gap-2">
                {details.additives.map(additive => (
                  <Badge 
                    key={additive} 
                    variant="outline"
                    className="border-red-500 text-red-500"
                  >
                    {additive}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {nutritionScore === 'red' && (
            <Card className="bg-red-500/10 border-red-500 p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-md font-medium text-red-400 mb-1">Health Concern</h5>
                  <p className="text-safebite-text-secondary text-sm">
                    This product contains high levels of sugar and artificial additives which may impact your health goals.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {nutritionScore === 'green' && (
            <Card className="bg-green-500/10 border-green-500 p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-md font-medium text-green-400 mb-1">Healthy Choice</h5>
                  <p className="text-safebite-text-secondary text-sm">
                    This product is a great fit for your health goals. It contains nutritious ingredients and minimal processing.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              className="sci-fi-button"
              onClick={() => setSelectedFood(null)}
            >
              Back to Results
            </Button>
            <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
              Add to Tracker
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Food Search</h1>
            <p className="text-safebite-text-secondary">Search for foods, scan barcodes, and get detailed nutrition information</p>
          </div>

          <div className="sci-fi-card mb-6">
            <FoodSearchBar 
              onSearch={handleSearch} 
              onScan={handleScan} 
            />
          </div>

          {selectedFood ? (
            renderFoodDetail()
          ) : (
            <div className="sci-fi-card">
              <h2 className="text-xl font-semibold text-safebite-text mb-4">
                {searchResults.length > 0 ? 'Search Results' : 'Popular Searches'}
              </h2>
              {renderSearchResults()}
              
              {(!searchResults.length && !showNoResults && !isLoading) && (
                <div className="grid grid-cols-1 gap-4">
                  <FoodItemCard
                    name="Breakfast Cereal"
                    calories={120}
                    nutritionScore="yellow"
                    onClick={() => handleSearch("cereal")}
                  />
                  <FoodItemCard
                    name="Protein Bars"
                    calories={200}
                    nutritionScore="yellow"
                    onClick={() => handleSearch("protein bar")}
                  />
                  <FoodItemCard
                    name="Yogurt"
                    calories={100}
                    nutritionScore="green"
                    onClick={() => handleSearch("yogurt")}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FoodSearch;

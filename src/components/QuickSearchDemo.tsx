import React, { useState, useEffect } from 'react';
import { Search, X, Shield, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FoodItem {
  name: string;
  healthScore: number;
  tags: string[];
  warning?: string;
}

const QuickSearchDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  
  const demoFoodItems: FoodItem[] = [
    { 
      name: 'Organic Quinoa', 
      healthScore: 9.5, 
      tags: ['Organic', 'Gluten-Free', 'High Protein'] 
    },
    { 
      name: 'Greek Yogurt', 
      healthScore: 8.7, 
      tags: ['Probiotic', 'High Protein', 'Calcium Rich'] 
    },
    { 
      name: 'Processed Cheese Slices', 
      healthScore: 4.2, 
      tags: ['Processed', 'High Sodium'], 
      warning: 'Contains artificial colors and preservatives' 
    },
    { 
      name: 'Chocolate Cereal', 
      healthScore: 3.8, 
      tags: ['High Sugar', 'Processed'], 
      warning: 'High in added sugars' 
    },
    { 
      name: 'Avocado', 
      healthScore: 9.8, 
      tags: ['Healthy Fats', 'Nutrient Dense', 'Fiber Rich'] 
    }
  ];

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const results = demoFoodItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (searchQuery === '') {
      setSearchResults([]);
    }
  }, [searchQuery]);

  if (!isOpen) {
    return (
      <Button
        onClick={toggleOpen}
        variant="outline"
        className="sci-fi-button flex items-center"
      >
        <Search className="mr-2 h-4 w-4" />
        Try Quick Search
      </Button>
    );
  }

  return (
    <div className="sci-fi-card p-4 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-safebite-text font-medium">Quick Food Search</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleOpen}
          className="h-8 w-8 rounded-full"
        >
          <X size={16} />
        </Button>
      </div>
      
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-safebite-text-secondary" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for a food item..."
          className="w-full pl-10 pr-4 py-2 bg-safebite-card-bg-alt rounded-md border border-safebite-card-bg-alt text-sm text-safebite-text focus:border-safebite-teal focus:ring-1 focus:ring-safebite-teal outline-none transition-colors"
        />
        <Button
          onClick={handleSearch}
          className="absolute inset-y-0 right-0 px-3 bg-safebite-teal text-safebite-dark-blue rounded-r-md"
        >
          Search
        </Button>
      </div>
      
      {isSearching ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-safebite-teal border-t-transparent rounded-full"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-3">
          {searchResults.map((item, index) => (
            <div 
              key={index} 
              className="p-3 bg-safebite-card-bg-alt rounded-md border border-safebite-card-bg-alt hover:border-safebite-teal/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-safebite-text font-medium">{item.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tag.includes('High Sugar') || tag.includes('Processed') 
                            ? 'bg-red-500/20 text-red-500' 
                            : 'bg-safebite-teal/20 text-safebite-teal'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  item.healthScore >= 7 
                    ? 'bg-green-500/20 text-green-500' 
                    : item.healthScore >= 5 
                      ? 'bg-yellow-500/20 text-yellow-500' 
                      : 'bg-red-500/20 text-red-500'
                }`}>
                  {item.healthScore.toFixed(1)}
                </div>
              </div>
              
              {item.warning && (
                <div className="mt-2 flex items-start text-xs text-red-500">
                  <AlertTriangle size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                  <span>{item.warning}</span>
                </div>
              )}
              
              {!item.warning && item.healthScore >= 7 && (
                <div className="mt-2 flex items-start text-xs text-green-500">
                  <Shield size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                  <span>Excellent nutritional profile</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : searchQuery && (
        <div className="text-center py-6 text-safebite-text-secondary">
          <p>No results found for "{searchQuery}"</p>
          <p className="text-xs mt-1">Try searching for "quinoa", "yogurt", "avocado", or "cereal"</p>
        </div>
      )}
      
      {!searchQuery && (
        <div className="text-center py-6 text-safebite-text-secondary">
          <p>Try searching for foods like "quinoa", "yogurt", "avocado", or "cereal"</p>
          <p className="text-xs mt-1">This is a demo of the SafeBite food search functionality</p>
        </div>
      )}
    </div>
  );
};

export default QuickSearchDemo;

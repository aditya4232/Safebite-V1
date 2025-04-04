import React from 'react';
import { Clock, Star, Tag, X, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodItem } from '@/services/foodApiService';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  isFavorite?: boolean;
  tags?: string[];
}

interface FoodSearchHistoryProps {
  historyItems: SearchHistoryItem[];
  recentFoods: FoodItem[];
  onHistoryItemClick: (query: string) => void;
  onFoodItemClick: (food: FoodItem) => void;
  onToggleFavorite: (id: string) => void;
  onRemoveHistoryItem: (id: string) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}

const FoodSearchHistory: React.FC<FoodSearchHistoryProps> = ({
  historyItems,
  recentFoods,
  onHistoryItemClick,
  onFoodItemClick,
  onToggleFavorite,
  onRemoveHistoryItem,
  onAddTag,
  onRemoveTag
}) => {
  const [newTag, setNewTag] = React.useState<string>('');
  const [activeTagInput, setActiveTagInput] = React.useState<string | null>(null);
  
  const handleAddTag = (id: string) => {
    if (newTag.trim()) {
      onAddTag(id, newTag.trim());
      setNewTag('');
      setActiveTagInput(null);
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-safebite-text mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-safebite-teal" />
          Search History
        </h3>
        
        {historyItems.length > 0 ? (
          <div className="space-y-3">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                className="sci-fi-card p-3 hover:bg-safebite-card-bg-alt/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-grow cursor-pointer"
                    onClick={() => onHistoryItemClick(item.query)}
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-safebite-text-secondary mr-2" />
                      <span className="text-safebite-text font-medium">{item.query}</span>
                      {item.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 ml-2 fill-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-safebite-text-secondary mt-1">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onToggleFavorite(item.id)}
                    >
                      <Star 
                        className={`h-4 w-4 ${item.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-safebite-text-secondary'}`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setActiveTagInput(activeTagInput === item.id ? null : item.id)}
                    >
                      <Tag className="h-4 w-4 text-safebite-text-secondary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onRemoveHistoryItem(item.id)}
                    >
                      <X className="h-4 w-4 text-safebite-text-secondary" />
                    </Button>
                  </div>
                </div>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="text-xs bg-safebite-card-bg-alt text-safebite-text-secondary flex items-center"
                      >
                        {tag}
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTag(item.id, tag);
                          }} 
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                
                {activeTagInput === item.id && (
                  <div className="mt-2 flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      className="sci-fi-input text-sm py-1 px-2 flex-grow"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(item.id);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="ml-2 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                      onClick={() => handleAddTag(item.id)}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-safebite-card-bg-alt/30 rounded-lg">
            <p className="text-safebite-text-secondary">No search history yet</p>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-safebite-text mb-4">
          Recently Viewed Foods
        </h3>
        
        {recentFoods.length > 0 ? (
          <div className="space-y-2">
            {recentFoods.map((food) => (
              <div 
                key={food.id} 
                className="sci-fi-card p-3 cursor-pointer hover:bg-safebite-card-bg-alt/50 transition-colors"
                onClick={() => onFoodItemClick(food)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-safebite-text font-medium">{food.name}</div>
                    <div className="text-xs text-safebite-text-secondary">
                      {food.calories} kcal | {food.apiSource || food.source}
                    </div>
                  </div>
                  
                  <Badge 
                    className={`
                      ${food.nutritionScore === 'green' ? 'bg-green-500' : 
                        food.nutritionScore === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'} 
                      text-white
                    `}
                  >
                    {food.nutritionScore === 'green' ? 'Healthy' : 
                     food.nutritionScore === 'yellow' ? 'Moderate' : 'Caution'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-safebite-card-bg-alt/30 rounded-lg">
            <p className="text-safebite-text-secondary">No recently viewed foods</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodSearchHistory;

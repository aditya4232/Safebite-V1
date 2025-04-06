import React, { useState } from 'react';
import {
  AlertTriangle, CheckCircle, XCircle,
  Leaf, Flame, Heart, Tag, Star, Share2,
  Bookmark, Clock, ArrowLeft, Plus, Zap,
  Bot, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FoodItem } from '@/services/foodApiService';

interface FoodDetailViewProps {
  food: FoodItem;
  onBack: () => void;
  onAddToTracker: (food: FoodItem) => void;
  onAddTag: (foodId: string, tag: string) => void;
  onToggleFavorite: (foodId: string) => void;
  isFavorite?: boolean;
  tags?: string[];
  aiAnalysis?: string;
  isAnalysisLoading?: boolean;
}

const FoodDetailView: React.FC<FoodDetailViewProps> = ({
  food,
  onBack,
  onAddToTracker,
  onAddTag,
  onToggleFavorite,
  isFavorite = false,
  tags = [],
  aiAnalysis = '',
  isAnalysisLoading = false
}) => {
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const { name, calories, nutritionScore, details, brand, apiSource, source } = food;

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

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(food.id, newTag.trim());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="sci-fi-card">
      <div className="flex justify-between items-start mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-safebite-text-secondary -ml-2"
          onClick={onBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-safebite-text-secondary"
            onClick={() => onToggleFavorite(food.id)}
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-safebite-text-secondary"
            onClick={() => setShowTagInput(!showTagInput)}
          >
            <Tag className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-safebite-text-secondary"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showTagInput && (
        <div className="mb-4 flex">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            className="sci-fi-input text-sm py-1 px-2 flex-grow"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTag();
              }
            }}
          />
          <Button
            size="sm"
            className="ml-2 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            onClick={handleAddTag}
          >
            Add
          </Button>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-safebite-card-bg-alt text-safebite-text-secondary"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-semibold text-safebite-text">{name}</h3>
          {brand && (
            <p className="text-safebite-text-secondary text-sm">{brand}</p>
          )}
        </div>
        <Badge className={`${scoreColors[nutritionScore]} text-white`}>
          {scoreLabels[nutritionScore]}
        </Badge>
      </div>

      <Tabs defaultValue="nutrition" className="w-full mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-safebite-card-bg-alt rounded-md">
              <div className="text-safebite-text-secondary text-sm">Calories</div>
              <div className="text-safebite-text font-bold">{details?.calories || calories} kcal</div>
            </div>
            <div className="p-3 bg-safebite-card-bg-alt rounded-md">
              <div className="text-safebite-text-secondary text-sm">Protein</div>
              <div className="text-safebite-text font-bold">{details?.protein || food.nutrients?.protein || 0}g</div>
            </div>
            <div className="p-3 bg-safebite-card-bg-alt rounded-md">
              <div className="text-safebite-text-secondary text-sm">Carbs</div>
              <div className="text-safebite-text font-bold">{details?.carbs || food.nutrients?.carbs || 0}g</div>
            </div>
            <div className="p-3 bg-safebite-card-bg-alt rounded-md">
              <div className="text-safebite-text-secondary text-sm">Fat</div>
              <div className="text-safebite-text font-bold">{details?.fat || food.nutrients?.fat || 0}g</div>
            </div>
            <div className="p-3 bg-safebite-card-bg-alt rounded-md">
              <div className="text-safebite-text-secondary text-sm">Sodium</div>
              <div className="text-safebite-text font-bold">{details?.sodium || 0}mg</div>
            </div>
            <div className="p-3 bg-safebite-card-bg-alt rounded-md">
              <div className="text-safebite-text-secondary text-sm">Sugar</div>
              <div className="text-safebite-text font-bold">{details?.sugar || food.nutrients?.sugar || 0}g</div>
            </div>
          </div>

          <div className="p-3 bg-safebite-card-bg-alt/50 rounded-md">
            <div className="text-safebite-text-secondary text-sm mb-1">Nutrition Score</div>
            <div className="h-2 bg-safebite-card-bg-alt rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  nutritionScore === 'green' ? 'bg-green-500' :
                  nutritionScore === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: nutritionScore === 'green' ? '90%' : nutritionScore === 'yellow' ? '50%' : '20%' }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-safebite-text-secondary mt-1">
              <span>Poor</span>
              <span>Moderate</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="text-xs text-safebite-text-secondary text-right">
            Data source: {apiSource || source || 'Unknown'}
          </div>
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-4">
          {details?.ingredients && details.ingredients.length > 0 ? (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Ingredients List</h4>
              <p className="text-safebite-text-secondary">
                {details.ingredients.join(', ')}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-safebite-text-secondary">No ingredient information available</p>
            </div>
          )}

          {details?.additives && details.additives.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Additives</h4>
              <div className="flex flex-wrap gap-2">
                {details.additives.map((additive: string) => (
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
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {details?.allergens && details.allergens.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-safebite-text mb-2">Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {details.allergens.map((allergen: string) => (
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

          {nutritionScore === 'yellow' && (
            <Card className="bg-yellow-500/10 border-yellow-500 p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-md font-medium text-yellow-500 mb-1">Moderate Choice</h5>
                  <p className="text-safebite-text-secondary text-sm">
                    This product is acceptable in moderation. Be mindful of portion sizes and frequency of consumption.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          {isAnalysisLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-safebite-teal mb-4" />
              <p className="text-safebite-text-secondary">Analyzing food item...</p>
            </div>
          ) : aiAnalysis ? (
            <div className="bg-safebite-card-bg-alt p-4 rounded-md">
              <div className="flex items-center mb-4">
                <Bot className="h-5 w-5 text-safebite-teal mr-2" />
                <h4 className="text-lg font-medium text-safebite-text">AI Nutritional Analysis</h4>
              </div>
              <div className="text-safebite-text-secondary">
                {aiAnalysis.split('\n').map((line, index) => {
                  // Check if line is a heading (starts with number and period or has a colon)
                  if (/^\d+\.\s/.test(line) || line.includes(':')) {
                    return (
                      <h5 key={index} className="font-semibold text-safebite-teal mt-3 mb-1">
                        {line}
                      </h5>
                    );
                  }
                  // Check if line is a bullet point
                  else if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                    return (
                      <div key={index} className="flex items-start ml-2 mb-1">
                        <span className="text-safebite-teal mr-2">•</span>
                        <p>{line.replace(/^[•\-]\s*/, '')}</p>
                      </div>
                    );
                  }
                  // Regular paragraph
                  else if (line.trim()) {
                    return <p key={index} className="mb-2">{line}</p>;
                  }
                  // Empty line
                  return <div key={index} className="h-2"></div>;
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-safebite-text-secondary">No AI analysis available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 border border-orange-500/30 bg-safebite-card-bg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full"></div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-md font-medium text-orange-500">Zomato + Swiggy</h4>
              <p className="text-xs text-safebite-text-secondary">
                Find this food on delivery apps
              </p>
            </div>
          </div>
          <Button
            disabled
            className="w-full mt-3 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 cursor-not-allowed"
          >
            <Clock className="mr-2 h-4 w-4" />
            Coming Soon
          </Button>
        </Card>

        <Card className="p-4 border border-safebite-teal/30 bg-safebite-card-bg">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-safebite-teal to-blue-500 flex items-center justify-center mr-3">
              <Bookmark className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="text-md font-medium text-safebite-teal">Add to Tracker</h4>
              <p className="text-xs text-safebite-text-secondary">
                Track your daily nutrition
              </p>
            </div>
          </div>
          <Button
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            onClick={() => onAddToTracker(food)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add to Tracker
          </Button>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          className="sci-fi-button"
          onClick={onBack}
        >
          Back to Results
        </Button>
        <Button
          className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          onClick={() => onAddToTracker(food)}
        >
          Add to Tracker
        </Button>
      </div>
    </div>
  );
};

export default FoodDetailView;

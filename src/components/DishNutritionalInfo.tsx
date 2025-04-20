import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, AlertTriangle, Info, Flame, 
  Droplet, Beef, Wheat, Apple 
} from 'lucide-react';

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  isVeg: boolean;
  allergens?: string[];
  healthScore: number;
  healthTags?: string[];
}

interface DishNutritionalInfoProps {
  dishName: string;
  nutritionalInfo: NutritionalInfo;
  className?: string;
}

const DishNutritionalInfo: React.FC<DishNutritionalInfoProps> = ({
  dishName,
  nutritionalInfo,
  className = ''
}) => {
  // Calculate recommended daily values percentages
  const caloriesPercent = Math.min(100, (nutritionalInfo.calories / 2000) * 100);
  const proteinPercent = Math.min(100, (nutritionalInfo.protein / 50) * 100);
  const carbsPercent = Math.min(100, (nutritionalInfo.carbs / 300) * 100);
  const fatPercent = Math.min(100, (nutritionalInfo.fat / 65) * 100);
  
  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Get health score text
  const getHealthScoreText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };
  
  return (
    <Card className={`sci-fi-card border-safebite-teal/30 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-safebite-text">Nutritional Information</h3>
          <Badge className={`${nutritionalInfo.isVeg ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {nutritionalInfo.isVeg ? (
              <span className="flex items-center">
                <Leaf className="h-3.5 w-3.5 mr-1" />
                Vegetarian
              </span>
            ) : (
              <span className="flex items-center">
                <Beef className="h-3.5 w-3.5 mr-1" />
                Non-Vegetarian
              </span>
            )}
          </Badge>
        </div>
        
        {/* Health Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-safebite-text">Health Score</span>
            <span className="text-sm font-medium text-safebite-text">{nutritionalInfo.healthScore}/100 ({getHealthScoreText(nutritionalInfo.healthScore)})</span>
          </div>
          <Progress 
            value={nutritionalInfo.healthScore} 
            className="h-2.5" 
            indicatorClassName={getHealthScoreColor(nutritionalInfo.healthScore)} 
          />
        </div>
        
        {/* Main Nutrients */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-safebite-text-secondary flex items-center">
                <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" />
                Calories
              </span>
              <span className="text-xs font-medium text-safebite-text">{nutritionalInfo.calories} kcal</span>
            </div>
            <Progress value={caloriesPercent} className="h-1.5" indicatorClassName="bg-orange-500" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-safebite-text-secondary flex items-center">
                <Beef className="h-3.5 w-3.5 mr-1 text-purple-500" />
                Protein
              </span>
              <span className="text-xs font-medium text-safebite-text">{nutritionalInfo.protein}g</span>
            </div>
            <Progress value={proteinPercent} className="h-1.5" indicatorClassName="bg-purple-500" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-safebite-text-secondary flex items-center">
                <Wheat className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                Carbs
              </span>
              <span className="text-xs font-medium text-safebite-text">{nutritionalInfo.carbs}g</span>
            </div>
            <Progress value={carbsPercent} className="h-1.5" indicatorClassName="bg-yellow-500" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-safebite-text-secondary flex items-center">
                <Droplet className="h-3.5 w-3.5 mr-1 text-blue-500" />
                Fat
              </span>
              <span className="text-xs font-medium text-safebite-text">{nutritionalInfo.fat}g</span>
            </div>
            <Progress value={fatPercent} className="h-1.5" indicatorClassName="bg-blue-500" />
          </div>
        </div>
        
        {/* Additional Nutrients */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {nutritionalInfo.fiber !== undefined && (
            <div className="bg-safebite-card-bg-alt/30 p-2 rounded text-center">
              <span className="block text-xs text-safebite-text-secondary">Fiber</span>
              <span className="block text-sm font-medium text-safebite-text">{nutritionalInfo.fiber}g</span>
            </div>
          )}
          
          {nutritionalInfo.sugar !== undefined && (
            <div className="bg-safebite-card-bg-alt/30 p-2 rounded text-center">
              <span className="block text-xs text-safebite-text-secondary">Sugar</span>
              <span className="block text-sm font-medium text-safebite-text">{nutritionalInfo.sugar}g</span>
            </div>
          )}
          
          {nutritionalInfo.sodium !== undefined && (
            <div className="bg-safebite-card-bg-alt/30 p-2 rounded text-center">
              <span className="block text-xs text-safebite-text-secondary">Sodium</span>
              <span className="block text-sm font-medium text-safebite-text">{nutritionalInfo.sodium}mg</span>
            </div>
          )}
          
          {nutritionalInfo.cholesterol !== undefined && (
            <div className="bg-safebite-card-bg-alt/30 p-2 rounded text-center">
              <span className="block text-xs text-safebite-text-secondary">Cholesterol</span>
              <span className="block text-sm font-medium text-safebite-text">{nutritionalInfo.cholesterol}mg</span>
            </div>
          )}
        </div>
        
        {/* Health Tags */}
        {nutritionalInfo.healthTags && nutritionalInfo.healthTags.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-safebite-text-secondary mb-2">Health Tags:</p>
            <div className="flex flex-wrap gap-1.5">
              {nutritionalInfo.healthTags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
                  <Leaf className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Allergens */}
        {nutritionalInfo.allergens && nutritionalInfo.allergens.length > 0 && (
          <div>
            <div className="flex items-center text-xs text-safebite-text-secondary mb-2">
              <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-500" />
              <span>Allergens:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nutritionalInfo.allergens.map((allergen, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DishNutritionalInfo;

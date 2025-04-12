
import { cn } from "@/lib/utils";
import { Flame, Leaf, AlertTriangle } from 'lucide-react';

interface FoodItemCardProps {
  name: string;
  image?: string;
  calories: number;
  nutritionScore: 'green' | 'yellow' | 'red';
  nutrients?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  onClick?: () => void;
  className?: string;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({
  name,
  image,
  calories,
  nutritionScore,
  nutrients = {},
  onClick,
  className
}) => {
  const scoreColors = {
    green: { bg: 'bg-green-500', text: 'text-green-500', icon: <Leaf className="h-4 w-4 text-green-500" /> },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', icon: <Flame className="h-4 w-4 text-yellow-500" /> },
    red: { bg: 'bg-red-500', text: 'text-red-500', icon: <AlertTriangle className="h-4 w-4 text-red-500" /> }
  };

  const scoreLabels = {
    green: 'Healthy',
    yellow: 'Moderate',
    red: 'High Calorie'
  };

  return (
    <div
      className={cn(
        "sci-fi-card p-4 cursor-pointer hover:border-safebite-teal/50 transition-all duration-300",
        className
      )}
      onClick={onClick}
    >
      <div className="flex">
        <div className="relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden mr-4 border border-safebite-card-bg-alt">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-safebite-card-bg-alt flex items-center justify-center">
              <span className="text-safebite-text-secondary text-xs">No image</span>
            </div>
          )}
          <div className={`absolute bottom-0 left-0 right-0 ${scoreColors[nutritionScore].bg} h-2`}></div>
        </div>
        <div className="flex-1">
          <h3 className="text-safebite-text font-semibold mb-1 line-clamp-1">{name}</h3>
          <div className="flex items-center mb-2">
            <Flame className="h-4 w-4 text-safebite-teal mr-1" />
            <p className="text-safebite-text-secondary text-sm">{calories} calories</p>
          </div>

          <div className="flex items-center mb-2">
            <div className="flex items-center mr-3">
              {scoreColors[nutritionScore].icon}
              <span className={`text-xs ml-1 ${scoreColors[nutritionScore].text}`}>{scoreLabels[nutritionScore]}</span>
            </div>
          </div>

          {nutrients && (nutrients.protein || nutrients.carbs || nutrients.fat) && (
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-safebite-text-secondary">
              {nutrients.protein !== undefined && (
                <div>
                  <span className="font-medium">Protein:</span> {nutrients.protein}g
                </div>
              )}
              {nutrients.carbs !== undefined && (
                <div>
                  <span className="font-medium">Carbs:</span> {nutrients.carbs}g
                </div>
              )}
              {nutrients.fat !== undefined && (
                <div>
                  <span className="font-medium">Fat:</span> {nutrients.fat}g
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;

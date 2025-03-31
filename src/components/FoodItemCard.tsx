
import { cn } from "@/lib/utils";

interface FoodItemCardProps {
  name: string;
  image?: string;
  calories: number;
  nutritionScore: 'green' | 'yellow' | 'red';
  onClick?: () => void;
  className?: string;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ 
  name, 
  image, 
  calories, 
  nutritionScore,
  onClick,
  className 
}) => {
  const scoreColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div 
      className={cn(
        "sci-fi-card flex cursor-pointer", 
        className
      )}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden mr-4 border border-safebite-card-bg-alt">
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
        <div className={`absolute bottom-0 left-0 right-0 ${scoreColors[nutritionScore]} h-2`}></div>
      </div>
      <div className="flex-1">
        <h3 className="text-safebite-text font-semibold mb-1">{name}</h3>
        <p className="text-safebite-text-secondary text-sm mb-2">{calories} calories per serving</p>
        <div className="flex items-center">
          <span className="text-xs mr-2">Nutrition Score:</span>
          <span className={`inline-block w-3 h-3 rounded-full ${scoreColors[nutritionScore]}`}></span>
        </div>
      </div>
    </div>
  );
};

export default FoodItemCard;

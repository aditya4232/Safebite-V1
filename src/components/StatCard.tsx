
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change,
  className 
}) => {
  return (
    <div className={cn(
      "sci-fi-card flex flex-col", 
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-safebite-text-secondary font-medium">{title}</h3>
        <div className="text-safebite-teal">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-safebite-text mb-2">{value}</div>
      {change && (
        <div className={`text-sm font-medium ${
          change.isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {change.isPositive ? '↑' : '↓'} {change.value} from last week
        </div>
      )}
    </div>
  );
};

export default StatCard;

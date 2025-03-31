
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon,
  className 
}) => {
  return (
    <div className={cn(
      "sci-fi-card group", 
      className
    )}>
      <div className="mb-4 inline-block p-3 rounded-full bg-safebite-card-bg-alt text-safebite-teal group-hover:text-safebite-dark-blue group-hover:bg-safebite-teal transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-safebite-text group-hover:text-safebite-teal transition-colors duration-300">
        {title}
      </h3>
      <p className="text-safebite-text-secondary">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;

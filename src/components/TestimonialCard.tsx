
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  quote, 
  author, 
  role, 
  avatar,
  className 
}) => {
  return (
    <div className={cn(
      "sci-fi-card flex flex-col", 
      className
    )}>
      <div className="mb-6">
        <p className="text-safebite-text-secondary italic">"{quote}"</p>
      </div>
      <div className="flex items-center">
        {avatar ? (
          <img 
            src={avatar} 
            alt={author} 
            className="w-12 h-12 rounded-full mr-4 border-2 border-safebite-teal"
          />
        ) : (
          <div className="w-12 h-12 rounded-full mr-4 bg-safebite-card-bg-alt flex items-center justify-center border-2 border-safebite-teal">
            <span className="text-safebite-teal text-lg font-bold">
              {author.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <p className="text-safebite-text font-semibold">{author}</p>
          <p className="text-safebite-text-secondary text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;

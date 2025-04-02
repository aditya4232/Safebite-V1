
import { useState } from 'react';
import { Search, Scan } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FoodSearchBarProps {
  onSearch: (query: string) => void;
  onScan?: () => void;
  className?: string;
}

const FoodSearchBar: React.FC<FoodSearchBarProps> = ({ 
  onSearch, 
  onScan,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search for food products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sci-fi-input w-full pr-24"
        />
        <div className="absolute right-0 flex">
          {onScan && (
            <Button
              type="button"
              variant="ghost"
              onClick={onScan}
              className="text-safebite-text-secondary hover:text-safebite-teal"
            >
              <Scan size={20} />
            </Button>
          )}
          <Button 
            type="submit"
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 ml-1"
          >
            <Search size={20} />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FoodSearchBar;

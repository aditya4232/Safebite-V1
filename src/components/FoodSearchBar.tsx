import { useState } from 'react';
import { Search, Scan, Upload, History, Database } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FoodSearchBarProps {
  onSearch: (query: string) => void;
  onScan: () => void;
  onUpload: () => void;
  onShowHistory: () => void;
  onApiSelect: () => void;
  className?: string;
  activeApi?: string;
}

const FoodSearchBar: React.FC<FoodSearchBarProps> = ({
  onSearch,
  onScan,
  onUpload,
  onShowHistory,
  onApiSelect,
  className,
  activeApi = 'All APIs'
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search for food products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sci-fi-input w-full pr-[140px]"
        />
        <div className="absolute right-0 flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onShowHistory}
                  className="text-safebite-text-secondary hover:text-safebite-teal"
                >
                  <History size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search History</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onApiSelect}
                  className="text-safebite-text-secondary hover:text-safebite-teal"
                >
                  <Database size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select API Source ({activeApi})</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={isMobile() ? onScan : onUpload}
                  className="text-safebite-text-secondary hover:text-safebite-teal"
                >
                  {isMobile() ? <Scan size={18} /> : <Upload size={18} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMobile() ? 'Scan Barcode' : 'Upload Image'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            type="submit"
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 ml-1"
          >
            <Search size={18} />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FoodSearchBar;

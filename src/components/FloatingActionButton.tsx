import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronUp, 
  Search, 
  User, 
  Heart, 
  Shield, 
  HelpCircle 
} from 'lucide-react';

const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Sub buttons that appear when the main button is clicked */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-3 mb-3 items-center">
          <button
            onClick={() => handleAction('/search')}
            className="w-10 h-10 rounded-full bg-safebite-card-bg border border-safebite-teal/50 text-safebite-teal flex items-center justify-center shadow-lg hover:bg-safebite-teal hover:text-safebite-dark-blue transition-colors group relative"
            aria-label="Search"
          >
            <Search size={18} />
            <span className="absolute right-full mr-2 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-md px-2 py-1 text-xs text-safebite-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Search
            </span>
          </button>
          
          <button
            onClick={() => handleAction('/auth/login')}
            className="w-10 h-10 rounded-full bg-safebite-card-bg border border-safebite-teal/50 text-safebite-teal flex items-center justify-center shadow-lg hover:bg-safebite-teal hover:text-safebite-dark-blue transition-colors group relative"
            aria-label="Login"
          >
            <User size={18} />
            <span className="absolute right-full mr-2 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-md px-2 py-1 text-xs text-safebite-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Login
            </span>
          </button>
          
          <button
            onClick={() => handleAction('/healthbox')}
            className="w-10 h-10 rounded-full bg-safebite-card-bg border border-safebite-teal/50 text-safebite-teal flex items-center justify-center shadow-lg hover:bg-safebite-teal hover:text-safebite-dark-blue transition-colors group relative"
            aria-label="Health Tools"
          >
            <Heart size={18} />
            <span className="absolute right-full mr-2 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-md px-2 py-1 text-xs text-safebite-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Health Tools
            </span>
          </button>
          
          <button
            onClick={() => handleAction('/products')}
            className="w-10 h-10 rounded-full bg-safebite-card-bg border border-safebite-teal/50 text-safebite-teal flex items-center justify-center shadow-lg hover:bg-safebite-teal hover:text-safebite-dark-blue transition-colors group relative"
            aria-label="Products"
          >
            <Shield size={18} />
            <span className="absolute right-full mr-2 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-md px-2 py-1 text-xs text-safebite-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Products
            </span>
          </button>
          
          <button
            onClick={() => handleAction('/help')}
            className="w-10 h-10 rounded-full bg-safebite-card-bg border border-safebite-teal/50 text-safebite-teal flex items-center justify-center shadow-lg hover:bg-safebite-teal hover:text-safebite-dark-blue transition-colors group relative"
            aria-label="Help"
          >
            <HelpCircle size={18} />
            <span className="absolute right-full mr-2 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-md px-2 py-1 text-xs text-safebite-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Help
            </span>
          </button>
        </div>
      )}
      
      {/* Main floating action button */}
      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center shadow-lg hover:bg-safebite-teal/90 transition-all ${isOpen ? 'rotate-180' : ''}`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default FloatingActionButton;

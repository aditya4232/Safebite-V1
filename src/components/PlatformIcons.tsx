import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

// Define platform colors for consistent styling
export const PLATFORM_COLORS = {
  blinkit: {
    primary: '#F9D923',
    secondary: '#F9D923',
    badge: 'bg-yellow-500/80 text-black font-medium',
    card: 'hover:border-yellow-400/70 hover:shadow-[0_0_15px_rgba(249,217,35,0.3)]',
    icon: <div className="h-4 w-4 mr-2 bg-yellow-500 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-2.5 w-2.5 text-black" />
          </div>
  },
  zepto: {
    primary: '#8C52FF',
    secondary: '#8C52FF',
    badge: 'bg-purple-600/80 text-white font-medium',
    card: 'hover:border-purple-400/70 hover:shadow-[0_0_15px_rgba(140,82,255,0.3)]',
    icon: <div className="h-4 w-4 mr-2 bg-purple-600 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-2.5 w-2.5 text-white" />
          </div>
  },
  instamart: {
    primary: '#FC8019',
    secondary: '#FC8019',
    badge: 'bg-orange-500/80 text-white font-medium',
    card: 'hover:border-orange-400/70 hover:shadow-[0_0_15px_rgba(252,128,25,0.3)]',
    icon: <div className="h-4 w-4 mr-2 bg-orange-500 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-2.5 w-2.5 text-white" />
          </div>
  },
  bigbasket: {
    primary: '#84C225',
    secondary: '#84C225',
    badge: 'bg-green-600/80 text-white font-medium',
    card: 'hover:border-green-400/70 hover:shadow-[0_0_15px_rgba(132,194,37,0.3)]',
    icon: <div className="h-4 w-4 mr-2 bg-green-600 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-2.5 w-2.5 text-white" />
          </div>
  },
  all: {
    primary: '#10B981',
    secondary: '#10B981',
    badge: 'bg-black/50 text-white',
    card: 'hover:border-safebite-teal/50 hover:shadow-neon-teal',
    icon: <ShoppingBag className="h-4 w-4 mr-2 text-safebite-teal" />
  }
};

interface PlatformIconProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 'md' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const platformKey = platform.toLowerCase() as keyof typeof PLATFORM_COLORS;
  const platformInfo = PLATFORM_COLORS[platformKey] || PLATFORM_COLORS.all;
  
  // Size classes
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  // Preload the image
  useEffect(() => {
    const img = new Image();
    img.src = `/images/${platform.toLowerCase()}-logo.png`;
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(false);
  }, [platform]);
  
  if (imageLoaded) {
    return (
      <img 
        src={`/images/${platform.toLowerCase()}-logo.png`} 
        alt={platform} 
        className={`${sizeClasses[size]} mr-2 object-contain`}
        onError={() => setImageLoaded(false)}
      />
    );
  }
  
  // Fallback to the colored icon
  return platformInfo.icon;
};

export default PlatformIcon;

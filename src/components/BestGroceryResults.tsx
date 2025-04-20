import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Info, ShoppingCart, Sparkles, Award, Leaf, Shield, Zap } from 'lucide-react';
import { GroceryProduct } from '@/types/groceryTypes';
import PlatformIcon from './PlatformIcons';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';

interface BestGroceryResultsProps {
  products: GroceryProduct[];
  searchQuery: string;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  onViewDetails: (product: GroceryProduct) => void;
  onBuyNow: (product: GroceryProduct) => void;
}

const BestGroceryResults: React.FC<BestGroceryResultsProps> = ({
  products,
  searchQuery,
  favorites,
  onToggleFavorite,
  onViewDetails,
  onBuyNow
}) => {
  const { isGuest } = useGuestMode();
  
  // If no products, don't render anything
  if (!products || products.length === 0) {
    return null;
  }
  
  // Get the top 3 products
  const bestProducts = products.slice(0, 3);
  
  // Determine badges for each product
  const getBadges = (product: GroceryProduct, index: number) => {
    const badges = [];
    
    // Add a badge based on position
    if (index === 0) {
      badges.push({ icon: Award, text: 'Best Match', color: 'bg-amber-500/90 text-white' });
    } else if (index === 1) {
      badges.push({ icon: Leaf, text: 'Healthiest Option', color: 'bg-green-500/90 text-white' });
    } else if (index === 2) {
      badges.push({ icon: Zap, text: 'Best Value', color: 'bg-blue-500/90 text-white' });
    }
    
    // Add additional badges based on product properties
    if (product.nutritional_info?.protein > 15) {
      badges.push({ icon: Shield, text: 'High Protein', color: 'bg-purple-500/90 text-white' });
    }
    
    if (product.market_price && product.price && (product.market_price - product.price) / product.market_price > 0.2) {
      badges.push({ icon: Sparkles, text: 'Great Deal', color: 'bg-pink-500/90 text-white' });
    }
    
    return badges;
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-amber-500 mr-2" />
        <h2 className="text-xl font-semibold text-safebite-text">Best Results for "{searchQuery}"</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bestProducts.map((product, index) => {
          // Get product name (handle different field names)
          const productName = product.name || product.product || 'Unknown Product';
          const productBrand = product.brand || product.Brand || 'Generic Brand';
          const productCategory = product.category || product.sub_category || product.Category || 'Grocery';
          const productRating = product.rating || product.healthScore || 4.0;
          const productPrice = product.price || product.sale_price || null;
          const productMarketPrice = product.market_price || null;
          
          // Get badges for this product
          const badges = getBadges(product, index);
          
          return (
            <Card 
              key={product._id} 
              className="sci-fi-card hover:border-safebite-teal/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-xl overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-52 overflow-hidden bg-safebite-card-bg-alt">
                <img
                  src={product.image_url}
                  alt={productName}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    // Fallback image if the main one fails to load
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(productName)}`;
                  }}
                />
                {/* Health score overlay */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center bg-safebite-teal/90 text-safebite-dark-blue px-2.5 py-1 rounded-full backdrop-blur-sm text-xs font-medium shadow-md">
                    <Star className="h-3.5 w-3.5 mr-1 fill-safebite-dark-blue" />
                    <span>{typeof productRating === 'number' ? productRating.toFixed(1) : '4.0'}</span>
                  </div>
                </div>
                {/* Favorite button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(product._id);
                  }}
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full h-9 w-9 p-1.5 shadow-md"
                >
                  <Heart className={`h-4.5 w-4.5 ${favorites.includes(product._id) ? 'fill-safebite-teal text-safebite-teal' : ''}`} />
                </Button>
                {/* Platform badge */}
                {product.platform && (
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm shadow-md flex items-center">
                    <PlatformIcon platform={product.platform} size="xs" />
                    <span className="ml-1">{product.platform}</span>
                  </div>
                )}
                
                {/* Best match badge */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                  {badges.map((badge, badgeIndex) => (
                    <Badge 
                      key={badgeIndex} 
                      className={`${badge.color} mb-1 flex items-center shadow-md`}
                    >
                      <badge.icon className="h-3.5 w-3.5 mr-1" />
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              </div>

              <CardContent className="flex-grow p-5">
                <h3 className="font-medium text-safebite-text mb-1.5 line-clamp-2 text-base">{productName}</h3>
                <p className="text-safebite-text-secondary text-sm mb-3">{productBrand}</p>

                {/* Price if available */}
                {productPrice && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-safebite-teal font-medium text-base">₹{productPrice}</span>
                    {productMarketPrice && productMarketPrice > productPrice && (
                      <span className="text-safebite-text-secondary line-through text-xs">₹{productMarketPrice}</span>
                    )}
                  </div>
                )}

                {/* Nutritional info if available */}
                {product.nutritional_info && (
                  <div className="grid grid-cols-3 gap-1 mb-3">
                    {product.nutritional_info.calories !== undefined && (
                      <div className="bg-safebite-card-bg-alt/30 p-1 rounded text-center">
                        <span className="block font-medium text-xs">{product.nutritional_info.calories}</span>
                        <span className="text-safebite-text-secondary text-xs">Cal</span>
                      </div>
                    )}
                    {product.nutritional_info.protein !== undefined && (
                      <div className="bg-safebite-card-bg-alt/30 p-1 rounded text-center">
                        <span className="block font-medium text-xs">{product.nutritional_info.protein}g</span>
                        <span className="text-safebite-text-secondary text-xs">Protein</span>
                      </div>
                    )}
                    {product.nutritional_info.carbs !== undefined && (
                      <div className="bg-safebite-card-bg-alt/30 p-1 rounded text-center">
                        <span className="block font-medium text-xs">{product.nutritional_info.carbs}g</span>
                        <span className="text-safebite-text-secondary text-xs">Carbs</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.tags?.slice(0, 2).map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="outline" className="text-xs bg-safebite-card-bg-alt/50 px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                  {productCategory && (
                    <Badge variant="outline" className="text-xs bg-safebite-card-bg-alt/50 px-2 py-0.5">
                      {productCategory}
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text flex items-center justify-center gap-2"
                  onClick={() => onViewDetails(product)}
                >
                  <Info className="h-4 w-4" />
                  Details
                </Button>
                <Button
                  className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 flex items-center justify-center gap-2"
                  onClick={() => onBuyNow(product)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BestGroceryResults;

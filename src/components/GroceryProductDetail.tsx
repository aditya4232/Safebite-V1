import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ExternalLink,
  Tag,
  Star,
  Clock,
  Truck,
  Heart,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Product } from '@/services/productService';
import { GroceryProduct } from '@/types/groceryTypes';
import { useToast } from '@/hooks/use-toast';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';

interface GroceryProductDetailProps {
  product: Product | GroceryProduct;
  onClose: () => void;
}

const GroceryProductDetail: React.FC<GroceryProductDetailProps> = ({
  product,
  onClose
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isFavorite, setIsFavorite] = useState(false);

  // Extract product details, handling different property names
  const productName = product.name || (product as any).product || 'Unknown Product';
  const productBrand = product.brand || (product as any).Brand || 'Generic Brand';
  const productCategory = product.category || (product as any).Category || 'Grocery';
  const productDescription = product.description || '';
  const productPrice = (product as any).price || (product as any).sale_price || 0;
  const productMarketPrice = (product as any).market_price || productPrice * 1.2;
  const productRating = (product as any).rating || (product as any).healthScore || 4.0;
  const productImage = (product as any).image_url || (product as any).imageUrl || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName)},grocery`;
  const productOffers = (product as any).offers || (product as any).tags || [];
  const productSource = (product as any).source || 'Grocery Store';
  const productRedirect = (product as any).redirect || '';
  const productDeliveryTime = (product as any).delivery_time || '30-60 min';
  const productInStock = (product as any).in_stock !== false;

  // Calculate discount percentage
  const discountPercentage = productMarketPrice && productPrice
    ? Math.round(((productMarketPrice - productPrice) / productMarketPrice) * 100)
    : 0;

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);

    // Track this interaction
    trackUserInteraction('toggle_favorite_grocery', {
      isGuest,
      productName,
      productId: (product as any)._id,
      isFavorite: !isFavorite
    });

    toast({
      title: !isFavorite ? "Added to favorites" : "Removed from favorites",
      description: !isFavorite
        ? `${productName} has been added to your favorites.`
        : `${productName} has been removed from your favorites.`,
      variant: !isFavorite ? "default" : "destructive",
    });
  };

  const handleBuyNow = () => {
    // Track this interaction
    trackUserInteraction('buy_grocery_product', {
      isGuest,
      productName,
      productId: (product as any)._id,
      source: productSource
    });

    // Create a fallback Google Shopping search URL that will definitely work
    const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(productName)}+${encodeURIComponent(productBrand || '')}+buy+online&tbm=shop`;

    try {
      // Try to open the redirect URL if available
      if (productRedirect) {
        // Use window.open with proper parameters
        window.open(productRedirect, '_blank', 'noopener,noreferrer');

        toast({
          title: "Opening store website",
          description: `Taking you to ${productSource} to purchase ${productName}.`,
        });
      } else {
        // If no redirect URL, use the fallback Google Shopping search
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');

        toast({
          title: "Searching for product",
          description: `Searching online stores for ${productName}.`,
        });
      }
    } catch (error) {
      console.error('Error opening redirect URL:', error);

      // If there's an error with the redirect URL, use the fallback
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: "Using alternative search",
        description: `Searching online stores for ${productName}.`,
      });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-safebite-card-bg border-safebite-teal/30 overflow-auto max-h-[90vh]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-safebite-text">{productName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-safebite-text-secondary'}`} />
          </Button>
        </div>
        <div className="flex items-center text-sm text-safebite-text-secondary">
          <span>{productBrand}</span>
          <span className="mx-2">•</span>
          <span>{productCategory}</span>
          {productRating && (
            <>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500 text-yellow-500" />
                {productRating}
              </span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="rounded-lg overflow-hidden bg-safebite-card-bg-alt h-64 flex items-center justify-center">
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName)},grocery`;
              }}
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-between">
            {/* Price Section */}
            <div className="mb-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-safebite-text">₹{productPrice}</span>
                {productMarketPrice && productMarketPrice > productPrice && (
                  <span className="ml-2 text-sm line-through text-safebite-text-secondary">₹{productMarketPrice}</span>
                )}
                {discountPercentage > 0 && (
                  <Badge className="ml-2 bg-green-500/20 text-green-500 border-green-500">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Delivery Info */}
              <div className="flex items-center mt-2 text-sm text-safebite-text-secondary">
                <Clock className="h-4 w-4 mr-1" />
                <span>{productDeliveryTime}</span>
                <span className="mx-2">•</span>
                <Truck className="h-4 w-4 mr-1" />
                <span>Free Delivery</span>
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                {productInStock ? (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500">
                    In Stock
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-500 border-red-500">
                    Out of Stock
                  </Badge>
                )}
                <Badge className="ml-2 bg-safebite-card-bg-alt text-safebite-text-secondary">
                  {productSource}
                </Badge>
              </div>
            </div>

            {/* Offers Section */}
            {productOffers && productOffers.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-safebite-text mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1 text-safebite-teal" />
                  Available Offers
                </h3>
                <ul className="space-y-1.5">
                  {productOffers.map((offer: string, index: number) => (
                    <li key={index} className="text-xs text-safebite-text-secondary flex items-start">
                      <span className="text-green-500 mr-1.5">•</span>
                      {offer}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {productDescription && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-safebite-text mb-1 flex items-center">
                  <Info className="h-4 w-4 mr-1 text-safebite-teal" />
                  Description
                </h3>
                <p className="text-xs text-safebite-text-secondary">
                  {productDescription}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                onClick={handleBuyNow}
                disabled={!productRedirect || !productInStock}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>

        {/* Nutritional Info Warning */}
        {!(product as any).nutritional_info && (
          <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-safebite-text-secondary">
              <p className="font-medium mb-1">Nutritional information not available</p>
              <p>We recommend checking the product packaging for detailed nutritional information.</p>
            </div>
          </div>
        )}

        {/* Source Attribution */}
        <div className="mt-6 text-xs text-safebite-text-secondary flex justify-between items-center">
          <span>Data source: {productSource}</span>
          {productRedirect && (
            <a
              href={productRedirect}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-safebite-teal hover:underline"
            >
              View on {productSource} <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroceryProductDetail;

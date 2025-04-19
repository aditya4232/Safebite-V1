import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  ExternalLink,
  Tag,
  Star,
  Clock,
  Truck,
  Heart,
  Info,
  AlertTriangle,
  Sparkles,
  Leaf,
  Utensils,
  Apple,
  Loader2
} from 'lucide-react';
import { GroceryProduct } from '@/types/groceryTypes';
import { useToast } from '@/hooks/use-toast';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getGroceryProductInsights, AIProductInsights } from '@/services/aiProductInsightsService';
import PlatformIcon from './PlatformIcons';

interface AIGroceryProductDetailProps {
  product: GroceryProduct;
  onClose: () => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
}

const AIGroceryProductDetail: React.FC<AIGroceryProductDetailProps> = ({
  product,
  onClose,
  onToggleFavorite,
  isFavorite = false
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [insights, setInsights] = useState<AIProductInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Extract product details, handling different property names
  const productName = product.name || 'Unknown Product';
  const productBrand = product.brand || 'Generic Brand';
  const productCategory = product.category || 'Grocery';
  const productDescription = product.description || '';
  const productPrice = product.price || product.sale_price || 0;
  const productMarketPrice = product.market_price || productPrice * 1.2;
  const productRating = product.rating || 4.0;
  const productImage = product.image_url || `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName)},grocery`;
  const productOffers = product.offers || [];
  const productSource = product.source || 'Grocery Store';
  const productPlatform = product.platform || '';
  const productRedirect = product.redirect || '';
  const productDeliveryTime = product.delivery_time || '30-60 min';
  const productInStock = product.in_stock !== false;

  // Calculate discount percentage
  const discountPercentage = productMarketPrice && productPrice
    ? Math.round(((productMarketPrice - productPrice) / productMarketPrice) * 100)
    : 0;

  // Fetch AI insights when component mounts
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const productInsights = await getGroceryProductInsights(product);
        setInsights(productInsights);
      } catch (err) {
        console.error('Error fetching product insights:', err);
        setError('Failed to load AI insights for this product.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [product]);

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite(product._id);
    } else {
      // Track this interaction
      trackUserInteraction('toggle_favorite_grocery', {
        isGuest,
        productName,
        productId: product._id,
        action: isFavorite ? 'remove' : 'add'
      });

      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite ? `${productName} removed from your favorites.` : `${productName} added to your favorites.`,
      });
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    // Track this interaction
    trackUserInteraction('buy_grocery_product', {
      isGuest,
      productName,
      productId: product._id,
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
    <Card className="max-w-4xl mx-auto bg-safebite-card-bg border-safebite-teal/30 overflow-auto max-h-[90vh]">
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
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
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

                    {/* Platform Badge */}
                    {productPlatform && (
                      <Badge className="ml-2 bg-safebite-card-bg-alt text-safebite-text-secondary flex items-center">
                        {PlatformIcon({ platform: productPlatform, size: "xs" })}
                        <span className="ml-1">{productPlatform}</span>
                      </Badge>
                    )}

                    {/* Source Badge */}
                    {!productPlatform && productSource && (
                      <Badge className="ml-2 bg-safebite-card-bg-alt text-safebite-text-secondary">
                        {productSource}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Offers */}
                {productOffers && productOffers.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-safebite-text mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-safebite-teal" />
                      Available Offers
                    </h3>
                    <div className="space-y-2">
                      {productOffers.slice(0, 3).map((offer, index) => (
                        <div key={index} className="flex items-start">
                          <Tag className="h-3.5 w-3.5 mr-1.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-safebite-text-secondary">{offer}</span>
                        </div>
                      ))}
                    </div>
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
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-safebite-teal mb-4" />
                <p className="text-safebite-text-secondary">Analyzing product with AI...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-safebite-text mb-1">Analysis Unavailable</h3>
                <p className="text-safebite-text-secondary">{error}</p>
              </div>
            ) : insights ? (
              <div className="space-y-6">
                {/* Nutritional Analysis */}
                <Card className="border-safebite-teal/20 bg-safebite-card-bg-alt/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium text-safebite-text flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-safebite-teal" />
                      AI Nutritional Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-safebite-text-secondary">
                      {insights.nutritionalAnalysis}
                    </p>
                  </CardContent>
                </Card>

                {/* Health Benefits */}
                <div>
                  <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-green-500" />
                    Health Benefits
                  </h3>
                  <ul className="space-y-1.5">
                    {insights.healthBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span className="text-sm text-safebite-text-secondary">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Potential Concerns */}
                <div>
                  <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    Potential Concerns
                  </h3>
                  <ul className="space-y-1.5">
                    {insights.potentialConcerns.map((concern, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        <span className="text-sm text-safebite-text-secondary">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Healthy Alternatives */}
                <div>
                  <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                    <Apple className="h-4 w-4 mr-2 text-safebite-teal" />
                    Healthy Alternatives
                  </h3>
                  <ul className="space-y-1.5">
                    {insights.healthyAlternatives.map((alternative, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-safebite-teal mr-2">•</span>
                        <span className="text-sm text-safebite-text-secondary">{alternative}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preparation Tips */}
                {insights.preparationTips && insights.preparationTips.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                      <Utensils className="h-4 w-4 mr-2 text-blue-500" />
                      Preparation Tips
                    </h3>
                    <ul className="space-y-1.5">
                      {insights.preparationTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-sm text-safebite-text-secondary">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Dietary Considerations */}
                <Card className="border-safebite-teal/20 bg-safebite-card-bg-alt/30">
                  <CardContent className="pt-4">
                    <h3 className="text-md font-medium text-safebite-text mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2 text-safebite-teal" />
                      Dietary Considerations
                    </h3>
                    <p className="text-sm text-safebite-text-secondary">
                      {insights.dietaryConsiderations}
                    </p>
                  </CardContent>
                </Card>

                {/* AI Disclaimer */}
                <div className="text-xs text-safebite-text-secondary italic text-center pt-2">
                  AI-generated insights are for informational purposes only. Always check product labels for accurate information.
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-safebite-text mb-1">No Insights Available</h3>
                <p className="text-safebite-text-secondary">We couldn't generate insights for this product.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nutrition Facts */}
              <Card className="border-safebite-teal/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md font-medium text-safebite-text">
                    Nutrition Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.nutritional_info ? (
                    <div className="space-y-2">
                      {Object.entries(product.nutritional_info).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center py-1 border-b border-safebite-card-bg-alt">
                          <span className="text-sm capitalize text-safebite-text">{key}</span>
                          <span className="text-sm text-safebite-text-secondary">
                            {typeof value === 'number' ?
                              key === 'calories' ?
                                `${value} kcal` :
                                `${value}g`
                              : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Info className="h-6 w-6 text-safebite-text-secondary mx-auto mb-2" />
                      <p className="text-safebite-text-secondary">Detailed nutrition information not available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Health Rating */}
              <div className="space-y-4">
                <Card className="border-safebite-teal/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md font-medium text-safebite-text">
                      Health Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-4">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${
                        productRating >= 4 ? 'bg-green-500/20 text-green-500' :
                        productRating >= 3 ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {productRating.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-center text-sm text-safebite-text-secondary mt-2">
                      {productRating >= 4 ? 'Excellent choice for health-conscious consumers.' :
                       productRating >= 3 ? 'Good option in moderation.' :
                       'Consider healthier alternatives when possible.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Purchase Link */}
                {productRedirect && (
                  <Button
                    className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                    onClick={handleBuyNow}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on {productPlatform || productSource}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIGroceryProductDetail;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Leaf, ThumbsUp, AlertTriangle, ExternalLink, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { Product } from '@/services/productService';
import { GroceryProduct } from '@/types/groceryTypes';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { app } from '../firebase';
import { trackUserInteraction } from '@/services/mlService';
import { useGuestMode } from '@/hooks/useGuestMode';

interface HealthyAlternativesProps {
  product: Product | GroceryProduct;
  onAlternativeSelect?: (alternative: any) => void;
  onSaveAlternative?: (alternative: any) => void;
}

// Mock function to simulate Gemini AI response
// In a real implementation, this would call the Gemini API
const getHealthyAlternativesFromGemini = async (product: any): Promise<any[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const productName = product.name || product.product || 'Unknown Product';
  const productCategory = product.category || product.Category || 'Grocery';

  // Generate mock alternatives based on product type
  if (productName.toLowerCase().includes('chips') || productName.toLowerCase().includes('crisps')) {
    return [
      {
        name: 'Baked Veggie Chips',
        description: 'Made from real vegetables with 50% less fat than regular potato chips',
        benefits: ['Lower in calories', 'Higher in fiber', 'Less sodium'],
        healthScore: 7.5,
        source: 'Healthier Choice'
      },
      {
        name: 'Air-popped Popcorn',
        description: 'Whole grain snack with no added oils or salt',
        benefits: ['High in fiber', 'Low calorie', 'Whole grain goodness'],
        healthScore: 8.2,
        source: 'Nutritionist Recommended'
      },
      {
        name: 'Roasted Chickpeas',
        description: 'Crunchy protein-packed alternative to chips',
        benefits: ['High protein', 'Good source of fiber', 'Contains essential minerals'],
        healthScore: 8.8,
        source: 'Dietitian Approved'
      }
    ];
  } else if (productName.toLowerCase().includes('soda') || productName.toLowerCase().includes('cola')) {
    return [
      {
        name: 'Sparkling Water with Fruit',
        description: 'Zero-calorie sparkling water with natural fruit essence',
        benefits: ['No sugar', 'No artificial sweeteners', 'Hydrating'],
        healthScore: 9.0,
        source: 'Healthier Choice'
      },
      {
        name: 'Kombucha',
        description: 'Fermented tea with probiotics and less sugar than soda',
        benefits: ['Contains probiotics', 'Lower in sugar', 'May support gut health'],
        healthScore: 7.8,
        source: 'Nutritionist Recommended'
      }
    ];
  } else if (productName.toLowerCase().includes('cookie') || productName.toLowerCase().includes('biscuit')) {
    return [
      {
        name: 'Oatmeal Energy Bites',
        description: 'Made with whole grains, nuts, and natural sweeteners',
        benefits: ['Higher in fiber', 'Contains healthy fats', 'Sustained energy'],
        healthScore: 7.9,
        source: 'Healthier Choice'
      },
      {
        name: 'Greek Yogurt with Berries',
        description: 'Protein-rich snack with natural sweetness from fruit',
        benefits: ['High protein', 'Probiotics', 'Antioxidants from berries'],
        healthScore: 9.2,
        source: 'Dietitian Approved'
      }
    ];
  } else if (productName.toLowerCase().includes('ice cream')) {
    return [
      {
        name: 'Frozen Yogurt',
        description: 'Lower in fat than ice cream with probiotic benefits',
        benefits: ['Less fat', 'Contains probiotics', 'Good source of calcium'],
        healthScore: 6.8,
        source: 'Healthier Choice'
      },
      {
        name: 'Frozen Fruit Sorbet',
        description: 'Made with real fruit and no dairy',
        benefits: ['No saturated fat', 'Contains fruit nutrients', 'Refreshing'],
        healthScore: 7.5,
        source: 'Nutritionist Recommended'
      },
      {
        name: 'Banana "Nice Cream"',
        description: 'Frozen blended bananas with a creamy ice cream-like texture',
        benefits: ['No added sugar', 'High in potassium', 'Contains fiber'],
        healthScore: 9.0,
        source: 'Dietitian Approved'
      }
    ];
  } else if (productCategory.toLowerCase().includes('snack') || productCategory.toLowerCase().includes('food')) {
    return [
      {
        name: 'Mixed Nuts',
        description: 'Nutrient-dense snack with healthy fats and protein',
        benefits: ['Heart-healthy fats', 'Protein', 'Vitamins and minerals'],
        healthScore: 8.5,
        source: 'Nutritionist Recommended'
      },
      {
        name: 'Fresh Fruit',
        description: 'Nature\'s perfect snack with fiber, vitamins, and minerals',
        benefits: ['Natural sugars', 'High in fiber', 'Rich in antioxidants'],
        healthScore: 9.5,
        source: 'Dietitian Approved'
      },
      {
        name: 'Vegetable Sticks with Hummus',
        description: 'Crunchy veggies with protein-rich dip',
        benefits: ['High in fiber', 'Plant protein', 'Healthy fats'],
        healthScore: 9.2,
        source: 'Healthier Choice'
      }
    ];
  } else {
    // Generic alternatives for any product
    return [
      {
        name: 'Whole Food Alternative',
        description: 'Choose minimally processed whole foods when possible',
        benefits: ['More nutrients', 'Less additives', 'Better for overall health'],
        healthScore: 9.0,
        source: 'Nutritionist Recommended'
      },
      {
        name: 'Homemade Version',
        description: 'Make your own version with healthier ingredients',
        benefits: ['Control ingredients', 'Avoid preservatives', 'Customize to your taste'],
        healthScore: 8.5,
        source: 'Healthier Choice'
      }
    ];
  }
};

const HealthyAlternatives: React.FC<HealthyAlternativesProps> = ({
  product,
  onAlternativeSelect,
  onSaveAlternative
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlternatives = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, this would call the Gemini API
        const results = await getHealthyAlternativesFromGemini(product);
        setAlternatives(results);
      } catch (err) {
        console.error('Error fetching healthy alternatives:', err);
        setError('Failed to get healthy alternatives. Please try again.');
        toast({
          title: 'Error',
          description: 'Could not fetch healthy alternatives.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlternatives();
  }, [product, toast]);

  const handleSelectAlternative = (alternative: any) => {
    if (onAlternativeSelect) {
      onAlternativeSelect(alternative);
    }

    // Track this interaction
    trackUserInteraction('select_healthy_alternative', {
      originalProduct: product.name,
      alternativeName: alternative.name,
      healthScore: alternative.healthScore
    });

    toast({
      title: 'Healthy Alternative Selected',
      description: `You've selected ${alternative.name} as a healthier option.`,
      variant: 'default',
    });
  };

  const handleSaveAlternative = async (alternative: any) => {
    try {
      if (isGuest) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save healthy alternatives.",
          variant: "destructive",
        });
        return;
      }

      if (!auth.currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to save healthy alternatives.",
          variant: "destructive",
        });
        return;
      }

      // Save to user's saved alternatives in Firebase
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        savedAlternatives: arrayUnion({
          originalProduct: product.name,
          alternative: alternative.name,
          healthScore: alternative.healthScore,
          benefits: alternative.benefits,
          timestamp: new Date()
        })
      }, { merge: true });

      // Track this interaction
      trackUserInteraction('save_healthy_alternative', {
        originalProduct: product.name,
        alternativeName: alternative.name,
        healthScore: alternative.healthScore
      });

      toast({
        title: 'Alternative Saved',
        description: `${alternative.name} has been saved to your profile.`,
        variant: 'default',
      });

      if (onSaveAlternative) {
        onSaveAlternative(alternative);
      }
    } catch (error) {
      console.error('Error saving alternative:', error);
      toast({
        title: 'Error',
        description: 'Failed to save alternative. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBuyAlternative = (alternative: any) => {
    // Track this interaction
    trackUserInteraction('buy_healthy_alternative', {
      originalProduct: product.name,
      alternativeName: alternative.name,
      healthScore: alternative.healthScore
    });

    // Open a search for this product in a new tab
    window.open(`https://www.google.com/search?q=${encodeURIComponent(alternative.name)}+buy+online&tbm=shop`, '_blank');

    toast({
      title: 'Opening Shopping Options',
      description: `Searching for ${alternative.name} in online stores.`,
      variant: 'default',
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-green-50 border-2 border-green-400 dark:bg-green-900/30 dark:border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-2" />
          <p className="text-green-700 dark:text-green-300 text-center">
            Finding healthier alternatives with AI...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium">Failed to get healthy alternatives</p>
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                Our AI couldn't analyze this product. Please try again later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alternatives.length === 0) {
    return (
      <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-700 dark:text-yellow-300">
              No specific healthier alternatives found for this product.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-2 border-green-400 dark:bg-green-900/30 dark:border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-green-800 dark:text-green-200 flex items-center">
          <Leaf className="h-5 w-5 mr-2 text-green-500" />
          Healthier Alternatives
        </CardTitle>
        <p className="text-green-700 dark:text-green-300 text-sm">
          AI-powered suggestions for healthier options
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {alternatives.map((alternative, index) => (
            <div
              key={index}
              className="bg-white dark:bg-green-800/30 rounded-lg p-4 border-2 border-green-400 dark:border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  {alternative.name}
                </h3>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 border-green-200 dark:border-green-700">
                  {alternative.healthScore.toFixed(1)}/10
                </Badge>
              </div>

              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                {alternative.description}
              </p>

              {alternative.benefits && (
                <div className="mb-3">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1 font-medium">Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {alternative.benefits.map((benefit: string, i: number) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1 text-green-500" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-green-600 dark:text-green-400">
                  Source: {alternative.source}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-500/10"
                    onClick={() => handleSaveAlternative(alternative)}
                  >
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-200"
                    onClick={() => handleBuyAlternative(alternative)}
                  >
                    <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                    Buy
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors duration-200"
                    onClick={() => handleSelectAlternative(alternative)}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthyAlternatives;

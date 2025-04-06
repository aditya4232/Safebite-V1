import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Star, Info, ArrowRight } from 'lucide-react';
import { searchProductsInMongoDB } from '@/services/apiService';
import { FoodItem } from '@/services/foodApiService';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

interface ProductRecommendationsProps {
  userId?: string;
  preferences?: string[];
}

const ProductRecommendations = ({ userId, preferences = [] }: ProductRecommendationsProps) => {
  const [products, setProducts] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user preferences from Firebase if not provided
        let userPrefs = [...preferences];
        
        if (userPrefs.length === 0 && auth.currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists() && userDoc.data().preferences) {
              userPrefs = userDoc.data().preferences;
            }
            
            // If still no preferences, check questionnaire data
            if (userPrefs.length === 0 && userDoc.data().questionnaire) {
              const questionnaire = userDoc.data().questionnaire;
              
              // Extract dietary preferences from questionnaire
              if (questionnaire.dietaryRestrictions) {
                userPrefs.push(...questionnaire.dietaryRestrictions);
              }
              
              // Extract health goals
              if (questionnaire.healthGoals) {
                userPrefs.push(...questionnaire.healthGoals);
              }
            }
          } catch (firebaseError) {
            console.error('Error fetching user preferences:', firebaseError);
          }
        }
        
        // Default search terms if no preferences found
        if (userPrefs.length === 0) {
          userPrefs = ['healthy', 'organic', 'natural'];
        }
        
        // Combine preferences into search query
        const searchQuery = userPrefs.slice(0, 2).join(' ');
        console.log('Searching for products with query:', searchQuery);
        
        // Search for products based on preferences
        const recommendedProducts = await searchProductsInMongoDB(searchQuery);
        
        if (recommendedProducts.length > 0) {
          setProducts(recommendedProducts.slice(0, 4)); // Show top 4 products
        } else {
          // Fallback to generic healthy products
          const fallbackProducts = await searchProductsInMongoDB('healthy food');
          setProducts(fallbackProducts.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching product recommendations:', error);
        setError('Unable to load product recommendations');
        toast({
          title: "Error",
          description: "Failed to load product recommendations",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [auth, db, preferences, toast]);
  
  if (isLoading) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-safebite-text">
            Product Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-safebite-text">
            Product Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-4">
          <Info className="h-12 w-12 text-safebite-text-secondary mx-auto mb-2" />
          <p className="text-safebite-text-secondary">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-safebite-text flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5 text-safebite-teal" />
          Product Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product, index) => (
              <Card key={index} className="overflow-hidden border-safebite-card-bg-alt hover:border-safebite-teal transition-colors">
                <div className="flex items-center p-3">
                  <div className="h-16 w-16 rounded-md bg-safebite-card-bg-alt flex items-center justify-center mr-3">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-14 w-14 object-cover rounded"
                      />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-safebite-text-secondary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-safebite-text line-clamp-1">{product.name}</h4>
                    <div className="flex items-center mt-1">
                      {product.nutritionScore && (
                        <Badge 
                          className={`mr-2 ${
                            product.nutritionScore === 'green' 
                              ? 'bg-green-500' 
                              : product.nutritionScore === 'yellow' 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}
                        >
                          {product.nutritionScore === 'green' 
                            ? 'Healthy' 
                            : product.nutritionScore === 'yellow' 
                              ? 'Moderate' 
                              : 'Unhealthy'}
                        </Badge>
                      )}
                      {product.brand && (
                        <span className="text-xs text-safebite-text-secondary">{product.brand}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-safebite-text-secondary">No product recommendations available</p>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            className="text-safebite-teal border-safebite-teal hover:bg-safebite-teal hover:text-white"
            onClick={() => window.location.href = '/food-search'}
          >
            Explore More Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductRecommendations;

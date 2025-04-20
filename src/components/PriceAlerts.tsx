import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, AlertCircle, Trash2, Plus, Loader2, 
  DollarSign, ArrowDownRight, Sparkles 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { trackUserInteraction } from '@/services/mlService';
import { unifiedGrocerySearch } from '@/services/unifiedGroceryService';

interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  platform: string;
  createdAt: number;
  lastChecked: number;
  triggered: boolean;
  productId?: string;
  imageUrl?: string;
}

interface PriceAlertsProps {
  className?: string;
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlertProduct, setNewAlertProduct] = useState('');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  
  // Load price alerts from Firebase
  useEffect(() => {
    const loadPriceAlerts = async () => {
      try {
        const auth = getAuth(app);
        if (!auth.currentUser || isGuest) {
          // For guest users, use local storage
          const storedAlerts = localStorage.getItem('guestPriceAlerts');
          if (storedAlerts) {
            setAlerts(JSON.parse(storedAlerts));
          } else {
            // Default alerts for new users
            const defaultAlerts = generateSampleAlerts();
            setAlerts(defaultAlerts);
            localStorage.setItem('guestPriceAlerts', JSON.stringify(defaultAlerts));
          }
        } else {
          // For logged-in users, use Firebase
          const db = getFirestore(app);
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.priceAlerts) {
              setAlerts(userData.priceAlerts);
            } else {
              // Default alerts for new users
              const defaultAlerts = generateSampleAlerts();
              setAlerts(defaultAlerts);
              
              // Save default alerts to Firebase
              await setDoc(userRef, { priceAlerts: defaultAlerts }, { merge: true });
            }
          }
        }
      } catch (error) {
        console.error('Error loading price alerts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your price alerts.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPriceAlerts();
  }, [isGuest, toast]);
  
  // Generate sample alerts for new users
  const generateSampleAlerts = (): PriceAlert[] => {
    return [
      {
        id: `alert-1-${Date.now()}`,
        productName: 'Organic Milk',
        targetPrice: 60,
        currentPrice: 75,
        platform: 'BigBasket',
        createdAt: Date.now(),
        lastChecked: Date.now(),
        triggered: false,
        imageUrl: 'https://source.unsplash.com/random/100x100/?milk'
      },
      {
        id: `alert-2-${Date.now()}`,
        productName: 'Whole Wheat Bread',
        targetPrice: 40,
        currentPrice: 45,
        platform: 'Blinkit',
        createdAt: Date.now(),
        lastChecked: Date.now(),
        triggered: false,
        imageUrl: 'https://source.unsplash.com/random/100x100/?bread'
      }
    ];
  };
  
  // Save price alerts
  const savePriceAlerts = async (newAlerts: PriceAlert[]) => {
    try {
      const auth = getAuth(app);
      if (!auth.currentUser || isGuest) {
        // For guest users, use local storage
        localStorage.setItem('guestPriceAlerts', JSON.stringify(newAlerts));
      } else {
        // For logged-in users, use Firebase
        const db = getFirestore(app);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { priceAlerts: newAlerts }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving price alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your price alerts.',
        variant: 'destructive'
      });
    }
  };
  
  // Add new alert
  const handleAddAlert = async () => {
    if (!newAlertProduct.trim()) {
      toast({
        title: 'Product name required',
        description: 'Please enter a product name.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!newAlertPrice.trim() || isNaN(parseFloat(newAlertPrice)) || parseFloat(newAlertPrice) <= 0) {
      toast({
        title: 'Valid price required',
        description: 'Please enter a valid target price.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsAddingAlert(true);
    
    try {
      // Try to fetch product info
      const searchResults = await unifiedGrocerySearch(newAlertProduct, false);
      let productInfo = null;
      
      if (searchResults.length > 0) {
        productInfo = searchResults[0];
      }
      
      const newAlert: PriceAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productName: newAlertProduct.trim(),
        targetPrice: parseFloat(newAlertPrice),
        currentPrice: productInfo?.price || parseFloat(newAlertPrice) * 1.2, // Estimate current price if not available
        platform: productInfo?.platform || 'All Platforms',
        createdAt: Date.now(),
        lastChecked: Date.now(),
        triggered: false,
        productId: productInfo?._id,
        imageUrl: productInfo?.image_url || `https://source.unsplash.com/random/100x100/?${encodeURIComponent(newAlertProduct)}`
      };
      
      const updatedAlerts = [...alerts, newAlert];
      setAlerts(updatedAlerts);
      savePriceAlerts(updatedAlerts);
      
      // Reset form
      setNewAlertProduct('');
      setNewAlertPrice('');
      
      // Track this interaction
      trackUserInteraction('add_price_alert', {
        isGuest,
        productName: newAlertProduct,
        targetPrice: parseFloat(newAlertPrice)
      });
      
      toast({
        title: 'Price alert added',
        description: `We'll notify you when ${newAlertProduct} drops to ₹${newAlertPrice} or below.`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding price alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to add price alert. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAddingAlert(false);
    }
  };
  
  // Remove alert
  const removeAlert = (id: string) => {
    const alert = alerts.find(alert => alert.id === id);
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    
    setAlerts(updatedAlerts);
    savePriceAlerts(updatedAlerts);
    
    // Track this interaction
    if (alert) {
      trackUserInteraction('remove_price_alert', {
        isGuest,
        productName: alert.productName
      });
    }
    
    toast({
      title: 'Alert removed',
      description: alert ? `Price alert for ${alert.productName} has been removed.` : 'Price alert has been removed.',
      variant: 'default'
    });
  };
  
  // Check for price drops (simulated)
  const checkPriceDrops = () => {
    // In a real app, this would call an API to check current prices
    // For demo purposes, we'll randomly trigger some alerts
    
    const updatedAlerts = alerts.map(alert => {
      // Randomly update some prices (20% chance)
      if (Math.random() < 0.2) {
        const priceChange = (Math.random() * 20) - 10; // Random change between -10 and +10
        const newPrice = Math.max(1, alert.currentPrice + priceChange);
        
        return {
          ...alert,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          lastChecked: Date.now(),
          triggered: newPrice <= alert.targetPrice
        };
      }
      
      return alert;
    });
    
    setAlerts(updatedAlerts);
    savePriceAlerts(updatedAlerts);
    
    // Count triggered alerts
    const triggeredAlerts = updatedAlerts.filter(alert => alert.triggered);
    
    if (triggeredAlerts.length > 0) {
      toast({
        title: 'Price Drop Alert!',
        description: `${triggeredAlerts.length} of your tracked products have dropped in price!`,
        variant: 'default'
      });
    } else {
      toast({
        title: 'Prices Checked',
        description: 'No price drops detected for your tracked products.',
        variant: 'default'
      });
    }
    
    // Track this interaction
    trackUserInteraction('check_price_drops', {
      isGuest,
      alertCount: alerts.length,
      triggeredCount: triggeredAlerts.length
    });
  };
  
  // Sort alerts: triggered first, then by creation date (newest first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.triggered && !b.triggered) return -1;
    if (!a.triggered && b.triggered) return 1;
    return b.createdAt - a.createdAt;
  });
  
  if (isLoading) {
    return (
      <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
            <Bell className="mr-2 h-5 w-5 text-safebite-teal" /> Price Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <Bell className="mr-2 h-5 w-5 text-safebite-teal" /> Price Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Add new alert form */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Product name..."
              value={newAlertProduct}
              onChange={(e) => setNewAlertProduct(e.target.value)}
              className="sci-fi-input flex-1"
            />
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-safebite-text-secondary" />
              <Input
                type="number"
                placeholder="Target price"
                value={newAlertPrice}
                onChange={(e) => setNewAlertPrice(e.target.value)}
                className="sci-fi-input w-full sm:w-32 pl-8"
                min="1"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              onClick={handleAddAlert}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              disabled={isAddingAlert}
            >
              {isAddingAlert ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Alert
            </Button>
            <Button
              variant="outline"
              onClick={checkPriceDrops}
              className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Check Prices
            </Button>
          </div>
        </div>
        
        {/* Price alerts list */}
        {sortedAlerts.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {sortedAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-md ${
                    alert.triggered 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-safebite-card-bg-alt/30 hover:bg-safebite-card-bg-alt/50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    {/* Product image */}
                    <div className="h-12 w-12 rounded overflow-hidden bg-safebite-card-bg-alt flex-shrink-0">
                      <img
                        src={alert.imageUrl}
                        alt={alert.productName}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/100?text=${encodeURIComponent(alert.productName.charAt(0))}`;
                        }}
                      />
                    </div>
                    
                    {/* Alert details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-safebite-text line-clamp-1">{alert.productName}</h3>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs mr-2">
                              {alert.platform}
                            </Badge>
                            {alert.triggered && (
                              <Badge className="bg-green-500 text-white border-0 text-xs flex items-center">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Price Drop!
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAlert(alert.id)}
                          className="h-8 w-8 text-safebite-text-secondary hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Price information */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <span className="text-xs text-safebite-text-secondary mr-2">Current:</span>
                          <span className={`text-sm font-medium ${
                            alert.currentPrice <= alert.targetPrice ? 'text-green-500' : 'text-safebite-text'
                          }`}>
                            ₹{alert.currentPrice}
                          </span>
                          {alert.currentPrice <= alert.targetPrice && (
                            <ArrowDownRight className="h-4 w-4 text-green-500 ml-1" />
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-safebite-text-secondary mr-2">Target:</span>
                          <span className="text-sm font-medium text-safebite-text">₹{alert.targetPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 mx-auto text-safebite-teal/50 mb-2" />
            <p className="text-safebite-text-secondary mb-4">No price alerts set</p>
            <Button
              variant="outline"
              className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
              onClick={() => {
                setNewAlertProduct('Organic Milk');
                setNewAlertPrice('60');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Alert
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAlerts;

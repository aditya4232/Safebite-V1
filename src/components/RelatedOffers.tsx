import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Percent, ShoppingBag, Loader2, Tag,
  Clock, ExternalLink, AlertTriangle, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { app } from '../firebase';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';
import PlatformIcon, { PLATFORM_COLORS } from './PlatformIcons';

interface Offer {
  id: string;
  title: string;
  description: string;
  code?: string;
  expiryDate?: Date;
  platform: string;
  url?: string;
  discount?: string;
  minPurchase?: string;
  category?: string;
  isNew?: boolean;
}

interface RelatedOffersProps {
  searchQuery?: string;
  category?: string;
  maxOffers?: number;
}

const RelatedOffers: React.FC<RelatedOffersProps> = ({
  searchQuery = '',
  category = '',
  maxOffers = 4
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const auth = getAuth(app);
        const db = getFirestore(app);

        // For guest users or when no search query is provided, show generic offers
        if (isGuest || !searchQuery) {
          setOffers(getMockOffers(category, maxOffers));
          setIsLoading(false);
          return;
        }

        if (!auth.currentUser) {
          setOffers(getMockOffers(category, maxOffers));
          setIsLoading(false);
          return;
        }

        // First, check if we have any real offers in Firebase
        const offersRef = collection(db, 'offers');
        let offersQuery;

        if (category) {
          offersQuery = query(
            offersRef,
            where('category', '==', category),
            where('active', '==', true),
            orderBy('createdAt', 'desc'),
            limit(maxOffers)
          );
        } else {
          offersQuery = query(
            offersRef,
            where('active', '==', true),
            orderBy('createdAt', 'desc'),
            limit(maxOffers)
          );
        }

        const offersSnapshot = await getDocs(offersQuery);

        if (!offersSnapshot.empty) {
          const offersData: Offer[] = [];

          offersSnapshot.forEach(doc => {
            const data = doc.data();
            offersData.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              code: data.code,
              expiryDate: data.expiryDate?.toDate(),
              platform: data.platform,
              url: data.url,
              discount: data.discount,
              minPurchase: data.minPurchase,
              category: data.category,
              isNew: data.isNew
            });
          });

          setOffers(offersData);
        } else {
          // If no real offers, use mock data
          setOffers(getMockOffers(category, maxOffers));
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError('Failed to fetch offers. Please try again later.');
        // Fall back to mock offers
        setOffers(getMockOffers(category, maxOffers));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [searchQuery, category, maxOffers, isGuest]);

  const handleUseOffer = (offer: Offer) => {
    // Track this interaction
    trackUserInteraction('use_offer', {
      offerId: offer.id,
      offerTitle: offer.title,
      platform: offer.platform
    });

    // Copy promo code to clipboard if available
    if (offer.code) {
      navigator.clipboard.writeText(offer.code)
        .then(() => {
          toast({
            title: 'Promo Code Copied!',
            description: `${offer.code} has been copied to your clipboard.`,
            variant: 'default',
          });
        })
        .catch(() => {
          toast({
            title: 'Could not copy code',
            description: `Please manually copy this code: ${offer.code}`,
            variant: 'destructive',
          });
        });
    }

    // Open the offer URL if available
    if (offer.url) {
      window.open(offer.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Generate mock offers based on category and search query
  const getMockOffers = (category: string, count: number): Offer[] => {
    const platforms = ['Blinkit', 'Zepto', 'Instamart', 'BigBasket', 'Swiggy', 'Zomato'];
    const mockOffers: Offer[] = [];

    // Generate offers based on category
    if (category === 'grocery') {
      mockOffers.push(
        {
          id: 'grocery-1',
          title: 'First Order 50% OFF',
          description: 'Get 50% off on your first order up to ₹100',
          code: 'FIRST50',
          platform: 'Blinkit',
          url: 'https://blinkit.com',
          discount: '50%',
          minPurchase: '₹200',
          category: 'grocery',
          isNew: true
        },
        {
          id: 'grocery-2',
          title: '₹100 OFF on Fruits & Vegetables',
          description: 'Use code FRESH100 for ₹100 off on fruits and vegetables',
          code: 'FRESH100',
          platform: 'BigBasket',
          url: 'https://bigbasket.com',
          discount: '₹100',
          minPurchase: '₹500',
          category: 'grocery'
        },
        {
          id: 'grocery-3',
          title: 'Free Delivery on Orders Above ₹300',
          description: 'No code needed. Free delivery automatically applied at checkout',
          platform: 'Zepto',
          url: 'https://zepto.com',
          minPurchase: '₹300',
          category: 'grocery'
        },
        {
          id: 'grocery-4',
          title: 'Buy 1 Get 1 Free on Selected Items',
          description: 'Limited time offer on selected products',
          code: 'BOGO',
          platform: 'Instamart',
          url: 'https://instamart.com',
          category: 'grocery',
          isNew: true
        }
      );
    } else if (category === 'food') {
      mockOffers.push(
        {
          id: 'food-1',
          title: '60% OFF up to ₹150',
          description: 'Use code MEAL60 for 60% off up to ₹150 on your order',
          code: 'MEAL60',
          platform: 'Swiggy',
          url: 'https://swiggy.com',
          discount: '60%',
          minPurchase: '₹250',
          category: 'food',
          isNew: true
        },
        {
          id: 'food-2',
          title: 'Free Delivery on First 3 Orders',
          description: 'No minimum order value required',
          code: 'FREEDEL',
          platform: 'Zomato',
          url: 'https://zomato.com',
          category: 'food'
        },
        {
          id: 'food-3',
          title: '₹75 OFF on Orders Above ₹300',
          description: 'Limited time offer for all users',
          code: 'SAVE75',
          platform: 'Swiggy',
          url: 'https://swiggy.com',
          discount: '₹75',
          minPurchase: '₹300',
          category: 'food'
        },
        {
          id: 'food-4',
          title: '20% OFF on Healthy Food',
          description: 'Special discount on restaurants with healthy food options',
          code: 'HEALTH20',
          platform: 'Zomato',
          url: 'https://zomato.com',
          discount: '20%',
          category: 'food',
          isNew: true
        }
      );
    } else {
      // Generic offers
      mockOffers.push(
        {
          id: 'generic-1',
          title: '₹100 OFF on First Order',
          description: 'Get ₹100 off on your first order',
          code: 'WELCOME100',
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          discount: '₹100',
          category: 'general',
          isNew: true
        },
        {
          id: 'generic-2',
          title: 'Free Delivery',
          description: 'Free delivery on all orders above ₹200',
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          minPurchase: '₹200',
          category: 'general'
        },
        {
          id: 'generic-3',
          title: '15% OFF for New Users',
          description: 'Use code NEW15 for 15% off on your first order',
          code: 'NEW15',
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          discount: '15%',
          category: 'general'
        },
        {
          id: 'generic-4',
          title: 'Special Weekend Offer',
          description: 'Get 10% off on all orders this weekend',
          code: 'WEEKEND10',
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          discount: '10%',
          category: 'general',
          isNew: true
        }
      );
    }

    // If search query is provided, add some related offers
    if (searchQuery) {
      const formattedQuery = searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1).toLowerCase();
      const searchTerms = searchQuery.toLowerCase().split(' ');

      // Generate platform-specific offers based on search query
      const platformSpecificOffers = [
        {
          id: `search-blinkit-${Date.now()}`,
          title: `${formattedQuery} Special on Blinkit`,
          description: `Get up to 40% off on ${searchQuery.toLowerCase()} and related products with instant delivery`,
          code: `BLINK${searchQuery.toUpperCase().substring(0, 3)}40`,
          platform: 'Blinkit',
          url: `https://blinkit.com/search?q=${encodeURIComponent(searchQuery)}`,
          discount: '40%',
          minPurchase: '₹250',
          category: category || 'grocery',
          isNew: true
        },
        {
          id: `search-zepto-${Date.now()}`,
          title: `Zepto ${formattedQuery} Deals`,
          description: `Buy ${searchQuery.toLowerCase()} and get free delivery plus 20% cashback`,
          code: `ZEPTO${searchQuery.toUpperCase().substring(0, 3)}`,
          platform: 'Zepto',
          url: `https://www.zeptonow.com/search?q=${encodeURIComponent(searchQuery)}`,
          discount: '20% Cashback',
          category: category || 'grocery',
          isNew: Math.random() > 0.5
        },
        {
          id: `search-bigbasket-${Date.now()}`,
          title: `BigBasket ${formattedQuery} Combo Offer`,
          description: `Buy ${searchQuery.toLowerCase()} and related items together to save 25%`,
          code: `BB${searchQuery.toUpperCase().substring(0, 4)}25`,
          platform: 'BigBasket',
          url: `https://www.bigbasket.com/ps/?q=${encodeURIComponent(searchQuery)}`,
          discount: '25%',
          minPurchase: '₹500',
          category: category || 'grocery'
        },
        {
          id: `search-instamart-${Date.now()}`,
          title: `Instamart ${formattedQuery} Flash Sale`,
          description: `Limited time offer: Get ${searchQuery.toLowerCase()} at 30% off for the next 2 hours`,
          platform: 'Instamart',
          url: `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(searchQuery)}`,
          discount: '30%',
          category: category || 'grocery',
          isNew: true
        }
      ];

      // Add search-specific offers to the beginning of the array
      mockOffers.unshift(...platformSpecificOffers);

      // Add a generic search-based offer
      mockOffers.unshift({
        id: `search-generic-${Date.now()}`,
        title: `Special Offer on ${formattedQuery}`,
        description: `Get special discounts on ${searchQuery.toLowerCase()} and related products across all platforms`,
        code: `${searchQuery.toUpperCase().substring(0, 4)}25`,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        discount: '25%',
        category: category || 'general',
        isNew: true
      });
    }

    // Return the requested number of offers
    return mockOffers.slice(0, count);
  };

  if (isLoading) {
    return (
      <Card className="sci-fi-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
            <Percent className="h-5 w-5 mr-2 text-safebite-teal" />
            Related Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
            <span className="ml-2 text-safebite-text-secondary">Loading offers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="sci-fi-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
            <Percent className="h-5 w-5 mr-2 text-safebite-teal" />
            Related Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-center py-6">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-safebite-text-secondary">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (offers.length === 0) {
    return null; // Don't show anything if no offers
  }

  return (
    <Card className="sci-fi-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <Percent className="h-5 w-5 mr-2 text-safebite-teal" />
          Related Offers
          {searchQuery && (
            <Badge className="ml-2 bg-safebite-teal/20 text-safebite-teal border-safebite-teal/30">
              Based on your search
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {offers.map((offer) => {
            // Determine platform-specific styling
            const platformKey = offer.platform.toLowerCase() as keyof typeof PLATFORM_COLORS;
            const platformColor = PLATFORM_COLORS[platformKey]?.primary || PLATFORM_COLORS.all.primary;

            return (
              <div
                key={offer.id}
                className="border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg relative"
                style={{ borderColor: `${platformColor}40` }}
              >
                {/* New badge */}
                {offer.isNew && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    NEW
                  </div>
                )}

                {/* Platform badge */}
                <div
                  className="px-3 py-1.5 flex items-center"
                  style={{ backgroundColor: `${platformColor}20` }}
                >
                  <PlatformIcon platform={offer.platform} size="sm" />
                  <span className="text-sm font-medium">{offer.platform}</span>

                  {offer.discount && (
                    <Badge className="ml-auto bg-green-500/90 text-white border-0">
                      {offer.discount}
                    </Badge>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="font-medium text-safebite-text mb-1">{offer.title}</h3>
                  <p className="text-xs text-safebite-text-secondary mb-2">{offer.description}</p>

                  {/* Offer details */}
                  <div className="space-y-1 mb-3">
                    {offer.code && (
                      <div className="flex items-center text-xs">
                        <Tag className="h-3 w-3 text-safebite-teal mr-1" />
                        <span className="font-medium">Code: </span>
                        <code className="ml-1 px-1.5 py-0.5 bg-safebite-card-bg-alt rounded">{offer.code}</code>
                      </div>
                    )}

                    {offer.minPurchase && (
                      <div className="flex items-center text-xs text-safebite-text-secondary">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        <span>Min. purchase: {offer.minPurchase}</span>
                      </div>
                    )}

                    {offer.expiryDate && (
                      <div className="flex items-center text-xs text-safebite-text-secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expires: {offer.expiryDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full text-sm"
                    style={{
                      backgroundColor: platformColor,
                      color: platformColor === '#F9D923' ? 'black' : 'white'
                    }}
                    onClick={() => handleUseOffer(offer)}
                  >
                    {offer.code ? 'Use Code' : 'View Offer'}
                    <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatedOffers;

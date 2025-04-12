import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ArrowRight } from 'lucide-react';
import FoodDeliveryPopup from './FoodDeliveryPopup';

interface FoodDeliveryCardProps {
  className?: string;
}

const FoodDeliveryCard: React.FC<FoodDeliveryCardProps> = ({ className = '' }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <>
      <Card className={`sci-fi-card hover:shadow-neon-orange transition-all duration-300 hover:border-orange-500/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text">Food Delivery</h3>
                <Badge className="bg-orange-500 text-white text-xs">Coming Soon</Badge>
              </div>
            </div>
          </div>
          
          <p className="text-safebite-text-secondary text-sm mb-4">
            Get nutritional insights for your favorite restaurant meals from Zomato and Swiggy.
          </p>
          
          <Button 
            onClick={() => setIsPopupOpen(true)}
            className="w-full bg-safebite-card-bg-alt hover:bg-safebite-card-bg-alt/80"
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
      
      <FoodDeliveryPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </>
  );
};

export default FoodDeliveryCard;

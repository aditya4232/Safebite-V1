import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X, Shield } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      // Show the banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[hsl(var(--safebite-card-bg))] border-t border-[hsl(var(--safebite-card-bg-alt))] shadow-lg animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-6 w-6 text-[hsl(var(--safebite-teal))] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-[hsl(var(--safebite-text))] font-medium mb-1">We value your privacy</h3>
              <p className="text-[hsl(var(--safebite-text-secondary))] text-sm">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="text-[hsl(var(--safebite-text-secondary))] border-[hsl(var(--safebite-card-bg-alt))]"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-[hsl(var(--safebite-teal))] text-[hsl(var(--safebite-dark-blue))]"
            >
              <Shield className="h-4 w-4 mr-1" />
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

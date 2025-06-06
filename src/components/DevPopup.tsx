import React, { useState, useEffect } from 'react';
import { X, Info, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileImage from './ProfileImage';

interface DevPopupProps {
  developerName?: string;
  version?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const DevPopup: React.FC<DevPopupProps> = ({
  developerName = "Aditya Shenvi",
  version = "v2.3",
  isOpen: externalIsOpen,
  onClose
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Determine if the popup should be open based on props or internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    // Check if popup has been shown before
    const hasShownPopup = localStorage.getItem('safebite_popup_shown');

    if (!hasShownPopup) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
        // Mark popup as shown
        localStorage.setItem('safebite_popup_shown', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  const changelogItems = [
    "Enhanced AI chatbot with context-aware guidance",
    "Added weekly health check-in with 8 questions",
    "Improved dashboard with weekly check-in data visualization",
    "Added food delivery integration with Zomato and Swiggy",
    "Enhanced recipe search with 3x4 grid and popup details",
    "Improved UI with sci-fi visuals and better readability",
    "Added user activity tracking for ML personalization",
    "Fixed Healthbox component errors and improved UI",
    "Added guest mode for testing without authentication",
    "Production-ready with improved error handling"
  ];

  const previousVersionItems = [
    "Added Product Recommendations page with MongoDB integration",
    "Implemented user activity tracking for ML personalization",
    "Added fitness wearable data import functionality",
    "Improved Firebase security and error handling",
    "Enhanced dashboard with real-time data visualization",
    "Added login prompts for guest users"
  ];

  const apiCredits = [
    { name: "SafeBite Backend API", url: "https://safebite-backend.onrender.com" },
    { name: "MongoDB Atlas", url: "https://www.mongodb.com/atlas/database" },
    { name: "Edamam Food Database API", url: "https://www.edamam.com/" },
    { name: "CalorieNinjas API", url: "https://calorieninjas.com/" },
    { name: "FatSecret Platform API", url: "https://platform.fatsecret.com/" },
    { name: "Open Food Facts", url: "https://world.openfoodfacts.org/" },
    { name: "Unsplash Images", url: "https://unsplash.com/" },
    { name: "Firebase", url: "https://firebase.google.com/" }
  ];

  return (
    <>
      {isMinimized ? (
        <div
          className="fixed bottom-4 right-4 bg-safebite-teal text-safebite-dark-blue p-2 rounded-full cursor-pointer z-50 shadow-lg hover:bg-safebite-teal/90 transition-all"
          onClick={toggleMinimize}
        >
          <Info size={24} />
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 w-80 bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg shadow-xl z-50 sci-fi-card overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-safebite-card-bg-alt border-b border-safebite-card-bg">
            <div className="flex items-center">
              <ProfileImage size="sm" className="mr-2" />
              <h3 className="text-safebite-text font-medium">Developer Info</h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimize}
                className="text-safebite-text-secondary hover:text-safebite-teal p-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="text-safebite-text-secondary hover:text-red-500 p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center mb-3">
              <div className="bg-safebite-teal/20 text-safebite-teal px-2 py-1 rounded text-xs mr-2">
                {version}
              </div>
              <div className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">
                Production Ready
              </div>
            </div>

            <p className="text-safebite-text mb-3 font-medium">
              Special Project by <span className="text-safebite-teal">{developerName}</span>
            </p>

            <div className="mb-4">
              <h4 className="text-safebite-text font-medium flex items-center mb-2">
                <Star className="h-4 w-4 mr-1 text-safebite-teal" />
                What's New in {version}
              </h4>
              <div className="bg-safebite-teal/10 p-2 rounded-md border border-safebite-teal/20 mb-2">
                <p className="text-xs text-safebite-teal font-medium mb-1">Production Release</p>
              </div>
              <ul className="text-xs text-safebite-text-secondary space-y-1">
                {changelogItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-safebite-teal mr-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-safebite-text font-medium flex items-center mb-2">
                <Star className="h-4 w-4 mr-1 text-safebite-text-secondary" />
                Previous Updates (v2.2)
              </h4>
              <ul className="text-xs text-safebite-text-secondary space-y-1">
                {previousVersionItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-safebite-text-secondary mr-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="text-safebite-text font-medium flex items-center mb-2">
                <Info className="h-4 w-4 mr-1 text-safebite-teal" />
                Data & API Credits
              </h4>
              <p className="text-xs text-safebite-text-secondary mb-2">
                SafeBite uses data from the following sources for educational purposes:
              </p>
              <ul className="text-xs text-safebite-text-secondary space-y-1">
                {apiCredits.map((api, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-safebite-teal mr-1">•</span>
                    <a
                      href={api.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-safebite-teal"
                    >
                      {api.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleClose}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevPopup;

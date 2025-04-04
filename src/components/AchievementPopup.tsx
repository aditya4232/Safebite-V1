import React, { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AchievementBadge from './AchievementBadge';
import { Achievement } from './AchievementBadge';

interface AchievementPopupProps {
  onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(onClose, 300);
  };

  const questionnaireBadge: Achievement = {
    id: 'questionnaire_complete',
    title: 'Profile Complete',
    description: 'Completed your health profile questionnaire',
    xp: 10,
    icon: 'trophy',
    completed: true,
    date: new Date()
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/70" onClick={handleClose}></div>
      
      <div className="relative bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg p-6 max-w-md w-full transform transition-all duration-300 sci-fi-card">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-safebite-text-secondary hover:text-safebite-text"
        >
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-safebite-text mb-2">Achievement Unlocked!</h2>
          <p className="text-safebite-text-secondary">
            You've earned your first achievement badge and XP points.
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <AchievementBadge 
            achievement={questionnaireBadge}
            size="lg"
            showXP={true}
          />
        </div>
        
        <div className="text-center">
          <p className="text-safebite-text-secondary mb-4">
            Continue using SafeBite to earn more achievements and XP points!
          </p>
          
          <Button 
            onClick={handleClose}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementPopup;

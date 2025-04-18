import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Heart, Utensils } from 'lucide-react';

interface WelcomeAnimationProps {
  onComplete: () => void;
  userName?: string;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete, userName = 'there' }) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      } else {
        setVisible(false);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, step === 0 ? 2000 : 1500);

    return () => clearTimeout(timer);
  }, [step, onComplete]);

  const steps = [
    {
      icon: <Sparkles className="h-16 w-16 text-safebite-teal" />,
      title: "Welcome to SafeBite",
      description: `Hi ${userName}! We're excited to have you join us.`
    },
    {
      icon: <Shield className="h-16 w-16 text-safebite-purple" />,
      title: "Your Food Safety Companion",
      description: "We help you make healthier food choices every day."
    },
    {
      icon: <Heart className="h-16 w-16 text-red-500" />,
      title: "Personalized Health Insights",
      description: "Get recommendations tailored to your health profile."
    },
    {
      icon: <Utensils className="h-16 w-16 text-orange-500" />,
      title: "Let's Get Started!",
      description: "Explore your dashboard and discover all features."
    }
  ];

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-safebite-dark-blue border border-safebite-teal/30 rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl shadow-safebite-teal/20"
          >
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-safebite-dark-blue to-safebite-card-bg border border-safebite-teal/20">
                {currentStep.icon}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-3 text-safebite-text">{currentStep.title}</h2>
            <p className="text-safebite-text-secondary mb-6">{currentStep.description}</p>
            
            <div className="flex justify-center space-x-2 mt-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === step ? 'bg-safebite-teal' : 'bg-safebite-card-bg-alt'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeAnimation;

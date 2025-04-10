import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn, X, CheckCircle, Lock, Shield, Database, ChartBar } from 'lucide-react';

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

const LoginPrompt = ({ isOpen, onClose, feature = 'this feature' }: LoginPromptProps) => {
  const navigate = useNavigate();
  const [showBenefits, setShowBenefits] = useState(false);
  
  if (!isOpen) return null;
  
  const benefits = [
    { 
      icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
      title: 'Personalized Experience', 
      description: 'Get recommendations tailored to your health profile and preferences.' 
    },
    { 
      icon: <Database className="h-5 w-5 text-blue-500" />, 
      title: 'Save Your Data', 
      description: 'Track your progress over time with saved health metrics and food logs.' 
    },
    { 
      icon: <ChartBar className="h-5 w-5 text-purple-500" />, 
      title: 'Detailed Analytics', 
      description: 'Access comprehensive charts and insights about your health journey.' 
    },
    { 
      icon: <Shield className="h-5 w-5 text-orange-500" />, 
      title: 'Secure Storage', 
      description: 'Your data is securely stored and protected with Firebase Authentication.' 
    },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <Card className="sci-fi-card max-w-md w-full relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-safebite-teal/20 to-safebite-purple/20 rounded-lg blur-sm"></div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 text-safebite-text-secondary hover:text-safebite-text"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              {showBenefits ? 'Benefits of Creating an Account' : 'Login Required'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {!showBenefits ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-safebite-card-bg-alt flex items-center justify-center">
                    <Lock className="h-8 w-8 text-safebite-teal" />
                  </div>
                </div>
                
                <p className="text-center text-safebite-text mb-6">
                  You need to be logged in to use {feature}.
                </p>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate('/auth/login')}
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Log In
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/auth/signup')}
                    variant="outline"
                    className="border-safebite-purple text-safebite-purple hover:bg-safebite-purple/10"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                  
                  <Button 
                    variant="link" 
                    className="text-safebite-text-secondary"
                    onClick={() => setShowBenefits(true)}
                  >
                    Why should I create an account?
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-safebite-text">{benefit.title}</h3>
                        <p className="text-sm text-safebite-text-secondary">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => setShowBenefits(false)}
                  variant="link" 
                  className="text-safebite-text-secondary"
                >
                  Back to login options
                </Button>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-safebite-card-bg-alt pt-4">
            <Button 
              variant="ghost" 
              className="text-safebite-text-secondary hover:text-safebite-text"
              onClick={onClose}
            >
              Continue in Guest Mode
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default LoginPrompt;

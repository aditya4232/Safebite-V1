import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, UserPlus } from 'lucide-react';
import { formatTimeUntilReset } from '@/services/guestRateLimitService';

interface RateLimitDialogProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
  timeUntilReset: number;
}

const RateLimitDialog: React.FC<RateLimitDialogProps> = ({
  open,
  onClose,
  featureName,
  timeUntilReset
}) => {
  const navigate = useNavigate();
  
  const handleCreateAccount = () => {
    navigate('/auth/signup');
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-amber-500">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Guest Usage Limit Reached
          </DialogTitle>
          <DialogDescription>
            You've reached the maximum number of uses for this feature as a guest user.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-4 mb-4">
            <h3 className="font-medium text-amber-500 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Rate Limit Information
            </h3>
            <p className="text-sm text-safebite-text-secondary mb-2">
              As a guest user, you can use the <span className="font-medium text-safebite-text">{featureName}</span> feature up to 5 times per hour.
            </p>
            <p className="text-sm text-safebite-text-secondary">
              Your usage limit will reset in: <span className="font-medium text-safebite-text">{formatTimeUntilReset(timeUntilReset)}</span>
            </p>
          </div>
          
          <div className="bg-safebite-teal/10 border border-safebite-teal/30 rounded-md p-4">
            <h3 className="font-medium text-safebite-teal mb-2 flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Create an Account
            </h3>
            <p className="text-sm text-safebite-text-secondary mb-2">
              Sign up for a free account to get unlimited access to all features and save your data.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            Return to Dashboard
          </Button>
          <Button 
            onClick={handleCreateAccount} 
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 sm:flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateLimitDialog;

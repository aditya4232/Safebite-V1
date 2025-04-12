import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import { useGuestMode } from '@/hooks/useGuestMode';

interface SaveToDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
  toolName: string;
  toolData: any;
}

const SaveToDashboardModal: React.FC<SaveToDashboardModalProps> = ({ 
  isOpen, 
  onClose, 
  toolId, 
  toolName,
  toolData 
}) => {
  const [showOnDashboard, setShowOnDashboard] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { isGuest } = useGuestMode();

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isGuest) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save results to your dashboard.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const userRef = doc(db, "users", user.uid);
      
      // Get current user data
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Update healthbox results
      await setDoc(userRef, {
        healthboxResults: {
          ...userData.healthboxResults,
          [toolId]: {
            name: toolName,
            data: toolData,
            timestamp: Date.now(),
            showOnDashboard
          }
        }
      }, { merge: true });

      toast({
        title: "Results saved",
        description: showOnDashboard 
          ? "Your results have been saved and will be displayed on your dashboard." 
          : "Your results have been saved.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description: "Failed to save results. Please try again.",
        variant: "destructive",
        icon: <AlertTriangle className="h-4 w-4 text-red-500" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 bg-safebite-dark-blue border-safebite-card-bg-alt">
        <CardHeader className="relative border-b border-safebite-card-bg-alt">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <CardTitle className="text-xl font-bold text-safebite-text">
            Save Results
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-safebite-text-secondary mb-6">
            Save your {toolName} results to access them later. You can also choose to display these results on your dashboard.
          </p>
          
          <div className="flex items-center justify-between p-4 bg-safebite-card-bg-alt rounded-lg mb-6">
            <Label htmlFor="show-on-dashboard" className="text-safebite-text cursor-pointer">
              Show on dashboard
            </Label>
            <Switch
              id="show-on-dashboard"
              checked={showOnDashboard}
              onCheckedChange={setShowOnDashboard}
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            >
              {isLoading ? (
                <>
                  <span className="animate-pulse">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Results
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaveToDashboardModal;

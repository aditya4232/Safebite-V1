import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { app } from "../firebase";
import { useToast } from "@/hooks/use-toast";

interface TermsPopupProps {
  onAccept: () => void;
}

const TermsPopup: React.FC<TermsPopupProps> = ({ onAccept }) => {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const { toast } = useToast();

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      const user = auth.currentUser;

      // If user is not logged in, use localStorage
      if (!user) {
        const lastAccepted = localStorage.getItem('termsAcceptedDate');
        const today = new Date().toDateString();

        if (lastAccepted !== today) {
          setOpen(true);
        }
        return;
      }

      // If user is logged in, check Firebase
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const termsData = userData.termsAcceptance || {};
          const lastAccepted = termsData.lastAccepted?.toDate();

          // Check if user accepted terms today
          if (!lastAccepted || !isSameDay(lastAccepted, new Date())) {
            setOpen(true);
          }
        } else {
          // No user document exists yet
          setOpen(true);
        }
      } catch (error) {
        console.error("Error checking terms acceptance:", error);
        // Fallback to localStorage if Firebase fails
        const lastAccepted = localStorage.getItem('termsAcceptedDate');
        const today = new Date().toDateString();

        if (lastAccepted !== today) {
          setOpen(true);
        }
      }
    };

    checkTermsAcceptance();
  }, [auth, db]);

  // Helper function to check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const handleAccept = async () => {
    if (!accepted) return;

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      const acceptanceDate = new Date();

      // Always save to localStorage as a fallback
      localStorage.setItem('termsAcceptedDate', acceptanceDate.toDateString());

      // If user is logged in, save to Firebase
      if (user) {
        const userRef = doc(db, "users", user.uid);

        // Get the current document first
        const docSnap = await getDoc(userRef);
        const userData = docSnap.exists() ? docSnap.data() : {};

        // Prepare terms acceptance data
        const termsData = {
          lastAccepted: Timestamp.fromDate(acceptanceDate),
          acceptanceHistory: [
            ...(userData.termsAcceptance?.acceptanceHistory || []),
            Timestamp.fromDate(acceptanceDate)
          ],
          version: '1.0', // Track terms version for future updates
          userAgent: navigator.userAgent,
          ipAddress: 'Collected server-side' // Note: actual IP would be collected server-side
        };

        // Update the user document
        await setDoc(userRef, {
          termsAcceptance: termsData
        }, { merge: true });

        toast({
          title: "Terms Accepted",
          description: "Your acceptance has been recorded.",
        });
      }

      setOpen(false);
      onAccept();
    } catch (error: any) {
      console.error("Error saving terms acceptance:", error);
      toast({
        title: "Error",
        description: "Could not save your acceptance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-safebite-text">Important Notice</DialogTitle>
          <DialogDescription className="text-safebite-text-secondary">
            Please read and accept our terms before continuing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 text-safebite-text-secondary">
          <p className="text-sm">
            <span className="font-bold text-red-400">Development Notice:</span> This website is currently under development and is part of an engineering project at IFHE Hyderabad.
          </p>

          <p className="text-sm">
            By using SafeBite, you acknowledge that:
          </p>

          <ul className="list-disc pl-5 text-sm space-y-2">
            <li>We collect and process your data to improve our product and services</li>
            <li>All data used in this application is either publicly available or used under fair use principles</li>
            <li>This is an educational project and not a commercial product</li>
            <li>The nutritional information provided may not be 100% accurate and should not replace professional medical advice</li>
          </ul>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="terms"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
              I accept the terms and conditions and privacy policy
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!accepted || isLoading}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            {isLoading ? "Saving..." : "Accept & Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsPopup;

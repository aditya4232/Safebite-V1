import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from 'lucide-react';

interface GuestNamePromptProps {
  onNameSubmit: (name: string) => void;
}

const GuestNamePrompt = ({ onNameSubmit }: GuestNamePromptProps) => {
  const [open, setOpen] = useState(true);
  const [guestName, setGuestName] = useState('');
  const { toast } = useToast();

  // Prevent closing the dialog by clicking outside
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if a name has been submitted
    if (newOpen === false && !guestName.trim()) {
      return;
    }
    setOpen(newOpen);
  };

  const handleSubmit = () => {
    if (!guestName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    // Set the guest name and mark it as set
    localStorage.setItem('guestName', guestName);
    localStorage.setItem('guestNameSet', 'true');

    onNameSubmit(guestName);
    setOpen(false);

    toast({
      title: "Welcome!",
      description: `Hello, ${guestName}! You're now using SafeBite in guest mode.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-safebite-text flex items-center">
            <UserCircle className="h-6 w-6 mr-2 text-safebite-teal" />
            Welcome to SafeBite
          </DialogTitle>
          <DialogDescription className="text-safebite-text-secondary">
            You're using SafeBite in guest mode. Please tell us your name to personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="guest-name" className="text-safebite-text">Your Name</Label>
          <Input
            id="guest-name"
            placeholder="Enter your name"
            className="sci-fi-input mt-2"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <p className="text-xs text-safebite-text-secondary mt-2">
            Your data won't be saved when you exit guest mode.
          </p>
        </div>

        <DialogFooter>
          <Button
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            onClick={handleSubmit}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuestNamePrompt;

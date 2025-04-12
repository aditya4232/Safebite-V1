import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle } from 'lucide-react';
import { getGuestName, setGuestName } from '@/services/guestUserService';

interface GuestNameDialogProps {
  open: boolean;
  onClose: (name?: string) => void;
}

const GuestNameDialog: React.FC<GuestNameDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');

  // No need for useEffect to pre-fill, as the dialog should only open if the name isn't set in the session.
  // The parent component controlling 'open' should check getGuestName() before opening.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Guest User';

    // Save the guest name to sessionStorage via the service
    setGuestName(finalName);
    // No longer need the localStorage flag

    onClose(finalName);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5" />
            Welcome to SafeBite
          </DialogTitle>
          <DialogDescription>
            Please enter your name to continue as a guest user. Your data will not be saved permanently.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Continue as Guest</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestNameDialog;

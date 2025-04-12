import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, Check, ClipboardCheck, Lock, AlertTriangle, ExternalLink, Settings as SettingsIcon, User } from 'lucide-react';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any; // Replace 'any' with a more specific type if available
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose, userProfile }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sci-fi-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5" />
            Your Profile
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold">Account Information</h3>
            <p>Name: {userProfile?.displayName || userProfile?.name || 'N/A'}</p>
            <p>Email: {userProfile?.email || 'N/A'}</p>
            {/* Add more profile information here */}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <Button variant="outline" className="sci-fi-button">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Account Settings
            </Button>
            <Button variant="destructive" className="sci-fi-button">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePopup;

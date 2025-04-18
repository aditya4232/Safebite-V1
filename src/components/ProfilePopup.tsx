import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getAuth, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../firebase";
import { UserCircle, Mail, Check, ClipboardCheck, Lock, AlertTriangle, ExternalLink, Settings as SettingsIcon, User, Camera, Save, RefreshCw, Bell, Shield, Heart, Brain } from 'lucide-react';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any; // Replace 'any' with a more specific type if available
}

const ProfilePopup: React.FC<ProfilePopupProps> = ({ isOpen, onClose, userProfile }) => {
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [displayName, setDisplayName] = useState<string>(userProfile?.displayName || userProfile?.name || '');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string>(userProfile?.photoURL || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Preferences
  const [preferences, setPreferences] = useState({
    notificationsEnabled: userProfile?.profile?.notificationsEnabled || true,
    healthReminders: userProfile?.profile?.healthReminders || true,
    foodSafetyAlerts: userProfile?.profile?.foodSafetyAlerts || true,
    shareHealthData: userProfile?.profile?.shareHealthData || false,
    darkMode: userProfile?.profile?.darkMode || true,
  });

  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  // Update profile information
  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update display name
      await updateProfile(user, {
        displayName: displayName,
        photoURL: profilePicture || user.photoURL
      });

      // Update profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName,
        photoURL: profilePicture || user.photoURL,
        lastUpdated: new Date()
      }, { merge: true });

      setSuccess('Profile updated successfully');
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated.",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!user || !user.email) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
      toast({
        title: "Password Update Failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update preferences
  const handleUpdatePreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update preferences in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        profile: {
          ...preferences
        }
      }, { merge: true });

      setSuccess('Preferences updated successfully');
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved.",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to update preferences');
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would upload this to Firebase Storage
    // For now, we'll just use a data URL
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sci-fi-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5" />
            Your Profile
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-safebite-card-bg-alt mb-2">
                  <img
                    src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=0D8ABC&color=fff`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label htmlFor="profile-picture" className="absolute bottom-0 right-0 bg-safebite-teal text-safebite-dark-blue rounded-full p-1.5 cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    id="profile-picture"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              </div>
              <p className="text-sm text-safebite-text-secondary mt-1">Click the camera icon to change your profile picture</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="sci-fi-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userProfile?.email || ''}
                  disabled
                  className="sci-fi-input opacity-70"
                />
                <p className="text-xs text-safebite-text-secondary">Email cannot be changed</p>
              </div>

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-500 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  {success}
                </div>
              )}

              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Lock className="h-5 w-5 mr-2 text-safebite-teal" />
                Change Password
              </h3>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="sci-fi-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="sci-fi-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="sci-fi-input"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-500 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  {success}
                </div>
              )}

              <Button
                onClick={handleUpdatePassword}
                disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2 text-safebite-teal" />
                Your Preferences
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications</Label>
                    <p className="text-xs text-safebite-text-secondary">Receive notifications about new features and updates</p>
                  </div>
                  <Switch
                    checked={preferences.notificationsEnabled}
                    onCheckedChange={(checked) => setPreferences({...preferences, notificationsEnabled: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center"><Bell className="h-4 w-4 mr-1 text-safebite-teal" /> Health Reminders</Label>
                    <p className="text-xs text-safebite-text-secondary">Receive reminders about weekly health check-ins</p>
                  </div>
                  <Switch
                    checked={preferences.healthReminders}
                    onCheckedChange={(checked) => setPreferences({...preferences, healthReminders: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center"><Shield className="h-4 w-4 mr-1 text-safebite-teal" /> Food Safety Alerts</Label>
                    <p className="text-xs text-safebite-text-secondary">Receive alerts about food safety issues</p>
                  </div>
                  <Switch
                    checked={preferences.foodSafetyAlerts}
                    onCheckedChange={(checked) => setPreferences({...preferences, foodSafetyAlerts: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center"><Heart className="h-4 w-4 mr-1 text-safebite-teal" /> Share Health Data</Label>
                    <p className="text-xs text-safebite-text-secondary">Allow SafeBite to use your health data for personalized recommendations</p>
                  </div>
                  <Switch
                    checked={preferences.shareHealthData}
                    onCheckedChange={(checked) => setPreferences({...preferences, shareHealthData: checked})}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center"><Brain className="h-4 w-4 mr-1 text-safebite-teal" /> Dark Mode</Label>
                    <p className="text-xs text-safebite-text-secondary">Use dark mode for better visibility</p>
                  </div>
                  <Switch
                    checked={preferences.darkMode}
                    onCheckedChange={(checked) => setPreferences({...preferences, darkMode: checked})}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-500 text-sm flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  {success}
                </div>
              )}

              <Button
                onClick={handleUpdatePreferences}
                disabled={isLoading}
                className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePopup;

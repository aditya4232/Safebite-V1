import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { getAuth } from "firebase/auth";
import { app } from "../main";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings2, Activity, Bell, Shield, User } from 'lucide-react';
import HealthDataIntegration from '@/components/HealthDataIntegration';

const Settings = () => {
  const [healthGoal, setHealthGoal] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [foodSafetyAlertsEnabled, setFoodSafetyAlertsEnabled] = useState(false);
  const [healthIntegrations, setHealthIntegrations] = useState<{[key: string]: boolean}>({});
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setHealthGoal(userData.profile?.health_goals || '');
            setNotificationsEnabled(userData.profile?.notificationsEnabled || false);
            setFoodSafetyAlertsEnabled(userData.profile?.foodSafetyAlertsEnabled || false);
            setHealthIntegrations(userData.healthIntegrations || {});
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user, db]);

  const handleHealthGoalChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHealthGoal = e.target.value;
    setHealthGoal(newHealthGoal);
    await updateUserProfile({ health_goals: newHealthGoal });
  };

  const handleNotificationsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotificationsEnabled = e.target.checked;
    setNotificationsEnabled(newNotificationsEnabled);
    await updateUserProfile({ notificationsEnabled: newNotificationsEnabled });
  };

  const handleFoodSafetyAlertsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFoodSafetyAlertsEnabled = e.target.checked;
    setFoodSafetyAlertsEnabled(newFoodSafetyAlertsEnabled);
    await updateUserProfile({ foodSafetyAlertsEnabled: newFoodSafetyAlertsEnabled });
  };

  const updateUserProfile = async (updates: any) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        await setDoc(userRef, { profile: updates }, { merge: true });
        toast({
          title: "Settings Updated",
          description: "Your settings have been updated.",
        });
      } catch (error: any) {
        toast({
          title: "Error updating settings",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error updating user profile:", error);
      }
    }
  };

  const handleHealthIntegrationToggle = async (integration: string, enabled: boolean) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        const updatedIntegrations = { ...healthIntegrations, [integration]: enabled };
        setHealthIntegrations(updatedIntegrations);

        await setDoc(userRef, {
          healthIntegrations: updatedIntegrations
        }, { merge: true });

        toast({
          title: enabled ? "Integration Connected" : "Integration Disconnected",
          description: `Successfully ${enabled ? 'connected to' : 'disconnected from'} the health service.`,
        });
      } catch (error: any) {
        toast({
          title: "Error updating integration",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error updating health integration:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold text-safebite-text mb-4">Settings</h1>
          <p className="text-safebite-text-secondary mb-6">
            Here you can manage your preferences and other settings.
          </p>

          <Tabs defaultValue="preferences" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="preferences" className="flex items-center">
                <Settings2 className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                Health Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-safebite-text mb-4">Preferences</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-safebite-text-secondary block mb-2">Health Goal</label>
                    <select
                      className="sci-fi-input w-full"
                      value={healthGoal}
                      onChange={handleHealthGoalChange}
                    >
                      <option value="">Select a goal</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="General Health">General Health</option>
                      <option value="No Goal">No Goal</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-safebite-text mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 sci-fi-card">
                    <div>
                      <h3 className="text-safebite-text font-medium">App Notifications</h3>
                      <p className="text-safebite-text-secondary text-sm">Receive notifications about your health goals and progress</p>
                    </div>
                    <input
                      type="checkbox"
                      className="sci-fi-checkbox"
                      checked={notificationsEnabled}
                      onChange={handleNotificationsChange}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 sci-fi-card">
                    <div>
                      <h3 className="text-safebite-text font-medium">Food Safety Alerts</h3>
                      <p className="text-safebite-text-secondary text-sm">Get alerts about food safety issues for products you've searched</p>
                    </div>
                    <input
                      type="checkbox"
                      className="sci-fi-checkbox"
                      checked={foodSafetyAlertsEnabled}
                      onChange={handleFoodSafetyAlertsChange}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <HealthDataIntegration
                onIntegrationToggle={handleHealthIntegrationToggle}
                integrations={healthIntegrations}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;

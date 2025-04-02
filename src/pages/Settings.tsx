import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { getAuth } from "firebase/auth";
import { app } from "../main";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [healthGoal, setHealthGoal] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [foodSafetyAlertsEnabled, setFoodSafetyAlertsEnabled] = useState(false);
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

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl font-bold text-safebite-text mb-4">Settings</h1>
          <p className="text-safebite-text-secondary">
            Here you can manage your preferences and other settings.
          </p>
          {/* Settings options */}
          <div className="mt-8">
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
              <div>
                <label className="text-safebite-text-secondary block mb-2">Notifications</label>
                <input
                  type="checkbox"
                  className="sci-fi-checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationsChange}
                />
              </div>
              <div>
                <label className="text-safebite-text-secondary block mb-2">Food Safety Alerts</label>
                <input
                  type="checkbox"
                  className="sci-fi-checkbox"
                  checked={foodSafetyAlertsEnabled}
                  onChange={handleFoodSafetyAlertsChange}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;

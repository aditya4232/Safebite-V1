import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings2, Activity, Bell, Shield, User } from 'lucide-react';
import HealthDataIntegration from '@/components/HealthDataIntegration';
import { trackPreferenceChange } from '@/services/mlService';

const Settings = () => {
  const [healthGoal, setHealthGoal] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [foodSafetyAlertsEnabled, setFoodSafetyAlertsEnabled] = useState(false);
  const [healthIntegrations, setHealthIntegrations] = useState<{[key: string]: boolean}>({});
  const [communityEnabled, setCommunityEnabled] = useState(false);
  const [shareHealthData, setShareHealthData] = useState(false);
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
            setDietaryPreference(userData.profile?.dietary_preferences || '');
            setActivityLevel(userData.profile?.activity_level || '');
            setFoodPreferences(userData.profile?.food_preferences || []);
            setAllergies(userData.profile?.allergies || []);
            setNotificationsEnabled(userData.profile?.notificationsEnabled || false);
            setFoodSafetyAlertsEnabled(userData.profile?.foodSafetyAlertsEnabled || false);
            setHealthIntegrations(userData.healthIntegrations || {});
            setCommunityEnabled(userData.profile?.communityEnabled || false);
            setShareHealthData(userData.profile?.shareHealthData || false);
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

    // Track preference change for ML learning
    trackPreferenceChange('health_goals', newHealthGoal);
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

  const handleDietaryPreferenceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDietaryPreference = e.target.value;
    setDietaryPreference(newDietaryPreference);
    await updateUserProfile({ dietary_preferences: newDietaryPreference });

    // Track preference change for ML learning
    trackPreferenceChange('dietary_preferences', newDietaryPreference);
  };

  const handleActivityLevelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newActivityLevel = e.target.value;
    setActivityLevel(newActivityLevel);
    await updateUserProfile({ activity_level: newActivityLevel });

    // Track preference change for ML learning
    trackPreferenceChange('activity_level', newActivityLevel);
  };

  const handleFoodPreferenceChange = async (preference: string) => {
    let updatedPreferences;
    if (foodPreferences.includes(preference)) {
      updatedPreferences = foodPreferences.filter(p => p !== preference);
    } else {
      updatedPreferences = [...foodPreferences, preference];
    }
    setFoodPreferences(updatedPreferences);
    await updateUserProfile({ food_preferences: updatedPreferences });

    // Track preference change for ML learning
    trackPreferenceChange('food_preferences', updatedPreferences);
  };

  const handleAllergyChange = async (allergy: string) => {
    let updatedAllergies;
    if (allergies.includes(allergy)) {
      updatedAllergies = allergies.filter(a => a !== allergy);
    } else {
      updatedAllergies = [...allergies, allergy];
    }
    setAllergies(updatedAllergies);
    await updateUserProfile({ allergies: updatedAllergies });

    // Track preference change for ML learning
    trackPreferenceChange('allergies', updatedAllergies);
  };

  const handleCommunityEnabledChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCommunityEnabled = e.target.checked;
    setCommunityEnabled(newCommunityEnabled);
    await updateUserProfile({ communityEnabled: newCommunityEnabled });
  };

  const handleShareHealthDataChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShareHealthData = e.target.checked;
    setShareHealthData(newShareHealthData);
    await updateUserProfile({ shareHealthData: newShareHealthData });
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
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="preferences" className="flex items-center">
                <Settings2 className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Community
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

                  <div>
                    <label className="text-safebite-text-secondary block mb-2">Dietary Preference</label>
                    <select
                      className="sci-fi-input w-full"
                      value={dietaryPreference}
                      onChange={handleDietaryPreferenceChange}
                    >
                      <option value="">Select a preference</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Pescatarian">Pescatarian</option>
                      <option value="Keto">Keto</option>
                      <option value="Paleo">Paleo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-safebite-text-secondary block mb-2">Activity Level</label>
                    <select
                      className="sci-fi-input w-full"
                      value={activityLevel}
                      onChange={handleActivityLevelChange}
                    >
                      <option value="">Select activity level</option>
                      <option value="Sedentary">Sedentary (little or no exercise)</option>
                      <option value="Light">Light (exercise 1-3 days/week)</option>
                      <option value="Moderate">Moderate (exercise 3-5 days/week)</option>
                      <option value="Active">Active (exercise 6-7 days/week)</option>
                      <option value="Very Active">Very Active (intense exercise daily)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-safebite-text-secondary block mb-2">Food Preferences</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Mediterranean', 'American'].map(preference => (
                        <div key={preference} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`pref-${preference}`}
                            checked={foodPreferences.includes(preference)}
                            onChange={() => handleFoodPreferenceChange(preference)}
                            className="sci-fi-checkbox"
                          />
                          <label htmlFor={`pref-${preference}`} className="ml-2 text-safebite-text">{preference}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-safebite-text-secondary block mb-2">Allergies & Intolerances</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Gluten', 'Dairy', 'Nuts', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Wheat'].map(allergy => (
                        <div key={allergy} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`allergy-${allergy}`}
                            checked={allergies.includes(allergy)}
                            onChange={() => handleAllergyChange(allergy)}
                            className="sci-fi-checkbox"
                          />
                          <label htmlFor={`allergy-${allergy}`} className="ml-2 text-safebite-text">{allergy}</label>
                        </div>
                      ))}
                    </div>
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

            <TabsContent value="community" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-safebite-text mb-4">Community Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 sci-fi-card">
                    <div>
                      <h3 className="text-safebite-text font-medium">Enable Community Features</h3>
                      <p className="text-safebite-text-secondary text-sm">Allow sharing and viewing community-contributed food products</p>
                    </div>
                    <input
                      type="checkbox"
                      className="sci-fi-checkbox"
                      checked={communityEnabled}
                      onChange={handleCommunityEnabledChange}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 sci-fi-card">
                    <div>
                      <h3 className="text-safebite-text font-medium">Share Health Data</h3>
                      <p className="text-safebite-text-secondary text-sm">Share anonymized health data to help improve recommendations</p>
                    </div>
                    <input
                      type="checkbox"
                      className="sci-fi-checkbox"
                      checked={shareHealthData}
                      onChange={handleShareHealthDataChange}
                    />
                  </div>

                  <div className="p-4 sci-fi-card">
                    <h3 className="text-safebite-text font-medium mb-2">Community Contribution</h3>
                    <p className="text-safebite-text-secondary text-sm mb-4">
                      You can contribute to the SafeBite community by sharing food products you've scanned or reviewed.
                    </p>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2">
                          1
                        </div>
                        <span className="text-safebite-text-secondary">Scan or search for a food product</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2">
                          2
                        </div>
                        <span className="text-safebite-text-secondary">Add your review or additional information</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2">
                          3
                        </div>
                        <span className="text-safebite-text-secondary">Share with the community</span>
                      </div>
                    </div>
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

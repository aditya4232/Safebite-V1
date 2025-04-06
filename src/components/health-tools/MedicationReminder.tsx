import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Plus, Trash2, Bell, Check, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../../firebase";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  notes: string;
}

const MedicationReminder = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState<Medication>({
    id: '',
    name: '',
    dosage: '',
    frequency: 'daily',
    time: '08:00',
    notes: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setIsLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().medications) {
        setMedications(userSnap.data().medications);
      } else {
        setMedications([]);
      }
    } catch (error) {
      console.error("Error loading medications:", error);
      toast({
        title: "Error",
        description: "Failed to load your medications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMedications = async (updatedMedications: Medication[]) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        medications: updatedMedications
      }, { merge: true });

      toast({
        title: "Success",
        description: "Your medications have been saved.",
      });
    } catch (error) {
      console.error("Error saving medications:", error);
      toast({
        title: "Error",
        description: "Failed to save your medications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage) {
      toast({
        title: "Error",
        description: "Please enter a medication name and dosage.",
        variant: "destructive"
      });
      return;
    }

    const medicationWithId = {
      ...newMedication,
      id: Date.now().toString()
    };

    const updatedMedications = [...medications, medicationWithId];
    setMedications(updatedMedications);
    saveMedications(updatedMedications);

    // Reset form
    setNewMedication({
      id: '',
      name: '',
      dosage: '',
      frequency: 'daily',
      time: '08:00',
      notes: ''
    });
    setIsAdding(false);
  };

  const handleDeleteMedication = (id: string) => {
    const updatedMedications = medications.filter(med => med.id !== id);
    setMedications(updatedMedications);
    saveMedications(updatedMedications);
  };

  const handleRequestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled",
            description: "You will now receive medication reminders.",
          });
        } else {
          toast({
            title: "Notifications Disabled",
            description: "Please enable notifications to receive medication reminders.",
            variant: "destructive"
          });
        }
      });
    }
  };

  const getNextDoseTime = (medication: Medication): string => {
    const now = new Date();
    const [hours, minutes] = medication.time.split(':').map(Number);

    const doseTime = new Date();
    doseTime.setHours(hours, minutes, 0, 0);

    if (doseTime < now) {
      // If the dose time has already passed today
      if (medication.frequency === 'daily') {
        // Set to tomorrow
        doseTime.setDate(doseTime.getDate() + 1);
      } else if (medication.frequency === 'weekly') {
        // Set to next week
        doseTime.setDate(doseTime.getDate() + 7);
      }
    }

    const timeUntil = doseTime.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

    if (hoursUntil === 0 && minutesUntil === 0) {
      return "Now";
    } else if (hoursUntil === 0) {
      return `In ${minutesUntil}m`;
    } else {
      return `In ${hoursUntil}h ${minutesUntil}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-safebite-teal"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-safebite-text">Your Medications</h3>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {medications.length === 0 ? (
            <div className="text-center py-8 text-safebite-text-secondary">
              <Pill className="h-12 w-12 mx-auto mb-3 text-safebite-text-secondary opacity-50" />
              <p>No medications added yet.</p>
              <p className="text-sm">Add your medications to get reminders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medications.map(medication => (
                <Card key={medication.id} className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Pill className="h-4 w-4 text-safebite-teal mr-2" />
                          <h4 className="font-medium text-safebite-text">{medication.name}</h4>
                        </div>
                        <p className="text-sm text-safebite-text-secondary mt-1">{medication.dosage}</p>

                        <div className="flex items-center mt-2 text-xs text-safebite-text-secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{medication.time} • {medication.frequency.charAt(0).toUpperCase() + medication.frequency.slice(1)}</span>
                        </div>

                        {medication.notes && (
                          <p className="text-xs text-safebite-text-secondary mt-2">{medication.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => handleDeleteMedication(medication.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="text-xs font-medium text-safebite-teal mt-2">
                          {getNextDoseTime(medication)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                className="w-full mt-4 border-dashed border-safebite-text-secondary text-safebite-text-secondary"
                onClick={handleRequestNotifications}
              >
                <Bell className="mr-2 h-4 w-4" />
                Enable Reminders
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-safebite-card-bg border-safebite-card-bg-alt">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium text-safebite-text mb-4">Add Medication</h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="med-name" className="text-safebite-text">Medication Name</Label>
                <Input
                  id="med-name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  placeholder="e.g., Aspirin"
                  className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
                />
              </div>

              <div>
                <Label htmlFor="med-dosage" className="text-safebite-text">Dosage</Label>
                <Input
                  id="med-dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="e.g., 81mg, 1 tablet"
                  className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="med-frequency" className="text-safebite-text">Frequency</Label>
                  <Select
                    value={newMedication.frequency}
                    onValueChange={(value) => setNewMedication({...newMedication, frequency: value})}
                  >
                    <SelectTrigger className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="twice-daily">Twice Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="as-needed">As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="med-time" className="text-safebite-text">Time</Label>
                  <Input
                    id="med-time"
                    type="time"
                    value={newMedication.time}
                    onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                    className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="med-notes" className="text-safebite-text">Notes (optional)</Label>
                <Input
                  id="med-notes"
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                  placeholder="e.g., Take with food"
                  className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="border-safebite-card-bg-alt"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMedication}
                  className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-safebite-text-secondary mt-4">
        <p>Note: This tool is for personal medication tracking only. Always follow your healthcare provider's instructions.</p>
      </div>
    </div>
  );
};

export default MedicationReminder;

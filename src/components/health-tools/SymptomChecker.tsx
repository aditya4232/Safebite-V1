import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Stethoscope, AlertTriangle } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

// Common symptoms and possible conditions
const symptomsList = [
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Cough' },
  { id: 'headache', label: 'Headache' },
  { id: 'sore_throat', label: 'Sore Throat' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'body_aches', label: 'Body Aches' },
  { id: 'shortness_of_breath', label: 'Shortness of Breath' },
  { id: 'nausea', label: 'Nausea' },
  { id: 'diarrhea', label: 'Diarrhea' },
  { id: 'loss_of_taste', label: 'Loss of Taste/Smell' },
];

// Simple symptom to condition mapping
const conditionMapping: Record<string, string[]> = {
  'fever': ['Common Cold', 'Flu', 'COVID-19'],
  'cough': ['Common Cold', 'Flu', 'COVID-19', 'Bronchitis'],
  'headache': ['Migraine', 'Tension Headache', 'Flu', 'Dehydration'],
  'sore_throat': ['Common Cold', 'Strep Throat', 'Flu'],
  'fatigue': ['Flu', 'Anemia', 'Depression', 'COVID-19'],
  'body_aches': ['Flu', 'COVID-19', 'Fibromyalgia'],
  'shortness_of_breath': ['Asthma', 'COVID-19', 'Anxiety', 'Pneumonia'],
  'nausea': ['Food Poisoning', 'Migraine', 'Pregnancy', 'Gastroenteritis'],
  'diarrhea': ['Food Poisoning', 'Gastroenteritis', 'IBS', 'COVID-19'],
  'loss_of_taste': ['COVID-19', 'Common Cold', 'Sinusitis'],
};

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [possibleConditions, setPossibleConditions] = useState<string[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleSymptomChange = (symptomId: string, checked: boolean) => {
    if (checked) {
      setSelectedSymptoms([...selectedSymptoms, symptomId]);
    } else {
      setSelectedSymptoms(selectedSymptoms.filter(id => id !== symptomId));
    }
  };

  const checkSymptoms = () => {
    if (selectedSymptoms.length === 0) return;
    
    // Count occurrences of each condition
    const conditionCounts: Record<string, number> = {};
    
    selectedSymptoms.forEach(symptom => {
      const conditions = conditionMapping[symptom] || [];
      conditions.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
    });
    
    // Sort conditions by count (most likely first)
    const sortedConditions = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([condition]) => condition);
    
    setPossibleConditions(sortedConditions.slice(0, 3));
    setShowDisclaimer(true);
    
    // Track this interaction for ML learning
    trackHealthBoxInteraction('symptom_checker', 'check');
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Stethoscope className="mr-2 h-5 w-5 text-safebite-teal" />
          Symptom Checker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-safebite-text-secondary text-sm mb-2">
            Select the symptoms you're experiencing:
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {symptomsList.map(symptom => (
              <div key={symptom.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={symptom.id} 
                  checked={selectedSymptoms.includes(symptom.id)}
                  onCheckedChange={(checked) => handleSymptomChange(symptom.id, checked === true)}
                />
                <Label 
                  htmlFor={symptom.id} 
                  className="text-safebite-text-secondary cursor-pointer"
                >
                  {symptom.label}
                </Label>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={checkSymptoms} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            disabled={selectedSymptoms.length === 0}
          >
            Check Symptoms
          </Button>
          
          {possibleConditions.length > 0 && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="text-safebite-text font-semibold mb-2">Possible conditions:</div>
              <ul className="space-y-1">
                {possibleConditions.map((condition, index) => (
                  <li key={index} className="text-safebite-text-secondary">
                    • {condition}
                  </li>
                ))}
              </ul>
              
              {showDisclaimer && (
                <div className="mt-3 flex items-start text-xs text-amber-400">
                  <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>
                    This is not a medical diagnosis. Please consult with a healthcare professional for proper evaluation.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomChecker;

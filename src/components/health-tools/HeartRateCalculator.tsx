import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const HeartRateCalculator = () => {
  const [age, setAge] = useState<number>(30);
  const [restingHeartRate, setRestingHeartRate] = useState<number>(70);
  const [fitnessLevel, setFitnessLevel] = useState<string>('average');
  const [maxHeartRate, setMaxHeartRate] = useState<number | null>(null);
  const [zones, setZones] = useState<{[key: string]: {min: number, max: number}} | null>(null);

  const calculateHeartRateZones = () => {
    if (age) {
      // Calculate maximum heart rate using different formulas
      
      // 1. Traditional formula: 220 - age
      const traditionalMax = 220 - age;
      
      // 2. Tanaka formula: 208 - (0.7 * age)
      const tanakaMax = 208 - (0.7 * age);
      
      // 3. Gellish formula: 207 - (0.7 * age)
      const gellishMax = 207 - (0.7 * age);
      
      // Average the formulas
      const avgMaxHeartRate = Math.round((traditionalMax + tanakaMax + gellishMax) / 3);
      
      // Adjust based on fitness level
      let fitnessAdjustment = 0;
      switch (fitnessLevel) {
        case 'sedentary':
          fitnessAdjustment = -5;
          break;
        case 'average':
          fitnessAdjustment = 0;
          break;
        case 'active':
          fitnessAdjustment = 5;
          break;
        case 'athlete':
          fitnessAdjustment = 10;
          break;
      }
      
      const adjustedMaxHeartRate = avgMaxHeartRate + fitnessAdjustment;
      setMaxHeartRate(adjustedMaxHeartRate);
      
      // Calculate heart rate reserve (Karvonen method)
      const hrr = adjustedMaxHeartRate - restingHeartRate;
      
      // Calculate training zones
      const calculatedZones = {
        'Recovery': {
          min: Math.round(restingHeartRate + (hrr * 0.5)),
          max: Math.round(restingHeartRate + (hrr * 0.6))
        },
        'Fat Burning': {
          min: Math.round(restingHeartRate + (hrr * 0.6)),
          max: Math.round(restingHeartRate + (hrr * 0.7))
        },
        'Aerobic': {
          min: Math.round(restingHeartRate + (hrr * 0.7)),
          max: Math.round(restingHeartRate + (hrr * 0.8))
        },
        'Anaerobic': {
          min: Math.round(restingHeartRate + (hrr * 0.8)),
          max: Math.round(restingHeartRate + (hrr * 0.9))
        },
        'Maximum': {
          min: Math.round(restingHeartRate + (hrr * 0.9)),
          max: adjustedMaxHeartRate
        }
      };
      
      setZones(calculatedZones);
      
      // Track this interaction for ML learning
      trackHealthBoxInteraction('heart_rate', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Heart className="mr-2 h-5 w-5 text-safebite-teal" />
          Heart Rate Zones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="text-safebite-text-secondary">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="restingHeartRate" className="text-safebite-text-secondary">Resting HR (bpm)</Label>
              <Input
                id="restingHeartRate"
                type="number"
                value={restingHeartRate}
                onChange={(e) => setRestingHeartRate(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="fitnessLevel" className="text-safebite-text-secondary">Fitness Level</Label>
            <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
              <SelectTrigger className="sci-fi-input">
                <SelectValue placeholder="Select fitness level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="athlete">Athlete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={calculateHeartRateZones} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Heart Rate Zones
          </Button>
          
          {maxHeartRate !== null && zones !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center mb-2">
                <span className="text-safebite-text-secondary">Max Heart Rate:</span>
                <span className="text-safebite-text font-semibold">{maxHeartRate} bpm</span>
              </div>
              
              <div className="text-safebite-text-secondary text-sm font-medium mt-3 mb-1">Training Zones:</div>
              <div className="space-y-2">
                {Object.entries(zones).map(([zone, { min, max }]) => (
                  <div key={zone} className="flex justify-between items-center text-sm">
                    <span className="text-safebite-text-secondary">{zone}:</span>
                    <span className="text-safebite-text">{min} - {max} bpm</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeartRateCalculator;

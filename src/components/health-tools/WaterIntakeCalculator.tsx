import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const WaterIntakeCalculator = () => {
  const [weight, setWeight] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [climate, setClimate] = useState<string>('moderate');
  const [waterIntake, setWaterIntake] = useState<number | null>(null);

  const calculateWaterIntake = () => {
    if (weight) {
      // Base calculation: 30ml per kg of body weight
      let baseIntake = weight * 30;
      
      // Activity level adjustment
      let activityMultiplier = 1.0;
      switch (activityLevel) {
        case 'sedentary':
          activityMultiplier = 1.0;
          break;
        case 'light':
          activityMultiplier = 1.1;
          break;
        case 'moderate':
          activityMultiplier = 1.2;
          break;
        case 'active':
          activityMultiplier = 1.3;
          break;
        case 'very_active':
          activityMultiplier = 1.4;
          break;
      }
      
      // Climate adjustment
      let climateMultiplier = 1.0;
      switch (climate) {
        case 'cold':
          climateMultiplier = 0.9;
          break;
        case 'moderate':
          climateMultiplier = 1.0;
          break;
        case 'hot':
          climateMultiplier = 1.1;
          break;
        case 'very_hot':
          climateMultiplier = 1.2;
          break;
      }
      
      // Calculate total water intake in ml
      const totalIntake = baseIntake * activityMultiplier * climateMultiplier;
      
      // Convert to liters and round to 1 decimal place
      const waterInLiters = Math.round(totalIntake / 100) / 10;
      
      setWaterIntake(waterInLiters);
      
      // Track this interaction for ML learning
      trackHealthBoxInteraction('water', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Droplets className="mr-2 h-5 w-5 text-safebite-teal" />
          Water Intake Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="weight" className="text-safebite-text-secondary">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="sci-fi-input"
            />
          </div>
          
          <div>
            <Label htmlFor="activity" className="text-safebite-text-secondary">Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger className="sci-fi-input">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                <SelectItem value="light">Light (exercise 1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (exercise 3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (exercise 6-7 days/week)</SelectItem>
                <SelectItem value="very_active">Very Active (intense exercise daily)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="climate" className="text-safebite-text-secondary">Climate</Label>
            <Select value={climate} onValueChange={setClimate}>
              <SelectTrigger className="sci-fi-input">
                <SelectValue placeholder="Select climate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="very_hot">Very Hot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={calculateWaterIntake} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Water Intake
          </Button>
          
          {waterIntake !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center">
                <span className="text-safebite-text-secondary">Daily Water Intake:</span>
                <span className="text-safebite-text font-semibold">{waterIntake} liters</span>
              </div>
              <div className="mt-2 text-xs text-safebite-text-secondary">
                <p>That's approximately {Math.round(waterIntake * 4)} glasses of water (250ml each)</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterIntakeCalculator;

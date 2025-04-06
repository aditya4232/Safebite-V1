import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const CalorieCalculator = () => {
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>('male');
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [calories, setCalories] = useState<number | null>(null);

  const calculateCalories = () => {
    if (age && weight && height) {
      // Harris-Benedict Equation
      let bmr = 0;
      
      if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      
      // Activity multiplier
      let activityMultiplier = 1.2; // Sedentary
      
      switch (activityLevel) {
        case 'sedentary':
          activityMultiplier = 1.2;
          break;
        case 'light':
          activityMultiplier = 1.375;
          break;
        case 'moderate':
          activityMultiplier = 1.55;
          break;
        case 'active':
          activityMultiplier = 1.725;
          break;
        case 'very_active':
          activityMultiplier = 1.9;
          break;
      }
      
      const dailyCalories = Math.round(bmr * activityMultiplier);
      setCalories(dailyCalories);
      
      // Track this interaction for ML learning
      trackHealthBoxInteraction('calories', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Flame className="mr-2 h-5 w-5 text-safebite-teal" />
          Calorie Calculator
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
              <Label htmlFor="gender" className="text-safebite-text-secondary">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="height" className="text-safebite-text-secondary">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
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
          
          <Button 
            onClick={calculateCalories} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Calories
          </Button>
          
          {calories !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center">
                <span className="text-safebite-text-secondary">Daily Calories:</span>
                <span className="text-safebite-text font-semibold">{calories} kcal</span>
              </div>
              <div className="mt-2 text-xs text-safebite-text-secondary">
                <p>Weight Loss: {calories - 500} kcal</p>
                <p>Weight Gain: {calories + 500} kcal</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalorieCalculator;

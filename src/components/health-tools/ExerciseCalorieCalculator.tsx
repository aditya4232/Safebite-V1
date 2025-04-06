import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Activity } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// MET (Metabolic Equivalent of Task) values for different activities
const exercises = [
  { id: 'walking', name: 'Walking (moderate)', met: 3.5 },
  { id: 'jogging', name: 'Jogging (5 mph)', met: 8.3 },
  { id: 'running', name: 'Running (7.5 mph)', met: 12.3 },
  { id: 'cycling', name: 'Cycling (moderate)', met: 7.5 },
  { id: 'swimming', name: 'Swimming (moderate)', met: 6.0 },
  { id: 'yoga', name: 'Yoga', met: 3.0 },
  { id: 'weightlifting', name: 'Weight Lifting', met: 5.0 },
  { id: 'hiit', name: 'HIIT', met: 8.0 },
  { id: 'dancing', name: 'Dancing', met: 4.8 },
  { id: 'hiking', name: 'Hiking', met: 6.0 },
  { id: 'basketball', name: 'Basketball', met: 8.0 },
  { id: 'soccer', name: 'Soccer', met: 7.0 },
  { id: 'tennis', name: 'Tennis', met: 7.3 },
  { id: 'gardening', name: 'Gardening', met: 3.8 },
  { id: 'cleaning', name: 'House Cleaning', met: 3.3 },
];

const ExerciseCalorieCalculator = () => {
  const [weight, setWeight] = useState<number | ''>('');
  const [duration, setDuration] = useState<number | ''>('');
  const [exercise, setExercise] = useState('walking');
  const [result, setResult] = useState<{
    calories: number;
    met: number;
    equivalentFood: string;
  } | null>(null);

  const calculateCalories = () => {
    if (weight === '' || duration === '') {
      return;
    }

    // Find the selected exercise
    const selectedExercise = exercises.find(ex => ex.id === exercise);
    if (!selectedExercise) return;

    // Calculate calories burned
    // Formula: Calories = MET × weight (kg) × duration (hours)
    const weightInKg = typeof weight === 'number' ? weight : 0;
    const durationInHours = (typeof duration === 'number' ? duration : 0) / 60; // Convert minutes to hours
    const caloriesBurned = selectedExercise.met * weightInKg * durationInHours;

    // Generate equivalent food
    const equivalentFood = getEquivalentFood(caloriesBurned);

    setResult({
      calories: Math.round(caloriesBurned),
      met: selectedExercise.met,
      equivalentFood
    });
  };

  // Function to get equivalent food for calories burned
  const getEquivalentFood = (calories: number): string => {
    if (calories < 100) {
      return "1 medium apple (95 calories)";
    } else if (calories < 200) {
      return "1 chocolate chip cookie (160 calories)";
    } else if (calories < 300) {
      return "1 slice of pizza (285 calories)";
    } else if (calories < 400) {
      return "1 cheeseburger (350 calories)";
    } else if (calories < 500) {
      return "1 bagel with cream cheese (450 calories)";
    } else if (calories < 700) {
      return "1 fast food meal (650 calories)";
    } else {
      return "1 large restaurant meal (800+ calories)";
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <Label htmlFor="weight" className="text-safebite-text">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
          />
        </div>

        <div>
          <Label htmlFor="exercise" className="text-safebite-text">Exercise Type</Label>
          <Select value={exercise} onValueChange={setExercise}>
            <SelectTrigger className="bg-safebite-card-bg-alt border-safebite-card-bg-alt">
              <SelectValue placeholder="Select exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(ex => (
                <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration" className="text-safebite-text">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="30"
            value={duration}
            onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
          />
        </div>
      </div>

      <Button 
        onClick={calculateCalories} 
        className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
        disabled={weight === '' || duration === ''}
      >
        <Flame className="mr-2 h-4 w-4" />
        Calculate Calories Burned
      </Button>

      {result && (
        <Card className="mt-4 border-t-4 border-t-safebite-teal">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <Flame className="h-5 w-5 text-safebite-teal mr-2" />
                  <span className="font-semibold text-safebite-text">Calories Burned</span>
                </div>
                <p className="text-2xl font-bold text-safebite-teal">{result.calories} kcal</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="text-sm text-safebite-text-secondary">MET Value</div>
                  <div className="font-semibold text-safebite-text">{result.met}</div>
                </div>

                <div>
                  <div className="text-sm text-safebite-text-secondary">Food Equivalent</div>
                  <div className="font-semibold text-safebite-text">{result.equivalentFood}</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-safebite-text-secondary">
                <p>Note: This calculator provides an estimate. Actual calories burned may vary based on individual factors like fitness level, age, and intensity.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExerciseCalorieCalculator;

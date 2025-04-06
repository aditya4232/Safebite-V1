
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Droplets, Scale, Heart, AlertTriangle, Utensils, Activity } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const HealthBox = () => {
  const [activeCalculator, setActiveCalculator] = useState('bmi');

  // BMI Calculator
  const [bmiData, setBmiData] = useState({
    weight: 70,
    height: 170,
    result: 0,
    category: ''
  });

  // Calorie Calculator
  const [calorieData, setCalorieData] = useState({
    age: 30,
    gender: 'male',
    weight: 70,
    height: 170,
    activityLevel: 'moderate',
    result: 0
  });

  // Water Intake Calculator
  const [waterData, setWaterData] = useState({
    weight: 70,
    activityLevel: 'moderate',
    result: 0
  });

  // Macronutrient Calculator
  const [macroData, setMacroData] = useState({
    calories: 2000,
    goal: 'maintain',
    dietType: 'balanced',
    carbs: 0,
    protein: 0,
    fat: 0
  });

  // Food Safety Score
  const [safetyData, setSafetyData] = useState({
    additives: 3,
    preservatives: 2,
    naturalIngredients: 7,
    processingLevel: 4,
    score: 0
  });

  // Calculate BMI
  const calculateBMI = () => {
    const heightInMeters = bmiData.height / 100;
    const bmi = bmiData.weight / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmi * 10) / 10;

    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 18.5 && bmi < 25) category = 'Normal weight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else category = 'Obesity';

    setBmiData({
      ...bmiData,
      result: roundedBMI,
      category
    });

    // Track this interaction for ML learning
    trackHealthBoxInteraction('bmi', 'calculate');
  };

  // Calculate Calories
  const calculateCalories = () => {
    // Harris-Benedict Equation
    let bmr = 0;

    if (calorieData.gender === 'male') {
      bmr = 88.362 + (13.397 * calorieData.weight) + (4.799 * calorieData.height) - (5.677 * calorieData.age);
    } else {
      bmr = 447.593 + (9.247 * calorieData.weight) + (3.098 * calorieData.height) - (4.330 * calorieData.age);
    }

    let activityMultiplier = 1.2; // sedentary
    if (calorieData.activityLevel === 'light') activityMultiplier = 1.375;
    else if (calorieData.activityLevel === 'moderate') activityMultiplier = 1.55;
    else if (calorieData.activityLevel === 'active') activityMultiplier = 1.725;
    else if (calorieData.activityLevel === 'very_active') activityMultiplier = 1.9;

    const calories = Math.round(bmr * activityMultiplier);

    setCalorieData({
      ...calorieData,
      result: calories
    });

    // Track this interaction for ML learning
    trackHealthBoxInteraction('calories', 'calculate');
  };

  // Calculate Water Intake
  const calculateWater = () => {
    // Basic calculation: 30ml per kg of body weight
    let waterInML = waterData.weight * 30;

    // Adjust for activity level
    if (waterData.activityLevel === 'light') waterInML *= 1.1;
    else if (waterData.activityLevel === 'moderate') waterInML *= 1.2;
    else if (waterData.activityLevel === 'active') waterInML *= 1.3;
    else if (waterData.activityLevel === 'very_active') waterInML *= 1.4;

    // Convert to liters
    const waterInLiters = Math.round(waterInML / 100) / 10;

    setWaterData({
      ...waterData,
      result: waterInLiters
    });

    // Track this interaction for ML learning
    trackHealthBoxInteraction('water', 'calculate');
  };

  // Calculate Macronutrients
  const calculateMacros = () => {
    let proteinPct = 0.25; // 25% of calories from protein
    let fatPct = 0.3; // 30% of calories from fat
    let carbsPct = 0.45; // 45% of calories from carbs

    // Adjust based on diet type
    if (macroData.dietType === 'lowcarb') {
      carbsPct = 0.2;
      fatPct = 0.5;
      proteinPct = 0.3;
    } else if (macroData.dietType === 'highprotein') {
      carbsPct = 0.4;
      fatPct = 0.2;
      proteinPct = 0.4;
    } else if (macroData.dietType === 'keto') {
      carbsPct = 0.05;
      fatPct = 0.7;
      proteinPct = 0.25;
    }

    // Adjust based on goal
    let calorieAdjustment = macroData.calories;
    if (macroData.goal === 'lose') {
      calorieAdjustment = macroData.calories * 0.8; // 20% deficit
    } else if (macroData.goal === 'gain') {
      calorieAdjustment = macroData.calories * 1.15; // 15% surplus
    }

    // Calculate grams
    // Protein: 4 calories per gram
    // Carbs: 4 calories per gram
    // Fat: 9 calories per gram
    const proteinGrams = Math.round((calorieAdjustment * proteinPct) / 4);
    const carbGrams = Math.round((calorieAdjustment * carbsPct) / 4);
    const fatGrams = Math.round((calorieAdjustment * fatPct) / 9);

    setMacroData({
      ...macroData,
      carbs: carbGrams,
      protein: proteinGrams,
      fat: fatGrams
    });

    // Track this interaction for ML learning
    trackHealthBoxInteraction('macros', 'calculate');
  };

  // Calculate Food Safety Score
  const calculateSafetyScore = () => {
    // Scale from 0-10, with 10 being the safest
    // Additives and preservatives count negatively, natural ingredients positively
    // Processing level is inverse (more processing = worse score)

    const additivePenalty = safetyData.additives * 0.5;
    const preservativePenalty = safetyData.preservatives * 0.3;
    const naturalBonus = safetyData.naturalIngredients * 0.8;
    const processingPenalty = safetyData.processingLevel * 0.4;

    let score = 5 + naturalBonus - additivePenalty - preservativePenalty - processingPenalty;

    // Ensure score is between 0 and 10
    score = Math.max(0, Math.min(10, score));
    score = Math.round(score * 10) / 10;

    setSafetyData({
      ...safetyData,
      score
    });

    // Track this interaction for ML learning
    trackHealthBoxInteraction('safety', 'calculate');
  };

  return (
    <Card className="sci-fi-card">
      <h2 className="text-2xl font-bold gradient-text mb-4">HealthBox AI</h2>
      <p className="text-safebite-text-secondary mb-6">
        Your all-in-one health calculator suite
      </p>

      <Tabs value={activeCalculator} onValueChange={setActiveCalculator}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="bmi" className="data-[state=active]:bg-safebite-card-bg-alt">
            <Scale className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">BMI</span>
          </TabsTrigger>
          <TabsTrigger value="calories" className="data-[state=active]:bg-safebite-card-bg-alt">
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Calories</span>
          </TabsTrigger>
          <TabsTrigger value="water" className="data-[state=active]:bg-safebite-card-bg-alt">
            <Droplets className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Water</span>
          </TabsTrigger>
          <TabsTrigger value="macros" className="data-[state=active]:bg-safebite-card-bg-alt">
            <Utensils className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Macros</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="data-[state=active]:bg-safebite-card-bg-alt">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Safety</span>
          </TabsTrigger>
        </TabsList>

        {/* BMI Calculator */}
        <TabsContent value="bmi" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={bmiData.weight}
                onChange={(e) => setBmiData({...bmiData, weight: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={bmiData.height}
                onChange={(e) => setBmiData({...bmiData, height: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
          </div>

          <Button
            onClick={calculateBMI}
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate BMI
          </Button>

          {bmiData.result > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-safebite-card-bg-alt">
              <div className="text-2xl font-bold text-center mb-2">
                <span className="gradient-text">{bmiData.result}</span>
              </div>
              <div className="text-center text-safebite-text">
                Category: <span className="text-safebite-teal">{bmiData.category}</span>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Calorie Calculator */}
        <TabsContent value="calories" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={calorieData.age}
                onChange={(e) => setCalorieData({...calorieData, age: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={calorieData.gender}
                onValueChange={(value) => setCalorieData({...calorieData, gender: value})}
              >
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="calorie-weight">Weight (kg)</Label>
              <Input
                id="calorie-weight"
                type="number"
                value={calorieData.weight}
                onChange={(e) => setCalorieData({...calorieData, weight: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="calorie-height">Height (cm)</Label>
              <Input
                id="calorie-height"
                type="number"
                value={calorieData.height}
                onChange={(e) => setCalorieData({...calorieData, height: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="activity">Activity Level</Label>
              <Select
                value={calorieData.activityLevel}
                onValueChange={(value) => setCalorieData({...calorieData, activityLevel: value})}
              >
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                  <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                  <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (twice a day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculateCalories}
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Daily Calories
          </Button>

          {calorieData.result > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-safebite-card-bg-alt">
              <div className="text-2xl font-bold text-center mb-2">
                <span className="gradient-text">{calorieData.result}</span> calories/day
              </div>
              <div className="text-center text-safebite-text-secondary">
                This is your estimated maintenance calorie requirement
              </div>
            </div>
          )}
        </TabsContent>

        {/* Water Intake Calculator */}
        <TabsContent value="water" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="water-weight">Weight (kg)</Label>
              <Input
                id="water-weight"
                type="number"
                value={waterData.weight}
                onChange={(e) => setWaterData({...waterData, weight: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="water-activity">Activity Level</Label>
              <Select
                value={waterData.activityLevel}
                onValueChange={(value) => setWaterData({...waterData, activityLevel: value})}
              >
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculateWater}
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Water Intake
          </Button>

          {waterData.result > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-safebite-card-bg-alt">
              <div className="text-2xl font-bold text-center mb-2">
                <span className="gradient-text">{waterData.result}</span> liters/day
              </div>
              <div className="text-center text-safebite-text-secondary">
                This is approximately {Math.round(waterData.result * 4)} glasses of water
              </div>
            </div>
          )}
        </TabsContent>

        {/* Macronutrient Calculator */}
        <TabsContent value="macros" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="macro-calories">Daily Calories</Label>
              <Input
                id="macro-calories"
                type="number"
                value={macroData.calories}
                onChange={(e) => setMacroData({...macroData, calories: Number(e.target.value)})}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="goal">Health Goal</Label>
              <Select
                value={macroData.goal}
                onValueChange={(value) => setMacroData({...macroData, goal: value})}
              >
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain">Gain Weight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="diet-type">Diet Type</Label>
              <Select
                value={macroData.dietType}
                onValueChange={(value) => setMacroData({...macroData, dietType: value})}
              >
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced (Standard)</SelectItem>
                  <SelectItem value="lowcarb">Low Carb</SelectItem>
                  <SelectItem value="highprotein">High Protein</SelectItem>
                  <SelectItem value="keto">Ketogenic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculateMacros}
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Macronutrients
          </Button>

          {macroData.protein > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-safebite-card-bg-alt">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-safebite-text-secondary mb-1">Protein</div>
                  <div className="text-xl font-bold text-safebite-teal">{macroData.protein}g</div>
                </div>
                <div>
                  <div className="text-safebite-text-secondary mb-1">Carbs</div>
                  <div className="text-xl font-bold text-blue-400">{macroData.carbs}g</div>
                </div>
                <div>
                  <div className="text-safebite-text-secondary mb-1">Fat</div>
                  <div className="text-xl font-bold text-yellow-400">{macroData.fat}g</div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Food Safety Score Calculator */}
        <TabsContent value="safety" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="additives">Artificial Additives (0-10)</Label>
              <Input
                id="additives"
                type="number"
                min="0"
                max="10"
                value={safetyData.additives}
                onChange={(e) => setSafetyData({...safetyData, additives: Number(e.target.value)})}
                className="sci-fi-input"
              />
              <p className="text-xs text-safebite-text-secondary mt-1">Higher number = more additives (worse)</p>
            </div>
            <div>
              <Label htmlFor="preservatives">Preservatives (0-10)</Label>
              <Input
                id="preservatives"
                type="number"
                min="0"
                max="10"
                value={safetyData.preservatives}
                onChange={(e) => setSafetyData({...safetyData, preservatives: Number(e.target.value)})}
                className="sci-fi-input"
              />
              <p className="text-xs text-safebite-text-secondary mt-1">Higher number = more preservatives (worse)</p>
            </div>
            <div>
              <Label htmlFor="natural">Natural Ingredients (0-10)</Label>
              <Input
                id="natural"
                type="number"
                min="0"
                max="10"
                value={safetyData.naturalIngredients}
                onChange={(e) => setSafetyData({...safetyData, naturalIngredients: Number(e.target.value)})}
                className="sci-fi-input"
              />
              <p className="text-xs text-safebite-text-secondary mt-1">Higher number = more natural ingredients (better)</p>
            </div>
            <div>
              <Label htmlFor="processing">Processing Level (0-10)</Label>
              <Input
                id="processing"
                type="number"
                min="0"
                max="10"
                value={safetyData.processingLevel}
                onChange={(e) => setSafetyData({...safetyData, processingLevel: Number(e.target.value)})}
                className="sci-fi-input"
              />
              <p className="text-xs text-safebite-text-secondary mt-1">Higher number = more processing (worse)</p>
            </div>
          </div>

          <Button
            onClick={calculateSafetyScore}
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Food Safety Score
          </Button>

          {safetyData.score > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-safebite-card-bg-alt">
              <div className="text-2xl font-bold text-center mb-2">
                Safety Score: <span className={`
                  ${safetyData.score < 4 ? 'text-red-500' :
                    safetyData.score < 7 ? 'text-yellow-500' : 'text-green-500'}
                `}>{safetyData.score}/10</span>
              </div>
              <div className="text-center text-safebite-text-secondary">
                {safetyData.score < 4 ? 'This food has safety concerns. Consider alternatives.' :
                 safetyData.score < 7 ? 'This food is moderately safe. Consume in moderation.' :
                 'This food has good safety ratings. A healthy choice.'}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-xs text-safebite-text-secondary mt-6 text-center">
        Created by Aditya Shenvi
      </div>
    </Card>
  );
};

export default HealthBox;

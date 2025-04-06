import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const MacroCalculator = () => {
  const [calories, setCalories] = useState<number>(2000);
  const [goal, setGoal] = useState<string>('maintain');
  const [carbs, setCarbs] = useState<number | null>(null);
  const [protein, setProtein] = useState<number | null>(null);
  const [fat, setFat] = useState<number | null>(null);

  const calculateMacros = () => {
    if (calories) {
      let proteinPercentage = 0.3; // 30%
      let fatPercentage = 0.3; // 30%
      let carbsPercentage = 0.4; // 40%
      
      // Adjust based on goal
      switch (goal) {
        case 'lose':
          proteinPercentage = 0.4; // 40%
          fatPercentage = 0.3; // 30%
          carbsPercentage = 0.3; // 30%
          break;
        case 'maintain':
          proteinPercentage = 0.3; // 30%
          fatPercentage = 0.3; // 30%
          carbsPercentage = 0.4; // 40%
          break;
        case 'gain':
          proteinPercentage = 0.25; // 25%
          fatPercentage = 0.25; // 25%
          carbsPercentage = 0.5; // 50%
          break;
      }
      
      // Calculate macros in grams
      // Protein: 4 calories per gram
      // Carbs: 4 calories per gram
      // Fat: 9 calories per gram
      const proteinCalories = calories * proteinPercentage;
      const fatCalories = calories * fatPercentage;
      const carbsCalories = calories * carbsPercentage;
      
      const proteinGrams = Math.round(proteinCalories / 4);
      const fatGrams = Math.round(fatCalories / 9);
      const carbsGrams = Math.round(carbsCalories / 4);
      
      setProtein(proteinGrams);
      setFat(fatGrams);
      setCarbs(carbsGrams);
      
      // Track this interaction for ML learning
      trackHealthBoxInteraction('macros', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <PieChart className="mr-2 h-5 w-5 text-safebite-teal" />
          Macro Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="calories" className="text-safebite-text-secondary">Daily Calories</Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="sci-fi-input"
            />
          </div>
          
          <div>
            <Label htmlFor="goal" className="text-safebite-text-secondary">Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
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
          
          <Button 
            onClick={calculateMacros} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Macros
          </Button>
          
          {carbs !== null && protein !== null && fat !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-safebite-text-secondary">Protein:</span>
                  <span className="text-safebite-text font-semibold">{protein}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-safebite-text-secondary">Carbs:</span>
                  <span className="text-safebite-text font-semibold">{carbs}g</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-safebite-text-secondary">Fat:</span>
                  <span className="text-safebite-text font-semibold">{fat}g</span>
                </div>
              </div>
              
              <div className="mt-3 h-4 bg-safebite-card-bg rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(protein * 4 / calories) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-blue-500" 
                    style={{ width: `${(carbs * 4 / calories) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(fat * 9 / calories) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1 text-safebite-text-secondary">
                <span>Protein</span>
                <span>Carbs</span>
                <span>Fat</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MacroCalculator;

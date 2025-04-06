import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const NutritionScoreCalculator = () => {
  const [protein, setProtein] = useState<number>(15);
  const [fiber, setFiber] = useState<number>(5);
  const [sugar, setSugar] = useState<number>(10);
  const [saturatedFat, setSaturatedFat] = useState<number>(3);
  const [sodium, setSodium] = useState<number>(400);
  const [score, setScore] = useState<number | null>(null);
  const [grade, setGrade] = useState<string>('');
  const [color, setColor] = useState<string>('');

  const calculateNutritionScore = () => {
    // Simplified Nutri-Score calculation
    let positivePoints = 0;
    let negativePoints = 0;
    
    // Positive components (protein and fiber)
    if (protein <= 1.6) positivePoints += 0;
    else if (protein <= 3.2) positivePoints += 1;
    else if (protein <= 4.8) positivePoints += 2;
    else if (protein <= 6.4) positivePoints += 3;
    else if (protein <= 8.0) positivePoints += 4;
    else positivePoints += 5;
    
    if (fiber <= 0.9) positivePoints += 0;
    else if (fiber <= 1.9) positivePoints += 1;
    else if (fiber <= 2.8) positivePoints += 2;
    else if (fiber <= 3.7) positivePoints += 3;
    else if (fiber <= 4.7) positivePoints += 4;
    else positivePoints += 5;
    
    // Negative components (sugar, saturated fat, sodium)
    if (sugar <= 4.5) negativePoints += 0;
    else if (sugar <= 9) negativePoints += 1;
    else if (sugar <= 13.5) negativePoints += 2;
    else if (sugar <= 18) negativePoints += 3;
    else if (sugar <= 22.5) negativePoints += 4;
    else negativePoints += 5;
    
    if (saturatedFat <= 1) negativePoints += 0;
    else if (saturatedFat <= 2) negativePoints += 1;
    else if (saturatedFat <= 3) negativePoints += 2;
    else if (saturatedFat <= 4) negativePoints += 3;
    else if (saturatedFat <= 5) negativePoints += 4;
    else negativePoints += 5;
    
    if (sodium <= 90) negativePoints += 0;
    else if (sodium <= 180) negativePoints += 1;
    else if (sodium <= 270) negativePoints += 2;
    else if (sodium <= 360) negativePoints += 3;
    else if (sodium <= 450) negativePoints += 4;
    else negativePoints += 5;
    
    // Calculate final score
    const finalScore = positivePoints - negativePoints;
    setScore(finalScore);
    
    // Determine grade and color
    if (finalScore >= 4) {
      setGrade('A');
      setColor('green');
    } else if (finalScore >= 2) {
      setGrade('B');
      setColor('light-green');
    } else if (finalScore >= 0) {
      setGrade('C');
      setColor('yellow');
    } else if (finalScore >= -2) {
      setGrade('D');
      setColor('orange');
    } else {
      setGrade('E');
      setColor('red');
    }
    
    // Track this interaction for ML learning
    trackHealthBoxInteraction('nutrition_score', 'calculate');
  };

  const getColorClass = () => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'light-green': return 'bg-green-400';
      case 'yellow': return 'bg-yellow-400';
      case 'orange': return 'bg-orange-400';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Utensils className="mr-2 h-5 w-5 text-safebite-teal" />
          Nutrition Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="protein" className="text-safebite-text-secondary">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="fiber" className="text-safebite-text-secondary">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sugar" className="text-safebite-text-secondary">Sugar (g)</Label>
              <Input
                id="sugar"
                type="number"
                value={sugar}
                onChange={(e) => setSugar(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="saturatedFat" className="text-safebite-text-secondary">Sat. Fat (g)</Label>
              <Input
                id="saturatedFat"
                type="number"
                value={saturatedFat}
                onChange={(e) => setSaturatedFat(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="sodium" className="text-safebite-text-secondary">Sodium (mg)</Label>
              <Input
                id="sodium"
                type="number"
                value={sodium}
                onChange={(e) => setSodium(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
          </div>
          
          <Button 
            onClick={calculateNutritionScore} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Score
          </Button>
          
          {score !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center">
                <span className="text-safebite-text-secondary">Nutrition Score:</span>
                <div className={`w-10 h-10 rounded-full ${getColorClass()} flex items-center justify-center text-white font-bold`}>
                  {grade}
                </div>
              </div>
              <div className="mt-2 text-xs text-safebite-text-secondary">
                <p>A = Excellent nutritional quality</p>
                <p>E = Poor nutritional quality</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionScoreCalculator;

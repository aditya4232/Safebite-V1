import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scale, Save, Download, Share2, Info } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

interface BMICalculatorProps {
  onSaveResults?: (toolId: string, toolName: string, data: any) => void;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ onSaveResults }) => {
  const [height, setHeight] = useState<number>(170);
  const [weight, setWeight] = useState<number>(70);
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmiValue = weight / (heightInMeters * heightInMeters);
      const roundedBMI = Math.round(bmiValue * 10) / 10;

      let bmiCategory = '';
      if (bmiValue < 18.5) bmiCategory = 'Underweight';
      else if (bmiValue >= 18.5 && bmiValue < 25) bmiCategory = 'Normal weight';
      else if (bmiValue >= 25 && bmiValue < 30) bmiCategory = 'Overweight';
      else bmiCategory = 'Obesity';

      setBmi(roundedBMI);
      setCategory(bmiCategory);

      // Track this interaction for ML learning
      trackHealthBoxInteraction('bmi', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Scale className="mr-2 h-5 w-5 text-safebite-teal" />
          BMI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          <Button
            onClick={calculateBMI}
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate BMI
          </Button>

          {bmi !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center">
                <span className="text-safebite-text-secondary">Your BMI:</span>
                <span className="text-safebite-text font-semibold">{bmi}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-safebite-text-secondary">Category:</span>
                <span className="text-safebite-teal font-semibold">{category}</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Badge className={`
                  ${category === 'Underweight' ? 'bg-blue-500' : ''}
                  ${category === 'Normal weight' ? 'bg-green-500' : ''}
                  ${category === 'Overweight' ? 'bg-orange-500' : ''}
                  ${category === 'Obesity' ? 'bg-red-500' : ''}
                  text-white
                `}>
                  {category}
                </Badge>

                {onSaveResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSaveResults('bmi-calculator', 'BMI Calculator', {
                      bmi,
                      category,
                      height,
                      weight,
                      date: new Date().toISOString()
                    })}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save to Dashboard
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BMICalculator;

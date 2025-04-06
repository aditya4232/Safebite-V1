import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Percent } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const BodyFatCalculator = () => {
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>('male');
  const [waist, setWaist] = useState<number>(80);
  const [neck, setNeck] = useState<number>(36);
  const [hip, setHip] = useState<number>(90);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  const calculateBodyFat = () => {
    if (weight && height && age && waist && neck) {
      let bodyFatPercentage = 0;
      
      // U.S. Navy Method
      if (gender === 'male') {
        bodyFatPercentage = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
        if (!hip) return; // Hip measurement required for females
        bodyFatPercentage = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
      }
      
      // Round to 1 decimal place
      const roundedBodyFat = Math.round(bodyFatPercentage * 10) / 10;
      setBodyFat(roundedBodyFat);
      
      // Determine category
      if (gender === 'male') {
        if (roundedBodyFat < 6) setCategory('Essential Fat');
        else if (roundedBodyFat < 14) setCategory('Athletic');
        else if (roundedBodyFat < 18) setCategory('Fitness');
        else if (roundedBodyFat < 25) setCategory('Average');
        else setCategory('Obese');
      } else {
        if (roundedBodyFat < 14) setCategory('Essential Fat');
        else if (roundedBodyFat < 21) setCategory('Athletic');
        else if (roundedBodyFat < 25) setCategory('Fitness');
        else if (roundedBodyFat < 32) setCategory('Average');
        else setCategory('Obese');
      }
      
      // Track this interaction for ML learning
      trackHealthBoxInteraction('body_fat', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Percent className="mr-2 h-5 w-5 text-safebite-teal" />
          Body Fat Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="neck" className="text-safebite-text-secondary">Neck (cm)</Label>
              <Input
                id="neck"
                type="number"
                value={neck}
                onChange={(e) => setNeck(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
            <div>
              <Label htmlFor="waist" className="text-safebite-text-secondary">Waist (cm)</Label>
              <Input
                id="waist"
                type="number"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
                className="sci-fi-input"
              />
            </div>
            {gender === 'female' && (
              <div>
                <Label htmlFor="hip" className="text-safebite-text-secondary">Hip (cm)</Label>
                <Input
                  id="hip"
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(Number(e.target.value))}
                  className="sci-fi-input"
                />
              </div>
            )}
          </div>
          
          <Button 
            onClick={calculateBodyFat} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Body Fat
          </Button>
          
          {bodyFat !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center">
                <span className="text-safebite-text-secondary">Body Fat Percentage:</span>
                <span className="text-safebite-text font-semibold">{bodyFat}%</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-safebite-text-secondary">Category:</span>
                <span className="text-safebite-teal font-semibold">{category}</span>
              </div>
              <div className="mt-2 text-xs text-safebite-text-secondary">
                <p>Based on U.S. Navy Method</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BodyFatCalculator;

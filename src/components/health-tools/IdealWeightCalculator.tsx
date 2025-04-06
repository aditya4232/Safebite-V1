import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale } from 'lucide-react';
import { trackHealthBoxInteraction } from '@/services/mlService';

const IdealWeightCalculator = () => {
  const [height, setHeight] = useState<number>(170);
  const [gender, setGender] = useState<string>('male');
  const [bodyFrame, setBodyFrame] = useState<string>('medium');
  const [idealWeight, setIdealWeight] = useState<number | null>(null);
  const [weightRange, setWeightRange] = useState<{min: number, max: number} | null>(null);

  const calculateIdealWeight = () => {
    if (height) {
      // Different formulas for ideal weight calculation
      
      // 1. Devine formula (most common)
      let devineWeight = 0;
      if (gender === 'male') {
        devineWeight = 50 + 2.3 * ((height - 152.4) / 2.54);
      } else {
        devineWeight = 45.5 + 2.3 * ((height - 152.4) / 2.54);
      }
      
      // 2. Hamwi formula
      let hamwiWeight = 0;
      if (gender === 'male') {
        hamwiWeight = 48 + 2.7 * ((height - 152.4) / 2.54);
      } else {
        hamwiWeight = 45.5 + 2.2 * ((height - 152.4) / 2.54);
      }
      
      // 3. Miller formula
      let millerWeight = 0;
      if (gender === 'male') {
        millerWeight = 56.2 + 1.41 * ((height - 152.4) / 2.54);
      } else {
        millerWeight = 53.1 + 1.36 * ((height - 152.4) / 2.54);
      }
      
      // Average the formulas
      const averageWeight = Math.round((devineWeight + hamwiWeight + millerWeight) / 3);
      
      // Adjust for body frame
      let frameAdjustment = 1.0;
      switch (bodyFrame) {
        case 'small':
          frameAdjustment = 0.9;
          break;
        case 'medium':
          frameAdjustment = 1.0;
          break;
        case 'large':
          frameAdjustment = 1.1;
          break;
      }
      
      const adjustedWeight = Math.round(averageWeight * frameAdjustment);
      setIdealWeight(adjustedWeight);
      
      // Calculate weight range (±10%)
      const minWeight = Math.round(adjustedWeight * 0.9);
      const maxWeight = Math.round(adjustedWeight * 1.1);
      setWeightRange({ min: minWeight, max: maxWeight });
      
      // Track this interaction for ML learning
      trackHealthBoxInteraction('ideal_weight', 'calculate');
    }
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="flex items-center text-safebite-text">
          <Scale className="mr-2 h-5 w-5 text-safebite-teal" />
          Ideal Weight Calculator
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
              <Label htmlFor="bodyFrame" className="text-safebite-text-secondary">Body Frame</Label>
              <Select value={bodyFrame} onValueChange={setBodyFrame}>
                <SelectTrigger className="sci-fi-input">
                  <SelectValue placeholder="Select body frame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={calculateIdealWeight} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Calculate Ideal Weight
          </Button>
          
          {idealWeight !== null && weightRange !== null && (
            <div className="mt-4 p-3 rounded-md bg-safebite-card-bg-alt">
              <div className="flex justify-between items-center">
                <span className="text-safebite-text-secondary">Ideal Weight:</span>
                <span className="text-safebite-text font-semibold">{idealWeight} kg</span>
              </div>
              <div className="mt-2 text-xs text-safebite-text-secondary">
                <p>Healthy weight range: {weightRange.min} - {weightRange.max} kg</p>
                <p className="mt-1">Based on multiple medical formulas and adjusted for your body frame.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IdealWeightCalculator;

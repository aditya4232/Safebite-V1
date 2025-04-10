import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { trackHealthBoxInteraction } from '@/services/mlService';
import userActivityService from '@/services/userActivityService';

const BloodPressureAnalyzer = () => {
  const [systolic, setSystolic] = useState<number | ''>('');
  const [diastolic, setDiastolic] = useState<number | ''>('');
  const [result, setResult] = useState<{
    category: string;
    color: string;
    icon: React.ReactNode;
    description: string;
  } | null>(null);

  const analyzeBP = () => {
    if (systolic === '' || diastolic === '') {
      return;
    }

    let category = '';
    let color = '';
    let icon = null;
    let description = '';

    // Blood pressure categories based on American Heart Association
    if (systolic < 120 && diastolic < 80) {
      category = 'Normal';
      color = 'text-green-500';
      icon = <CheckCircle className="h-5 w-5 text-green-500" />;
      description = 'Your blood pressure is considered normal. Maintain a healthy lifestyle to keep it this way.';
    } else if ((systolic >= 120 && systolic <= 129) && diastolic < 80) {
      category = 'Elevated';
      color = 'text-yellow-500';
      icon = <Info className="h-5 w-5 text-yellow-500" />;
      description = 'Your blood pressure is slightly elevated. Consider lifestyle changes to prevent it from rising further.';
    } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
      category = 'Hypertension Stage 1';
      color = 'text-orange-500';
      icon = <AlertTriangle className="h-5 w-5 text-orange-500" />;
      description = 'You have Stage 1 hypertension. Lifestyle changes and possibly medication may be needed.';
    } else if (systolic >= 140 || diastolic >= 90) {
      category = 'Hypertension Stage 2';
      color = 'text-red-500';
      icon = <AlertTriangle className="h-5 w-5 text-red-500" />;
      description = 'You have Stage 2 hypertension. Consult with a healthcare provider for treatment options.';
    } else if (systolic > 180 || diastolic > 120) {
      category = 'Hypertensive Crisis';
      color = 'text-red-700';
      icon = <AlertTriangle className="h-5 w-5 text-red-700" />;
      description = 'Hypertensive crisis! Seek emergency medical attention immediately.';
    }

    setResult({ category, color, icon, description });

    // Track this interaction for ML learning
    trackHealthBoxInteraction('blood-pressure', 'analyze');
    userActivityService.trackActivity('health-tool', 'blood-pressure-analyze', {
      systolic,
      diastolic,
      result: category
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="systolic" className="text-safebite-text">Systolic (mmHg)</Label>
          <Input
            id="systolic"
            type="number"
            placeholder="120"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
          />
        </div>
        <div>
          <Label htmlFor="diastolic" className="text-safebite-text">Diastolic (mmHg)</Label>
          <Input
            id="diastolic"
            type="number"
            placeholder="80"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value === '' ? '' : Number(e.target.value))}
            className="bg-safebite-card-bg-alt border-safebite-card-bg-alt"
          />
        </div>
      </div>

      <Button
        onClick={analyzeBP}
        className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
        disabled={systolic === '' || diastolic === ''}
      >
        <Heart className="mr-2 h-4 w-4" />
        Analyze Blood Pressure
      </Button>

      {result && (
        <Card className="mt-4 border-t-4" style={{ borderTopColor: result.color.replace('text-', '') }}>
          <CardContent className="pt-6">
            <div className="flex items-center mb-2">
              {result.icon}
              <span className={`ml-2 font-semibold ${result.color}`}>{result.category}</span>
            </div>
            <p className="text-safebite-text-secondary text-sm">{result.description}</p>
            <div className="mt-4 text-xs text-safebite-text-secondary">
              <p>Note: This tool provides general information and is not a substitute for professional medical advice.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BloodPressureAnalyzer;

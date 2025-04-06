import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Brain, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

const StressAnalyzer = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    score: number;
    level: string;
    color: string;
    icon: React.ReactNode;
    description: string;
    recommendations: string[];
  } | null>(null);

  const questions = [
    {
      id: 'q1',
      text: 'How often have you felt that you were unable to control the important things in your life?',
    },
    {
      id: 'q2',
      text: 'How often have you felt nervous and stressed?',
    },
    {
      id: 'q3',
      text: 'How often have you found that you could not cope with all the things that you had to do?',
    },
    {
      id: 'q4',
      text: 'How often have you felt difficulties were piling up so high that you could not overcome them?',
    },
    {
      id: 'q5',
      text: 'How often have you had trouble sleeping because of stress?',
    },
  ];

  const options = [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Almost Never' },
    { value: 2, label: 'Sometimes' },
    { value: 3, label: 'Fairly Often' },
    { value: 4, label: 'Very Often' },
  ];

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const analyzeStress = () => {
    // Calculate total score
    const totalScore = Object.values(answers).reduce((sum, value) => sum + value, 0);
    const maxPossibleScore = questions.length * 4; // 4 is the max value per question
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

    let level = '';
    let color = '';
    let icon = null;
    let description = '';
    let recommendations: string[] = [];

    // Determine stress level based on score
    if (normalizedScore < 25) {
      level = 'Low Stress';
      color = 'text-green-500';
      icon = <CheckCircle className="h-5 w-5 text-green-500" />;
      description = 'Your stress levels appear to be low. This is a good sign that you\'re managing life\'s challenges well.';
      recommendations = [
        'Continue your current stress management practices',
        'Regular exercise and healthy eating',
        'Maintain social connections',
        'Practice mindfulness occasionally'
      ];
    } else if (normalizedScore < 50) {
      level = 'Moderate Stress';
      color = 'text-yellow-500';
      icon = <Info className="h-5 w-5 text-yellow-500" />;
      description = 'You\'re experiencing moderate stress. While this is common, finding ways to reduce stress can improve your wellbeing.';
      recommendations = [
        'Incorporate regular relaxation techniques',
        'Ensure adequate sleep (7-8 hours)',
        'Consider time management strategies',
        'Limit caffeine and alcohol'
      ];
    } else if (normalizedScore < 75) {
      level = 'High Stress';
      color = 'text-orange-500';
      icon = <AlertTriangle className="h-5 w-5 text-orange-500" />;
      description = 'Your stress levels are high. This may be affecting your physical and mental health.';
      recommendations = [
        'Practice daily stress reduction techniques (meditation, deep breathing)',
        'Consider talking to a friend, family member, or counselor',
        'Prioritize self-care activities',
        'Evaluate work-life balance',
        'Regular physical activity'
      ];
    } else {
      level = 'Severe Stress';
      color = 'text-red-500';
      icon = <AlertTriangle className="h-5 w-5 text-red-500" />;
      description = 'You\'re experiencing severe stress. This level of stress can significantly impact your health and wellbeing.';
      recommendations = [
        'Consider speaking with a healthcare professional',
        'Implement daily stress management practices',
        'Evaluate major stressors in your life',
        'Ensure adequate rest and nutrition',
        'Seek support from friends, family, or support groups',
        'Consider temporarily reducing commitments if possible'
      ];
    }

    setResult({
      score: normalizedScore,
      level,
      color,
      icon,
      description,
      recommendations
    });
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-4">
      {!result ? (
        <>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <Label className="text-safebite-text">
                  {index + 1}. {question.text}
                </Label>
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                  value={answers[question.id]?.toString()}
                  className="flex flex-wrap gap-2"
                >
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.value.toString()}
                        id={`${question.id}-${option.value}`}
                        className="text-safebite-teal"
                      />
                      <Label
                        htmlFor={`${question.id}-${option.value}`}
                        className="text-sm text-safebite-text-secondary cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <Button 
            onClick={analyzeStress} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            disabled={!isComplete}
          >
            <Brain className="mr-2 h-4 w-4" />
            Analyze Stress Level
          </Button>

          {!isComplete && (
            <p className="text-xs text-safebite-text-secondary text-center">
              Please answer all questions to analyze your stress level.
            </p>
          )}
        </>
      ) : (
        <Card className="mt-4 border-t-4" style={{ borderTopColor: result.color.replace('text-', '') }}>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              {result.icon}
              <span className={`ml-2 font-semibold ${result.color}`}>{result.level}</span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-safebite-text-secondary mb-1">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Severe</span>
              </div>
              <Progress value={result.score} className="h-2 bg-safebite-card-bg-alt" />
              <div className="text-right text-xs text-safebite-text-secondary mt-1">
                Score: {result.score}/100
              </div>
            </div>

            <p className="text-safebite-text-secondary text-sm mb-4">{result.description}</p>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-safebite-text mb-2">Recommendations:</h4>
              <ul className="text-sm text-safebite-text-secondary space-y-1">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 text-xs text-safebite-text-secondary">
              <p>Note: This tool provides general information and is not a substitute for professional medical advice.</p>
            </div>

            <Button 
              onClick={() => setResult(null)} 
              className="w-full mt-4 bg-safebite-card-bg-alt text-safebite-text hover:bg-safebite-card-bg"
            >
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StressAnalyzer;

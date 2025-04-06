import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Microscope, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DiseaseRiskAssessment = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('heart');
  const [results, setResults] = useState<Record<string, {
    risk: 'low' | 'moderate' | 'high';
    score: number;
    factors: string[];
    recommendations: string[];
  }> | null>(null);

  // Risk assessment questions by disease category
  const assessments = {
    heart: {
      title: 'Heart Disease',
      questions: [
        {
          id: 'heart_family',
          text: 'Do you have a family history of heart disease?',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'distant', label: 'Yes, distant relatives', score: 1 },
            { value: 'immediate', label: 'Yes, immediate family', score: 2 },
          ]
        },
        {
          id: 'heart_smoking',
          text: 'Do you smoke?',
          options: [
            { value: 'never', label: 'Never', score: 0 },
            { value: 'former', label: 'Former smoker', score: 1 },
            { value: 'current', label: 'Current smoker', score: 2 },
          ]
        },
        {
          id: 'heart_exercise',
          text: 'How often do you exercise?',
          options: [
            { value: 'regular', label: 'Regularly (3+ times/week)', score: 0 },
            { value: 'occasional', label: 'Occasionally (1-2 times/week)', score: 1 },
            { value: 'rarely', label: 'Rarely or never', score: 2 },
          ]
        },
        {
          id: 'heart_diet',
          text: 'How would you describe your diet?',
          options: [
            { value: 'healthy', label: 'Healthy (low in saturated fat, high in fruits/vegetables)', score: 0 },
            { value: 'moderate', label: 'Moderate (some processed foods)', score: 1 },
            { value: 'unhealthy', label: 'Unhealthy (high in processed foods, saturated fat)', score: 2 },
          ]
        },
        {
          id: 'heart_pressure',
          text: 'Do you have high blood pressure?',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'borderline', label: 'Borderline', score: 1 },
            { value: 'yes', label: 'Yes', score: 2 },
          ]
        }
      ]
    },
    diabetes: {
      title: 'Type 2 Diabetes',
      questions: [
        {
          id: 'diabetes_family',
          text: 'Do you have a family history of diabetes?',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'distant', label: 'Yes, distant relatives', score: 1 },
            { value: 'immediate', label: 'Yes, immediate family', score: 2 },
          ]
        },
        {
          id: 'diabetes_weight',
          text: 'Are you overweight or obese?',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'overweight', label: 'Overweight', score: 1 },
            { value: 'obese', label: 'Obese', score: 2 },
          ]
        },
        {
          id: 'diabetes_activity',
          text: 'How physically active are you?',
          options: [
            { value: 'very', label: 'Very active', score: 0 },
            { value: 'moderate', label: 'Moderately active', score: 1 },
            { value: 'sedentary', label: 'Sedentary', score: 2 },
          ]
        },
        {
          id: 'diabetes_diet',
          text: 'How often do you consume sugary foods/drinks?',
          options: [
            { value: 'rarely', label: 'Rarely', score: 0 },
            { value: 'sometimes', label: 'Sometimes', score: 1 },
            { value: 'frequently', label: 'Frequently', score: 2 },
          ]
        },
        {
          id: 'diabetes_age',
          text: 'Are you over 45 years old?',
          options: [
            { value: 'no', label: 'No', score: 0 },
            { value: 'yes', label: 'Yes', score: 2 },
          ]
        }
      ]
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateRisk = () => {
    const results: Record<string, any> = {};

    // Calculate risk for each disease category
    Object.entries(assessments).forEach(([disease, assessment]) => {
      let score = 0;
      const answeredQuestions = assessment.questions.filter(q => answers[q.id]);
      
      if (answeredQuestions.length === 0) return;

      // Calculate score
      answeredQuestions.forEach(question => {
        const answer = answers[question.id];
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          score += option.score;
        }
      });

      // Normalize score to 0-100
      const maxPossibleScore = assessment.questions.length * 2; // 2 is max score per question
      const normalizedScore = Math.round((score / maxPossibleScore) * 100);

      // Determine risk level
      let risk: 'low' | 'moderate' | 'high';
      if (normalizedScore < 30) {
        risk = 'low';
      } else if (normalizedScore < 70) {
        risk = 'moderate';
      } else {
        risk = 'high';
      }

      // Generate risk factors based on high-scoring answers
      const factors: string[] = [];
      assessment.questions.forEach(question => {
        const answer = answers[question.id];
        const option = question.options.find(opt => opt.value === answer);
        if (option && option.score > 0) {
          factors.push(question.text);
        }
      });

      // Generate recommendations
      const recommendations = generateRecommendations(disease, risk, factors);

      results[disease] = {
        risk,
        score: normalizedScore,
        factors,
        recommendations
      };
    });

    setResults(results);
  };

  // Generate recommendations based on disease and risk level
  const generateRecommendations = (disease: string, risk: string, factors: string[]): string[] => {
    const baseRecommendations = [
      'Maintain a balanced diet rich in fruits, vegetables, and whole grains',
      'Exercise regularly (aim for at least 150 minutes per week)',
      'Avoid smoking and limit alcohol consumption',
      'Get regular health check-ups'
    ];

    const diseaseSpecificRecommendations: Record<string, string[]> = {
      heart: [
        'Monitor your blood pressure regularly',
        'Limit saturated and trans fats in your diet',
        'Manage stress through relaxation techniques',
        'Consider discussing heart health with your doctor'
      ],
      diabetes: [
        'Limit sugar and refined carbohydrate intake',
        'Maintain a healthy weight',
        'Monitor your blood glucose levels',
        'Stay hydrated and get adequate sleep'
      ]
    };

    // Combine recommendations based on risk level
    if (risk === 'low') {
      return [...baseRecommendations.slice(0, 2), ...(diseaseSpecificRecommendations[disease]?.slice(0, 1) || [])];
    } else if (risk === 'moderate') {
      return [...baseRecommendations, ...(diseaseSpecificRecommendations[disease]?.slice(0, 2) || [])];
    } else {
      return [...baseRecommendations, ...(diseaseSpecificRecommendations[disease] || [])];
    }
  };

  const isComplete = (disease: string) => {
    return assessments[disease as keyof typeof assessments].questions.every(q => answers[q.id]);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-safebite-text';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'moderate': return <Info className="h-5 w-5 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {!results ? (
        <>
          <Tabs defaultValue="heart" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="heart">Heart Disease</TabsTrigger>
              <TabsTrigger value="diabetes">Type 2 Diabetes</TabsTrigger>
            </TabsList>

            {Object.entries(assessments).map(([disease, assessment]) => (
              <TabsContent key={disease} value={disease} className="space-y-4">
                <div className="space-y-4">
                  {assessment.questions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label className="text-safebite-text">{question.text}</Label>
                      <RadioGroup
                        onValueChange={(value) => handleAnswerChange(question.id, value)}
                        value={answers[question.id]}
                        className="flex flex-col space-y-1"
                      >
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={option.value}
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
              </TabsContent>
            ))}
          </Tabs>

          <Button 
            onClick={calculateRisk} 
            className="w-full bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            disabled={!isComplete(activeTab)}
          >
            <Microscope className="mr-2 h-4 w-4" />
            Calculate Risk Assessment
          </Button>

          {!isComplete(activeTab) && (
            <p className="text-xs text-safebite-text-secondary text-center">
              Please answer all questions to calculate your risk assessment.
            </p>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <Tabs defaultValue="heart" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="heart">Heart Disease</TabsTrigger>
              <TabsTrigger value="diabetes">Type 2 Diabetes</TabsTrigger>
            </TabsList>

            {Object.entries(results).map(([disease, result]) => (
              <TabsContent key={disease} value={disease}>
                <Card className={`border-t-4 border-t-${result.risk === 'low' ? 'green' : result.risk === 'moderate' ? 'yellow' : 'red'}-500`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {getRiskIcon(result.risk)}
                      <span className={`ml-2 font-semibold ${getRiskColor(result.risk)}`}>
                        {result.risk.charAt(0).toUpperCase() + result.risk.slice(1)} Risk
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-safebite-text-secondary mb-1">
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>High</span>
                      </div>
                      <Progress value={result.score} className="h-2 bg-safebite-card-bg-alt" />
                      <div className="text-right text-xs text-safebite-text-secondary mt-1">
                        Score: {result.score}/100
                      </div>
                    </div>

                    {result.factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-safebite-text mb-2">Risk Factors:</h4>
                        <ul className="text-sm text-safebite-text-secondary space-y-1">
                          {result.factors.map((factor, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 text-xs text-safebite-text-secondary">
            <p>Note: This tool provides a general risk assessment based on common risk factors. It is not a diagnostic tool and should not replace professional medical advice.</p>
          </div>

          <Button 
            onClick={() => setResults(null)} 
            className="w-full mt-4 bg-safebite-card-bg-alt text-safebite-text hover:bg-safebite-card-bg"
          >
            Retake Assessment
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiseaseRiskAssessment;

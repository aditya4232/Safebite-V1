
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import QuestionnaireStep from '@/components/QuestionnaireStep';
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: 'radio' | 'text' | 'slider';
  question: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

const questions: Question[] = [
  {
    id: 'gender',
    type: 'radio',
    question: 'What is your gender?',
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
  },
  {
    id: 'age',
    type: 'slider',
    question: 'How old are you?',
    min: 18,
    max: 80,
    step: 1
  },
  {
    id: 'weight',
    type: 'slider',
    question: 'What is your weight in kg?',
    min: 40,
    max: 150,
    step: 1
  },
  {
    id: 'height',
    type: 'slider',
    question: 'What is your height in cm?',
    min: 140,
    max: 220,
    step: 1
  },
  {
    id: 'activity',
    type: 'radio',
    question: 'How would you describe your activity level?',
    options: [
      'Sedentary (little or no exercise)',
      'Lightly active (light exercise 1-3 days/week)',
      'Moderately active (moderate exercise 3-5 days/week)',
      'Very active (hard exercise 6-7 days/week)',
      'Super active (very hard exercise & physical job or training twice a day)'
    ]
  },
  {
    id: 'diet_type',
    type: 'radio',
    question: 'Which diet do you follow?',
    options: [
      'Omnivore (eat everything)',
      'Vegetarian',
      'Vegan',
      'Pescatarian',
      'Keto',
      'Paleo',
      'Other'
    ]
  },
  {
    id: 'goal',
    type: 'radio',
    question: 'What is your primary health goal?',
    options: [
      'Lose weight',
      'Gain muscle',
      'Maintain weight',
      'Improve overall health',
      'Increase energy levels',
      'Manage a health condition'
    ]
  },
  {
    id: 'allergies',
    type: 'text',
    question: 'Do you have any food allergies or intolerances? (If none, type "None")'
  },
  {
    id: 'water_intake',
    type: 'slider',
    question: 'How many glasses of water do you typically drink per day?',
    min: 0,
    max: 15,
    step: 1
  },
  {
    id: 'cooking',
    type: 'radio',
    question: 'How often do you cook meals at home?',
    options: [
      'Almost never',
      '1-2 times per week',
      '3-4 times per week',
      '5-6 times per week',
      'Every day'
    ]
  }
];

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    gender: 'Male',
    age: 30,
    weight: 70,
    height: 170,
    activity: '',
    diet_type: '',
    goal: '',
    allergies: '',
    water_intake: 8,
    cooking: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep === questions.length - 1) {
      // Submit the questionnaire
      console.log('Questionnaire completed:', answers);
      toast({
        title: "Questionnaire completed",
        description: "Thank you for sharing your information. Your dashboard is ready!",
      });
      navigate('/dashboard');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-safebite-dark-blue flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Let's Get to Know You</h1>
            <p className="text-safebite-text-secondary">
              Help us personalize your SafeBite experience by answering a few questions
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-safebite-text-secondary text-sm">Question {currentStep + 1}/{questions.length}</span>
              <span className="text-safebite-teal text-sm">{Math.floor(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-safebite-card-bg-alt" />
          </div>

          <QuestionnaireStep
            question={questions[currentStep]}
            value={answers[questions[currentStep].id]}
            onChange={handleAnswer}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={currentStep === 0}
            isLast={currentStep === questions.length - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;

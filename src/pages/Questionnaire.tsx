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
    id: 'age',
    type: 'radio',
    question: 'What is your age?',
    options: ['18-25', '26-35', '36-45', '46-55', '55+']
  },
  {
    id: 'gender',
    type: 'radio',
    question: 'What is your gender?',
    options: ['Male', 'Female', 'Other']
  },
  {
    id: 'height_weight',
    type: 'text',
    question: 'What is your height and weight? (e.g., 170cm, 70kg)'
  },
  {
    id: 'activity_level',
    type: 'radio',
    question: 'What is your activity level?',
    options: ['Sedentary', 'Lightly Active', 'Active', 'Very Active']
  },
  {
    id: 'health_conditions',
    type: 'radio',
    question: 'Do you have any known health conditions?',
    options: ['Diabetes', 'Hypertension', 'Heart Issues', 'None']
  },
  {
    id: 'dietary_preferences',
    type: 'radio',
    question: 'Do you have any dietary preferences?',
    options: ['Veg', 'Vegan', 'Non-Veg', 'Keto', 'Gluten-Free', 'Other']
  },
  {
    id: 'food_allergies',
    type: 'text',
    question: 'Do you have any food allergies? (Check common allergens or manually input)'
  },
  {
    id: 'meals_per_day',
    type: 'radio',
    question: 'How many meals do you eat per day?',
    options: ['2', '3', '4', '5+']
  },
  {
    id: 'water_intake',
    type: 'radio',
    question: 'How much water do you drink daily?',
    options: ['<1L', '1-2L', '2-3L', '3L+']
  },
  {
    id: 'outside_food',
    type: 'radio',
    question: 'How often do you eat outside or order food?',
    options: ['Rarely', 'Weekly', 'Daily']
  },
  {
    id: 'homemade_processed',
    type: 'radio',
    question: 'Do you prefer homemade or processed foods?',
    options: ['Homemade', 'Processed', 'Mixed']
  },
  {
    id: 'packaged_food',
    type: 'radio',
    question: 'How often do you eat packaged food?',
    options: ['Rarely', 'Weekly', 'Daily']
  },
  {
    id: 'food_priorities',
    type: 'radio',
    question: 'What do you prioritize while choosing food?',
    options: ['Taste', 'Health', 'Price', 'Convenience']
  },
  {
    id: 'sugary_drinks',
    type: 'radio',
    question: 'Do you consume sugary drinks often?',
    options: ['Yes', 'No', 'Occasionally']
  },
  {
    id: 'protein_source',
    type: 'radio',
    question: 'What’s your usual protein source?',
    options: ['Veg', 'Dairy', 'Meat', 'Eggs', 'Mix']
  },
  {
    id: 'calorie_tracking',
    type: 'radio',
    question: 'Do you track your calorie intake?',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'health_goals',
    type: 'radio',
    question: 'What are your health goals?',
    options: ['Weight Loss', 'Muscle Gain', 'General Health', 'No Goal']
  },
  {
    id: 'exercise_frequency',
    type: 'radio',
    question: 'How often do you exercise?',
    options: ['Never', 'Weekly', '3-4 Times a Week', 'Daily']
  },
  {
    id: 'diet_recommendations',
    type: 'radio',
    question: 'Are you looking for diet & meal plan recommendations?',
    options: ['Yes', 'No']
  },
  {
    id: 'reminders',
    type: 'radio',
    question: 'Would you like reminders for healthy habits?',
    options: ['Yes', 'No']
  },
  {
    id: 'food_safety_alerts',
    type: 'radio',
    question: 'Would you like food safety alerts for the products you buy?',
    options: ['Yes', 'No']
  }
];

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentStep === questions.length - 1) {
      // Submit the questionnaire
      console.log('Questionnaire completed:', answers);
      // Store answers in local storage
      localStorage.setItem('userAnswers', JSON.stringify(answers));
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

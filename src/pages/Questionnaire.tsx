import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import QuestionnaireStep from '@/components/QuestionnaireStep';
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { app } from "../main"; // Corrected import path
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { AlertCircle } from 'lucide-react';
import Loader from '@/components/Loader'; // Import Loader

interface Question {
  id: string;
  type: 'radio' | 'text' | 'slider';
  question: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

// Updated questions based on user feedback
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    // Initialize answers with default values
    const defaultAnswers: Record<string, any> = {};
    questions.forEach(q => {
      if (q.type === 'radio') {
        defaultAnswers[q.id] = undefined; // Initialize radio buttons with undefined
      } else if (q.type === 'text') {
        defaultAnswers[q.id] = '';
      } else {
        defaultAnswers[q.id] = null;
      }
    });
    setAnswers(defaultAnswers);
  }, []);

  const handleAnswer = (id: string, value: any) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
    setError(''); // Clear error when user provides an answer
  };

  // Validation function for height and weight
  const validateHeightWeight = (value: string): boolean => {
    if (!value) return false; // Ensure value exists
    return /^\d+(\.\d+)?cm, ?\d+(\.\d+)?kg$/.test(value.trim());
  };

  const handleNext = async () => {
    setError(''); // Clear previous errors
    const currentQuestion = questions[currentStep];
    const currentAnswer = answers[currentQuestion.id];

    // Check if the current question is answered
    if (currentAnswer === undefined || currentAnswer === '') {
      setError('Please answer this question before proceeding.');
      toast({
        title: "Missing Answer",
        description: "Please answer the current question.",
        variant: "destructive",
      });
      return;
    }

    // Validate height and weight format if it's the current question
    if (currentQuestion.id === 'height_weight' && !validateHeightWeight(currentAnswer)) {
      setError('Please enter height and weight in the correct format (e.g., 170cm, 70kg)');
      toast({
        title: "Invalid Format",
        description: "Please enter height and weight in the format '170cm, 70kg'.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true); // Set loading state

    if (currentStep === questions.length - 1) {
      // Submit the questionnaire to Firestore
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, "users", uid);
        try {
          await setDoc(userRef, {
            profile: answers,
            questionnaireCompleted: true, // Flag to prevent asking again
            lastWeeklyPrompt: null // Initialize weekly prompt timestamp
          }, { merge: true }); // Use merge: true to update existing doc or create new
          toast({
            title: "Questionnaire completed!",
            description: "Your profile is set up. Welcome to your dashboard!",
          });
          navigate('/dashboard');
        } catch (error: any) {
          toast({
            title: "Error saving profile",
            description: error.message,
            variant: "destructive",
          });
          console.error("Error writing user profile to Firestore: ", error);
          setError("Failed to save your profile. Please try again.");
        } finally {
          setIsLoading(false); // Reset loading state
        }
      } else {
        // Handle case where user is somehow not logged in
        toast({
          title: "Authentication Error",
          description: "You are not logged in. Please log in and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        navigate('/auth/login');
      }
    } else {
      setCurrentStep(prev => prev + 1);
      setIsLoading(false); // Reset loading state for the next step
    }
  };

  const handleBack = () => {
    setError(''); // Clear error on going back
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
              {isLoading ? "Saving your profile..." : "Help us personalize your SafeBite experience."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-safebite-text-secondary text-sm">Question {currentStep + 1}/{questions.length}</span>
                  <span className="text-safebite-teal text-sm">{Math.floor(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2 bg-safebite-card-bg-alt" />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md flex items-center text-red-300">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <QuestionnaireStep
                question={questions[currentStep]}
                value={answers[questions[currentStep].id]}
                onChange={handleAnswer}
                onNext={handleNext}
                onBack={handleBack}
                isFirst={currentStep === 0}
                isLast={currentStep === questions.length - 1}
                isLoading={isLoading} // Pass loading state
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;

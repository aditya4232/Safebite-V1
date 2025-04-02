
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Loader from '@/components/Loader';
import { getAuth } from "firebase/auth";
import { app } from "../main"; // Corrected import path
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Types
interface Question {
  id: string;
  text: string;
  type: 'radio' | 'slider' | 'text';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

const weeklyQuestions: Question[] = [
  {
    id: 'home_cooked',
    text: 'How many home-cooked meals did you have this week?',
    type: 'slider',
    min: 0,
    max: 21,
    step: 1
  },
  {
    id: 'water_intake',
    text: 'On average, how many glasses of water did you drink daily?',
    type: 'slider',
    min: 0,
    max: 15,
    step: 1
  },
  {
    id: 'junk_food',
    text: 'How many times did you consume processed/junk food this week?',
    type: 'slider',
    min: 0,
    max: 20,
    step: 1
  },
  {
    id: 'exercise',
    text: 'How many minutes did you exercise this week in total?',
    type: 'slider',
    min: 0,
    max: 1000,
    step: 10
  },
  {
    id: 'energy_level',
    text: 'How would you rate your energy levels this week?',
    type: 'radio',
    options: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  }
];

const WeeklyQuestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  const currentQuestion = weeklyQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / weeklyQuestions.length) * 100;

  useEffect(() => {
    // Initialize answers with default values
    const defaultAnswers: Record<string, any> = {};
    weeklyQuestions.forEach(q => {
      if (q.type === 'slider') {
        defaultAnswers[q.id] = q.min || 0;
      } else if (q.type === 'radio' && q.options) {
        // Don't set a default for radio, let user choose
        defaultAnswers[q.id] = undefined;
      } else {
        defaultAnswers[q.id] = '';
      }
    });
    setAnswers(defaultAnswers);
  }, []);

  const handleNext = () => {
     // Check if the current question is answered
     if (answers[currentQuestion.id] === undefined || answers[currentQuestion.id] === '') {
       toast({
         title: "Missing Answer",
         description: "Please answer the current question before proceeding.",
         variant: "destructive",
       });
       return;
     }

    if (currentQuestionIndex < weeklyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleInputChange = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleSubmit = async () => {
    // Final check if all questions are answered (though handled step-by-step)
    const allAnswered = weeklyQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');
    if (!allAnswered) {
       toast({
         title: "Incomplete",
         description: "Please ensure all questions are answered.",
         variant: "destructive",
       });
       return;
    }

    setIsSubmitting(true);
    console.log('Weekly answers submitted:', answers);

    if (user) {
      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      try {
        // Update the user's document with the weekly answers and a timestamp
        await setDoc(userRef, {
          weeklyCheckin: {
            answers: answers,
            timestamp: Timestamp.now() // Add a timestamp
          }
        }, { merge: true }); // Merge to avoid overwriting the profile

        setIsCompleted(true);
        toast({
          title: "Weekly check-in completed!",
          description: "Thank you for your updates. We've updated your recommendations.",
        });

        // After 2 seconds, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } catch (error: any) {
        toast({
          title: "Error saving check-in",
          description: error.message,
          variant: "destructive",
        });
        console.error("Error writing weekly check-in to Firestore: ", error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast({
        title: "Authentication Error",
        description: "You are not logged in. Please log in and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      navigate('/auth/login');
    }
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'slider':
        return (
          <div className="w-full">
            <div className="flex justify-between text-sm text-safebite-text-secondary mb-2">
              <span>{currentQuestion.min}</span>
              <span>{currentQuestion.max}</span>
            </div>
            <input
              type="range"
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              value={answers[currentQuestion.id] || currentQuestion.min}
              onChange={(e) => handleInputChange(parseInt(e.target.value))}
              className="w-full sci-fi-input accent-safebite-teal"
            />
            <div className="mt-2 text-center text-xl font-semibold text-safebite-teal">
              {answers[currentQuestion.id] || currentQuestion.min}
            </div>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-3 w-full">
            {currentQuestion.options?.map((option) => (
              <div
                key={option}
                onClick={() => handleInputChange(option)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-safebite-teal bg-safebite-teal/10 text-safebite-teal'
                    : 'border-safebite-card-bg-alt bg-safebite-card-bg-alt text-safebite-text'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your answer here..."
            className="sci-fi-input w-full"
          />
        );
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center p-4">
        <Card className="sci-fi-card max-w-md w-full text-center">
          <div className="h-20 w-20 rounded-full bg-safebite-teal/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-safebite-teal" />
          </div>
          <h2 className="text-2xl font-bold text-safebite-text mb-2">Thank You!</h2>
          <p className="text-safebite-text-secondary mb-6">
            Your weekly health check-in is complete. We've updated your recommendations based on your responses.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center p-4">
      <Card className="sci-fi-card max-w-md w-full">
        <div className="absolute top-0 right-0 left-0 p-2 text-center bg-red-500 text-white text-xs">
          Under Development
        </div>
        
        <h2 className="text-2xl font-bold gradient-text text-center mb-6">
          Weekly Health Check-in
        </h2>

        {isSubmitting ? (
          <div className="py-16 flex flex-col items-center">
            <Loader size="lg" text="Submitting your answers..." />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-safebite-text-secondary text-sm">
                  Question {currentQuestionIndex + 1} of {weeklyQuestions.length}
                </span>
                <span className="text-safebite-teal text-sm">{Math.floor(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2 bg-safebite-card-bg-alt" />
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-medium text-safebite-text mb-6">
                {currentQuestion?.text}
              </h3>
              {renderQuestionInput()}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="sci-fi-button"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                {currentQuestionIndex < weeklyQuestions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Complete'
                )}
              </Button>
            </div>
          </>
        )}
        
        <div className="absolute bottom-2 right-2 text-xs text-safebite-text-secondary">
          Created by Aditya Shenvi
        </div>
      </Card>
    </div>
  );
};

export default WeeklyQuestions;

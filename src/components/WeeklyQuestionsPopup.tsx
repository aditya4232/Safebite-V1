import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../firebase";
import { Loader2, CheckCircle2, ArrowRight, HelpCircle, ClipboardCheck } from 'lucide-react';
import { trackUserInteraction } from '@/services/mlService';
import { getPersonalizedWeeklyQuestions } from '@/services/weeklyQuestionsService';

interface WeeklyQuestionsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const WeeklyQuestionsPopup: React.FC<WeeklyQuestionsPopupProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [hasCompletedThisWeek, setHasCompletedThisWeek] = useState(false);

  // Form state
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Check if user has already completed this week's questions
  useEffect(() => {
    const checkCompletionStatus = async () => {
      setIsLoading(true);

      try {
        const user = auth.currentUser;
        if (!user) {
          setIsLoading(false);
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if user has completed weekly check-in this week
          if (userData.weeklyCheckin?.lastSubmitted) {
            const lastSubmitted = userData.weeklyCheckin.lastSubmitted.toDate();
            const currentDate = new Date();

            // Get week number for both dates
            const getWeekNumber = (d: Date) => {
              const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
              const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
              return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            };

            const lastSubmittedWeek = getWeekNumber(lastSubmitted);
            const currentWeek = getWeekNumber(currentDate);

            // If same week, user has already completed
            if (lastSubmittedWeek === currentWeek &&
                lastSubmitted.getFullYear() === currentDate.getFullYear()) {
              setHasCompletedThisWeek(true);
            }
          }
        }

        // Load personalized questions
        const personalizedQuestions = await getPersonalizedWeeklyQuestions();
        setQuestions(personalizedQuestions);
        setTotalSteps(personalizedQuestions.length);

        // Initialize answers object with empty values
        const initialAnswers: Record<string, any> = {};
        personalizedQuestions.forEach(q => {
          if (q.type === 'slider') {
            initialAnswers[q.id] = Math.floor((q.min + q.max) / 2); // Default to middle value
          } else if (q.type === 'radio') {
            initialAnswers[q.id] = q.options ? q.options[Math.floor(q.options.length / 2)] : '';
          } else if (q.type === 'checkbox') {
            initialAnswers[q.id] = [];
          } else {
            initialAnswers[q.id] = '';
          }
        });
        setAnswers(initialAnswers);

      } catch (error) {
        console.error('Error checking weekly questions status:', error);
        toast({
          title: "Error",
          description: "Could not load weekly questions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkCompletionStatus();
    }
  }, [isOpen, auth, db, toast]);

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit your weekly check-in.",
          variant: "destructive",
        });
        return;
      }

      // Save answers to Firebase
      const userRef = doc(db, 'users', user.uid);

      // Get current date for tracking
      const currentDate = new Date();
      const weekNumber = Math.ceil((currentDate.getDate() - 1 + new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) / 7);
      const weekYear = `${currentDate.getFullYear()}-W${weekNumber}`;

      await setDoc(userRef, {
        weeklyCheckin: {
          answers: answers,
          lastSubmitted: serverTimestamp(),
          weekIdentifier: weekYear
        }
      }, { merge: true });

      // Track this interaction
      trackUserInteraction('complete_weekly_questions', {
        questionCount: questions.length,
        weekIdentifier: weekYear
      });

      // Show success message
      toast({
        title: "Weekly Check-in Complete!",
        description: "Your responses have been saved. Check your dashboard for insights.",
        variant: "default",
      });

      setIsSubmitted(true);

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting weekly questions:', error);
      toast({
        title: "Submission Error",
        description: "There was a problem saving your responses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);

      // Track progress
      trackUserInteraction('weekly_question_progress', {
        currentStep,
        totalSteps,
        questionId: questions[currentStep - 1]?.id
      });
    } else {
      handleSubmit();
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render current question
  const renderQuestion = () => {
    if (questions.length === 0 || currentStep > questions.length) {
      return null;
    }

    const question = questions[currentStep - 1];

    switch (question.type) {
      case 'slider':
        return (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <HelpCircle className="h-5 w-5 text-safebite-teal mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-safebite-text">{question.text}</h3>
                {question.description && (
                  <p className="text-sm text-safebite-text-secondary mt-1">{question.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-safebite-text-secondary">
                <span>{question.minLabel || question.min}</span>
                <span>{question.maxLabel || question.max}</span>
              </div>
              <input
                type="range"
                min={question.min || 0}
                max={question.max || 10}
                step={question.step || 1}
                value={answers[question.id] || 0}
                onChange={(e) => handleInputChange(question.id, parseInt(e.target.value))}
                className="w-full accent-safebite-teal"
              />
              <div className="text-center text-lg font-medium text-safebite-teal">
                {answers[question.id] || 0}
              </div>
            </div>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <HelpCircle className="h-5 w-5 text-safebite-teal mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-safebite-text">{question.text}</h3>
                {question.description && (
                  <p className="text-sm text-safebite-text-secondary mt-1">{question.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {question.options?.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border cursor-pointer transition-all ${
                    answers[question.id] === option
                      ? 'border-safebite-teal bg-safebite-teal/10 text-safebite-text'
                      : 'border-safebite-card-bg-alt bg-safebite-card-bg-alt/50 text-safebite-text-secondary hover:bg-safebite-card-bg-alt'
                  }`}
                  onClick={() => handleInputChange(question.id, option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <HelpCircle className="h-5 w-5 text-safebite-teal mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-safebite-text">{question.text}</h3>
                {question.description && (
                  <p className="text-sm text-safebite-text-secondary mt-1">{question.description}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {question.options?.map((option: string, index: number) => {
                const isSelected = Array.isArray(answers[question.id]) && answers[question.id].includes(option);

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-md border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-safebite-teal bg-safebite-teal/10 text-safebite-text'
                        : 'border-safebite-card-bg-alt bg-safebite-card-bg-alt/50 text-safebite-text-secondary hover:bg-safebite-card-bg-alt'
                    }`}
                    onClick={() => {
                      const currentValues = Array.isArray(answers[question.id]) ? [...answers[question.id]] : [];
                      const newValues = isSelected
                        ? currentValues.filter(v => v !== option)
                        : [...currentValues, option];
                      handleInputChange(question.id, newValues);
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border mr-2 flex items-center justify-center ${
                        isSelected ? 'bg-safebite-teal border-safebite-teal' : 'border-safebite-text-secondary'
                      }`}>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      {option}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <HelpCircle className="h-5 w-5 text-safebite-teal mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-safebite-text">{question.text}</h3>
                {question.description && (
                  <p className="text-sm text-safebite-text-secondary mt-1">{question.description}</p>
                )}
              </div>
            </div>

            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 rounded-md border border-safebite-card-bg-alt bg-safebite-card-bg-alt/50 text-safebite-text focus:border-safebite-teal focus:ring-1 focus:ring-safebite-teal"
            />
          </div>
        );
    }
  };

  // If already submitted this week
  const renderAlreadyCompleted = () => (
    <div className="text-center py-6">
      <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-safebite-text mb-2">
        Weekly Check-in Complete
      </h3>
      <p className="text-safebite-text-secondary mb-6">
        You've already completed your weekly health check-in. Check back next week for new questions.
      </p>
      <p className="text-safebite-text-secondary mb-6">
        Visit your dashboard to see insights based on your responses.
      </p>
      <Button
        onClick={onClose}
        className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
      >
        Return to Dashboard
      </Button>
    </div>
  );

  // If just submitted
  const renderSubmissionComplete = () => (
    <div className="text-center py-6">
      <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-xl font-semibold text-safebite-text mb-2">
        Thank You!
      </h3>
      <p className="text-safebite-text-secondary mb-6">
        Your weekly health check-in has been submitted successfully.
      </p>
      <p className="text-safebite-text-secondary mb-6">
        We'll use this information to provide personalized insights on your dashboard.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onClose}
          className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
        >
          View Dashboard Insights
        </Button>
      </div>
      <p className="text-xs text-safebite-text-secondary mt-4">
        Your responses have been saved and will be used to generate personalized health charts and recommendations.
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sci-fi-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <ClipboardCheck className="mr-2 h-6 w-6 text-safebite-teal" />
            Weekly Health Check-in
          </DialogTitle>
          <DialogDescription>
            Answer a few questions to help us personalize your health insights
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-safebite-teal animate-spin mb-4" />
            <p className="text-safebite-text-secondary">Loading your weekly questions...</p>
          </div>
        ) : hasCompletedThisWeek ? (
          renderAlreadyCompleted()
        ) : isSubmitted ? (
          renderSubmissionComplete()
        ) : (
          <>
            <div className="flex items-center justify-between mt-2 mb-6">
              <div className="text-sm text-safebite-text-secondary">
                Question {currentStep} of {totalSteps}
              </div>
              <div className="w-full max-w-xs">
                <Progress
                  value={(currentStep / totalSteps) * 100}
                  className="h-2 bg-safebite-card-bg-alt"
                />
              </div>
            </div>

            {renderQuestion()}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className="border-safebite-card-bg-alt"
              >
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    Submit
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyQuestionsPopup;

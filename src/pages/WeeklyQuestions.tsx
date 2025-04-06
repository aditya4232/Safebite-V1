import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, Bot, Loader2 } from 'lucide-react';
import Loader from '@/components/Loader';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { Question, getPersonalizedWeeklyQuestions, generateWeeklyInsights } from '@/services/weeklyQuestionsService';



const WeeklyQuestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyQuestions, setWeeklyQuestions] = useState<Question[]>([]);
  const [weeklyInsights, setWeeklyInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;
  const [hasCompletedThisWeek, setHasCompletedThisWeek] = useState(false);

  const currentQuestion = weeklyQuestions[currentQuestionIndex];
  const progress = weeklyQuestions.length > 0 ? ((currentQuestionIndex + 1) / weeklyQuestions.length) * 100 : 0;

  useEffect(() => {
    const initializeWeeklyQuestions = async () => {
      setIsLoading(true);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          // Check if user has already completed this week's questions
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.weeklyCheckin && userData.weeklyCheckin.timestamp) {
              const lastCheckinTime = userData.weeklyCheckin.timestamp.toDate();
              const now = new Date();
              // Check if the last check-in was this week
              const isSameWeek = (lastCheckinTime.getFullYear() === now.getFullYear() &&
                                  lastCheckinTime.getMonth() === now.getMonth() &&
                                  lastCheckinTime.getDate() >= now.getDate() - now.getDay() &&
                                  lastCheckinTime.getDate() <= now.getDate() + (6 - now.getDay()));

              setHasCompletedThisWeek(isSameWeek);
              setIsCompleted(isSameWeek);

              // If completed, load the insights
              if (isSameWeek && userData.weeklyCheckin.insights) {
                setWeeklyInsights(userData.weeklyCheckin.insights);
              }
            }
          }

          // Load personalized questions
          const personalizedQuestions = await getPersonalizedWeeklyQuestions();
          setWeeklyQuestions(personalizedQuestions);
        } catch (error: any) {
          toast({
            title: "Error checking progress",
            description: error.message,
            variant: "destructive",
          });
          console.error("Error initializing weekly questions: ", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    initializeWeeklyQuestions();
  }, [user, db, toast, navigate]);

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
        // Generate AI insights from the answers
        setIsGeneratingInsights(true);
        let insights = "";
        try {
          insights = await generateWeeklyInsights(answers);
          setWeeklyInsights(insights);
        } catch (insightError) {
          console.error("Error generating insights:", insightError);
          insights = "We couldn't generate personalized insights at this time.";
        }

        // Update the user's document with the weekly answers, insights, and a timestamp
        await setDoc(userRef, {
          weeklyCheckin: {
            answers: answers,
            insights: insights,
            timestamp: Timestamp.now() // Add a timestamp
          },
          lastWeeklyPrompt: Timestamp.now() // Update lastWeeklyPrompt timestamp
        }, { merge: true }); // Merge to avoid overwriting the profile

        setIsCompleted(true);
        toast({
          title: "Weekly check-in completed!",
          description: "Thank you for your updates. We've generated personalized insights for you.",
        });

        // After 3 seconds, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

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
        <Card className="sci-fi-card max-w-2xl w-full text-center">
          <div className="h-20 w-20 rounded-full bg-safebite-teal/20 flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-safebite-teal" />
          </div>
          <h2 className="text-2xl font-bold text-safebite-text mb-2">Thank You!</h2>
          <p className="text-safebite-text-secondary mb-6">
            Your weekly health check-in is complete. We've generated personalized insights based on your responses.
          </p>

          {isGeneratingInsights ? (
            <div className="py-8 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-safebite-teal mb-4" />
              <p className="text-safebite-text-secondary">Generating your personalized insights...</p>
            </div>
          ) : weeklyInsights ? (
            <div className="bg-safebite-card-bg-alt p-6 rounded-md mb-6 text-left">
              <div className="flex items-center mb-4">
                <Bot className="h-6 w-6 text-safebite-teal mr-2" />
                <h3 className="text-xl font-medium text-safebite-text">Your Weekly Health Insights</h3>
              </div>
              <div className="text-safebite-text-secondary whitespace-pre-line">
                {weeklyInsights.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-safebite-text-secondary mb-6">
              We've updated your recommendations based on your responses.
            </p>
          )}

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

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 text-safebite-teal mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-safebite-text mb-2">Loading your personalized questions...</h3>
            <p className="text-safebite-text-secondary mb-4">
              We're tailoring this week's questions based on your profile and previous responses.
            </p>
          </div>
        ) : hasCompletedThisWeek ? (
          <div className="text-center py-12">
            <Check className="h-16 w-16 text-safebite-teal mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-safebite-text mb-2">You've already completed this week's check-in!</h3>
            <p className="text-safebite-text-secondary mb-4">
              Check back next week for another opportunity to update your health information.
            </p>
            {weeklyInsights && (
              <div className="bg-safebite-card-bg-alt p-6 rounded-md mb-6 text-left">
                <div className="flex items-center mb-4">
                  <Bot className="h-6 w-6 text-safebite-teal mr-2" />
                  <h3 className="text-lg font-medium text-safebite-text">Your Weekly Health Insights</h3>
                </div>
                <div className="text-safebite-text-secondary whitespace-pre-line">
                  {weeklyInsights.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={() => navigate('/dashboard')} className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
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

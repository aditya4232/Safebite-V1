import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../firebase";
import { Loader2, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

interface WeeklyQuestionsFormProps {
  onComplete?: () => void;
}

const WeeklyQuestionsForm: React.FC<WeeklyQuestionsFormProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Form state
  const [answers, setAnswers] = useState({
    exercise_minutes: 0,
    water_intake: 0,
    sleep_hours: 0,
    stress_level: 3,
    home_cooked_meals: 0,
    junk_food_consumption: 0,
    fruit_vegetable_servings: 0,
    health_symptoms: [] as string[]
  });

  // Check if user has already completed this week's questions
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/auth/login');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Check if user has completed weekly questions this week
          if (userData.weeklyCheckin?.lastSubmitted) {
            const lastSubmitted = userData.weeklyCheckin.lastSubmitted.toDate();
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate.getTime() - lastSubmitted.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // If less than 7 days since last submission, show already submitted message
            if (diffDays < 7) {
              setIsSubmitted(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking weekly questions status:', error);
      }
    };

    checkCompletionStatus();
  }, [auth, db, navigate]);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/auth/login');
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
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // If already submitted this week
  if (isSubmitted) {
    return (
      <Card className="sci-fi-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
            <CheckCircle2 className="mr-2 h-6 w-6 text-green-500" />
            Weekly Check-in Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-safebite-text-secondary mb-6">
            You've already completed your weekly health check-in. Check back next week for new questions.
          </p>
          <p className="text-safebite-text-secondary mb-6">
            Visit your dashboard to see insights based on your responses.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sci-fi-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Weekly Health Check-in
        </CardTitle>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-safebite-text-secondary">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="flex h-2 w-full max-w-xs bg-safebite-card-bg-alt rounded-full overflow-hidden">
            <div 
              className="bg-safebite-teal h-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Step 1: Exercise */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How many minutes of exercise did you get this week?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  Include any physical activity like walking, running, sports, or workouts.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <div className="mb-6">
                <Slider
                  value={[answers.exercise_minutes]}
                  min={0}
                  max={300}
                  step={5}
                  onValueChange={(value) => setAnswers({...answers, exercise_minutes: value[0]})}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-safebite-text-secondary">
                  <span>0 min</span>
                  <span>150 min</span>
                  <span>300+ min</span>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-safebite-teal">{answers.exercise_minutes}</span>
                <span className="text-safebite-text ml-1">minutes</span>
              </div>
              
              <p className="text-xs text-safebite-text-secondary text-center">
                {answers.exercise_minutes < 60 ? 'Try to aim for at least 150 minutes per week for good health.' :
                 answers.exercise_minutes < 150 ? 'Getting closer to the recommended 150 minutes per week!' :
                 'Great job! You\'re meeting or exceeding exercise recommendations.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 2: Water Intake */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How many cups of water do you drink daily on average?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  One cup is approximately 8 ounces or 240ml.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <div className="mb-6">
                <Slider
                  value={[answers.water_intake]}
                  min={0}
                  max={12}
                  step={1}
                  onValueChange={(value) => setAnswers({...answers, water_intake: value[0]})}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-safebite-text-secondary">
                  <span>0 cups</span>
                  <span>6 cups</span>
                  <span>12+ cups</span>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-safebite-teal">{answers.water_intake}</span>
                <span className="text-safebite-text ml-1">cups</span>
              </div>
              
              <p className="text-xs text-safebite-text-secondary text-center">
                {answers.water_intake < 4 ? 'Try to increase your water intake for better hydration.' :
                 answers.water_intake < 8 ? 'You\'re doing well, but try to reach 8 cups daily for optimal hydration.' :
                 'Excellent! You\'re well-hydrated.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 3: Sleep */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How many hours of sleep do you get on average each night?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  Consider your typical sleep pattern over the past week.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <div className="mb-6">
                <Slider
                  value={[answers.sleep_hours]}
                  min={0}
                  max={12}
                  step={0.5}
                  onValueChange={(value) => setAnswers({...answers, sleep_hours: value[0]})}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-safebite-text-secondary">
                  <span>0 hrs</span>
                  <span>6 hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-safebite-teal">{answers.sleep_hours}</span>
                <span className="text-safebite-text ml-1">hours</span>
              </div>
              
              <p className="text-xs text-safebite-text-secondary text-center">
                {answers.sleep_hours < 6 ? 'Most adults need 7-9 hours of sleep for optimal health.' :
                 answers.sleep_hours < 7 ? 'You\'re close to the recommended amount of sleep.' :
                 answers.sleep_hours <= 9 ? 'Great! You\'re getting the recommended amount of sleep.' :
                 'You\'re getting more than the typical recommendation. If you feel well-rested, that\'s what matters!'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 4: Stress Level */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How would you rate your stress level this week?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  Consider your overall feelings of stress, anxiety, or tension.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <RadioGroup 
                value={answers.stress_level.toString()} 
                onValueChange={(value) => setAnswers({...answers, stress_level: parseInt(value)})}
                className="grid grid-cols-1 gap-4"
              >
                <div className="flex items-center space-x-2 border border-safebite-card-bg-alt p-3 rounded-md hover:bg-safebite-card-bg-alt/30 transition-colors">
                  <RadioGroupItem value="1" id="stress-1" />
                  <Label htmlFor="stress-1" className="flex-1 cursor-pointer">Very Low - Feeling calm and relaxed</Label>
                </div>
                <div className="flex items-center space-x-2 border border-safebite-card-bg-alt p-3 rounded-md hover:bg-safebite-card-bg-alt/30 transition-colors">
                  <RadioGroupItem value="2" id="stress-2" />
                  <Label htmlFor="stress-2" className="flex-1 cursor-pointer">Low - Occasional mild stress</Label>
                </div>
                <div className="flex items-center space-x-2 border border-safebite-card-bg-alt p-3 rounded-md hover:bg-safebite-card-bg-alt/30 transition-colors">
                  <RadioGroupItem value="3" id="stress-3" />
                  <Label htmlFor="stress-3" className="flex-1 cursor-pointer">Moderate - Noticeable but manageable stress</Label>
                </div>
                <div className="flex items-center space-x-2 border border-safebite-card-bg-alt p-3 rounded-md hover:bg-safebite-card-bg-alt/30 transition-colors">
                  <RadioGroupItem value="4" id="stress-4" />
                  <Label htmlFor="stress-4" className="flex-1 cursor-pointer">High - Frequent stress affecting daily life</Label>
                </div>
                <div className="flex items-center space-x-2 border border-safebite-card-bg-alt p-3 rounded-md hover:bg-safebite-card-bg-alt/30 transition-colors">
                  <RadioGroupItem value="5" id="stress-5" />
                  <Label htmlFor="stress-5" className="flex-1 cursor-pointer">Very High - Constant stress, feeling overwhelmed</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}
        
        {/* Step 5: Home-cooked Meals */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">5</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How many home-cooked meals did you eat this week?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  Include meals prepared at home, not takeout or restaurant meals.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <div className="mb-6">
                <Slider
                  value={[answers.home_cooked_meals]}
                  min={0}
                  max={21}
                  step={1}
                  onValueChange={(value) => setAnswers({...answers, home_cooked_meals: value[0]})}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-safebite-text-secondary">
                  <span>0 meals</span>
                  <span>10 meals</span>
                  <span>21 meals</span>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-safebite-teal">{answers.home_cooked_meals}</span>
                <span className="text-safebite-text ml-1">meals</span>
              </div>
              
              <p className="text-xs text-safebite-text-secondary text-center">
                {answers.home_cooked_meals < 7 ? 'Home-cooked meals are typically healthier. Try to increase when possible.' :
                 answers.home_cooked_meals < 14 ? 'You\'re doing well with home cooking!' :
                 'Excellent! Most of your meals are home-cooked, which is great for nutrition.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 6: Junk Food */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">6</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How many times did you eat fast food or junk food this week?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  Include fast food, processed snacks, sugary treats, etc.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <div className="mb-6">
                <Slider
                  value={[answers.junk_food_consumption]}
                  min={0}
                  max={15}
                  step={1}
                  onValueChange={(value) => setAnswers({...answers, junk_food_consumption: value[0]})}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-safebite-text-secondary">
                  <span>0 times</span>
                  <span>7 times</span>
                  <span>15+ times</span>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-safebite-teal">{answers.junk_food_consumption}</span>
                <span className="text-safebite-text ml-1">times</span>
              </div>
              
              <p className="text-xs text-safebite-text-secondary text-center">
                {answers.junk_food_consumption < 3 ? 'Great job limiting junk food consumption!' :
                 answers.junk_food_consumption < 7 ? 'Try to reduce junk food a bit more for better health.' :
                 'Consider reducing your junk food intake for better nutrition and health.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 7: Fruits and Vegetables */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">7</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  How many servings of fruits and vegetables do you eat daily?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  One serving is about 1 cup of raw vegetables or fruit, or 1/2 cup cooked.
                </p>
              </div>
            </div>
            
            <div className="pl-11">
              <div className="mb-6">
                <Slider
                  value={[answers.fruit_vegetable_servings]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={(value) => setAnswers({...answers, fruit_vegetable_servings: value[0]})}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-safebite-text-secondary">
                  <span>0 servings</span>
                  <span>5 servings</span>
                  <span>10+ servings</span>
                </div>
              </div>
              
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-safebite-teal">{answers.fruit_vegetable_servings}</span>
                <span className="text-safebite-text ml-1">servings</span>
              </div>
              
              <p className="text-xs text-safebite-text-secondary text-center">
                {answers.fruit_vegetable_servings < 3 ? 'Try to increase your fruit and vegetable intake to at least 5 servings daily.' :
                 answers.fruit_vegetable_servings < 5 ? 'You\'re doing well, but aim for 5+ servings daily for optimal health.' :
                 'Excellent! You\'re meeting or exceeding the recommended fruit and vegetable intake.'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 8: Health Symptoms */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-safebite-teal font-bold">8</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-safebite-text mb-1">
                  Have you experienced any of these symptoms this week?
                </h3>
                <p className="text-sm text-safebite-text-secondary mb-4">
                  Select all that apply. This helps us provide better health insights.
                </p>
              </div>
            </div>
            
            <div className="pl-11 space-y-3">
              {[
                { id: 'fatigue', label: 'Unusual fatigue or low energy' },
                { id: 'headaches', label: 'Frequent headaches' },
                { id: 'digestive', label: 'Digestive issues (bloating, constipation, etc.)' },
                { id: 'joint_pain', label: 'Joint pain or stiffness' },
                { id: 'mood_swings', label: 'Mood swings or irritability' },
                { id: 'skin_issues', label: 'Skin issues (rashes, acne, dryness)' },
                { id: 'sleep_issues', label: 'Difficulty sleeping' },
                { id: 'allergies', label: 'Allergy symptoms' },
                { id: 'none', label: 'None of the above' }
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id} 
                    checked={answers.health_symptoms.includes(item.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // If "None" is selected, clear all other selections
                        if (item.id === 'none') {
                          setAnswers({...answers, health_symptoms: ['none']});
                        } else {
                          // If any other item is selected, remove "None" if it's there
                          const newSymptoms = answers.health_symptoms.filter(s => s !== 'none');
                          setAnswers({...answers, health_symptoms: [...newSymptoms, item.id]});
                        }
                      } else {
                        setAnswers({
                          ...answers, 
                          health_symptoms: answers.health_symptoms.filter(s => s !== item.id)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                </div>
              ))}
              
              <div className="mt-4 flex items-center">
                <HelpCircle className="h-4 w-4 text-safebite-text-secondary mr-2" />
                <p className="text-xs text-safebite-text-secondary">
                  This information is used to provide personalized health insights and is kept private.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
            className="sci-fi-button"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
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
      </CardContent>
    </Card>
  );
};

export default WeeklyQuestionsForm;

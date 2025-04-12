import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Bot, Loader2 } from 'lucide-react';
import Loader from '@/components/Loader';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import WeeklyQuestionsForm from '@/components/WeeklyQuestionsForm';
import FoodChatBot from '@/components/FoodChatBot';



const WeeklyQuestions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyInsights, setWeeklyInsights] = useState<string>('');
  const [hasCompletedThisWeek, setHasCompletedThisWeek] = useState(false);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const user = auth.currentUser;

  // User data for personalized chat suggestions
  const [userData, setUserData] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any[]>([]);

  useEffect(() => {
    const checkCompletionStatus = async () => {
      setIsLoading(true);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        try {
          // Check if user has already completed this week's questions
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userProfileData = docSnap.data();
            setUserData(userProfileData);

            if (userProfileData.weeklyCheckin && userProfileData.weeklyCheckin.lastSubmitted) {
              const lastCheckinTime = userProfileData.weeklyCheckin.lastSubmitted.toDate();
              const now = new Date();
              // Check if the last check-in was this week
              const diffTime = Math.abs(now.getTime() - lastCheckinTime.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isSameWeek = diffDays < 7;

              setHasCompletedThisWeek(isSameWeek);

              // If completed, load the insights
              if (isSameWeek && userProfileData.weeklyCheckin.answers) {
                setWeeklyInsights(JSON.stringify(userProfileData.weeklyCheckin.answers));
              }
            }
          }

          // Get user activity data
          const activityRef = doc(db, 'user_activities', user.uid);
          const activityDoc = await getDoc(activityRef);

          if (activityDoc.exists()) {
            const data = activityDoc.data();
            setUserActivity(data.activities || []);
          }
        } catch (error: any) {
          toast({
            title: "Error checking progress",
            description: error.message,
            variant: "destructive",
          });
          console.error("Error checking weekly questions status: ", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkCompletionStatus();
  }, [user, db, toast]);

  const handleComplete = () => {
    toast({
      title: "Weekly check-in completed!",
      description: "Your responses have been saved. Check your dashboard for insights.",
    });

    // Navigate to dashboard after completion
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-safebite-dark-blue flex items-center justify-center p-4">
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-16 w-16 text-safebite-teal mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold text-safebite-text mb-2">Loading your weekly check-in...</h3>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <WeeklyQuestionsForm onComplete={handleComplete} />

          <div className="text-center mt-4 text-xs text-safebite-text-secondary">
            Your weekly check-in helps us provide personalized health recommendations.
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <FoodChatBot
        currentPage="weekly-questions"
        userData={{
          profile: userData,
          recentActivity: userActivity
        }}
        autoOpen={true}
        initialMessage="Welcome to your weekly health check-in! These questions help us provide personalized recommendations. Would you like me to explain how this information is used to improve your experience?"
      />
    </div>
  );
};

export default WeeklyQuestions;

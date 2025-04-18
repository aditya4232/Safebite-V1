import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, ArrowRight, Trophy, Stethoscope,
  Activity, UserCircle, Search, Shield, Brain, Lock, Coffee, CheckCircle, Bell
} from 'lucide-react';
import GuestBanner from './GuestBanner';
// Removed GuestNamePrompt import
import { getGuestName } from '@/services/guestUserService'; // Import service function
import NotificationSystem from '@/components/NotificationSystem';
import WelcomeAnimation from '@/components/WelcomeAnimation';
import HealthDataCharts from '@/components/HealthDataCharts';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  // Get guest name from sessionStorage via service
  const [guestName, setGuestName] = useState<string>('');

  // Fetch guest name on component mount and whenever it might change
  useEffect(() => {
    const fetchGuestName = () => {
      // Try to get name from multiple sources to ensure we get it
      const sessionName = getGuestName();
      const localName = localStorage.getItem('guestUserName');

      console.log('Guest name sources:', {
        sessionName,
        localName,
        localStorage: localStorage.getItem('guestUserName'),
        sessionStorage: sessionStorage.getItem('guestUserName')
      });

      // Use the first available name source
      const name = sessionName || localName || '';
      if (name) {
        setGuestName(name);
        console.log('Setting guest name to:', name);
      } else {
        console.log('No guest name found in any storage location');
      }
    };

    // Initial fetch
    fetchGuestName();

    // Set up interval to check for name changes (in case it's set in another tab/component)
    const intervalId = setInterval(fetchGuestName, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // Removed showNamePrompt state and related useEffect debug log

  // Check if this is the first visit to show welcome animation
  useEffect(() => {
    const isFirstVisit = localStorage.getItem('safebite-guest-first-visit') !== 'false';
    if (isFirstVisit) {
      setShowWelcomeAnimation(true);
      localStorage.setItem('safebite-guest-first-visit', 'false');
    }
  }, []);

  // Show welcome notification when component mounts and guestName is loaded
  useEffect(() => {
    // Only show toast if guestName has been set (either empty or with a value)
    // and the notification hasn't been shown yet.
    if (guestName !== undefined && showWelcomeNotification && !showWelcomeAnimation) {
      if (guestName) {
        toast({
          title: `Welcome, ${guestName}!`, // Changed "Welcome back" to "Welcome"
          description: "You're exploring SafeBite in guest mode. Your data won't be saved when you leave.",
          variant: "default",
          duration: 8000,
        });
      } else {
        // If no guest name (should ideally not happen if Login page logic is correct, but handle anyway)
        toast({
          title: "Welcome to Guest Mode!",
          description: "Explore SafeBite's features freely. Create an account to save your progress and get personalized insights.",
          variant: "default",
          duration: 8000,
        });
      }
      setShowWelcomeNotification(false); // Mark notification as shown
    }
    // Depend on guestName state to ensure it runs after name is fetched
  }, [toast, showWelcomeNotification, guestName, showWelcomeAnimation]);

  // Removed handleNameSubmit function

  return (
    // Added a subtle background pattern
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-safebite-dark-blue to-safebite-dark-blue/95 relative overflow-hidden min-h-screen">
       {/* Subtle grid pattern */}
       <div className="absolute inset-0 opacity-5">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
           <pattern id="guest-grid" width="40" height="40" patternUnits="userSpaceOnUse">
             <path d="M0 20 L40 20 M20 0 L20 40" stroke="currentColor" strokeWidth="0.5" className="text-safebite-teal/50" />
           </pattern>
           <rect width="100%" height="100%" fill="url(#guest-grid)" />
         </svg>
       </div>

      {/* Removed Guest Name Prompt */}

      {/* Welcome Animation for new users */}
      {showWelcomeAnimation && (
        <WelcomeAnimation
          onComplete={() => setShowWelcomeAnimation(false)}
          userName={guestName || 'Guest'}
        />
      )}

      {/* Guest Banner */}
      <GuestBanner />

      {/* Header - Improved styling and layout */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 p-6 bg-safebite-card-bg/80 backdrop-blur-sm rounded-lg border border-safebite-teal/20 shadow-lg">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-safebite-text mb-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple animate-gradient-text">
              Welcome, {guestName || 'Guest'}!
            </span>
          </h1>
          <p className="text-safebite-text-secondary text-sm">
            You're exploring in Guest Mode. Sign up to unlock all features.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <NotificationSystem currentPage="guest-dashboard" />
          <Button
            onClick={() => navigate('/auth/signup')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 w-full sm:w-auto transition-transform hover:scale-105"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Feature Showcase - Added section wrapper */}
      <div className="relative z-10 mb-10 p-6 bg-safebite-card-bg/80 backdrop-blur-sm rounded-lg border border-safebite-teal/20 shadow-lg">
        <h2 className="text-2xl font-semibold text-safebite-text mb-6 text-center">Discover Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card styling consistency */}
          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 bg-safebite-card-bg-alt border-safebite-teal/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Search className="mr-2 h-5 w-5 text-safebite-teal" />
                Instant Food Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Look up foods or scan barcodes for nutrition facts and safety insights.
              </p>
              <Button
                onClick={() => navigate('/food-search')}
                className="w-full sci-fi-button-alt" // Use alt button style
              >
                Try Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 bg-safebite-card-bg-alt border-safebite-teal/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Stethoscope className="mr-2 h-5 w-5 text-safebite-teal" />
                Health Calculators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Use over 30 calculators for BMI, BMR, calories, and more.
              </p>
              <Button
                onClick={() => navigate('/healthbox')}
                className="w-full sci-fi-button-alt" // Use alt button style
              >
                Explore Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 bg-safebite-card-bg-alt border-safebite-teal/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Brain className="mr-2 h-5 w-5 text-safebite-teal" />
                AI Food Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Leverage AI for deeper understanding of food ingredients and safety.
              </p>
              <Button
                onClick={() => navigate('/food-search')} // Maybe link to a specific AI feature page later?
                className="w-full sci-fi-button-alt" // Use alt button style
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Locked Features - Added section wrapper and improved styling */}
      <div className="relative z-10 mb-10 p-6 bg-safebite-card-bg/80 backdrop-blur-sm rounded-lg border border-safebite-teal/20 shadow-lg">
        <h2 className="text-2xl font-semibold text-safebite-text mb-6 text-center">Unlock Full Potential - Sign Up!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Locked Card Style */}
          <Card className="sci-fi-card bg-safebite-card-bg/60 border-safebite-card-bg-alt/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
               <Button
                 onClick={() => navigate('/auth/signup')}
                 className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 scale-110"
               >
                 Sign Up Now
               </Button>
             </div>
             <div className="absolute top-3 right-3 z-0">
               <Lock className="h-5 w-5 text-safebite-text-secondary/50" />
             </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-safebite-text-secondary text-lg">
                <Activity className="mr-2 h-5 w-5" />
                Personalized Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Log meals, track nutrition, monitor progress, and save history.
              </p>
              <Button disabled className="w-full sci-fi-button-disabled">
                Locked
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card bg-safebite-card-bg/60 border-safebite-card-bg-alt/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
               <Button
                 onClick={() => navigate('/auth/signup')}
                 className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 scale-110"
               >
                 Sign Up Now
               </Button>
             </div>
             <div className="absolute top-3 right-3 z-0">
               <Lock className="h-5 w-5 text-safebite-text-secondary/50" />
             </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-safebite-text-secondary text-lg">
                <Trophy className="mr-2 h-5 w-5" />
                Gamification & Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Set health goals, earn badges, and track achievements.
              </p>
              <Button disabled className="w-full sci-fi-button-disabled">
                Locked
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card bg-safebite-card-bg/60 border-safebite-card-bg-alt/50 relative overflow-hidden group">
             <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
               <Button
                 onClick={() => navigate('/auth/signup')}
                 className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 scale-110"
               >
                 Sign Up Now
               </Button>
             </div>
             <div className="absolute top-3 right-3 z-0">
               <Lock className="h-5 w-5 text-safebite-text-secondary/50" />
             </div>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-safebite-text-secondary text-lg">
                <Coffee className="mr-2 h-5 w-5" />
                Personalized AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Receive AI recommendations tailored to your health profile.
              </p>
              <Button disabled className="w-full sci-fi-button-disabled">
                Locked
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Create an Account - Improved styling */}
      <div className="relative z-10 mb-10">
        <Card className="sci-fi-card shadow-neon-teal border-safebite-teal/50 bg-gradient-to-br from-safebite-card-bg to-safebite-card-bg-alt">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold gradient-text">Why Create a Free Account?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-safebite-teal mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-safebite-text-secondary text-sm">Save food search history & favorites</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-safebite-teal mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-safebite-text-secondary text-sm">Get personalized AI health recommendations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-safebite-teal mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-safebite-text-secondary text-sm">Track nutrition, activity & progress over time</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-safebite-teal mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-safebite-text-secondary text-sm">Earn achievements & XP for healthy habits</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-safebite-teal mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-safebite-text-secondary text-sm">Access premium features & future integrations</span>
              </li>
            </ul>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/auth/signup')}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                size="lg"
              >
                Sign Up Free
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Data Charts - Sample for Guest Users */}
      <div className="relative z-10 mb-10">
        <h2 className="text-2xl font-semibold text-safebite-text mb-6 text-center">Health Insights</h2>
        <HealthDataCharts
          userId="guest-user"
          initialTab="weight"
        />
      </div>

      {/* Coming Soon - Refined styling */}
      <div className="relative z-10 mb-10">
        <h2 className="text-2xl font-semibold text-safebite-text mb-6 text-center">What's Next?</h2>
        <Card className="sci-fi-card relative overflow-hidden border-orange-500/30 bg-safebite-card-bg-alt">
          {/* Animated Border */}
          <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 opacity-75 blur animate-pulse-slow"></div>
          <div className="relative p-6 bg-safebite-card-bg-alt rounded-lg">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-semibold text-orange-400 mb-2">Food Delivery Integration</h3>
                <p className="text-safebite-text-secondary mb-4 text-sm">
                  Get nutritional insights for meals from Zomato & Swiggy directly within SafeBite. Search for your favorite dishes!
                </p>
                <div className="flex items-center justify-center sm:justify-start">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                    Now Live
                  </Badge>
                  <span className="ml-3 text-xs text-safebite-text-secondary">Try it now!</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-safebite-text-secondary text-sm mt-8">
        <p>SafeBite v3.0</p>
        <p className="mt-2">Guest mode provides limited functionality. <Button variant="link" className="p-0 h-auto text-safebite-teal" onClick={() => navigate('/auth/signup')}>Sign up</Button> for full access.</p>
      </div>
    </div>
  );
};

export default GuestDashboard;

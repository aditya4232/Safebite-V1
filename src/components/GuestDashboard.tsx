import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, Info, Zap, ArrowRight, Trophy, Stethoscope, 
  Sparkles, Bot, RefreshCw, Activity, UserCircle, 
  Search, Heart, Shield, Brain, Lock, Coffee
} from 'lucide-react';
import GuestBanner from './GuestBanner';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(true);

  // Show welcome notification when component mounts
  useEffect(() => {
    if (showWelcomeNotification) {
      toast({
        title: "Welcome to SafeBite!",
        description: "You're in guest mode. Your data won't be saved when you leave.",
        variant: "default",
        duration: 6000,
      });
      setShowWelcomeNotification(false);
    }
  }, [toast, showWelcomeNotification]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Guest Banner */}
      <GuestBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-safebite-text mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">
              Welcome, Guest
            </span>
          </h1>
          <p className="text-safebite-text-secondary">
            Explore SafeBite's features in guest mode. Sign up to save your data and get personalized recommendations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => navigate('/auth/signup')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
          >
            <UserCircle className="mr-2 h-5 w-5" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-safebite-text mb-4">Discover SafeBite Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5 text-safebite-teal" />
                Food Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4">
                Search for food items to get detailed nutritional information and safety analysis.
              </p>
              <Button 
                onClick={() => navigate('/food-search')}
                className="w-full bg-safebite-card-bg-alt hover:bg-safebite-card-bg-alt/80"
              >
                Try Food Search
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-safebite-teal" />
                Health Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4">
                Access 30+ health calculators and tools to monitor and improve your health.
              </p>
              <Button 
                onClick={() => navigate('/healthbox')}
                className="w-full bg-safebite-card-bg-alt hover:bg-safebite-card-bg-alt/80"
              >
                Explore Health Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5 text-safebite-teal" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4">
                Get AI-powered analysis of food items and personalized health recommendations.
              </p>
              <Button 
                onClick={() => navigate('/food-search')}
                className="w-full bg-safebite-card-bg-alt hover:bg-safebite-card-bg-alt/80"
              >
                Try AI Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Locked Features */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-safebite-text mb-4">Features Available After Sign Up</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="sci-fi-card bg-safebite-card-bg/50 border-safebite-card-bg-alt/50">
            <div className="absolute top-3 right-3">
              <Lock className="h-5 w-5 text-safebite-text-secondary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-safebite-text-secondary">
                <Activity className="mr-2 h-5 w-5 text-safebite-text-secondary" />
                Health Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4">
                Track your nutrition, water intake, and activity over time with personalized charts.
              </p>
              <Button 
                onClick={() => navigate('/auth/signup')}
                className="w-full bg-safebite-card-bg-alt/50 hover:bg-safebite-card-bg-alt/80"
                variant="outline"
              >
                Sign Up to Access
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card bg-safebite-card-bg/50 border-safebite-card-bg-alt/50">
            <div className="absolute top-3 right-3">
              <Lock className="h-5 w-5 text-safebite-text-secondary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-safebite-text-secondary">
                <Trophy className="mr-2 h-5 w-5 text-safebite-text-secondary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4">
                Earn badges and XP points as you use SafeBite and improve your health habits.
              </p>
              <Button 
                onClick={() => navigate('/auth/signup')}
                className="w-full bg-safebite-card-bg-alt/50 hover:bg-safebite-card-bg-alt/80"
                variant="outline"
              >
                Sign Up to Access
              </Button>
            </CardContent>
          </Card>

          <Card className="sci-fi-card bg-safebite-card-bg/50 border-safebite-card-bg-alt/50">
            <div className="absolute top-3 right-3">
              <Lock className="h-5 w-5 text-safebite-text-secondary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-safebite-text-secondary">
                <Coffee className="mr-2 h-5 w-5 text-safebite-text-secondary" />
                Food Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4">
                Get nutritional information for restaurant meals from Zomato and Swiggy (coming soon).
              </p>
              <Button 
                onClick={() => navigate('/auth/signup')}
                className="w-full bg-safebite-card-bg-alt/50 hover:bg-safebite-card-bg-alt/80"
                variant="outline"
              >
                Sign Up to Access
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Create an Account */}
      <div className="mb-8">
        <Card className="sci-fi-card shadow-neon-teal">
          <CardHeader>
            <CardTitle>Why Create an Account?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-safebite-teal mr-2 mt-0.5" />
                <span className="text-safebite-text-secondary">Save your food search history and favorites</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-safebite-teal mr-2 mt-0.5" />
                <span className="text-safebite-text-secondary">Get personalized health recommendations based on your profile</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-safebite-teal mr-2 mt-0.5" />
                <span className="text-safebite-text-secondary">Track your nutrition and health progress over time</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-safebite-teal mr-2 mt-0.5" />
                <span className="text-safebite-text-secondary">Earn achievements and XP as you improve your health</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-5 w-5 text-safebite-teal mr-2 mt-0.5" />
                <span className="text-safebite-text-secondary">Access premium features and upcoming integrations</span>
              </li>
            </ul>
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={() => navigate('/auth/signup')}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                size="lg"
              >
                Create Your Free Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-safebite-text mb-4">Coming Soon</h2>
        <Card className="sci-fi-card relative overflow-hidden">
          {/* Glowing border effect */}
          <div className="absolute inset-0 border-2 border-orange-500 rounded-lg opacity-50 animate-pulse"></div>

          <div className="flex items-center p-6">
            <div className="flex-shrink-0 mr-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold text-orange-500 mb-2">Zomato + Swiggy Integration</h3>
              <p className="text-safebite-text-secondary mb-4">
                We're working on integrating with popular food delivery platforms to provide nutritional information and health recommendations for restaurant meals.
              </p>
              <div className="flex items-center">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                  Coming Soon
                </Badge>
                <span className="ml-3 text-xs text-safebite-text-secondary">Working on dataset</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-safebite-text-secondary text-sm mt-8">
        <p>SafeBite v2.1 - Created by Aditya Shenvi</p>
        <p className="mt-2">Guest mode provides limited functionality. <Button variant="link" className="p-0 h-auto text-safebite-teal" onClick={() => navigate('/auth/signup')}>Sign up</Button> for full access.</p>
      </div>
    </div>
  );
};

export default GuestDashboard;

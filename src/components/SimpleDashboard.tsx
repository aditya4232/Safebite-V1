import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Activity, Search, Stethoscope, Brain, 
  UserCircle, ArrowRight, Zap
} from 'lucide-react';

const SimpleDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-safebite-dark-blue to-safebite-dark-blue/95 relative overflow-hidden min-h-screen">
      {/* Development banner */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 text-white py-1 px-4 flex items-center justify-center z-50 text-xs font-medium">
        <Sparkles className="h-3 w-3 text-yellow-300 mr-1.5" />
        <span>SafeBite v3.0 - Production Ready</span>
        <Sparkles className="h-3 w-3 text-yellow-300 ml-1.5" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 p-6 bg-safebite-card-bg/80 backdrop-blur-sm rounded-lg border border-safebite-teal/20 shadow-lg mt-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-safebite-text mb-1">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple animate-gradient-text">
              Welcome to SafeBite!
            </span>
          </h1>
          <p className="text-safebite-text-secondary text-sm">
            Your dashboard for health insights and food safety.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/food-search')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 w-full sm:w-auto transition-transform hover:scale-105"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Food
          </Button>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="relative z-10 mb-10 p-6 bg-safebite-card-bg/80 backdrop-blur-sm rounded-lg border border-safebite-teal/20 shadow-lg">
        <h2 className="text-2xl font-semibold text-safebite-text mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="sci-fi-card hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 bg-safebite-card-bg-alt border-safebite-teal/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Search className="mr-2 h-5 w-5 text-safebite-teal" />
                Food Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Look up foods for nutrition facts and safety insights.
              </p>
              <Button
                onClick={() => navigate('/food-search')}
                className="w-full sci-fi-button-alt"
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
                Health Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Use calculators for BMI, BMR, calories, and more.
              </p>
              <Button
                onClick={() => navigate('/healthbox')}
                className="w-full sci-fi-button-alt"
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
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-safebite-text-secondary mb-4 text-sm">
                Get AI-powered insights about food and nutrition.
              </p>
              <Button
                onClick={() => navigate('/food-search')}
                className="w-full sci-fi-button-alt"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Food Delivery */}
      <div className="relative z-10 mb-10">
        <Card className="sci-fi-card relative overflow-hidden border-orange-500/30 bg-safebite-card-bg-alt">
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
                  Get nutritional insights for meals from Zomato & Swiggy directly within SafeBite.
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
        <p className="mt-2">
          <Button 
            variant="link" 
            className="p-0 h-auto text-safebite-teal" 
            onClick={() => navigate('/auth/signup')}
          >
            Sign up
          </Button> for full access to all features.
        </p>
      </div>
    </div>
  );
};

export default SimpleDashboard;

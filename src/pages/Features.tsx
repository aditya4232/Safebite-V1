import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Search, Zap, Heart, BarChart2, Pizza,
  Users, Bell, Shield, Scan, Award, Sparkles
} from 'lucide-react';
import PublicNavbar from '@/components/PublicNavbar';
import Footer from '@/components/Footer';

const Features = () => {
  const features = [
    {
      title: "Food Search & Analysis",
      description: "Search for any food item across multiple databases to get comprehensive nutritional information. Scan barcodes for instant product details.",
      icon: <Search className="h-10 w-10 text-safebite-teal" />,
      color: "bg-safebite-teal/10",
      border: "border-safebite-teal/30"
    },
    {
      title: "Personalized Health Dashboard",
      description: "View your nutrition stats, track progress, and get insights tailored to your health goals and dietary preferences.",
      icon: <BarChart2 className="h-10 w-10 text-purple-500" />,
      color: "bg-purple-500/10",
      border: "border-purple-500/30"
    },
    {
      title: "Weekly Health Check-ins",
      description: "Answer simple questions about your week to track progress and receive updated recommendations based on your habits.",
      icon: <Heart className="h-10 w-10 text-red-500" />,
      color: "bg-red-500/10",
      border: "border-red-500/30"
    },
    {
      title: "Food Safety Alerts",
      description: "Get warnings about ingredients that may affect your health goals or conflict with dietary restrictions and allergies.",
      icon: <Shield className="h-10 w-10 text-yellow-500" />,
      color: "bg-yellow-500/10",
      border: "border-yellow-500/30"
    },
    {
      title: "Barcode Scanner",
      description: "Quickly scan product barcodes to get instant nutritional information and safety alerts for packaged foods.",
      icon: <Scan className="h-10 w-10 text-blue-500" />,
      color: "bg-blue-500/10",
      border: "border-blue-500/30"
    },
    {
      title: "Recipe Recommendations",
      description: "Discover healthy recipes tailored to your dietary preferences, restrictions, and health goals.",
      icon: <Pizza className="h-10 w-10 text-green-500" />,
      color: "bg-green-500/10",
      border: "border-green-500/30"
    },
    {
      title: "Community Support",
      description: "Connect with others on similar health journeys, share experiences, and get motivation from the SafeBite community.",
      icon: <Users className="h-10 w-10 text-indigo-500" />,
      color: "bg-indigo-500/10",
      border: "border-indigo-500/30"
    },
    {
      title: "Smart Notifications",
      description: "Receive timely reminders for health check-ins, meal planning suggestions, and personalized health tips.",
      icon: <Bell className="h-10 w-10 text-pink-500" />,
      color: "bg-pink-500/10",
      border: "border-pink-500/30"
    },
    {
      title: "Health Achievements",
      description: "Earn badges and track achievements as you make progress toward your health and nutrition goals.",
      icon: <Award className="h-10 w-10 text-amber-500" />,
      color: "bg-amber-500/10",
      border: "border-amber-500/30"
    },
    {
      title: "AI-Powered Recommendations",
      description: "Get intelligent food and activity suggestions based on your profile, preferences, and progress data.",
      icon: <Sparkles className="h-10 w-10 text-cyan-500" />,
      color: "bg-cyan-500/10",
      border: "border-cyan-500/30"
    },
    {
      title: "Comprehensive Reports",
      description: "Access detailed reports on your nutrition, activity, and progress over time with visual charts and insights.",
      icon: <BarChart2 className="h-10 w-10 text-emerald-500" />,
      color: "bg-emerald-500/10",
      border: "border-emerald-500/30"
    },
    {
      title: "Energy Tracking",
      description: "Monitor your energy levels in relation to your diet and activity to optimize your daily routine.",
      icon: <Zap className="h-10 w-10 text-orange-500" />,
      color: "bg-orange-500/10",
      border: "border-orange-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <PublicNavbar />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">SafeBite Features</span>
          </h1>
          <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
            Discover all the powerful tools and features that make SafeBite your ultimate companion for healthier food choices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className={`sci-fi-card border ${feature.border} hover:shadow-lg transition-shadow`}>
              <CardHeader className={`${feature.color} rounded-t-lg`}>
                <div className="flex items-center">
                  {feature.icon}
                  <CardTitle className="ml-3 text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-safebite-text-secondary">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-safebite-card-bg border border-safebite-card-bg-alt rounded-lg p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-safebite-text mb-2">Special Project Information</h2>
            <p className="text-safebite-text-secondary">
              SafeBite is a special engineering project developed by Aditya Shenvi at IFHE Hyderabad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-medium text-safebite-text mb-3">Project Goals</h3>
              <ul className="space-y-2 text-safebite-text-secondary">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Create an intuitive platform for food nutrition analysis</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Provide personalized health recommendations based on user data</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Integrate multiple food databases for comprehensive information</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Develop a user-friendly interface with modern design principles</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-medium text-safebite-text mb-3">Technical Implementation</h3>
              <ul className="space-y-2 text-safebite-text-secondary">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>React & TypeScript frontend with Tailwind CSS for styling</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Firebase authentication and Firestore database</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Integration with multiple food nutrition APIs</span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-2 mt-0.5">✓</div>
                  <span>Data visualization using Recharts library</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-safebite-text-secondary mb-6">
            Ready to experience all these features and start your journey to healthier eating?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth/signup">
              <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" className="sci-fi-button w-full sm:w-auto">
                Learn About the Project
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Features;

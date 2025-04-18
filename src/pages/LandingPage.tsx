import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase'; // Corrected path
import { Button } from "@/components/ui/button";
import DevPopup from "@/components/DevPopup";
import ProfileImage from "@/components/ProfileImage";
import {
  Shield, Brain, Heart, Zap, Search, ArrowRight,
  Users, BarChart, Clock, Star, LogIn, Info, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';
import HeroImage from '@/components/HeroImage';
import ParticleBackground from '@/components/ParticleBackground';
import FloatingActionButton from '@/components/FloatingActionButton';
import QuickSearchDemo from '@/components/QuickSearchDemo';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showDevPopup, setShowDevPopup] = useState(false);
  const [user] = useAuthState(auth); // Get user auth state

  return (
    <div className="min-h-screen flex flex-col relative">
      <ParticleBackground />
      <Navbar />
      <DevPopup isOpen={showDevPopup} onClose={() => setShowDevPopup(false)} />
      {/* Conditionally render FloatingActionButton only for logged-in users */}
      {user && <FloatingActionButton />}

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-10 md:mb-0">
            {/* Removed animate-pulse */}
            <div className="inline-block bg-safebite-teal text-safebite-dark-blue px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-md">
              Version 2.5 - Production Ready
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text animate-gradient-text">Safe Food Choices</span><br />
              <span className="text-safebite-text">for a Healthier You</span>
            </h1>
            <p className="text-safebite-text-secondary text-lg mb-8">
              Know exactly what's in your food. Track nutrition, receive personalized recommendations, and make informed choices for your health journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Added hover scale effect */}
              <Button
                onClick={() => navigate('/auth/signup')}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 text-lg px-8 py-4 rounded-md shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {/* Added hover scale effect */}
              <Button
                variant="outline"
                onClick={() => navigate('/auth/login?guest=true')}
                className="sci-fi-button text-lg px-8 py-4 rounded-md hover:scale-105 transition-transform duration-200"
                >
                <LogIn className="mr-2 h-5 w-5" />
                Guest Login
              </Button>
            </div>
            <div className="mt-4">
              <QuickSearchDemo />
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <HeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="sci-fi-card">
          <div className="text-center mb-16">
            <div className="inline-block bg-safebite-teal/10 text-safebite-teal px-4 py-2 rounded-full text-sm font-medium mb-4 border border-safebite-teal/20">
              Powered by AI & Machine Learning
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text animate-gradient-text">
              Intelligent Food Safety
            </h2>
            <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with nutritional science to help you make the best food choices.
            </p>
            <div className="flex items-center justify-center mt-4">
              <ProfileImage size="sm" className="mr-2" />
              <p className="text-safebite-teal text-sm">
                A Special Engineering Project by <span className="font-medium">Aditya Shenvi</span> at IFHE Hyderabad
              </p>
            </div>
          </div>

          <div className="mb-12">
            <div className="p-6 border border-safebite-teal/30 rounded-lg bg-safebite-card-bg mb-8 sci-fi-card shadow-neon-teal">
              <h3 className="text-xl font-semibold text-safebite-text mb-4 flex items-center">
                <Star className="mr-2 h-5 w-5 text-safebite-teal" />
                Featured Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard
                  title="Food Safety Analysis"
                  description="Instantly analyze food products for additives, allergens, and harmful ingredients to make safe choices."
                  icon={<Shield size={24} />}
                  className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
                />
                <FeatureCard
                  title="AI-Powered Recommendations"
                  description="Receive personalized food suggestions based on your health profile, preferences, and goals."
                  icon={<Brain size={24} />}
                  className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
                />
                <FeatureCard
                  title="Nutritional Tracking"
                  description="Monitor your daily intake of calories, macros, vitamins, and minerals with detailed insights."
                  icon={<Heart size={24} />}
                  className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Added hover:shadow-neon-teal */}
              <FeatureCard
                title="Simple Food Search"
                description="Search or scan barcodes to instantly access comprehensive food information and safety ratings."
                icon={<Search size={24} />}
                className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
              />
              {/* Added hover:shadow-neon-teal */}
              <FeatureCard
                title="Health Goal Setting"
                description="Set personalized health goals and track your progress with interactive charts and reports."
                icon={<BarChart size={24} />}
                className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
              />
              {/* Added hover:shadow-neon-teal */}
              <FeatureCard
                title="Community Support"
                description="Connect with like-minded individuals, share experiences, and get motivation from our community."
                icon={<Users size={24} />}
                className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
              />
              {/* Added hover:shadow-neon-teal */}
              <FeatureCard
                title="Weekly Health Check-ins"
                description="Answer simple questions about your week to track progress and receive updated recommendations."
                icon={<Clock size={24} />}
                className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
              />
              {/* Added hover:shadow-neon-teal */}
              <FeatureCard
                title="Personalized Dashboard"
                description="View your nutrition stats, track progress, and get insights tailored to your health goals."
                icon={<Zap size={24} />}
                className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
              />
              {/* Added hover:shadow-neon-teal */}
              <FeatureCard
                title="Food Tracker"
                description="Add foods to your daily tracker to monitor your nutrition intake and stay on target with your goals."
                icon={<Zap size={24} />}
                className="hover:border-safebite-teal/50 transition-all duration-300 hover:shadow-neon-teal"
              />
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={() => navigate('/features')}
              variant="outline"
              className="sci-fi-button hover:shadow-neon-teal transition-all duration-300"
            >
              View All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-safebite-card-bg relative sci-fi-card">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 L40 20 M20 0 L20 40" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-safebite-teal" />
          </svg>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-safebite-teal/10 text-safebite-teal px-4 py-2 rounded-full text-sm font-medium mb-4 border border-safebite-teal/20">
              Simple 3-Step Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text animate-gradient-text">
              How SafeBite Works
            </h2>
            <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
              Getting started is easy. Three simple steps to transform your food choices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="sci-fi-card text-center relative hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 group">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center font-bold text-xl shadow-neon-teal group-hover:scale-110 transition-transform duration-300">1</div>
              <div className="mb-6 mx-auto text-safebite-teal group-hover:scale-110 transition-transform duration-300">
                <Users size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-safebite-text group-hover:text-safebite-teal transition-colors duration-300">Create Your Profile</h3>
              <p className="text-safebite-text-secondary">
                Sign up and complete a short questionnaire about your health, dietary needs, and personal goals.
              </p>
            </div>

            <div className="sci-fi-card text-center relative hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 group">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center font-bold text-xl shadow-neon-teal group-hover:scale-110 transition-transform duration-300">2</div>
              <div className="mb-6 mx-auto text-safebite-teal group-hover:scale-110 transition-transform duration-300">
                <Search size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-safebite-text group-hover:text-safebite-teal transition-colors duration-300">Search & Analyze</h3>
              <p className="text-safebite-text-secondary">
                Search for food items or scan barcodes to instantly get detailed nutrition and safety information.
              </p>
            </div>

            <div className="sci-fi-card text-center relative hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50 group">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center font-bold text-xl shadow-neon-teal group-hover:scale-110 transition-transform duration-300">3</div>
              <div className="mb-6 mx-auto text-safebite-teal group-hover:scale-110 transition-transform duration-300">
                <Zap size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-safebite-text group-hover:text-safebite-teal transition-colors duration-300">Track & Improve</h3>
              <p className="text-safebite-text-secondary">
                Track your nutrition, view progress charts, and receive personalized recommendations to improve your health.
              </p>
            </div>
          </div>
          {/* Removed Developer Note box from here */}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 sci-fi-card">
        <div className="text-center mb-16">
          <div className="inline-block bg-safebite-teal/10 text-safebite-teal px-4 py-2 rounded-full text-sm font-medium mb-4 border border-safebite-teal/20">
            User Experiences
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text animate-gradient-text">
            What Our Users Say
          </h2>
          <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
            Join thousands of satisfied users who have transformed their health with SafeBite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="SafeBite completely changed how I shop for groceries. I've discovered so many healthier alternatives to my favorite foods!"
            author="Sarah M."
            role="SafeBite User"
            className="hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50"
          />
          <TestimonialCard
            quote="As someone with multiple food allergies, this app has been a lifesaver. I can quickly check if a product is safe for me to eat."
            author="James K."
            role="SafeBite User"
            className="hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50"
          />
          <TestimonialCard
            quote="The personalized recommendations are spot on! I've lost 15 pounds just by making smarter food choices with SafeBite."
            author="Monica R."
            role="SafeBite User"
            className="hover:shadow-neon-teal transition-all duration-300 hover:border-safebite-teal/50"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-safebite-card-bg border-y border-safebite-teal/20 relative sci-fi-card">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="circuit-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M50 0 L50 20 M0 50 L20 50 M50 80 L50 100 M80 50 L100 50" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuit-pattern)" className="text-safebite-teal" />
          </svg>
        </div>
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block bg-safebite-teal/10 text-safebite-teal px-4 py-2 rounded-full text-sm font-medium mb-4 border border-safebite-teal/20">
            Get Started Today
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text animate-gradient-text">
            Ready to Transform Your Food Choices?
          </h2>
          <p className="text-safebite-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Join SafeBite today and start your journey to better health through informed food choices. It's free to get started!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth/signup')}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 text-lg px-8 py-6 shadow-neon-teal"
            >
              Sign Up Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/auth/login?guest=true')}
              className="sci-fi-button text-lg px-8 py-6"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Try as Guest
            </Button>
          </div>
        </div>
      </section>

      {/* Developer Note Section (Moved from "How It Works") */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
         <div className="bg-safebite-dark-blue p-6 rounded-lg border border-safebite-teal/30 sci-fi-card shadow-neon-teal">
            <div className="flex flex-col md:flex-row items-center md:items-start mb-4">
              <ProfileImage size="md" className="mr-0 md:mr-3 mb-4 md:mb-0 flex-shrink-0" />
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-safebite-text text-center md:text-left">Developer's Note</h3>
                    <p className="text-safebite-teal text-sm text-center md:text-left">Aditya Shenvi | IFHE Hyderabad</p>
                  </div>
                   <div className="mt-2 sm:mt-0 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-medium self-center md:self-auto">
                     Production Ready v2.5
                   </div>
                </div>
                <p className="text-safebite-text-secondary my-4 text-sm md:text-base">
                  SafeBite was developed as a special engineering project to demonstrate how technology can help people make better food choices.
                  The application combines modern web technologies with nutritional science to create an intuitive platform for food analysis and health tracking.
                  This release includes fixes to the AI chatbot, improved icon positioning, and overall stability improvements.
                </p>

                {/* Tech Stack & Changelog */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
                  {/* Tech Stack */}
                  <div className="lg:col-span-1 bg-safebite-card-bg-alt p-4 rounded-lg border border-safebite-teal/20">
                     <h4 className="text-safebite-teal font-medium mb-3 text-center">Tech Stack</h4>
                     <div className="flex flex-wrap gap-2 justify-center">
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">React</span>
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">TypeScript</span>
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">Firebase</span>
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">Tailwind CSS</span>
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">MongoDB</span>
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">Flask</span>
                       <span className="px-3 py-1 bg-safebite-card-bg rounded-full text-xs text-safebite-teal border border-safebite-teal/20 hover:bg-safebite-teal/20 transition-colors cursor-default">Food APIs</span>
                     </div>
                  </div>

                  {/* Changelog */}
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-safebite-card-bg-alt p-4 rounded-lg border border-safebite-teal/20">
                       <h4 className="text-safebite-teal font-medium mb-2">New Features</h4>
                       <ul className="text-safebite-text-secondary space-y-1 text-sm">
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>Enhanced AI chatbot with Gemini</span></li>
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>Weekly health check-in</span></li>
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>Improved dashboard with charts</span></li>
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>Health data visualization</span></li>
                       </ul>
                     </div>
                     <div className="bg-safebite-card-bg-alt p-4 rounded-lg border border-safebite-teal/20">
                       <h4 className="text-safebite-teal font-medium mb-2">Technical Improvements</h4>
                       <ul className="text-safebite-text-secondary space-y-1 text-sm">
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>MongoDB integration</span></li>
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>User activity tracking</span></li>
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>Firebase security</span></li>
                         <li className="flex items-start"><span className="text-safebite-teal mr-2">•</span><span>Enhanced UI/UX</span></li>
                       </ul>
                     </div>
                  </div>
                </div>

                <p className="text-safebite-text-secondary text-sm md:text-base">
                  Thank you for your support and feedback! I'm committed to improving SafeBite further.
                </p>

                 <div className="mt-6 flex justify-center">
                   <Button
                     variant="outline"
                     className="sci-fi-button"
                     onClick={() => setShowDevPopup(true)}
                   >
                     <Info className="mr-2 h-4 w-4" />
                     View Full Changelog
                   </Button>
                 </div>
              </div>
            </div>
          </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

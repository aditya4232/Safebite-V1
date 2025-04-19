import React from 'react';
import { Shield, Zap, Heart, Search, ShoppingCart, Utensils, Apple, Salad, Coffee, Pizza, Sparkles, Brain } from 'lucide-react';

const HeroImage: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[450px]">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-safebite-teal/30 to-transparent rounded-xl blur-xl"></div>

      {/* Main device frame */}
      <div className="absolute inset-0 rounded-xl border-2 border-safebite-teal/50 bg-safebite-dark-blue/80 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(20,184,166,0.3)]">
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="circuit" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M10 0 L10 10 L0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M40 0 L40 40 L0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M25 0 L25 25 L0 25" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="10" cy="10" r="1" fill="currentColor" />
              <circle cx="25" cy="25" r="1" fill="currentColor" />
              <circle cx="40" cy="40" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#circuit)" className="text-safebite-teal" />
          </svg>
        </div>

        {/* App UI mockup */}
        <div className="absolute inset-4 flex flex-col rounded-lg border border-safebite-card-bg-alt bg-safebite-card-bg overflow-hidden">
          {/* App header */}
          <div className="bg-safebite-card-bg-alt p-3 border-b border-safebite-card-bg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal">
                <Shield size={16} />
              </div>
              <span className="ml-2 font-semibold text-safebite-text">SafeBite Dashboard</span>
            </div>
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          </div>

          {/* App content */}
          <div className="flex-1 p-4">
            {/* Welcome message */}
            <div className="mb-4 bg-safebite-teal/10 p-3 rounded-lg border border-safebite-teal/20">
              <div className="flex items-center">
                <Sparkles size={18} className="text-safebite-teal mr-2" />
                <h3 className="text-sm font-medium text-safebite-text">Welcome to SafeBite 3.0</h3>
              </div>
              <p className="text-xs text-safebite-text-secondary mt-1">Your personalized health dashboard is ready</p>
            </div>

            {/* Search bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-safebite-text-secondary" />
              </div>
              <div className="w-full h-10 pl-10 pr-4 bg-safebite-card-bg-alt rounded-md border border-safebite-card-bg-alt text-sm text-safebite-text-secondary flex items-center">
                Search for food products...
              </div>
            </div>

            {/* Dashboard cards */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-safebite-card-bg-alt rounded-md p-3 border border-safebite-teal/20">
                <div className="flex items-center mb-2">
                  <Heart size={16} className="text-safebite-teal mr-2" />
                  <span className="text-xs font-medium text-safebite-text">Health Score</span>
                </div>
                <div className="text-lg font-bold text-safebite-teal">87<span className="text-xs text-safebite-text-secondary">/100</span></div>
                <div className="w-full h-1.5 bg-safebite-dark-blue rounded-full mt-2">
                  <div className="h-full bg-safebite-teal rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>

              <div className="bg-safebite-card-bg-alt rounded-md p-3 border border-safebite-teal/20">
                <div className="flex items-center mb-2">
                  <Brain size={16} className="text-safebite-teal mr-2" />
                  <span className="text-xs font-medium text-safebite-text">AI Insights</span>
                </div>
                <div className="text-lg font-bold text-safebite-teal">5<span className="text-xs text-safebite-text-secondary"> new</span></div>
                <div className="w-full h-1.5 bg-safebite-dark-blue rounded-full mt-2">
                  <div className="h-full bg-safebite-teal rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <h3 className="text-xs font-medium text-safebite-text-secondary mb-2">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-safebite-card-bg-alt rounded-md p-2 border border-safebite-teal/20 flex flex-col items-center justify-center">
                  <ShoppingCart size={16} className="text-safebite-teal mb-1" />
                  <span className="text-[10px] text-safebite-text-secondary">Grocery</span>
                </div>
                <div className="bg-safebite-card-bg-alt rounded-md p-2 border border-safebite-teal/20 flex flex-col items-center justify-center">
                  <Utensils size={16} className="text-safebite-teal mb-1" />
                  <span className="text-[10px] text-safebite-text-secondary">Recipes</span>
                </div>
                <div className="bg-safebite-card-bg-alt rounded-md p-2 border border-safebite-teal/20 flex flex-col items-center justify-center">
                  <Pizza size={16} className="text-safebite-teal mb-1" />
                  <span className="text-[10px] text-safebite-text-secondary">Delivery</span>
                </div>
                <div className="bg-safebite-card-bg-alt rounded-md p-2 border border-safebite-teal/20 flex flex-col items-center justify-center">
                  <Zap size={16} className="text-safebite-teal mb-1" />
                  <span className="text-[10px] text-safebite-text-secondary">Health</span>
                </div>
              </div>
            </div>

            {/* Food items */}
            <h3 className="text-xs font-medium text-safebite-text-secondary mb-2">Recent Food Items</h3>
            <div className="space-y-2 mb-4">
              <div className="bg-safebite-card-bg-alt rounded-md p-2 border border-safebite-teal/20 flex items-center">
                <div className="w-10 h-10 rounded-md bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-3">
                  <Salad size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-safebite-text">Mediterranean Salad</div>
                  <div className="text-[10px] text-safebite-text-secondary">320 calories • High protein • Low carb</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-safebite-teal flex items-center justify-center text-safebite-dark-blue font-bold text-xs">
                  9.5
                </div>
              </div>

              <div className="bg-safebite-card-bg-alt rounded-md p-2 border border-safebite-teal/20 flex items-center">
                <div className="w-10 h-10 rounded-md bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-3">
                  <Apple size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-safebite-text">Organic Apple</div>
                  <div className="text-[10px] text-safebite-text-secondary">95 calories • High fiber • Vitamin C</div>
                </div>
                <div className="w-7 h-7 rounded-full bg-safebite-teal flex items-center justify-center text-safebite-dark-blue font-bold text-xs">
                  9.8
                </div>
              </div>
            </div>

            {/* Animated typing indicator */}
            <div className="bg-safebite-card-bg-alt rounded-md p-3 border border-safebite-teal/20 flex items-start">
              <div className="w-8 h-8 rounded-full bg-safebite-teal/20 flex items-center justify-center text-safebite-teal mr-3">
                AI
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-safebite-text mb-1">AI Assistant</div>
                <div className="text-xs text-safebite-text-secondary">
                  Based on your recent meals, I recommend increasing your fiber intake. Consider adding more...
                  <span className="inline-block w-1.5 h-3 bg-safebite-teal ml-1 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech dots at corners */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-safebite-teal rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-safebite-teal rounded-full animate-pulse"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-safebite-teal rounded-full animate-pulse"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-safebite-teal rounded-full animate-pulse"></div>
      </div>

      {/* Version badge */}
      <div className="absolute -top-3 -right-3 bg-safebite-teal text-safebite-dark-blue text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
        v3.0
      </div>

      {/* Floating features */}
      <div className="absolute -left-4 top-1/4 bg-safebite-card-bg border border-safebite-teal/30 rounded-lg p-2 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-float">
        <Shield size={20} className="text-safebite-teal" />
      </div>
      <div className="absolute -right-4 top-2/4 bg-safebite-card-bg border border-safebite-teal/30 rounded-lg p-2 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-float-delay">
        <Heart size={20} className="text-safebite-teal" />
      </div>
      <div className="absolute -left-4 bottom-1/4 bg-safebite-card-bg border border-safebite-teal/30 rounded-lg p-2 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-float-delay-2">
        <Zap size={20} className="text-safebite-teal" />
      </div>
      <div className="absolute -right-4 bottom-1/3 bg-safebite-card-bg border border-safebite-teal/30 rounded-lg p-2 shadow-[0_0_10px_rgba(20,184,166,0.2)] animate-float">
        <Coffee size={20} className="text-safebite-teal" />
      </div>
    </div>
  );
};

export default HeroImage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Tag, Clock, Check, Bug, Sparkles,
  Rocket, Zap, Shield, Heart, MessageSquare, Bell,
  Map, Truck, Award, Settings
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'security';
    title: string;
    description: string;
    icon?: React.ReactNode;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: '3.0',
    date: '2023-07-15',
    title: 'Major Update: Enhanced User Experience',
    description: 'This release focuses on improving the overall user experience with location-based food delivery, enhanced AI chatbot, and a unified notification system.',
    changes: [
      {
        type: 'feature',
        title: 'Location-Based Food Delivery',
        description: 'Added location-based restaurant recommendations with distance information in kilometers.',
        icon: <Map className="h-4 w-4 text-blue-400" />
      },
      {
        type: 'feature',
        title: 'Enhanced AI Chatbot',
        description: 'Completely redesigned chatbot with context awareness, typing indicators, voice input/output, and personalized suggestions.',
        icon: <MessageSquare className="h-4 w-4 text-green-400" />
      },
      {
        type: 'feature',
        title: 'Unified Notification System',
        description: 'New notification center with categorized notifications, filtering, and batch actions.',
        icon: <Bell className="h-4 w-4 text-amber-400" />
      },
      {
        type: 'feature',
        title: 'Achievement Badges',
        description: 'Added achievement badges system to track user progress and engagement.',
        icon: <Award className="h-4 w-4 text-purple-400" />
      },
      {
        type: 'improvement',
        title: 'Improved Authentication Persistence',
        description: 'Fixed issues with users getting logged out when refreshing the page.',
        icon: <Shield className="h-4 w-4 text-teal-400" />
      },
      {
        type: 'improvement',
        title: 'Responsive Design Enhancements',
        description: 'Improved mobile responsiveness across all pages and components.',
        icon: <Zap className="h-4 w-4 text-pink-400" />
      },
      {
        type: 'fix',
        title: 'UI Bug Fixes',
        description: 'Fixed overlapping notifications, icon positioning, and other minor UI issues.',
        icon: <Bug className="h-4 w-4 text-red-400" />
      },
      {
        type: 'improvement',
        title: 'Performance Optimizations',
        description: 'Improved loading times and overall application performance.',
        icon: <Rocket className="h-4 w-4 text-orange-400" />
      }
    ]
  },
  {
    version: '2.5',
    date: '2023-06-01',
    title: 'Weekly Health Check-in & Dashboard Improvements',
    description: 'This release introduces weekly health check-ins and improved dashboard visualizations.',
    changes: [
      {
        type: 'feature',
        title: 'Weekly Health Check-in',
        description: 'Added weekly questionnaire to track health progress and provide personalized recommendations.',
        icon: <ClipboardCheck className="h-4 w-4 text-green-400" />
      },
      {
        type: 'feature',
        title: 'Enhanced Dashboard Charts',
        description: 'Improved dashboard with interactive charts and visualizations for health data.',
        icon: <BarChart2 className="h-4 w-4 text-blue-400" />
      },
      {
        type: 'feature',
        title: 'Health Data Visualization',
        description: 'Added detailed visualizations for weight, activity, and nutrition data.',
        icon: <Activity className="h-4 w-4 text-purple-400" />
      },
      {
        type: 'improvement',
        title: 'AI Chatbot with Gemini',
        description: 'Upgraded AI chatbot to use Google Gemini for more accurate and helpful responses.',
        icon: <Bot className="h-4 w-4 text-teal-400" />
      },
      {
        type: 'improvement',
        title: 'User Activity Tracking',
        description: 'Enhanced user activity tracking for better personalization.',
        icon: <History className="h-4 w-4 text-amber-400" />
      },
      {
        type: 'fix',
        title: 'Firebase Security',
        description: 'Improved Firebase security rules and authentication flow.',
        icon: <Shield className="h-4 w-4 text-red-400" />
      }
    ]
  },
  {
    version: '2.0',
    date: '2023-04-15',
    title: 'Food Delivery Integration & UI Refresh',
    description: 'This release introduces food delivery integration and a refreshed user interface.',
    changes: [
      {
        type: 'feature',
        title: 'Food Delivery Integration',
        description: 'Added integration with food delivery services to search and order food.',
        icon: <Truck className="h-4 w-4 text-orange-400" />
      },
      {
        type: 'feature',
        title: 'UI Refresh',
        description: 'Completely redesigned user interface with a modern sci-fi aesthetic.',
        icon: <Sparkles className="h-4 w-4 text-pink-400" />
      },
      {
        type: 'feature',
        title: 'Nutrition Search',
        description: 'Enhanced nutrition search with detailed information and recommendations.',
        icon: <Search className="h-4 w-4 text-green-400" />
      },
      {
        type: 'improvement',
        title: 'Recipe Recommendations',
        description: 'Improved recipe recommendations based on user preferences and health goals.',
        icon: <Utensils className="h-4 w-4 text-blue-400" />
      },
      {
        type: 'improvement',
        title: 'User Settings',
        description: 'Added more user settings for customization and personalization.',
        icon: <Settings className="h-4 w-4 text-purple-400" />
      },
      {
        type: 'fix',
        title: 'Performance Improvements',
        description: 'Fixed performance issues and improved loading times.',
        icon: <Zap className="h-4 w-4 text-amber-400" />
      }
    ]
  }
];

// Import icons used in the changelog
import { 
  ClipboardCheck, BarChart2, Activity, Bot, 
  History, Search, Utensils 
} from 'lucide-react';

const Changelog = () => {
  return (
    <div className="min-h-screen flex flex-col bg-safebite-dark-blue">
      <Navbar />
      
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-safebite-text mb-2">Changelog</h1>
            <p className="text-safebite-text-secondary">
              A detailed history of updates and improvements to SafeBite
            </p>
          </div>
          <Button variant="outline" className="sci-fi-button" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="space-y-12">
          {changelogData.map((entry, index) => (
            <div key={entry.version} className="sci-fi-card p-6 bg-safebite-card-bg border border-safebite-teal/20 rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex items-center mb-2 sm:mb-0">
                  <div className="bg-safebite-teal/10 text-safebite-teal p-2 rounded-full mr-3">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-safebite-text">Version {entry.version}</h2>
                    <div className="flex items-center text-xs text-safebite-text-secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {entry.date}
                    </div>
                  </div>
                </div>
                <Badge className="bg-safebite-teal text-safebite-dark-blue">
                  {index === 0 ? 'Latest' : 'Previous'}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-safebite-text mb-2">{entry.title}</h3>
              <p className="text-safebite-text-secondary mb-6">{entry.description}</p>
              
              <Separator className="mb-6 bg-safebite-card-bg-alt" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.changes.map((change, changeIndex) => (
                  <div 
                    key={changeIndex} 
                    className={`p-4 rounded-lg border ${
                      change.type === 'feature' ? 'border-green-500/20 bg-green-500/5' :
                      change.type === 'improvement' ? 'border-blue-500/20 bg-blue-500/5' :
                      change.type === 'fix' ? 'border-amber-500/20 bg-amber-500/5' :
                      'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                        change.type === 'feature' ? 'bg-green-500/20' :
                        change.type === 'improvement' ? 'bg-blue-500/20' :
                        change.type === 'fix' ? 'bg-amber-500/20' :
                        'bg-red-500/20'
                      }`}>
                        {change.icon || (
                          change.type === 'feature' ? <Sparkles className="h-4 w-4 text-green-400" /> :
                          change.type === 'improvement' ? <Zap className="h-4 w-4 text-blue-400" /> :
                          change.type === 'fix' ? <Bug className="h-4 w-4 text-amber-400" /> :
                          <Shield className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-safebite-text">{change.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              change.type === 'feature' ? 'border-green-500/30 text-green-400' :
                              change.type === 'improvement' ? 'border-blue-500/30 text-blue-400' :
                              change.type === 'fix' ? 'border-amber-500/30 text-amber-400' :
                              'border-red-500/30 text-red-400'
                            }`}
                          >
                            {change.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-safebite-text-secondary mt-1">{change.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-safebite-text-secondary mb-4">
            Have suggestions for future updates? We'd love to hear from you!
          </p>
          <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Feedback
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Changelog;

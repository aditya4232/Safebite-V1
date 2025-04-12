import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, Search, Book, MessageCircle, FileText, 
  Coffee, Pizza, ShoppingCart, Stethoscope, Heart, 
  Settings, User, ChevronRight, ExternalLink, Sparkles
} from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import FoodChatBot from '@/components/FoodChatBot';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from "firebase/auth";
import { app } from "../firebase";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { isGuest } = useGuestMode();
  const auth = getAuth(app);
  const user = auth.currentUser;

  // FAQ categories
  const faqCategories = [
    {
      id: 'general',
      name: 'General',
      icon: <HelpCircle className="h-4 w-4 text-safebite-teal" />,
      faqs: [
        {
          question: 'What is SafeBite?',
          answer: 'SafeBite is a comprehensive food safety and nutrition platform designed to help you make informed decisions about the food you consume. It provides nutritional information, recipe suggestions, food safety alerts, and personalized health insights.'
        },
        {
          question: 'Is SafeBite free to use?',
          answer: 'Yes, SafeBite offers a free tier with access to basic features. Premium features may require a subscription in future updates, but all current functionality is available for free.'
        },
        {
          question: 'How do I create an account?',
          answer: 'Click on the "Sign Up" button in the top navigation bar, fill in your details, and follow the verification process. You can also use the guest mode to explore the platform without creating an account, but your data won\'t be saved.'
        },
        {
          question: 'What\'s the difference between guest mode and a registered account?',
          answer: 'Guest mode allows you to explore SafeBite without creating an account, but your data won\'t be saved between sessions and some features have usage limits. A registered account gives you full access to all features, saves your preferences, and provides personalized recommendations.'
        },
        {
          question: 'How does SafeBite handle my data?',
          answer: 'SafeBite takes your privacy seriously. We only collect data necessary to provide our services and improve your experience. Your personal information is never sold to third parties. You can review our full privacy policy in the Settings page.'
        }
      ]
    },
    {
      id: 'features',
      name: 'Features',
      icon: <Sparkles className="h-4 w-4 text-safebite-teal" />,
      faqs: [
        {
          question: 'What features does SafeBite offer?',
          answer: 'SafeBite offers food search with nutritional information, recipe suggestions, food safety alerts, health tools, community features, personalized dashboard, weekly health check-ins, and an AI assistant to help with nutrition and health questions.'
        },
        {
          question: 'How do I use the AI assistant?',
          answer: 'The AI assistant is available through the chat icon in the bottom right corner of the screen. Click on it to start a conversation. You can ask questions about nutrition, food safety, recipes, or navigate to different parts of the application.'
        },
        {
          question: 'What are Health Tools?',
          answer: 'Health Tools is a collection of calculators and analyzers to help you track and understand various aspects of your health, including BMI calculator, calorie needs estimator, sleep quality analyzer, stress level assessment, and more.'
        },
        {
          question: 'How do I search for food information?',
          answer: 'Navigate to the Nutrition tab in the sidebar, then use the search bar to look up any food item. You can search by name, scan barcodes (on mobile), or upload product images for analysis.'
        },
        {
          question: 'How accurate is the nutritional information?',
          answer: 'SafeBite uses data from multiple reliable sources including government databases and verified third-party APIs. While we strive for accuracy, nutritional content can vary based on preparation methods and specific brands.'
        }
      ]
    },
    {
      id: 'account',
      name: 'Account',
      icon: <User className="h-4 w-4 text-safebite-teal" />,
      faqs: [
        {
          question: 'How do I update my profile information?',
          answer: 'Click on your profile picture in the sidebar to open the profile popup. From there, you can update your display name, email, password, and preferences.'
        },
        {
          question: 'Can I delete my account?',
          answer: 'Yes, you can delete your account from the Settings page. Please note that this action is irreversible and all your data will be permanently deleted.'
        },
        {
          question: 'How do I change my password?',
          answer: 'Click on your profile picture in the sidebar, go to the Account tab, and use the password update section to set a new password.'
        },
        {
          question: 'What happens if I forget my password?',
          answer: 'On the login page, click "Forgot Password" and follow the instructions to reset your password via email.'
        },
        {
          question: 'How do I switch between guest mode and my account?',
          answer: 'If you\'re in guest mode, you can sign up or log in through the login page. If you\'re logged in, you can sign out using the button in the sidebar.'
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical',
      icon: <Settings className="h-4 w-4 text-safebite-teal" />,
      faqs: [
        {
          question: 'Which browsers are supported?',
          answer: 'SafeBite works best on modern browsers like Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for optimal performance.'
        },
        {
          question: 'Is SafeBite available as a mobile app?',
          answer: 'Currently, SafeBite is a web application optimized for both desktop and mobile browsers. A dedicated mobile app is planned for future releases.'
        },
        {
          question: 'Why am I experiencing slow performance?',
          answer: 'Performance issues can be caused by slow internet connection, browser cache, or device limitations. Try clearing your browser cache, closing unnecessary tabs, and ensuring you have a stable internet connection.'
        },
        {
          question: 'How do I report a bug?',
          answer: 'You can report bugs through the feedback form in the Settings page or by contacting our support team directly at support@safebite.example.com.'
        },
        {
          question: 'Does SafeBite work offline?',
          answer: 'Some basic features may work offline if you\'ve previously loaded them, but most functionality requires an internet connection to access our databases and APIs.'
        }
      ]
    }
  ];

  // Guides
  const guides = [
    {
      id: 'getting-started',
      title: 'Getting Started with SafeBite',
      description: 'Learn the basics of using SafeBite to improve your nutrition and food safety.',
      icon: <Book className="h-5 w-5 text-safebite-teal" />,
      link: '/help/guides/getting-started'
    },
    {
      id: 'food-search',
      title: 'How to Search for Food Information',
      description: 'Master the food search feature to get detailed nutritional information.',
      icon: <Search className="h-5 w-5 text-safebite-teal" />,
      link: '/help/guides/food-search'
    },
    {
      id: 'recipes',
      title: 'Finding and Saving Recipes',
      description: 'Discover healthy recipes and save your favorites for quick access.',
      icon: <Pizza className="h-5 w-5 text-safebite-teal" />,
      link: '/help/guides/recipes'
    },
    {
      id: 'health-tools',
      title: 'Using Health Tools',
      description: 'Get the most out of the health calculators and analyzers.',
      icon: <Stethoscope className="h-5 w-5 text-safebite-teal" />,
      link: '/help/guides/health-tools'
    },
    {
      id: 'weekly-check',
      title: 'Weekly Health Check-ins',
      description: 'Track your progress and get personalized insights with weekly check-ins.',
      icon: <Heart className="h-5 w-5 text-safebite-teal" />,
      link: '/help/guides/weekly-check'
    },
    {
      id: 'ai-assistant',
      title: 'Chatting with the AI Assistant',
      description: 'Learn how to effectively use the AI assistant for nutrition advice.',
      icon: <MessageCircle className="h-5 w-5 text-safebite-teal" />,
      link: '/help/guides/ai-assistant'
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = searchQuery.trim() === '' 
    ? faqCategories 
    : faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.faqs.length > 0);

  // Filter guides based on search query
  const filteredGuides = searchQuery.trim() === ''
    ? guides
    : guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        guide.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle guide click
  const handleGuideClick = (guide: any) => {
    // For now, just show a message that the guide is coming soon
    alert(`The "${guide.title}" guide is coming soon!`);
  };

  return (
    <>
      {/* Development banner - Can be removed for production */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 text-white py-1 px-4 flex items-center justify-center z-50 text-xs font-medium">
        <Sparkles className="h-3 w-3 text-yellow-300 mr-1.5" />
        <span>SafeBite v2.5 - Production Ready</span>
        <Sparkles className="h-3 w-3 text-yellow-300 ml-1.5" />
      </div>

      {/* Sidebar */}
      <DashboardSidebar />

      {/* AI Chatbot */}
      <FoodChatBot 
        currentPage="help" 
        initialMessage="Hi! I can help you find answers to your questions about SafeBite. What would you like to know?" 
      />

      {/* Main content */}
      <main className="md:ml-64 min-h-screen bg-gradient-to-br from-safebite-dark-blue to-safebite-dark-blue/95 relative overflow-hidden pt-8">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 md:p-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 p-4 bg-safebite-card-bg/70 backdrop-blur-md rounded-lg border border-safebite-teal/20 shadow-md">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-3xl font-bold text-safebite-text mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-safebite-teal to-safebite-purple">
                  Help Center
                </span>
              </h1>
              <p className="text-safebite-text-secondary flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-safebite-teal/70" />
                Find answers to your questions and learn how to use SafeBite effectively.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-safebite-text-secondary h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for help topics..."
                className="pl-10 bg-safebite-card-bg/70 border-safebite-teal/20 focus:border-safebite-teal/60 text-safebite-text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="faqs" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-safebite-card-bg/70 border border-safebite-teal/20">
              <TabsTrigger value="faqs" className="data-[state=active]:bg-safebite-teal/20">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="guides" className="data-[state=active]:bg-safebite-teal/20">
                <Book className="h-4 w-4 mr-2" />
                Guides
              </TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:bg-safebite-teal/20">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Us
              </TabsTrigger>
            </TabsList>

            {/* FAQs Tab */}
            <TabsContent value="faqs" className="space-y-6">
              {searchQuery.trim() !== '' && filteredFaqs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 mx-auto text-safebite-text-secondary mb-4" />
                  <h3 className="text-xl font-medium text-safebite-text mb-2">No results found</h3>
                  <p className="text-safebite-text-secondary">
                    We couldn't find any FAQs matching your search. Try different keywords or contact us for help.
                  </p>
                </div>
              )}

              {filteredFaqs.map((category) => (
                <Card key={category.id} className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
                      {category.icon}
                      <span className="ml-2">{category.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-safebite-teal/20">
                          <AccordionTrigger className="text-safebite-text hover:text-safebite-teal">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-safebite-text-secondary">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Guides Tab */}
            <TabsContent value="guides" className="space-y-6">
              {searchQuery.trim() !== '' && filteredGuides.length === 0 && (
                <div className="text-center py-8">
                  <Book className="h-12 w-12 mx-auto text-safebite-text-secondary mb-4" />
                  <h3 className="text-xl font-medium text-safebite-text mb-2">No guides found</h3>
                  <p className="text-safebite-text-secondary">
                    We couldn't find any guides matching your search. Try different keywords or check the FAQs section.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuides.map((guide) => (
                  <Card 
                    key={guide.id} 
                    className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 cursor-pointer"
                    onClick={() => handleGuideClick(guide)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start">
                        <div className="rounded-full p-2 bg-safebite-teal/10 mr-4">
                          {guide.icon}
                        </div>
                        <div>
                          <h3 className="text-safebite-text font-medium mb-2 flex items-center">
                            {guide.title}
                            <Badge className="ml-2 bg-safebite-teal/20 text-safebite-teal text-[10px]">Coming Soon</Badge>
                          </h3>
                          <p className="text-sm text-safebite-text-secondary mb-3">
                            {guide.description}
                          </p>
                          <div className="flex items-center text-xs text-safebite-teal">
                            <span>Read guide</span>
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contact Us Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card className="sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-safebite-teal" />
                    Contact Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-safebite-teal/10 border border-safebite-teal/30 rounded-md p-4">
                    <h3 className="text-safebite-text font-medium mb-2">Need help with SafeBite?</h3>
                    <p className="text-safebite-text-secondary mb-4">
                      Our support team is here to help you with any questions or issues you may have.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <MessageCircle className="h-5 w-5 text-safebite-teal mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-safebite-text font-medium">Chat Support</h4>
                          <p className="text-sm text-safebite-text-secondary">
                            Use our AI assistant in the bottom right corner for immediate help.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-safebite-teal mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-safebite-text font-medium">Documentation</h4>
                          <p className="text-sm text-safebite-text-secondary">
                            Check our comprehensive guides and FAQs for detailed information.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-safebite-text font-medium mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-24 text-safebite-text-secondary">Email:</div>
                        <a href="mailto:support@safebite.example.com" className="text-safebite-teal hover:underline flex items-center">
                          support@safebite.example.com
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-safebite-text-secondary">Twitter:</div>
                        <a href="https://twitter.com/safebite" target="_blank" rel="noopener noreferrer" className="text-safebite-teal hover:underline flex items-center">
                          @safebite
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 text-safebite-text-secondary">GitHub:</div>
                        <a href="https://github.com/safebite" target="_blank" rel="noopener noreferrer" className="text-safebite-teal hover:underline flex items-center">
                          github.com/safebite
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-safebite-card-bg-alt">
                    <h3 className="text-safebite-text font-medium mb-4">Feedback</h3>
                    <p className="text-safebite-text-secondary mb-4">
                      We're constantly improving SafeBite based on your feedback. Let us know what you think!
                    </p>
                    <Button className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80">
                      Send Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default Help;

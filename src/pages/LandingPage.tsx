
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Shield, Brain, Heart, Zap, Search, ArrowRight, 
  Users, BarChart, Clock 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import TestimonialCard from '@/components/TestimonialCard';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="gradient-text">Safe Food Choices</span><br />
              <span className="text-safebite-text">for a Healthier You</span>
            </h1>
            <p className="text-safebite-text-secondary text-lg mb-8">
              Know exactly what's in your food. Track nutrition, receive personalized recommendations, and make informed choices for your health journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/auth/signup')}
                className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 text-lg px-8 py-6"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/features')}
                className="sci-fi-button text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="bg-gradient-radial from-safebite-teal/20 to-transparent absolute inset-0 rounded-full blur-3xl z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
              alt="SafeBite Dashboard Preview" 
              className="relative z-10 rounded-lg border border-safebite-card-bg-alt shadow-xl"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Intelligent Food Safety
          </h2>
          <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with nutritional science to help you make the best food choices.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            title="Food Safety Analysis"
            description="Instantly analyze food products for additives, allergens, and harmful ingredients to make safe choices."
            icon={<Shield size={24} />}
          />
          <FeatureCard 
            title="AI-Powered Recommendations"
            description="Receive personalized food suggestions based on your health profile, preferences, and goals."
            icon={<Brain size={24} />}
          />
          <FeatureCard 
            title="Nutritional Tracking"
            description="Monitor your daily intake of calories, macros, vitamins, and minerals with detailed insights."
            icon={<Heart size={24} />}
          />
          <FeatureCard 
            title="Simple Food Search"
            description="Search or scan barcodes to instantly access comprehensive food information and safety ratings."
            icon={<Search size={24} />}
          />
          <FeatureCard 
            title="Health Goal Setting"
            description="Set personalized health goals and track your progress with interactive charts and reports."
            icon={<BarChart size={24} />}
          />
          <FeatureCard 
            title="Community Support"
            description="Connect with like-minded individuals, share experiences, and get motivation from our community."
            icon={<Users size={24} />}
          />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-safebite-card-bg">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              How SafeBite Works
            </h2>
            <p className="text-safebite-text-secondary text-lg max-w-3xl mx-auto">
              Getting started is easy. Three simple steps to transform your food choices.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="sci-fi-card text-center relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center font-bold text-xl">1</div>
              <div className="mb-6 mx-auto text-safebite-teal">
                <Users size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-safebite-text">Create Your Profile</h3>
              <p className="text-safebite-text-secondary">
                Sign up and complete a short questionnaire about your health, dietary needs, and personal goals.
              </p>
            </div>
            
            <div className="sci-fi-card text-center relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center font-bold text-xl">2</div>
              <div className="mb-6 mx-auto text-safebite-teal">
                <Search size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-safebite-text">Search & Analyze</h3>
              <p className="text-safebite-text-secondary">
                Search for food items or scan barcodes to instantly get detailed nutrition and safety information.
              </p>
            </div>
            
            <div className="sci-fi-card text-center relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-safebite-teal text-safebite-dark-blue flex items-center justify-center font-bold text-xl">3</div>
              <div className="mb-6 mx-auto text-safebite-teal">
                <Zap size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-safebite-text">Track & Improve</h3>
              <p className="text-safebite-text-secondary">
                Track your nutrition, view progress charts, and receive personalized recommendations to improve your health.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
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
          />
          <TestimonialCard 
            quote="As someone with multiple food allergies, this app has been a lifesaver. I can quickly check if a product is safe for me to eat."
            author="James K."
            role="SafeBite User"
          />
          <TestimonialCard 
            quote="The personalized recommendations are spot on! I've lost 15 pounds just by making smarter food choices with SafeBite."
            author="Monica R."
            role="SafeBite User"
          />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-safebite-card-bg border-y border-safebite-card-bg-alt">
        <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
            Ready to Transform Your Food Choices?
          </h2>
          <p className="text-safebite-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Join SafeBite today and start your journey to better health through informed food choices. It's free to get started!
          </p>
          <Button 
            onClick={() => navigate('/auth/signup')}
            className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80 text-lg px-8 py-6"
          >
            Sign Up Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;

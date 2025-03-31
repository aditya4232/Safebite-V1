
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Bell, Info, Zap, ArrowRight } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
import StatCard from '@/components/StatCard';
import ProgressChart from '@/components/ProgressChart';
import FoodSearchBar from '@/components/FoodSearchBar';
import FoodItemCard from '@/components/FoodItemCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showWeeklyPrompt, setShowWeeklyPrompt] = useState(false);
  const [recentFoods, setRecentFoods] = useState([
    { id: 1, name: 'Greek Yogurt', calories: 120, nutritionScore: 'green' as const },
    { id: 2, name: 'Chicken Salad', calories: 350, nutritionScore: 'green' as const },
    { id: 3, name: 'Whole Wheat Pasta', calories: 280, nutritionScore: 'yellow' as const },
    { id: 4, name: 'Chocolate Cookies', calories: 420, nutritionScore: 'red' as const },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    // Show weekly prompt after 3 seconds (for demo purposes)
    const timer = setTimeout(() => {
      setShowWeeklyPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    toast({
      title: "Search initiated",
      description: `Searching for "${query}"`,
    });
  };

  const handleScan = () => {
    console.log('Opening barcode scanner');
    toast({
      title: "Barcode Scanner",
      description: "Scanner functionality would open here",
    });
  };

  const dismissWeeklyPrompt = () => {
    setShowWeeklyPrompt(false);
  };

  const weeklyProgressData = [
    { date: 'Mon', value: 1200 },
    { date: 'Tue', value: 1350 },
    { date: 'Wed', value: 1500 },
    { date: 'Thu', value: 1400 },
    { date: 'Fri', value: 1800 },
    { date: 'Sat', value: 1600 },
    { date: 'Sun', value: 1750 },
  ];

  const weeklyWaterData = [
    { date: 'Mon', value: 5 },
    { date: 'Tue', value: 6 },
    { date: 'Wed', value: 7 },
    { date: 'Thu', value: 5 },
    { date: 'Fri', value: 4 },
    { date: 'Sat', value: 8 },
    { date: 'Sun', value: 6 },
  ];

  return (
    <div className="min-h-screen bg-safebite-dark-blue">
      <DashboardSidebar />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-safebite-text mb-2">Welcome back, Alex</h1>
              <p className="text-safebite-text-secondary">Here's your health overview for today</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline" className="mr-2 border-safebite-card-bg-alt hover:border-safebite-teal">
                <Bell className="mr-2 h-5 w-5" />
                <Badge className="ml-1 bg-safebite-teal text-safebite-dark-blue">3</Badge>
              </Button>
            </div>
          </div>

          {/* Weekly prompt modal */}
          {showWeeklyPrompt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="sci-fi-card max-w-md w-full">
                <h3 className="text-xl font-bold text-safebite-text mb-4">Weekly Health Check</h3>
                <p className="text-safebite-text-secondary mb-6">
                  Please take a moment to answer a few questions about your health this week.
                  This helps us provide better recommendations.
                </p>
                <div className="flex justify-end gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={dismissWeeklyPrompt}
                    className="text-safebite-text-secondary hover:text-safebite-text"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/weekly-questions');
                      dismissWeeklyPrompt();
                    }}
                    className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
                  >
                    Start Now
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Calories Today"
              value="1,450"
              icon={<Zap size={24} />}
              change={{ value: "12%", isPositive: true }}
            />
            <StatCard 
              title="Water Intake"
              value="1.8L"
              icon={<div className="text-blue-400">💧</div>}
              change={{ value: "2 cups", isPositive: false }}
            />
            <StatCard 
              title="Protein"
              value="85g"
              icon={<div>🥩</div>}
              change={{ value: "10%", isPositive: true }}
            />
            <StatCard 
              title="Active Minutes"
              value="45"
              icon={<div>⚡</div>}
              change={{ value: "5 min", isPositive: true }}
            />
          </div>
          
          {/* Food Safety Alert */}
          <Card className="mb-8 border-red-500 shadow-md bg-red-500/10 p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                  <Info size={28} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-red-400">Food Safety Alert</h3>
                <p className="text-safebite-text-secondary mb-2">
                  A recent product you scanned contains high levels of artificial sweeteners and preservatives that may affect your health goals.
                </p>
                <Button variant="link" className="text-red-400 hover:text-red-300 p-0">
                  View Details <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Search & Recent Foods */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-safebite-text mb-4">Food Search</h2>
            <div className="sci-fi-card">
              <FoodSearchBar 
                onSearch={handleSearch} 
                onScan={handleScan} 
                className="mb-6"
              />
              
              <div>
                <h3 className="text-xl font-semibold text-safebite-text mb-4">Recent Foods</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentFoods.map((food) => (
                    <FoodItemCard
                      key={food.id}
                      name={food.name}
                      calories={food.calories}
                      nutritionScore={food.nutritionScore}
                      onClick={() => console.log('Food clicked:', food.name)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ProgressChart 
              title="Weekly Calorie Intake" 
              data={weeklyProgressData} 
            />
            <ProgressChart 
              title="Water Intake (cups)" 
              data={weeklyWaterData} 
              color="#3b82f6"
            />
          </div>
          
          {/* Recommendations */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-safebite-text mb-4">AI Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="sci-fi-card">
                <div className="flex items-start">
                  <div className="mr-4 text-2xl">🥗</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-safebite-text">Balanced Meals</h3>
                    <p className="text-safebite-text-secondary mb-4">
                      Your protein intake is good, but you could add more leafy greens for additional vitamins and minerals.
                    </p>
                    <Button 
                      variant="outline" 
                      className="sci-fi-button"
                    >
                      View Meal Suggestions
                    </Button>
                  </div>
                </div>
              </Card>
              <Card className="sci-fi-card">
                <div className="flex items-start">
                  <div className="mr-4 text-2xl">💧</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-safebite-text">Hydration Tips</h3>
                    <p className="text-safebite-text-secondary mb-4">
                      You're behind on your water intake goal. Try setting reminders or infusing water with fruits for better taste.
                    </p>
                    <Button 
                      variant="outline" 
                      className="sci-fi-button"
                    >
                      View Hydration Tips
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

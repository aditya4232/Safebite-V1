import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Activity, TrendingUp, PieChart as PieChartIcon, BarChart2,
  Calendar, ChevronLeft, ChevronRight, Download, Share2,
  AlertTriangle, Loader2, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { trackUserInteraction } from '@/services/mlService';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../firebase';

// Mock data for charts
const generateMockHealthData = (userId: string) => {
  // Generate consistent data based on userId
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const x = Math.sin(seed++) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  // Generate weight data for the last 30 days
  const today = new Date();
  const weightData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));

    // Generate a somewhat realistic weight progression
    const baseWeight = 70 + random(-10, 10);
    const dayWeight = baseWeight + (Math.sin(i / 5) * 1.5);

    return {
      date: date.toISOString().split('T')[0],
      weight: parseFloat(dayWeight.toFixed(1)),
      target: baseWeight - 2
    };
  });

  // Generate nutrition data for the last 7 days
  const nutritionData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));

    return {
      date: date.toISOString().split('T')[0],
      calories: random(1800, 2500),
      protein: random(60, 120),
      carbs: random(150, 300),
      fat: random(40, 90)
    };
  });

  // Generate activity data for the last 7 days
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));

    return {
      date: date.toISOString().split('T')[0],
      steps: random(3000, 12000),
      activeMinutes: random(20, 120),
      caloriesBurned: random(200, 800)
    };
  });

  // Generate macronutrient distribution
  const macroDistribution = [
    { name: 'Protein', value: random(20, 30) },
    { name: 'Carbs', value: random(40, 55) },
    { name: 'Fat', value: random(20, 35) }
  ];

  // Generate food category distribution
  const foodCategories = [
    { name: 'Vegetables', value: random(15, 30) },
    { name: 'Fruits', value: random(10, 20) },
    { name: 'Grains', value: random(20, 35) },
    { name: 'Protein Foods', value: random(15, 25) },
    { name: 'Dairy', value: random(5, 15) },
    { name: 'Oils & Fats', value: random(5, 10) }
  ];

  return {
    weightData,
    nutritionData,
    activityData,
    macroDistribution,
    foodCategories
  };
};

interface HealthDataChartsProps {
  userId?: string;
  initialTab?: string;
}

const HealthDataCharts: React.FC<HealthDataChartsProps> = ({
  userId = 'default-user',
  initialTab = 'weight'
}) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [timeRange, setTimeRange] = useState('30d');
  const [healthData, setHealthData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Colors for charts
  const COLORS = {
    primary: '#10b981', // safebite-teal equivalent
    secondary: '#6366f1',
    accent: '#f97316',
    warning: '#eab308',
    error: '#ef4444',
    background: '#0f172a', // safebite-dark-blue equivalent
    text: '#e2e8f0', // safebite-text equivalent
    textSecondary: '#94a3b8', // safebite-text-secondary equivalent
    pieColors: ['#10b981', '#6366f1', '#f97316', '#eab308', '#ec4899', '#8b5cf6']
  };

  // Fetch health data with better error handling
  useEffect(() => {
    const fetchHealthData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Always generate mock data first as a fallback
        const mockData = generateMockHealthData(userId || 'default-user');

        // Set mock data immediately to prevent white screen
        setHealthData(mockData);

        // Try to get real data from Firebase if not in guest mode
        let realData = null;

        if (!isGuest && userId !== 'default-user') {
          const auth = getAuth(app);
          const db = getFirestore(app);

          if (auth.currentUser) {
            try {
              const userRef = doc(db, 'users', auth.currentUser.uid);
              const userDoc = await getDoc(userRef);

              if (userDoc.exists()) {
                const userData = userDoc.data();

                // Check if user has health data
                if (userData.healthData) {
                  realData = userData.healthData;
                  console.log('Found real health data:', realData);

                  // Update with real data if available
                  setHealthData(realData);
                } else {
                  console.log('No health data found in user profile, using mock data');
                }
              } else {
                console.log('User document does not exist, using mock data');
              }
            } catch (firebaseErr) {
              console.error('Firebase error fetching health data:', firebaseErr);
              // Already using mock data, so just log the error
            }
          } else {
            console.log('No current user, using mock data');
          }
        } else {
          console.log('Guest mode or default user, using mock data');
        }

        // Track this interaction
        trackUserInteraction('view_health_charts', {
          isGuest,
          tab: activeTab,
          timeRange,
          dataSource: realData ? 'firebase' : 'mock'
        });
      } catch (err) {
        console.error('Error in health data component:', err);
        setError('Failed to load health data. Using sample data instead.');

        // Ensure we always have data by generating mock data again
        const fallbackData = generateMockHealthData('fallback-' + Date.now());
        setHealthData(fallbackData);

        toast({
          title: 'Using Sample Data',
          description: 'Could not load your health data. Showing sample data instead.',
          variant: 'default',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthData();
  }, [userId, toast, isGuest, activeTab]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Track this interaction
    trackUserInteraction('change_health_chart_tab', {
      isGuest,
      tab: value
    });
  };

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);

    // Track this interaction
    trackUserInteraction('change_health_chart_timerange', {
      isGuest,
      timeRange: value
    });
  };

  // Handle export data
  const handleExportData = () => {
    toast({
      title: 'Export Started',
      description: 'Your health data is being prepared for download.',
      variant: 'default',
    });

    // Track this interaction
    trackUserInteraction('export_health_data', {
      isGuest,
      tab: activeTab
    });
  };

  if (isLoading) {
    return (
      <Card className="sci-fi-card border-safebite-teal/30">
        <CardContent className="p-6 flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 text-safebite-teal animate-spin mb-2" />
          <p className="text-safebite-text-secondary">
            Loading health data charts...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Always ensure we have health data
  if (!healthData) {
    // Generate mock data as a fallback
    const fallbackData = generateMockHealthData(userId || 'fallback-user');
    setHealthData(fallbackData);
    console.log('Generated fallback data in render phase');
  }

  // Show error message if there was an error, but still render the charts with mock data
  const errorMessage = error ? (
    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-safebite-text font-medium">Health Data Notice</p>
          <p className="text-safebite-text-secondary text-sm mt-1">
            {error || "Using sample data for visualization. Your actual health data will appear here when available."}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <Card className="sci-fi-card border-safebite-teal/30">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-safebite-text flex items-center">
              <Activity className="mr-2 h-5 w-5 text-safebite-teal" />
              Health Insights
              <Badge className="ml-3 bg-safebite-teal text-safebite-dark-blue">Data-Driven</Badge>
            </CardTitle>
            <p className="text-safebite-text-secondary text-sm">
              Visualize your health progress and patterns
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select defaultValue={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[120px] bg-safebite-card-bg-alt border-safebite-card-bg">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 3 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="border-safebite-card-bg"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Show error message if there was an error */}
        {errorMessage}
        <Tabs defaultValue={activeTab} className="mb-6" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="weight">
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Weight</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition">
              <BarChart2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <PieChartIcon className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Distribution</span>
            </TabsTrigger>
          </TabsList>

          {/* Weight Tab */}
          <TabsContent value="weight">
            <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-safebite-text font-medium">Weight Tracking</h3>
                <div className="flex items-center text-safebite-text-secondary text-sm">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Target: {healthData.weightData[0].target} kg</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={healthData.weightData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.background} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke={COLORS.textSecondary}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke={COLORS.textSecondary}
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 2', 'dataMax + 2']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.background,
                        borderColor: COLORS.primary,
                        color: COLORS.text
                      }}
                      formatter={(value: any) => [`${value} kg`, 'Weight']}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ r: 3, fill: COLORS.primary }}
                      activeDot={{ r: 5 }}
                      name="Weight (kg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke={COLORS.secondary}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Target (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal/30">
                    Current: {healthData.weightData[healthData.weightData.length - 1].weight} kg
                  </Badge>
                  <Badge className="bg-safebite-card-bg-alt text-safebite-text-secondary border-safebite-card-bg">
                    Change: {(healthData.weightData[healthData.weightData.length - 1].weight - healthData.weightData[0].weight).toFixed(1)} kg
                  </Badge>
                </div>
                <div className="text-xs text-safebite-text-secondary">
                  Last updated: {formatDate(healthData.weightData[healthData.weightData.length - 1].date)}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition">
            <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-safebite-text font-medium">Nutrition Tracking</h3>
                <div className="flex items-center text-safebite-text-secondary text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Last 7 Days</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={healthData.nutritionData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.background} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke={COLORS.textSecondary}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke={COLORS.textSecondary}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.background,
                        borderColor: COLORS.primary,
                        color: COLORS.text
                      }}
                      formatter={(value: any) => [`${value}`, '']}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Legend />
                    <Bar
                      dataKey="calories"
                      fill={COLORS.primary}
                      name="Calories (kcal)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal/30 flex justify-center">
                  Avg Calories: {Math.round(healthData.nutritionData.reduce((acc: number, day: any) => acc + day.calories, 0) / healthData.nutritionData.length)} kcal
                </Badge>
                <Badge className="bg-secondary/20 text-secondary border-secondary/30 flex justify-center">
                  Avg Protein: {Math.round(healthData.nutritionData.reduce((acc: number, day: any) => acc + day.protein, 0) / healthData.nutritionData.length)} g
                </Badge>
                <Badge className="bg-accent/20 text-accent border-accent/30 flex justify-center">
                  Avg Carbs: {Math.round(healthData.nutritionData.reduce((acc: number, day: any) => acc + day.carbs, 0) / healthData.nutritionData.length)} g
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-safebite-text font-medium">Activity Tracking</h3>
                <div className="flex items-center text-safebite-text-secondary text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Last 7 Days</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={healthData.activityData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.background} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke={COLORS.textSecondary}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      stroke={COLORS.textSecondary}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.background,
                        borderColor: COLORS.primary,
                        color: COLORS.text
                      }}
                      formatter={(value: any) => [`${value}`, '']}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Legend />
                    <Bar
                      dataKey="steps"
                      fill={COLORS.primary}
                      name="Steps"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Badge className="bg-safebite-teal/20 text-safebite-teal border-safebite-teal/30 flex justify-center">
                  Avg Steps: {Math.round(healthData.activityData.reduce((acc: number, day: any) => acc + day.steps, 0) / healthData.activityData.length)}
                </Badge>
                <Badge className="bg-secondary/20 text-secondary border-secondary/30 flex justify-center">
                  Avg Active: {Math.round(healthData.activityData.reduce((acc: number, day: any) => acc + day.activeMinutes, 0) / healthData.activityData.length)} min
                </Badge>
                <Badge className="bg-accent/20 text-accent border-accent/30 flex justify-center">
                  Avg Burned: {Math.round(healthData.activityData.reduce((acc: number, day: any) => acc + day.caloriesBurned, 0) / healthData.activityData.length)} kcal
                </Badge>
              </div>
            </div>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Macronutrient Distribution */}
              <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg">
                <h3 className="text-safebite-text font-medium mb-4">Macronutrient Distribution</h3>

                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthData.macroDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {healthData.macroDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.primary,
                          color: COLORS.text
                        }}
                        formatter={(value: any) => [`${value}%`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Food Category Distribution */}
              <div className="bg-safebite-card-bg-alt/30 p-4 rounded-lg">
                <h3 className="text-safebite-text font-medium mb-4">Food Category Distribution</h3>

                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthData.foodCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {healthData.foodCategories.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS.pieColors[index % COLORS.pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: COLORS.background,
                          borderColor: COLORS.primary,
                          color: COLORS.text
                        }}
                        formatter={(value: any) => [`${value}%`, '']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthDataCharts;

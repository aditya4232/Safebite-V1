import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface WeeklyDataChartsProps {
  weeklyData: any;
}

const WeeklyDataCharts: React.FC<WeeklyDataChartsProps> = ({ weeklyData }) => {
  if (!weeklyData || !weeklyData.answers) {
    return (
      <Card className="sci-fi-card">
        <CardContent className="p-6 text-center">
          <p className="text-safebite-text-secondary">No weekly data available. Complete your weekly check-in to see insights.</p>
        </CardContent>
      </Card>
    );
  }

  const answers = weeklyData.answers;

  // Prepare data for activity chart
  const activityData = [
    { name: 'Exercise (min)', value: answers.exercise_minutes || 0 },
    { name: 'Home Meals', value: answers.home_cooked_meals || 0 },
    { name: 'Water (cups)', value: answers.water_intake || 0 },
    { name: 'Sleep (hrs)', value: answers.sleep_hours || 0 },
  ];

  // Prepare data for nutrition chart
  const nutritionData = [
    { name: 'Fruits & Veggies', value: answers.fruit_vegetable_servings || 0 },
    { name: 'Junk Food', value: answers.junk_food_consumption || 0 },
  ];

  // Prepare data for health balance pie chart
  const healthBalanceData = [
    { name: 'Exercise', value: answers.exercise_minutes ? Math.min(100, answers.exercise_minutes / 3) : 10 },
    { name: 'Nutrition', value: answers.fruit_vegetable_servings ? Math.min(100, answers.fruit_vegetable_servings * 15) : 20 },
    { name: 'Sleep', value: answers.sleep_hours ? Math.min(100, answers.sleep_hours * 12) : 30 },
    { name: 'Stress', value: 100 - (answers.stress_level ? Math.min(100, answers.stress_level * 20) : 40) },
  ];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Activity Bar Chart */}
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-safebite-text">Weekly Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b',
                    color: '#e2e8f0'
                  }} 
                />
                <Legend />
                <Bar dataKey="value" fill="#10b981" name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Bar Chart */}
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-safebite-text">Nutrition Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={nutritionData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b',
                    color: '#e2e8f0'
                  }} 
                />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Servings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Health Balance Pie Chart */}
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-safebite-text">Health Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthBalanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {healthBalanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#1e293b',
                    color: '#e2e8f0'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Health Recommendations */}
      <Card className="sci-fi-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-safebite-text">Health Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-safebite-text-secondary">
            {answers.exercise_minutes < 150 && (
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Try to get at least 150 minutes of moderate exercise per week.</span>
              </li>
            )}
            {answers.water_intake < 8 && (
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Aim for 8 cups of water daily for proper hydration.</span>
              </li>
            )}
            {answers.sleep_hours < 7 && (
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Most adults need 7-9 hours of sleep for optimal health.</span>
              </li>
            )}
            {answers.fruit_vegetable_servings < 5 && (
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Try to eat at least 5 servings of fruits and vegetables daily.</span>
              </li>
            )}
            {answers.junk_food_consumption > 3 && (
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Consider reducing junk food consumption for better health.</span>
              </li>
            )}
            {answers.stress_level > 7 && (
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                <span>Your stress levels are high. Consider stress-reduction activities like meditation or yoga.</span>
              </li>
            )}
            {/* Default recommendation if none of the above apply */}
            {answers.exercise_minutes >= 150 && 
              answers.water_intake >= 8 && 
              answers.sleep_hours >= 7 && 
              answers.fruit_vegetable_servings >= 5 && 
              answers.junk_food_consumption <= 3 && 
              answers.stress_level <= 7 && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Great job! You're maintaining healthy habits. Keep it up!</span>
                </li>
              )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyDataCharts;

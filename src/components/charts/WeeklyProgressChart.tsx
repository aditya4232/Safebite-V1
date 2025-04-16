import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { InfoCircle } from 'lucide-react';

interface WeeklyProgressChartProps {
  data: any[];
  dataKey: string;
  title: string;
  description?: string;
  color?: string;
  recommendedValue?: number;
  unit?: string;
  domain?: [number, number];
}

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ 
  data, 
  dataKey, 
  title, 
  description, 
  color = "#10b981", 
  recommendedValue,
  unit = "",
  domain
}) => {
  // Format the tooltip value
  const formatTooltipValue = (value: number) => {
    return `${value}${unit}`;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      let feedback = "";
      
      // Generate feedback based on the dataKey
      switch(dataKey) {
        case "exercise_minutes":
          feedback = value < 150 
            ? "Aim for at least 150 minutes of exercise per week" 
            : "Great job meeting the recommended exercise goal!";
          break;
        case "water_intake":
          feedback = value < 8 
            ? "Try to drink at least 8 cups of water daily" 
            : "Excellent hydration habits!";
          break;
        case "sleep_hours":
          feedback = value < 7 
            ? "Most adults need 7-9 hours of sleep for optimal health" 
            : "You're getting a healthy amount of sleep!";
          break;
        case "fruit_vegetable_servings":
          feedback = value < 5 
            ? "Aim for at least 5 servings of fruits and vegetables daily" 
            : "Great job with your fruit and vegetable intake!";
          break;
        default:
          feedback = "";
      }
      
      return (
        <div className="bg-safebite-card-bg p-3 border border-safebite-card-bg-alt rounded-md shadow-md">
          <p className="text-safebite-text font-medium">{label}</p>
          <p className="text-safebite-teal">{`${dataKey.split('_').join(' ')}: ${formatTooltipValue(value)}`}</p>
          {feedback && <p className="text-xs text-safebite-text-secondary mt-1">{feedback}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="text-safebite-text">{title}</CardTitle>
        {description && (
          <CardDescription className="text-safebite-text-secondary flex items-center">
            <InfoCircle className="h-4 w-4 mr-1 text-safebite-teal/70" />
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
              <XAxis 
                dataKey="week" 
                stroke="#8a94a6" 
                tick={{ fill: '#8a94a6' }}
              />
              <YAxis 
                stroke="#8a94a6" 
                tick={{ fill: '#8a94a6' }}
                domain={domain || ['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {recommendedValue && (
                <ReferenceLine 
                  y={recommendedValue} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Recommended', 
                    position: 'insideBottomRight',
                    fill: '#f59e0b'
                  }} 
                />
              )}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 4, fill: color, strokeWidth: 1, stroke: "#fff" }}
                activeDot={{ r: 6, fill: color, strokeWidth: 1, stroke: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgressChart;

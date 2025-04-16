import React from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Activity } from 'lucide-react';

interface HealthMetric {
  subject: string;
  value: number;
  fullMark: number;
}

interface HealthMetricsRadarChartProps {
  data: HealthMetric[];
  title?: string;
  description?: string;
}

const HealthMetricsRadarChart: React.FC<HealthMetricsRadarChartProps> = ({ 
  data, 
  title = "Health Metrics Overview", 
  description = "A comprehensive view of your health metrics based on your weekly check-ins"
}) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const metric = payload[0].payload;
      
      return (
        <div className="bg-safebite-card-bg p-3 border border-safebite-card-bg-alt rounded-md shadow-md">
          <p className="text-safebite-text font-medium">{metric.subject}</p>
          <p className="text-safebite-teal">{`Value: ${metric.value}`}</p>
          <p className="text-xs text-safebite-text-secondary mt-1">{`Target: ${metric.fullMark}`}</p>
          <p className="text-xs text-safebite-text-secondary mt-1">
            {metric.value >= metric.fullMark * 0.8 
              ? "Excellent progress!" 
              : metric.value >= metric.fullMark * 0.5 
                ? "Good progress, keep it up!" 
                : "There's room for improvement"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle className="text-safebite-text flex items-center">
          <Activity className="h-5 w-5 mr-2 text-safebite-teal" />
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-safebite-text-secondary">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#1e2a4a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8a94a6' }} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#8a94a6' }} />
              <Radar
                name="Current"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthMetricsRadarChart;

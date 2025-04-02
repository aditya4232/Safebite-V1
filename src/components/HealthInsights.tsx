import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface HealthInsight {
  color: string;
  text: string;
  priority?: number;
}

interface HealthInsightsProps {
  insights?: HealthInsight[];
}

const defaultInsights: HealthInsight[] = [
  { color: 'bg-green-500', text: 'Your protein intake is on track with your goals' },
  { color: 'bg-yellow-500', text: 'Consider increasing water intake by 2 cups' },
  { color: 'bg-blue-500', text: 'Your nutrient score has improved by 5% this week' },
  { color: 'bg-purple-500', text: 'You\'re 15 minutes short of your weekly exercise goal' },
];

const HealthInsights: React.FC<HealthInsightsProps> = ({ insights = defaultInsights }) => {
  // Sort insights by priority if available
  const sortedInsights = [...insights].sort((a, b) => {
    if (a.priority !== undefined && b.priority !== undefined) {
      return b.priority - a.priority; // Higher priority first
    }
    return 0;
  });
  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle>Health Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-safebite-text-secondary">
          {sortedInsights.map((insight, index) => (
            <li key={index} className="flex items-center">
              <div className={`h-2 w-2 rounded-full ${insight.color} mr-2`}></div>
              {insight.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default HealthInsights;

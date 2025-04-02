import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface FoodGroup {
  foodGroup: string;
  value: number;
}

interface FoodGroupChartProps {
  data: FoodGroup[];
}

const FoodGroupChart: React.FC<FoodGroupChartProps> = ({ data }) => {
  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle>Food Group Consumption</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
              <XAxis dataKey="foodGroup" stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
              <YAxis stroke="#a0a0a0" tick={{ fill: '#a0a0a0' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#101a35',
                  borderColor: '#1e2a4a',
                  color: '#e0e0e0'
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodGroupChart;
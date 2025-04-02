import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Macronutrient {
  name: string;
  value: number;
}

interface MacronutrientChartProps {
  data: Macronutrient[];
  colors: string[];
}

const MacronutrientChart: React.FC<MacronutrientChartProps> = ({ data, colors }) => {
  // Calculate total to show percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom label renderer to show percentages
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="sci-fi-card">
      <CardHeader>
        <CardTitle>Macronutrient Ratio</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any) => [`${value}g (${((Number(value) / total) * 100).toFixed(1)}%)`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#101a35',
                  borderColor: '#1e2a4a',
                  color: '#e0e0e0'
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderCustomizedLabel}
              >
                {
                  data.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))
                }
              </Pie>
              <Legend
                formatter={(value: string, _entry: any, index: number) => {
                  const item = data[index];
                  return `${value}: ${item.value}g (${((item.value / total) * 100).toFixed(0)}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MacronutrientChart;
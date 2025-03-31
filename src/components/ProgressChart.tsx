
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  dataKey?: string;
  color?: string;
  height?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
  data, 
  title, 
  dataKey = 'value',
  color = '#00ffcc',
  height = 300
}) => {
  return (
    <div className="sci-fi-card">
      <h3 className="text-xl font-semibold mb-4 text-safebite-text">{title}</h3>
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a4a" />
            <XAxis 
              dataKey="date" 
              stroke="#a0a0a0" 
              tick={{ fill: '#a0a0a0' }}
            />
            <YAxis 
              stroke="#a0a0a0" 
              tick={{ fill: '#a0a0a0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#101a35', 
                borderColor: '#1e2a4a',
                color: '#e0e0e0'
              }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1}
              fill={`url(#color${dataKey})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;

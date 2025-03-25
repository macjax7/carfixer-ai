
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FrequencyDataPoint } from '@/hooks/dashboard/useCarIssuesStats';

interface IssueFrequencyChartProps {
  data: FrequencyDataPoint[];
}

const IssueFrequencyChart: React.FC<IssueFrequencyChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis 
          dataKey="name" 
          className="text-xs font-medium"
        />
        <YAxis 
          className="text-xs font-medium"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            borderColor: 'hsl(var(--border))',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}
          itemStyle={{ 
            color: 'hsl(var(--foreground))',
            padding: '0.25rem 0',
            fontSize: '0.75rem',
          }}
          labelStyle={{
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
          }}
        />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--primary))" 
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IssueFrequencyChart;

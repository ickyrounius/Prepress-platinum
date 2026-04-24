"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendChartProps {
  data?: { date: string; value: number }[];
  label?: string;
  color?: string;
}

export default function TrendChart({ data = [], label = "Jobs", color = "hsl(var(--primary))" }: TrendChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 'bold' }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
          <Line 
            type="monotone" 
            dataKey="value" 
            name={label} 
            stroke={color} 
            strokeWidth={4} 
            dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: color }} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
            isAnimationActive={true}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

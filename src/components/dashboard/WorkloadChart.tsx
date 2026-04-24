"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkloadChartProps {
  data?: { name: string; jobs: number }[];
  label?: string;
  color?: string;
}

export default function WorkloadChart({ data = [], label = "Jobs", color = "hsl(var(--primary))" }: WorkloadChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
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
            dataKey="name" 
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
            cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }}
            contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
            itemStyle={{ color: color, fontWeight: 'bold' }}
          />
          <Bar 
            dataKey="jobs" 
            name={label} 
            fill={color} 
            radius={[8, 8, 0, 0]} 
            barSize={32}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

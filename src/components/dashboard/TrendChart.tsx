"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, defs, linearGradient, stop } from 'recharts';

interface TrendChartProps {
  data?: { date: string; value: number }[];
  label?: string;
  color?: string;
}

export default function TrendChart({ data = [], label = "Jobs", color = "#6366f1" }: TrendChartProps) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '900' }} 
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '20px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                fontSize: '10px',
                fontWeight: 'black',
                padding: '12px'
            }}
            labelStyle={{ color: '#1e293b', marginBottom: '4px' }}
            cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }} />
          <Area 
            type="monotone" 
            dataKey="value" 
            name={label} 
            stroke={color} 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            isAnimationActive={true}
            animationDuration={2000}
            dot={{ r: 4, strokeWidth: 3, fill: 'white', stroke: color }}
            activeDot={{ r: 8, strokeWidth: 0, fill: color, shadow: '0 0 10px rgba(0,0,0,0.2)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

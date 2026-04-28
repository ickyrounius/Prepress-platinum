"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface WorkloadChartProps {
  data?: { name: string; jobs: number }[];
  label?: string;
  color?: string;
}

export default function WorkloadChart({ data = [], label = "Jobs", color = "#10b981" }: WorkloadChartProps) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
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
            cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 12 }}
            contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(8px)',
                borderRadius: '20px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                fontSize: '10px',
                fontWeight: 'black'
            }}
            labelStyle={{ color: '#1e293b', marginBottom: '4px' }}
            itemStyle={{ color: color, fontWeight: 'black' }}
          />
          <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '20px' }} />
          <Bar 
            dataKey="jobs" 
            name={label} 
            fill={color} 
            radius={[10, 10, 10, 10]} 
            barSize={24}
            isAnimationActive={true}
            animationDuration={2000}
          >
            {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={color}
                    fillOpacity={0.8}
                    className="hover:fill-opacity-100 transition-all cursor-pointer"
                />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

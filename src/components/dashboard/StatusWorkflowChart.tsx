"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusData {
  name: string;
  value: number;
}

interface StatusWorkflowChartProps {
  data?: StatusData[];
}

const defaultData = [
  { name: 'Pending', value: 20 },
  { name: 'On Process', value: 45 },
  { name: 'Hold', value: 10 },
  { name: 'Done', value: 25 },
];

const COLORS = [
  '#94a3b8', // Pending - Slate
  '#6366f1', // On Process - Indigo
  '#f59e0b', // Hold - Amber
  '#10b981', // Done - Emerald
];

export default function StatusWorkflowChart({ data = defaultData }: StatusWorkflowChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as PhosphorIcons from '@phosphor-icons/react';

interface AdminStatsCardProps {
  label: string;
  value: number | string;
  icon: keyof typeof PhosphorIcons;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  description?: string;
}

export const AdminStatsCard = ({ label, value, icon, color, description }: AdminStatsCardProps) => {
  const Icon = PhosphorIcons[icon] as React.ElementType;

  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const iconBgMap = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    slate: 'bg-slate-600',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-6 rounded-[1.5rem] border shadow-sm flex flex-col gap-4 bg-white", colorMap[color])}
    >
      <div className="flex justify-between items-start">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", iconBgMap[color])}>
          <Icon size={24} weight="bold" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
          <h3 className="text-3xl font-black tracking-tighter mt-1">{value}</h3>
        </div>
      </div>
      {description && (
        <p className="text-[10px] font-bold opacity-70 uppercase tracking-tight">{description}</p>
      )}
    </motion.div>
  );
};

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FormItemProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  labelColor?: string;
}

export function FormField({ label, children, className, labelColor = 'text-slate-400' }: FormItemProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className={cn("text-[10px] font-bold uppercase tracking-wider", labelColor)}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function TechnicalGrid({ children, title, icon: Icon }: { children: React.ReactNode, title?: string, icon?: React.ElementType }) {
  return (
    <div className="md:col-span-2 lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
          <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{title}</h4>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

export function ProcessTimeGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:col-span-2 lg:col-span-3">
      {children}
    </div>
  );
}

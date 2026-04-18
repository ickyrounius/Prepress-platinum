'use client';

import React from 'react';
import { useTheme } from '@/features/theme/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-full transition-all duration-300 shadow-inner group"
    >
      <div className={cn(
        "absolute inset-y-1 w-8 rounded-full bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 ease-out",
        theme === 'light' ? "left-1" : "left-9"
      )} />
      
      <div className="relative z-10 flex items-center justify-center w-8 h-8 text-amber-500">
        <Sun size={18} strokeWidth={2.5} />
      </div>
      <div className="relative z-10 flex items-center justify-center w-8 h-8 text-indigo-400">
        <Moon size={18} strokeWidth={2.5} />
      </div>
    </button>
  );
}

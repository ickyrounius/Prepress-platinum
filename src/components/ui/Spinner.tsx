'use client';

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-4 w-4 border',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
};

export default function Spinner({ size = 'md', label, className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div
        className={`
          animate-spin rounded-full
          border-slate-600 border-t-blue-400
          ${SIZE_MAP[size]}
        `}
      />
      {label && <span className="text-sm text-slate-400">{label}</span>}
    </div>
  );
}

'use client';

import React from 'react';

const STATUS_STYLES: Record<string, { bg: string; text: string; ring: string }> = {
  WAITING:      { bg: 'bg-amber-500/15',   text: 'text-amber-400',   ring: 'ring-amber-500/30' },
  IN_PROGRESS:  { bg: 'bg-blue-500/15',    text: 'text-blue-400',    ring: 'ring-blue-500/30' },
  PROSES:       { bg: 'bg-blue-500/15',    text: 'text-blue-400',    ring: 'ring-blue-500/30' },
  LAYOUT:       { bg: 'bg-blue-500/15',    text: 'text-blue-400',    ring: 'ring-blue-500/30' },
  BLUEPRINT:    { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  ring: 'ring-indigo-500/30' },
  PREVIEW:      { bg: 'bg-violet-500/15',  text: 'text-violet-400',  ring: 'ring-violet-500/30' },
  REVIEW:       { bg: 'bg-violet-500/15',  text: 'text-violet-400',  ring: 'ring-violet-500/30' },
  CHECKING:     { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    ring: 'ring-cyan-500/30' },
  HOLD:         { bg: 'bg-red-500/15',     text: 'text-red-400',     ring: 'ring-red-500/30' },
  REVISI:       { bg: 'bg-orange-500/15',  text: 'text-orange-400',  ring: 'ring-orange-500/30' },
  APPROVED:     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  'ACC DG':     { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  OUTPUT:       { bg: 'bg-teal-500/15',    text: 'text-teal-400',    ring: 'ring-teal-500/30' },
  DONE:         { bg: 'bg-green-500/15',   text: 'text-green-400',   ring: 'ring-green-500/30' },
  CLOSED:       { bg: 'bg-slate-500/15',   text: 'text-slate-400',   ring: 'ring-slate-500/30' },
  CANCEL:       { bg: 'bg-slate-500/15',   text: 'text-slate-500',   ring: 'ring-slate-500/30' },
};

const DEFAULT_STYLE = { bg: 'bg-slate-500/15', text: 'text-slate-400', ring: 'ring-slate-500/30' };

interface StatusPillProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function StatusPill({ status, size = 'sm', className = '' }: StatusPillProps) {
  const normalised = (status || '').toUpperCase().trim();
  const style = STATUS_STYLES[normalised] || DEFAULT_STYLE;

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold tracking-wide uppercase
        ring-1 ring-inset
        ${style.bg} ${style.text} ${style.ring}
        ${sizeClasses}
        ${className}
      `}
    >
      {normalised || '—'}
    </span>
  );
}

'use client';

import React from 'react';
import { PresenceData } from '@/features/job/jobTypes';

interface PresenceBarProps {
  onlineUsers: Record<string, PresenceData>;
}

const PANEL_COLORS: Record<string, string> = {
  'panel/dt': 'bg-blue-500',
  'panel/dg': 'bg-violet-500',
  'panel/prepress': 'bg-emerald-500',
  'panel/support': 'bg-amber-500',
  'panel/qc': 'bg-cyan-500',
  'panel/spv': 'bg-pink-500',
  'panel/admin': 'bg-red-500',
  'panel/production': 'bg-teal-500',
  'dashboard': 'bg-slate-400',
};

export default function PresenceBar({ onlineUsers }: PresenceBarProps) {
  const entries = Object.entries(onlineUsers).filter(([, v]) => v.online);

  if (entries.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm">
      {/* Online indicator */}
      <div className="flex items-center gap-1.5 mr-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-xs text-slate-400 font-medium">{entries.length} online</span>
      </div>

      {/* User avatars */}
      <div className="flex -space-x-1.5 overflow-hidden">
        {entries.slice(0, 12).map(([uid, user]) => {
          const dotColor = PANEL_COLORS[user.currentPanel] || 'bg-slate-400';
          const initials = (user.displayName || '?')
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={uid}
              className="relative group"
              title={`${user.displayName} — ${user.currentPanel}`}
            >
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-700 ring-2 ring-slate-900 text-[10px] font-bold text-slate-300 transition-transform group-hover:scale-110 group-hover:z-10 cursor-default">
                {initials}
              </div>
              <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-slate-900 ${dotColor}`} />
            </div>
          );
        })}
        {entries.length > 12 && (
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-600 ring-2 ring-slate-900 text-[10px] font-bold text-slate-400">
            +{entries.length - 12}
          </div>
        )}
      </div>
    </div>
  );
}

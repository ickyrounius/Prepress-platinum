'use client';

import React from 'react';
import { useDashboardCounters } from '@/hooks/useDashboardCounters';
import { DeptKey } from '@/features/job/jobTypes';

const DEPT_LABELS: Record<DeptKey, string> = {
  DT: 'Design Teknik',
  DG: 'Design Grafis',
  PREPRESS: 'Prepress',
  SUPPORT: 'Support',
};

const DEPT_COLORS: Record<DeptKey, string> = {
  DT: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  DG: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
  PREPRESS: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  SUPPORT: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
};

const DEPT_ICON_COLOR: Record<DeptKey, string> = {
  DT: 'text-blue-400',
  DG: 'text-violet-400',
  PREPRESS: 'text-emerald-400',
  SUPPORT: 'text-amber-400',
};

interface DeptCounterWidgetProps {
  dept: DeptKey;
}

export default function DeptCounterWidget({ dept }: DeptCounterWidgetProps) {
  const store = useDashboardCounters() as { summaries?: any };
  const c = store.summaries?.[dept] || { waiting: 0, inProgress: 0, hold: 0, revision: 0, updatedAt: null };

  const lastUpdatedStr = c.updatedAt
    ? new Date(c.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border bg-gradient-to-br p-4
        ${DEPT_COLORS[dept]}
        transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-bold tracking-wide ${DEPT_ICON_COLOR[dept]}`}>
          {DEPT_LABELS[dept]}
        </h3>
        <span className="text-[10px] text-slate-500">
          {!c.updatedAt ? '...' : lastUpdatedStr}
        </span>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-2 gap-2">
        <CounterBadge label="Waiting" value={c.waiting || 0} color="text-amber-400" />
        <CounterBadge label="In Progress" value={c.inProgress || 0} color="text-blue-400" />
        <CounterBadge label="Hold" value={c.hold || 0} color="text-red-400" />
        <CounterBadge label="Revisi" value={c.revision || 0} color="text-orange-400" />
      </div>
    </div>
  );
}

function CounterBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-black/20 px-2 py-1.5">
      <span className={`text-lg font-bold tabular-nums ${color}`}>{value}</span>
      <span className="text-[9px] text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

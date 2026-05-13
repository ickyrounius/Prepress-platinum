'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/lib/store/useUserStore';
import { useKPI } from '@/hooks/useKPI';
import JobQueueTable from '@/components/dashboard/JobQueueTable';
import StatusPill from '@/components/ui/StatusPill';
import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function UserPerformancePage() {
  const { user } = useUserStore();
  const [days, setDays] = useState(90);
  
  const { data, isLoading, totals, error } = useKPI({ 
    uid: user?.uid, 
    days: days 
  });

  if (!user) return <div className="p-6 text-slate-400">Silakan login untuk melihat performa.</div>;

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Performa Saya</h1>
          <p className="text-slate-400 text-sm">Statistik produksi & KPI detail (90 hari terakhir).</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                days === d ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d} Hari
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIStatCard label="JOP Selesai" value={totals.completedJOP} color="text-blue-400" />
        <KPIStatCard label="JOS Selesai" value={totals.completedJOS} color="text-violet-400" />
        <KPIStatCard label="Revisi" value={totals.revisionCount} color="text-orange-400" />
        <KPIStatCard label="Hold Hours" value={`${totals.holdHours.toFixed(1)}h`} color="text-red-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPIStatCard 
            label="Overdue JOP" 
            value={totals.overdueJOP} 
            subValue={`${totals.completedJOP > 0 ? ((totals.overdueJOP / totals.completedJOP) * 100).toFixed(1) : 0}%`}
            color="text-amber-400" 
        />
        <KPIStatCard 
            label="Overdue JOS" 
            value={totals.overdueJOS} 
            subValue={`${totals.completedJOS > 0 ? ((totals.overdueJOS / totals.completedJOS) * 100).toFixed(1) : 0}%`}
            color="text-amber-400" 
        />
      </div>

      {/* Daily History Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Riwayat Harian</h2>
        <ErrorBoundary panelName="KPI History Table">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner label="Memuat riwayat performa..." />
            </div>
          ) : (
            <JobQueueTable
              data={data}
              columns={[
                { key: 'date', label: 'Tanggal', sortable: true, render: (row) => (
                  <span className="font-mono text-xs">{row.date.slice(0,4)}-{row.date.slice(4,6)}-{row.date.slice(6,8)}</span>
                )},
                { key: 'completedJOP', label: 'JOP', sortable: true, className: 'text-center' },
                { key: 'completedJOS', label: 'JOS', sortable: true, className: 'text-center' },
                { key: 'revisionCount', label: 'Revisi', sortable: true, className: 'text-center' },
                { key: 'holdHours', label: 'Hold (h)', sortable: true, render: (row) => row.holdHours.toFixed(1), className: 'text-center' },
                { key: 'overdueJOP', label: 'Overdue', sortable: true, render: (row) => (
                  <span className={row.overdueJOP > 0 || row.overdueJOS > 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {row.overdueJOP + row.overdueJOS}
                  </span>
                ), className: 'text-center' },
              ]}
              emptyMessage="Belum ada riwayat KPI untuk periode ini."
            />
          )}
        </ErrorBoundary>
      </section>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

function KPIStatCard({ label, value, subValue, color }: { label: string; value: string | number; subValue?: string; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
        {subValue && <span className="text-xs text-slate-500">{subValue}</span>}
      </div>
    </div>
  );
}

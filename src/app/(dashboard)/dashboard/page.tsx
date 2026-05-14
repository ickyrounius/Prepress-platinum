'use client';

import React from 'react';
import { usePresence } from '@/hooks/usePresence';
import { useUserStore } from '@/lib/store/useUserStore';
import PresenceBar from '@/components/dashboard/PresenceBar';
import DeptCounterWidget from '@/components/dashboard/DeptCounterWidget';
import JobQueueTable, { JOP_COLUMNS, JOS_COLUMNS } from '@/components/dashboard/JobQueueTable';
import { useJobList } from '@/hooks/useJobList';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { JopData, JosData } from '@/features/job/jobTypes';

export default function DashboardPage() {
  const { user } = useUserStore();
  const { onlineUsers } = usePresence(user?.uid || null, user?.NAMA || 'Anonymous', 'dashboard');

  const {
    data: jopData,
    isLoading: jopLoading,
    hasMore: jopHasMore,
    loadMore: jopLoadMore,
  } = useJobList<JopData>({ type: 'jop', statusFilter: ['CLOSED', 'DONE', 'CANCEL'] });

  const {
    data: josData,
    isLoading: josLoading,
    hasMore: josHasMore,
    loadMore: josLoadMore,
  } = useJobList<JosData>({ type: 'jos', statusFilter: ['CLOSED', 'DONE', 'CANCEL'] });

  return (
    <div className="space-y-6 p-6 pb-24">
      {/* Header & Presence */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Operational Dashboard</h1>
          <p className="text-slate-400 text-sm">Real-time production monitoring & control.</p>
        </div>
        <PresenceBar onlineUsers={onlineUsers} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ErrorBoundary panelName="Counter DT">
          <DeptCounterWidget dept="DT" />
        </ErrorBoundary>
        <ErrorBoundary panelName="Counter DG">
          <DeptCounterWidget dept="DG" />
        </ErrorBoundary>
        <ErrorBoundary panelName="Counter Prepress">
          <DeptCounterWidget dept="PREPRESS" />
        </ErrorBoundary>
        <ErrorBoundary panelName="Counter Support">
          <DeptCounterWidget dept="SUPPORT" />
        </ErrorBoundary>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* JOP Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Active JOP (Technical)</h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">List (Limit 30)</span>
          </div>
          <ErrorBoundary panelName="JOP Table">
            <JobQueueTable
              data={jopData}
              columns={JOP_COLUMNS}
              isLoading={jopLoading}
              hasMore={jopHasMore}
              onLoadMore={jopLoadMore}
              emptyMessage="Tidak ada JOP aktif"
            />
          </ErrorBoundary>
        </section>

        {/* JOS Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Active JOS (Graphic)</h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">List (Limit 30)</span>
          </div>
          <ErrorBoundary panelName="JOS Table">
            <JobQueueTable
              data={josData}
              columns={JOS_COLUMNS}
              isLoading={josLoading}
              hasMore={josHasMore}
              onLoadMore={josLoadMore}
              emptyMessage="Tidak ada JOS aktif"
            />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  );
}

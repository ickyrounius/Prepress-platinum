'use client';

import React, { useMemo } from 'react';
import { useKPI } from '@/hooks/useKPI';
import { useUserStore } from '@/lib/store/useUserStore';
import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import dynamic from 'next/dynamic';

// Lazy load heavy chart library
const Chart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center bg-slate-900/20 rounded-xl animate-pulse">Loading Chart...</div>
});

export default function AnalyticsPage() {
  const { user } = useUserStore();
  const { data, isLoading } = useKPI({ uid: user?.uid, days: 30 });

  const chartSeries = useMemo(() => {
    if (data.length === 0) return [];
    
    // Sort logic
    const sorted = [...data].sort((a,b) => a.date.localeCompare(b.date));
    
    return [
      {
        name: 'JOP Selesai',
        data: sorted.map(d => d.completedJOP || 0)
      },
      {
        name: 'JOS Selesai',
        data: sorted.map(d => d.completedJOS || 0)
      }
    ];
  }, [data]);

  const categories = useMemo(() => {
    return [...data].sort((a,b) => a.date.localeCompare(b.date)).map(d => d.date.slice(6));
  }, [data]);

  const options: any = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      background: 'transparent'
    },
    theme: { mode: 'dark' },
    colors: ['#3b82f6', '#8b5cf6'],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '10px' } }
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '10px' } }
    },
    grid: { borderColor: '#1e293b', strokeDashArray: 4 },
    legend: { position: 'top', horizontalAlign: 'right', labels: { colors: '#94a3b8' } }
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Trends</h1>
        <p className="text-slate-400 text-sm">Visualisasi output produksi 30 hari terakhir.</p>
      </div>

      <ErrorBoundary panelName="Production Charts">
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Productivity Trend (JOP vs JOS)
          </h3>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center"><Spinner /></div>
          ) : data.length > 0 ? (
            <Chart options={options} series={chartSeries} type="area" height={350} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-600 italic text-sm">Tidak ada data untuk divisualisasikan.</div>
          )}
        </div>
      </ErrorBoundary>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placeholder for more charts */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-48 flex items-center justify-center text-slate-700 text-xs">
          Status Distribution Chart (Planned)
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-48 flex items-center justify-center text-slate-700 text-xs">
          Operator Workload Comparison (Planned)
        </div>
      </div>
    </div>
  );
}

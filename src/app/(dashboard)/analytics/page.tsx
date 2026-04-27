'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CalendarClock, CheckCircle2, Clock3, Filter, PauseCircle, Search, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { classifyWorkflowStatus, detectJopType, detectJosType, resolveWorkflowStatus } from '@/lib/workflow';
import type { JopTypeFilter, JosTypeFilter } from '@/lib/types';
import { cn } from '@/lib/utils';

type OverdueItem = {
  id: string;
  sourceType: string;
  buyer: string;
  pic: string;
  status: string;
  targetDate: string;
  agingDays: number;
};

const STATUS_COLORS: Record<string, string> = {
  closed: '#10b981',
  review: '#3b82f6',
  process: '#6366f1',
  hold: '#f59e0b',
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    filteredItems,
    stats,
    productivityData,
    trendData,
    josTypeFilter,
    setJosTypeFilter,
    jopTypeFilter,
    setJopTypeFilter,
    dateRange,
    setDateRange,
    resetFilters,
  } = useDashboardData();

  const derived = useMemo(() => {
    const now = new Date();
    let overdueCount = 0;
    let onTimeCount = 0;
    const sourceMix = { DT: 0, DG: 0, SUPPORT: 0, PROD: 0 };
    const josMix = { EXPORT: 0, JASA: 0, LOCAL: 0, ALL: 0 };
    const jopMix = { EXPORT: 0, JASA: 0, LOCAL: 0, SMS: 0, KARTON_BOX: 0 };
    const overdueItems: OverdueItem[] = [];

    filteredItems.forEach((item) => {
      const sourceType = String(item.sourceType || 'DT');
      const status = resolveWorkflowStatus(item as Record<string, unknown>, sourceType);
      const bucket = classifyWorkflowStatus(status, item.ST_PRO_JOP || item.ST_PRO_JOS || item.status_pro_jop);

      if (sourceType in sourceMix) {
        sourceMix[sourceType as keyof typeof sourceMix] += 1;
      }

      const jos = detectJosType(item.TIPE_JOS || item.tipe_jos || item.TIPE_JOP || item.tipe_jop || '');
      josMix[jos] += 1;

      const noJop = item.NO_JOP || item.no_jop || item.id || '';
      const jop = detectJopType(noJop);
      jopMix[jop] += 1;

      const targetRaw = item.tgl_target_no_jop || item.tgl_target_no_jos || item.TGL_TARGET || item.TGL_TARGET_JOP || item.date_target;
      if (!targetRaw) return;

      const targetDate = new Date(String(targetRaw));
      if (isNaN(targetDate.getTime())) return;

      if (bucket === 'closed') {
        if (targetDate >= now) onTimeCount += 1;
        return;
      }

      if (targetDate < now) {
        overdueCount += 1;
        const diff = Math.floor((now.getTime() - targetDate.getTime()) / 86400000);
        overdueItems.push({
          id: String(item.id || noJop || '-'),
          sourceType,
          buyer: String(item.BUYER || item.buyer || '-'),
          pic: String(item.PIC_UTAMA || item.pic_utama || '-'),
          status: status || '-',
          targetDate: targetDate.toLocaleDateString('id-ID'),
          agingDays: diff,
        });
      }
    });

    overdueItems.sort((a, b) => b.agingDays - a.agingDays);

    const sourceData = Object.entries(sourceMix)
      .map(([name, value]) => ({ name, value }))
      .filter((row) => row.value > 0);

    const statusData = [
      { name: 'Closed', value: stats.closed, color: STATUS_COLORS.closed },
      { name: 'Review', value: stats.blueprint, color: STATUS_COLORS.review },
      { name: 'Process', value: stats.process, color: STATUS_COLORS.process },
      { name: 'Hold', value: stats.hold, color: STATUS_COLORS.hold },
    ].filter((row) => row.value > 0);

    return {
      overdueCount,
      onTimeCount,
      sourceData,
      statusData,
      josMix,
      jopMix,
      overdueItems,
    };
  }, [filteredItems, stats]);

  const searchedOverdueItems = useMemo(() => {
    if (!searchTerm.trim()) return derived.overdueItems.slice(0, 20);
    const query = searchTerm.toLowerCase();
    return derived.overdueItems
      .filter((row) =>
        row.id.toLowerCase().includes(query) ||
        row.buyer.toLowerCase().includes(query) ||
        row.pic.toLowerCase().includes(query) ||
        row.status.toLowerCase().includes(query)
      )
      .slice(0, 20);
  }, [derived.overdueItems, searchTerm]);

  const total = Math.max(stats.total, 1);
  const completionRate = ((stats.closed / total) * 100).toFixed(1);
  const holdRate = ((stats.hold / total) * 100).toFixed(1);

  return (
    <motion.div initial="hidden" animate="show" className="space-y-8 pb-20">
      <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">Analytics Center</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cross-department operational intelligence</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full xl:w-auto">
            <StatChip title="Total Jobs" value={stats.total} icon={BarChart3} color="indigo" />
            <StatChip title="Completion" value={`${completionRate}%`} icon={CheckCircle2} color="emerald" />
            <StatChip title="Hold Rate" value={`${holdRate}%`} icon={PauseCircle} color="amber" />
            <StatChip title="Overdue" value={derived.overdueCount} icon={CalendarClock} color="rose" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50">
            <Filter size={14} className="text-slate-500" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filters</span>
          </div>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
          />
          <select
            value={josTypeFilter}
            onChange={(e) => setJosTypeFilter(e.target.value as JosTypeFilter)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
          >
            <option value="ALL">JOS: ALL</option>
            <option value="EXPORT">JOS: EXPORT</option>
            <option value="JASA">JOS: JASA</option>
            <option value="LOCAL">JOS: LOCAL</option>
          </select>
          <select
            value={jopTypeFilter}
            onChange={(e) => setJopTypeFilter(e.target.value as JopTypeFilter)}
            className="px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl"
          >
            <option value="ALL">JOP: ALL</option>
            <option value="EXPORT">JOP: EXPORT</option>
            <option value="JASA">JOP: JASA</option>
            <option value="LOCAL">JOP: LOCAL</option>
            <option value="SMS">JOP: SMS</option>
            <option value="KARTON_BOX">JOP: KARTON</option>
          </select>
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs font-black text-white bg-slate-900 rounded-xl hover:bg-black transition-colors"
          >
            Reset
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Workflow Funnel</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={derived.statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                  {derived.statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Source Mix</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={derived.sourceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Workload Top PIC</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tcUtama" name="TC Utama" stackId="a" fill="#10b981" />
                <Bar dataKey="tcSupport" name="TC Support" stackId="a" fill="#a7f3d0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">7-Day Incoming Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jop" name="Incoming" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">JOS Composition</h3>
          <div className="space-y-3">
            {(['EXPORT', 'JASA', 'LOCAL'] as const).map((type) => (
              <ProgressRow key={type} label={type} value={derived.josMix[type]} total={stats.total} color="bg-indigo-500" />
            ))}
          </div>
        </motion.div>

        <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">JOP Composition</h3>
          <div className="space-y-3">
            {(['EXPORT', 'JASA', 'LOCAL', 'SMS', 'KARTON_BOX'] as const).map((type) => (
              <ProgressRow key={type} label={type.replace('_', ' ')} value={derived.jopMix[type]} total={stats.total} color="bg-emerald-500" />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={cardVariants} className="bg-white border border-slate-200 rounded-[2.5rem] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Overdue Jobs</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari ID, buyer, PIC, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">PIC</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aging</th>
              </tr>
            </thead>
            <tbody>
              {searchedOverdueItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-400 font-medium">
                    Tidak ada overdue pada filter aktif.
                  </td>
                </tr>
              ) : (
                searchedOverdueItems.map((row) => (
                  <tr key={`${row.id}-${row.targetDate}`} className="border-b border-slate-50">
                    <td className="py-3 text-xs font-black text-slate-700">{row.id}</td>
                    <td className="py-3 text-xs font-bold text-slate-500">{row.sourceType}</td>
                    <td className="py-3 text-xs font-semibold text-slate-600">{row.buyer}</td>
                    <td className="py-3 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Users size={12} className="text-slate-300" />
                        {row.pic}
                      </span>
                    </td>
                    <td className="py-3 text-xs font-semibold text-slate-600">{row.status}</td>
                    <td className="py-3 text-xs font-semibold text-slate-600">{row.targetDate}</td>
                    <td className="py-3 text-xs font-black text-rose-600 text-right inline-flex items-center gap-1">
                      <Clock3 size={12} />
                      {row.agingDays} hari
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatChip({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'indigo' | 'emerald' | 'amber' | 'rose';
}) {
  return (
    <div className={cn('rounded-2xl p-3 border', color === 'indigo' && 'bg-indigo-50 border-indigo-100', color === 'emerald' && 'bg-emerald-50 border-emerald-100', color === 'amber' && 'bg-amber-50 border-amber-100', color === 'rose' && 'bg-rose-50 border-rose-100')}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        <Icon size={15} className="text-slate-500" />
      </div>
      <p className="text-lg font-black text-slate-800">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.round((value / safeTotal) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-black text-slate-500">{value} ({percentage}%)</p>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

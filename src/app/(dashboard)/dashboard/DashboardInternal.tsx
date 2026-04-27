'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Files, CheckCircle, PencilCircle, Gear, HandPalm, 
  ChartPieSlice, Users, ChartLineUp, Trophy, 
  DownloadSimple,
  ArrowsCounterClockwise,
  Kanban, ChartBar, Lightning, Pulse, TrendUp
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { useAuth } from '@/features/auth/AuthContext';
import { recordAuditLog } from '@/features/audit-log/auditLogService';
import { classifyWorkflowStatus, detectJopType, detectJosType, resolveWorkflowStatus, type JopType, type JosType } from '@/lib/workflow';
import { getKPIColorClasses } from '@/features/kpi/kpiStyles';

interface DashboardItem extends Record<string, unknown> {
  id: string;
  sourceType: 'DT' | 'DG' | 'PROD';
}

type JosTypeFilter = 'ALL' | JosType;
type JopTypeFilter = 'ALL' | JopType;

import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardInternal() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'overview' | 'kanban'>('overview');
  
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
    resetFilters
  } = useDashboardData();

  const workflowStatusData = useMemo(() => [
    { name: 'Selesai', value: stats.closed, color: '#10b981' },
    { name: 'Review/BP', value: stats.blueprint, color: '#0ea5e9' },
    { name: 'Proses', value: stats.process, color: '#3b82f6' },
    { name: 'Tertunda', value: stats.hold, color: '#f59e0b' },
  ].filter(d => d.value > 0), [stats]);


  const exportDashboardPDF = async () => {
    const { exportToPDF } = await import('@/features/report/exportPDF');
    const columns = ['ID', 'Type', 'Buyer', 'Status', 'Sub Status'];
    const rows = filteredItems.slice(0, 100).map((item) => [
      String(item.id || '-'),
      String(item.sourceType || '-'),
      String(item.buyer || '-'),
      resolveWorkflowStatus(item as Record<string, unknown>, String(item.sourceType || '')) || '-',
      String(item.ST_PRO_JOP || '-'),
    ]);
    await exportToPDF('Prepress Dashboard Report', columns, rows, `prepress-dashboard-${Date.now()}.pdf`);
    if (user?.uid) {
      void recordAuditLog({
        actorUid: user.uid,
        action: "export_pdf",
        entityType: "dashboard",
        entityId: "main_dashboard",
        metadata: { rows: rows.length, josTypeFilter, jopTypeFilter },
      });
    }
  };

  const statCards = [
    { id: 'Total', title: 'Total JOP/JOS', value: stats.total, icon: Files, color: 'indigo' },
    { id: 'Closed', title: 'Selesai', value: stats.closed, icon: CheckCircle, color: 'emerald' },
    { id: 'Blueprint', title: 'Review/BP', value: stats.blueprint, icon: PencilCircle, color: 'sky' },
    { id: 'On Process', title: 'Proses', value: stats.process, icon: Gear, color: 'blue' },
    { id: 'Hold', title: 'Tertunda', value: stats.hold, icon: HandPalm, color: 'amber' },
  ];



  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      {/* Dynamic Header & Filter Section */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col xl:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-600 w-full sm:w-auto overflow-x-auto no-scrollbar">
             <button 
                onClick={() => setViewMode('overview')}
                className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    viewMode === 'overview' ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-md scale-105 z-10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
             >
                <ChartBar weight="bold" /> Overview
             </button>
             <button 
                onClick={() => setViewMode('kanban')}
                className={cn(
                    "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    viewMode === 'kanban' ? "bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-md scale-105 z-10" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
             >
                <Kanban weight="bold" /> Kanban
             </button>
          </div>

          <div className="hidden xl:block h-6 w-[1px] bg-slate-200 dark:bg-slate-600 mx-2"></div>

          <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 w-full sm:w-auto justify-center">
            <div className="relative flex items-center justify-center">
                <div className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">Live Sync Active</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center sm:justify-end">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-1 rounded-2xl border border-slate-200 dark:border-slate-600 w-full sm:w-auto justify-between sm:justify-start">
                <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-transparent p-2 text-[9px] sm:text-[10px] font-black text-slate-600 dark:text-slate-300 outline-none uppercase w-full sm:w-auto" 
                />
                <span className="text-slate-300 dark:text-slate-500 font-bold px-1">/</span>
                <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-transparent p-2 text-[9px] sm:text-[10px] font-black text-slate-600 dark:text-slate-300 outline-none uppercase w-full sm:w-auto" 
                />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                <select
                  value={josTypeFilter}
                  onChange={(e) => setJosTypeFilter(e.target.value as JosTypeFilter)}
                  className="flex-1 sm:flex-none p-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 min-w-[100px]"
                >
                  <option value="ALL">JOS: ALL</option>
                  <option value="EXPORT">JOS: EXPORT</option>
                  <option value="JASA">JOS: JASA</option>
                  <option value="LOCAL">JOS: LOCAL</option>
                </select>
                <select
                  value={jopTypeFilter}
                  onChange={(e) => setJopTypeFilter(e.target.value as JopTypeFilter)}
                  className="flex-1 sm:flex-none p-3 rounded-2xl border border-slate-200 dark:border-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 min-w-[100px]"
                >
                  <option value="ALL">JOP: ALL</option>
                  <option value="EXPORT">JOP: EXPORT</option>
                  <option value="JASA">JOP: JASA</option>
                  <option value="LOCAL">JOP: LOCAL</option>
                  <option value="SMS">JOP: SMS</option>
                  <option value="KARTON_BOX">JOP: KARTON</option>
                </select>
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <button 
                    onClick={resetFilters}
                    className="p-3 bg-slate-900 dark:bg-slate-600 text-white rounded-2xl hover:bg-black dark:hover:bg-slate-500 transition-all active:scale-95 group shadow-lg"
                    title="Reset Filters"
                >
                    <ArrowsCounterClockwise weight="bold" className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                </button>
                <button
                  onClick={exportDashboardPDF}
                  className="flex-1 sm:flex-none px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
                >
                  <DownloadSimple weight="bold" className="w-4 h-4" /> PDF
                </button>
            </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'overview' ? (
          <motion.div 
            key="overview"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3 } }}
            className="space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((card) => {
                const colors = getKPIColorClasses(card.color);
                return (
                    <motion.div 
                    key={card.id}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-800 group cursor-default"
                    >
                    <div className={cn(
                        "absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 group-hover:opacity-40 opacity-20",
                        colors.lightBg
                    )}></div>
                    <div className="relative z-10">
                        <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all shadow-inner",
                        colors.lightBg,
                        colors.text,
                        "group-hover:text-white group-hover:bg-slate-900 group-hover:shadow-lg"
                        )}>
                        <card.icon weight="bold" size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{card.title}</p>
                        <h3 className={cn(
                        "text-4xl font-black transition-all group-hover:scale-110 origin-left",
                        card.id === 'Total' ? "text-slate-800 dark:text-slate-100" : `text-${card.color}-600`
                        )}>{card.value}</h3>
                        <div className="mt-4 flex items-center gap-1.5 overflow-hidden">
                           <Pulse className={cn("w-3 h-3 group-hover:animate-pulse", colors.text)} weight="bold" />
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Real-time update</span>
                        </div>
                    </div>
                    </motion.div>
                );
                })}
            </div>

            {/* Charts Section 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 sm:opacity-10 group-hover:opacity-20 transition-opacity">
                        <ChartPieSlice weight="fill" size={100} className="sm:size-[120px]" />
                    </div>
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <ChartPieSlice weight="bold" size={20} className="sm:size-[24px]" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Overview</p>
                                <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Status Workflow</h4>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                            isAnimationActive={true}
                            animationBegin={300}
                            animationDuration={1500}
                            data={workflowStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="85%"
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            >
                            {workflowStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                            </Pie>
                            <RechartsTooltip 
                             contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '10px' }} 
                            />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Users weight="bold" size={20} className="sm:size-[24px]" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Workload Capacity</p>
                                <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Beban Kerja PIC (TC)</h4>
                            </div>
                        </div>
                        <div className="px-3 sm:px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[8px] sm:text-[10px] font-black rounded-xl border border-blue-100 dark:border-blue-800 animate-pulse whitespace-nowrap">LIVE VIEW</div>
                    </div>
                    <div className="h-64 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productivityData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                            <RechartsTooltip 
                             cursor={{ fill: '#f8fafc', radius: 10 }} 
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                            <Bar dataKey="tcUtama" name="Poin Utama" stackId="a" fill="#6366f1" radius={[0, 0, 8, 8]} barSize={28} isAnimationActive={true} animationDuration={2000} />
                            <Bar dataKey="tcSupport" name="Poin Help" stackId="a" fill="#c7d2fe" radius={[8, 8, 0, 0]} barSize={28} isAnimationActive={true} animationDuration={2500} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ChartLineUp weight="bold" size={20} className="sm:size-[24px]" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Performance Trend</p>
                                <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Tren JOP Masuk</h4>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                            <RechartsTooltip 
                             contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                            />
                            <Line isAnimationActive={true} animationDuration={3000} type="monotone" dataKey="jop" name="JOP Masuk" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                        </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="relative group">
                    <Link href="/panel/kpi">
                        <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-indigo-100 flex flex-col justify-between h-full group hover:scale-[1.01] transition-transform duration-500 cursor-pointer overflow-hidden border border-white/5 min-h-[320px] sm:min-h-0">
                            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-500/10 rounded-full -mr-24 -mt-24 sm:-mr-32 sm:-mt-32 blur-3xl animate-pulse"></div>
                            
                            <div className="relative z-10 space-y-6 sm:space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/10 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-white backdrop-blur-md group-hover:bg-indigo-500 group-hover:shadow-lg transition-all duration-500">
                                        <Trophy weight="fill" size={24} className="sm:size-[28px] text-amber-400 group-hover:text-white" />
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-black rounded-full border border-emerald-500/30 whitespace-nowrap">
                                        <Lightning weight="fill" size={12} className="sm:size-[14px]" /> KPI TARGET MET
                                    </div>
                                </div>
                                
                                <div className="space-y-1 sm:space-y-2">
                                    <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight">Performa <br /><span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-8">Prepress Platinum</span></h4>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Efficiency Achievement Rate</p>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-baseline gap-3 sm:gap-4">
                                        <h2 className="text-5xl sm:text-6xl font-black text-white group-hover:text-indigo-300 transition-colors">98.4<span className="text-xl sm:text-2xl opacity-50">%</span></h2>
                                        <TrendUp weight="bold" size={20} className="sm:size-[24px] text-emerald-400 animate-bounce" />
                                    </div>
                                    <div className="w-full bg-white/5 h-3 sm:h-4 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '98.4%' }}
                                            transition={{ duration: 2, ease: "easeOut", delay: 1 }}
                                            className="bg-indigo-500 h-full rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-slate-500">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Lihat detail ranking PIC</span>
                                <ArrowsCounterClockwise weight="bold" size={14} className="sm:size-[16px] group-hover:rotate-180 transition-transform duration-700" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3 } }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="pb-8"
          >
            <KanbanBoard data={filteredItems as any} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

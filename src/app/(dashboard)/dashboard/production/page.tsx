'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Printer, 
  Stack, 
  CheckCircle, 
  Clock, 
  Warning,
  ChartBar,
  Users,
  Lightning
} from '@phosphor-icons/react';
import TrendChart from '@/components/dashboard/TrendChart';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import { KanbanBoard, type KanbanItem } from '@/components/dashboard/KanbanBoard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import { resolveWorkflowStatus } from '@/lib/workflow';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.05 }}
    className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-default"
  >
    <div className={cn(
      "absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-150 group-hover:opacity-20",
      `bg-${colorClass}-500/20`
    )} />
    <div className="flex justify-between items-center relative z-10">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner",
        `bg-${colorClass}-50 text-${colorClass}-500 group-hover:bg-${colorClass}-500 group-hover:text-white`
      )}>
        <Icon weight="bold" size={20} />
      </div>
      <div className="text-right">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value.toLocaleString()}</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  </motion.div>
);

export default function ProductionDashboard() {
  const { filteredItems, stats, trendData, productivityData } = useDashboardData(['proses_ctp_b', 'proses_ctcp_b', 'proses_flexo_b', 'proses_etching_b', 'proses_screen_b']);

  // Filter only production items (CTP, CTCP, FLEXO, etc.)
  const prodItems = useMemo(() => {
    return filteredItems.filter(item => item.sourceType === 'PROD');
  }, [filteredItems]);

  const kanbanItems = useMemo(() => {
    return prodItems.map(item => ({ ...item, sourceType: 'PROD' } as unknown as KanbanItem));
  }, [prodItems]);

  // Recalculate stats for production only if needed, 
  // but for now let's show overall production context if the user is in this view.
  
  const displayStats = [
    { title: "Production Total", value: prodItems.length, icon: Stack, color: "indigo" },
    { title: "Completed", value: prodItems.filter((i) => ['DONE', 'SELESAI', 'CLOSED'].includes(resolveWorkflowStatus(i as Record<string, unknown>, 'PROD').toUpperCase())).length, icon: CheckCircle, color: "emerald" },
    { title: "On Process", value: prodItems.filter((i) => ['PROSESS', 'PROSES', 'ON PROCESS'].includes(resolveWorkflowStatus(i as Record<string, unknown>, 'PROD').toUpperCase())).length, icon: Clock, color: "blue" },
    { title: "Hold/Pending", value: prodItems.filter((i) => resolveWorkflowStatus(i as Record<string, unknown>, 'PROD').toUpperCase() === 'HOLD').length, icon: Warning, color: "amber" },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex justify-center items-center shadow-xl shadow-indigo-100">
            <Printer weight="bold" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">Production Dashboard</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Overall Production Department Performance</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <ChartBar weight="bold" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tren Produksi</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Output Kolektif</p>
              </div>
          </div>
          <div className="h-80">
            <TrendChart data={trendData.map(d => ({ date: d.name, value: d.jop }))} label="Jobs" color="#6366f1" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Users weight="bold" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Beban Kerja Produksi</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas Operator Terintegrasi</p>
              </div>
          </div>
          <div className="h-80">
            <WorkloadChart data={productivityData.map(d => ({ name: d.name, jobs: d.tcUtama + d.tcSupport }))} label="Total TC" color="#10b981" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Production Kanban Board</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time status tracking across all production lines</p>
        </div>
        <KanbanBoard data={kanbanItems} />
      </motion.div>
    </motion.div>
  );
}

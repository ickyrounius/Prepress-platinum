'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthContext';
import { resolveWorkflowStatus, classifyWorkflowStatus } from '@/lib/workflow';
import { 
  Wrench, 
  Stack, 
  CheckCircle, 
  Clock, 
  Warning,
  ChartBar,
  Users,
  Target
} from '@phosphor-icons/react';
import TrendChart from '@/components/dashboard/TrendChart';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import { KanbanBoard, type KanbanItem } from '@/components/dashboard/KanbanBoard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

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

const COLOR_STYLES: Record<string, { orb: string; icon: string }> = {
  indigo: { orb: "bg-indigo-500/20", icon: "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-900/40 dark:text-indigo-300" },
  emerald: { orb: "bg-emerald-500/20", icon: "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-900/40 dark:text-emerald-300" },
  blue: { orb: "bg-blue-500/20", icon: "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-300" },
  amber: { orb: "bg-amber-500/20", icon: "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-900/40 dark:text-amber-300" },
};

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.05 }}
    className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all cursor-default"
  >
    <div className={cn(
      "absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-150 group-hover:opacity-20",
      (COLOR_STYLES[colorClass] ?? COLOR_STYLES.indigo).orb
    )} />
    <div className="flex justify-between items-center relative z-10">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner",
        (COLOR_STYLES[colorClass] ?? COLOR_STYLES.indigo).icon
      )}>
        <Icon weight="bold" size={20} />
      </div>
      <div className="text-right">
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{value.toLocaleString()}</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  </motion.div>
);

export default function SupportDashboard() {
  const { user } = useAuth();
  const [showOnlyMe, setShowOnlyMe] = useState(false);
  const { filteredItems, trendData, productivityData } = useDashboardData(['proses_support_b']);

  // Filter only support items
  const baseSupportItems = useMemo(() => {
    return filteredItems.filter(item => item.sourceType === 'SUPPORT');
  }, [filteredItems]);

  const supportItems = useMemo(() => {
    if (!showOnlyMe || !user?.displayName) return baseSupportItems;
    return baseSupportItems.filter(item => 
      String(item.pic_utama || item.PIC_UTAMA || item.operator_id || '').toUpperCase() === user.displayName?.toUpperCase()
    );
  }, [baseSupportItems, showOnlyMe, user?.displayName]);

  const kanbanItems = useMemo(() => {
    return supportItems.map(item => ({ ...item, sourceType: 'SUPPORT' } as unknown as KanbanItem));
  }, [supportItems]);

  const displayStats = useMemo(() => {
    if (!showOnlyMe) {
      return [
        { title: "Support Total", value: baseSupportItems.length, icon: Stack, color: "indigo" },
        { title: "Completed", value: baseSupportItems.filter((i) => classifyWorkflowStatus(resolveWorkflowStatus(i as Record<string, unknown>, 'SUPPORT'), String(i.status || '')) === 'closed').length, icon: CheckCircle, color: "emerald" },
        { title: "On Process", value: baseSupportItems.filter((i) => classifyWorkflowStatus(resolveWorkflowStatus(i as Record<string, unknown>, 'SUPPORT'), String(i.status || '')) === 'process').length, icon: Clock, color: "blue" },
        { title: "Hold/Pending", value: baseSupportItems.filter((i) => classifyWorkflowStatus(resolveWorkflowStatus(i as Record<string, unknown>, 'SUPPORT'), String(i.status || '')) === 'hold').length, icon: Warning, color: "amber" },
      ];
    }

    let closed = 0, process = 0, hold = 0;
    supportItems.forEach(item => {
      const status = resolveWorkflowStatus(item as Record<string, unknown>, 'SUPPORT');
      const bucket = classifyWorkflowStatus(status, String(item.status || ''));
      if (bucket === 'closed') closed++;
      else if (bucket === 'hold') hold++;
      else process++;
    });

    return [
      { title: "My Total", value: supportItems.length, icon: Stack, color: "indigo" },
      { title: "My Completed", value: closed, icon: CheckCircle, color: "emerald" },
      { title: "My Process", value: process, icon: Clock, color: "blue" },
      { title: "My Hold", value: hold, icon: Warning, color: "amber" },
    ];
  }, [baseSupportItems, supportItems, showOnlyMe]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-amber-500 text-white flex justify-center items-center shadow-xl shadow-amber-100">
            <Wrench weight="bold" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Support Dashboard</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monitoring GMG, CNC & Blueprint Operations</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setShowOnlyMe(false)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                !showOnlyMe ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Team View
            </button>
            <button 
              onClick={() => setShowOnlyMe(true)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                showOnlyMe ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              My Jobs
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <ChartBar weight="bold" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Tren Support</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Volume Support Design</p>
              </div>
          </div>
          <div className="h-80">
            <TrendChart data={trendData.map(d => ({ date: d.name, value: d.jop }))} label="Jobs" color="#6366f1" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Users weight="bold" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Workload Support</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produktifitas PIC Support</p>
              </div>
          </div>
          <div className="h-80">
            <WorkloadChart data={productivityData.map(d => ({ name: d.name, jobs: d.tcUtama + d.tcSupport }))} label="Total TC" color="#10b981" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Support Kanban Board</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking progress for blueprint and proofing</p>
        </div>
        <KanbanBoard data={kanbanItems} />
      </motion.div>
    </motion.div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  CheckCircle, 
  Warning, 
  Stack,
  ArrowsCounterClockwise,
  Printer,
  ChartBar,
  Users,
  Clock
} from '@phosphor-icons/react';
import TrendChart from '@/components/dashboard/TrendChart';
import WorkloadChart from '@/components/dashboard/WorkloadChart';
import { cn } from '@/lib/utils';
import type { Icon } from '@phosphor-icons/react';
import { KanbanBoard, type KanbanItem } from '@/components/dashboard/KanbanBoard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

interface StatCardProps {
  title: string;
  value: number;
  icon: Icon;
  colorClass: string;
}

const COLOR_STYLES: Record<string, { orb: string; icon: string }> = {
  indigo: { orb: "bg-indigo-500/20", icon: "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-900/40 dark:text-indigo-300" },
  emerald: { orb: "bg-emerald-500/20", icon: "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white dark:bg-emerald-900/40 dark:text-emerald-300" },
  blue: { orb: "bg-blue-500/20", icon: "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white dark:bg-blue-900/40 dark:text-blue-300" },
  rose: { orb: "bg-rose-500/20", icon: "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white dark:bg-rose-900/40 dark:text-rose-300" },
};

const StatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const styles = COLOR_STYLES[colorClass] ?? COLOR_STYLES.indigo;

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString());
    if (start === end) return;

    const totalMiliseconds = 1500;
    const incrementTime = (totalMiliseconds / end);

    const timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, Math.max(incrementTime, 20));

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-700 transition-all cursor-default"
    >
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 opacity-10 transition-transform group-hover:scale-150 group-hover:opacity-20",
        styles.orb
      )} />
      
      <div className="flex justify-between items-start relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
          styles.icon
        )}>
          <Icon weight="bold" size={24} />
        </div>
        <div className="text-right">
            <motion.p className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{displayValue.toLocaleString()}</motion.p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

const departments = ["CTCP", "CTP", "FLEXO", "ETCHING", "SCREEN"];

import { useRoleStats } from '@/hooks/useRoleStats';

export default function ProductionDashboard() {
  const [activeDept, setActiveDept] = useState("CTCP");
  
  const deptCollectionMap: Record<string, string> = {
    CTCP: 'proses_ctcp_b',
    CTP: 'proses_ctp_b',
    FLEXO: 'proses_flexo_b',
    ETCHING: 'proses_etching_b',
    SCREEN: 'proses_screen_b',
  };

  const { items: rawItems, stats: realStats, trendData, workloadData, loading } = useRoleStats(deptCollectionMap[activeDept] || 'proses_prepress_b');

  const kanbanItems = useMemo(() => {
    return rawItems.map(item => ({ ...item, sourceType: 'PROD' } as unknown as KanbanItem));
  }, [rawItems]);

  const stats = [
    { title: `Total ${activeDept === 'SCREEN' ? 'Screen' : 'Plate'}`, value: realStats.total, icon: Stack, color: "indigo" },
    { title: `Closed`, value: realStats.closed, icon: CheckCircle, color: "emerald" },
    { title: `On Process`, value: realStats.process, icon: Clock, color: "blue" },
    { title: "Hold/Overdue", value: realStats.hold + realStats.overdue, icon: Warning, color: "rose" },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex justify-center items-center shadow-xl shadow-indigo-100">
            <Printer weight="bold" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">Prepress Dashboard</h1>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Monitoring Output {activeDept}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Department Switcher */}
        <div className="flex p-1.5 bg-slate-100 border border-slate-200 rounded-[1.5rem] shadow-inner">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeDept === dept 
                  ? "bg-white text-indigo-600 shadow-md scale-105 z-10"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {dept}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDept}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard 
                key={i} 
                title={stat.title} 
                value={stat.value} 
                icon={stat.icon} 
                colorClass={stat.color} 
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ChartBar weight="bold" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Tren JOP Masuk</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Mingguan {activeDept}</p>
                  </div>
              </div>
              <div className="h-80">
                <TrendChart data={trendData} label={`${activeDept} Workload`} color="#6366f1" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Users weight="bold" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Workload Operator</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas Produksi {activeDept}</p>
                  </div>
              </div>
              <div className="h-80">
                <WorkloadChart data={workloadData} label="Operator Jobs" color="#10b981" />
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Kanban Proses {activeDept}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Board khusus proses divisi prepress {activeDept}</p>
            </div>
            <KanbanBoard data={kanbanItems} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

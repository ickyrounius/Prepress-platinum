'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  WarningCircle,
  Archive,
  Download,
  MapPin,
  Warning,
  Lightning,
  Monitor,
  Stack,
  ChartBar,
  Users
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
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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
  purple: { orb: "bg-purple-500/20", icon: "bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white dark:bg-purple-900/40 dark:text-purple-300" },
  amber: { orb: "bg-amber-500/20", icon: "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white dark:bg-amber-900/40 dark:text-amber-300" },
  sky: { orb: "bg-sky-500/20", icon: "bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white dark:bg-sky-900/40 dark:text-sky-300" },
  rose: { orb: "bg-rose-500/20", icon: "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white dark:bg-rose-900/40 dark:text-rose-300" },
  teal: { orb: "bg-teal-500/20", icon: "bg-teal-50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white dark:bg-teal-900/40 dark:text-teal-300" },
  red: { orb: "bg-red-500/20", icon: "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white dark:bg-red-900/40 dark:text-red-300" },
  yellow: { orb: "bg-yellow-500/20", icon: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white dark:bg-yellow-900/40 dark:text-yellow-300" },
};

const StatCard = ({ title, value, icon: Icon, colorClass }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const styles = COLOR_STYLES[colorClass] ?? COLOR_STYLES.indigo;

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.toString());
    if (start === end) return;
    const timer = setInterval(() => {
      start += Math.ceil(end / 50);
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-700 transition-all cursor-default"
    >
      <div className={cn(
        "absolute top-0 right-0 w-16 h-16 rounded-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-150 group-hover:opacity-20",
        styles.orb
      )} />
      
      <div className="flex justify-between items-center relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-inner",
          styles.icon
        )}>
          <Icon weight="bold" size={20} />
        </div>
        <div className="text-right">
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{displayValue.toLocaleString()}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

import { useRoleStats } from '@/hooks/useRoleStats';

export default function DTDashboard() {
  const { items: rawItems, stats: realStats, trendData, workloadData, loading } = useRoleStats('proses_dt_b');

  const kanbanItems = useMemo(() => {
    return rawItems.map(item => ({ ...item, sourceType: 'DT' } as unknown as KanbanItem));
  }, [rawItems]);

  const stats = [
    { title: "Total JOP", value: realStats.total, icon: FileText, color: "indigo" },
    { title: "Closed", value: realStats.closed, icon: CheckCircle, color: "emerald" },
    { title: "On Process", value: realStats.process, icon: Clock, color: "blue" },
    { title: "Blueprint", value: realStats.blueprint, icon: Stack, color: "purple" },
    { title: "Hold/Pending", value: realStats.hold, icon: WarningCircle, color: "amber" },
    { title: "Total Export", value: realStats.exportCount, icon: Download, color: "sky" },
    { title: "Total Jasa", value: realStats.jasaCount, icon: Archive, color: "rose" },
    { title: "Total Local", value: realStats.localCount, icon: MapPin, color: "teal" },
    { title: "Overdue", value: realStats.overdue, icon: Warning, color: "red" },
    { title: "On Time", value: realStats.onTime, icon: CheckCircle, color: "emerald" },
    { title: "Today Active", value: trendData[trendData.length - 1]?.value || 0, icon: Lightning, color: "yellow" },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600 text-white flex justify-center items-center shadow-xl shadow-indigo-100">
            <Monitor weight="bold" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">DT Dashboard</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Desktop & CAD Monitoring Performance</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
          <Download weight="bold" /> Generate Report
        </button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Tren JOP Masuk (30 Hari)</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Volume Technical design</p>
              </div>
          </div>
          <div className="h-80">
            <TrendChart data={trendData} label="JOP Masuk" color="#6366f1" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Users weight="bold" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Beban Kerja Operator</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Produktifitas & Efisiensi per PIC</p>
              </div>
          </div>
          <div className="h-80">
            <WorkloadChart data={workloadData} label="Active Jobs" color="#10b981" />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Kanban Proses DT</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Board khusus proses divisi DT/CAD</p>
        </div>
        <KanbanBoard data={kanbanItems} />
      </motion.div>
    </motion.div>
  );
}

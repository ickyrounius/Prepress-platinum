'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { 
  Printer, 
  CheckCircle, 
  Clock, 
  XCircle,
  PauseCircle,
  ChartLineUp
} from '@phosphor-icons/react';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import type { Icon } from '@phosphor-icons/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function PrepressDashboard() {
  const [kanbanItems, setKanbanItems] = useState<Array<Record<string, unknown>>>([]);
  const [stats, setStats] = useState({
    total: 0,
    proses: 0,
    review: 0,
    done: 0,
    reject: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'proses_prepress_b'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const items: Array<Record<string, unknown>> = [];
      let total = 0;
      let proses = 0;
      let review = 0;
      let done = 0;
      let reject = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({ id: doc.id, sourceType: 'PROD', ...data });
        
        total++;
        const status = (data.tahapan_prepress || '').toUpperCase();
        if (status === 'PROSES') proses++;
        if (status === 'REVIEW') review++;
        if (status === 'DONE') done++;
        if (data.status_prepress === 'REJECT') reject++;
      });

      setKanbanItems(items);
      setStats({ total, proses, review, done, reject });
    });

    return () => unsub();
  }, []);

  const statCards = [
    { title: "Total Job Masuk", value: stats.total, icon: ChartLineUp, color: "bg-indigo-50 text-indigo-600", border: 'border-indigo-100' },
    { title: "Sedang Proses (RIP/Layout)", value: stats.proses, icon: Clock, color: "bg-blue-50 text-blue-600", border: 'border-blue-100' },
    { title: "Menunggu Review Dokumen", value: stats.review, icon: PauseCircle, color: "bg-amber-50 text-amber-600", border: 'border-amber-100' },
    { title: "Selesai Prepress", value: stats.done, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", border: 'border-emerald-100' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600 text-white flex justify-center items-center shadow-xl shadow-indigo-200">
            <Printer weight="bold" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800">Prepress Dashboard</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Monitoring Proses Pre-Production (Layout & RIP)</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[2.5rem] border ${stat.border} shadow-sm flex items-center gap-5`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.color}`}>
               <stat.icon weight="fill" size={28} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{stat.title}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Main Kanban Prepress</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Papan Monitoring Proses Persiapan Cetak</p>
          </div>
          {stats.reject > 0 && (
             <div className="px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                <XCircle weight="fill" className="text-rose-500" size={20} />
                <span className="text-[11px] font-black text-rose-700 uppercase tracking-widest">{stats.reject} JOBS REJECTED</span>
             </div>
          )}
        </div>
        <KanbanBoard data={kanbanItems as any[]} />
      </motion.div>

    </motion.div>
  );
}

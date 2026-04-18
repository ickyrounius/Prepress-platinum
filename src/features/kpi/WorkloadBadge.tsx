'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkloadBadgeProps {
  picCode: string;
}

export default function WorkloadBadge({ picCode }: WorkloadBadgeProps) {
  const [stats, setStats] = useState({ activeJobs: 0, totalKT: 0, totalRP: 0 });

  useEffect(() => {
    if (!picCode) return;

    // Query active jobs for this PIC across JOP collection
    const q = query(
        collection(db, 'workflows_jop'), 
        where('PIC_UTAMA', '==', picCode),
        where('ST_WORKFLOW', '!=', 'Closed')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let kt = 0, rp = 0;
      const count = snapshot.size;
      snapshot.forEach(doc => {
        const d = doc.data();
        kt += (d.KT || 0);
        rp += (d.RP || 0);
      });
      setStats({ activeJobs: count, totalKT: kt, totalRP: rp });
    });

    return () => unsubscribe();
  }, [picCode]);

  if (!picCode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className={cn(
          "p-4 rounded-2xl border flex items-center gap-4 transition-all duration-300",
          stats.activeJobs >= 5 ? "bg-rose-50 border-rose-100" : "bg-indigo-50 border-indigo-100"
        )}
      >
        <div className={cn(
           "w-10 h-10 rounded-full flex items-center justify-center",
           stats.activeJobs >= 5 ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
        )}>
           {stats.activeJobs >= 5 ? <AlertTriangle size={20} /> : <Activity size={20} />}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Current Workload: {picCode}</p>
            {stats.activeJobs >= 5 && <span className="text-[8px] font-black text-rose-600 uppercase bg-rose-200/50 px-2 py-0.5 rounded-full animate-pulse">Critical</span>}
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-baseline gap-1">
               <span className="text-lg font-black text-slate-800 leading-none">{stats.activeJobs}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase">Jobs</span>
             </div>
             <div className="h-4 w-px bg-slate-300"></div>
             <div className="flex items-baseline gap-1">
               <span className="text-sm font-black text-slate-700 leading-none">{stats.totalKT}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase">KT</span>
             </div>
             <div className="flex items-baseline gap-1">
               <span className="text-sm font-black text-slate-700 leading-none">{stats.totalRP}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase">RP</span>
             </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

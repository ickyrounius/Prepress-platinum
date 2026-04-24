'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, User, Tag, 
  ArrowRight, ChartLineUp,
  CircleNotch
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: string;
  actor_uid: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: any;
  metadata?: any;
}

export const RecentActivityList = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "audit_logs"),
      orderBy("timestamp", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsList: AuditLog[] = [];
      snapshot.forEach((doc) => {
        logsList.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      setLogs(logsList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching audit logs:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getActionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'text-emerald-500 bg-emerald-50';
    if (a.includes('delete') || a.includes('remove')) return 'text-rose-500 bg-rose-50';
    if (a.includes('update') || a.includes('edit')) return 'text-amber-500 bg-amber-50';
    return 'text-indigo-500 bg-indigo-50';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <CircleNotch className="w-8 h-8 text-indigo-500 animate-spin" weight="bold" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Log Aktivitas...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartLineUp size={20} weight="bold" className="text-indigo-600" />
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Activity Log</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400">Live Updates</span>
      </div>

      <div className="divide-y divide-slate-50">
        <AnimatePresence mode="popLayout">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-xs font-bold uppercase">Belum ada aktivitas tercatat</p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  getActionColor(log.action)
                )}>
                  <Tag size={20} weight="bold" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-800 uppercase truncate">
                      {log.action.replace('_', ' ')}
                    </span>
                    <ArrowRight size={10} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase truncate">
                      {log.entity_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <User size={12} weight="bold" /> {log.actor_uid.substring(0, 8)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} weight="bold" /> 
                      {log.timestamp ? formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                    <div className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-tighter">
                        ID: {log.entity_id.substring(0, 10)}
                    </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4 bg-slate-50 text-center">
        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
          View Full Audit Report
        </button>
      </div>
    </div>
  );
};

// Utility to merge classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

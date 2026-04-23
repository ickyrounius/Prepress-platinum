'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { History, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

interface LogEntry {
  id: string;
  TGL_LOG: string | number | Date;
  id_jop?: string;
  NO_JOP?: string;
  BUYER?: string;
  QC_USER?: string;
  operator_id?: string;
  ST_APPROVAL?: string;
  ST_BLUEPRINT?: string;
  ST_PRO_JOP?: string;
}

export default function LogHistoryPage() {
  const { role } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'QC' | 'BLUEPRINT'>('QC');

  useEffect(() => {
    const colName = activeType === 'QC' ? 'logs_qc' : 'logs_blueprint';
    const q = query(collection(db, colName), orderBy('TGL_LOG', 'desc'), limit(100));
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        type: activeType,
        ...doc.data()
      }));
      setLogs(logData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeType]);

  const isAuthorized = role?.toUpperCase() === 'ADMIN' || role?.toUpperCase() === 'DEVELOPER';

  if (!isAuthorized && !loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <History className="w-12 h-12 text-slate-200" />
        <p className="text-slate-400 font-medium italic">Restricted Access: Monitoring system admin logs requires elevated permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Log History
          <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] rounded-full uppercase tracking-widest font-bold">Audit Trail</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium tracking-tight">Traceable activity logs for all workflow transitions.</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveType('QC')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeType === 'QC' ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" : "text-slate-400"}`}
        >
          QC LOGS
        </button>
        <button 
          onClick={() => setActiveType('BLUEPRINT')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeType === 'BLUEPRINT' ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" : "text-slate-400"}`}
        >
          BLUEPRINT LOGS
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Affects JOP</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator / Action</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-sans">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-20 text-center animate-pulse text-slate-400">Fetching logs...</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800">{new Date(log.TGL_LOG).toLocaleDateString()}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.TGL_LOG).toLocaleTimeString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-indigo-600">#{log.id_jop || log.NO_JOP}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{log.BUYER || "No Buyer Data"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                       <UserIcon size={14} />
                     </div>
                     <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{log.QC_USER || log.operator_id || "System"}</span>
                       <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{log.ST_APPROVAL || log.ST_BLUEPRINT || "Updated"}</span>
                     </div>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                   <span className="text-[10px] font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-full uppercase">
                     {log.ST_PRO_JOP || "Modified"}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

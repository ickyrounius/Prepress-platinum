'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { RecentActivityList } from '@/components/admin/RecentActivityList';
import { 
  Users, Briefcase, FileText, 
  ShieldCheck, Gear, Database,
  ArrowRight, PlusCircle, UserGear
} from '@phosphor-icons/react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminPanel() {
  const [stats, setStats] = useState({
    users: 0,
    jop: 0,
    jos: 0,
    logs: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersSnap, jopSnap, josSnap, logsSnap] = await Promise.all([
          getDocs(collection(db, "T_USERS")),
          getDocs(collection(db, "workflows_jop")),
          getDocs(collection(db, "workflows_jos")),
          getDocs(collection(db, "audit_logs"))
        ]);

        setStats({
          users: usersSnap.size,
          jop: jopSnap.size,
          jos: josSnap.size,
          logs: logsSnap.size
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    { label: "User Management", desc: "Atur hak akses & role", icon: UserGear, href: "/users", color: "text-indigo-600 bg-indigo-50" },
    { label: "Register New JOS", desc: "Input data JOS baru", icon: PlusCircle, href: "/panel/dg/input-jos", color: "text-emerald-600 bg-emerald-50" },
    { label: "Register New JOP", desc: "Input data JOP baru", icon: PlusCircle, href: "/panel/dt/input-jop", color: "text-blue-600 bg-blue-50" },
    { label: "KPI Settings", desc: "Konfigurasi formula TC", icon: Gear, href: "/panel/kpi", color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <ShieldCheck className="text-indigo-400" weight="bold" size={14} />
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">System Master Console</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest text-[10px]">Pusat Kendali Operasional, Audit Log, dan Manajemen Basis Data</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <Database size={24} weight="bold" className="text-white" />
             </div>
             <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">System Health</p>
                <p className="text-sm font-black text-white uppercase">Cloud Active</p>
             </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard label="Total Users" value={isLoading ? '...' : stats.users} icon="Users" color="indigo" description="Registered accounts" />
        <AdminStatsCard label="Active JOP" value={isLoading ? '...' : stats.jop} icon="Briefcase" color="emerald" description="On-process blocks" />
        <AdminStatsCard label="Active JOS" value={isLoading ? '...' : stats.jos} icon="FileText" color="amber" description="Design workflows" />
        <AdminStatsCard label="Audit Events" value={isLoading ? '...' : stats.logs} icon="ChartLineUp" color="slate" description="Security logs recorded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Quick Navigation</h3>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, idx) => (
              <Link href={action.href} key={idx}>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", action.color)}>
                      <action.icon size={24} weight="bold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">{action.label}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-indigo-100">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <h4 className="text-sm font-black uppercase tracking-widest mb-2">Developer Access</h4>
             <p className="text-[10px] font-bold text-indigo-100 leading-relaxed uppercase">Gunakan panel ini untuk monitoring performa database dan audit trail secara langsung.</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">System Audit Feed</h3>
           <RecentActivityList />
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  User, ShieldCheck, Trophy, Medal, 
  Lightning, TrendUp, Clock, CheckCircle,
  CaretLeft, ChartLineUp, Stack, Cube,
  Calendar
} from '@phosphor-icons/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { resolveWorkflowStatus, classifyWorkflowStatus } from '@/lib/workflow';
import type { DashboardItem } from '@/lib/types';

function UserPerformanceContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [rawItems, setRawItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch User Profile
  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      const userRef = doc(db, "T_USERS", id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };
    fetchUser();
  }, [id]);

  // 2. Fetch User Activities across all collections
  useEffect(() => {
    if (!userData?.NAMA && !userData?.displayName) return;
    const userName = userData.NAMA || userData.displayName;

    const collections = [
      'proses_dt_b',
      'proses_jod',
      'proses_ctp_b',
      'proses_ctcp_b',
      'proses_flexo_b',
      'proses_etching_b',
      'proses_screen_b',
      'proses_support_b',
    ];

    const unsubscribes = collections.map(col => {
      const q = query(collection(db, col));
      return onSnapshot(q, (snapshot) => {
        const items: DashboardItem[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          // Filter by PIC in snapshot loop to keep it simple but real-time
          if (
            String(d.pic_utama || d.PIC_UTAMA || d.pic || '').toUpperCase() === userName.toUpperCase() ||
            String(d.pic_support || d.PIC_SUPPORT || '').toUpperCase() === userName.toUpperCase()
          ) {
            const sourceType = col === 'proses_dt_b' ? 'DT' : col === 'proses_jod' ? 'DG' : col === 'proses_support_b' ? 'SUPPORT' : 'PROD';
            items.push({ id: doc.id, sourceType, ...d } as DashboardItem);
          }
        });
        
        setRawItems(prev => {
          const others = prev.filter(p => !items.some(newItem => newItem.id === p.id));
          return [...others, ...items];
        });
      });
    });

    const timer = setTimeout(() => setLoading(false), 2000);
    return () => {
      unsubscribes.forEach(unsub => unsub());
      clearTimeout(timer);
    };
  }, [userData]);

  // 3. Process Stats
  const stats = useMemo(() => {
    let totalTC = 0;
    let completedCount = 0;
    let activeCount = 0;
    let holdCount = 0;

    rawItems.forEach(item => {
      const status = resolveWorkflowStatus(item as Record<string, unknown>, item.sourceType || '');
      const bucket = classifyWorkflowStatus(status, String(item.ST_PRO_JOP || item.ST_PRO_JOS || ''));
      
      const tcU = Number(item.tc_utama || item.TC_UTAMA || 0);
      const tcS = Number(item.TC_SUPPORT || item.tc_support || 0);
      
      totalTC += (tcU + tcS);

      if (bucket === 'closed') completedCount++;
      else if (bucket === 'hold') holdCount++;
      else activeCount++;
    });

    return { totalTC, completedCount, activeCount, holdCount, totalJobs: rawItems.length };
  }, [rawItems]);

  // 4. Trend Data (Last 7 Days)
  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        dateStr: d.toDateString(),
        count: 0 
      };
    });

    rawItems.forEach(item => {
      const ts = item.timestamp_input as any;
      let d: Date | null = null;
      if (ts?.toDate) d = ts.toDate();
      else if (ts) d = new Date(ts);

      if (d) {
        const dayMatch = days.find(day => day.dateStr === d?.toDateString());
        if (dayMatch) dayMatch.count++;
      }
    });

    return days;
  }, [rawItems]);

  if (loading && !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Menghubungkan ke Performa Cloud...</p>
      </div>
    );
  }

  if (!userData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center shadow-inner">
           <User size={40} weight="bold" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">User Tidak Ditemukan</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Data profil user tidak tersedia atau ID tidak valid dalam sistem.</p>
        </div>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile */}
      <div className="bg-slate-900 p-8 sm:p-14 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10">
          <button 
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <CaretLeft weight="bold" /> Kembali
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl ring-4 ring-white/10 relative group">
                <User size={64} weight="fill" className="text-white opacity-80" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck weight="fill" size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
                    {userData?.NAMA || userData?.displayName || 'User Profile'}
                  </h1>
                  {userData?.ACTIVE !== false && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-500/30">ONLINE</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{userData?.KATEGORI || 'GUEST'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <Clock size={14} /> Terakhir Aktif: {userData?.LAST_LOGIN || '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Pencapaian TC</p>
                  <p className="text-4xl font-black text-white leading-none">{stats.totalTC.toFixed(1)}</p>
               </div>
               <div className="w-px h-12 bg-white/10 mx-2 hidden sm:block"></div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Success Rate</p>
                  <p className="text-4xl font-black text-white leading-none">
                    {stats.totalJobs > 0 ? ((stats.completedCount / stats.totalJobs) * 100).toFixed(0) : 0}%
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPICard title="Total Jobs" value={stats.totalJobs} icon={Stack} color="bg-indigo-50 text-indigo-600" />
        <KPICard title="Selesai" value={stats.completedCount} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
        <KPICard title="Aktif/Proses" value={stats.activeCount} icon={Lightning} color="bg-blue-50 text-blue-600" />
        <KPICard title="Hold/Pending" value={stats.holdCount} icon={Clock} color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <TrendUp weight="bold" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktivitas 7 Hari Terakhir</p>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tren Produktivitas</h4>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="Jumlah Job" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Calendar weight="bold" size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Aktivitas Terakhir</h4>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {rawItems.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <Cube size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Belum ada aktivitas</p>
              </div>
            ) : (
              rawItems.slice(0, 10).map((item, i) => {
                const status = resolveWorkflowStatus(item as Record<string, unknown>, item.sourceType || '');
                const bucket = classifyWorkflowStatus(status, String(item.ST_PRO_JOP || item.ST_PRO_JOS || ''));
                
                return (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start justify-between group/item hover:bg-white hover:border-indigo-100 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          bucket === 'closed' ? "bg-emerald-500" : bucket === 'hold' ? "bg-amber-500" : "bg-blue-500"
                        )}></span>
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{item.id}</p>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[120px]">{String(item.buyer || 'No Buyer')}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.sourceType}</p>
                       <p className="text-[8px] font-bold text-slate-300 uppercase italic">Recent</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserPerformancePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Inisialisasi Halaman...</p>
      </div>
    }>
      <UserPerformanceContent />
    </Suspense>
  );
}

function KPICard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all"
    >
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-inner", color)}>
        <Icon weight="bold" size={28} />
      </div>
    </motion.div>
  );
}

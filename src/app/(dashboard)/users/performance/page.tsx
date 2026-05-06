'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, getDocs, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  User, ShieldCheck,
  Lightning, TrendUp, Clock, CheckCircle,
  CaretLeft, Stack, Cube,
  Calendar, Wrench, Monitor
} from '@phosphor-icons/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { resolveWorkflowStatus, classifyWorkflowStatus } from '@/lib/workflow';
import type { DashboardItem, UserData } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// Role Config
// ─────────────────────────────────────────────────────────────────────────────

type RoleConfig = {
  allowedTypes: Set<string>;
  collections: string[];
  gradient: string;
  accent: string;
  dept: string;
  showTC: boolean; // TC metric only meaningful for DT/DG
};

const ALL_COLLECTIONS = [
  'proses_dt_b', 'proses_jod', 'proses_ctp_b', 'proses_ctcp_b',
  'proses_flexo_b', 'proses_etching_b', 'proses_screen_b', 'proses_support_b',
];
const ALL_TYPES = new Set(['DT','DG','CTP','CTCP','FLEXO','SCREEN','ETCHING','GMG','CNC','BLUEPRINT','QC']);

function getRoleConfig(role: string): RoleConfig {
  const r = role.toUpperCase().trim();

  if (['DT','CAD','SPV DT','ADMIN DT'].includes(r)) return {
    allowedTypes: new Set(['DT']), collections: ['proses_dt_b'],
    gradient: 'from-indigo-900 via-indigo-800 to-violet-900', accent: '#818cf8', dept: 'Design Teknik', showTC: true,
  };
  if (['DG','DS','SPV DG','ADMIN DG'].includes(r)) return {
    allowedTypes: new Set(['DG']), collections: ['proses_jod'],
    gradient: 'from-violet-900 via-purple-800 to-fuchsia-900', accent: '#c084fc', dept: 'Design Grafis', showTC: true,
  };
  if (r === 'OP CTP') return {
    allowedTypes: new Set(['CTP']), collections: ['proses_ctp_b'],
    gradient: 'from-sky-900 via-blue-800 to-cyan-900', accent: '#38bdf8', dept: 'Operator CTP', showTC: false,
  };
  if (r === 'OP CTCP') return {
    allowedTypes: new Set(['CTCP']), collections: ['proses_ctcp_b'],
    gradient: 'from-cyan-900 via-teal-800 to-emerald-900', accent: '#2dd4bf', dept: 'Operator CTCP', showTC: false,
  };
  if (r === 'OP FLEXO') return {
    allowedTypes: new Set(['FLEXO']), collections: ['proses_flexo_b'],
    gradient: 'from-orange-900 via-amber-800 to-yellow-900', accent: '#fb923c', dept: 'Operator Flexo', showTC: false,
  };
  if (r === 'OP SCREEN') return {
    allowedTypes: new Set(['SCREEN']), collections: ['proses_screen_b'],
    gradient: 'from-lime-900 via-green-800 to-emerald-900', accent: '#86efac', dept: 'Operator Screen', showTC: false,
  };
  if (r === 'OP ETCHING') return {
    allowedTypes: new Set(['ETCHING']), collections: ['proses_etching_b'],
    gradient: 'from-stone-900 via-zinc-800 to-slate-900', accent: '#a8a29e', dept: 'Operator Etching', showTC: false,
  };
  if (r === 'QC') return {
    allowedTypes: new Set(['QC']), collections: ['proses_support_b'],
    gradient: 'from-rose-900 via-pink-800 to-fuchsia-900', accent: '#f472b6', dept: 'Quality Control', showTC: false,
  };
  if (r === 'GMG') return {
    allowedTypes: new Set(['GMG']), collections: ['proses_support_b'],
    gradient: 'from-blue-900 via-sky-800 to-indigo-900', accent: '#60a5fa', dept: 'GMG', showTC: false,
  };
  if (r === 'CNC') return {
    allowedTypes: new Set(['CNC']), collections: ['proses_support_b'],
    gradient: 'from-zinc-900 via-gray-800 to-slate-900', accent: '#94a3b8', dept: 'CNC', showTC: false,
  };
  if (r === 'BLUEPRINT') return {
    allowedTypes: new Set(['BLUEPRINT']), collections: ['proses_support_b'],
    gradient: 'from-indigo-900 via-blue-800 to-sky-900', accent: '#93c5fd', dept: 'Blueprint', showTC: false,
  };
  if (r === 'SUPPORT DESIGN') return {
    allowedTypes: new Set(['GMG','CNC','BLUEPRINT','QC']), collections: ['proses_support_b'],
    gradient: 'from-teal-900 via-cyan-800 to-sky-900', accent: '#5eead4', dept: 'Support Design', showTC: false,
  };
  if (['SPV PREPRESS','KOORDINATOR','ADMIN PREPRESS'].includes(r)) return {
    allowedTypes: new Set(['CTP','CTCP','FLEXO','SCREEN','ETCHING','GMG','CNC','BLUEPRINT','QC']),
    collections: ALL_COLLECTIONS,
    gradient: 'from-emerald-900 via-teal-800 to-cyan-900', accent: '#34d399', dept: 'Prepress', showTC: false,
  };
  // Default: Admin / Manager / Developer / SPV
  return {
    allowedTypes: ALL_TYPES, collections: ALL_COLLECTIONS,
    gradient: 'from-slate-900 via-slate-800 to-slate-900', accent: '#6366f1', dept: 'All Department', showTC: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function resolveSourceType(col: string, data: Record<string, unknown>): string {
  const MAP: Record<string, string> = {
    proses_dt_b: 'DT', proses_jod: 'DG', proses_ctp_b: 'CTP',
    proses_ctcp_b: 'CTCP', proses_flexo_b: 'FLEXO',
    proses_screen_b: 'SCREEN', proses_etching_b: 'ETCHING',
  };
  if (MAP[col]) return MAP[col];
  if (col === 'proses_support_b') {
    const mc = String(data.MACHINE_CODE || data.machine_code || '').toUpperCase();
    if (mc === 'GMG') return 'GMG';
    if (mc === 'CNC') return 'CNC';
    if (mc === 'BPR' || mc === 'BLUEPRINT') return 'BLUEPRINT';
    if (mc === 'QC') return 'QC';
    return 'SUPPORT';
  }
  return 'PROD';
}

function resolveDate(item: DashboardItem): Date | null {
  // Try Firestore Timestamp first, then fallback to string DATE field
  const ts = item.timestamp_input as any;
  if (ts?.toDate) return ts.toDate();
  if (ts) { const d = new Date(ts); if (!isNaN(d.getTime())) return d; }
  const dateStr = item.DATE || item.date as any;
  if (dateStr) { const d = new Date(String(dateStr)); if (!isNaN(d.getTime())) return d; }
  return null;
}

function resolveBuyer(item: DashboardItem): string {
  return String(
    item.buyer || item.BUYER ||
    item.JOP_NAME || item.jop_name ||
    item.no_jop || item.NO_JOP ||
    'No Ref'
  );
}

const SOURCE_BADGE_COLORS: Record<string, string> = {
  DT: 'bg-indigo-100 text-indigo-700',
  DG: 'bg-violet-100 text-violet-700',
  CTP: 'bg-sky-100 text-sky-700',
  CTCP: 'bg-cyan-100 text-cyan-700',
  FLEXO: 'bg-orange-100 text-orange-700',
  SCREEN: 'bg-lime-100 text-lime-700',
  ETCHING: 'bg-stone-100 text-stone-700',
  GMG: 'bg-blue-100 text-blue-700',
  CNC: 'bg-zinc-100 text-zinc-700',
  BLUEPRINT: 'bg-indigo-100 text-indigo-600',
  QC: 'bg-rose-100 text-rose-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

function UserPerformanceContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [rawItems, setRawItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoised role config — recomputed only when KATEGORI changes
  const roleConfig = useMemo(
    () => getRoleConfig(userData?.KATEGORI || ''),
    [userData?.KATEGORI]
  );

  // 1. Fetch User Profile
  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'T_USERS', id)).then((snap) => {
      if (snap.exists()) setUserData(snap.data() as UserData);
    });
  }, [id]);

  // 2. Fetch Activities
  useEffect(() => {
    const name = userData?.NAMA || userData?.displayName;
    if (!id || !name) return;
    let cancelled = false;

    const fetchActivities = async () => {
      setLoading(true);
      const normalizedName = String(name).trim();

      const jobs = roleConfig.collections.flatMap((col) => [
        { col, task: getDocs(query(collection(db, col), where('PIC_UTAMA_UID', '==', id))) },
        { col, task: getDocs(query(collection(db, col), where('PIC_SUPPORT_UIDS', 'array-contains', id))) },
        { col, task: getDocs(query(collection(db, col), where('PIC_UTAMA', '==', normalizedName))) },
        { col, task: getDocs(query(collection(db, col), where('pic_utama', '==', normalizedName))) },
        { col, task: getDocs(query(collection(db, col), where('PIC_SUPPORT', '==', normalizedName))) },
        { col, task: getDocs(query(collection(db, col), where('pic_support', '==', normalizedName))) },
      ]);

      // allSettled: one failed query won't block the rest
      const results = await Promise.allSettled(jobs.map((j) => j.task));
      if (cancelled) return;

      const deduped = new Map<string, DashboardItem>();
      results.forEach((result, idx) => {
        if (result.status !== 'fulfilled') return; // skip failed queries silently
        const col = jobs[idx].col;
        result.value.forEach((docSnap) => {
          const data = docSnap.data();
          const sourceType = resolveSourceType(col, data);
          if (!roleConfig.allowedTypes.has(sourceType)) return;
          const key = `${col}:${docSnap.id}`;
          deduped.set(key, { id: docSnap.id, sourceType, ...data } as DashboardItem);
        });
      });

      setRawItems(Array.from(deduped.values()));
      if (!cancelled) setLoading(false);
    };

    void fetchActivities().catch((err) => {
      console.error('Error loading user activities:', err);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id, userData, roleConfig]);

  // 3. Stats
  const stats = useMemo(() => {
    let totalTC = 0, completedCount = 0, activeCount = 0, holdCount = 0;
    rawItems.forEach(item => {
      const status = resolveWorkflowStatus(item as Record<string, unknown>, item.sourceType || '');
      const bucket = classifyWorkflowStatus(status, String(item.ST_PRO_JOP || item.ST_PRO_JOS || ''));
      if (roleConfig.showTC) {
        totalTC += Number(item.tc_utama || item.TC_UTAMA || 0) + Number(item.TC_SUPPORT || item.tc_support || 0);
      }
      if (bucket === 'closed') completedCount++;
      else if (bucket === 'hold') holdCount++;
      else activeCount++;
    });
    return { totalTC, completedCount, activeCount, holdCount, totalJobs: rawItems.length };
  }, [rawItems, roleConfig.showTC]);

  // 4. Breakdown per type
  const breakdown = useMemo(() => {
    const map: Record<string, number> = {};
    rawItems.forEach(item => { map[item.sourceType] = (map[item.sourceType] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count }));
  }, [rawItems]);

  // 5. Trend (last 7 days) — uses resolveDate helper with DATE fallback
  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return { name: d.toLocaleDateString('id-ID', { weekday: 'short' }), dateStr: d.toDateString(), count: 0 };
    });
    rawItems.forEach(item => {
      const d = resolveDate(item);
      if (d) { const day = days.find(x => x.dateStr === d.toDateString()); if (day) day.count++; }
    });
    return days;
  }, [rawItems]);

  // 6. Activity feed — sorted newest first
  const sortedActivity = useMemo(() => {
    return [...rawItems].sort((a, b) => {
      const da = resolveDate(a)?.getTime() ?? 0;
      const db2 = resolveDate(b)?.getTime() ?? 0;
      return db2 - da;
    }).slice(0, 12);
  }, [rawItems]);

  // ── Loading ──
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
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xs mx-auto">Data profil user tidak tersedia atau ID tidak valid.</p>
        </div>
        <button onClick={() => router.back()} className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">
          Kembali
        </button>
      </div>
    );
  }

  const userName = userData?.NAMA || userData?.displayName || 'User Profile';
  const userKategori = userData?.KATEGORI || 'GUEST';

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header — role-themed gradient ── */}
      <div className={cn('p-8 sm:p-14 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-slate-200 bg-gradient-to-br', roleConfig.gradient)}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl" />

        <div className="relative z-10">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <CaretLeft weight="bold" /> Kembali
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur rounded-[2.5rem] flex items-center justify-center shadow-2xl ring-4 ring-white/10 relative">
                <User size={64} weight="fill" className="text-white opacity-80" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white/20 backdrop-blur border-4 border-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck weight="fill" size={20} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">{userName}</h1>
                  {userData?.ACTIVE !== false && (
                    <span className="px-3 py-1 bg-white/10 text-white/80 text-[9px] font-black rounded-lg border border-white/20">AKTIF</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-white/60">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <ShieldCheck size={13} className="text-white/80" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">{userKategori}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <Wrench size={13} className="text-white/80" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{roleConfig.dept}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                    <Clock size={13} /> Terakhir Aktif: {userData?.LAST_LOGIN || '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {roleConfig.showTC && (
                <>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Total TC</p>
                    <p className="text-4xl font-black text-white leading-none">{stats.totalTC.toFixed(1)}</p>
                  </div>
                  <div className="w-px h-12 bg-white/10 mx-2 hidden sm:block" />
                </>
              )}
              <div className="text-right">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-4xl font-black text-white leading-none">
                  {stats.totalJobs > 0 ? ((stats.completedCount / stats.totalJobs) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <KPICard title="Total Jobs" value={stats.totalJobs} icon={Stack} color="bg-indigo-50 text-indigo-600" />
        <KPICard title="Selesai" value={stats.completedCount} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
        <KPICard title="Aktif/Proses" value={stats.activeCount} icon={Lightning} color="bg-blue-50 text-blue-600" />
        <KPICard title="Hold/Pending" value={stats.holdCount} icon={Clock} color="bg-amber-50 text-amber-600" />
      </div>

      {/* ── Charts + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Trend */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
              <TrendUp weight="bold" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktivitas 7 Hari Terakhir</p>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tren Produktivitas</h4>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={roleConfig.accent} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={roleConfig.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} allowDecimals={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="count" name="Jumlah Job" stroke={roleConfig.accent} strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Calendar weight="bold" size={24} />
            </div>
            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Aktivitas Terakhir</h4>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : sortedActivity.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <Cube size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Belum ada aktivitas</p>
              </div>
            ) : (
              sortedActivity.map((item) => {
                const status = resolveWorkflowStatus(item as Record<string, unknown>, item.sourceType || '');
                const bucket = classifyWorkflowStatus(status, String(item.ST_PRO_JOP || item.ST_PRO_JOS || ''));
                const badgeColor = SOURCE_BADGE_COLORS[item.sourceType] || 'bg-slate-100 text-slate-600';
                return (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-indigo-100 transition-all">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 flex-shrink-0 rounded-full', bucket === 'closed' ? 'bg-emerald-500' : bucket === 'hold' ? 'bg-amber-500' : 'bg-blue-500')} />
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate">{item.id}</p>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[130px]">{resolveBuyer(item)}</p>
                    </div>
                    <span className={cn('flex-shrink-0 ml-2 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest', badgeColor)}>
                      {item.sourceType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Breakdown per Type (multi-type roles only) ── */}
      {breakdown.length > 1 && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center shadow-inner">
              <Monitor weight="bold" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Distribusi Per Tipe</p>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Job Breakdown</h4>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {breakdown.map(({ type, count }) => (
              <div key={type} className={cn('flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-black uppercase tracking-widest', SOURCE_BADGE_COLORS[type] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                <span>{type}</span>
                <span className="bg-white/60 px-2 py-0.5 rounded-lg text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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

type IconComponent = React.ComponentType<any>;

function KPICard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: IconComponent; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all"
    >
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-inner', color)}>
        <Icon weight="bold" size={28} />
      </div>
    </motion.div>
  );
}

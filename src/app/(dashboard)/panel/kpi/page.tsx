'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { 
  Trophy, Medal,
  ChartBar, Users, Lightning,
  TrendUp,
  CircleNotch, Star, Crown,
  Pulse
} from '@phosphor-icons/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';

// Default Fallback Multipliers
const DEFAULT_WEIGHTS = {
  prepress: {
    CTP: 1.0,
    CTCP: 1.0,
    SCREEN: 3.0,
    FLEXO: 4.0,
    ETCHING: 5.0
  },
  support: {
    BLUEPRINT: 2.0,
    GMG: 5.0,
    CNC: 10.0
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

interface KPIItem extends Record<string, unknown> {
  id: string;
  _category: string;
  _tool?: string;
}

interface KPIStatsItem {
  pic: string;
  score: number;
  jobCount: number;
  dept: string;
}

export default function KPIPage() {
  const [data, setData] = useState<Record<string, KPIItem[]>>({
    design: [],
    technical: [],
    prepress: [],
    support: []
  });
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Dynamic KPI Weights (Settings)
    const unsubWeights = onSnapshot(doc(db, "m_settings", "kpi_config"), (doc) => {
      if (doc.exists()) {
        setWeights(doc.data() as typeof DEFAULT_WEIGHTS);
      }
    });

    // 2. Listen for Process Data
    const collections = [
        { name: 'proses_jod', category: 'design' },
        { name: 'proses_dt_b', category: 'technical' },
        { name: 'proses_ctp_b', category: 'prepress', tool: 'CTP' },
        { name: 'proses_ctcp_b', category: 'prepress', tool: 'CTCP' },
        { name: 'proses_flexo_b', category: 'prepress', tool: 'FLEXO' },
        { name: 'proses_screen_b', category: 'prepress', tool: 'SCREEN' },
        { name: 'proses_etching_b', category: 'prepress', tool: 'ETCHING' },
        { name: 'proses_support_b', category: 'support' },
    ];

    const unsubscribes = collections.map(col => {
        const q = query(collection(db, col.name));
        return onSnapshot(q, (snapshot) => {
            const items: KPIItem[] = [];
            snapshot.forEach(doc => items.push({ 
                ...doc.data(), 
                id: doc.id, 
                _category: col.category, 
                _tool: col.tool 
            }));
            
            setData(prev => {
                if (col.category === 'prepress') {
                    const others = prev.prepress.filter(i => i._tool !== col.tool);
                    return { ...prev, prepress: [...others, ...items] };
                }
                return { ...prev, [col.category]: items };
            });
        });
    });

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => {
        unsubWeights();
        unsubscribes.forEach(unsub => unsub());
        clearTimeout(timer);
    };
  }, []);

  const kpiData = useMemo(() => {
    const stats: Record<string, KPIStatsItem> = {};

    const processItem = (item: KPIItem, scoreVal: number, defaultDept: string) => {
        const pic = String(item.pic_utama || item.pic || item.PIC || 'Unknown');
        if (pic === 'Unknown' || pic === '-') return;

        if (!stats[pic]) {
            stats[pic] = { pic, score: 0, jobCount: 0, dept: defaultDept };
        }
        stats[pic].score += scoreVal;
        stats[pic].jobCount += 1;
    };

    // 1. Design
    data.design.forEach(item => {
        const status = String(item.status_dg || item.ST_WORKFLOW || item.status_workflow || '').toUpperCase();
        if (['DONE', 'CLOSED', 'SELESAI'].includes(status)) {
            processItem(item, Number(item.total_tc) || 0, 'DESIGN');
        }
    });

    // 2. Technical
    data.technical.forEach(item => {
        const status = String(item.status_dt || item.ST_WORKFLOW || item.status_workflow || '').toUpperCase();
        if (['DONE', 'CLOSED', 'SELESAI'].includes(status)) {
            processItem(item, Number(item.total_tc) || 0, 'TECHNICAL');
        }
    });

    // 3. Prepress
    data.prepress.forEach(item => {
        const status = String(item.status_workflow || '').toUpperCase();
        if (['DONE', 'SELESAI'].includes(status)) {
            const tool = item._tool as keyof typeof DEFAULT_WEIGHTS.prepress;
            const multiplier = weights.prepress[tool] || 1.0;
            const score = (Number(item.plate_baik || item.plate_ok) || 0) * multiplier;
            processItem(item, score, 'PREPRESS');
        }
    });

    // 4. Support
    data.support.forEach(item => {
        const status = String(item.status_workflow || '').toUpperCase();
        if (['DONE', 'SELESAI'].includes(status)) {
            const typeValue = String(item.type_support || '').toUpperCase() as keyof typeof DEFAULT_WEIGHTS.support;
            const multiplier = weights.support[typeValue] || 1.0;
            const score = (Number(item.qty_output) || 0) * multiplier;
            processItem(item, score, 'SUPPORT');
        }
    });

    return Object.values(stats).sort((a, b) => b.score - a.score);
  }, [data, weights]);

  const top3 = kpiData.slice(0, 3);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
        <div className="relative">
            <CircleNotch size={64} weight="bold" className="text-indigo-500 animate-spin" />
            <Lightning size={24} weight="fill" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Mengkalkulasi KPI</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Menghitung akumulasi TC & Output per PIC...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      <motion.div variants={itemVariants} className="bg-slate-900 p-8 sm:p-14 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <Trophy className="text-amber-400" weight="fill" size={16} />
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">Performance Leaderboard</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                KPI Assessment <br />
                <span className="text-indigo-400">Prepress Platinum</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest text-[10px] max-w-lg leading-relaxed">
                Visualisasi performa real-time berdasarkan kontribusi Technical Complexity (TC) dan output fisik operasional.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all group">
                <TrendUp size={24} weight="bold" className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Verified TC</p>
                <p className="text-2xl font-black text-white">{kpiData.reduce((acc, curr) => acc + curr.score, 0).toFixed(1)}</p>
             </div>
             <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all group">
                <Users size={24} weight="bold" className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Active PICs</p>
                <p className="text-2xl font-black text-white">{kpiData.length}</p>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        {top3[1] && (
            <motion.div 
               variants={itemVariants}
               whileHover={{ y: -10, scale: 1.02 }}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative pt-16 hover:shadow-xl transition-all h-[240px] flex flex-col justify-center group"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-slate-100 rounded-[2rem] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    <span className="text-3xl font-black text-slate-300">#2</span>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">{top3[1].dept}</p>
                <h3 className="text-2xl font-black text-slate-800 mb-2 truncate">{top3[1].pic}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-xl text-slate-600 font-black group-hover:bg-indigo-50 transition-all">
                    <Star weight="fill" className="text-slate-400 group-hover:text-indigo-400" /> {top3[1].score.toFixed(1)} <span className="text-[9px] opacity-70">PTS</span>
                </div>
            </motion.div>
        )}

        {top3[0] && (
            <motion.div 
               variants={itemVariants}
               whileHover={{ scale: 1.05 }}
               className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200 text-center relative pt-20 h-[300px] flex flex-col justify-center border-4 border-white/20 group overflow-hidden"
            >
                <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-amber-400 rounded-[2.5rem] border-[6px] border-white shadow-xl flex items-center justify-center z-10"
                >
                    <Crown size={40} weight="fill" className="text-white drop-shadow-md" />
                </motion.div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-50"></div>
                
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2 animate-pulse">RANK #1 GLOBAL</p>
                    <h3 className="text-3xl font-black text-white mb-3 truncate drop-shadow-sm">{top3[0].pic}</h3>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 rounded-2xl text-white font-black backdrop-blur-md border border-white/10 group-hover:bg-white/30 transition-all">
                        <Lightning weight="fill" className="text-amber-300 animate-bounce" /> {top3[0].score.toFixed(1)} <span className="text-[10px] opacity-80 pl-1 uppercase">Points</span>
                    </div>
                </div>
            </motion.div>
        )}

        {top3[2] && (
            <motion.div 
               variants={itemVariants}
               whileHover={{ y: -10, scale: 1.02 }}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative pt-16 hover:shadow-xl transition-all h-[220px] flex flex-col justify-center group"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-50 rounded-[2rem] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                    <span className="text-3xl font-black text-orange-200">#3</span>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">{top3[2].dept}</p>
                <h3 className="text-2xl font-black text-slate-800 mb-2 truncate">{top3[2].pic}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 rounded-xl text-orange-600 font-black group-hover:bg-indigo-50 transition-all">
                    <Star weight="fill" className="text-orange-300 group-hover:text-indigo-400" /> {top3[2].score.toFixed(1)} <span className="text-[9px] opacity-70">PTS</span>
                </div>
            </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        <ChartBar weight="bold" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Efficiency Distribution</p>
                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-wider">Pencapaian TC per PIC</h4>
                    </div>
                </div>
            </div>
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiData} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false} hide />
                        <YAxis 
                           dataKey="pic" 
                           type="category" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{ fontSize: 11, fill: '#64748b', fontWeight: '800' }}
                           width={80}
                        />
                        <RechartsTooltip 
                           cursor={{ fill: '#f8fafc', radius: 10 }}
                           contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                        />
                        <Bar 
                           dataKey="score" 
                           radius={[0, 10, 10, 0]} 
                           barSize={24} 
                           name="Total Skor KPI"
                           isAnimationActive={true}
                           animationDuration={2000}
                        >
                            {kpiData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : index < 3 ? '#94a3b8' : '#e2e8f0'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Medal weight="bold" className="text-amber-500 group-hover:rotate-12 transition-transform" /> Leaderboard Details
                </h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                    <Pulse size={12} className="text-indigo-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">Updated 3s ago</span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {kpiData.map((pic, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={pic.pic} 
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-indigo-600 hover:border-indigo-700 transition-all cursor-default group/item shadow-sm hover:shadow-xl hover:scale-[1.01]"
                      >
                          <div className="flex items-center gap-4">
                              <span className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm transition-all group-hover/item:bg-white group-hover/item:text-indigo-600",
                                  i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-300 text-white" : "bg-white text-slate-400"
                              )}>
                                  {i + 1}
                              </span>
                              <div>
                                  <p className="text-sm font-black text-slate-700 group-hover/item:text-white transition-colors uppercase tracking-tight">{pic.pic}</p>
                                  <p className="text-[9px] font-bold text-slate-400 group-hover/item:text-indigo-100 transition-colors uppercase tracking-wider">{pic.dept} • {pic.jobCount} Jobs Done</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-lg font-black text-slate-800 group-hover/item:text-white transition-colors leading-none">{pic.score.toFixed(1)}</p>
                              <p className="text-[9px] font-bold text-slate-400 group-hover/item:text-indigo-200 transition-colors uppercase">PTS</p>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </motion.div>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell
} from 'recharts';
import {
  ChartPieSlice, Users, ChartLineUp, Trophy,
  Lightning, TrendUp, ArrowsCounterClockwise
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import TrendChart from '@/components/dashboard/TrendChart';
import type { ProductivityDataPoint, TrendDataPoint, WorkflowStatusCounts } from '@/lib/types';

interface DashboardChartsProps {
  stats: WorkflowStatusCounts;
  productivityData: ProductivityDataPoint[];
  trendData: TrendDataPoint[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardCharts({ stats, productivityData, trendData }: DashboardChartsProps) {
  const workflowStatusData = [
    { name: 'Selesai', value: stats.closed, color: '#10b981' },
    { name: 'Review/BP', value: stats.blueprint, color: '#0ea5e9' },
    { name: 'Proses', value: stats.process, color: '#3b82f6' },
    { name: 'Tertunda', value: stats.hold, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
        <motion.div variants={itemVariants} className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 sm:opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartPieSlice weight="fill" size={100} className="sm:size-[120px]" />
          </div>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 text-indigo-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <ChartPieSlice weight="bold" size={20} className="sm:size-[24px]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Overview</p>
                <h4 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wider">Status Workflow</h4>
              </div>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={true}
                  animationBegin={300}
                  animationDuration={1500}
                  data={workflowStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {workflowStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold', fontSize: '10px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Users weight="bold" size={20} className="sm:size-[24px]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Workload Capacity</p>
                <h4 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wider">Beban Kerja PIC (TC)</h4>
              </div>
            </div>
            <div className="px-3 sm:px-4 py-1.5 bg-blue-50 text-blue-600 text-[8px] sm:text-[10px] font-black rounded-xl border border-blue-100 animate-pulse whitespace-nowrap">LIVE VIEW</div>
          </div>
          <div className="h-64 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc', radius: 10 }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <Bar dataKey="tcUtama" name="Poin Utama" stackId="a" fill="#6366f1" radius={[0, 0, 8, 8]} barSize={28} isAnimationActive={true} animationDuration={2000} />
                <Bar dataKey="tcSupport" name="Poin Help" stackId="a" fill="#c7d2fe" radius={[8, 8, 0, 0]} barSize={28} isAnimationActive={true} animationDuration={2500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
        <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Trophy weight="bold" size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Rankings</p>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-wider">Top Performers PIC</h4>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[...productivityData]
              .sort((a, b) => (b.tcUtama + b.tcSupport) - (a.tcUtama + a.tcSupport))
              .slice(0, 5)
              .map((pic, idx) => {
                const total = pic.tcUtama + pic.tcSupport;
                return (
                  <div key={pic.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                        #{idx + 1}
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase">{pic.name}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-slate-900">{total}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">Points</span>
                    </div>
                  </div>
                );
              })}
            {productivityData.length === 0 && (
                <div className="py-10 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No production data yet</p>
                </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <ChartLineUp weight="bold" size={20} className="sm:size-[24px]" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Performance Trend</p>
                <h4 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wider">Tren JOP Masuk</h4>
              </div>
            </div>
          </div>
          <div className="h-64 sm:h-80 w-full">
            <TrendChart data={trendData.map(d => ({ date: d.name, value: d.jop }))} label="JOP Masuk" color="#10b981" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-1 gap-10">
        <motion.div variants={itemVariants} className="relative group">
          <Link href="/panel/kpi">
            <div className="bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between h-full group hover:scale-[1.005] transition-transform duration-500 cursor-pointer overflow-hidden border border-white/5 min-h-[280px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 w-full">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center text-white backdrop-blur-md group-hover:bg-indigo-500 group-hover:shadow-lg transition-all duration-500 shrink-0">
                    <Trophy weight="fill" size={40} className="text-amber-400 group-hover:text-white" />
                </div>

                <div className="space-y-2 text-center md:text-left flex-1">
                    <h4 className="text-3xl sm:text-4xl font-black text-white leading-tight">Prepress <span className="text-indigo-400">Platinum</span> Excellence</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Efficiency & Accuracy Achievement Rate</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4 shrink-0">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-6xl sm:text-7xl font-black text-white group-hover:text-indigo-300 transition-colors tracking-tighter">98.4<span className="text-2xl opacity-50">%</span></h2>
                    <TrendUp weight="bold" size={24} className="text-emerald-400 animate-bounce" />
                  </div>
                  <div className="w-48 bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '98.4%' }}
                      transition={{ duration: 2, ease: "easeOut", delay: 1 }}
                      className="bg-indigo-500 h-full rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-12 right-12 z-10 pt-6 border-t border-white/5 hidden md:flex items-center justify-between text-slate-500">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] group-hover:text-white transition-colors">Lihat detail ranking performa seluruh PIC secara lengkap</span>
                <ArrowsCounterClockwise weight="bold" size={16} className="group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </>
  );
}

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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line isAnimationActive={true} animationDuration={3000} type="monotone" dataKey="jop" name="JOP Masuk" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="relative group">
          <Link href="/panel/kpi">
            <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl shadow-indigo-100 flex flex-col justify-between h-full group hover:scale-[1.01] transition-transform duration-500 cursor-pointer overflow-hidden border border-white/5 min-h-[320px] sm:min-h-0">
              <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-500/10 rounded-full -mr-24 -mt-24 sm:-mr-32 sm:-mt-32 blur-3xl animate-pulse"></div>

              <div className="relative z-10 space-y-6 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 border border-white/10 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-white backdrop-blur-md group-hover:bg-indigo-500 group-hover:shadow-lg transition-all duration-500">
                    <Trophy weight="fill" size={24} className="sm:size-[28px] text-amber-400 group-hover:text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-black rounded-full border border-emerald-500/30 whitespace-nowrap">
                    <Lightning weight="fill" size={12} className="sm:size-[14px]" /> KPI TARGET MET
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight">Performa <br /><span className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-8">Prepress Platinum</span></h4>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Efficiency Achievement Rate</p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <h2 className="text-5xl sm:text-6xl font-black text-white group-hover:text-indigo-300 transition-colors">98.4<span className="text-xl sm:text-2xl opacity-50">%</span></h2>
                    <TrendUp weight="bold" size={20} className="sm:size-[24px] text-emerald-400 animate-bounce" />
                  </div>
                  <div className="w-full bg-white/5 h-3 sm:h-4 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '98.4%' }}
                      transition={{ duration: 2, ease: "easeOut", delay: 1 }}
                      className="bg-indigo-500 h-full rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-slate-500">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Lihat detail ranking PIC</span>
                <ArrowsCounterClockwise weight="bold" size={14} className="sm:size-[16px] group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </>
  );
}

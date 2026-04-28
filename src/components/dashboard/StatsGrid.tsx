'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Files, CheckCircle, PencilCircle, Gear, HandPalm, Pulse } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getKPIColorClasses } from '@/features/kpi/kpiStyles';
import type { WorkflowStatusCounts } from '@/lib/types';

interface StatsGridProps {
  stats: WorkflowStatusCounts;
}

const statCards = [
  { id: 'Total', title: 'Total JOP/JOS', icon: Files, color: 'indigo' },
  { id: 'Closed', title: 'Selesai', icon: CheckCircle, color: 'emerald' },
  { id: 'Blueprint', title: 'Review/BP', icon: PencilCircle, color: 'sky' },
  { id: 'On Process', title: 'Proses', icon: Gear, color: 'blue' },
  { id: 'Hold', title: 'Tertunda', icon: HandPalm, color: 'amber' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function StatsGrid({ stats }: StatsGridProps) {
  const statsMap: Record<string, number> = {
    Total: stats.total,
    Closed: stats.closed,
    Blueprint: stats.blueprint,
    'On Process': stats.process,
    Hold: stats.hold,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="contents"
      >
        {statCards.map((card) => {
          const colors = getKPIColorClasses(card.color);
          const href = card.id === 'Closed' ? '/dashboard/data?status=closed' : '/dashboard/data?status=aktif';
          return (
            <Link href={href} key={card.id}>
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:border-indigo-100 group cursor-pointer h-full"
              >
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 group-hover:opacity-40 opacity-20",
                colors.lightBg
              )}></div>
              <div className="relative z-10">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all shadow-inner",
                  colors.lightBg,
                  colors.text,
                  "group-hover:text-white group-hover:bg-slate-900 group-hover:shadow-lg"
                )}>
                  <card.icon weight="bold" size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">{card.title}</p>
                <h3 className={cn(
                  "text-4xl font-black transition-all group-hover:scale-110 origin-left",
                  card.id === 'Total' ? "text-slate-800" : `text-${card.color}-600`
                )}>{statsMap[card.id] || 0}</h3>
                <div className="mt-4 flex items-center gap-1.5 overflow-hidden">
                  <Pulse className={cn("w-3 h-3 group-hover:animate-pulse", colors.text)} weight="bold" />
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Real-time update</span>
                </div>
              </div>
            </motion.div>
          </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

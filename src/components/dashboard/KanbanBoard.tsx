'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { JopData, JosData } from '@/features/job/jobTypes';
import { resolveWorkflowStatus } from '@/lib/workflow';
import { 
  FileText,
  Circle, Clock, CheckCircle, 
  WarningCircle, PauseCircle,
  Stack
} from '@phosphor-icons/react';

export type KanbanItem = (JopData | JosData) & { sourceType?: 'DG' | 'DT' | 'PROD' };

interface KanbanBoardProps {
  data: KanbanItem[];
}

const COLUMN_CONFIG = [
  { id: 'pending', title: 'Pending / Assigned', statuses: ['ASSIGNED', 'REVIEW'], color: 'bg-slate-500', icon: Clock },
  { id: 'prosess', title: 'On Progress', statuses: ['LAYOUT', 'PROSESS', 'PROSES'], color: 'bg-blue-500', icon: Clock },
  { id: 'review', title: 'Waiting Review', statuses: ['BLUEPRINT', 'ACC DG&MARKETING', 'PREVIEW', 'ACC DG', 'ACC'], color: 'bg-purple-500', icon: WarningCircle },
  { id: 'hold', title: 'Hold / Revisi', statuses: ['HOLD', 'REVISI', 'REJECT'], color: 'bg-amber-500', icon: PauseCircle },
  { id: 'closed', title: 'Closed / Done', statuses: ['CLOSED', 'DONE', 'SELESAI'], color: 'bg-emerald-500', icon: CheckCircle },
];

export function KanbanBoard({ data }: KanbanBoardProps) {
  const getStatusValue = (item: KanbanItem) => {
    const status = resolveWorkflowStatus(item as Record<string, unknown>, item.sourceType);
    return status.toUpperCase();
  };

  const getItemsByColumn = (statuses: string[]) => {
    return data.filter(item => {
        const status = getStatusValue(item);
        return statuses.includes(status);
    });
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] custom-scrollbar px-2">
      {COLUMN_CONFIG.map((col) => {
        const items = getItemsByColumn(col.statuses);
        return (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", col.color)}></div>
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{col.title}</h3>
              </div>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black">
                {items.length}
              </span>
            </div>

            <div className="flex-1 bg-slate-50/50 p-3 rounded-[2.5rem] border border-slate-100 space-y-4 min-h-[500px]">
              {items.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-2">
                   <Circle className="w-8 h-8 opacity-20" />
                   <span className="text-[9px] font-bold uppercase tracking-tighter">No jobs in this stage</span>
                </div>
              ) : (
                items.map((item, i) => {
                  const isDG = item.sourceType === 'DG';
                  const isDT = item.sourceType === 'DT';
                  
                  const parentId = isDG 
                    ? (item as JosData).NO_JOS 
                    : (item as JopData).NO_JOP || item.ID || 'N/A';
                    
                  const childId = isDG 
                    ? (item as JosData).NO_JOD 
                    : (item as JopData).NO_B || '-';
                    
                  const picUtama = (isDG ? (item as JosData).DESIGNER : (item as JopData).PIC_UTAMA) || 'Unassigned';
                  const buyer = item.BUYER || '-';

                  return (
                    <motion.div
                      key={item.ID || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      {/* Decorative indicator */}
                      <div className={cn(
                        "absolute top-0 left-0 w-1 h-full",
                        isDG ? "bg-pink-500" : isDT ? "bg-blue-500" : "bg-indigo-500"
                      )}></div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                             <div className="flex items-center gap-1.5">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-white",
                                    isDG ? "bg-pink-500" : isDT ? "bg-blue-600" : "bg-indigo-600"
                                )}>
                                    {isDG ? 'DG' : isDT ? 'DT' : 'PROD'}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{parentId || 'N/A'}</span>
                             </div>
                             <div className="flex items-center gap-1 mt-0.5">
                                <Stack size={14} weight="bold" className="text-slate-300" />
                                <h4 className="text-[11px] font-black text-slate-800 uppercase line-clamp-1">{childId || 'NO-CHILD'}</h4>
                             </div>
                          </div>
                          <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-slate-100 transition-colors">
                             <FileText size={16} weight="bold" />
                          </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight line-clamp-1">{String(buyer)}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                                {picUtama.substring(0, 2).toUpperCase()}
                             </div>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{picUtama}</span>
                          </div>
                          
                          <span className={cn(
                              "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight shadow-sm",
                              col.color.replace('bg-', 'text-').replace('500', '600'),
                              col.color.replace('bg-', 'bg-').replace('500', '50')
                          )}>
                             {getStatusValue(item)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

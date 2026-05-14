'use client';

import React, { useMemo } from 'react';
import StatusPill from '@/components/ui/StatusPill';
import { JopData } from '@/features/job/jobTypes';
import { useJobList } from '@/hooks/useJobList';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Spinner from '@/components/ui/Spinner';

export interface KanbanItem extends Record<string, any> {
  sourceType?: string;
  ST_WF_JOP?: string;
  ST_WF_JOS?: string;
}

const COLUMNS = ['WAITING', 'IN_PROGRESS', 'REVIEW', 'HOLD', 'DONE'];

export function KanbanBoard({ data: propData }: { data?: KanbanItem[] }) {
  const { data: fetchedData, isLoading } = useJobList<JopData>({ 
    type: 'jop', 
    statusFilter: ['CANCEL'], // Only active jobs
    pageSize: 100 
  });

  const dataToUse = propData || fetchedData;

  const boardData = useMemo(() => {
    const columns: Record<string, any[]> = {
      WAITING: [],
      IN_PROGRESS: [],
      REVIEW: [],
      HOLD: [],
      DONE: [],
    };

    dataToUse.forEach(job => {
      const status = (job.ST_WF_JOP || '').toUpperCase();
      if (['CLOSED', 'DONE'].includes(status)) {
        columns.DONE.push(job);
      } else if (status === 'HOLD' || status === 'REVISI') {
        columns.HOLD.push(job);
      } else if (['BLUEPRINT', 'PREVIEW', 'REVIEW'].includes(status)) {
        columns.REVIEW.push(job);
      } else if (['LAYOUT', 'ON PROGRESS', 'PROSES'].includes(status)) {
        columns.IN_PROGRESS.push(job);
      } else {
        columns.WAITING.push(job);
      }
    });

    return columns;
  }, [data]);

  if (isLoading) return <div className="p-12 flex justify-center"><Spinner label="Memuat papan produksi..." /></div>;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
      {COLUMNS.map(col => (
        <div key={col} className="flex flex-col min-w-[300px] max-w-[300px] bg-slate-900/40 rounded-xl border border-slate-700/50">
          <div className="p-3 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{col}</h3>
            <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded-full text-slate-500 font-mono">
              {boardData[col]?.length || 0}
            </span>
          </div>
          
          <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-none">
            {boardData[col]?.map(job => (
              <JobCard key={job.ID} job={job} />
            ))}
            {boardData[col]?.length === 0 && (
              <div className="h-24 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-[10px] text-slate-700 italic">
                Kosong
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function JobCard({ job }: { job: JopData }) {
  return (
    <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 hover:border-blue-500/50 transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-[10px] font-bold text-blue-400">{job.NO_JOP}</span>
        <StatusPill status={job.ST_WF_JOP || ''} className="scale-75 origin-right" />
      </div>
      
      <p className="text-xs text-slate-200 font-medium mb-1 line-clamp-2">{job.NAMA_JOP}</p>
      <p className="text-[10px] text-slate-500 mb-2 truncate">{job.BUYER}</p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-400 font-bold">
            {(job.PIC_UTAMA || '?')[0].toUpperCase()}
          </div>
          <span className="text-[10px] text-slate-400 truncate max-w-[80px]">{job.PIC_UTAMA}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-bold ${
            job.LEVEL_TC === 'CRITICAL' ? 'text-red-400' : 
            job.LEVEL_TC === 'COMPLEX' ? 'text-orange-400' : 
            'text-slate-500'
          }`}>
            {job.LEVEL_TC?.slice(0,3)}
          </span>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowsCounterClockwise, DownloadSimple, ChartBar, Kanban } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { JosTypeFilter, JopTypeFilter, DateRange } from '@/lib/types';

interface FilterHeaderProps {
  viewMode: 'overview' | 'kanban';
  onViewModeChange: (mode: 'overview' | 'kanban') => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  josTypeFilter: JosTypeFilter;
  onJosTypeFilterChange: (filter: JosTypeFilter) => void;
  jopTypeFilter: JopTypeFilter;
  onJopTypeFilterChange: (filter: JopTypeFilter) => void;
  onResetFilters: () => void;
  onExportPDF: () => void;
}

export default function FilterHeader({
  viewMode,
  onViewModeChange,
  dateRange,
  onDateRangeChange,
  josTypeFilter,
  onJosTypeFilterChange,
  jopTypeFilter,
  onJopTypeFilterChange,
  onResetFilters,
  onExportPDF,
}: FilterHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col xl:flex-row items-center justify-between gap-6 transition-all hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
        <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => onViewModeChange('overview')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              viewMode === 'overview' ? "bg-white text-indigo-600 shadow-md scale-105 z-10" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <ChartBar weight="bold" /> Overview
          </button>
          <button
            onClick={() => onViewModeChange('kanban')}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              viewMode === 'kanban' ? "bg-white text-indigo-600 shadow-md scale-105 z-10" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Kanban weight="bold" /> Kanban
          </button>
        </div>

        <div className="hidden xl:block h-6 w-[1px] bg-slate-200 mx-2"></div>

        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-100 transition-all group w-full sm:w-auto justify-center"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none flex items-center gap-2">
            Live Sync <ArrowsCounterClockwise className="group-hover:rotate-180 transition-transform duration-700" weight="bold" />
          </span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center sm:justify-end">
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
          <label htmlFor="date-start" className="sr-only">Tanggal Mulai</label>
          <input
            id="date-start"
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="bg-transparent p-2 text-[9px] sm:text-[10px] font-black text-slate-600 outline-none uppercase w-full sm:w-auto"
          />
          <span className="text-slate-300 font-bold px-1">/</span>
          <label htmlFor="date-end" className="sr-only">Tanggal Selesai</label>
          <input
            id="date-end"
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="bg-transparent p-2 text-[9px] sm:text-[10px] font-black text-slate-600 outline-none uppercase w-full sm:w-auto"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <label htmlFor="jos-filter" className="sr-only">Filter JOS</label>
          <select
            id="jos-filter"
            value={josTypeFilter}
            onChange={(e) => onJosTypeFilterChange(e.target.value as JosTypeFilter)}
            className="flex-1 sm:flex-none p-3 rounded-2xl border border-slate-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white min-w-[100px]"
          >
            <option value="ALL">JOS: ALL</option>
            <option value="EXPORT">JOS: EXPORT</option>
            <option value="JASA">JOS: JASA</option>
            <option value="LOCAL">JOS: LOCAL</option>
          </select>
          <label htmlFor="jop-filter" className="sr-only">Filter JOP</label>
          <select
            id="jop-filter"
            value={jopTypeFilter}
            onChange={(e) => onJopTypeFilterChange(e.target.value as JopTypeFilter)}
            className="flex-1 sm:flex-none p-3 rounded-2xl border border-slate-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 bg-white min-w-[100px]"
          >
            <option value="ALL">JOP: ALL</option>
            <option value="EXPORT">JOP: EXPORT</option>
            <option value="JASA">JOP: JASA</option>
            <option value="LOCAL">JOP: LOCAL</option>
            <option value="SMS">JOP: SMS</option>
            <option value="KARTON_BOX">JOP: KARTON</option>
          </select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={onResetFilters}
            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all active:scale-95 group shadow-lg"
            title="Reset Filters"
          >
            <ArrowsCounterClockwise weight="bold" className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <button
            onClick={onExportPDF}
            className="flex-1 sm:flex-none px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-widest"
          >
            <DownloadSimple weight="bold" className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}

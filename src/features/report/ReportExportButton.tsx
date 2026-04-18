'use client';

import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { generateProductionReport } from './reportService';
import { cn } from '@/lib/utils';

interface ReportExportButtonProps {
  type: 'CTP' | 'CTCP' | 'FLEXO' | 'ETCHING' | 'SCREEN';
  className?: string;
}

export function ReportExportButton({ type, className }: ReportExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      // For now, export all/last logs. Future: add date picker
      await generateProductionReport(type);
    } catch (error: unknown) {
      const err = error as Error;
      alert(`Gagal mengekspor laporan: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50",
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      EKSPOR LOG {type}
    </button>
  );
}

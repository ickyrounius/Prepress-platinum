'use client';

import React, { useState, useMemo, useCallback } from 'react';
import StatusPill from '@/components/ui/StatusPill';
import { JopData, JosData } from '@/features/job/jobTypes';

type SortDir = 'asc' | 'desc';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface JobQueueTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
}

export default function JobQueueTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onRowClick,
  emptyMessage = 'Tidak ada data',
  pageSize = 30,
}: JobQueueTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }, [sortKey]);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-3 py-2.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider
                    ${col.sortable ? 'cursor-pointer select-none hover:text-slate-200 transition-colors' : ''}
                    ${col.className || ''}
                  `}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-blue-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sortedData.map((row, idx) => (
              <tr
                key={row.ID || row.id || idx}
                className={`
                  transition-colors duration-100
                  ${onRowClick ? 'cursor-pointer hover:bg-slate-800/70' : ''}
                  ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}
                `}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2 text-slate-300 ${col.className || ''}`}>
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {!isLoading && sortedData.length === 0 && (
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
          <span className="ml-2 text-sm text-slate-400">Memuat data...</span>
        </div>
      )}

      {/* Load more */}
      {hasMore && !isLoading && (
        <div className="flex justify-center border-t border-slate-700/50 py-3">
          <button
            onClick={onLoadMore}
            className="
              px-4 py-1.5 text-xs font-medium text-blue-400
              bg-blue-500/10 rounded-lg
              hover:bg-blue-500/20 transition-colors
            "
          >
            Muat lebih banyak
          </button>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-700/50 text-[11px] text-slate-500">
        <span>{sortedData.length} data ditampilkan</span>
        {sortKey && <span>Sorted by {sortKey} ({sortDir})</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-built column configs
// ─────────────────────────────────────────────────────────────────────────────

export const JOP_COLUMNS: Column<JopData>[] = [
  { key: 'NO_JOP', label: 'No. JOP', sortable: true, className: 'font-mono text-xs whitespace-nowrap' },
  { key: 'BUYER', label: 'Buyer', sortable: true },
  { key: 'NAMA_JOP', label: 'Nama', sortable: true, className: 'max-w-[200px] truncate' },
  { key: 'TIPE_JOP', label: 'Tipe', sortable: true, className: 'text-xs' },
  { key: 'PIC_UTAMA', label: 'PIC', sortable: true, className: 'text-xs' },
  {
    key: 'ST_WF_JOP',
    label: 'Status',
    sortable: true,
    render: (row) => <StatusPill status={row.ST_WF_JOP || ''} />,
  },
  {
    key: 'LEVEL_TC',
    label: 'TC',
    sortable: true,
    render: (row) => (
      <span className={`text-xs font-semibold ${
        row.LEVEL_TC === 'CRITICAL' ? 'text-red-400' :
        row.LEVEL_TC === 'COMPLEX' ? 'text-orange-400' :
        row.LEVEL_TC === 'ADVANCED' ? 'text-amber-400' :
        row.LEVEL_TC === 'STANDARD' ? 'text-blue-400' :
        'text-slate-400'
      }`}>
        {row.LEVEL_TC || '—'}
      </span>
    ),
  },
  { key: 'TGL_TARGET', label: 'Target', sortable: true, className: 'text-xs whitespace-nowrap' },
];

export const JOS_COLUMNS: Column<JosData>[] = [
  { key: 'NO_JOS', label: 'No. JOS', sortable: true, className: 'font-mono text-xs whitespace-nowrap' },
  { key: 'BUYER', label: 'Buyer', sortable: true },
  { key: 'NAMA_PRODUK', label: 'Produk', sortable: true, className: 'max-w-[200px] truncate' },
  { key: 'TIPE_JOS', label: 'Tipe', sortable: true, className: 'text-xs' },
  { key: 'DESIGNER', label: 'Designer', sortable: true, className: 'text-xs' },
  {
    key: 'ST_WF_JOS',
    label: 'Status',
    sortable: true,
    render: (row) => <StatusPill status={row.ST_WF_JOS || ''} />,
  },
  { key: 'TGL_TARGET_JOS', label: 'Target', sortable: true, className: 'text-xs whitespace-nowrap' },
];

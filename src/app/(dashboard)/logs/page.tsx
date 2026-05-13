'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, startAfter, where, QueryDocumentSnapshot } from 'firebase/firestore';
import JobQueueTable from '@/components/dashboard/JobQueueTable';
import Spinner from '@/components/ui/Spinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { AuditLogEntry } from '@/lib/types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const fetchLogs = async (isLoadMore = false) => {
    setIsLoading(true);
    try {
      // 90-day retention query
      const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
      
      let q = query(
        collection(db, 'audit_logs'),
        where('timestamp', '>=', cutoff),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogEntry));
      
      if (isLoadMore) {
        setLogs(prev => [...prev, ...items]);
      } else {
        setLogs(items);
      }
      
      setLastDoc(snap.docs[snap.docs.length - 1] as QueryDocumentSnapshot || null);
      setHasMore(snap.docs.length === pageSize);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit Trail</h1>
        <p className="text-slate-400 text-sm">Log aktivitas sistem kritikal (90 hari terakhir).</p>
      </div>

      <ErrorBoundary panelName="Audit Log Table">
        <JobQueueTable
          data={logs}
          isLoading={isLoading}
          hasMore={hasMore}
          onLoadMore={() => fetchLogs(true)}
          columns={[
            { 
              key: 'timestamp', 
              label: 'Waktu', 
              sortable: true, 
              className: 'font-mono text-xs whitespace-nowrap',
              render: (row) => new Date(row.timestamp || 0).toLocaleString('id-ID')
            },
            { key: 'actor_uid', label: 'User ID', className: 'text-[10px] font-mono' },
            { 
              key: 'action', 
              label: 'Aksi', 
              render: (row) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  row.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                  row.action === 'create' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {row.action}
                </span>
              )
            },
            { key: 'entity_type', label: 'Kategori', className: 'text-[11px] text-slate-500' },
            { key: 'entity_id', label: 'ID Entitas', className: 'font-mono text-[10px]' },
            { 
              key: 'after', 
              label: 'Perubahan', 
              className: 'max-w-[150px] truncate text-[10px] text-slate-400',
              render: (row) => JSON.stringify(row.after || {})
            }
          ]}
          emptyMessage="Belum ada audit log tersimpan."
          pageSize={pageSize}
        />
      </ErrorBoundary>
    </div>
  );
}

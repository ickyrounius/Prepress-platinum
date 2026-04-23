'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { ALL_ADMIN_ROLES } from '@/lib/accessControl';
import { exportToPDF } from '@/features/report/exportPDF';
import { recordAuditLog } from '@/features/audit-log/auditLogService';
import { CircleNotch, DownloadSimple, ShieldCheck, WarningCircle } from '@phosphor-icons/react';

interface AuditLogItem {
  id: string;
  actor_uid: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, unknown>;
  timestamp?: { toDate?: () => Date };
}

export default function AuditLogPage() {
  const { user, role } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(300));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: AuditLogItem[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as AuditLogItem));
        setLogs(items);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase().trim();
    return logs.filter((log) => {
      const ts = log.timestamp?.toDate?.();
      const dateValue = ts ? new Date(ts.toDateString()) : null;
      const startOk = !startDate || (dateValue && dateValue >= new Date(startDate));
      const endOk = !endDate || (dateValue && dateValue <= new Date(endDate));
      const actionOk = actionFilter === 'ALL' || log.action === actionFilter;
      const searchOk =
        !needle ||
        [log.actor_uid, log.action, log.entity_type, log.entity_id].some((v) =>
          String(v || '').toLowerCase().includes(needle)
        );
      return Boolean(startOk && endOk && actionOk && searchOk);
    });
  }, [logs, search, actionFilter, startDate, endDate]);

  const actionOptions = useMemo(() => ['ALL', ...Array.from(new Set(logs.map((l) => l.action).filter(Boolean)))], [logs]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedLogs = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filtered.slice(startIdx, startIdx + pageSize);
  }, [filtered, page]);

  const canAccess = ALL_ADMIN_ROLES.includes(((role || '').toUpperCase()) as typeof ALL_ADMIN_ROLES[number]);

  const handleExport = () => {
    const rows = filtered.map((log) => [
      log.actor_uid,
      log.action,
      log.entity_type,
      log.entity_id,
      log.timestamp?.toDate?.().toLocaleString() || '-',
      JSON.stringify(log.metadata || {}),
    ]);
    exportToPDF('Audit Log Report', ['Actor UID', 'Action', 'Entity Type', 'Entity ID', 'Timestamp', 'Metadata'], rows, `audit-log-${Date.now()}.pdf`);
    if (user?.uid) {
      void recordAuditLog({
        actorUid: user.uid,
        action: 'export_pdf',
        entityType: 'audit_logs',
        entityId: 'audit_log_report',
        metadata: { rows: rows.length },
      });
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter, startDate, endDate]);

  if (!canAccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <WarningCircle size={36} className="text-rose-500" weight="bold" />
        <p className="text-sm font-bold text-slate-500">Akses audit log hanya untuk admin sistem dan admin operasional.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <CircleNotch className="animate-spin text-indigo-600" size={38} weight="bold" />
        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">Loading audit logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-100 bg-slate-900 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Security & Compliance</p>
            <h1 className="text-3xl font-black">Audit Log Viewer</h1>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700"
          >
            <DownloadSimple weight="bold" /> Export PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <ShieldCheck weight="bold" className="text-indigo-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari actor/action/entity..."
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400 lg:max-w-sm"
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400"
          >
            {actionOptions.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400"
            title="Tanggal awal"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-indigo-400"
            title="Tanggal akhir"
          />
        </div>
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-[10px] uppercase tracking-widest text-slate-400">
                <th className="px-3 py-3">Timestamp</th>
                <th className="px-3 py-3">Actor</th>
                <th className="px-3 py-3">Action</th>
                <th className="px-3 py-3">Entity</th>
                <th className="px-3 py-3">Entity ID</th>
                <th className="px-3 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {pagedLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-3">{log.timestamp?.toDate?.().toLocaleString() || '-'}</td>
                  <td className="px-3 py-3 font-bold text-slate-700">{log.actor_uid}</td>
                  <td className="px-3 py-3">{log.action}</td>
                  <td className="px-3 py-3">{log.entity_type}</td>
                  <td className="px-3 py-3">{log.entity_id}</td>
                  <td className="px-3 py-3 text-slate-500">{JSON.stringify(log.metadata || {})}</td>
                </tr>
              ))}
              {pagedLogs.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-400" colSpan={6}>
                    Tidak ada log yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filtered.length === 0
              ? 'Menampilkan 0 dari 0 log'
              : `Menampilkan ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} dari ${filtered.length} log`}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-slate-500">
              {page}/{totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

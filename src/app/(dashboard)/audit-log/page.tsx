'use client';

export const dynamic = 'force-dynamic';

import dynamicComponent from 'next/dynamic';
import { CircleNotch } from '@phosphor-icons/react';

const AuditLogInternal = dynamicComponent(() => import('./AuditLogInternal'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <CircleNotch className="animate-spin text-indigo-600" size={48} weight="bold" />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading System Logs...</p>
    </div>
  ),
});

export default function AuditLogPage() {
  return <AuditLogInternal />;
}

'use client';

import React, { useState } from 'react';
import { PrepressChecklist } from '@/features/job/jobTypes';
import { saveChecklist, updateChecklist } from '@/features/job/checklistService';

interface PrepressChecklistFormProps {
  jobId: string;
  noB: string;
  actorUid: string;
  existing?: PrepressChecklist | null;
  onSaved?: () => void;
}

const CHECKLIST_ITEMS: { key: keyof PrepressChecklist; label: string; desc: string }[] = [
  { key: 'bleedOK',     label: 'Bleed',      desc: 'Area bleed 3mm sesuai standar' },
  { key: 'overprintOK', label: 'Overprint',   desc: 'Overprint hitam aktif, tidak ada overprint warna' },
  { key: 'dpiOK',       label: 'DPI/Resolusi', desc: 'Resolusi gambar minimal 300 DPI' },
  { key: 'barcodeOK',   label: 'Barcode',     desc: 'Barcode terbaca & zona tenang cukup' },
  { key: 'trappingOK',  label: 'Trapping',    desc: 'Trapping antar warna sudah diaplikasikan' },
  { key: 'profileOK',   label: 'ICC Profile', desc: 'Profil warna sesuai mesin cetak (ISO 12647)' },
  { key: 'fontOK',      label: 'Font',        desc: 'Semua font di-outline / embed' },
];

export default function PrepressChecklistForm({
  jobId,
  noB,
  actorUid,
  existing,
  onSaved,
}: PrepressChecklistFormProps) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    if (existing) {
      return CHECKLIST_ITEMS.reduce((acc, item) => {
        acc[item.key] = !!(existing as any)[item.key];
        return acc;
      }, {} as Record<string, boolean>);
    }
    return CHECKLIST_ITEMS.reduce((acc, item) => {
      acc[item.key] = false;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const allChecked = Object.values(checks).every(Boolean);

  const handleToggle = (key: string) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setResult(null);

    const payload: any = {
      jobId,
      NO_B: noB,
      checkedBy: actorUid,
      ...checks,
      outputBlocked: !allChecked,
    };

    try {
      if (existing?.id) {
        const res = await updateChecklist(existing.id, payload, actorUid);
        setResult(res.message);
      } else {
        const res = await saveChecklist(payload, actorUid);
        setResult(res.message);
      }
      onSaved?.();
    } catch (err: any) {
      setResult('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 backdrop-blur-sm">
      <h3 className="text-sm font-bold text-slate-200 mb-1">Prepress Checklist</h3>
      <p className="text-[11px] text-slate-500 mb-4">
        NO_B: <span className="font-mono text-slate-300">{noB}</span>
      </p>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => (
          <label
            key={item.key}
            className={`
              flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors
              ${checks[item.key]
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60'
              }
            `}
          >
            <input
              type="checkbox"
              checked={checks[item.key]}
              onChange={() => handleToggle(item.key)}
              className="mt-0.5 h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500/30 bg-slate-800"
            />
            <div>
              <span className={`text-sm font-medium ${checks[item.key] ? 'text-emerald-300' : 'text-slate-300'}`}>
                {item.label}
              </span>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Output blocked warning */}
      {!allChecked && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
          ⚠️ Output akan diblokir — belum semua item checklist terpenuhi.
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className={`
          mt-4 w-full py-2 rounded-lg text-sm font-semibold transition-all
          ${allChecked
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
            : 'bg-amber-600 hover:bg-amber-500 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isSaving ? 'Menyimpan...' : allChecked ? '✓ Simpan & Approve Output' : '⚠ Simpan (Output Blocked)'}
      </button>

      {/* Result feedback */}
      {result && (
        <p className={`mt-2 text-xs ${result.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
          {result}
        </p>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { TCGuide } from '@/components/forms/TCGuide';
import { db } from '@/lib/firebase';
import { DEFAULT_TC_FORMULA, calculateDeadlinePressureScore, calculateTotalTc, type TCFormulaConfig } from '@/lib/tcFormula';
import { cn } from '@/lib/utils';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';
import { 
  Palette, PencilCircle,
  Info, Shapes, Calculator
} from '@phosphor-icons/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';

const TCSelector = ({ label, value, onChange, colorClass }: { label: string; value: number; onChange: (v: number) => void; colorClass: string }) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[10px] sm:text-[11px] font-black transition-all flex items-center justify-center shadow-sm flex-shrink-0',
              value === num
                ? `${colorClass} text-white border-transparent shadow-lg scale-110 z-10`
                : 'bg-white border-slate-200 text-slate-400 hover:border-pink-300 hover:text-pink-400 hover:bg-pink-50/30'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function DGPanel() {
  const { role } = useAuth();
  const { updateFormField, formData } = useFormStore();
  const [tcValues, setTcValues] = useState({ kt: 0, rp: 0, bs: 0, cad: 0 });
  const [laValue, setLaValue] = useState(1);
  const [dpValue, setDpValue] = useState(1);
  const [totalTc, setTotalTc] = useState(0);
  const [tcFormula, setTcFormula] = useState<TCFormulaConfig>(DEFAULT_TC_FORMULA);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'm_settings', 'kpi_config'), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as { tcFormula?: Partial<TCFormulaConfig> };
      if (data.tcFormula) setTcFormula({ ...DEFAULT_TC_FORMULA, ...data.tcFormula });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);

  useEffect(() => {
    const total = calculateTotalTc(tcValues, laValue, dpValue, tcFormula);
    setTotalTc(total);
    updateFormField('tc', {
      kt: tcValues.kt,
      rp: tcValues.rp,
      bs: tcValues.bs,
      cad: tcValues.cad,
      la: laValue,
      dp: dpValue,
      total_tc: total,
    });
    updateFormField('total_tc', total);
    updateFormField('tc_la', laValue);
    updateFormField('tc_dp', dpValue);
  }, [tcValues, laValue, dpValue, tcFormula, updateFormField]);

  const handleTcChange = (key: keyof typeof tcValues, val: number) => {
    setTcValues((prev) => ({ ...prev, [key]: val }));
    updateFormField(`tc_${key}`, val);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 text-white rounded-xl sm:rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-pink-200">
            <Palette weight="bold" size={20} className="sm:size-[24px]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">Operator Design Graphic (DG) Panel</h1>
            <p className="text-[8px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-widest">Creative & Artwork Workflow</p>
          </div>
        </div>
      </div>
      
      <TCGuide />

      <GlobalInputForm
        title="Form Progress DG (Design Graphic)"
        collectionName="proses_jod"
        autoGenPrefix="DG-PROC"
        className="p-0 border-none shadow-none max-w-none"
      >
        <div className="space-y-8">
          {/* Section 1: Main Identification */}
          <div className="bg-slate-50/50 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Info weight="bold" className="text-pink-500" />
              <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Identitas Pekerjaan</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <JOPSearch 
                type="JOS"
                label="NO JOS"
                required
                onSelect={(id, data) => {
                  updateFormField('no_jos', id);
                  if (data?.tgl_no_jos) updateFormField('tgl_masuk', String(data.tgl_no_jos));
                  if (data?.tgl_target_no_jos) updateFormField('tgl_target', String(data.tgl_target_no_jos));
                  if (data?.revisi_ke) {
                    const revisiKe = Number(data.revisi_ke);
                    updateFormField('revisi_ke', revisiKe);
                    const la = Math.min(revisiKe + 1, 5);
                    setLaValue(la);
                  }
                  const dp = calculateDeadlinePressureScore(
                    (data?.tgl_target_no_jos ?? data?.tgl_target) as any,
                    (data?.tgl_no_jos ?? data?.tgl_masuk) as any
                  );
                  setDpValue(dp);
                }}
              />

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NO JOD (Detail Order)</label>
                <input 
                    required 
                    onChange={(e) => updateFormField('no_jod', e.target.value)} 
                    value={(formData.no_jod as string) || ''}
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
                    placeholder="Masukkan No JOD (Contoh: J1, J2...)" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-pink-500">Role / Input Sebagai</label>
                <div className="w-full p-4 border-2 border-pink-100 rounded-2xl bg-pink-50 cursor-default text-sm font-black text-pink-600 shadow-sm flex items-center justify-between">
                  <span className="uppercase tracking-wider">{role || 'MEMUAT...'}</span>
                  <span className="text-[9px] text-pink-400 font-bold bg-white px-2 py-0.5 rounded-full border border-pink-100 tracking-widest uppercase">Auto</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-pink-500">Status Work In Progress (WIP)</label>
                <select required 
                  onChange={(e) => updateFormField('status_dg', normalizeWorkflowStatusInput(e.target.value))} 
                  value={(formData.status_dg as string) || ''}
                  className="w-full p-4 border-2 border-pink-100 rounded-2xl bg-white text-sm font-black text-pink-600 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">- Pilih Tahapan Desain -</option>
                  <option value="PROSES">Pengerjaan (Prosess)</option>
                  <option value="Preview">Pengajuan Preview (Gallery)</option>
                  <option value="HOLD">Perbaikan (Revisi)</option>
                  <option value="HOLD_FEEDBACK">Menunggu Feedback (Hold)</option>
                  <option value="DONE">Desain Final (Selesai)</option>
                  <option value="CANCEL">Batalkan Item (CANCEL)</option>
                </select>
              </div>

              <div className="flex items-end mb-1">
                 <div className="px-4 py-2 bg-pink-50 rounded-xl border border-pink-100 flex items-center gap-2 w-full sm:w-auto">
                    <Shapes weight="fill" size={14} className="text-pink-500" />
                    <span className="text-[9px] font-black text-pink-600 uppercase tracking-tighter">Status terupdate otomatis di Board</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-pink-50/30 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-pink-100 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator weight="bold" className="text-pink-500" />
                <h3 className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-widest">Input Nilai Technical Complexity (TC)</h3>
              </div>
              <div className="text-pink-600 font-black text-lg sm:text-xl">{totalTc} <span className="text-[10px] uppercase">pts</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <TCSelector label="KT (Design)" value={tcValues.kt} onChange={(v) => handleTcChange('kt', v)} colorClass="bg-pink-500" />
              <TCSelector label="RP (Finishing)" value={tcValues.rp} onChange={(v) => handleTcChange('rp', v)} colorClass="bg-emerald-500" />
              <TCSelector label="BS (Jumlah Design)" value={tcValues.bs} onChange={(v) => handleTcChange('bs', v)} colorClass="bg-amber-500" />
              <TCSelector label="CAD (Diecut)" value={tcValues.cad} onChange={(v) => handleTcChange('cad', v)} colorClass="bg-rose-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline Pressure (DP)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button" onClick={() => setDpValue(v)} className={cn('flex-1 py-2 rounded-xl text-[10px] font-black border transition-all', dpValue === v ? 'bg-slate-900 text-white border-transparent' : 'bg-white text-slate-400 border-slate-100')}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loop Approval (LA)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} type="button" onClick={() => setLaValue(v)} className={cn('flex-1 py-2 rounded-xl text-[10px] font-black border transition-all', laValue === v ? 'bg-pink-600 text-white border-transparent' : 'bg-white text-slate-400 border-slate-100')}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Notes & Feedback */}
          <div className="space-y-1 pb-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <PencilCircle weight="bold" className="text-pink-500" />
              Catatan & Kendala Desain
            </label>
            <textarea 
              onChange={(e) => updateFormField('catatan_dg', e.target.value)} 
              value={(formData.catatan_dg as string) || ''}
              className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] bg-white text-sm font-bold text-slate-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all h-32 resize-none placeholder:text-slate-300 shadow-sm" 
              placeholder="Sebutkan detail revisi, nama file master, atau kendala material desain..."
            ></textarea>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

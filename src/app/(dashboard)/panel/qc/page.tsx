'use client';

import React, { useState } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { 
  ShieldCheck, ClipboardText,
  CheckCircle, Stack,
  MagnifyingGlass, FileMagnifyingGlass
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';

export default function QCPanel() {
  const { updateFormField, setFormData } = useFormStore();
  const [targetType, setTargetType] = useState('NO_JOS');

  const onTargetChange = (val: string) => {
    setFormData({}); // reset
    setTargetType(val);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-200">
            <ShieldCheck weight="bold" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quality Control (QC) Panel</h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">Verification & Approval Workflow</p>
          </div>
        </div>
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] border border-slate-200 w-fit">
        <button 
            onClick={() => onTargetChange('NO_JOS')}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                targetType === 'NO_JOS' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <MagnifyingGlass weight="bold" /> QC JOD (Design)
        </button>
        <button 
            onClick={() => onTargetChange('NO_JOP')}
            className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                targetType === 'NO_JOP' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
        >
            <Stack weight="bold" /> QC Prep (Fisik)
        </button>
      </div>

      <GlobalInputForm
        title={`Quality Control Check: ${targetType === 'NO_JOS' ? 'Design' : 'Prepress'}`}
        collectionName={targetType === 'NO_JOS' ? 'proses_jod' : 'proses_prepress_b'}
        autoGenPrefix="QC-CHK"
      >
        <div className="space-y-8">
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <FileMagnifyingGlass weight="bold" className="text-slate-800" />
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Verification Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JOPSearch 
                type={targetType === 'NO_JOP' ? 'JOP' : 'JOS'}
                label={targetType}
                required
                onSelect={(id) => updateFormField(targetType.toLowerCase(), id)}
              />

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{targetType === 'NO_JOS' ? 'NO JOD' : 'NO B (Fisik Plate)'}</label>
                <input required onChange={(e) => updateFormField(targetType === 'NO_JOS' ? 'no_jod' : 'no_b', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300 shadow-sm" placeholder="Isi Identifier Spesifik..." />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-slate-800">Status Approval</label>
                <select required onChange={(e) => updateFormField(targetType === 'NO_JOS' ? 'status_qc' : 'status_prepress_qc', normalizeWorkflowStatusInput(e.target.value))} className="w-full p-4 border-2 border-slate-800 rounded-2xl bg-slate-800 text-sm font-black text-white focus:ring-4 focus:ring-slate-100 outline-none transition-all cursor-pointer shadow-lg">
                  <option value="">- Pilih Keputusan -</option>
                  <option value="APPROVED">Lolos QC (Approved)</option>
                  <option value="REJECT">Ditolak / Gagal (Reject)</option>
                  <option value="HOLD">Menunggu Pengecekan (Hold)</option>
                </select>
              </div>

              <div className="flex items-end mb-1">
                 <div className="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-2">
                    <CheckCircle weight="fill" size={14} className="text-slate-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Keputusan bersifat final untuk tracking</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ClipboardText weight="bold" className="text-slate-800" />
              Laporan Pemeriksaan QC
            </label>
            <textarea onChange={(e) => updateFormField('catatan_qc', e.target.value)} className="w-full p-5 border-2 border-slate-100 rounded-[2rem] bg-white text-sm font-bold text-slate-700 focus:border-slate-800 outline-none transition-all h-32 resize-none placeholder:text-slate-300 shadow-sm" placeholder="Jelaskan alasan reject jika tidak lolos QC, atau catat detail pemeriksaan lainnya..."></textarea>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

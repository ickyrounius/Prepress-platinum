'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { 
  Wrench, Target,
  Files, Info, CheckCircle, 
  PlusSquare, MinusSquare 
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { Icon } from '@phosphor-icons/react';
import { useAuth } from '@/features/auth/AuthContext';
import { useEffect } from 'react';

interface QtyCounterProps {
  label: string;
  value: unknown;
  name: string;
  colorClass: string;
  icon: Icon;
}

const QtyCounter = ({ label, value, name, colorClass, icon: Icon }: QtyCounterProps) => {
  const { updateFormField } = useFormStore();
  const val = Number(value) || 0;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 shadow-sm space-y-4 transition-all hover:bg-slate-50">
      <div className="flex items-center gap-3">
         <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-inner", colorClass.replace('text-', 'bg-').replace('600', '50'), colorClass)}>
            <Icon weight="bold" size={18} className="sm:size-[20px]" />
         </div>
         <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-4 sm:gap-6">
         <button 
            type="button"
            title="Kurangi"
            aria-label="Kurangi Jumlah"
            onClick={() => updateFormField(name, Math.max(0, val - 1))}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-indigo-500 hover:border-indigo-200 transition-all shadow-sm"
          >
            <MinusSquare weight="bold" size={20} className="sm:size-[24px]" />
         </button>
         <div className="flex flex-col items-center">
            <input 
                type="number"
                title={label}
                aria-label={label}
                value={val}
                onChange={(e) => updateFormField(name, Number(e.target.value))}
                className="w-16 sm:w-20 text-center text-2xl sm:text-3xl font-black text-slate-800 bg-transparent outline-none"
            />
            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Units</span>
         </div>
         <button 
            type="button"
            title="Tambah"
            aria-label="Tambah Jumlah"
            onClick={() => updateFormField(name, val + 1)}
            className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-90", colorClass.replace('text-', 'bg-'))}
          >
            <PlusSquare weight="bold" size={20} className="sm:size-[24px]" />
         </button>
      </div>
    </div>
  );
};

export default function SupportPage() {
  const { role } = useAuth();
  const { updateFormField, formData } = useFormStore();

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);

  // Determine prefix based on selected support type
  const getSupportPrefix = () => {
    const type = formData.type_support as string;
    if (type === 'GMG') return 'SD-GMG';
    if (type === 'CNC') return 'SD-CNC';
    if (type === 'BLUEPRINT') return 'SD-BPR';
    return 'SD-PROC'; // Fallback
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500 text-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-amber-100">
            <Wrench weight="bold" size={24} className="sm:size-[28px]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">Support Design Panel</h1>
            <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">GMG, CNC & Blueprint Operations</p>
          </div>
        </div>
      </div>

      <GlobalInputForm
        title="Update Progress Support Design"
        collectionName="proses_support_b"
        autoGenPrefix={getSupportPrefix()}
        isProgressUpdate={true}
        syncRole="support"
        className="p-0 border-none shadow-none max-w-none"
      >
        <div className="space-y-8">
          <div className="bg-slate-50/50 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 space-y-6 sm:space-y-8 shadow-inner">
            <div className="flex items-center gap-2 mb-2">
              <Info weight="bold" size={18} className="text-amber-500 sm:size-[20px]" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Job Reference</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              <JOPSearch 
                type="JOP"
                label="NOMOR JOP (ID Parent)"
                required
                onSelect={(id) => updateFormField('no_jop', id)}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NO B (Item Specific)</label>
                <input 
                    required 
                    onChange={(e) => updateFormField('no_b', e.target.value)} 
                    value={(formData.no_b as string) || ''}
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-800 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
                    placeholder="Contoh: B1, B2, Plate A..." 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Kategori Support</label>
                <select 
                    required 
                    title="Kategori Support"
                    onChange={(e) => updateFormField('type_support', e.target.value)} 
                    value={(formData.type_support as string) || ''}
                    className="w-full p-4 border-2 border-amber-100 rounded-2xl bg-white text-sm font-black text-amber-600 focus:border-amber-500 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">- Pilih Jenis Support -</option>
                  <option value="BLUEPRINT">Blueprint (Plotting)</option>
                  <option value="GMG">GMG Proofing</option>
                  <option value="CNC">CNC Block / Machining</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-amber-500">Bekerja Sebagai</label>
                <div className="w-full p-4 border-2 border-amber-100 rounded-2xl bg-amber-50 cursor-default text-sm font-black text-amber-600 shadow-sm flex items-center justify-between">
                  <span className="uppercase tracking-wider">{role || 'MEMUAT...'}</span>
                  <span className="text-[9px] text-amber-400 font-bold bg-white px-2 py-0.5 rounded-full border border-amber-100 tracking-widest uppercase">Auto</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Pengerjaan</label>
                <select 
                    required 
                    title="Status Pengerjaan"
                    onChange={(e) => updateFormField('status_workflow', e.target.value)} 
                    value={(formData.status_workflow as string) || ''}
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">- Pilih Status -</option>
                  <option value="Prosess">Dalam Pengerjaan</option>
                  <option value="Hold">Tertunda / Revisi</option>
                  <option value="Done">Selesai (Closed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <QtyCounter label="Qty Output" value={formData.qty_output} name="qty_output" colorClass="text-amber-600" icon={CheckCircle} />
             <div className="md:col-span-2 bg-indigo-50/50 p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-indigo-100 flex items-center gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100 flex-shrink-0">
                    <Target size={20} className="sm:size-[24px]" weight="bold" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 leading-tight">KPI Integration Note</h4>
                    <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">Kuantitas output fisik akan dikalikan dengan bobot poin masing-masing kategori (GMG: 5x, CNC: 10x, BP: 2x) secara otomatis di Dashboard KPI.</p>
                </div>
             </div>
          </div>

          <div className="space-y-1 pb-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Files weight="bold" className="text-amber-500" />
              Catatan Khusus
            </label>
            <textarea 
                onChange={(e) => updateFormField('catatan_support', e.target.value)} 
                value={(formData.catatan_support as string) || ''}
                className="w-full p-6 border-2 border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white text-sm font-bold text-slate-800 focus:border-amber-500 outline-none transition-all h-36 resize-none placeholder:text-slate-300 shadow-sm" 
                placeholder="Detail pengerjaan, kendala bahan, atau instruksi khusus..."
            ></textarea>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

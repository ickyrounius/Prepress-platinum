'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { 
  Selection, Info, ClipboardText, 
  CheckCircle, WarningCircle, Stack,
  SubtractSquare, PlusSquare, MinusSquare
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';
import { useAuth } from '@/features/auth/AuthContext';
import { useEffect } from 'react';

interface PlateCounterProps {
  label: string;
  value: unknown;
  name: string;
  colorClass: string;
  icon: Icon;
}

const PlateCounter = ({ label, value, name, colorClass, icon: Icon }: PlateCounterProps) => {
  const { updateFormField } = useFormStore();
  const val = Number(value) || 0;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass.replace('text-', 'bg-').replace('600', '50')} ${colorClass}`}>
            <Icon weight="bold" size={18} />
         </div>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
         <button 
            type="button"
            title="Kurangi"
            aria-label="Kurangi Jumlah"
            onClick={() => updateFormField(name, Math.max(0, val - 1))}
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
         >
            <MinusSquare weight="bold" size={20} />
         </button>
         <input 
            type="number"
            title={label}
            aria-label={label}
            value={val}
            onChange={(e) => updateFormField(name, Number(e.target.value))}
            className="w-full text-center text-xl font-black text-slate-700 outline-none"
         />
         <button 
            type="button"
            title="Tambah"
            aria-label="Tambah Jumlah"
            onClick={() => updateFormField(name, val + 1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-all active:scale-90 ${colorClass.replace('text-', 'bg-')}`}
         >
            <PlusSquare weight="bold" size={20} />
         </button>
      </div>
    </div>
  );
};

export default function FLEXOPanel() {
  const { role } = useAuth();
  const { updateFormField, formData } = useFormStore();

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-purple-200">
            <Selection weight="bold" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panel Operator FLEXO</h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">Flexographic Printing Polymer</p>
          </div>
        </div>
      </div>

      <GlobalInputForm
        title="Update Progress FLEXO"
        collectionName="proses_flexo_b"
        autoGenPrefix="PP-FLX"
        isProgressUpdate={true}
        syncRole="prepress"
      >
        <div className="space-y-8">
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Info weight="bold" className="text-purple-500" />
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Job Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JOPSearch 
                type="JOP"
                label="NO JOP (Parent)"
                required
                onSelect={(id) => updateFormField('no_jop', id)}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NO B (Blok/File Child)</label>
                <input required onChange={(e) => updateFormField('no_b', e.target.value)} value={(formData.no_b as string) || ''} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-purple-500 outline-none transition-all placeholder:text-slate-300 shadow-sm" placeholder="Contoh: B1, B2..." />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-purple-500">Bekerja Sebagai</label>
                <div className="w-full p-4 border-2 border-purple-100 rounded-2xl bg-purple-50 cursor-default text-sm font-black text-purple-600 shadow-sm flex items-center justify-between">
                  <span className="uppercase tracking-wider">{role || 'MEMUAT...'}</span>
                  <span className="text-[9px] text-purple-400 font-bold bg-white px-2 py-0.5 rounded-full border border-purple-100 tracking-widest uppercase">Auto</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-purple-600">Status Prepress</label>
                <select 
                  required 
                  title="Status Prepress"
                  onChange={(e) => updateFormField('status_workflow', normalizeWorkflowStatusInput(e.target.value))} 
                  value={(formData.status_workflow as string) || ''}
                  className="w-full p-4 border-2 border-purple-100 rounded-2xl bg-white text-sm font-black text-purple-600 focus:border-purple-500 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">- Pilih Status -</option>
                  <option value="PROSES">Pengerjaan (Prosess)</option>
                  <option value="HOLD">Tertunda (Hold)</option>
                  <option value="DONE">Selesai (Done)</option>
                </select>
              </div>

               <div className="flex items-end mb-1">
                 <div className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-2">
                    <Stack weight="fill" size={14} className="text-purple-500" />
                    <span className="text-[9px] font-black text-purple-600 uppercase tracking-tighter">Unified Production Network</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <PlateCounter label="Plate Baik" value={formData.plate_baik} name="plate_baik" colorClass="text-emerald-600" icon={CheckCircle} />
             <PlateCounter label="Plate Rusak" value={formData.plate_rusak} name="plate_rusak" colorClass="text-rose-600" icon={WarningCircle} />
             <PlateCounter label="Plate Gantian" value={formData.plate_gantian} name="plate_gantian" colorClass="text-amber-600" icon={SubtractSquare} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ClipboardText weight="bold" className="text-purple-500" />
              Catatan Operator
            </label>
            <textarea 
              onChange={(e) => updateFormField('catatan_operator', e.target.value)} 
              value={(formData.catatan_operator as string) || ''}
              className="w-full p-5 border-2 border-slate-100 rounded-[2rem] bg-white text-sm font-bold text-slate-700 focus:border-purple-500 outline-none transition-all h-32 resize-none placeholder:text-slate-300 shadow-sm" 
              placeholder="Kendala mesin, status bahan baku, atau detail penggantian plate..."
            ></textarea>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';

export default function NoBPanel() {
  const { updateFormField } = useFormStore();

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Block / File (NO B)</h1>
        <p className="text-sm text-slate-500 font-medium uppercase tracking-widest text-indigo-600/60">Pencatatan ID Blok Plat Produksi</p>
      </div>

      <GlobalInputForm
        title="Input Metadata NO B"
        collectionName="files_nob"
        autoGenPrefix="B"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">REFF JOP</label>
            <input required onChange={(e) => updateFormField('no_jop', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none font-bold uppercase" placeholder="Masukkan ID/No JOP" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tipe File</label>
            <select required onChange={(e) => updateFormField('file_type', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none">
              <option value="">- Pilih Tipe -</option>
              <option value="CTTP">CTTP</option>
              <option value="CTP">CTP</option>
              <option value="CYL">Cylinder</option>
            </select>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

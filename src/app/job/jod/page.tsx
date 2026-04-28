'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';

export default function JODPanel() {
  const { updateFormField, formData } = useFormStore();

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Job Order Design (JOD)</h1>
        <p className="text-sm text-slate-500 font-medium uppercase tracking-widest text-indigo-600/60">Input Data Pengerjaan Design Graphic</p>
      </div>

      <GlobalInputForm
        title="Form Detail JOD"
        collectionName="jod_entries"
        autoGenPrefix="JOD"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">NO JOS</label>
            <input required value={(formData.no_jos as string) || ''} onChange={(e) => updateFormField('no_jos', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none" placeholder="Masukkan ID/No JOS Induk" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Pengerjaan</label>
            <input required value={(formData.nama_jod as string) || ''} onChange={(e) => updateFormField('nama_jod', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none" placeholder="Contoh: Digital Draft" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Design</label>
            <input type="number" value={(formData.jml_design as string) || ''} onChange={(e) => updateFormField('jml_design', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Warna</label>
            <input type="number" value={(formData.jml_warna as string) || ''} onChange={(e) => updateFormField('jml_warna', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none" placeholder="0" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Bahan</label>
            <input value={(formData.jenis_bahan as string) || ''} onChange={(e) => updateFormField('jenis_bahan', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none" placeholder="Contoh: Art Paper 150gr, Ivory, dll" />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Notes</label>
            <textarea value={(formData.notes as string) || ''} onChange={(e) => updateFormField('notes', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm outline-none h-24" placeholder="Instruksi pengerjaan..."></textarea>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

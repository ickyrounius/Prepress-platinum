'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import Link from 'next/link';

export default function InputJOS() {
  const { updateFormField, formData } = useFormStore();

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <Link
        href="/panel/dg/input-jos?popup=%2Fpanel%2Fdg%2Finput-jos"
        className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-100"
      >
        Back to Popup
      </Link>
      <GlobalInputForm
        title="Registrasi JOS Baru"
        collectionName="workflows_jos"
        docId={formData.no_jos as string}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">NO JOS</label>
            <input required onChange={(e) => updateFormField('no_jos', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan Nomor JOS" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tipe JOS</label>
            <select required onChange={(e) => updateFormField('tipe_jos', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">- Pilih Tipe -</option>
              <option value="Jasa">Jasa</option>
              <option value="Local">Local</option>
              <option value="Export">Export</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Terima JOS</label>
            <input required type="date" onChange={(e) => updateFormField('tgl_terima', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Target JOS</label>
            <input required type="date" onChange={(e) => updateFormField('tgl_target', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Buyer</label>
            <input required onChange={(e) => updateFormField('buyer', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan Nama Buyer" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Warna</label>
            <input required type="number" onChange={(e) => updateFormField('jml_warna', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Design</label>
            <input required type="number" onChange={(e) => updateFormField('jml_design', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Jenis Bahan</label>
            <input onChange={(e) => updateFormField('jenis_bahan', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Jenis bahan" />
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

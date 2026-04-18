'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import Link from 'next/link';

export default function InputJOP() {
  const { updateFormField, formData } = useFormStore();

  const handleAutoJopType = (val: string) => {
    updateFormField('no_jop', val);
    if (!val) return;
    
    let tipe = "Local";
    if (val.startsWith("7B")) tipe = "Jasa";
    else if (val.startsWith("79")) tipe = "SMS";
    else if (val.startsWith("9")) tipe = "Karton_Box";
    else if (val.startsWith("8")) tipe = "Export";
    
    updateFormField('tipe_jop', tipe);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <Link
        href="/panel/dt/input-jop?popup=%2Fpanel%2Fdt%2Finput-jop"
        className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-100"
      >
        Back to Popup
      </Link>
      <GlobalInputForm
        title="Registrasi JOP Baru"
        collectionName="workflows_jop"
        docId={formData.no_jop as string}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">NO JOP</label>
            <input required onChange={(e) => handleAutoJopType(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ketik NO JOP (cth: 7B...)" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Auto Tipe JOP</label>
            <input readOnly value={(formData.tipe_jop as string) || ''} className="w-full p-3 border rounded-xl bg-slate-200 text-slate-600 font-bold text-sm outline-none" placeholder="Auto Fill" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Baru / ReLayout</label>
            <div className="flex items-center gap-4 p-3 border rounded-xl bg-slate-50">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="radio" name="baru_relayout" value="Baru" onChange={(e) => updateFormField('baru_relayout', e.target.value)} className="w-4 h-4 text-indigo-600" />
                Baru
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="radio" name="baru_relayout" value="ReLayout" onChange={(e) => updateFormField('baru_relayout', e.target.value)} className="w-4 h-4 text-indigo-600" />
                ReLayout
              </label>
            </div>
          </div>
          
          {formData.baru_relayout === 'Baru' && (
            <JOPSearch 
              type="JOS"
              label="NO JOS Asal (Wajib untuk Baru)"
              required
              className="md:col-span-2"
              onSelect={(id) => updateFormField('no_jos_asal', id)}
            />
          )}

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Buyer</label>
            <input required onChange={(e) => updateFormField('buyer', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan Nama Buyer" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Produk</label>
            <input required onChange={(e) => updateFormField('produk', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masukkan Nama Produk" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Terima JOP</label>
            <input required type="date" onChange={(e) => updateFormField('tgl_terima', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Tgl Target JOP</label>
            <input required type="date" onChange={(e) => updateFormField('tgl_target', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

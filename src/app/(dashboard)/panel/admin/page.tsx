'use client';

import React, { useState } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';

export default function AdminPanel() {
  const { updateFormField, formData } = useFormStore();
  const [activeTab, setActiveTab] = useState<'JOS' | 'JOP'>('JOS');

  // Prefix generator for JOP based on logic in TODO
  const handleAutoJopType = (val: string) => {
    updateFormField('no_jop', val);
    if (!val) return;
    
    // Auto Generate Tipe_JOP berdasarkan angka awalan NO_JOP: 
    // Jasa "7B", SMS "79", Karton_Box "9", Export "8", Local "0-6"
    let tipe = "Local";
    if (val.startsWith("7B")) tipe = "Jasa";
    else if (val.startsWith("79")) tipe = "SMS";
    else if (val.startsWith("9")) tipe = "Karton_Box";
    else if (val.startsWith("8")) tipe = "Export";
    
    updateFormField('tipe_jop', tipe);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-800">Admin Input Panel</h1>
        <p className="text-sm text-slate-500">Fast operator form for Initial Data Registration</p>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('JOS')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'JOS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Input NO_JOS
        </button>
        <button
          onClick={() => setActiveTab('JOP')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'JOP' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Input NO_JOP
        </button>
      </div>

      {activeTab === 'JOS' ? (
        <GlobalInputForm
          title="Registrasi JOS Baru"
          collectionName="workflows_jos"
          docId={formData.no_jos}
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
      ) : (
        <GlobalInputForm
          title="Registrasi JOP Baru"
          collectionName="workflows_jop"
          docId={formData.no_jop}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">NO JOP</label>
              <input required onChange={(e) => handleAutoJopType(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ketik NO JOP (cth: 7B...)" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Auto Tipe JOP</label>
              <input readOnly value={formData.tipe_jop || ''} className="w-full p-3 border rounded-xl bg-slate-200 text-slate-600 font-bold text-sm outline-none" placeholder="Auto Fill" />
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
      )}
    </div>
  );
}

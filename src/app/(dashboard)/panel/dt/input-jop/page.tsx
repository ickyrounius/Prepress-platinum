'use client';

import React, { useEffect } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { useAuth } from '@/features/auth/AuthContext';
import { FilePlus, Info, Calendar, User, Hash, Tag, Package } from '@phosphor-icons/react';
import Link from 'next/link';

export default function InputJOP() {
  const { role } = useAuth();
  const { updateFormField, formData } = useFormStore();

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);

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
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <FilePlus weight="bold" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registrasi JOP</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input Job Order Produksi Baru</p>
            </div>
        </div>
        <Link
            href="/panel/dt"
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
            Kembali
        </Link>
      </div>

      <GlobalInputForm
        title="Formulir JOP"
        collectionName="workflows_jop"
        docId={formData.no_jop as string | undefined}
        className="p-0 border-none shadow-none max-w-none"
      >
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Info weight="bold" className="text-indigo-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data Identitas JOP</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor JOP</label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input required onChange={(e) => handleAutoJopType(e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Ketik NO JOP (cth: 7B...)" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-indigo-500">Bekerja Sebagai</label>
                <div className="w-full p-4 border-2 border-indigo-100 rounded-2xl bg-indigo-50 cursor-default text-sm font-black text-indigo-600 shadow-sm flex items-center justify-between">
                  <span className="uppercase tracking-wider">{role || 'MEMUAT...'}</span>
                  <span className="text-[9px] text-indigo-400 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-100 tracking-widest uppercase">Auto</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Auto Tipe JOP</label>
                <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input readOnly value={(formData.tipe_jop as string) || ''} className="w-full pl-12 pr-4 py-4 border-2 border-slate-100 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm outline-none cursor-not-allowed" placeholder="Auto Fill" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Baru / ReLayout</label>
                <div className="flex items-center gap-6 p-4 border-2 border-slate-50 rounded-2xl bg-slate-50">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-600 cursor-pointer uppercase tracking-widest">
                    <input type="radio" name="baru_relayout" value="Baru" onChange={(e) => updateFormField('baru_relayout', e.target.value)} className="w-4 h-4 text-indigo-600" />
                    Baru
                  </label>
                  <label className="flex items-center gap-2 text-sm font-black text-slate-600 cursor-pointer uppercase tracking-widest">
                    <input type="radio" name="baru_relayout" value="ReLayout" onChange={(e) => updateFormField('baru_relayout', e.target.value)} className="w-4 h-4 text-indigo-600" />
                    ReLayout
                  </label>
                </div>
              </div>
            </div>

            {formData.baru_relayout === 'Baru' && (
              <div className="animate-in slide-in-from-top-4 duration-500">
                <JOPSearch 
                  type="JOS"
                  label="NO JOS Asal (Wajib untuk Baru)"
                  required
                  onSelect={(id) => updateFormField('no_jos_asal', id)}
                />
              </div>
            )}
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Package weight="bold" className="text-blue-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Detail Produk & Buyer</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Buyer</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input required onChange={(e) => updateFormField('buyer', e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Masukkan Nama Buyer" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input required onChange={(e) => updateFormField('produk', e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Masukkan Nama Produk" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Karton Box</label>
              <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                  <input type="number" min="0" onChange={(e) => updateFormField('total_karton_box', Number(e.target.value))} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Terima JOP</label>
                <input required type="date" onChange={(e) => updateFormField('tgl_terima', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Target JOP</label>
                <input required type="date" onChange={(e) => updateFormField('tgl_target', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-rose-500 outline-none transition-all text-sm font-bold text-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { useAuth } from '@/features/auth/AuthContext';
import { FilePlus, Info, Calendar, User, Hash, PaintBrush } from '@phosphor-icons/react';
import Link from 'next/link';

export default function InputJOS() {
  const { role } = useAuth();
  const { updateFormField, formData } = useFormStore();

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <FilePlus weight="bold" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registrasi JOS</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input Job Order Spesifikasi Baru</p>
            </div>
        </div>
        <Link
            href="/panel/dg"
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
            Kembali
        </Link>
      </div>

      <GlobalInputForm
        title="Formulir JOS"
        collectionName="workflows_jos"
        docId={formData.no_jos as string | undefined}
        className="p-0 border-none shadow-none max-w-none"
      >
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Info weight="bold" className="text-indigo-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data Identitas</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor JOS</label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input required onChange={(e) => updateFormField('no_jos', e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Contoh: JOS-2024-001" />
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe JOS</label>
                <select required onChange={(e) => updateFormField('tipe_jos', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700 cursor-pointer">
                  <option value="">- Pilih Tipe -</option>
                  <option value="Jasa">Jasa</option>
                  <option value="Local">Local</option>
                  <option value="Export">Export</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Buyer</label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input required onChange={(e) => updateFormField('buyer', e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Nama perusahaan / perorangan" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Calendar weight="bold" className="text-emerald-500" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timeline & Teknis</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Terima</label>
                <input required type="date" onChange={(e) => updateFormField('tgl_terima', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Target</label>
                <input required type="date" onChange={(e) => updateFormField('tgl_target', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-rose-500 outline-none transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jml Warna</label>
                <input required type="number" onChange={(e) => updateFormField('jml_warna', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jml Design</label>
                <input required type="number" onChange={(e) => updateFormField('jml_design', e.target.value)} className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-black text-slate-700" placeholder="0" />
              </div>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Bahan</label>
                <div className="relative">
                    <PaintBrush className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" weight="bold" />
                    <input onChange={(e) => updateFormField('jenis_bahan', e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700" placeholder="Contoh: Art Paper 150gr, Ivory, dll" />
                </div>
            </div>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { 
  PaperPlaneTilt, Info, ClipboardText, 
  Lightning, ArrowsCounterClockwise
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export default function PrepressRequest() {
  const { updateFormField, formData } = useFormStore();

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/panel/prepress/request?popup=%2Fpanel%2Fprepress%2Frequest"
            className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-100"
          >
            <ArrowsCounterClockwise weight="bold" className="mr-1 inline" />
            Back to Popup
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-500 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-200">
            <PaperPlaneTilt weight="bold" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Request Ke Prepress</h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">Permintaan Pembuatan Plat / Screen</p>
          </div>
        </div>
      </div>

      <GlobalInputForm
        title="Form Request Prepress Baru"
        collectionName="prepress_requests"
        autoGenPrefix="REQ-PRE"
        submitLabel="KIRIM PERMINTAAN SEKARANG"
      >
        <div className="space-y-8">
          <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Info weight="bold" className="text-indigo-500" />
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Detail Identifikasi</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JOPSearch 
                type="JOP"
                label="NO JOP (Referensi Utama)"
                required
                onSelect={(id) => updateFormField('no_jop', id)}
              />
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NO B (Blok/File)</label>
                <input required onChange={(e) => updateFormField('no_b', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm" placeholder="Contoh: B-26-001" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-indigo-600">Tipe Permintaan</label>
                <select required onChange={(e) => updateFormField('request_type', e.target.value)} className="w-full p-4 border-2 border-indigo-100 rounded-2xl bg-white text-sm font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm">
                  <option value="">- Pilih Jenis Output -</option>
                  <option value="Plat Baru">Plat Baru (First Run)</option>
                  <option value="Ganti Plat">Ganti Plat (Rusak/Revisi)</option>
                  <option value="Screen Baru">Screen Baru</option>
                  <option value="Ganti Screen">Ganti Screen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioritas Pengerjaan</label>
                <div className="grid grid-cols-3 gap-2">
                    {['Normal', 'Urgent', 'Critical'].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => updateFormField('priority', level)}
                            className={cn(
                                "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                formData.priority === level 
                                    ? "bg-slate-900 text-white border-transparent shadow-lg" 
                                    : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                            )}
                        >
                            {level === 'Critical' && <Lightning weight="fill" className="inline mr-1 text-amber-400" />}
                            {level}
                        </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ClipboardText weight="bold" className="text-indigo-500" />
              Keterangan & Lampiran Instruksi
            </label>
            <textarea onChange={(e) => updateFormField('notes', e.target.value)} className="w-full p-5 border-2 border-slate-100 rounded-[2rem] bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all h-32 resize-none placeholder:text-slate-300 shadow-sm" placeholder="Contoh: Lampirkan ttd SPV, minta tolong didahulukan karena mesin tunggu..."></textarea>
          </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

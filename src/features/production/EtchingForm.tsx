'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { ReportExportButton } from '@/features/report/ReportExportButton';
import { FormField, TechnicalGrid, ProcessTimeGroup } from '@/components/forms/FormComponents';
import { ShieldAlert } from 'lucide-react';

export function EtchingForm() {
  const { updateFormField } = useFormStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ReportExportButton type="ETCHING" />
      </div>
      <GlobalInputForm
        title="Form Monitoring ETCHING"
        collectionName="FS_DB_ETCHING"
        autoGenPrefix="ETC"
        requiredFields={['NO_JOP', 'NAMA_JOP', 'NO_B', 'NAMA_OP']}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="NO JOP">
            <input required onChange={(e) => updateFormField('NO_JOP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-semibold" placeholder="JOP-XXXX" />
          </FormField>

          <FormField label="Nama JOP / Pekerjaan">
            <input required onChange={(e) => updateFormField('NAMA_JOP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-semibold" placeholder="Nama Pekerjaan" />
          </FormField>

          <FormField label="NO B (Blok)">
            <input required onChange={(e) => updateFormField('NO_B', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" placeholder="B-XXXX" />
          </FormField>

          <FormField label="Tipe">
            <input onChange={(e) => updateFormField('TIPE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <FormField label="Tebal Plate">
            <input onChange={(e) => updateFormField('TEBAL_PLATE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" placeholder="Contoh: 0.15" />
          </FormField>

          <FormField label="Operator">
            <input required onChange={(e) => updateFormField('NAMA_OP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <TechnicalGrid title="Batch & Quality Control" icon={ShieldAlert}>
            <div className="col-span-2 space-y-4 border-r pr-4 border-slate-100">
              <h5 className="text-[8px] font-black text-indigo-500 uppercase">Batch 1</h5>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Ambil Baru" labelColor="text-slate-400">
                  <input type="number" onChange={(e) => updateFormField('AMBIL_PLATE_BARU_1', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 text-xs text-center" />
                </FormField>
                <FormField label="Tambah" labelColor="text-slate-400">
                  <input type="number" onChange={(e) => updateFormField('TAMBAH_PLATE_1', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 text-xs text-center" />
                </FormField>
              </div>
            </div>
            <div className="col-span-2 flex flex-col justify-center items-center gap-2">
              <div className="grid grid-cols-2 gap-2 w-full">
                <FormField label="Plate Baik" labelColor="text-emerald-600">
                  <input type="number" onChange={(e) => updateFormField('PLATE_BAIK', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-emerald-50 text-xs text-center font-bold" />
                </FormField>
                <FormField label="Plate Rusak" labelColor="text-rose-600">
                  <input type="number" onChange={(e) => updateFormField('PLATE_RUSAK', Number(e.target.value))} className="w-full p-2 border rounded-lg bg-rose-50 text-xs text-center font-bold" />
                </FormField>
              </div>
            </div>
          </TechnicalGrid>

          <ProcessTimeGroup>
            <FormField label="File & Film">
              <input type="time" onChange={(e) => updateFormField('FILE_FILM', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
            <FormField label="Expose">
              <input type="time" onChange={(e) => updateFormField('EXPOSE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
            <FormField label="Washing">
              <input type="time" onChange={(e) => updateFormField('WASHING', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
            <FormField label="Gerinda">
              <input type="time" onChange={(e) => updateFormField('GERINDA', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
          </ProcessTimeGroup>

          <FormField label="Catatan / Keterangan" className="md:col-span-2 lg:col-span-3">
            <textarea onChange={(e) => updateFormField('KETERANGAN', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm h-20 resize-none" placeholder="Detail proses Etching..."></textarea>
          </FormField>
        </div>
      </GlobalInputForm>
    </div>
  );
}

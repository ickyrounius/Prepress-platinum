'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { ReportExportButton } from '@/features/report/ReportExportButton';
import { FormField, TechnicalGrid, ProcessTimeGroup } from '@/components/forms/FormComponents';
import { Package } from 'lucide-react';

export function FlexoForm() {
  const { updateFormField } = useFormStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ReportExportButton type="FLEXO" />
      </div>
      <GlobalInputForm
        title="Form Monitoring FLEXO"
        collectionName="FS_DB_FLEXO"
        autoGenPrefix="FLX"
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

          <FormField label="LPI">
            <input onChange={(e) => updateFormField('LPI', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" placeholder="Contoh: 150 LPI" />
          </FormField>

          <FormField label="Tebal Flexo">
            <input onChange={(e) => updateFormField('TEBAL_FLEXO', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" placeholder="Contoh: 1.14" />
          </FormField>

          <FormField label="Operator">
            <input required onChange={(e) => updateFormField('NAMA_OP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <FormField label="Luasan Flexo">
            <input type="number" onChange={(e) => updateFormField('LUASAN_FLEXO', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <TechnicalGrid title="Stok Flexo" icon={Package}>
            <FormField label="Masuk" labelColor="text-slate-500">
              <input type="number" onChange={(e) => updateFormField('MASUK', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 text-sm text-center" />
            </FormField>
            <FormField label="Keluar Baru" labelColor="text-indigo-600">
              <input type="number" onChange={(e) => updateFormField('KELUAR_BARU', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-indigo-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Ganti" labelColor="text-rose-600">
              <input type="number" onChange={(e) => updateFormField('GANTI', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-rose-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Sisa" labelColor="text-slate-500">
              <input type="number" onChange={(e) => updateFormField('SISA', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-slate-50 text-sm text-center" />
            </FormField>
          </TechnicalGrid>

          <ProcessTimeGroup>
            <FormField label="Main Expose">
              <input type="time" onChange={(e) => updateFormField('MAIN_EXPOSE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
            <FormField label="Washing">
              <input type="time" onChange={(e) => updateFormField('WASHING', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
            <FormField label="Selesai">
              <input type="time" onChange={(e) => updateFormField('SELESAI', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
            </FormField>
          </ProcessTimeGroup>

          <FormField label="Penyebab Rusak / Ganti" className="md:col-span-2 lg:col-span-3">
            <textarea onChange={(e) => updateFormField('Penyebab_Rusak', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm h-20 resize-none" placeholder="Alasan jika ada yang rusak atau ganti..."></textarea>
          </FormField>
        </div>
      </GlobalInputForm>
    </div>
  );
}

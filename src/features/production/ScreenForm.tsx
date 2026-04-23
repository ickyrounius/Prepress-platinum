'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { ReportExportButton } from '@/features/report/ReportExportButton';
import { FormField, TechnicalGrid, ProcessTimeGroup } from '@/components/forms/FormComponents';
import { Monitor } from 'lucide-react';

export function ScreenForm() {
  const { updateFormField } = useFormStore();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ReportExportButton type="SCREEN" />
      </div>
      <GlobalInputForm
        title="Form Monitoring SCREEN"
        collectionName="FS_DB_SCREEN"
        autoGenPrefix="SCR"
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

          <FormField label="Mesh Screen">
            <input onChange={(e) => updateFormField('MESH_SCREEN', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" placeholder="Contoh: T120" />
          </FormField>

          <FormField label="Tipe">
            <input onChange={(e) => updateFormField('TIPE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <FormField label="Operator">
            <input required onChange={(e) => updateFormField('NAMA_OP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <TechnicalGrid title="Screen Status" icon={Monitor}>
            <FormField label="Jumlah Baik" labelColor="text-emerald-600">
              <input type="number" onChange={(e) => updateFormField('Jumlah_Screen_Bagus', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-emerald-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Jumlah Rusak" labelColor="text-rose-600">
              <input type="number" onChange={(e) => updateFormField('Jumlah_Screen_Rusak', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-rose-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Jumlah Ganti" labelColor="text-amber-600">
              <input type="number" onChange={(e) => updateFormField('Jumlah_Screen_Ganti', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-amber-50 text-sm text-center font-bold" />
            </FormField>
          </TechnicalGrid>

          <ProcessTimeGroup>
            <FormField label="Hapus Screen">
              <input type="time" onChange={(e) => updateFormField('HAPUS_SCREEN', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-xs" />
            </FormField>
            <FormField label="Layout">
              <input type="time" onChange={(e) => updateFormField('LAYOUT', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-xs" />
            </FormField>
            <FormField label="Poles">
              <input type="time" onChange={(e) => updateFormField('POLES', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-xs" />
            </FormField>
            <FormField label="Expose">
              <input type="time" onChange={(e) => updateFormField('EXPOSE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-xs" />
            </FormField>
            <FormField label="Keraskan">
              <input type="time" onChange={(e) => updateFormField('KERASKAN', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-xs" />
            </FormField>
          </ProcessTimeGroup>

          <FormField label="Keterangan / Alasan Ganti" className="md:col-span-2 lg:col-span-3">
            <textarea onChange={(e) => updateFormField('KETERANGAN', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm h-20 resize-none" placeholder="Detail proses Screen..."></textarea>
          </FormField>
        </div>
      </GlobalInputForm>
    </div>
  );
}

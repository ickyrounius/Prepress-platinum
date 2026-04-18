'use client';

import React from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { ReportExportButton } from '@/features/report/ReportExportButton';
import { FormField, TechnicalGrid } from '@/components/forms/FormComponents';
import { Layers } from 'lucide-react';

interface CtpFormProps {
  type: 'CTP' | 'CTCP';
}

export function CtpForm({ type }: CtpFormProps) {
  const { updateFormField } = useFormStore();
  const collectionName = type === 'CTP' ? 'FS_DB_CTP' : 'FS_DB_CTCP';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ReportExportButton type={type} />
      </div>
      <GlobalInputForm
        title={`Form Monitoring ${type}`}
        collectionName={collectionName}
        autoGenPrefix={type}
        requiredFields={['NO_JOP', 'NAMA_JOP', 'UKURAN_PLATE', 'NAMA_OP']}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="NO JOP">
            <input required onChange={(e) => updateFormField('NO_JOP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="JOP-XXXX" />
          </FormField>

          <FormField label="Nama JOP / Pekerjaan">
            <input required onChange={(e) => updateFormField('NAMA_JOP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-semibold" placeholder="Nama Pekerjaan" />
          </FormField>

          <FormField label="No Plate">
            <input onChange={(e) => updateFormField('NO_PLATE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <FormField label="Mesin Expose">
            <select onChange={(e) => updateFormField('MESIN_EXPOSE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm">
              <option value="">- Pilih Mesin -</option>
              <option value="CRON">CRON</option>
              <option value="AMSKY">AMSKY</option>
              <option value="SCREEN">SCREEN</option>
            </select>
          </FormField>

          <FormField label="Ukuran Plate">
            <input required onChange={(e) => updateFormField('UKURAN_PLATE', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" placeholder="Contoh: 1030 x 800" />
          </FormField>

          <FormField label="Operator">
            <input required onChange={(e) => updateFormField('NAMA_OP', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm" />
          </FormField>

          <TechnicalGrid title="Plate Tracking" icon={Layers}>
            <FormField label="Plate Baru" labelColor="text-emerald-600">
              <input type="number" onChange={(e) => updateFormField('PLATE_BARU', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-emerald-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Plate Baik" labelColor="text-blue-600">
              <input type="number" onChange={(e) => updateFormField('PLATE_BAIK', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-blue-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Plate Rusak" labelColor="text-rose-600">
              <input type="number" onChange={(e) => updateFormField('PLATE_RUSAK', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-rose-50 text-sm text-center font-bold" />
            </FormField>
            <FormField label="Plate Ganti" labelColor="text-amber-600">
              <input type="number" onChange={(e) => updateFormField('PLATE_GANTI', Number(e.target.value))} className="w-full p-3 border rounded-xl bg-amber-50 text-sm text-center font-bold" />
            </FormField>
          </TechnicalGrid>

          <FormField label="Penyebab Rusak / Ganti" className="md:col-span-2 lg:col-span-3">
            <textarea onChange={(e) => updateFormField('PENYEBAB_RUSAK', e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 text-sm h-20 resize-none" placeholder="Tuliskan alasan jika ada plate rusak atau ganti..."></textarea>
          </FormField>
        </div>
      </GlobalInputForm>
    </div>
  );
}

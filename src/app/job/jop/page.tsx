'use client';

import { GlobalInputForm } from "@/components/forms/GlobalInputForm";
import { FormField } from "@/components/forms/FormComponents";
import { useFormStore } from "@/lib/store/useFormStore";

export default function InputJOP() {
  const { updateFormField } = useFormStore();

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Input JOP Baru</h1>
        <p className="text-sm text-slate-500 font-medium font-sans">Buat Job Order Printing baru untuk diteruskan ke tim DT/Produksi.</p>
      </div>

      <GlobalInputForm
        title="Formulir Job Order Printing"
        collectionName="FS_DB_JOP"
        autoGenPrefix="JOP"
        requiredFields={['NO_JOP', 'BUYER', 'NAMA_JOP']}
        submitLabel="Simpan Data JOP"
      >
        <div className="space-y-4">
          <FormField label="Nomor JOP">
            <input 
              required
              onChange={(e) => updateFormField('NO_JOP', e.target.value)} 
              className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="JOP-XXXX" 
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Customer (Buyer)">
              <input 
                required
                onChange={(e) => updateFormField('BUYER', e.target.value)} 
                className="w-full p-3 border rounded-xl bg-slate-50 text-sm" 
                placeholder="Nama PT / Customer" 
              />
            </FormField>

            <FormField label="Deadline Printing">
              <input 
                type="date"
                required
                onChange={(e) => updateFormField('TGL_TARGET_JOP', e.target.value)} 
                className="w-full p-3 border rounded-xl bg-slate-50 text-sm" 
              />
            </FormField>
          </div>

          <FormField label="Nama Job / Pekerjaan">
            <input 
              required
              onChange={(e) => updateFormField('NAMA_JOP', e.target.value)} 
              className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-semibold" 
              placeholder="Deskripsi Singkat" 
            />
          </FormField>

          <FormField label="Keterangan / Spesifikasi">
            <textarea 
              onChange={(e) => updateFormField('KETERANGAN', e.target.value)} 
              className="w-full p-3 border rounded-xl bg-slate-50 text-sm h-32 resize-none" 
              placeholder="Detail spesifikasi, warna, ukuran pelat..."
            ></textarea>
          </FormField>
        </div>
      </GlobalInputForm>
    </div>
  );
}

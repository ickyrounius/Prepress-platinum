'use client';

import { GlobalInputForm } from "@/components/forms/GlobalInputForm";
import { FormField } from "@/components/forms/FormComponents";
import { useFormStore } from "@/lib/store/useFormStore";

export default function InputJOS() {
  const { updateFormField, formData } = useFormStore();

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-1">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Input JOS Baru</h1>
        <p className="text-sm text-slate-500 font-medium font-sans">Buat Job Order Setting baru untuk diteruskan ke tim Designer (DG).</p>
      </div>

      <GlobalInputForm
        title="Formulir Job Order Setting"
        collectionName="FS_DB_JOS"
        autoGenPrefix="JOS"
        requiredFields={['NO_JOS', 'BUYER', 'NAMA_PRODUK']}
        submitLabel="Simpan Data JOS"
      >
        <div className="space-y-4">
          <FormField label="Nomor JOS">
            <input 
              required
              value={(formData.NO_JOS as string) || ''}
              onChange={(e) => updateFormField('NO_JOS', e.target.value)} 
              className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="JOS-XXXX" 
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Customer (Buyer)">
              <input 
                required
                value={(formData.BUYER as string) || ''}
                onChange={(e) => updateFormField('BUYER', e.target.value)} 
                className="w-full p-3 border rounded-xl bg-slate-50 text-sm" 
                placeholder="Nama PT / Customer" 
              />
            </FormField>

            <FormField label="Deadline Desain (Target)">
              <input 
                type="date"
                required
                value={(formData.TGL_TARGET_JOS as string) || ''}
                onChange={(e) => updateFormField('TGL_TARGET_JOS', e.target.value)} 
                className="w-full p-3 border rounded-xl bg-slate-50 text-sm" 
              />
            </FormField>
          </div>

          <FormField label="Nama Produk / Item">
            <input 
              required
              value={(formData.NAMA_PRODUK as string) || ''}
              onChange={(e) => updateFormField('NAMA_PRODUK', e.target.value)} 
              className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-semibold" 
              placeholder="Deskripsi Singkat Karya" 
            />
          </FormField>

          <FormField label="Kebutuhan Desain / Brief">
            <textarea 
              value={(formData.JENIS_PRODUK as string) || ''}
              onChange={(e) => updateFormField('JENIS_PRODUK', e.target.value)} 
              className="w-full p-3 border rounded-xl bg-slate-50 text-sm h-32 resize-none" 
              placeholder="Detail revisi, spesifikasi layout, warna khusus..."
            ></textarea>
          </FormField>
        </div>
      </GlobalInputForm>
    </div>
  );
}

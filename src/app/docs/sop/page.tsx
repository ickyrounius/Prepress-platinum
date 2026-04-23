'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Book, CheckCircle2, AlertCircle, FileText, Printer, PenTool, Database } from 'lucide-react';

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <motion.section 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4"
  >
    <div className="flex items-center gap-3 pb-4 border-b">
      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
        <Icon size={24} />
      </div>
      <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h2>
    </div>
    <div className="prose prose-slate max-w-none">
      {children}
    </div>
  </motion.section>
);

export default function SOPWikiPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Book className="text-indigo-600 w-8 h-8" />
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">SOP & Wiki Dashboard</h1>
        </div>
        <p className="text-slate-500 font-medium">Standard Operating Procedures for Prepress Platinum Operations.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Section title="Pendaftaran JOP & JOS (ADMIN)" icon={FileText}>
          <ul className="space-y-3 font-medium text-slate-600">
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} />
              Admin wajib melakukan registrasi nomor JOS/JOP baru melalui <strong>Admin Input Panel</strong> segera setelah PO diterima.
            </li>
            <li className="flex gap-2 items-start">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} />
              Sistem akan otomatis menentukan <strong>Tipe JOP</strong> (Lokal/Export/Karton) berdasarkan prefix nomor.
            </li>
            <li className="flex gap-2 items-start">
              <AlertCircle className="text-amber-500 shrink-0 mt-1" size={16} />
              Pastikan Tanggal Target (Deadline) sudah sesuai dengan estimasi timeline tim teknis.
            </li>
          </ul>
        </Section>

        <Section title="Alur Kerja DT & CAD" icon={PenTool}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Operator DT:</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tugas utama mencakup pembuatan layout dan blueprint. Update status di form ke &quot;Blueprint&quot; saat file siap cetak sampel. 
                Gunakan fitur <strong>Export Audit Log</strong> untuk melaporkan revisi CAD yang berulang.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Spesialis CAD:</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fokus pada presisi line-up. Status diset ke &quot;Done&quot; hanya setelah divalidasi oleh QC atau User Supervisor.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Produksi (CTCP/CTP)" icon={Printer}>
          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Database size={18} className="text-indigo-600" />
              Manajemen Inventaris Pelat
            </h3>
            <div className="space-y-2 text-sm text-slate-600 font-medium">
              <p>1. Catat jumlah <strong>Plate Baik</strong> secara akurat setelah proses eksposure.</p>
              <p>2. Jika terjadi kerusakan, wajib mencatat alasan di kolom <strong>Plate Rusak</strong> untuk audit QC.</p>
              <p>3. Permintaan <strong>Plate Gentian</strong> harus menyertakan nomor JOP lama untuk rekonsiliasi data.</p>
            </div>
          </div>
        </Section>

        <Section title="Metode Kalkulasi KPI" icon={CheckCircle2}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 italic">
                  <th className="p-3 text-left border">Metric</th>
                  <th className="p-3 text-left border">Value Logic</th>
                  <th className="p-3 text-left border">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr><td className="p-3 border font-bold">DP (Deadline Priority)</td><td className="p-3 border">Logic 2-5 Hari ke Deadline</td><td className="p-3 border text-rose-500 font-bold">High Priority</td></tr>
                <tr><td className="p-3 border font-bold">LA (Level Accuracy)</td><td className="p-3 border">Logic Beban KT/BS terhadap Target</td><td className="p-3 border text-indigo-500 font-bold">Auto-Calc</td></tr>
                <tr><td className="p-3 border font-bold">TC Score</td><td className="p-3 border">Total Complexity Score (KT+RP+BS+CAD)</td><td className="p-3 border text-emerald-500 font-bold">Performance</td></tr>
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}

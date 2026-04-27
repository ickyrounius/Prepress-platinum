'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, CheckCircle2, AlertCircle,
  FileText, Printer, PenTool,
  Database, Search, Layers,
  ShieldCheck, Wrench, Trophy,
  ChevronRight
} from 'lucide-react';

const Section = ({ title, icon: Icon, children, id }: { title: string, icon: React.ElementType, children: React.ReactNode, id?: string }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-6 transition-all hover:shadow-md hover:border-indigo-100 group"
  >
    <div className="flex items-center justify-between pb-6 border-b border-slate-100">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-inner">
          <Icon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">{title}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">SOP Reference Module</p>
        </div>
      </div>
      <ChevronRight className="text-slate-200 group-hover:text-indigo-300 transition-colors" size={24} />
    </div>
    <div className="prose prose-slate max-w-none">
      {children}
    </div>
  </motion.section>
);

const SOP_DATA = [
  {
    id: 'admin',
    title: 'Pendaftaran JOP & JOS (ADMIN)',
    icon: FileText,
    content: (
      <ul className="space-y-4 font-medium text-slate-600">
        <li className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={14} /></div>
          <span>Admin wajib melakukan registrasi nomor JOS/JOP baru melalui <strong>Admin Input Panel</strong> segera setelah PO diterima.</span>
        </li>
        <li className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={14} /></div>
          <span>Sistem akan otomatis menentukan <strong>Tipe JOP</strong> (Lokal/Export/Jasa) berdasarkan prefix nomor dan ID otomatis `DT-` atau `DG-`.</span>
        </li>
        <li className="flex gap-3 items-start">
          <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0 mt-0.5"><AlertCircle size={14} /></div>
          <span>Pastikan <strong>Tanggal Target</strong> sudah sesuai dengan estimasi timeline tim teknis untuk menghindari penalti KPI.</span>
        </li>
      </ul>
    )
  },
  {
    id: 'design',
    title: 'Alur Kerja Desain (DT & DG)',
    icon: PenTool,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-3 uppercase text-xs tracking-widest text-indigo-600">Operator DT / CAD:</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Tugas utama mencakup pembuatan layout dan blueprint. Update status ke <strong>&quot;Blueprint&quot;</strong> saat file siap cetak sampel.
            Gunakan fitur <strong>Export Audit Log</strong> untuk melaporkan revisi CAD yang berulang.
          </p>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-3 uppercase text-xs tracking-widest text-emerald-600">Designer DG / DS:</h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Fokus pada pemrosesan file grafis. Status diset ke <strong>&quot;Done&quot;</strong> hanya setelah divalidasi oleh QC atau User Supervisor. Pastikan resolusi gambar sesuai standar output.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'prepress',
    title: 'Operasional Prepress (PP)',
    icon: Printer,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <Wrench className="text-indigo-600" size={20} />
            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Standar ID: PP-MESIN-YYMMDD</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <Database className="text-emerald-600" size={20} />
            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Sync Master: Real-time via Hybrid DB</span>
          </div>
        </div>
        <div className="bg-slate-50 p-8 rounded-3xl border border-dashed border-slate-300">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={18} className="text-indigo-600" />
            Manajemen Output Produksi
          </h3>
          <div className="space-y-3 text-sm text-slate-600 font-medium">
            <p>1. Pilih kategori mesin yang sesuai (CTP, CTCP, FLEXO, SCREEN, ETCHING) di panel produksi.</p>
            <p>2. Gunakan <strong>Counter Plate</strong> untuk mencatat jumlah plate baik/rusak secara akurat.</p>
            <p>3. Setiap submit data akan otomatis mengupdate status di <strong>Master JOP</strong> menjadi &quot;PRODUKSI&quot;.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'support',
    title: 'Support Design (SD)',
    icon: Layers,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Departemen Support menangani prototyping dan persiapan alat bantu produksi (GMG, CNC, Blueprint).
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <li className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center font-black text-[10px] text-amber-700 uppercase tracking-widest">GMG Color Proof</li>
          <li className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center font-black text-[10px] text-slate-600 uppercase tracking-widest">CNC Machining</li>
          <li className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center font-black text-[10px] text-blue-700 uppercase tracking-widest">Blueprint Plotter</li>
        </ul>
      </div>
    )
  },
  {
    id: 'qc',
    title: 'Quality Control (QC)',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4">
        <div className="flex gap-4 p-6 bg-rose-50/50 rounded-3xl border border-rose-100">
          <AlertCircle className="text-rose-500 shrink-0" />
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            QC bertanggung jawab atas validasi akhir setiap tahapan. Status <strong>&quot;Closed&quot;</strong> hanya boleh diberikan setelah verifikasi fisik output produksi sesuai dengan spesifikasi JOP/JOS.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 'kpi',
    title: 'Metode Kalkulasi KPI',
    icon: Trophy,
    content: (
      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 text-left font-black text-[10px] text-slate-400 uppercase tracking-widest">Metric</th>
              <th className="p-4 text-left font-black text-[10px] text-slate-400 uppercase tracking-widest">Value Logic</th>
              <th className="p-4 text-left font-black text-[10px] text-slate-400 uppercase tracking-widest">Priority</th>
            </tr>
          </thead>
          <tbody className="text-slate-600 font-medium">
            <tr className="border-b hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-800 italic">DP (Deadline Priority)</td>
              <td className="p-4">Logic 2-5 Hari ke Deadline</td>
              <td className="p-4"><span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black uppercase">High</span></td>
            </tr>
            <tr className="border-b hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-800 italic">LA (Loop Approval)</td>
              <td className="p-4">Jumlah Revisi / Reproses</td>
              <td className="p-4"><span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[9px] font-black uppercase">Medium</span></td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-800 italic">TC (Tech Complexity)</td>
              <td className="p-4">KT + RP + BS + CAD Weights</td>
              <td className="p-4"><span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase">Dynamic</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
];

export default function SOPWikiPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSop = SOP_DATA.filter(sop =>
    sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="bg-indigo-600 p-10 sm:p-16 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-indigo-100 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full border border-white/30 backdrop-blur-md">
            <Book className="text-white" size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Documentation Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-none">SOP & Wiki <br /> <span className="text-indigo-200">Prepress Platinum</span></h1>
          <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest text-[10px] max-w-lg leading-relaxed">
            Panduan resmi operasional, alur kerja antar departemen, dan standar manajemen kualitas sistem Prepress Platinum.
          </p>

          <div className="relative max-w-md pt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Cari Panduan SOP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/40 focus:bg-white/20 focus:border-white/40 outline-none transition-all backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredSop.map((sop) => (
            <Section key={sop.id} title={sop.title} icon={sop.icon} id={sop.id}>
              {sop.content}
            </Section>
          ))}
        </AnimatePresence>

        {filteredSop.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
          >
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">SOP Tidak Ditemukan</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Coba gunakan kata kunci lain seperti &quot;Admin&quot;, &quot;Prepress&quot;, atau &quot;KPI&quot;</p>
          </motion.div>
        )}
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-black tracking-tight">Butuh Bantuan Teknis?</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hubungi Tim Developer atau System Administrator</p>
        </div>
        <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
          Laporkan Kendala Sistem
        </button>
      </div>
    </div>
  );
}

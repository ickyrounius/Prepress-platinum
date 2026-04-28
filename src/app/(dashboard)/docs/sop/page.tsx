'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book, Search, Edit, Save, X,
  FileText, PenTool, Printer, Layers, 
  ShieldCheck, Trophy, Database, Wrench, ChevronRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { normalizeRole, ADMIN_ROLES } from '@/lib/accessControl';
import { cn } from '@/lib/utils';

// Icon Map
const iconMap: Record<string, React.ElementType> = {
  FileText, PenTool, Printer, Layers, ShieldCheck, Trophy, Book, Database, Wrench
};

interface WikiSection {
  id: string;
  title: string;
  iconStr: string;
  content: string;
}

const DEFAULT_WIKI: WikiSection[] = [
  {
    id: 'admin',
    title: 'Pendaftaran JOP & JOS (ADMIN)',
    iconStr: 'FileText',
    content: `1. Admin wajib melakukan registrasi nomor JOS/JOP baru melalui Admin Input Panel segera setelah PO diterima.\n2. Sistem akan otomatis menentukan Tipe JOP (Lokal/Export/Jasa) berdasarkan prefix nomor dan ID otomatis.\n3. Pastikan Tanggal Target sudah sesuai dengan estimasi timeline tim teknis untuk menghindari penalti KPI.`
  },
  {
    id: 'design',
    title: 'Alur Kerja Desain (DT & DG)',
    iconStr: 'PenTool',
    content: `OPERATOR DT / CAD:\nTugas utama mencakup pembuatan layout dan blueprint. Update status ke "Blueprint" saat file siap cetak sampel. Gunakan fitur Export Audit Log untuk melaporkan revisi CAD yang berulang.\n\nDESIGNER DG / DS:\nFokus pada pemrosesan file grafis. Status diset ke "Done" hanya setelah divalidasi oleh QC atau User Supervisor. Pastikan resolusi gambar sesuai standar output.`
  },
  {
    id: 'prepress',
    title: 'Operasional Prepress (PP)',
    iconStr: 'Printer',
    content: `Standar ID: PP-MESIN-YYMMDD | Sync Master: Real-time via Hybrid DB\n\nManajemen Output Produksi:\n1. Pilih kategori mesin yang sesuai (CTP, CTCP, FLEXO, SCREEN, ETCHING) di panel produksi.\n2. Gunakan Counter Plate untuk mencatat jumlah plate baik/rusak secara akurat.\n3. Setiap submit data akan otomatis mengupdate status di Master JOP menjadi "PRODUKSI".`
  },
  {
    id: 'support',
    title: 'Support Design (SD)',
    iconStr: 'Layers',
    content: `Departemen Support menangani prototyping dan persiapan alat bantu produksi (GMG, CNC, Blueprint).\n\nAlat Utama Yang Digunakan:\n- GMG Color Proof\n- CNC Machining\n- Blueprint Plotter\n\nSetiap output support harus divalidasi terlebih dahulu sebelum diserahkan ke produksi.`
  },
  {
    id: 'qc',
    title: 'Quality Control (QC)',
    iconStr: 'ShieldCheck',
    content: `QC bertanggung jawab atas validasi akhir setiap tahapan. Status "Closed" hanya boleh diberikan setelah verifikasi fisik output produksi sesuai dengan spesifikasi JOP/JOS.`
  },
  {
    id: 'kpi',
    title: 'Metode Kalkulasi KPI',
    iconStr: 'Trophy',
    content: `1. DP (Deadline Priority)\n-> Priority: High\n-> Logic: Kalkulasi Urgency mundur 2-5 Hari ke Deadline yang ditetapkan PPIC.\n\n2. LA (Loop Approval)\n-> Priority: Medium\n-> Logic: Jumlah Total Revisi / Pengembalian proses (Reproses).\n\n3. TC (Technical Complexity)\n-> Priority: Dynamic\n-> Logic: Bobot Desain + Layout + Finishing yang diberikan oleh Supervisor.`
  }
];

export default function SOPWikiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [wikiData, setWikiData] = useState<WikiSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editData, setEditData] = useState<WikiSection[]>([]);

  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);
  // SPV, MANAGER, KOORDINATOR, DEVELOPER, ADMIN can edit
  const canEdit = [...ADMIN_ROLES, "MANAGER", "KOORDINATOR"].includes(normalizedRole) || normalizedRole.startsWith("SPV");

  useEffect(() => {
    const docRef = doc(db, 'm_settings', 'sop_wiki');
    
    const unsub = onSnapshot(docRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.sections && Array.isArray(data.sections)) {
           setWikiData(data.sections);
           if (!isEditMode) setEditData(data.sections);
        }
      } else {
        // Init default docs if completely empty (First Run only)
        await setDoc(docRef, { sections: DEFAULT_WIKI });
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [isEditMode]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await setDoc(doc(db, 'm_settings', 'sop_wiki'), { sections: editData });
      setIsEditMode(false);
    } catch (e) {
      console.error("Error saving wiki", e);
      alert("Gagal menyimpan perubahan. Coba cek koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSectionText = (id: string, newText: string) => {
    setEditData(prev => prev.map(sec => sec.id === id ? { ...sec, content: newText } : sec));
  };
  const updateSectionTitle = (id: string, newTitle: string) => {
    setEditData(prev => prev.map(sec => sec.id === id ? { ...sec, title: newTitle } : sec));
  };

  const currentDisplayData = isEditMode ? editData : wikiData;
  const filteredSop = currentDisplayData.filter(sop =>
    sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-12 pb-20 animate-in fade-in duration-700">
      <div className="bg-indigo-600 p-10 sm:p-16 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-indigo-100 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full border border-white/30 backdrop-blur-md">
              <Book className="text-white" size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Documentation Center</span>
            </div>
            
            {canEdit && !isEditMode && (
              <button 
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white text-white hover:text-indigo-600 px-5 py-2.5 rounded-full transition-all border border-white/30 text-xs font-black uppercase tracking-widest shadow-md"
              >
                <Edit size={16} /> Edit Wiki
              </button>
            )}

            {canEdit && isEditMode && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (confirm('Batalkan seluruh perubahan Anda?')) {
                      setIsEditMode(false);
                      setEditData(wikiData);
                    }
                  }}
                  className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest shadow-md"
                >
                  <X size={16} /> Batal
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full transition-all text-xs font-black uppercase tracking-widest shadow-md"
                  disabled={isLoading}
                >
                  <Save size={16} /> {isLoading ? 'Menyimpan...' : 'Simpan Wiki'}
                </button>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-none">SOP & Wiki <br /> <span className="text-indigo-200">Prepress Platinum</span></h1>
          <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest text-[10px] max-w-lg leading-relaxed">
            {isEditMode ? "Mode Edit Aktif! Pastikan hanya mensosialisasikan standar aturan baku yang berlaku dalam perusahaan." : "Panduan resmi operasional, alur kerja antar departemen, dan standar manajemen kualitas sistem Prepress Platinum."}
          </p>

          {!isEditMode && (
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
          )}
        </div>
      </div>

      {isLoading && !isEditMode && (
         <div className="text-center py-20 animate-pulse text-indigo-400 font-bold uppercase tracking-widest text-xs">Memuat Data SOP...</div>
      )}

      <div className="grid grid-cols-1 gap-10">
        <AnimatePresence mode="popLayout">
          {(!isLoading || isEditMode) && filteredSop.map((sop) => {
            const Icon = iconMap[sop.iconStr] || FileText;
            return (
              <motion.section
                key={sop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "bg-white border rounded-[2.5rem] p-8 sm:p-10 shadow-sm space-y-6 transition-all group",
                  isEditMode ? "border-amber-200 shadow-amber-900/5 ring-4 ring-amber-50" : "border-slate-200 hover:shadow-md hover:border-indigo-100"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] group-hover:scale-110 transition-transform shadow-inner shrink-0">
                      <Icon size={28} />
                    </div>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        value={sop.title} 
                        onChange={(e) => updateSectionTitle(sop.id, e.target.value)}
                        className="w-full md:w-3/4 p-3 border-2 border-indigo-100 rounded-xl text-xl font-black text-slate-800 uppercase focus:border-indigo-500 outline-none transition-all"
                        placeholder="Judul / Nama SOP..."
                      />
                    ) : (
                      <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-none">{sop.title}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">SOP Reference Module</p>
                      </div>
                    )}
                  </div>
                  {!isEditMode && <ChevronRight className="text-slate-200 group-hover:text-indigo-300 transition-colors shrink-0 hidden sm:block" size={24} />}
                </div>
                
                <div className="w-full">
                  {isEditMode ? (
                     <textarea
                       value={sop.content}
                       onChange={(e) => updateSectionText(sop.id, e.target.value)}
                       className="w-full min-h-[200px] p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 text-slate-700 text-sm font-medium leading-relaxed focus:bg-white focus:border-indigo-500 outline-none transition-all resize-y shadow-inner custom-scrollbar"
                       placeholder="Ketik detail isi prosedur/SOP di sini..."
                     />
                  ) : (
                     <div className="text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                        {sop.content}
                     </div>
                  )}
                </div>
              </motion.section>
            );
          })}
        </AnimatePresence>

        {filteredSop.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
          >
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Data SOP Belum Tersedia</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{isEditMode ? 'Silakan perbarui format/data.' : 'Cari kata kunci lain atau hubungi admin.'}</p>
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

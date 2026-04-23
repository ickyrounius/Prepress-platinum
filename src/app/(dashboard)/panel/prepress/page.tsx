'use client';

import React, { useState, useEffect } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { db } from '@/lib/firebase';
import { exportToPDF } from '@/features/report/exportPDF';
import { useAuth } from '@/features/auth/AuthContext';
import { recordAuditLog } from '@/features/audit-log/auditLogService';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stack, 
  SelectionAll, 
  NotePencil, 
  CheckCircle,
  FileText,
  Monitor,
  Lightning,
  Pulse,
  Queue,
  Clock,
  User,
  CaretRight,
  ArrowsClockwise,
  DownloadSimple
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function PrepressPanel() {
  const { user, role } = useAuth();
  const { updateFormField, formData } = useFormStore();

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);
  const [waitingList, setWaitingList] = useState<Array<{
    id: string;
    _type: string;
    no_jop: string;
    no_b: string;
    pic: string;
    buyer: string;
    timestamp: Date;
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Queue Listener
  useEffect(() => {
    const collections = [
        { name: 'proses_jod', type: 'DESIGN' },
        { name: 'proses_dt_b', type: 'TECHNICAL' }
    ];

    const unsubscribes = collections.map(col => {
        const q = query(collection(db, col.name));
        return onSnapshot(q, (snapshot) => {
            const items: Array<{
              id: string;
              _type: string;
              no_jop: string;
              no_b: string;
              pic: string;
              buyer: string;
              timestamp: Date;
            }> = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                const status = (data.status_dg || data.ST_WORKFLOW || data.status_dt || '').toUpperCase();
                
                // Only show jobs that are DONE but not yet in prepress (logic check simplified for demo)
                if (['DONE', 'CLOSED', 'SELESAI', 'SELESAI LAYOUT', 'SELESAI CAD'].includes(status)) {
                    items.push({ 
                        id: doc.id, 
                        _type: col.type,
                        no_jop: data.NO_JOP || data.NO_JOS || data.no_jop || data.no_jos,
                        no_b: data.no_b || data.NO_B || '-',
                        pic: data.pic_utama || data.pic || data.PIC || 'Unknown',
                        buyer: data.buyer || data.BUYER || 'N/A',
                        timestamp: data.updatedAt?.toDate() || new Date()
                    });
                }
            });

            setWaitingList(prev => {
                const filtered = prev.filter(p => !items.some(newItem => newItem.id === p.id));
                return [...filtered, ...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            });
            setLoading(false);
        });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const handleAutofill = (item: { no_jop: string; no_b: string }) => {
    updateFormField('no_jop', item.no_jop);
    updateFormField('no_b', item.no_b);
    // Visual feedback
    const el = document.getElementById('prepress-assignment-form');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExportQueue = () => {
    const columns = ['ID', 'Type', 'NO JOP/JOS', 'NO B', 'PIC', 'Buyer', 'Timestamp'];
    const rows = waitingList.map((item) => [
      item.id,
      item._type,
      item.no_jop,
      item.no_b,
      item.pic,
      item.buyer,
      item.timestamp.toLocaleString(),
    ]);
    exportToPDF('Prepress Waiting Queue Report', columns, rows, `prepress-queue-${Date.now()}.pdf`);
    if (user?.uid) {
      void recordAuditLog({
        actorUid: user.uid,
        action: "export_pdf",
        entityType: "prepress_queue",
        entityId: "waiting_queue",
        metadata: { rows: rows.length },
      });
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="bg-slate-900 p-8 sm:p-14 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <Stack className="text-indigo-400" weight="fill" size={16} />
                <span className="text-[10px] font-black text-indigo-100 uppercase tracking-[0.2em]">Assignment & Control Panel</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                Prepress Production <br />
                <span className="text-indigo-400">Control Center</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest text-[10px] max-w-xl leading-relaxed">
                Panel koordinasi untuk manajer produksi dan koordinator prepress. Memantau JOP yang siap dikerjakan dan mengalokasikannya ke unit mesin.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                    <Queue size={28} weight="bold" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Queue Status</p>
                    <p className="text-2xl font-black text-white leading-none">{waitingList.length} <span className="text-xs opacity-50">Jobs Waiting</span></p>
                </div>
            </div>
            <button
              onClick={handleExportQueue}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all w-fit"
            >
              <DownloadSimple weight="bold" /> Export Queue PDF
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Left Column: Form Assignment */}
        <motion.div variants={itemVariants} className="xl:col-span-2 space-y-8">
            <div id="prepress-assignment-form">
                <GlobalInputForm
                    title="Alokasi Pengerjaan Baru"
                    collectionName="proses_prepress_b"
                    autoGenPrefix="PRE-PROC"
                    className="rounded-[3rem] border-slate-100 shadow-xl overflow-hidden bg-white"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-2">
                        
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <FileText weight="bold" size={18} className="text-indigo-500" /> Nomor Identifikasi
                                </label>
                                <JOPSearch 
                                    type="JOP"
                                    label="CARI NO JOP / JOS"
                                    required
                                    onSelect={(id) => updateFormField('no_jop', id)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <SelectionAll weight="bold" size={18} className="text-sky-500" /> Referensi Blok (NO B)
                                </label>
                                <input 
                                    required 
                                    value={(formData.no_b as string) || ''}
                                    onChange={(e) => updateFormField('no_b', e.target.value)} 
                                    className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-sm font-black focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300" 
                                    placeholder="CONTOH: B1, B2..." 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <User weight="bold" size={18} className="text-indigo-500" /> Bekerja Sebagai
                                </label>
                                <div className="w-full p-5 border-2 border-indigo-100 rounded-[1.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-between shadow-sm">
                                    <span className="text-sm font-black uppercase tracking-wider">{role || 'MEMUAT...'}</span>
                                    <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border border-indigo-100 tracking-widest uppercase">Auto</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Monitor weight="bold" size={18} className="text-emerald-500" /> Unit Mesin Produksi
                                </label>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-[1.5rem] border-2 border-slate-100">
                                {['CTP', 'CTCP', 'FLEXO', 'ETCHING', 'SCREEN'].map(tipe => (
                                    <label key={tipe} className={cn(
                                        "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer",
                                        formData.proses_pengerjaan === tipe 
                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.03]" 
                                            : "bg-white border-slate-50 text-slate-600 hover:border-indigo-200"
                                    )}>
                                    <input 
                                        type="radio" 
                                        required 
                                        name="proses_pengerjaan" 
                                        value={tipe} 
                                        onChange={(e) => updateFormField('proses_pengerjaan', e.target.value)} 
                                        className="hidden" 
                                    />
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                        formData.proses_pengerjaan === tipe ? "border-white" : "border-slate-300"
                                    )}>
                                        {formData.proses_pengerjaan === tipe && <div className="w-2 h-2 bg-indigo-400 rounded-full" />}
                                    </div>
                                    <span className="text-[11px] font-black tracking-widest">{tipe}</span>
                                    </label>
                                ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-1">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                <CheckCircle weight="bold" size={18} className="text-amber-500" /> Status Hasil
                            </label>
                            <select 
                                required 
                                onChange={(e) => updateFormField('status_prepress', normalizeWorkflowStatusInput(e.target.value))} 
                                value={(formData.status_prepress as string) || ''}
                                className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-xs font-black appearance-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            >
                                <option value="">- PILIH STATUS -</option>
                                <option value="APPROVED">BAIK (NORMAL)</option>
                                <option value="REJECT">RUSAK (REJECT)</option>
                                <option value="HOLD">GANTI (REPLACEMENT)</option>
                            </select>
                        </div>

                        <div className="space-y-4 md:col-span-1">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                <Lightning weight="bold" size={18} className="text-indigo-500" /> Tahap Pengerjaan
                            </label>
                            <select 
                                required 
                                onChange={(e) => updateFormField('tahapan_prepress', normalizeWorkflowStatusInput(e.target.value))} 
                                value={(formData.tahapan_prepress as string) || ''}
                                className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-xs font-black appearance-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            >
                                <option value="">- PILIH TAHAPAN -</option>
                                <option value="PROSES">RIP / PROCESSING</option>
                                <option value="PROSES">EXPOSE & DRYING</option>
                                <option value="REVIEW">QUALITY CONTROL</option>
                                <option value="DONE">DONE / FINISHED</option>
                            </select>
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                                <NotePencil weight="bold" size={18} className="text-slate-400" /> Catatan Detail (Opsional)
                            </label>
                            <textarea 
                                onChange={(e) => updateFormField('catatan_prepress', e.target.value)} 
                                value={(formData.catatan_prepress as string) || ''}
                                className="w-full p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-36 resize-none placeholder:text-slate-300" 
                                placeholder="Tambahkan alasan kerusakan atau instruksi khusus..."
                            />
                        </div>

                    </div>
                </GlobalInputForm>
            </div>
        </motion.div>

        {/* Right Column: Waiting List / Queue */}
        <motion.div variants={itemVariants} className="space-y-6">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl min-h-[600px] flex flex-col group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <ArrowsClockwise weight="bold" size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Daftar Tunggu</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Ready for Production</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                            <Pulse size={48} className="text-emerald-500 animate-pulse" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Searching Ready Jobs...</p>
                        </div>
                    ) : waitingList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30 grayscale">
                            <CheckCircle size={64} weight="thin" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Yeay! Antrian Kosong.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {waitingList.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleAutofill(item)}
                                    className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-emerald-600 hover:border-emerald-700 hover:shadow-xl hover:shadow-emerald-100 transition-all cursor-pointer group/item relative overflow-hidden active:scale-95"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover/item:bg-white/30" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[8px] font-black text-white",
                                                    item._type === 'DESIGN' ? "bg-indigo-500" : "bg-sky-500"
                                                )}>{item._type}</span>
                                                <h4 className="text-sm font-black text-slate-800 group-hover/item:text-white transition-colors">{item.no_jop}</h4>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover/item:text-emerald-100">
                                                    <User size={12} weight="bold" /> {item.pic}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover/item:text-emerald-100 font-bold uppercase">
                                                    <SelectionAll size={12} weight="bold" /> {item.no_b}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md group-hover/item:bg-emerald-400 group-hover/item:text-white transition-all">
                                            <CaretRight weight="bold" />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-slate-200/50 group-hover/item:border-white/20 flex items-center justify-between">
                                        <p className="text-[9px] font-black text-slate-400 group-hover/item:text-white uppercase truncate max-w-[120px]">{item.buyer}</p>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 group-hover/item:text-white italic">
                                            <Clock size={10} /> {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 group-hover:bg-indigo-600 group-hover:border-indigo-700 transition-all duration-500">
                   <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-indigo-600">
                            <Lightning weight="fill" />
                        </div>
                        <p className="text-[10px] font-black text-indigo-700 group-hover:text-white leading-tight uppercase tracking-tight">
                            Klik item di atas untuk <br />otomatis mengisi form.
                        </p>
                   </div>
                </div>
            </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

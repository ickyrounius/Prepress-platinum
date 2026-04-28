'use client';

import React, { useEffect, useState } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { TCGuide } from '@/components/forms/TCGuide';
import { db } from '@/lib/firebase';
import { DEFAULT_TC_FORMULA, calculateDeadlinePressureScore, calculateTotalTc, type TCFormulaConfig } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';
import { 
  Palette, PencilCircle,
  Info, Calculator, SelectionAll,
  Plus
} from '@phosphor-icons/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { getTCLevelInfo } from '@/features/kpi/kpiStyles';
import { MultiItemInput } from '@/components/forms/MultiItemInput';

const TCSelector = ({ label, value, onChange, colorClass }: { label: string; value: number; onChange: (v: number) => void; colorClass: string }) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[10px] sm:text-[11px] font-black transition-all flex items-center justify-center shadow-sm flex-shrink-0',
              value === num
                ? `${colorClass} text-white border-transparent shadow-lg scale-110 z-10`
                : 'bg-white border-slate-200 text-slate-400 hover:border-pink-300 hover:text-pink-400 hover:bg-pink-50/30'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function DGPanel() {
  const { user, role } = useAuth();
  const { updateFormField, formData } = useFormStore();
  const [tcValues, setTcValues] = useState({ kt: 0, rp: 0, bs: 0, cad: 0 });
  const [laValue, setLaValue] = useState(1);
  const [dpValue, setDpValue] = useState(1);
  const [totalTc, setTotalTc] = useState(0);
  const [tcFormula, setTcFormula] = useState<TCFormulaConfig>(DEFAULT_TC_FORMULA);
  const [tcLevel, setTcLevel] = useState({ label: 'EMPTY', color: 'bg-slate-400' });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'm_settings', 'kpi_config'), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as { tcFormula?: Partial<TCFormulaConfig> };
      if (data.tcFormula) setTcFormula({ ...DEFAULT_TC_FORMULA, ...data.tcFormula });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (role) {
      updateFormField('role_type', role.toUpperCase());
    }
  }, [role, updateFormField]);

  useEffect(() => {
    const total = calculateTotalTc(tcValues, laValue, dpValue, tcFormula);
    setTotalTc(total);
    updateFormField('tc', {
      kt: tcValues.kt,
      rp: tcValues.rp,
      bs: tcValues.bs,
      cad: tcValues.cad,
      la: laValue,
      dp: dpValue,
      total_tc: total,
    });
    setTcLevel(getTCLevelInfo(total));
    updateFormField('total_tc', total);
    updateFormField('tc_la', laValue);
    updateFormField('tc_dp', dpValue);
  }, [tcValues, laValue, dpValue, tcFormula, updateFormField]);

  const handleTcChange = (key: keyof typeof tcValues, val: number) => {
    setTcValues((prev) => ({ ...prev, [key]: val }));
    updateFormField(`tc_${key}`, val);
  };

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-1000">
      
      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-pink-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-200">
                        <Palette weight="bold" size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Design Graphic</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                            Creative & Artwork Workflow
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-end shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Designer</span>
                        <span className="text-[11px] font-black text-pink-600 truncate max-w-[150px]">{user?.displayName || 'Designer'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <GlobalInputForm
        title="Form Progress DG (Design Graphic)"
        collectionName="proses_jod"
        autoGenPrefix="DG-PROC"
        className="p-0 border-none shadow-none max-w-none bg-transparent space-y-12"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            
            {/* Left Column: Identitas & Progress */}
            <div className="space-y-10">
                <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <Info weight="bold" className="text-pink-500" size={24} />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Job Identification</h3>
                    </div>

                    <JOPSearch 
                        type="JOS"
                        label="CARI NO_JOS-D (ATAU BUYER)"
                        required
                        onSelect={(id, data) => {
                            updateFormField('no_jos', id);
                            if (data) {
                                if (data.tgl_no_jos || data.TGL_MASUK_JOS) updateFormField('tgl_masuk', String(data.tgl_no_jos || data.TGL_MASUK_JOS));
                                if (data.tgl_target_no_jos || data.TGL_TARGET_JOS) updateFormField('tgl_target', String(data.tgl_target_no_jos || data.TGL_TARGET_JOS));
                                if (data.revisi_ke || data.REVISI_KE) {
                                    const rev = Number(data.revisi_ke || data.REVISI_KE);
                                    updateFormField('revisi_ke', rev);
                                    setLaValue(Math.min(rev + 1, 5));
                                }
                                
                                // Autofill newly added JOS fields
                                if (data.jml_warna) updateFormField('jml_warna', data.jml_warna);
                                if (data.jml_design) updateFormField('jml_design', data.jml_design);
                                if (data.jenis_bahan) updateFormField('jenis_bahan', data.jenis_bahan);

                                const dp = calculateDeadlinePressureScore(
                                    data.tgl_target_no_jos ?? data.TGL_TARGET_JOS ?? data.tgl_target,
                                    data.tgl_no_jos ?? data.TGL_MASUK_JOS ?? data.tgl_masuk
                                );
                                setDpValue(dp);
                            }
                        }}
                    />

                    <MultiItemInput 
                        label="Detail Order / NO JOD"
                        placeholder="Ketik NO JOD (misal: J1), lalu Enter..."
                        value={(formData.no_jod as string) || ''}
                        onChange={(val) => updateFormField('no_jod', val)}
                        icon={<SelectionAll weight="bold" size={18} className="text-pink-500" />}
                        themeColor="pink"
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jml Warna</label>
                            <input type="number" 
                                value={(formData.jml_warna as string) || ''}
                                onChange={(e) => updateFormField('jml_warna', e.target.value)} 
                                className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm font-black focus:bg-white focus:border-pink-500 outline-none transition-all placeholder:text-slate-300" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jml Design</label>
                            <input type="number" 
                                value={(formData.jml_design as string) || ''}
                                onChange={(e) => updateFormField('jml_design', e.target.value)} 
                                className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm font-black focus:bg-white focus:border-pink-500 outline-none transition-all placeholder:text-slate-300" placeholder="0" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jenis Bahan JOD</label>
                        <input 
                            value={(formData.jenis_bahan as string) || ''}
                            onChange={(e) => updateFormField('jenis_bahan', e.target.value)} 
                            className="w-full p-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm font-bold focus:bg-white focus:border-pink-500 outline-none transition-all placeholder:text-slate-300" placeholder="Contoh: Art Paper 150gr, Ivory, dll" />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Workflow Status (WIP)</label>
                        <select required 
                            onChange={(e) => updateFormField('status_dg', normalizeWorkflowStatusInput(e.target.value))} 
                            value={(formData.status_dg as string) || ''}
                            className="w-full p-4 sm:p-6 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-xs font-black appearance-none focus:bg-white focus:border-pink-500 focus:ring-4 sm:focus:ring-8 focus:ring-pink-500/5 outline-none transition-all"
                        >
                            <option value="">- PILIH TAHAPAN DESAIN -</option>
                            <option value="PROSES">PENGERJAAN (PROSESS)</option>
                            <option value="Preview">PENGAJUAN PREVIEW (GALLERY)</option>
                            <option value="HOLD">PERBAIKAN (REVISI)</option>
                            <option value="HOLD_FEEDBACK">MENUNGGU FEEDBACK (HOLD)</option>
                            <option value="DONE">DESAIN FINAL (SELESAI)</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <PencilCircle weight="bold" className="text-rose-500" size={24} />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Catatan & Masalah</h3>
                    </div>
                    <textarea 
                        onChange={(e) => updateFormField('catatan_dg', e.target.value)} 
                        value={(formData.catatan_dg as string) || ''}
                        className="w-full p-4 sm:p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 text-sm font-medium focus:bg-white focus:border-pink-500 focus:ring-4 sm:focus:ring-8 focus:ring-pink-500/5 outline-none transition-all h-32 sm:h-40 resize-none placeholder:text-slate-300 shadow-inner"
                        placeholder="Detail revisi, nama file master, atau kendala material..."
                    />
                </div>
            </div>

            {/* Right Column: TC Calculation */}
            <div className="space-y-10">
                <div className="bg-slate-900 p-10 sm:p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center">
                                <Calculator weight="fill" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Difficulty Score</h3>
                                <p className="text-[9px] font-black text-pink-400 uppercase tracking-widest leading-none mt-1">Creative Effort Metric</p>
                            </div>
                        </div>
                        {totalTc > 0 && (
                            <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg", tcLevel.color)}>
                                {tcLevel.label}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <TCSelector label="KT (Artwork)" value={tcValues.kt} onChange={(v) => handleTcChange('kt', v)} colorClass="bg-pink-600" />
                        <TCSelector label="RP (Output)" value={tcValues.rp} onChange={(v) => handleTcChange('rp', v)} colorClass="bg-emerald-600" />
                        <TCSelector label="BS (Complexity)" value={tcValues.bs} onChange={(v) => handleTcChange('bs', v)} colorClass="bg-amber-500" />
                        <TCSelector label="CAD (Layout)" value={tcValues.cad} onChange={(v) => handleTcChange('cad', v)} colorClass="bg-rose-500" />
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/10 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loop Approval (LA)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-pink-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-pink-500/20">{laValue}</div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">Total <br/>Review Cycle</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deadline Pressure (DP)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black text-lg flex items-center justify-center shadow-lg">{dpValue}</div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">Time <br/>Urgency Level</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-10 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-1">Total KPI Earnings</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">{totalTc}</h4>
                                <span className="text-xs font-black text-pink-300 uppercase">Points</span>
                            </div>
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-pink-500/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 border-t-4 border-pink-500 rounded-full animate-spin duration-[3s]" />
                            <span className="text-[10px] font-black text-pink-300">CORE</span>
                        </div>
                    </div>
                </div>

                <TCGuide />
            </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

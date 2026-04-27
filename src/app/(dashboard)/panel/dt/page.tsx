'use client';

import React, { useState, useEffect } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { TCGuide } from '@/components/forms/TCGuide';
import { db } from '@/lib/firebase';
import { DEFAULT_TC_FORMULA, calculateDeadlinePressureScore, calculateTotalTc, type TCFormulaConfig } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { getTCLevelInfo } from '@/features/kpi/kpiStyles';
import { 
  Palette, Calculator, WarningCircle, SelectionAll, Lightning
} from '@phosphor-icons/react';

const TCSelector = ({ label, value, onChange, colorClass }: { label: string, value: number, onChange: (v: number) => void, colorClass: string }) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center justify-between xl:justify-start xl:gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              "w-10 h-10 rounded-xl border text-xs font-black transition-all flex items-center justify-center shadow-sm hover:-translate-y-0.5",
              value === num 
                ? `${colorClass} text-white border-transparent shadow-lg scale-110 z-10 hover:-translate-y-0` 
                : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-slate-50 hover:shadow-md"
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function DTPanel() {
  const { user, role } = useAuth();
  const { updateFormField, formData } = useFormStore();
  
  // Local state for TC calculation
  const [tcValues, setTcValues] = useState({ kt: 0, rp: 0, bs: 0, cad: 0 });
  const [laValue, setLaValue] = useState(1); 
  const [dpValue, setDpValue] = useState(1);
  const [totalTc, setTotalTc] = useState(0);
  const [tcFormula, setTcFormula] = useState<TCFormulaConfig>(DEFAULT_TC_FORMULA);
  const [tcLevel, setTcLevel] = useState({ label: 'EMPTY', color: 'bg-slate-400' });
  const [workflowStatus, setWorkflowStatus] = useState('Assigned');

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
    setTcValues(prev => ({ ...prev, [key]: val }));
    updateFormField(`tc_${key}`, val);
  };

  const isDTRole = (() => {
    const rt = String(formData.role_type || '').toUpperCase();
    if (rt.includes('QC')) return false;
    return rt.includes('DT') || ['ADMIN', 'DEVELOPER', 'MANAGER', 'KOORDINATOR'].includes(rt);
  })();

  const isCADRole = (() => {
    const rt = String(formData.role_type || '').toUpperCase();
    if (rt.includes('QC')) return false;
    return rt.includes('CAD') || ['ADMIN', 'DEVELOPER', 'MANAGER', 'KOORDINATOR'].includes(rt);
  })();

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-10 space-y-12 animate-in fade-in duration-1000">
      
      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
                        <Calculator weight="bold" size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Technical Development</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            Production Setup & TC Analysis
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-end shadow-sm">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Session</span>
                        <span className="text-[11px] font-black text-indigo-600 truncate max-w-[150px]">{user?.displayName || 'Operator'}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <GlobalInputForm
        title="Update Progress (DT / CAD)"
        collectionName="proses_dt_b"
        autoGenPrefix="DT-PROC"
        isProgressUpdate={true}
        syncRole="op"
        className="p-0 border-none shadow-none max-w-none bg-transparent space-y-12"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            
            {/* Left Column: Identitas & Progress */}
            <div className="space-y-10">
                <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <Palette weight="bold" className="text-indigo-500" size={24} />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Identifikasi Order</h3>
                    </div>

                    <JOPSearch 
                        type="JOP"
                        label="CARI NO_JOP (ATAU BUYER)"
                        required
                        onSelect={(id, data) => {
                            updateFormField('no_jop', id);
                            if (data) {
                                updateFormField('buyer', data.buyer || data.BUYER || '');
                                updateFormField('nama_produk', data.nama_produk || data.NAMA_PRODUK || data.nama_jop || '');
                                
                                const wStatus = data.status_workflow || data.status || 'Assigned';
                                setWorkflowStatus(String(wStatus));
                                updateFormField('status_workflow', String(wStatus));
                                
                                if (data.no_b || data.NO_B) updateFormField('no_b', String(data.no_b || data.NO_B));
                                
                                if (data.revisi_ke !== undefined) {
                                    const rev = Number(data.revisi_ke);
                                    updateFormField('revisi_ke', rev);
                                    setLaValue(Math.min(rev + 1, 5));
                                }

                                const targetDate = data.tgl_target_no_jop ?? data.tgl_target;
                                const masukDate = data.tgl_no_jop ?? data.tgl_masuk;
                                if (targetDate && masukDate) {
                                    setDpValue(calculateDeadlinePressureScore(targetDate, masukDate));
                                }
                            }
                        }}
                    />

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                            <SelectionAll weight="bold" size={18} className="text-sky-500" /> Referensi Blok / No B
                        </label>
                        <input 
                            required 
                            value={(formData.no_b as string) || ''}
                            onChange={(e) => updateFormField('no_b', e.target.value.toUpperCase())} 
                            className="w-full p-6 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-lg font-black focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-200" 
                            placeholder="MISAL: B1, B2..." 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Status Workflow</label>
                            <div className={cn(
                                "w-full p-5 border-2 rounded-[1.5rem] text-xs font-black uppercase tracking-wider flex items-center justify-center text-center h-[64px]",
                                workflowStatus?.includes('ACC') ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                workflowStatus?.includes('Hold') ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                'bg-indigo-50 border-indigo-100 text-indigo-600'
                            )}>
                                {workflowStatus || 'Assigned'}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Role Terminal</label>
                            <div className="w-full p-5 border-2 border-slate-100 rounded-[1.5rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center text-center h-[64px]">
                                {role || 'OP'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <Lightning weight="bold" className="text-amber-500" size={24} />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Progress Update</h3>
                    </div>

                    <div className="space-y-6">
                        {isDTRole && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Progress Status (DT)</label>
                                <select 
                                    required 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateFormField('status_progress', val);
                                        let track = 'Assigned';
                                        if (val === 'On Progress') track = 'Layout';
                                        else if (val === 'Blueprint') track = 'Blueprint';
                                        else if (val === 'Selesai Blueprint') track = 'ACC DG&MARKETING';
                                        else if (val === 'Revisi') track = 'Hold';
                                        else if (val === 'Done') track = 'ACC';
                                        updateFormField('status_workflow', track);
                                        setWorkflowStatus(track);
                                    }} 
                                    value={(formData.status_progress as string) || ''}
                                    className="w-full p-6 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-xs font-black appearance-none focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all"
                                >
                                    <option value="">- PILIH STATUS DT -</option>
                                    <option value="Not Started">NOT STARTED</option>
                                    <option value="On Progress">ON PROGRESS (LAYOUT)</option>
                                    <option value="Blueprint">BLUEPRINT / SAMPLE</option>
                                    <option value="Done">DONE (READY FOR QC)</option>
                                    <option value="Revisi">HOLD / REVISI</option>
                                </select>
                            </div>
                        )}

                        {isCADRole && (
                            <div className="space-y-4 animate-in fade-in duration-500">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Progress Status (CAD)</label>
                                <select 
                                    required 
                                    onChange={(e) => updateFormField('status_cad', e.target.value)} 
                                    value={(formData.status_cad as string) || ''}
                                    className="w-full p-6 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-xs font-black appearance-none focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all"
                                >
                                    <option value="">- PILIH STATUS CAD -</option>
                                    <option value="Proses CAD">PROSES PEMBUATAN</option>
                                    <option value="Done">DONE (SELESAI CAD)</option>
                                    <option value="Revisi">REVISI CAD</option>
                                </select>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Detail Progress & Koreksi</label>
                            <textarea 
                                onChange={(e) => updateFormField('progress_detail', e.target.value)} 
                                value={(formData.progress_detail as string) || ''} 
                                className="w-full p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-8 focus:ring-indigo-500/5 outline-none transition-all h-32 resize-none placeholder:text-slate-300 shadow-inner" 
                                placeholder="Detail pekerjaan atau tindakan korektif..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: TC Calculation */}
            <div className="space-y-10">
                <div className="bg-slate-900 p-10 sm:p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                                <Calculator weight="fill" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Technical Analysis</h3>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mt-1">Difficulty Metric Calculation</p>
                            </div>
                        </div>
                        {totalTc > 0 && (
                            <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg", tcLevel.color)}>
                                {tcLevel.label}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <TCSelector label="KT (Template)" value={tcValues.kt} onChange={(v) => handleTcChange('kt', v)} colorClass="bg-indigo-600" />
                        <TCSelector label="RP (Finishing)" value={tcValues.rp} onChange={(v) => handleTcChange('rp', v)} colorClass="bg-emerald-600" />
                        <TCSelector label="BS (Quantity)" value={tcValues.bs} onChange={(v) => handleTcChange('bs', v)} colorClass="bg-amber-500" />
                        <TCSelector label="CAD (Diecut)" value={tcValues.cad} onChange={(v) => handleTcChange('cad', v)} colorClass="bg-rose-500" />
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/10 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loop Approval (LA)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">{laValue}</div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">Auto Sync <br/>from Revisi</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deadline Pressure (DP)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-black text-lg flex items-center justify-center shadow-lg">{dpValue}</div>
                                <span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">Auto Calc <br/>from Deadline</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-10 relative z-10">
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Score Achievement</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-5xl font-black text-white tracking-tighter">{totalTc}</h4>
                                <span className="text-xs font-black text-indigo-300 uppercase">Points</span>
                            </div>
                        </div>
                        <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative">
                            <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin duration-[3s]" />
                            <span className="text-[10px] font-black text-indigo-300">KPI</span>
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

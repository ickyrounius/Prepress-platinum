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
  Palette, Calculator, WarningCircle
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
  const { role } = useAuth();
  const { updateFormField, formData } = useFormStore();
  
  // Local state for TC calculation
  const [tcValues, setTcValues] = useState({ kt: 0, rp: 0, bs: 0, cad: 0 });
  const [laValue, setLaValue] = useState(1); // Default min 1
  const [dpValue, setDpValue] = useState(1); // Default min 1
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
      const normalizedStr = role.toUpperCase();
      let determinedRole = normalizedStr;
      
      // Auto mapping to activate DT/CAD forms
      if (normalizedStr.includes('DT') || normalizedStr === 'ADMIN') determinedRole = 'DT';
      else if (normalizedStr.includes('CAD')) determinedRole = 'CAD';
      
      updateFormField('role_type', determinedRole);
    }
  }, [role, updateFormField]);

  useEffect(() => {
    // Formula from KPI config
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

    // Sync to form store
    updateFormField('total_tc', total);
    updateFormField('tc_la', laValue);
    updateFormField('tc_dp', dpValue);
  }, [tcValues, laValue, dpValue, tcFormula, updateFormField]);

  const handleTcChange = (key: keyof typeof tcValues, val: number) => {
    setTcValues(prev => ({ ...prev, [key]: val }));
    updateFormField(`tc_${key}`, val);
  };

  const statusDtOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'On Progress', label: 'On Progress (Layout)' },
    { value: 'Blueprint', label: 'Blueprint' },
    { value: 'Selesai Blueprint', label: 'Selesai Blueprint' },
    { value: 'Proses CAD', label: 'Proses CAD' },
    { value: 'Revisi', label: 'Revisi' },
    { value: 'Done', label: 'Done' },
    { value: 'BATAL LAYOUT', label: 'BATAL LAYOUT' },
  ];

  const statusCadOptions = [
    { value: 'Proses CAD', label: 'Proses CAD' },
    { value: 'Revisi', label: 'Revisi' },
    { value: 'Done', label: 'Done (Selesai CAD)' },
  ];

  const holdReasons = [
    { value: 'FILE BELUM ADA', label: 'FILE BELUM ADA' },
    { value: 'PRIORITY JOP LAIN', label: 'PRIORITY JOP LAIN' },
    { value: 'REVISI JOP', label: 'REVISI JOP' },
    { value: 'ADJUSTMENT', label: 'ADJUSTMENT' },
    { value: 'REJECT PRODUKSI', label: 'REJECT PRODUKSI' },
    { value: 'FILE BELUM LENGKAP', label: 'FILE BELUM LENGKAP' }, // For CAD
  ];

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          ⚙️ Panel DT & CAD
        </h2>

        <GlobalInputForm
          title="Update Progress (Operator DT & CAD)"
          collectionName="proses_dt_b"
          autoGenPrefix="DT-PROC"
          className="p-0 border-none shadow-none max-w-none"
        >
          <div className="space-y-8">
            {/* Section 1: JOP Information */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <JOPSearch 
                  type="JOP"
                  label="Cari JOP (Ketik NO JOP / Buyer)"
                  required
                  onSelect={(id, data) => {
                      updateFormField('no_jop', id);
                      if (data?.tgl_no_jop) updateFormField('tgl_masuk', String(data.tgl_no_jop));
                      if (data?.tgl_target_no_jop) updateFormField('tgl_target', String(data.tgl_target_no_jop));
                      if (data?.tgl_target) updateFormField('tgl_target', String(data.tgl_target));
                      
                      // Auto populate initial Workflow Status
                      const wStatus = data?.status_workflow || data?.status || 'Assigned';
                      setWorkflowStatus(String(wStatus));
                      updateFormField('status_workflow', String(wStatus));

                      // Preserve NO B if it exists in data
                      if (data?.no_b || data?.NO_B) updateFormField('no_b', String(data.no_b || data.NO_B));

                      // Parse Revisi
                      if (data?.revisi_ke !== undefined) {
                          const revisiKe = Number(data.revisi_ke);
                          updateFormField('revisi_ke', revisiKe);
                          const la = Math.min(revisiKe + 1, 5);
                          setLaValue(la);
                      }

                      // Check DP
                      const targetDate = data?.tgl_target_no_jop ?? data?.tgl_target;
                      const masukDate = data?.tgl_no_jop ?? data?.tgl_masuk;
                      if (targetDate && masukDate) {
                        const dp = calculateDeadlinePressureScore(targetDate, masukDate);
                        setDpValue(dp);
                      }
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Workflow (Auto)</label>
                <div className={cn("w-full p-4 border rounded-2xl text-sm font-black border-slate-200 bg-slate-50 text-slate-600 transition-colors uppercase tracking-wide", 
                   workflowStatus === 'Layout' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                   workflowStatus === 'Blueprint' ? 'bg-sky-50 border-sky-200 text-sky-600' :
                   workflowStatus?.includes('ACC') ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                   workflowStatus?.includes('Hold') ? 'bg-amber-50 border-amber-200 text-amber-600' :
                   workflowStatus?.includes('Reject') ? 'bg-rose-50 border-rose-200 text-rose-600' : ''
                  )}>
                  {workflowStatus || 'Assigned'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-indigo-500">Role / Input Sebagai</label>
                  <div className="w-full p-4 border-2 border-indigo-100 rounded-2xl bg-indigo-50 cursor-default text-sm font-black text-indigo-600 shadow-sm flex items-center justify-between">
                    <span className="uppercase tracking-wider">{(formData.role_type as string) || role || 'MEMUAT...'}</span>
                    <span className="text-[9px] text-indigo-400 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-100 tracking-widest uppercase">Auto</span>
                  </div>
                </div>
                {formData.role_type === 'DT' && (
                  <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-300">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fase DT</label>
                    <select 
                      onChange={(e) => updateFormField('fase_dt', e.target.value)} 
                      value={(formData.fase_dt as string) || ''} 
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">- Pilih Fase -</option>
                      <option value="FULL">FULL</option>
                      <option value="LAYOUT">LAYOUT</option>
                      <option value="FILE_CAD">FILE_CAD</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Progress Updates based on Role */}
            {formData.role_type === 'DT' && (
              <div className="space-y-5 border-t border-slate-100 pt-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Progress</label>
                    <select required 
                      onChange={(e) => {
                        const val = e.target.value;
                        updateFormField('status_progress', val);
                        
                        // Auto update tracking workflow
                        let trackStatus = 'Assigned';
                        if (val === 'On Progress') trackStatus = 'Layout';
                        else if (val === 'Blueprint') trackStatus = 'Blueprint';
                        else if (val === 'Selesai Blueprint') trackStatus = 'ACC DG&MARKETING';
                        else if (val === 'Revisi') trackStatus = 'Hold';
                        else if (val === 'Done') trackStatus = 'ACC';
                        updateFormField('status_workflow', trackStatus);
                        setWorkflowStatus(trackStatus);
                      }} 
                      value={(formData.status_progress as string) || ''}
                      className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                    <option value="">- Pilih Progress -</option>
                    {statusDtOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {['Revisi', 'Hold'].includes(String(formData.status_progress)) && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                      <WarningCircle weight="fill" /> Alasan Hold
                    </label>
                    <select 
                      onChange={(e) => updateFormField('hold_reason', e.target.value)} 
                      value={(formData.hold_reason as string) || ''} 
                      className="w-full p-4 border-2 border-amber-200 rounded-2xl bg-amber-50 text-sm font-bold text-amber-900 focus:border-amber-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">- Pilih Alasan -</option>
                      {holdReasons.map(hk => <option key={hk.value} value={hk.value}>{hk.label}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Progress</label>
                  <input 
                    type="text" 
                    onChange={(e) => updateFormField('progress_detail', e.target.value)} 
                    value={(formData.progress_detail as string) || ''} 
                    placeholder="Contoh: Proses layout B1..." 
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Tindakan Korektif</label>
                  <input 
                    type="text" 
                    onChange={(e) => updateFormField('tindakan_korektif', e.target.value)} 
                    value={(formData.tindakan_korektif as string) || ''} 
                    placeholder="Input tindakan jika ada revisi/masalah..." 
                    className="w-full p-4 border-2 border-rose-100 rounded-2xl bg-rose-50 text-sm font-bold text-rose-900 focus:border-rose-400 outline-none transition-all placeholder:text-rose-300 placeholder:font-normal shadow-sm" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Revisi Ke</label>
                  <input type="number" min="0" onChange={(e) => {
                      const rev = parseInt(e.target.value) || 0;
                      updateFormField('revisi_ke', rev);
                      // Update LA automatically
                      const la = Math.min(rev + 1, 5);
                      setLaValue(la);
                    }} 
                    value={Number(formData.revisi_ke) || 0} 
                    className="w-full p-4 border-2 border-indigo-100 rounded-2xl bg-indigo-50 text-sm font-black text-indigo-900 focus:border-indigo-400 outline-none transition-all shadow-sm" 
                  />
                </div>
              </div>
            )}

            {formData.role_type === 'CAD' && (
              <div className="space-y-5 border-t border-slate-100 pt-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Progress CAD</label>
                  <select required onChange={(e) => {
                      const val = normalizeWorkflowStatusInput(e.target.value);
                      updateFormField('status_cad', val);
                    }} 
                    value={(formData.status_cad as string) || ''}
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">- Pilih Status CAD -</option>
                    {statusCadOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {String(formData.status_cad) === 'Revisi' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                      <WarningCircle weight="fill" /> Alasan Hold/Revisi
                    </label>
                    <select 
                      onChange={(e) => updateFormField('hold_reason_cad', e.target.value)} 
                      value={(formData.hold_reason_cad as string) || ''} 
                      className="w-full p-4 border-2 border-amber-200 rounded-2xl bg-amber-50 text-sm font-bold text-amber-900 focus:border-amber-500 outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">- Pilih Alasan -</option>
                      {holdReasons.map(hk => <option key={hk.value} value={hk.value}>{hk.label}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Pekerjaan CAD</label>
                  <input 
                    type="text" 
                    onChange={(e) => updateFormField('progress_detail_cad', e.target.value)} 
                    value={(formData.progress_detail_cad as string) || ''} 
                    placeholder="Contoh: Pembuatan layout CAD..." 
                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal shadow-sm" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Tindakan Korektif</label>
                  <input 
                    type="text" 
                    onChange={(e) => updateFormField('tindakan_korektif_cad', e.target.value)} 
                    value={(formData.tindakan_korektif_cad as string) || ''} 
                    placeholder="Input tindakan jika ada kendala..." 
                    className="w-full p-4 border-2 border-rose-100 rounded-2xl bg-rose-50 text-sm font-bold text-rose-900 focus:border-rose-400 outline-none transition-all placeholder:text-rose-300 placeholder:font-normal shadow-sm" 
                  />
                </div>
              </div>
            )}

            {/* Section 3: Technical Complexity (TC) bound to NO_B */}
            <div className="bg-slate-50 border border-slate-200 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] space-y-6 sm:space-y-8 mt-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <Calculator weight="bold" className="text-indigo-500" />
                    Technical Complexity (TC)
                  </h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1">Input nilai TC khusus untuk blok/file child (NO B) ini.</p>
                </div>
                {totalTc > 2 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn("px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-black/10 self-start sm:self-auto", tcLevel.color)}
                  >
                    {tcLevel.label}
                  </motion.div>
                )}
              </div>

              {/* Box Input NO_B - Prominent Placement */}
              <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative z-10 group">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Input NO B (Wajib)</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-500">
                    <Palette weight="fill" size={24} />
                  </div>
                  <input 
                    required 
                    onChange={(e) => updateFormField('no_b', e.target.value)} 
                    value={(formData.no_b as string) || ''}
                    className="flex-1 bg-transparent text-xl font-black text-slate-800 focus:outline-none placeholder:text-slate-300 placeholder:font-bold" 
                    placeholder="Contoh: B1, B2..." 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <TCSelector label="KT (Template/Design)" value={tcValues.kt} onChange={(v) => handleTcChange('kt', v)} colorClass="bg-indigo-500" />
                <TCSelector label="RP (Finishing)" value={tcValues.rp} onChange={(v) => handleTcChange('rp', v)} colorClass="bg-emerald-500" />
                <TCSelector label="BS (Jumlah Design)" value={tcValues.bs} onChange={(v) => handleTcChange('bs', v)} colorClass="bg-amber-500" />
                <TCSelector label="CAD (Diecut)" value={tcValues.cad} onChange={(v) => handleTcChange('cad', v)} colorClass="bg-rose-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-5 rounded-2xl border border-slate-100 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline Pressure (DP)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-md">
                      {dpValue}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Dihitung otomatis dari<br/>Tgl Masuk vs Tgl Target.</p>
                  </div>
                </div>
                <div className="space-y-3 sm:border-l sm:border-slate-100 sm:pl-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loop Approval (LA)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
                      {laValue}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">Akan naik otomatis jika nilai<br/><span className="font-bold text-slate-600">Revisi Ke</span> bertambah.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-6 relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Estimasi TC</p>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tighter">{totalTc}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Points</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Palette weight="bold" className="text-slate-400" />
                Catatan Lainnya (Opsional)
              </label>
              <textarea 
                onChange={(e) => updateFormField('catatan_dt_cad', e.target.value)} 
                value={(formData.catatan_dt_cad as string) || ''} 
                className="w-full p-5 border-2 border-slate-100 rounded-3xl bg-white text-sm font-bold text-slate-600 focus:border-indigo-400 outline-none transition-all h-28 resize-none placeholder:text-slate-300 placeholder:font-normal shadow-sm" 
                placeholder="Tambahkan instruksi khusus..."
              ></textarea>
            </div>
            
          </div>
        </GlobalInputForm>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
        <TCGuide />
        <div className="bg-indigo-900 p-8 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-200">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl group-hover:scale-150 transition-transform duration-700" />
           <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
                 <Calculator weight="fill" size={24} className="text-indigo-300" />
              </div>
              <div>
                <h4 className="text-xl font-black tracking-tight mb-2">Automated KPI Logging</h4>
                <p className="text-xs font-medium text-indigo-100/80 leading-relaxed uppercase tracking-wider">Nilai TC yang Anda input akan langsung dikonversi menjadi poin performa individu dan muncul di dashboard leader secara realtime.</p>
              </div>
              <div className="pt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                 <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                 Connected to System
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

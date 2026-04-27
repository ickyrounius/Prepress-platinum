'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { TCGuide } from '@/components/forms/TCGuide';
import { db } from '@/lib/firebase';
import { DEFAULT_TC_FORMULA, calcDeadlinePressure, calcWeightedTotalTC, type TCFormulaConfig } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { 
  ChartBar, Users, Calculator, WarningCircle, ClipboardText, CheckSquareOffset, ChartLineUp
} from '@phosphor-icons/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAuth } from '@/features/auth/AuthContext';
import { normalizeRole, ADMIN_ROLES } from '@/lib/accessControl';

const TCSelector = ({ label, value, onChange, colorClass }: { label: string; value: number; onChange: (v: number) => void; colorClass: string }) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">{label}</label>
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={cn(
              'w-8 h-8 rounded-lg border text-[10px] font-black transition-all flex items-center justify-center',
              value === num
                ? `${colorClass} text-white border-transparent shadow-md scale-110`
                : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'
            )}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function SPVPanel() {
  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);
  
  const isSuperAdmin = (ADMIN_ROLES as readonly string[]).includes(normalizedRole);
  const isSpvDgDt = isSuperAdmin || ["SPV DT", "SPV DG"].includes(normalizedRole);
  const isSpvPrepress = isSuperAdmin || ["SPV PREPRESS", "KOORDINATOR"].includes(normalizedRole);
  
  const isAuthorized = isSpvDgDt || isSpvPrepress;

  const [activeTab, setActiveTab] = useState<'ASSIGNMENT' | 'VALIDASI_TC' | 'VALIDASI_KPI'>('ASSIGNMENT');

  useEffect(() => {
    if (isSpvDgDt) setActiveTab('ASSIGNMENT');
    else if (isSpvPrepress) setActiveTab('VALIDASI_KPI');
  }, [isSpvDgDt, isSpvPrepress]);

  const { updateFormField, setFormData } = useFormStore();
  const { productivityData } = useDashboardData();
  const [targetType, setTargetType] = useState(normalizedRole === 'SPV DG' ? 'NO_JOS' : 'NO_JOP');
  const [tcValues, setTcValues] = useState({ kt: 1, rp: 1, bs: 1, cad: 1 });
  const [laValue, setLaValue] = useState(1);
  const [dpValue, setDpValue] = useState(1);
  const [totalTc, setTotalTc] = useState(0);
  const [tcFormula, setTcFormula] = useState<TCFormulaConfig>(DEFAULT_TC_FORMULA);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'm_settings', 'kpi_config'), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as { tcFormula?: Partial<TCFormulaConfig> };
      if (data.tcFormula) setTcFormula({ ...DEFAULT_TC_FORMULA, ...data.tcFormula });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const total = calcWeightedTotalTC(tcValues, laValue, dpValue, tcFormula);
    setTotalTc(total);
    updateFormField('tc', {
      kt: tcValues.kt,
      rp: tcValues.rp,
      bs: tcValues.bs,
      cad: tcValues.cad,
      la: laValue,
      dp: dpValue,
      total_tc: total,
      total_tc_validated: total,
    });
    updateFormField('total_tc_validated', total);
    updateFormField('tc_la', laValue);
    updateFormField('tc_dp', dpValue);
  }, [tcValues, laValue, dpValue, tcFormula, updateFormField]);

  const onTargetChange = (val: string) => {
    setFormData({}); 
    setTargetType(val);
  };

  const handleTcChange = (key: keyof typeof tcValues, val: number) => {
    setTcValues((prev) => ({ ...prev, [key]: val }));
    updateFormField(`tc_${key}`, val);
  };

  const picStatus = useMemo(() => {
    const available: string[] = [];
    const fullCache: string[] = [];
    const overload: string[] = [];
    const allPicCodes = ['STB', 'RK', 'ARK', 'MER', 'SBR', 'YD'];
    
    allPicCodes.forEach(code => {
      const picData = productivityData.find(d => d.name === code);
      const totalPoints = picData ? (picData.tcUtama + picData.tcSupport) : 0;
      if (totalPoints > 100) overload.push(code);
      else if (totalPoints > 50) fullCache.push(code);
      else available.push(code);
    });
    return { available, fullCache, overload };
  }, [productivityData]);

  const pics = [
    { code: 'STB', name: 'ARIS SLAMET WASONO' },
    { code: 'RK', name: 'RICKY PRAMANA PUTRA' },
    { code: 'ARK', name: 'ARKANUDHIN YANI' },
    { code: 'MER', name: 'SRI SUMARNI' },
    { code: 'SBR', name: 'SUBARI' },
    { code: 'YD', name: 'WAHYUDI' },
  ];

  if (!isAuthorized) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
            <WarningCircle size={32} weight="bold" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Akses Ditolak</h3>
          <p className="text-sm font-bold text-slate-400 max-w-sm uppercase leading-relaxed text-[10px]">Halaman ini hanya dapat diakses oleh SPV, Koordinator, atau Admin Sistem.</p>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-indigo-200">
            {activeTab === 'VALIDASI_KPI' ? <ChartLineUp weight="bold" size={24} /> : <ChartBar weight="bold" size={24} />}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Panel SPV & Koordinator</h1>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">Management, Assignment & Validation</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4">
        {isSpvDgDt && (
          <>
            <button 
              onClick={() => setActiveTab('ASSIGNMENT')}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'ASSIGNMENT' ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              <ClipboardText size={18} weight={activeTab === 'ASSIGNMENT' ? 'fill' : 'bold'} />
              Menu 1: Assignment
            </button>
            <button 
              onClick={() => setActiveTab('VALIDASI_TC')}
              className={cn(
                "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'VALIDASI_TC' ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              <CheckSquareOffset size={18} weight={activeTab === 'VALIDASI_TC' ? 'fill' : 'bold'} />
              Menu 2: Validasi TC
            </button>
          </>
        )}
        {isSpvPrepress && (
          <button 
            onClick={() => setActiveTab('VALIDASI_KPI')}
            className={cn(
              "px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'VALIDASI_KPI' ? "bg-emerald-600 text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
            )}
          >
            <ChartLineUp size={18} weight={activeTab === 'VALIDASI_KPI' ? 'fill' : 'bold'} />
            Validasi KPI Prepress
          </button>
        )}
      </div>

      {activeTab === 'ASSIGNMENT' && isSpvDgDt && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex gap-2">
                  <button 
                      onClick={() => onTargetChange('NO_JOS')}
                      className={cn(
                          "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          targetType === 'NO_JOS' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                      )}
                  >
                      Assign NO JOS (Tim DG)
                  </button>
                  <button 
                      onClick={() => onTargetChange('NO_JOP')}
                      className={cn(
                          "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                          targetType === 'NO_JOP' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                      )}
                  >
                      Assign NO JOP (Tim DT)
                  </button>
              </div>

              <GlobalInputForm
                  title={`Menu 1: Assignment (${targetType})`}
                  collectionName={targetType === 'NO_JOS' ? 'proses_jod' : 'proses_dt_b'}
                  autoGenPrefix="SPV-ASGN"
                  isProgressUpdate={true}
                  syncRole="spv"
              >
                  <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <JOPSearch 
                              type={targetType === 'NO_JOP' ? 'JOP' : 'JOS'}
                              label={targetType}
                              required
                              onSelect={(id, data) => {
                                  updateFormField(targetType.toLowerCase(), id);
                                  if (data?.buyer) updateFormField('buyer', data.buyer);
                                  if (targetType === 'NO_JOP') {
                                    if (data?.tgl_no_jop) updateFormField('tgl_masuk', String(data.tgl_no_jop));
                                    if (data?.tgl_target_no_jop) updateFormField('tgl_target', String(data.tgl_target_no_jop));
                                  } else {
                                    if (data?.tgl_no_jos) updateFormField('tgl_masuk', String(data.tgl_no_jos));
                                    if (data?.tgl_target_no_jos) updateFormField('tgl_target', String(data.tgl_target_no_jos));
                                  }
                              }}
                          />
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{targetType === 'NO_JOS' ? 'NO JOD' : 'NO B (Opsional)'}</label>
                              <input onChange={(e) => updateFormField(targetType === 'NO_JOS' ? 'no_jod' : 'no_b', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm" placeholder="Isi jika spesifik..." />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fase Pengerjaan</label>
                              <select onChange={(e) => updateFormField('fase_dt', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm">
                                  <option value="FULL">FULL</option>
                                  <option value="LAYOUT">LAYOUT</option>
                                  <option value="FILE_CAD">FILE_CAD</option>
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-indigo-500">PIC Utama</label>
                              <select required onChange={(e) => updateFormField('pic_utama', e.target.value)} className="w-full p-4 border-2 border-indigo-100 rounded-2xl bg-white text-sm font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm">
                                  <option value="">- Pilih PIC Utama -</option>
                                  {pics.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                              </select>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIC Support</label>
                              <select onChange={(e) => updateFormField('pic_support', e.target.value)} className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm">
                                  <option value="">- Pilih PIC Support -</option>
                                  {pics.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Instruksi</label>
                          <textarea onChange={(e) => updateFormField('catatan_spv', e.target.value)} className="w-full p-5 border-2 border-slate-100 rounded-[2rem] bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all h-32 resize-none placeholder:text-slate-300 shadow-sm" placeholder="Instruksi kerja detail..."></textarea>
                      </div>
                  </div>
              </GlobalInputForm>
          </div>

          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm xl:sticky xl:top-8">
                  <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
                      <Users weight="bold" className="text-emerald-500" /> PIC Capacity
                  </h3>
                  <div className="space-y-6">
                      {[
                          { label: 'Available', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                          { label: 'Full Cache', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                          { label: 'Overload', color: 'bg-rose-50 text-rose-600 border-rose-100' },
                      ].map((status) => (
                          <div key={status.label} className="space-y-2">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{status.label}</label>
                             <div className={cn("min-h-[60px] p-3 rounded-2xl border flex flex-wrap gap-2", status.color)}>
                                  {status.label === 'Available' && picStatus.available.map(code => (
                                    <div key={code} className="w-8 h-8 rounded-lg bg-emerald-200 border border-emerald-300 flex items-center justify-center text-[9px] font-black">{code}</div>
                                  ))}
                                  {status.label === 'Full Cache' && picStatus.fullCache.map(code => (
                                    <div key={code} className="w-8 h-8 rounded-lg bg-blue-200 border border-blue-300 flex items-center justify-center text-[9px] font-black">{code}</div>
                                  ))}
                                  {status.label === 'Overload' && picStatus.overload.map(code => (
                                    <div key={code} className="w-8 h-8 rounded-lg bg-rose-200 border border-rose-300 flex items-center justify-center text-[9px] font-black">{code}</div>
                                  ))}
                             </div>
                          </div>
                      ))}
                      <div className="pt-4 border-t border-slate-50">
                          <p className="text-[9px] text-slate-400 font-medium italic leading-relaxed">Status based on active TC points calculated with Lead Time & Urgency penalty.</p>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      )}

      {activeTab === 'VALIDASI_TC' && isSpvDgDt && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <TCGuide />
          
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex gap-2 max-w-xl">
              <button 
                  onClick={() => onTargetChange('NO_JOS')}
                  className={cn(
                      "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                      targetType === 'NO_JOS' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                  )}
              >
                  Validasi TC Tim DG
              </button>
              <button 
                  onClick={() => onTargetChange('NO_JOP')}
                  className={cn(
                      "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                      targetType === 'NO_JOP' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                  )}
              >
                  Validasi TC Tim DT
              </button>
          </div>

          <GlobalInputForm
              title={`Menu 2: Validasi TC (${targetType})`}
              collectionName={targetType === 'NO_JOS' ? 'proses_jod' : 'proses_dt_b'}
              autoGenPrefix="SPV-TC"
              isProgressUpdate={true}
              syncRole="spv"
          >
             <div className="space-y-6">
                <JOPSearch 
                    type={targetType === 'NO_JOP' ? 'JOP' : 'JOS'}
                    label={`Pilih ${targetType} untuk Divalidasi`}
                    required
                    onSelect={(id, data) => {
                        updateFormField(targetType.toLowerCase(), id);
                        if (data?.revisi_ke) {
                          const la = Math.min(Number(data.revisi_ke) + 1, 5);
                          updateFormField('revisi_ke', Number(data.revisi_ke));
                          setLaValue(la);
                        }
                        const isJop = targetType === 'NO_JOP';
                        const dp = calcDeadlinePressure(
                          isJop ? (data?.tgl_target_no_jop ?? data?.tgl_target) : (data?.tgl_target_no_jos ?? data?.tgl_target),
                          isJop ? (data?.tgl_no_jop ?? data?.tgl_masuk) : (data?.tgl_no_jos ?? data?.tgl_masuk)
                        );
                        setDpValue(dp);
                    }}
                />

                <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100 space-y-6">
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Penyesuaian Nilai Technical Custom (TC)</h3>
                    <p className="text-xs text-slate-500 font-semibold">SPV berhak melakukan override nilai TC apabila estimasi otomatis tidak akurat, demi keadilan kompensasi KPI antar operator.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Keputusan Validasi TC</label>
                            <select
                              required
                              onChange={(e) => updateFormField('tc_validation_status', e.target.value)}
                              className="w-full p-4 border-2 border-indigo-100 rounded-2xl bg-white text-sm font-black text-indigo-600 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-sm"
                            >
                              <option value="">- Pilih Validasi -</option>
                              <option value="VALID">Valid (Terima Otomatis)</option>
                              <option value="OVERRIDE">Valid dengan Perubahan SPV (Override)</option>
                              <option value="REVISI">Tolak - Minta Revisi Operator</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nilai Final Validasi TC (SPV)</label>
                            <input
                              type="number"
                              min={0}
                              required
                              value={totalTc}
                              onChange={(e) => {
                                const manualTotal = Number(e.target.value) || 0;
                                setTotalTc(manualTotal);
                                updateFormField('total_tc_validated', manualTotal);
                              }}
                              className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                              placeholder="Kalkulasi total akhir..."
                            />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-indigo-100 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calculator weight="bold" className="text-indigo-500" />
                          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Detail Estimasi & Parameter Override</h4>
                        </div>
                        <div className="text-indigo-600 font-black text-lg">{totalTc} <span className="text-[10px] uppercase">pts</span></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <TCSelector label="KT (Template)" value={tcValues.kt} onChange={(v) => handleTcChange('kt', v)} colorClass="bg-indigo-500" />
                        <TCSelector label="RP (Finishing)" value={tcValues.rp} onChange={(v) => handleTcChange('rp', v)} colorClass="bg-emerald-500" />
                        <TCSelector label="BS (Jml Design)" value={tcValues.bs} onChange={(v) => handleTcChange('bs', v)} colorClass="bg-amber-500" />
                        <TCSelector label="CAD (Diecut)" value={tcValues.cad} onChange={(v) => handleTcChange('cad', v)} colorClass="bg-rose-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pinalti Loop Approval (LA)</label>
                          <input type="number" min={1} max={5} value={laValue} onChange={(e) => setLaValue(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bobot Deadline Pressure (DP)</label>
                          <input type="number" min={1} max={5} value={dpValue} onChange={(e) => setDpValue(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} className="w-full p-3 border-2 border-slate-100 rounded-xl bg-white text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all" />
                        </div>
                      </div>
                    </div>
                </div>
             </div>
          </GlobalInputForm>
        </div>
      )}

      {activeTab === 'VALIDASI_KPI' && isSpvPrepress && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-10 sm:p-14 rounded-[3rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 text-center flex flex-col items-center justify-center min-h-[50vh] relative overflow-hidden group">
            {/* Background Blob Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner mb-6 relative z-10">
              <ChartLineUp size={40} weight="duotone" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-3 relative z-10">Ruang Validasi KPI Prepress</h2>
            <p className="text-sm font-bold text-slate-500 max-w-lg mb-8 leading-relaxed relative z-10">
              Menu ini sedang dipersiapkan. SPV dan Koordinator Prepress nantinya akan menggunakan ruang ini untuk memvalidasi dan memberikan skor KPI terkait efisiensi mesin, penggunaan bahan, dan throughput divisi pra-cetak.
            </p>
            
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-200 rounded-full relative z-10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Fitur KPI Prepress Segera Hadir</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

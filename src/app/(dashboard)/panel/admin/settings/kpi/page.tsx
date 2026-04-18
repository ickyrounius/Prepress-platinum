'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { DEFAULT_TC_FORMULA, type TCFormulaConfig } from '@/lib/tcFormula';
import { 
  Gauge, Calculator, 
  FloppyDisk, ArrowsCounterClockwise,
  ShieldCheck, WarningCircle,
  Cube, Printer, Target
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface KPIWeights {
  prepress: { CTP: number; CTCP: number; SCREEN: number; FLEXO: number; ETCHING: number };
  support: { BLUEPRINT: number; GMG: number; CNC: number };
  tcFormula: TCFormulaConfig;
}

interface WeightInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  icon: React.ElementType;
  colorClass: string;
}

const WeightInput = ({ label, value, onChange, icon: Icon, colorClass }: WeightInputProps) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 group hover:border-indigo-200 transition-all">
    <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-inner opacity-80 group-hover:opacity-100 transition-opacity", colorClass)}>
            <Icon weight="bold" size={20} className="text-white" />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Weight Factor</p>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">{label}</h4>
        </div>
    </div>
    <div className="flex items-center gap-2">
        <input 
            type="number" 
            step="0.1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 p-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition-all"
        />
        <span className="text-[10px] font-black text-slate-300">pts</span>
    </div>
  </div>
);

export default function KPISettingsPage() {
  const { role } = useAuth();
  const normalizedRole = String(role || '').toUpperCase().trim();
  const canManageKpi = ['MANAGER', 'ADMIN', 'DEVELOPER', 'ADMIN DT', 'ADMIN DG', 'ADMIN PREPRESS'].includes(normalizedRole);
  const [saving, setSaving] = useState(false);
  const [weights, setWeights] = useState<KPIWeights>({
    prepress: {
      CTP: 1.0,
      CTCP: 1.0,
      SCREEN: 3.0,
      FLEXO: 4.0,
      ETCHING: 5.0
    },
    support: {
      BLUEPRINT: 2.0,
      GMG: 5.0,
      CNC: 10.0
    },
    tcFormula: DEFAULT_TC_FORMULA,
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "m_settings", "kpi_config"), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as Partial<KPIWeights>;
        setWeights((prev) => ({
          prepress: { ...prev.prepress, ...(data.prepress || {}) },
          support: { ...prev.support, ...(data.support || {}) },
          tcFormula: { ...DEFAULT_TC_FORMULA, ...(data.tcFormula || {}) },
        }));
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "m_settings", "kpi_config"), weights);
      alert("Konfigurasi KPI berhasil diperbarui!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan konfigurasi.");
    } finally {
      setSaving(false);
    }
  };

  if (!canManageKpi) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
            <WarningCircle size={32} weight="bold" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Akses Ditolak</h3>
          <p className="text-sm font-bold text-slate-400 max-w-sm uppercase leading-relaxed text-[10px]">Halaman ini hanya dapat diakses oleh Manager, Admin Sistem, atau Admin Operasional (DT/DG/Prepress).</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100">
            <Calculator weight="bold" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">KPI Configuration</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">Atur Bobot Penilaian Technical Complexity</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.reload()}
            className="px-5 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArrowsCounterClockwise weight="bold" /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {saving ? <ArrowsCounterClockwise className="animate-spin" /> : <FloppyDisk weight="bold" />} 
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Prepress Section */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                <Printer weight="bold" className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Prepress Multipliers</span>
            </div>
            <div className="grid gap-4">
                <WeightInput 
                    label="CTP Plate" 
                    value={weights.prepress.CTP} 
                    onChange={(v: number) => setWeights({...weights, prepress: {...weights.prepress, CTP: v}})} 
                    icon={Printer} colorClass="bg-emerald-500" 
                />
                <WeightInput 
                    label="CTCP Plate" 
                    value={weights.prepress.CTCP} 
                    onChange={(v: number) => setWeights({...weights, prepress: {...weights.prepress, CTCP: v}})} 
                    icon={Printer} colorClass="bg-emerald-600" 
                />
                <WeightInput 
                    label="Screen Printing" 
                    value={weights.prepress.SCREEN} 
                    onChange={(v: number) => setWeights({...weights, prepress: {...weights.prepress, SCREEN: v}})} 
                    icon={Gauge} colorClass="bg-blue-500" 
                />
                <WeightInput 
                    label="Flexo Plate" 
                    value={weights.prepress.FLEXO} 
                    onChange={(v: number) => setWeights({...weights, prepress: {...weights.prepress, FLEXO: v}})} 
                    icon={Cube} colorClass="bg-indigo-500" 
                />
                <WeightInput 
                    label="Etching" 
                    value={weights.prepress.ETCHING} 
                    onChange={(v: number) => setWeights({...weights, prepress: {...weights.prepress, ETCHING: v}})} 
                    icon={Target} colorClass="bg-rose-500" 
                />
            </div>
        </div>

        {/* Support Section */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 w-fit">
                <Gauge weight="bold" className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Support Multipliers</span>
            </div>
            <div className="grid gap-4">
                <WeightInput 
                    label="Blueprint / Plot" 
                    value={weights.support.BLUEPRINT} 
                    onChange={(v: number) => setWeights({...weights, support: {...weights.support, BLUEPRINT: v}})} 
                    icon={Gauge} colorClass="bg-amber-500" 
                />
                <WeightInput 
                    label="GMG Proof" 
                    value={weights.support.GMG} 
                    onChange={(v: number) => setWeights({...weights, support: {...weights.support, GMG: v}})} 
                    icon={Target} colorClass="bg-orange-500" 
                />
                <WeightInput 
                    label="CNC Machining" 
                    value={weights.support.CNC} 
                    onChange={(v: number) => setWeights({...weights, support: {...weights.support, CNC: v}})} 
                    icon={Cube} colorClass="bg-slate-700" 
                />
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck weight="bold" className="text-indigo-500" size={24} />
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Catatan Manager</h4>
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
                    Perubahan nilai bobot di atas akan berdampak langsung pada seluruh pencapaian skor KPI di Leaderboard secara Real-Time. Pastikan perhitungan bobot sudah sesuai dengan efisiensi dan tingkat kesulitan operasional pengerjaan di lapangan.
                </p>
            </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 w-fit">
          <Calculator weight="bold" className="text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">TC Formula Configuration</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WeightInput
            label="TC KT Weight"
            value={weights.tcFormula.kt}
            onChange={(v: number) => setWeights({ ...weights, tcFormula: { ...weights.tcFormula, kt: v } })}
            icon={Calculator}
            colorClass="bg-indigo-500"
          />
          <WeightInput
            label="TC RP Weight"
            value={weights.tcFormula.rp}
            onChange={(v: number) => setWeights({ ...weights, tcFormula: { ...weights.tcFormula, rp: v } })}
            icon={Calculator}
            colorClass="bg-emerald-500"
          />
          <WeightInput
            label="TC BS Weight"
            value={weights.tcFormula.bs}
            onChange={(v: number) => setWeights({ ...weights, tcFormula: { ...weights.tcFormula, bs: v } })}
            icon={Calculator}
            colorClass="bg-amber-500"
          />
          <WeightInput
            label="TC CAD Weight"
            value={weights.tcFormula.cad}
            onChange={(v: number) => setWeights({ ...weights, tcFormula: { ...weights.tcFormula, cad: v } })}
            icon={Calculator}
            colorClass="bg-rose-500"
          />
          <WeightInput
            label="TC LA Weight"
            value={weights.tcFormula.la}
            onChange={(v: number) => setWeights({ ...weights, tcFormula: { ...weights.tcFormula, la: v } })}
            icon={Calculator}
            colorClass="bg-blue-500"
          />
          <WeightInput
            label="TC DP Weight"
            value={weights.tcFormula.dp}
            onChange={(v: number) => setWeights({ ...weights, tcFormula: { ...weights.tcFormula, dp: v } })}
            icon={Calculator}
            colorClass="bg-slate-700"
          />
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview Rumus TC Aktif</p>
          <p className="text-sm font-black text-slate-700 tracking-wide">
            Total TC = (KT x {weights.tcFormula.kt}) + (RP x {weights.tcFormula.rp}) + (BS x {weights.tcFormula.bs}) + (CAD x {weights.tcFormula.cad}) + (LA x {weights.tcFormula.la}) + (DP x {weights.tcFormula.dp})
          </p>
        </div>
      </div>
    </div>
  );
}

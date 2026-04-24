'use client';

import React, { useState } from 'react';
import { GlobalInputForm } from '@/components/forms/GlobalInputForm';
import { useFormStore } from '@/lib/store/useFormStore';
import { JOPSearch } from '@/components/forms/JOPSearch';
import { 
  ShieldCheck, ClipboardText,
  CheckCircle, Stack,
  MagnifyingGlass, FileMagnifyingGlass
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { normalizeWorkflowStatusInput } from '@/lib/workflow';

export default function QCPanel() {
  const { user } = useAuth();
  const { updateFormField, setFormData, formData } = useFormStore();
  const [targetType, setTargetType] = useState('NO_JOS');

  const onTargetChange = (val: string) => {
    setFormData({}); // reset
    setTargetType(val);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-10 space-y-12 animate-in fade-in duration-1000">
      
      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-slate-900 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-200">
                        <ShieldCheck weight="bold" size={32} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Quality Control</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Final Verification & Approval
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                        <button 
                            onClick={() => onTargetChange('NO_JOS')}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                targetType === 'NO_JOS' ? "bg-white text-slate-900 shadow-md" : "text-slate-400"
                            )}
                        >
                            Design QC
                        </button>
                        <button 
                            onClick={() => onTargetChange('NO_JOP')}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                targetType === 'NO_JOP' ? "bg-white text-slate-900 shadow-md" : "text-slate-400"
                            )}
                        >
                            Prepress QC
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <GlobalInputForm
        title={`QC Verification: ${targetType === 'NO_JOS' ? 'Design/Artwork' : 'Physical Plate/Proof'}`}
        collectionName={targetType === 'NO_JOS' ? 'proses_jod' : 'proses_prepress_b'}
        autoGenPrefix="QC-CHK"
        className="p-0 border-none shadow-none max-w-none bg-transparent space-y-12"
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
            
            <div className="space-y-10">
                <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <FileMagnifyingGlass weight="bold" className="text-slate-900" size={24} />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Job Selection</h3>
                    </div>

                    <JOPSearch 
                        type={targetType === 'NO_JOP' ? 'JOP' : 'JOS'}
                        label={`PILIH ${targetType}`}
                        required
                        onSelect={(id) => updateFormField(targetType.toLowerCase(), id)}
                    />

                    <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
                            <Stack weight="bold" size={18} className="text-slate-400" /> Specific Identifier ({targetType === 'NO_JOS' ? 'NO JOD' : 'NO B'})
                        </label>
                        <input 
                            required 
                            onChange={(e) => updateFormField(targetType === 'NO_JOS' ? 'no_jod' : 'no_b', e.target.value.toUpperCase())} 
                            value={(formData[targetType === 'NO_JOS' ? 'no_jod' : 'no_b'] as string) || ''}
                            className="w-full p-6 border-2 border-slate-100 rounded-[1.5rem] bg-slate-50 text-lg font-black focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 outline-none transition-all placeholder:text-slate-200 shadow-inner" 
                            placeholder={targetType === 'NO_JOS' ? "CONTOH: J1" : "CONTOH: B1"}
                        />
                    </div>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                        <ClipboardText weight="bold" className="text-slate-900" size={24} />
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">QC Inspection Report</h3>
                    </div>
                    <textarea 
                        onChange={(e) => updateFormField('catatan_qc', e.target.value)} 
                        value={(formData.catatan_qc as string) || ''}
                        className="w-full p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50 text-sm font-medium focus:bg-white focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 outline-none transition-all h-48 resize-none placeholder:text-slate-300 shadow-inner" 
                        placeholder="Detail temuan QC, alasan reject, atau instruksi perbaikan..."
                    />
                </div>
            </div>

            <div className="space-y-10">
                <div className="bg-slate-900 p-10 sm:p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center">
                                <ShieldCheck weight="fill" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">Final Decision</h3>
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mt-1">Verification Status</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Select Outcome</label>
                                <select 
                                    required 
                                    onChange={(e) => updateFormField(targetType === 'NO_JOS' ? 'status_qc' : 'status_prepress_qc', normalizeWorkflowStatusInput(e.target.value))} 
                                    className="w-full p-6 border-2 border-slate-800 rounded-[2rem] bg-slate-800 text-sm font-black text-white focus:ring-8 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer shadow-xl appearance-none"
                                >
                                    <option value="">- PILIH KEPUTUSAN -</option>
                                    <option value="APPROVED">✅ LOLOS QC (APPROVED)</option>
                                    <option value="REJECT">❌ DITOLAK (REJECT)</option>
                                    <option value="HOLD">⚠️ MENUNGGU (HOLD)</option>
                                </select>
                            </div>

                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                        <CheckCircle weight="bold" size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-tight">
                                        Keputusan ini akan <br />langsung mengupdate dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white text-xs font-black">
                                    {user?.displayName?.substring(0, 2).toUpperCase() || 'QC'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{user?.displayName || 'QC Inspector'}</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Authorized Inspector</span>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/30">Live Sync</div>
                        </div>
                    </div>
                </div>

                <div className="p-10 bg-indigo-50 rounded-[3rem] border border-indigo-100 flex items-center gap-6 group hover:bg-indigo-100 transition-colors cursor-help">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                        <Stack weight="bold" size={28} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Pedoman QC Platinum</h4>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Pastikan semua parameter pengecekan telah terpenuhi sebelum memberikan status Approved.</p>
                    </div>
                </div>
            </div>
        </div>
      </GlobalInputForm>
    </div>
  );
}

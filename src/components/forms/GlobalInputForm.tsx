'use client';

import React from 'react';
import { useFormStore } from '@/lib/store/useFormStore';
import { useAuth } from "@/features/auth/AuthContext";
import { doc, setDoc, collection } from 'firebase/firestore';
import { db, rtdb } from '@/lib/firebase';
import { ref, set, remove } from 'firebase/database';
import { Loader2 } from 'lucide-react';
import { cn, throttle } from '@/lib/utils';
import { motion } from 'framer-motion';

import { format } from 'date-fns';
import { useNotification } from '@/features/notification/NotificationContext';
import { recordAuditLog } from '@/features/audit-log/auditLogService';
import { updateJOPData } from '@/features/workflow/workflowService';
import { generateUniqueId } from '@/lib/types/schema';

interface GlobalInputFormProps {
  title: string;
  collectionName: string;
  docId?: string; // If auto empty, it will create one
  autoGenPrefix?: string; // e.g., '7B'
  children: React.ReactNode;
  onSuccess?: () => void;
  className?: string;
  submitLabel?: string;
  requiredFields?: string[];
  isProgressUpdate?: boolean;
  syncRole?: string;
}

export function GlobalInputForm({
  title,
  collectionName,
  docId,
  autoGenPrefix,
  children,
  onSuccess,
  className,
  submitLabel = "Submit Data",
  requiredFields = [],
  isProgressUpdate = false,
  syncRole = "op"
}: GlobalInputFormProps) {
  const { user } = useAuth();
  const { formData, isLoading, setLoading, resetForm, error, setError } = useFormStore();
  const { notify } = useNotification();

  // 🔥 THROTTLE SUBMIT: Prevent write bursts (Spark Tier Protection)
  const throttledSubmit = React.useMemo(
    () => throttle(async (e: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!user) {
        setError("User not authenticated.");
        return;
      }
      
      setLoading(true);
      setError(null);

      try {
        const missingFields = requiredFields.filter((key) => !formData[key]);
        if (missingFields.length > 0) {
          setError(`Fields required: ${missingFields.join(', ')}`);
          setLoading(false);
          return;
        }

        let targetId = docId;
        if (!targetId && autoGenPrefix) {
          targetId = generateUniqueId(autoGenPrefix);
        } else if (!targetId) {
          targetId = doc(collection(db, collectionName)).id;
        }

        const docRef = doc(db, collectionName, targetId);
        
        // Inject standard fields
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        const displayDateStr = format(now, 'dd-MM-yyyy');

        const payload: Record<string, unknown> = {
          ...formData,
          id: targetId,
          ID: targetId,
          operator_id: user.uid,
          OPERATOR_ID: user.uid,
          PIC_SENDER: user.displayName || user.email || 'SYSTEM',
          DATE: dateStr,
          date: dateStr,
          TGL_INPUT: displayDateStr,
          tgl_input: displayDateStr,
          timestamp_input: now.getTime()
        };

        // Add specific entry dates for JOP/JOS as per official schema
        if (collectionName === 'workflows_jop') {
          payload.TGL_MASUK_JOP = displayDateStr;
          payload.tgl_masuk_jop = displayDateStr;
          payload.ST_WF_JOP = payload.ST_WF_JOP || payload.st_wf_jop || 'OPEN';
        } else if (collectionName === 'workflows_jos') {
          payload.TGL_MASUK_JOS = displayDateStr;
          payload.tgl_masuk_jos = displayDateStr;
          payload.ST_WF_JOS = payload.ST_WF_JOS || payload.st_wf_jos || 'OPEN';
        }

        // 🔥 AUTO CALCULATION INTEGRATION
        await setDoc(docRef, payload, { merge: true });

        // 🔥 HYBRID SYNC: Handle RTDB placement
        const isTerminalStatus = (val: string) => {
          if (!val) return false;
          const upper = val.toUpperCase();
          return ['CLOSED', 'CANCEL', 'DONE', 'SELESAI'].includes(upper);
        };

        const workflowStatus = (
          collectionName === 'workflows_jop'
            ? (payload.ST_WF_JOP as string)
            : collectionName === 'workflows_jos'
              ? (payload.ST_WF_JOS as string)
              : ((payload.status_workflow as string) || (payload.ST_WORKFLOW as string) || "")
        ).toUpperCase();
        const isCompleted = isTerminalStatus(workflowStatus);

        if (isCompleted) {
          await remove(ref(rtdb, `active_jobs/${collectionName}/${targetId}`));
          await recordAuditLog({
            actorUid: user.uid,
            action: 'archive_workflow',
            entityType: collectionName,
            entityId: targetId,
            metadata: { status: workflowStatus }
          });
        } else {
          await set(ref(rtdb, `active_jobs/${collectionName}/${targetId}`), payload);
          await recordAuditLog({
            actorUid: user.uid,
            action: 'upsert_active_workflow',
            entityType: collectionName,
            entityId: targetId,
            metadata: { status: workflowStatus }
          });
        }
        
        // 🔥 SYNC MASTER JOP if this is a progress update
        const masterId = (payload.no_jop || payload.NO_JOP || payload.no_jos || payload.NO_JOS || payload.id_jop || payload.ID_JOP) as string;
        if (isProgressUpdate && masterId) {
            // Hanya jalankan jika bukan sedang menulis ke koleksi master itu sendiri
            if (collectionName !== 'workflows_jop' && collectionName !== 'workflows_jos') {
                console.log(`[GlobalInputForm] Syncing master ${masterId} with role ${syncRole}`);
                await updateJOPData(masterId, syncRole, payload);
            }
        }
        
        notify("Data berhasil disimpan!", "success");
        resetForm();
        if (onSuccess) onSuccess();
        
      } catch (err: unknown) {
        console.error(err);
        const error = err as Error;
        const msg = error.message || "Gagal menyimpan data.";
        setError(msg);
        notify(msg, "error");
      } finally {
        setLoading(false);
      }
    }, 2000), // 2s throttle for Spark safety
    [user, formData, requiredFields, docId, autoGenPrefix, collectionName, notify, resetForm, onSuccess, setLoading, setError, isProgressUpdate, syncRole]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    throttledSubmit(e);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] space-y-10 w-full max-w-3xl mx-auto relative overflow-hidden",
        className
      )}
      onSubmit={handleSubmit}
    >
      {/* Decorative Gradient Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{title}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Data Entry Terminal
            </p>
        </div>
        <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Operator</span>
            <span className="text-[11px] font-black text-indigo-600 truncate max-w-[150px]">{user?.displayName || user?.email || 'Guest User'}</span>
        </div>
      </div>

      {error && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-wider border-2 border-rose-100 flex items-center gap-3 shadow-sm shadow-rose-100/50"
        >
          <div className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shrink-0">!</div>
          {error}
        </motion.div>
      )}

      <div className="space-y-8 relative z-10">
        {children}
      </div>

      <div className="pt-10 relative z-10">
        <button
          type="submit"
          disabled={isLoading || !user}
          className="group w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 px-8 rounded-[2rem] shadow-2xl shadow-indigo-200/20 transition-all duration-500 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-3 overflow-hidden relative"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5 text-indigo-300" />
          ) : (
            <>
                <span className="relative z-10 uppercase tracking-[0.15em] text-xs">{submitLabel}</span>
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <motion.div
                        animate={{ x: [0, 2, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        →
                    </motion.div>
                </div>
            </>
          )}
          
          {/* Subtle Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
        <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-6">
            Klik submit untuk sinkronisasi data ke cloud server platinum
        </p>
      </div>
    </motion.form>
  );
}

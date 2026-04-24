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
          payload.ST_WORKFLOW = payload.ST_WORKFLOW || payload.status_workflow || 'OPEN';
        } else if (collectionName === 'workflows_jos') {
          payload.TGL_MASUK_JOS = displayDateStr;
          payload.tgl_masuk_jos = displayDateStr;
          payload.ST_WF_JOS = payload.ST_WF_JOS || payload.st_wf_jos || 'OPEN';
          payload.ST_WORKFLOW = payload.ST_WORKFLOW || payload.status_workflow || 'OPEN';
        }

        // 🔥 AUTO CALCULATION INTEGRATION
        await setDoc(docRef, payload, { merge: true });

        // 🔥 HYBRID SYNC: Handle RTDB placement
        const isTerminalStatus = (val: string) => {
          if (!val) return false;
          const upper = val.toUpperCase();
          return ['CLOSED', 'CANCEL', 'DONE', 'SELESAI'].includes(upper);
        };

        const workflowStatus = ((payload.ST_WORKFLOW as string) || "").toUpperCase();
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full max-w-2xl mx-auto", className)}
      onSubmit={handleSubmit}
    >
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">
          {user ? `Operator: ${user.email} (ID: ${user.uid})` : "Not logged in"}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isLoading || !user}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
        >
          {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
          {submitLabel}
        </button>
      </div>
    </motion.form>
  );
}

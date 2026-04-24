import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, remove } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { JopData } from '@/features/job/jobTypes';
import { calculateKPI } from '@/features/kpi/calculateKPI';
import { recordAuditLog } from '@/features/audit-log/auditLogService';

/** Safely extract a string from an unknown payload value. */
function asString(val: unknown, fallback = ""): string {
  if (typeof val === "string") return val;
  if (val == null) return fallback;
  return String(val);
}

export const submitLog = async (collectionName: string, data: Record<string, unknown>) => {
  try {
    const logId = `LOG-${Date.now()}`;
    await setDoc(doc(db, collectionName, logId), data);
  } catch (e) {
    console.error(`Failed to submit log ${collectionName}`, e);
  }
};

export const updateJOPData = async (id: string, role: string, payload: Record<string, unknown>): Promise<{status: string, message: string}> => {
  try {
    const jopDocRef = doc(db, 'workflows_jop', id);
    const jopSnap = await getDoc(jopDocRef);
    if (!jopSnap.exists()) {
      return { status: 'error', message: 'ID JOP tidak ditemukan!' };
    }
    const currentData = jopSnap.data() as JopData;
    let updates: Partial<JopData> = { 
      LAST_UPDATED: serverTimestamp(),
    };
    const nowStr = new Date().toISOString();
    
    console.log(`[workflowService] Updating JOP ${id} for role ${role}`);

    if (role === 'spv') {
      updates = {
        ...updates,
        FASE_DT: asString(payload.FASE_DT),
        PIC_UTAMA: asString(payload.PIC_UTAMA),
        PIC_SUPPORT: asString(payload.PIC_SUPPORT),
        ST_WF_JOP: 'Assigned',
        KT: parseFloat(asString(payload.KT)) || 0, 
        RP: parseFloat(asString(payload.RP)) || 0, 
        BS: parseFloat(asString(payload.BS)) || 0, 
        CAD: parseFloat(asString(payload.CAD)) || 0
      };
    } else if (role === 'admin_edit') {
      updates = {
        ...updates,
        NO_JOP: asString(payload.NO_JOP),
        NO_JOS: asString(payload.NO_JOS),
        BUYER: asString(payload.BUYER),
        NAMA_JOP: asString(payload.NAMA_JOP),
        TGL_TARGET_JOP: asString(payload.TGL_TARGET_JOP || payload.TGL_TARGET),
        TIPE_JOP: asString(payload.TIPE_JOP),
        FASE_DT: asString(payload.FASE_DT),
        ST_WF_JOP: asString(payload.ST_WF_JOP || payload.ST_WORKFLOW),
        KT: parseFloat(asString(payload.KT)) || 0,
        RP: parseFloat(asString(payload.RP)) || 0,
        BS: parseFloat(asString(payload.BS)) || 0,
        CAD: parseFloat(asString(payload.CAD)) || 0,
        PIC_UTAMA: asString(payload.PIC_UTAMA),
        PIC_SUPPORT: asString(payload.PIC_SUPPORT),
        HOLD_REASON: asString(payload.HOLD_REASON),
        TINDAKAN_KOREKTIF: asString(payload.TINDAKAN_KOREKTIF)
      };

      const currentWF = currentData.ST_WF_JOP || currentData.ST_WORKFLOW;
      if (currentWF === 'REVIEW' && payload.PIC_UTAMA && (!updates.ST_WF_JOP || updates.ST_WF_JOP === 'REVIEW')) {
        updates.ST_WF_JOP = 'Assigned';
      }
      if (updates.ST_WF_JOP === 'Layout') updates.ST_WF_JOP = 'On Process';
    } else if (role === 'support') {
      const workflowStatus = asString(payload.status_workflow || payload.ST_WORKFLOW || 'On Process');
      const supportType = asString(payload.type_support || payload.TYPE_SUPPORT);
      
      updates = {
        ...updates,
        ST_WF_JOP: workflowStatus,
        ST_PRO_NO_B: (workflowStatus === 'Done' || workflowStatus === 'Closed') ? 'Done' : 'Support',
        [`ST_${supportType}`]: workflowStatus, // e.g., ST_GMG, ST_CNC
        HOLD_REASON: (workflowStatus === 'Hold') ? asString(payload.catatan_support || payload.HOLD_REASON) : "",
      };
    } else if (role === 'blueprint') {
      updates = {
        ...updates,
        ST_WF_JOP: asString(payload.ST_WF_JOP || payload.ST_WORKFLOW),
        ST_PRO_NO_B: asString(payload.ST_PRO_NO_B || payload.ST_PRO_JOP),
        ST_BLUEPRINT: asString(payload.ST_BLUEPRINT),
        HOLD_REASON: asString(payload.HOLD_REASON),
        TINDAKAN_KOREKTIF: asString(payload.TINDAKAN_KOREKTIF)
      };
      
      const isStartingBP = (updates.ST_WF_JOP === 'Blueprint') && (!currentData.TGL_MULAI_B && !currentData.TGL_MULAI);
      if (isStartingBP) {
        updates.TGL_MULAI_B = nowStr;
      }
      await submitLog('logs_blueprint', { ...currentData, ...payload, TGL_LOG: nowStr });
    } else if (role === 'op') {
      let workflowStatus = asString(payload.ST_WF_JOP || payload.ST_WORKFLOW);
      let progressStatus = asString(payload.ST_PRO_NO_B || payload.ST_PRO_JOP);

      if (progressStatus.toUpperCase() === "BLUEPRINT") workflowStatus = "Blueprint";

      if (progressStatus === 'Done') {
        const hasSupport = !!(currentData.PIC_SUPPORT && currentData.PIC_SUPPORT !== "-");
        const senderPic = asString(payload.PIC_SENDER).toUpperCase();
        const faseDT = String(currentData.FASE_DT || "").toUpperCase();
        
        if (hasSupport) {
          const isPICUtama = senderPic === String(currentData.PIC_UTAMA || "").toUpperCase();
          const isPICSupport = senderPic === String(currentData.PIC_SUPPORT || "").toUpperCase();
          const currentProg = String(currentData.ST_PRO_NO_B || currentData.ST_PRO_JOP || "").toUpperCase();

          if (isPICUtama) {
            const isSupportDone = ['SELESAI CAD', 'CAD OK', 'SELESAI LAYOUT (S)', 'LAYOUT OK (S)'].includes(currentProg);
            if (isSupportDone) {
              progressStatus = 'Done';
              workflowStatus = 'ACC';
            } else {
              progressStatus = (faseDT === "LAYOUT") ? 'Selesai Layout (U)' : 'Selesai Layout';
              workflowStatus = 'On Process';
            }
          } else if (isPICSupport) {
            const isUtamaDone = ['SELESAI LAYOUT', 'LAYOUT OK', 'SELESAI LAYOUT (U)', 'LAYOUT OK (U)'].includes(currentProg);
            if (isUtamaDone) {
              progressStatus = 'Done';
              workflowStatus = 'ACC';
            } else {
              progressStatus = (faseDT === "LAYOUT") ? 'Selesai Layout (S)' : 'Selesai CAD';
              workflowStatus = 'On Process';
            }
          }
        } else {
          progressStatus = 'Done';
          workflowStatus = 'ACC';
        }
      }

      updates = {
        ...updates,
        ST_WF_JOP: workflowStatus,
        ST_PRO_NO_B: progressStatus,
        HOLD_REASON: (workflowStatus === 'Hold' || workflowStatus === 'Reject') ? asString(payload.HOLD_REASON) : "",
        TINDAKAN_KOREKTIF: asString(payload.TINDAKAN_KOREKTIF),
        REVISI_KE: parseInt(asString(payload.REVISI_KE)) || 0
      };

      const needsStartTime = (workflowStatus === 'On Process' || workflowStatus === 'Layout') && (!currentData.TGL_MULAI_B && !currentData.TGL_MULAI);
      if (needsStartTime) {
        updates.TGL_MULAI_B = nowStr;
      }
    } else if (role === 'qc') {
      let finalWorkflow = 'Reject';
      let finalProgress = asString(payload.ST_PRO_NO_B || payload.ST_PRO_JOP || currentData.ST_PRO_NO_B || currentData.ST_PRO_JOP);

      if (payload.ST_APPROVAL === 'Approved') {
        const currentProg = String(currentData.ST_PRO_NO_B || currentData.ST_PRO_JOP || "").toUpperCase();
        if (currentProg === 'SELESAI LAYOUT (U)') {
          finalWorkflow = 'On Process'; finalProgress = 'Layout OK (U)';
        } else if (currentProg === 'SELESAI LAYOUT (S)') {
          finalWorkflow = 'On Process'; finalProgress = 'Layout OK (S)';
        } else if (currentProg === 'SELESAI LAYOUT') {
          finalWorkflow = 'On Process'; finalProgress = 'Layout OK';
        } else if (currentProg === 'SELESAI CAD') {
          finalWorkflow = 'On Process'; finalProgress = 'CAD OK';
        } else {
          finalWorkflow = 'Closed'; finalProgress = 'Done';
        }
      } else if (payload.ST_APPROVAL === 'Proses CAD') {
        finalWorkflow = 'On Process'; finalProgress = 'Proses CAD';
      }

      updates = {
        ...updates,
        ST_WF_JOP: finalWorkflow,
        ST_PRO_NO_B: finalProgress,
        ST_APPROVAL: asString(payload.ST_APPROVAL),
        ST_QC: asString(payload.ST_QC),
        QC_USER: asString(payload.QC_USER),
        HOLD_REASON: (finalWorkflow === 'Reject') ? asString(payload.HOLD_REASON) : "",
        TINDAKAN_KOREKTIF: asString(payload.TINDAKAN_KOREKTIF),
        REVISI_KE: parseInt(asString(payload.REVISI_KE)) || 0
      };

      await submitLog('logs_qc', { ...currentData, ...payload, TGL_LOG: nowStr });
    } else if (role === 'prepress') {
      const workflowStatus = asString(payload.status_workflow || payload.ST_WORKFLOW || 'On Process');
      const prepressStatus = asString(payload.status_prepress || payload.ST_PREPRESS || 'Approved');
      
      updates = {
        ...updates,
        ST_WF_JOP: workflowStatus,
        ST_PRO_NO_B: (workflowStatus === 'Done' || workflowStatus === 'Closed') ? 'Done' : 'Produksi',
        ST_PREPRESS: prepressStatus,
        HOLD_REASON: (workflowStatus === 'Hold') ? asString(payload.catatan_operator || payload.HOLD_REASON) : "",
      };
    }

    const combinedData = { ...currentData, ...updates };
    const calculatedUpdates = calculateKPI(combinedData);
    const finalUpdates = { ...updates, ...calculatedUpdates };

    await updateDoc(jopDocRef, finalUpdates);
    await remove(ref(rtdb, `locks/${id}`));

    // 🔥 HYBRID SYNC: Remove from RTDB if status is CLOSED or CANCEL
    const finalStatus = asString(finalUpdates.ST_WF_JOP || currentData.ST_WF_JOP || finalUpdates.ST_WORKFLOW || currentData.ST_WORKFLOW || "").toUpperCase();
    
    if (finalStatus === "CLOSED" || finalStatus === "CANCEL" || finalStatus === "DONE") {
      try {
        await remove(ref(rtdb, `active_jobs/workflows_jop/${id}`));
        await recordAuditLog({
          actorUid: asString(payload.operator_id, "SYSTEM"),
          action: "archive_workflow",
          entityType: "workflows_jop",
          entityId: id,
          metadata: { status: finalStatus }
        });
      } catch (archiveError) {
        console.error("Hybrid sync archive failed", archiveError);
      }
    } else {
      // Record standard update log
      await recordAuditLog({
        actorUid: asString(payload.operator_id, "SYSTEM"),
        action: "update_workflow",
        entityType: "workflows_jop",
        entityId: id,
        metadata: { role, status: finalStatus }
      });
    }

    return { status: 'success', message: 'Data Berhasil Diupdate' };
  } catch (e: unknown) {
    const error = e as Error;
    return { status: 'error', message: error.message };
  }
};

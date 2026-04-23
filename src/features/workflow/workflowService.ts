import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, remove } from 'firebase/database';
import { db, rtdb } from '../../lib/firebase';
import { JopData } from '../job/jobTypes';
import { calculateKPI } from '../kpi/calculateKPI';
import { recordAuditLog } from '../audit-log/auditLogService';

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
      // Ensure we use the new naming convention from MODEL_DB_FB
    };
    const nowStr = new Date().toISOString();

    if (role === 'spv') {
      updates = {
        ...updates,
        FASE_DT: payload.FASE_DT as string,
        PIC_UTAMA: payload.PIC_UTAMA as string,
        PIC_SUPPORT: payload.PIC_SUPPORT as string,
        ST_WF_JOP: 'Assigned',
        KT: parseFloat(payload.KT as string) || 0, 
        RP: parseFloat(payload.RP as string) || 0, 
        BS: parseFloat(payload.BS as string) || 0, 
        CAD: parseFloat(payload.CAD as string) || 0
      };
    } else if (role === 'admin_edit') {
      updates = {
        ...updates,
        NO_JOP: payload.NO_JOP as string,
        NO_JOS: payload.NO_JOS as string,
        BUYER: payload.BUYER as string,
        NAMA_JOP: payload.NAMA_JOP as string,
        TGL_TARGET_JOP: (payload.TGL_TARGET_JOP || payload.TGL_TARGET) as string,
        TIPE_JOP: payload.TIPE_JOP as string,
        FASE_DT: payload.FASE_DT as string,
        ST_WF_JOP: (payload.ST_WF_JOP || payload.ST_WORKFLOW) as string,
        KT: parseFloat(payload.KT as string) || 0,
        RP: parseFloat(payload.RP as string) || 0,
        BS: parseFloat(payload.BS as string) || 0,
        CAD: parseFloat(payload.CAD as string) || 0,
        PIC_UTAMA: payload.PIC_UTAMA as string,
        PIC_SUPPORT: payload.PIC_SUPPORT as string,
        HOLD_REASON: payload.HOLD_REASON as string,
        TINDAKAN_KOREKTIF: payload.TINDAKAN_KOREKTIF as string
      };

      const currentWF = currentData.ST_WF_JOP || currentData.ST_WORKFLOW;
      if (currentWF === 'REVIEW' && payload.PIC_UTAMA && (!updates.ST_WF_JOP || updates.ST_WF_JOP === 'REVIEW')) {
        updates.ST_WF_JOP = 'Assigned';
      }
      if (updates.ST_WF_JOP === 'Layout') updates.ST_WF_JOP = 'On Process';
    } else if (role === 'blueprint') {
      updates = {
        ...updates,
        ST_WF_JOP: (payload.ST_WF_JOP || payload.ST_WORKFLOW) as string,
        ST_PRO_NO_B: (payload.ST_PRO_NO_B || payload.ST_PRO_JOP) as string,
        ST_BLUEPRINT: payload.ST_BLUEPRINT as string,
        HOLD_REASON: payload.HOLD_REASON as string,
        TINDAKAN_KOREKTIF: payload.TINDAKAN_KOREKTIF as string
      };
      
      const isStartingBP = (updates.ST_WF_JOP === 'Blueprint') && (!currentData.TGL_MULAI_B && !currentData.TGL_MULAI);
      if (isStartingBP) {
        updates.TGL_MULAI_B = nowStr;
      }
      await submitLog('logs_blueprint', { ...currentData, ...payload, TGL_LOG: nowStr });
    } else if (role === 'op') {
      let workflowStatus = (payload.ST_WF_JOP || payload.ST_WORKFLOW) as string;
      let progressStatus = (payload.ST_PRO_NO_B || payload.ST_PRO_JOP) as string;

      if (String(progressStatus).toUpperCase() === "BLUEPRINT") workflowStatus = "Blueprint";

      if (progressStatus === 'Done') {
        const hasSupport = !!(currentData.PIC_SUPPORT && currentData.PIC_SUPPORT !== "-");
        const senderPic = (payload.PIC_SENDER as string || "").toUpperCase();
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
        HOLD_REASON: (workflowStatus === 'Hold' || workflowStatus === 'Reject') ? payload.HOLD_REASON : "",
        TINDAKAN_KOREKTIF: payload.TINDAKAN_KOREKTIF || "",
        REVISI_KE: parseInt(payload.REVISI_KE) || 0
      };

      const needsStartTime = (workflowStatus === 'On Process' || workflowStatus === 'Layout') && (!currentData.TGL_MULAI_B && !currentData.TGL_MULAI);
      if (needsStartTime) {
        updates.TGL_MULAI_B = nowStr;
      }
    } else if (role === 'qc') {
      let finalWorkflow = 'Reject';
      let finalProgress = payload.ST_PRO_NO_B || payload.ST_PRO_JOP || currentData.ST_PRO_NO_B || currentData.ST_PRO_JOP;

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
        ST_APPROVAL: payload.ST_APPROVAL,
        ST_QC: payload.ST_QC,
        QC_USER: payload.QC_USER,
        HOLD_REASON: (finalWorkflow === 'Reject') ? payload.HOLD_REASON : "",
        TINDAKAN_KOREKTIF: payload.TINDAKAN_KOREKTIF || "",
        REVISI_KE: parseInt(payload.REVISI_KE) || 0
      };

      await submitLog('logs_qc', { ...currentData, ...payload, TGL_LOG: nowStr });
    }

    const combinedData = { ...currentData, ...updates };
    const calculatedUpdates = calculateKPI(combinedData);
    const finalUpdates = { ...updates, ...calculatedUpdates };

    await updateDoc(jopDocRef, finalUpdates);
    await remove(ref(rtdb, `locks/${id}`));

    // 🔥 HYBRID SYNC: Remove from RTDB if status is CLOSED or CANCEL
    const finalStatus = (finalUpdates.ST_WF_JOP || currentData.ST_WF_JOP || finalUpdates.ST_WORKFLOW || currentData.ST_WORKFLOW || "").toUpperCase();
    if (finalStatus === "CLOSED" || finalStatus === "CANCEL") {
      try {
        await remove(ref(rtdb, `active_jobs/workflows_jop/${id}`));
        await recordAuditLog({
          actorUid: payload.operator_id || "SYSTEM",
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
        actorUid: payload.operator_id || "SYSTEM",
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

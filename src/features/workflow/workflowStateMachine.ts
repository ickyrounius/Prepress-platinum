/**
 * workflowStateMachine.ts
 * Core workflow transition logic with HOLD timer management.
 * All status changes go through this service.
 *
 * PATTERN: Status change = batched write (job doc + dept_summary + audit log)
 */

import {
  doc,
  writeBatch,
  serverTimestamp,
  increment,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { canTransition, normalizeStatus } from '../../lib/workflow';
import type { WorkflowStatus, AuditAction } from '../../lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: Transition a job status
// ─────────────────────────────────────────────────────────────────────────────

export interface TransitionParams {
  collection: 'workflows_jop' | 'workflows_jos';
  jobId: string;
  toStatus: WorkflowStatus;
  actorUid: string;
  actorName: string;
  dept: string;
  reason?: string;
}

export async function transitionJobStatus(params: TransitionParams): Promise<void> {
  const { collection: col, jobId, toStatus, actorUid, actorName, dept, reason } = params;

  // 1. Read current job state
  const jobRef = doc(db, col, jobId);
  const snap = await getDoc(jobRef);
  if (!snap.exists()) throw new Error(`Job ${jobId} tidak ditemukan`);

  const data = snap.data() as Record<string, unknown>;
  const statusField = col === 'workflows_jop' ? 'ST_WF_JOP' : 'ST_WF_JOS';
  const fromStatus = normalizeStatus(data[statusField]);
  const now = Date.now();

  // 2. Validate transition
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`Transisi ${fromStatus} → ${toStatus} tidak valid`);
  }

  // 3. Calculate hold/active duration adjustments
  const holdStart = (data.holdStart as number) ?? null;
  const holdDuration = (data.holdDuration as number) ?? 0;
  const activeDuration = (data.activeDuration as number) ?? 0;
  const lastStatusChange = (data.lastStatusChange as number) ?? now;

  const jobUpdate: Record<string, unknown> = {
    [statusField]: toStatus,
    lastStatusChange: now,
    LAST_UPDATED: now,
    LAST_UPDATED_BY: actorUid,
  };

  // HOLD START: record holdStart timestamp, pause active timer
  if (toStatus === 'HOLD') {
    if (fromStatus === 'IN_PROGRESS') {
      // Add elapsed active time before pausing
      jobUpdate.activeDuration = activeDuration + (now - lastStatusChange);
    }
    jobUpdate.holdStart = now;
  }

  // HOLD END: accumulate holdDuration, clear holdStart
  if (fromStatus === 'HOLD' && toStatus !== 'HOLD') {
    const elapsed = holdStart ? now - holdStart : 0;
    jobUpdate.holdDuration = holdDuration + elapsed;
    jobUpdate.holdStart = null;
  }

  // IN_PROGRESS start: reset lastStatusChange for active timer
  if (toStatus === 'IN_PROGRESS' && fromStatus !== 'HOLD') {
    // Starting fresh active segment
    jobUpdate.lastStatusChange = now;
  }

  // DONE: capture final activeDuration
  if (toStatus === 'DONE' && fromStatus === 'IN_PROGRESS') {
    jobUpdate.activeDuration = activeDuration + (now - lastStatusChange);
  }

  // 4. Determine dept_summary field changes
  const summaryRef = doc(db, 'dept_summary', dept);
  const oldBucket = statusToBucket(fromStatus);
  const newBucket = statusToBucket(toStatus);
  const summaryUpdate: Record<string, unknown> = {
    updatedAt: now,
  };
  if (oldBucket !== newBucket) {
    summaryUpdate[oldBucket] = increment(-1);
    summaryUpdate[newBucket] = increment(1);
  }

  // 5. Audit log entry
  const auditRef = doc(db, 'audit_logs', `${now}_${actorUid}`);
  const auditEntry = {
    actor_uid: actorUid,
    actor_name: actorName,
    action: 'status_change' as AuditAction,
    entity_type: col,
    entity_id: jobId,
    before: { [statusField]: fromStatus },
    after: { [statusField]: toStatus },
    timestamp: now,
    metadata: reason ? { reason } : {},
  };

  // 6. Batched write — atomic
  const batch = writeBatch(db);
  batch.update(jobRef, jobUpdate);
  batch.set(summaryRef, summaryUpdate, { merge: true });
  batch.set(auditRef, auditEntry);
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Map WorkflowStatus → dept_summary field name
// ─────────────────────────────────────────────────────────────────────────────

function statusToBucket(status: WorkflowStatus): string {
  switch (status) {
    case 'WAITING':    return 'waiting';
    case 'IN_PROGRESS': return 'inProgress';
    case 'REVISION':   return 'revision';
    case 'CHECKING':   return 'checking';
    case 'APPROVED':   return 'approved';
    case 'OUTPUT':     return 'output';
    case 'DONE':       return 'done';
    case 'HOLD':       return 'hold';
    default:           return 'inProgress';
  }
}

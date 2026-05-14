/**
 * approvalService.ts
 * Lightweight approval flow: Designer → SPV → Ready Output
 * Approvals are immutable once APPROVED.
 */

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { ApprovalDocument, ApprovalStatus, ApprovalStep } from '../../lib/types';

const COL = 'approvals';

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT FOR APPROVAL (creates a PENDING approval record)
// ─────────────────────────────────────────────────────────────────────────────

export interface SubmitApprovalParams {
  jobId: string;
  jobType: 'JOP' | 'JOS';
  step: ApprovalStep;
  createdBy: string;
}

export async function submitForApproval(params: SubmitApprovalParams): Promise<string> {
  const doc: Omit<ApprovalDocument, 'id'> = {
    ...params,
    status: 'PENDING',
    createdAt: Date.now(),
  };
  const ref = await addDoc(collection(db, COL), doc);
  return ref.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVE
// ─────────────────────────────────────────────────────────────────────────────

export async function approveJob(
  approvalId: string,
  approvedBy: string,
  approvedByName: string
): Promise<void> {
  const ref = doc(db, COL, approvalId);
  await updateDoc(ref, {
    status: 'APPROVED' as ApprovalStatus,
    approvedBy,
    approvedByName,
    approvedAt: Date.now(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REJECT
// ─────────────────────────────────────────────────────────────────────────────

export async function rejectApproval(
  approvalId: string,
  approvedBy: string,
  approvedByName: string,
  rejectedReason: string
): Promise<void> {
  const ref = doc(db, COL, approvalId);
  await updateDoc(ref, {
    status: 'REJECTED' as ApprovalStatus,
    approvedBy,
    approvedByName,
    approvedAt: Date.now(),
    rejectedReason,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — approvals for a job
// ─────────────────────────────────────────────────────────────────────────────

export async function getApprovalsByJob(
  jobId: string,
  pageLimit = 10
): Promise<ApprovalDocument[]> {
  const q = query(
    collection(db, COL),
    where('jobId', '==', jobId),
    orderBy('createdAt', 'desc'),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({
    id: d.id,
    ...(d.data() as Omit<ApprovalDocument, 'id'>),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — pending approvals (SPV queue)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPendingApprovals(pageLimit = 50): Promise<ApprovalDocument[]> {
  const q = query(
    collection(db, COL),
    where('status', '==', 'PENDING'),
    orderBy('createdAt', 'desc'),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({
    id: d.id,
    ...(d.data() as Omit<ApprovalDocument, 'id'>),
  }));
}

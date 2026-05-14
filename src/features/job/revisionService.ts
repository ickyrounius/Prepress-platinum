/**
 * revisionService.ts
 * Handles all revision history writes for JOP and JOS jobs.
 * Revisions are append-only — never updated or deleted.
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { RevisionDocument, RevisionLabel } from '../../lib/types';

const COL = 'revisions';

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateRevisionParams {
  jobId: string;
  jobType: 'JOP' | 'JOS';
  revisionNumber: RevisionLabel;
  changedBy: string;
  changedByName: string;
  reason: string;
  notes?: string;
  fileVersion?: string;
}

export async function createRevision(params: CreateRevisionParams): Promise<string> {
  const doc: Omit<RevisionDocument, 'id'> = {
    ...params,
    changedAt: Date.now(),
  };
  const ref = await addDoc(collection(db, COL), doc);
  return ref.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// READ — list revisions for a job (paginated)
// ─────────────────────────────────────────────────────────────────────────────

export async function getRevisionsByJob(
  jobId: string,
  pageLimit = 20
): Promise<RevisionDocument[]> {
  const q = query(
    collection(db, COL),
    where('jobId', '==', jobId),
    orderBy('changedAt', 'desc'),
    limit(pageLimit)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => ({
    id: d.id,
    ...(d.data() as Omit<RevisionDocument, 'id'>),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate next revision label from current count.
 * 0 → R0, 1 → R1, 2 → R2, 3 → R3, ≥4 → FINAL
 */
export function nextRevisionLabel(currentCount: number): RevisionLabel {
  if (currentCount <= 0) return 'R0';
  if (currentCount === 1) return 'R1';
  if (currentCount === 2) return 'R2';
  if (currentCount === 3) return 'R3';
  return 'FINAL';
}

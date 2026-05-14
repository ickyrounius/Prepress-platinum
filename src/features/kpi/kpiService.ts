/**
 * kpiService.ts
 * Lightweight KPI read/write for daily_kpi collection.
 *
 * RULES:
 * - Doc ID format: YYYY-MM-DD_uid
 * - Always use batched write: job update + KPI delta in one commit
 * - HOLD time tracked separately — excluded from performance score
 * - Overdue uses activeDuration only
 */

import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { DailyKPI, Department } from '../../lib/types';

const COL = 'daily_kpi';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function kpiDocId(uid: string, date?: string): string {
  return `${date ?? todayKey()}_${uid}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export async function getMyKPI(uid: string, date?: string): Promise<DailyKPI | null> {
  const id = kpiDocId(uid, date);
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? (snap.data() as DailyKPI) : null;
}

export async function getKPIRange(uid: string, days = 30): Promise<DailyKPI[]> {
  const q = query(
    collection(db, COL),
    where('uid', '==', uid),
    orderBy('date', 'desc'),
    limit(days)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyKPI);
}

export async function getDeptKPI(dept: Department, date?: string): Promise<DailyKPI[]> {
  const target = date ?? todayKey();
  const q = query(
    collection(db, COL),
    where('dept', '==', dept),
    where('date', '==', target),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DailyKPI);
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITE — merge delta into today's KPI doc
// ─────────────────────────────────────────────────────────────────────────────

export function buildKPIDelta(
  uid: string,
  displayName: string,
  dept: Department,
  delta: Partial<Pick<DailyKPI,
    'completedJobs' | 'overdueJobs' | 'revisionJobs' | 'activeJobs' | 'approvalCount' | 'holdTime'
  >>
): { id: string; data: Partial<DailyKPI> } {
  const date = todayKey();
  return {
    id: kpiDocId(uid, date),
    data: { date, uid, displayName, dept, updatedAt: Date.now(), ...delta },
  };
}

export async function upsertKPI(
  uid: string,
  displayName: string,
  dept: Department,
  delta: Partial<Pick<DailyKPI,
    'completedJobs' | 'overdueJobs' | 'revisionJobs' | 'activeJobs' | 'approvalCount' | 'holdTime'
  >>
): Promise<void> {
  const { id, data } = buildKPIDelta(uid, displayName, dept, delta);
  await setDoc(doc(db, COL, id), data, { merge: true });
}

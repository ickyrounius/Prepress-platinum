/**
 * useDashboardCounters.ts
 * Reads dept_summary/ from Firestore (one-shot, cached via useDeptSummaryStore).
 * Falls back to RTDB dashboardCounters only if Firestore is unavailable.
 *
 * STRATEGY: Read dept_summary once on mount. Skip if cache is fresh (<60s).
 * Manual refresh triggered by invalidate().
 */

import { useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useDeptSummaryStore } from '../lib/store/useDeptSummaryStore';
import type { Department, DeptSummary } from '../lib/types';

const DEPT_IDS: Department[] = ['DT', 'DG', 'CTP', 'CTCP', 'FLEXO', 'ETCHING', 'SCREEN'];

export function useDashboardCounters(dept?: Department) {
  const { summaries, isStale, setSummary } = useDeptSummaryStore();

  const fetchSummary = useCallback(async (d: Department) => {
    try {
      const snap = await getDoc(doc(db, 'dept_summary', d));
      if (snap.exists()) {
        setSummary(d, snap.data() as DeptSummary);
      }
    } catch {
      // silently fail — summary is non-critical
    }
  }, [setSummary]);

  useEffect(() => {
    const targets = dept ? [dept] : DEPT_IDS;
    for (const d of targets) {
      if (isStale()) {
        void fetchSummary(d);
      }
    }
  }, [dept, fetchSummary, isStale]);

  if (dept) {
    return {
      summary: summaries[dept] ?? null,
      refresh: () => void fetchSummary(dept),
    };
  }

  return {
    summaries,
    refresh: () => DEPT_IDS.forEach((d) => void fetchSummary(d)),
  };
}

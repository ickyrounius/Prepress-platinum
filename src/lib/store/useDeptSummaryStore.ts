/**
 * useDeptSummaryStore.ts
 * Caches pre-aggregated dept counters from dept_summary/ collection.
 * Read once on dashboard load. Invalidate on job status change.
 */

import { create } from 'zustand';
import type { DeptSummary, Department } from '../types';

interface DeptSummaryStore {
  summaries: Partial<Record<Department, DeptSummary>>;
  lastFetch: number;
  isStale: () => boolean;
  setSummary: (dept: Department, data: DeptSummary) => void;
  setSummaries: (data: Partial<Record<Department, DeptSummary>>) => void;
  invalidate: () => void;
}

const CACHE_TTL_MS = 60_000; // 1 minute

export const useDeptSummaryStore = create<DeptSummaryStore>((set, get) => ({
  summaries: {},
  lastFetch: 0,

  isStale: () => Date.now() - get().lastFetch > CACHE_TTL_MS,

  setSummary: (dept, data) =>
    set((s) => ({
      summaries: { ...s.summaries, [dept]: data },
      lastFetch: Date.now(),
    })),

  setSummaries: (data) =>
    set({ summaries: data, lastFetch: Date.now() }),

  invalidate: () => set({ lastFetch: 0 }),
}));

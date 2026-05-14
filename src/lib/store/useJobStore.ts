/**
 * useJobStore.ts
 * Caches paginated job lists per department + filters.
 * Server state cache — not derived/computed data.
 */

import { create } from 'zustand';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { DashboardItem } from '../types';

interface JobStoreState {
  // Keyed by dept key (e.g. 'DT', 'DG', 'CTP')
  jobs: Record<string, DashboardItem[]>;
  // Last pagination cursor per dept key
  cursors: Record<string, QueryDocumentSnapshot<DocumentData> | null>;
  // Timestamp of last fetch per dept key
  lastFetch: Record<string, number>;
  // Whether there are more pages per dept key
  hasMore: Record<string, boolean>;

  setJobs: (dept: string, items: DashboardItem[]) => void;
  appendJobs: (dept: string, items: DashboardItem[], cursor: QueryDocumentSnapshot<DocumentData> | null, hasMore: boolean) => void;
  updateJob: (dept: string, jobId: string, patch: Partial<DashboardItem>) => void;
  setCursor: (dept: string, cursor: QueryDocumentSnapshot<DocumentData> | null) => void;
  invalidate: (dept?: string) => void;
  isStale: (dept: string, ttlMs?: number) => boolean;
}

const DEFAULT_TTL = 30_000; // 30 seconds

export const useJobStore = create<JobStoreState>((set, get) => ({
  jobs: {},
  cursors: {},
  lastFetch: {},
  hasMore: {},

  setJobs: (dept, items) =>
    set((s) => ({
      jobs: { ...s.jobs, [dept]: items },
      lastFetch: { ...s.lastFetch, [dept]: Date.now() },
    })),

  appendJobs: (dept, items, cursor, hasMore) =>
    set((s) => ({
      jobs: { ...s.jobs, [dept]: [...(s.jobs[dept] ?? []), ...items] },
      cursors: { ...s.cursors, [dept]: cursor },
      hasMore: { ...s.hasMore, [dept]: hasMore },
      lastFetch: { ...s.lastFetch, [dept]: Date.now() },
    })),

  updateJob: (dept, jobId, patch) =>
    set((s) => {
      const list = s.jobs[dept] ?? [];
      return {
        jobs: {
          ...s.jobs,
          [dept]: list.map((j) => j.id === jobId ? { ...j, ...patch } : j),
        },
      };
    }),

  setCursor: (dept, cursor) =>
    set((s) => ({ cursors: { ...s.cursors, [dept]: cursor } })),

  invalidate: (dept) => {
    if (dept) {
      set((s) => ({
        lastFetch: { ...s.lastFetch, [dept]: 0 },
        cursors:   { ...s.cursors,   [dept]: null },
      }));
    } else {
      set({ lastFetch: {}, cursors: {} });
    }
  },

  isStale: (dept, ttlMs = DEFAULT_TTL) => {
    const last = get().lastFetch[dept] ?? 0;
    return Date.now() - last > ttlMs;
  },
}));

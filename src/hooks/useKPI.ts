'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, getDocs, limit,
} from 'firebase/firestore';
import { DailyKPI } from '@/features/job/jobTypes';

interface UseKPIOptions {
  uid?: string;
  days?: number;       // default 90
}

interface UseKPIReturn {
  data: DailyKPI[];
  isLoading: boolean;
  error: string | null;
  totals: KPITotals;
  refresh: () => void;
}

export interface KPITotals {
  completedJOS: number;
  completedJOP: number;
  overdueJOS: number;
  overdueJOP: number;
  revisionCount: number;
  holdHours: number;
  avgLeadTime: number;
}

const EMPTY_TOTALS: KPITotals = {
  completedJOS: 0,
  completedJOP: 0,
  overdueJOS: 0,
  overdueJOP: 0,
  revisionCount: 0,
  holdHours: 0,
  avgLeadTime: 0,
};

function computeTotals(data: DailyKPI[]): KPITotals {
  if (data.length === 0) return EMPTY_TOTALS;

  const t = data.reduce(
    (acc, d) => ({
      completedJOS: acc.completedJOS + (d.completedJOS || 0),
      completedJOP: acc.completedJOP + (d.completedJOP || 0),
      overdueJOS: acc.overdueJOS + (d.overdueJOS || 0),
      overdueJOP: acc.overdueJOP + (d.overdueJOP || 0),
      revisionCount: acc.revisionCount + (d.revisionCount || 0),
      holdHours: acc.holdHours + (d.holdHours || 0),
      avgLeadTime: acc.avgLeadTime + (d.avgLeadTime || 0),
    }),
    EMPTY_TOTALS
  );

  // Average lead time across days that had completions
  const daysWithCompletions = data.filter(
    (d) => (d.completedJOS || 0) + (d.completedJOP || 0) > 0
  ).length;
  t.avgLeadTime = daysWithCompletions > 0 ? t.avgLeadTime / daysWithCompletions : 0;

  return t;
}

export function useKPI({ uid, days = 90 }: UseKPIOptions): UseKPIReturn {
  const [data, setData] = useState<DailyKPI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!uid) return;

    const fetchKPI = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate date N days ago in YYYYMMDD format
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const cutoffStr = cutoff.toISOString().split('T')[0].replace(/-/g, '');

        const q = query(
          collection(db, 'daily_kpi'),
          where('uid', '==', uid),
          where('date', '>=', cutoffStr),
          orderBy('date', 'desc')
        );

        const snap = await getDocs(q);
        const items: DailyKPI[] = [];
        snap.forEach((d) => items.push(d.data() as DailyKPI));
        setData(items);
      } catch (err: any) {
        console.error('[useKPI] Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKPI();
  }, [uid, days, refreshKey]);

  const totals = computeTotals(data);

  return { data, isLoading, error, totals, refresh };
}

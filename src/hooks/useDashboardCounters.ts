'use client';

import { useEffect, useState } from 'react';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { DashboardCounters, DeptKey } from '@/features/job/jobTypes';

/**
 * Hook to subscribe to RTDB dashboardCounters.
 * Returns counters per department, updated at minute-level granularity.
 */
export function useDashboardCounters() {
  const [counters, setCounters] = useState<Record<DeptKey, DashboardCounters>>({
    DT: { waiting: 0, inProgress: 0, hold: 0, revision: 0, lastUpdated: 0 },
    DG: { waiting: 0, inProgress: 0, hold: 0, revision: 0, lastUpdated: 0 },
    PREPRESS: { waiting: 0, inProgress: 0, hold: 0, revision: 0, lastUpdated: 0 },
    SUPPORT: { waiting: 0, inProgress: 0, hold: 0, revision: 0, lastUpdated: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const counterRef = ref(rtdb, 'dashboardCounters');

    const handler = onValue(counterRef, (snap) => {
      const val = snap.val();
      if (val) {
        setCounters((prev) => ({ ...prev, ...val }));
      }
      setIsLoading(false);
    });

    return () => {
      off(counterRef, 'value', handler as any);
    };
  }, []);

  return { counters, isLoading };
}

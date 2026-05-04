'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { classifyWorkflowStatus, detectJosType, resolveWorkflowStatus } from '@/lib/workflow';
import { getFieldValue } from '@/lib/fieldStandardization';
import type { DashboardItem } from '@/lib/types';

export interface StatSummary {
  total: number;
  closed: number;
  process: number;
  hold: number;
  blueprint: number;
  overdue: number;
  onTime: number;
  exportCount: number;
  jasaCount: number;
  localCount: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface WorkloadDataPoint {
  name: string;
  jobs: number;
}

export function useRoleStats(collectionName: string) {
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as DashboardItem));
      setItems(docs);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [collectionName]);

  const stats = useMemo((): StatSummary => {
    const summary: StatSummary = {
      total: items.length,
      closed: 0,
      process: 0,
      hold: 0,
      blueprint: 0,
      overdue: 0,
      onTime: 0,
      exportCount: 0,
      jasaCount: 0,
      localCount: 0,
    };

    const now = new Date();

    items.forEach(item => {
      const isJop = collectionName.includes('jop') || collectionName.includes('dt');
      const sourceType = isJop ? 'DT' : 'DG';
      
      const bucket = classifyWorkflowStatus(
        resolveWorkflowStatus(item as Record<string, unknown>, sourceType),
        getFieldValue(item, isJop ? 'PROD_STATUS_JOP' : 'PROD_STATUS_JOS')
      );
      
      if (bucket === 'closed') summary.closed++;
      else if (bucket === 'hold') summary.hold++;
      else if (bucket === 'review') summary.blueprint++;
      else summary.process++;

      const typeVal = getFieldValue(item, isJop ? 'JOP_TYPE' : 'JOS_TYPE') || '';
      const josType = detectJosType(typeVal as string);
      if (josType === 'EXPORT') summary.exportCount++;
      else if (josType === 'JASA') summary.jasaCount++;
      else if (josType === 'LOCAL') summary.localCount++;

      // Overdue check
      const targetDateVal = getFieldValue(item, 'TARGET_DATE');
      if (targetDateVal) {
        const t = new Date(targetDateVal as string | number | Date);
        if (!isNaN(t.getTime()) && t < now && bucket !== 'closed') {
          summary.overdue++;
        } else if (bucket === 'closed') {
          summary.onTime++;
        }
      }
    });

    return summary;
  }, [items, collectionName]);

  const trendData = useMemo((): ChartDataPoint[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return { 
        date: format(d, 'd MMM'),
        fullDate: startOfDay(d),
        value: 0 
      };
    });

    items.forEach(item => {
      // Use JOP_DATE or JOS_DATE or LAST_UPDATED as fallback
      const dateVal = getFieldValue(item, 'JOP_DATE') || getFieldValue(item, 'JOS_DATE') || getFieldValue(item, 'LAST_UPDATED');
      if (dateVal) {
        const d = new Date(dateVal as string | number | Date);
        if (!isNaN(d.getTime())) {
          const point = last7Days.find(p => isSameDay(p.fullDate, d));
          if (point) point.value++;
        }
      }
    });

    return last7Days.map(({ date, value }) => ({ date, value }));
  }, [items]);

  const workloadData = useMemo((): WorkloadDataPoint[] => {
    const picCounts: Record<string, number> = {};
    items.forEach(item => {
      const pic = (getFieldValue(item, 'PIC_MAIN') || getFieldValue(item, 'OPERATOR') || 'Unknown') as string;
      picCounts[pic] = (picCounts[pic] || 0) + 1;
    });

    return Object.entries(picCounts)
      .map(([name, jobs]) => ({ name, jobs }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 8);
  }, [items]);

  return { items, stats, trendData, workloadData, loading };
}

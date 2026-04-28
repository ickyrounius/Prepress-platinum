'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { classifyWorkflowStatus, detectJosType, resolveWorkflowStatus } from '@/lib/workflow';

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
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
      const sourceType = collectionName.includes('jod') || collectionName.includes('jos') ? 'DG' : 'DT';
      const bucket = classifyWorkflowStatus(
        resolveWorkflowStatus(item as Record<string, unknown>, sourceType),
        item.ST_PRO_JOP || item.status_pro_jop || item.ST_PRO_JOS
      );
      
      if (bucket === 'closed') summary.closed++;
      else if (bucket === 'hold') summary.hold++;
      else if (bucket === 'review') summary.blueprint++;
      else summary.process++;

      const josType = detectJosType(item.TIPE_JOS || item.tipe_jos || item.TIPE_JOP || item.tipe_jop || '');
      if (josType === 'EXPORT') summary.exportCount++;
      else if (josType === 'JASA') summary.jasaCount++;
      else if (josType === 'LOCAL') summary.localCount++;

      // Overdue check
      const targetDate = item.tgl_target_no_jop || item.tgl_target_no_jos || item.TGL_TARGET || item.date_target;
      if (targetDate) {
        const t = new Date(targetDate);
        if (!isNaN(t.getTime()) && t < now && bucket !== 'closed') {
          summary.overdue++;
        } else if (bucket === 'closed') {
          summary.onTime++;
        }
      }
    });

    return summary;
  }, [items]);

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
      const dateVal = item.tgl_no_jop || item.tgl_no_jos || item.DATE || item.TGL_INPUT;
      if (dateVal) {
        const d = new Date(dateVal);
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
      const pic = item.pic_utama || item.PIC_UTAMA || item.operator_id || 'Unknown';
      picCounts[pic] = (picCounts[pic] || 0) + 1;
    });

    return Object.entries(picCounts)
      .map(([name, jobs]) => ({ name, jobs }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 8);
  }, [items]);

  return { items, stats, trendData, workloadData, loading };
}

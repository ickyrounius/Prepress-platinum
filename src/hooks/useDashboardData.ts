import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { classifyWorkflowStatus, detectJopType, detectJosType, type JopType, type JosType } from '@/lib/workflow';
import type { DashboardItem, JosTypeFilter, JopTypeFilter } from '@/lib/types';

export function useDashboardData() {
  const [rawItems, setRawItems] = useState<DashboardItem[]>([]);
  const [josTypeFilter, setJosTypeFilter] = useState<JosTypeFilter>('ALL');
  const [jopTypeFilter, setJopTypeFilter] = useState<JopTypeFilter>('ALL');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // Handle both cases for Jos/Jop detection
      const tipeJos = item.tipe_jos || item.TIPE_JOS;
      const noJop = item.no_jop || item.NO_JOP || item.id;
      
      const matchedJos = josTypeFilter === 'ALL' || detectJosType(tipeJos) === josTypeFilter;
      const matchedJop = jopTypeFilter === 'ALL' || detectJopType(noJop) === jopTypeFilter;
      
      // Date filtering with more robust timestamp handling
      if (dateRange.start || dateRange.end) {
        let itemDate: Date | null = null;
        if (item.timestamp_input) {
          itemDate = typeof item.timestamp_input === 'number' 
            ? new Date(item.timestamp_input) 
            : item.timestamp_input.toDate?.() || new Date(item.timestamp_input);
        } else if (item.DATE || item.date) {
          itemDate = new Date(item.DATE || item.date);
        }

        if (itemDate && !isNaN(itemDate.getTime())) {
          if (dateRange.start && itemDate < new Date(dateRange.start)) return false;
          if (dateRange.end) {
              const endDate = new Date(dateRange.end);
              endDate.setHours(23, 59, 59, 999);
              if (itemDate > endDate) return false;
          }
        }
      }
      
      return matchedJos && matchedJop;
    });
  }, [rawItems, josTypeFilter, jopTypeFilter, dateRange]);

  const stats = useMemo(() => {
    let totalLoad = 0;
    let closedCount = 0;
    let reviewCount = 0;
    let processCount = 0;
    let holdCount = 0;

    filteredItems.forEach((item) => {
      totalLoad++;
      const bucket = classifyWorkflowStatus(
        item.ST_WORKFLOW || item.status_workflow || item.status_dg || item.status_dt || item.ST_WF_JOP || item.ST_WF_JOS,
        item.ST_PRO_JOP || item.status_pro_jop || item.ST_PRO_JOS
      );
      if (bucket === 'closed') closedCount++;
      else if (bucket === 'review') reviewCount++;
      else if (bucket === 'hold') holdCount++;
      else processCount++;
    });

    return {
      total: totalLoad,
      closed: closedCount,
      blueprint: reviewCount,
      process: processCount,
      hold: holdCount,
    };
  }, [filteredItems]);

  useEffect(() => {
    const dbCollections = [
      'proses_dt_b',
      'proses_jod',
      'proses_ctp_b',
      'proses_ctcp_b',
      'proses_flexo_b',
      'proses_etching_b',
      'proses_screen_b',
      'proses_support_b',
    ];
    const activeUnsubscribes: (() => void)[] = [];
    const combinedItemsMap: Record<string, DashboardItem[]> = {
      proses_dt_b: [],
      proses_jod: [],
      proses_ctp_b: [],
      proses_ctcp_b: [],
      proses_flexo_b: [],
      proses_etching_b: [],
      proses_screen_b: [],
      proses_support_b: [],
    };

    dbCollections.forEach(colName => {
        const q = query(
          collection(db, colName),
          orderBy('timestamp_input', 'desc'),
          limit(50)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const items: DashboardItem[] = [];
            snapshot.forEach(doc => {
                const sourceType = colName === 'proses_dt_b' ? 'DT' : colName === 'proses_jod' ? 'DG' : colName === 'proses_support_b' ? 'SUPPORT' : 'PROD';
                items.push({ id: doc.id, sourceType, ...doc.data() } as DashboardItem);
            });
            combinedItemsMap[colName] = items;
            setRawItems(Object.values(combinedItemsMap).flat());
        }, (err) => {
          console.error(`Error streaming ${colName}:`, err);
        });
        activeUnsubscribes.push(unsub);
    });

    return () => activeUnsubscribes.forEach(unsub => unsub());
  }, []);

  const productivityData = useMemo(() => {
    const picTC: Record<string, { tcUtama: number; tcSupport: number }> = {};
    filteredItems.forEach(item => {
      const picU = item.pic_utama || item.PIC_UTAMA || 'N/A';
      const picS = item.pic_support || item.PIC_SUPPORT;
      const tcU = Number(item.TC_UTAMA || item.tc_utama || 0);
      const tcS = Number(item.TC_SUPPORT || item.tc_support || 0);
      
      if (!picTC[picU]) picTC[picU] = { tcUtama: 0, tcSupport: 0 };
      picTC[picU].tcUtama += tcU;
      
      if (picS && picS !== '-') {
        if (!picTC[picS]) picTC[picS] = { tcUtama: 0, tcSupport: 0 };
        picTC[picS].tcSupport += tcS;
      }
    });

    return Object.entries(picTC)
      .map(([name, vals]) => ({ name, ...vals }))
      .sort((a, b) => (b.tcUtama + b.tcSupport) - (a.tcUtama + a.tcSupport))
      .slice(0, 5);
  }, [filteredItems]);

  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr: d.toDateString(),
        jop: 0 
      };
    });

    filteredItems.forEach(item => {
      const dateVal = item.timestamp_input || item.DATE || item.date;
      if (dateVal) {
        const d = new Date(typeof dateVal === 'number' ? dateVal : dateVal);
        const dayMatch = days.find(day => day.dateStr === d.toDateString());
        if (dayMatch) dayMatch.jop++;
      }
    });

    return days.map(({ name, jop }) => ({ name, jop }));
  }, [filteredItems]);

  const resetFilters = () => {
    setDateRange({ start: '', end: '' });
    setJosTypeFilter('ALL');
    setJopTypeFilter('ALL');
  };

  return {
    rawItems,
    filteredItems,
    stats,
    productivityData,
    trendData,
    josTypeFilter,
    setJosTypeFilter,
    jopTypeFilter,
    setJopTypeFilter,
    dateRange,
    setDateRange,
    resetFilters
  };
}

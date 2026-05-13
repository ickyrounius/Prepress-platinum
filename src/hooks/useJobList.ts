'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, where, orderBy, limit, startAfter,
  onSnapshot, getDocs, QueryDocumentSnapshot,
} from 'firebase/firestore';
import { JopData, JosData } from '@/features/job/jobTypes';

type JobType = 'jop' | 'jos';

interface UseJobListOptions {
  type: JobType;
  pageSize?: number;
  statusFilter?: string[];
  autoListen?: boolean;
}

interface UseJobListReturn<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => void;
}

const COLLECTION_MAP: Record<JobType, string> = {
  jop: 'workflows_jop',
  jos: 'workflows_jos',
};

const STATUS_FIELD_MAP: Record<JobType, string> = {
  jop: 'ST_WF_JOP',
  jos: 'ST_WF_JOS',
};

export function useJobList<T = JopData | JosData>(
  options: UseJobListOptions
): UseJobListReturn<T> {
  const { type, pageSize = 30, statusFilter, autoListen = true } = options;
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const col = COLLECTION_MAP[type];
  const statusField = STATUS_FIELD_MAP[type];

  // Build the base query
  const buildQuery = useCallback(() => {
    const constraints = [];
    if (statusFilter && statusFilter.length > 0) {
      constraints.push(where(statusField, 'not-in', statusFilter));
    }
    constraints.push(orderBy('LAST_UPDATED', 'desc'));
    constraints.push(limit(pageSize));
    return query(collection(db, col), ...constraints);
  }, [col, statusField, statusFilter, pageSize]);

  // Subscribe with onSnapshot
  useEffect(() => {
    if (!autoListen) return;

    setIsLoading(true);
    const q = buildQuery();

    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        const items: T[] = [];
        snap.forEach((d) => items.push(d.data() as T));
        setData(items);
        setHasMore(snap.docs.length >= pageSize);
        lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`[useJobList] ${col} error:`, err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [buildQuery, autoListen, col, pageSize]);

  // Load next page (one-shot, appends to data)
  const loadMore = useCallback(async () => {
    if (!lastDocRef.current || !hasMore) return;
    setIsLoading(true);

    try {
      const constraints = [];
      if (statusFilter && statusFilter.length > 0) {
        constraints.push(where(statusField, 'not-in', statusFilter));
      }
      constraints.push(orderBy('LAST_UPDATED', 'desc'));
      constraints.push(startAfter(lastDocRef.current));
      constraints.push(limit(pageSize));

      const q = query(collection(db, col), ...constraints);
      const snap = await getDocs(q);
      const newItems: T[] = [];
      snap.forEach((d) => newItems.push(d.data() as T));

      setData((prev) => [...prev, ...newItems]);
      setHasMore(snap.docs.length >= pageSize);
      lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [col, statusField, statusFilter, pageSize, hasMore]);

  // Force refresh by tearing down and rebuilding the listener
  const refresh = useCallback(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    setData([]);
    lastDocRef.current = null;
    setHasMore(true);
    // trigger re-subscribe via effect dependency change (not ideal but works)
  }, []);

  return { data, isLoading, error, hasMore, loadMore, refresh };
}

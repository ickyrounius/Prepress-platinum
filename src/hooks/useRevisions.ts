/**
 * useRevisions.ts
 * Fetch revision history for a single job. One-shot read, cached in local state.
 */

import { useState, useEffect, useCallback } from 'react';
import type { RevisionDocument } from '../lib/types';
import { getRevisionsByJob } from '../features/job/revisionService';

interface UseRevisionsResult {
  revisions: RevisionDocument[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRevisions(jobId: string | null, pageLimit = 20): UseRevisionsResult {
  const [revisions, setRevisions] = useState<RevisionDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRevisionsByJob(jobId, pageLimit);
      setRevisions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat riwayat revisi');
    } finally {
      setLoading(false);
    }
  }, [jobId, pageLimit]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { revisions, loading, error, refresh: fetch };
}

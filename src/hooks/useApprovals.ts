/**
 * useApprovals.ts
 * Fetch approval records for a single job, or the SPV pending queue.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ApprovalDocument } from '../lib/types';
import {
  getApprovalsByJob,
  getPendingApprovals,
} from '../features/job/approvalService';

// ── Per-job approvals ─────────────────────────────────────────────────────────

interface UseApprovalsResult {
  approvals: ApprovalDocument[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useApprovals(jobId: string | null): UseApprovalsResult {
  const [approvals, setApprovals] = useState<ApprovalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getApprovalsByJob(jobId);
      setApprovals(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat approval');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { approvals, loading, error, refresh: fetch };
}

// ── SPV pending queue ─────────────────────────────────────────────────────────

interface UsePendingApprovalsResult {
  pending: ApprovalDocument[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePendingApprovals(): UsePendingApprovalsResult {
  const [pending, setPending] = useState<ApprovalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingApprovals(50);
      setPending(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat antrian approval');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetch(); }, [fetch]);

  return { pending, loading, error, refresh: fetch };
}

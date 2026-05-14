/**
 * workflow.ts — Canonical Workflow State Machine
 * Prepress Platinum v2 — Clean Slate
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 * - WorkflowStatus enum
 * - Valid state transitions
 * - Status classification (bucket)
 * - Status normalization (legacy string → canonical)
 * - JOP/JOS type detection
 */

import type { WorkflowStatus, WorkflowBucket, JopType, JosType } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// RE-EXPORT so other modules import from workflow.ts only
// ─────────────────────────────────────────────────────────────────────────────

export type { WorkflowStatus, WorkflowBucket, JopType, JosType };

// ─────────────────────────────────────────────────────────────────────────────
// ALL VALID STATUSES
// ─────────────────────────────────────────────────────────────────────────────

export const WORKFLOW_STATUSES: WorkflowStatus[] = [
  'WAITING',
  'IN_PROGRESS',
  'REVISION',
  'CHECKING',
  'APPROVED',
  'OUTPUT',
  'DONE',
  'HOLD',
];

// ─────────────────────────────────────────────────────────────────────────────
// STATE MACHINE — valid transitions per status
// ─────────────────────────────────────────────────────────────────────────────

export const TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
  WAITING:    ['IN_PROGRESS', 'HOLD'],
  IN_PROGRESS:['CHECKING', 'REVISION', 'HOLD'],
  CHECKING:   ['APPROVED', 'REVISION', 'IN_PROGRESS'],
  REVISION:   ['IN_PROGRESS', 'HOLD'],
  APPROVED:   ['OUTPUT'],
  OUTPUT:     ['DONE', 'REVISION'],
  HOLD:       ['WAITING', 'IN_PROGRESS', 'REVISION'],
  DONE:       [],
};

export function canTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(from: WorkflowStatus): WorkflowStatus[] {
  return TRANSITIONS[from] ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY STRING → CANONICAL STATUS
// Maps all old Firestore string values to canonical WorkflowStatus
// ─────────────────────────────────────────────────────────────────────────────

const LEGACY_STATUS_MAP: Record<string, WorkflowStatus> = {
  // IN_PROGRESS variants
  'LAYOUT':       'IN_PROGRESS',
  'ON PROGRESS':  'IN_PROGRESS',
  'PROSESS':      'IN_PROGRESS',
  'PROSES':       'IN_PROGRESS',
  'ASSIGNED':     'IN_PROGRESS',

  // CHECKING variants
  'BLUEPRINT':    'CHECKING',
  'PREVIEW':      'CHECKING',
  'REVIEW':       'CHECKING',
  'ACC DG':       'CHECKING',
  'ACC DG&MARKETING': 'CHECKING',

  // REVISION variants
  'REVISI':       'REVISION',
  'REJECT':       'REVISION',
  'CANCEL':       'REVISION',

  // APPROVED variants
  'ACC':          'APPROVED',
  'APPROVED':     'APPROVED',

  // DONE variants
  'SELESAI':      'DONE',
  'SELESAI LAYOUT': 'DONE',
  'SELESAI CAD':  'DONE',
  'CLOSED':       'DONE',
  'DONE':         'DONE',

  // HOLD
  'HOLD':         'HOLD',

  // WAITING
  'WAITING':      'WAITING',

  // OUTPUT
  'OUTPUT':       'OUTPUT',

  // IN_PROGRESS (canonical)
  'IN_PROGRESS':  'IN_PROGRESS',
  'REVISION':     'REVISION',
  'CHECKING':     'CHECKING',
};

/**
 * Normalize any legacy status string to canonical WorkflowStatus.
 * Returns 'IN_PROGRESS' as fallback for unrecognized values.
 */
export function normalizeStatus(value: unknown): WorkflowStatus {
  const raw = String(value ?? '').toUpperCase().trim();
  return LEGACY_STATUS_MAP[raw] ?? 'IN_PROGRESS';
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS → BUCKET (for UI grouping)
// ─────────────────────────────────────────────────────────────────────────────

export function classifyBucket(status: WorkflowStatus): WorkflowBucket {
  switch (status) {
    case 'DONE':        return 'closed';
    case 'CHECKING':
    case 'APPROVED':    return 'review';
    case 'HOLD':        return 'hold';
    case 'WAITING':     return 'waiting';
    default:            return 'process';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS DISPLAY METADATA
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusMeta {
  label: string;
  color: string;         // Tailwind class
  bgColor: string;       // Tailwind class
  textColor: string;     // Tailwind class
}

export const STATUS_META: Record<WorkflowStatus, StatusMeta> = {
  WAITING:    { label: 'Menunggu',     color: 'gray',   bgColor: 'bg-gray-100',   textColor: 'text-gray-700' },
  IN_PROGRESS:{ label: 'Proses',       color: 'blue',   bgColor: 'bg-blue-100',   textColor: 'text-blue-700' },
  REVISION:   { label: 'Revisi',       color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  CHECKING:   { label: 'QC Check',     color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  APPROVED:   { label: 'Approved',     color: 'green',  bgColor: 'bg-green-100',  textColor: 'text-green-700' },
  OUTPUT:     { label: 'Output',       color: 'teal',   bgColor: 'bg-teal-100',   textColor: 'text-teal-700' },
  DONE:       { label: 'Selesai',      color: 'green',  bgColor: 'bg-green-200',  textColor: 'text-green-800' },
  HOLD:       { label: 'HOLD',         color: 'red',    bgColor: 'bg-red-100',    textColor: 'text-red-700' },
};

// ─────────────────────────────────────────────────────────────────────────────
// JOP / JOS TYPE DETECTION (from job number prefix)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD-COMPAT ALIASES — do NOT remove, many files import these
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated use classifyBucket */
export const classifyWorkflowStatus = (status: any, _role?: any) => classifyBucket(status);

/** @deprecated use normalizeStatus */
export const normalizeWorkflowStatusInput = normalizeStatus;

// ─────────────────────────────────────────────────────────────────────────────
// JOP / JOS TYPE DETECTION (from job number prefix)
// ─────────────────────────────────────────────────────────────────────────────

export function detectJopType(value: unknown): JopType {
  const no = String(value ?? '').toUpperCase();
  if (no.startsWith('7B')) return 'JASA';
  if (no.startsWith('79')) return 'SMS';
  if (no.startsWith('9'))  return 'KARTON_BOX';
  if (no.startsWith('8'))  return 'EXPORT';
  return 'LOCAL';
}

export function detectJosType(value: unknown): JosType {
  const s = String(value ?? '').toUpperCase();
  if (s.includes('EXPORT')) return 'EXPORT';
  if (s.includes('JASA'))   return 'JASA';
  if (s.includes('LOCAL'))  return 'LOCAL';
  return 'ALL';
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOLVE STATUS from raw Firestore document (handles both JOP and JOS fields)
// ─────────────────────────────────────────────────────────────────────────────

import { getFieldValue } from './fieldStandardization';

export function resolveWorkflowStatus(
  item: Record<string, unknown>,
  sourceType?: string
): WorkflowStatus {
  let raw: unknown;

  if (sourceType === 'DT') {
    raw = getFieldValue(item, 'JOP_WORKFLOW_STATUS');
  } else if (sourceType === 'DG') {
    raw = getFieldValue(item, 'JOS_WORKFLOW_STATUS');
  } else {
    raw =
      getFieldValue(item, 'JOP_WORKFLOW_STATUS') ??
      getFieldValue(item, 'JOS_WORKFLOW_STATUS') ??
      item.ST_WORKFLOW;
  }

  return normalizeStatus(raw);
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIORITY DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

import type { Priority } from './types';
export type { Priority };

export interface PriorityMeta {
  label: string;
  bgColor: string;
  textColor: string;
  order: number;   // lower = higher priority (for sorting)
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  URGENT: { label: 'Urgent',  bgColor: 'bg-red-100',    textColor: 'text-red-700',    order: 1 },
  HIGH:   { label: 'Tinggi',  bgColor: 'bg-orange-100', textColor: 'text-orange-700', order: 2 },
  NORMAL: { label: 'Normal',  bgColor: 'bg-blue-50',    textColor: 'text-blue-600',   order: 3 },
  LOW:    { label: 'Rendah',  bgColor: 'bg-gray-100',   textColor: 'text-gray-500',   order: 4 },
};

/**
 * Normalizes workflow status strings for consistency across clinical and operational modules.
 * Ensures the status reflects the standardized DB model (MODEL_DB_FB).
 */
export function normalizeWorkflowStatusInput(status: string): string {
  if (!status) return "";
  
  const s = status.trim().toUpperCase();
  
  // Mapping for common variants to ensure standardization
  const mapping: Record<string, string> = {
    "DONE": "CLOSED",
    "FINISHED": "CLOSED",
    "PROSES": "ON PROCESS",
    "PENGERJAAN": "ON PROCESS",
    "PROCESS": "ON PROCESS",
    "REVISI": "HOLD",
    "PENDING": "HOLD",
  };
  
  return mapping[s] || s;
}

export type WorkflowBucket = 'review' | 'process' | 'hold' | 'closed';

/**
 * Classifies various status strings into a unified set of buckets for dashboard stats.
 */
export function classifyWorkflowStatus(status: string | unknown, subStatus?: string | unknown): WorkflowBucket {
  const s = String(status || "").toUpperCase();
  const sub = String(subStatus || "").toUpperCase();

  if (s === 'CLOSED' || s === 'DONE' || sub === 'DONE' || sub === 'CLOSED') return 'closed';
  if (s === 'HOLD' || s === 'REJECT' || sub === 'HOLD' || sub === 'REJECT') return 'hold';
  if (s === 'REVIEW' || s === 'ASSIGNED' || s === 'BLUEPRINT' || sub === 'REVIEW' || sub === 'BLUEPRINT') return 'review';
  
  return 'process';
}

export type JopType = 'LOCAL' | 'EXPORT' | 'JASA' | 'SMS' | 'KARTON_BOX';
export type JosType = 'LOCAL' | 'EXPORT' | 'JASA';

/**
 * Detects JOP type based on number prefix or explicit field.
 */
export function detectJopType(idOrType: string | unknown): JopType {
  const val = String(idOrType || "").toUpperCase();
  if (val === 'JASA' || val.startsWith('7B')) return 'JASA';
  if (val === 'SMS' || val.startsWith('79')) return 'SMS';
  if (val === 'KARTON_BOX' || val.startsWith('9')) return 'KARTON_BOX';
  if (val === 'EXPORT' || val.startsWith('8')) return 'EXPORT';
  return 'LOCAL';
}

/**
 * Detects JOS type based on explicit field.
 */
export function detectJosType(type: string | unknown): JosType {
  const val = String(type || "").toUpperCase();
  if (val === 'JASA') return 'JASA';
  if (val === 'EXPORT') return 'EXPORT';
  return 'LOCAL';
}

export const WORKFLOW_STATUSES = [
  "REVIEW",
  "ASSIGNED",
  "ON PROCESS",
  "BLUEPRINT",
  "ACC",
  "CLOSED",
  "CANCEL",
  "REJECT",
  "HOLD"
] as const;

export type WorkflowStatus = typeof WORKFLOW_STATUSES[number];

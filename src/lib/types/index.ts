/**
 * types/index.ts — CANONICAL TYPE DEFINITIONS
 * Prepress Platinum — Clean Slate v2
 *
 * Field naming convention: Indonesian (existing) field names preserved.
 * All new fields use snake_case or SCREAMING_SNAKE to match existing style.
 */

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW STATUS — canonical enum
// ─────────────────────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'WAITING'
  | 'IN_PROGRESS'
  | 'REVISION'
  | 'CHECKING'
  | 'APPROVED'
  | 'OUTPUT'
  | 'DONE'
  | 'HOLD';

export type WorkflowBucket = 'closed' | 'review' | 'process' | 'hold' | 'waiting';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';

export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type RevisionLabel = 'R0' | 'R1' | 'R2' | 'R3' | 'FINAL';

// ─────────────────────────────────────────────────────────────────────────────
// JOB TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type JopType = 'EXPORT' | 'JASA' | 'LOCAL' | 'SMS' | 'KARTON_BOX';
export type JosType = 'EXPORT' | 'JASA' | 'LOCAL' | 'ALL';
export type JosTypeFilter = 'ALL' | 'EXPORT' | 'JASA' | 'LOCAL';
export type JopTypeFilter = 'ALL' | 'EXPORT' | 'JASA' | 'LOCAL' | 'SMS' | 'KARTON_BOX';

// ─────────────────────────────────────────────────────────────────────────────
// DEPARTMENT
// ─────────────────────────────────────────────────────────────────────────────

export type Department =
  | 'DG'
  | 'DT'
  | 'SD'
  | 'GMG'
  | 'CNC'
  | 'BLUEPRINT'
  | 'QC'
  | 'QC-DG'
  | 'QC-DT'
  | 'CTP'
  | 'CTCP'
  | 'FLEXO'
  | 'ETCHING'
  | 'SCREEN'
  | 'PREPRESS';

export type SourceType =
  | 'DT'
  | 'DG'
  | 'CTP'
  | 'CTCP'
  | 'FLEXO'
  | 'SCREEN'
  | 'ETCHING'
  | 'GMG'
  | 'CNC'
  | 'BLUEPRINT'
  | 'QC'
  | 'PROD'
  | 'SUPPORT';

// ─────────────────────────────────────────────────────────────────────────────
// ROLE / USER
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole =
  | 'ADMIN'
  | 'DEVELOPER'
  | 'MANAGER'
  | 'ADMIN DT'
  | 'ADMIN DG'
  | 'ADMIN PREPRESS'
  | 'DT'
  | 'DG'
  | 'DS'
  | 'CAD'
  | 'SPV DT'
  | 'SPV DG'
  | 'SPV PREPRESS'
  | 'KOORDINATOR'
  | 'PRODUCTION'
  | 'OP CTP'
  | 'OP CTCP'
  | 'OP FLEXO'
  | 'OP SCREEN'
  | 'OP ETCHING'
  | 'QC'
  | 'QC INSPECTOR'
  | 'SUPPORT DESIGN'
  | 'GMG'
  | 'CNC'
  | 'BLUEPRINT'
  | 'UMUM'
  | 'GUEST';

export interface UserData {
  uid: string;
  NAMA: string;
  displayName?: string;
  email: string;
  KATEGORI: UserRole;
  role?: string;
  dept?: Department;
  permissions?: string[];
  ACTIVE: boolean;
  active?: boolean;
  LAST_LOGIN?: string;
  updated_at?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOP — Design Technical workflow document (workflows_jop collection)
// ─────────────────────────────────────────────────────────────────────────────

export interface JopDocument {
  id: string;
  // Core identifiers
  NO_JOP: string;
  NAMA_JOP: string;
  TIPE_JOP: JopType;
  BUYER: string;

  // Dates
  TGL_MASUK_JOP: string;     // ISO date string YYYY-MM-DD
  TGL_JOP: string;
  TGL_TARGET: string;

  // People
  PIC_UTAMA: string;         // operator uid or name
  PIC_SUPPORT?: string;
  OPERATOR?: string;
  QC_USER?: string;
  LAST_UPDATED_BY?: string;

  // Workflow status (canonical)
  ST_WF_JOP: WorkflowStatus;
  ST_PRO_JOP?: string;       // production status (prepress side)

  // New v2 fields
  priority: Priority;
  approvalStatus: ApprovalStatus;
  revisionCount: number;
  currentRevision: RevisionLabel;
  holdStart: number | null;    // epoch ms, null when not on hold
  holdDuration: number;        // accumulated ms on hold
  activeDuration: number;      // accumulated ms in active work
  lastStatusChange: number;    // epoch ms of last status transition

  // Checklist (prepress output gate)
  checklist?: PrepressChecklist;

  // Search
  searchTerms: string[];       // lowercase tokens for prefix search

  // Metadata
  notes?: string;
  tags?: string[];             // max 5
  LAST_UPDATED: number;        // epoch ms
  createdAt: number;           // epoch ms
}

// ─────────────────────────────────────────────────────────────────────────────
// JOS — Design Graphic workflow document (workflows_jos collection)
// ─────────────────────────────────────────────────────────────────────────────

export interface JosDocument {
  id: string;
  NO_JOS: string;
  NAMA_JOS: string;
  TIPE_JOS: JosType;
  BUYER: string;

  TGL_MASUK_JOS: string;
  TGL_JOS: string;
  TGL_TARGET: string;

  DESIGNER: string;            // primary operator
  PIC_SUPPORT?: string;
  QC_USER?: string;
  LAST_UPDATED_BY?: string;

  ST_WF_JOS: WorkflowStatus;
  ST_PRO_JOS?: string;

  priority: Priority;
  approvalStatus: ApprovalStatus;
  revisionCount: number;
  currentRevision: RevisionLabel;
  holdStart: number | null;
  holdDuration: number;
  activeDuration: number;
  lastStatusChange: number;

  searchTerms: string[];
  notes?: string;
  tags?: string[];
  LAST_UPDATED: number;
  createdAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// REVISION — revisions collection
// ─────────────────────────────────────────────────────────────────────────────

export interface RevisionDocument {
  id?: string;
  jobId: string;
  jobType: 'JOP' | 'JOS';
  revisionNumber: RevisionLabel;
  changedBy: string;           // uid
  changedByName: string;       // denormalized display name
  reason: string;
  notes?: string;
  fileVersion?: string;
  changedAt: number;           // epoch ms
}

// ─────────────────────────────────────────────────────────────────────────────
// APPROVAL — approvals collection
// ─────────────────────────────────────────────────────────────────────────────

export type ApprovalStep = 'DESIGNER' | 'SPV' | 'OUTPUT';

export interface ApprovalDocument {
  id?: string;
  jobId: string;
  jobType: 'JOP' | 'JOS';
  step: ApprovalStep;
  status: ApprovalStatus;
  approvedBy?: string;         // uid
  approvedByName?: string;     // denormalized
  approvedAt?: number;
  rejectedReason?: string;
  createdAt: number;
  createdBy: string;           // uid who submitted for approval
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPT SUMMARY — dept_summary collection (pre-aggregated counters)
// ─────────────────────────────────────────────────────────────────────────────

export interface DeptSummary {
  dept: Department;
  waiting: number;
  inProgress: number;
  revision: number;
  checking: number;
  approved: number;
  output: number;
  done: number;
  hold: number;
  overdue: number;
  urgent: number;
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY KPI — daily_kpi collection
// ─────────────────────────────────────────────────────────────────────────────

export interface DailyKPI {
  id?: string;                 // format: YYYY-MM-DD_uid
  date: string;                // YYYY-MM-DD
  uid: string;
  displayName: string;         // denormalized
  dept: Department;
  completedJobs: number;
  overdueJobs: number;
  revisionJobs: number;
  activeJobs: number;
  approvalCount: number;
  avgActiveDuration: number;   // ms, excludes hold
  holdTime: number;            // ms, tracked separately — NOT in KPI score
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREPRESS CHECKLIST
// ─────────────────────────────────────────────────────────────────────────────

export interface PrepressChecklist {
  bleedChecked: boolean;
  overprintChecked: boolean;
  dpiChecked: boolean;
  barcodeChecked: boolean;
  trappingChecked: boolean;
  profileChecked: boolean;
  fontChecked: boolean;
  checkedBy?: string;          // uid
  checkedAt?: number;
  colorProfile?: 'FOGRA51' | 'FOGRA52';
  printMethod?: string;
  paperType?: string;
}

export const CHECKLIST_FIELDS = [
  'bleedChecked',
  'overprintChecked',
  'dpiChecked',
  'barcodeChecked',
  'trappingChecked',
  'profileChecked',
  'fontChecked',
] as const;

export type ChecklistField = typeof CHECKLIST_FIELDS[number];

export function isChecklistComplete(c: Partial<PrepressChecklist>): boolean {
  return CHECKLIST_FIELDS.every((f) => c[f] === true);
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG — audit_logs collection
// ─────────────────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'status_change'
  | 'revision'
  | 'hold_start'
  | 'hold_end'
  | 'output'
  | 'export_pdf';

export type AuditEntityType =
  | 'workflows_jos'
  | 'workflows_jop'
  | 'proses_jod'
  | 'proses_b'
  | 'revisions'
  | 'approvals'
  | 'T_USERS'
  | 'dashboard';

export interface AuditLogEntry {
  id?: string;
  actor_uid: string;
  actor_name?: string;         // denormalized
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION — RTDB notifications/{uid}/{id}
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationData {
  id?: string;
  message: string;
  read: boolean;
  entity_type: 'JOS' | 'JOP' | 'JOD' | 'NO_B' | 'SYSTEM';
  entity_id: string;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD — unified item for UI rendering
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardItem extends Record<string, unknown> {
  id: string;
  sourceType: SourceType;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER / SEARCH STATE
// ─────────────────────────────────────────────────────────────────────────────

export interface FilterState {
  status: WorkflowStatus | 'ALL';
  priority: Priority | 'ALL';
  dept: Department | 'ALL';
  jopType: JopTypeFilter;
  josType: JosTypeFilter;
  search: string;
  dateRange: DateRange | null;
}

export interface DateRange {
  start: string;   // YYYY-MM-DD
  end: string;     // YYYY-MM-DD
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CALCULATION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface OperatorWorkload {
  operator_uid: string;
  operator_name: string;
  department: Department;
  count_main: number;
  count_support: number;
  count_closed: number;
  updated_at: number;
}

export interface ProductivityDataPoint {
  name: string;
  tcUtama: number;
  tcSupport: number;
}

export interface TrendDataPoint {
  name: string;
  jop: number;
  jos?: number;
}

export interface WorkflowStatusCounts {
  total: number;
  waiting: number;
  inProgress: number;
  revision: number;
  checking: number;
  approved: number;
  output: number;
  done: number;
  hold: number;
  overdue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOLD TIMER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get active work duration in ms, excluding hold time.
 * If currently IN_PROGRESS, adds time since lastStatusChange.
 */
export function getActiveDuration(job: Pick<JopDocument | JosDocument,
  'activeDuration' | 'holdDuration' | 'lastStatusChange'> & { ST_WF_JOP?: WorkflowStatus; ST_WF_JOS?: WorkflowStatus }
): number {
  const status = job.ST_WF_JOP ?? job.ST_WF_JOS;
  const base = job.activeDuration || 0;
  if (status === 'IN_PROGRESS') {
    return base + (Date.now() - (job.lastStatusChange || Date.now()));
  }
  return base;
}

/**
 * Check if a job is overdue based on active duration only (hold excluded).
 */
export function isJobOverdue(
  deadline: string,
  createdAt: number,
  activeDuration: number
): boolean {
  const deadlineMs = new Date(deadline).getTime();
  const activeEnd = createdAt + activeDuration;
  return activeEnd > deadlineMs;
}

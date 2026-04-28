export interface DashboardItem extends Record<string, unknown> {
  id: string;
  sourceType: 'DT' | 'DG' | 'PROD' | 'SUPPORT';
}

export interface UserData {
  uid: string;
  NAMA: string;
  email: string;
  KATEGORI: string;
  role?: string;
  permissions?: string[];
  active?: boolean;
  updated_at?: number;
}

export interface AuditLogEntry {
  id?: string;
  actor_uid: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'export_pdf';
  entity_type: 'workflows_jos' | 'workflows_jop' | 'proses_jod' | 'proses_b' | 'T_USERS' | 'dashboard';
  entity_id: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface NotificationData {
  id?: string;
  message: string;
  read: boolean;
  entity_type: 'JOS' | 'JOP' | 'JOD' | 'NO_B' | 'SYSTEM';
  entity_id: string;
  timestamp: number;
}

export interface DailyStats {
  date: string;
  jop_closed: number;
  jop_export: number;
  jop_jasa: number;
  jop_local: number;
  jop_on_process: number;
  jop_hold: number;
  jop_overdue: number;
  jop_on_time: number;
}

export interface OperatorWorkload {
  operator_uid: string;
  operator_name: string;
  department: 'DG' | 'DT' | 'PREPRESS';
  count_main: number;
  count_support: number;
  count_closed: number;
  updated_at: number;
}

export interface WorkflowStatusCounts {
  total: number;
  closed: number;
  blueprint: number;
  process: number;
  hold: number;
}

export interface ProductivityDataPoint {
  name: string;
  tcUtama: number;
  tcSupport: number;
}

export interface TrendDataPoint {
  name: string;
  jop: number;
}

export type JosTypeFilter = 'ALL' | 'EXPORT' | 'JASA' | 'LOCAL';
export type JopTypeFilter = 'ALL' | 'EXPORT' | 'JASA' | 'LOCAL' | 'SMS' | 'KARTON_BOX';

export interface DateRange {
  start: string;
  end: string;
}

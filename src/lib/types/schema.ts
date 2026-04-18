export interface WorkflowJop extends Record<string, unknown> {
  id: string;
  ST_WORKFLOW: string;
  NO_JOP: string;
  TIPE_JOP: string;
  BUYER: string;
  NAMA_JOP: string;
  PIC_UTAMA: string;
  TGL_TARGET: string;
  timestamp_input?: any;
}

export interface KanbanItem extends Record<string, unknown> {
  id: string;
  id_jop?: string;
  NO_JOP?: string;
  NO_JOS?: string;
  BUYER?: string;
  status?: string;
  status_dg?: string;
  status_dt?: string;
  status_workflow?: string;
  ST_WORKFLOW?: string;
  ST_PRO_JOP?: string;
  PIC_UTAMA?: string;
  TOTAL_TC?: number;
  LEVEL_TC?: string;
}

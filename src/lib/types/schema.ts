export interface WorkflowJos {
  id: string; // NO_JOS
  tipe_jos: "Jasa" | "Local" | "Export";
  tgl_terima: string;
  tgl_target: string;
  buyer: string;
  jml_warna: number;
  jml_design: number;
  jenis_bahan: string;
  status: "On Progress" | "Hold" | "Overdue" | "Done";
  timestamp_input: number;
  operator_id: string;
}

export interface WorkflowJop {
  id: string; // NO_JOP
  no_jos?: string[]; // FK to JOS
  tipe_jop: string; // Auto generated
  tgl_terima: string;
  tgl_target: string;
  buyer: string;
  produk: string;
  baru_relayout: "Baru" | "Relayout";
  status: "Pending" | "On Process" | "Closed" | "Overdue" | "Hold" | "CANCEL" | "BATAL LAYOUT";
  timestamp_input: number;
  operator_id: string;
  // Added fields from DB schema
  ST_WORKFLOW?: string;
  NO_JOP?: string;
  BUYER?: string;
  NAMA_JOP?: string;
  PIC_UTAMA?: string;
}

export interface ProsesJod {
  id: string; // NO_JOD
  no_jos: string;
  status_dg: "Prosess" | "Preview" | "Revisi" | "Selesai";
  status_qc: "Approved" | "Reject" | "Pending";
  pic_utama: string;
  pic_support: string;
  catatan_spv: string;
  catatan_dg: string;
  catatan_qc: string;
  timestamp_input: number;
  operator_id: string;
}

export interface ProsesDtB {
  id: string; // Auto ID
  no_b: string;
  no_jop: string;
  status_dt: "Prosess" | "Blueprint" | "Revisi" | "Selesai";
  status_cad: "Prosess" | "Revisi" | "Selesai";
  pic_utama: string;
  pic_support: string;
  catatan_dt: string;
  catatan_cad: string;
  timestamp_input: number;
  operator_id: string;
}

export interface ProsesPrepressB {
  id: string; // Auto ID
  no_b: string;
  no_jop: string;
  status_b: "Baru" | "Ganti";
  proses_pengerjaan: "CTP" | "CTCP" | "FLEXO" | "ETCHING" | "SCREEN";
  status_prepress: "Baik" | "Rusak" | "Ganti";
  tahapan_prepress: "RIP" | "Expose & Drying" | "QC" | "Selesai";
  mesin_id?: string;
  catatan_prepress: string;
  timestamp_input: number;
  operator_id: string;
}

export interface AppUser {
  ID_USER: string;
  KATEGORI: string;
  PANEL_VIEW: string;
  PASS: string;
  PIC_CODE: string;
  TIPE_VIEW: string;
  UPDATED_AT: number | string | Date;
  USER: string;
}

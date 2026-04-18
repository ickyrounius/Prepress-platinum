export interface JopData {
  // Identification
  ID?: string;
  ID_NO_JOP?: string;
  NO_JOP: string;
  TIPE_JOP: string;
  BUYER: string;
  NAMA_JOP: string;
  
  // Workflow Dates
  TGL_MASUK?: string;
  TGL_MASUK_JOP?: string;
  TGL_JOP: string;  
  TGL_TARGET?: string;
  TGL_TARGET_JOP?: string;
  TGL_SELESAI_JOP?: string;
  
  // Status & Services
  ST_WORKFLOW?: string;
  ST_WF_JOP?: string;
  ST_PRO_JOP?: string;
  ST_JOP_SERVICE?: string;
  ST_NO_B_SERVICE?: string;
  ST_PRO_NO_B?: string;
  
  // Team
<<<<<<< HEAD
  FASE_DT?: string;
=======
  FAASE_DT?: string;
>>>>>>> 06b91674e4f53ac844b5d9b4e1edf5ceba6c6fac
  PIC_UTAMA?: string;
  PIC_SUPPORT?: string;
  
  // Child / Block Data (NO B)
  ID_NO_B?: string;
  NO_B?: string;
  NAMA_FILE?: string;
  NO_JOS?: string;
  
  // TC & Complexity
  KT?: number;
  RP?: number;
  BS?: number;
  CAD?: number;
  LA?: number;
  DP?: number;
  TOTAL_TC?: number;
  LEVEL_TC?: string;
  TC_UTAMA?: number;
  TC_SUPPORT?: number;
  
  // Process Details
  TGL_MULAI_B?: string;
  TGL_BLUEPRINT?: string;
  TGL_ACC_B?: string;
  TGL_QC_CHECK?: string;
  TGL_SELESAI_B?: string;
  
  // KPI Metrics
  LEAD_TIME?: number;
  CYCLE_TIME?: number;
  WAITING_TIME?: number;
  DELAY_TIME?: number;
  
  // Archival info
  HOLD_REASON?: string;
  TINDAKAN_KOREKTIF?: string;
  REVISI_KE?: number;
  
  // Metadata
  LAST_UPDATED?: unknown;
  
  // Legacy support / generic
  [key: string]: unknown;
}

export interface JosData {
  ID?: string;
  ID_NO_JOS?: string;
  NO_JOS: string;
  TIPE_JOS: string;
  BUYER: string;
  JENIS_PRODUK?: string;
  NAMA_PRODUK?: string;
  TGL_MASUK?: string;
  TGL_MASUK_JOS?: string;
  TGL_JOS: string;
  TGL_TARGET?: string;
  TGL_TARGET_JOS?: string;
  TGL_MULAI_JOS?: string;
  TGL_SELESAI_JOS?: string;
  ST_WORKFLOW?: string;
  ST_WF_JOS?: string;
  ST_DG_SERVICE?: string;
  DESIGNER?: string;
  
  // Technical Data
  ID_NO_JOD?: string;
  NO_JOD?: string;
  NAMA_DESIGN?: string;
  JUMLAH_DESIGN?: number;
  JUMLAH_WARNA?: number;
  
  // Complexity
  KT?: number;
  RP?: number;
  BS?: number;
  CAD?: number;
  DP?: number;
  LA?: number;
  TOTAL_TC?: number;
  LEVEL_TC?: string;
  
  // Timeline/Status
  ST_PRO_JOS?: string;
  TGL_PREVIEW?: string;
  TGL_ACC?: string;
  TGL_QC_CHECK?: string;
  
  // KPI
  LEAD_TIME?: number;
  CYCLE_TIME?: number;
  WAITING_TIME?: number;
  DELAY_TIME?: number;
  
  // Feedback
  [key: string]: unknown;
}

export interface BlueprintLog {
  ID?: string;
  NO_JOP: string;
  NO_B: string;
  TGL_LOG: string;
  OPERATOR: string;
  STATUS: string;
  CATATAN?: string;
  [key: string]: unknown;
}

export interface QCLog {
  ID?: string;
  NO_JOP: string;
  NO_B: string;
  TGL_LOG: string;
  CHECKER: string;
  STATUS_QC: string;
  CATATAN_QC?: string;
  [key: string]: unknown;
}

export interface UserLock {
  activeUser: {
    uid: string;
    displayName: string;
    email?: string;
    photoURL?: string;
  };
  timestamp: number;
}

export interface PlateData {
  ID: string; // ID_CTP or ID_CTCP
  JOP_NAME: string;
  NO_JOP: string;
  NO_PLATE?: string;
  DATE: string;
  SHIFT: string;
  MESIN_EXPOSE?: string;
  UKURAN_PLATE: string;
  MESIN: string;
  PLATE_BARU?: number;
  PLATE_GANTI?: number;
  PLATE_BAIK?: number;
  PLATE_RUSAK?: number;
  PENYEBAB_GANTI?: string;
  PERMINTAAN_KHUSUS?: string;
  PENYEBAB_RUSAK?: string;
  JENIS_KERTAS?: string;
  NAMA_OPPath?: string;
  NAMA_OP: string;
  NAMA_PO?: string;
  [key: string]: unknown;
}

export interface FlexoData {
  ID_FLEXO: string;
  JOP_NAME: string;
  NO_JOP: string;
  NO_B: string;
  STATUS: string;
  DATE: string;
  DESCRIPTION?: string;
  LPI?: string;
  TEBAL_FLEXO?: string;
  KETERANGAN?: string;
  SHIFT: string;
  BAGUS_WARNA?: number;
  RUSAK_WARNA?: number;
  GANTI_WARNA?: number;
  PENYEBAB_RUSAK?: string;
  PENYEBAB_GANTI?: string;
  LUASAN_FLEXO?: number;
  KET_OP?: string;
  NAMA_OP: string;
  NAMA_PO: string;
  // Stock/Process
  PERLEMBAR?: number;
  MASUK?: number;
  KELUAR_BARU?: number;
  GANTI?: number;
  SISA?: number;
  HDI?: string;
  MAIN_EXPOSE?: string;
  WASHING?: string;
  DRYING?: string;
  SELESAI?: string;
  [key: string]: unknown;
}

export interface EtchingData {
  ID_ETCHING: string;
  NO_JOP: string;
  NO_B: string;
  TIPE: string;
  STATUS: string;
  DATE: string;
  DESCRIPTION?: string;
  TEBAL_PLATE?: string;
  KETERANGAN?: string;
  SHIFT: string;
  PLATE_BAIK?: number;
  PLATE_RUSAK?: number;
  PLATE_GANTI?: number;
  PENYEBAB_RUSAK?: string;
  PENYEBAB_GANTI?: string;
  NAMA_OP: string;
  NAMA_PO: string;
  PERPCS?: number;
  AMBIL_PLATE_BARU_1?: number;
  UK_PEMAKAIAN_BARU_1?: string;
  TAMBAH_PLATE_1?: number;
  AMBIL_PLATE_BARU_2?: number;
  UK_PEMAKAIAN_BARU_2?: string;
  TAMBAH_PLATE_2?: number;
  SISA?: number;
  FILE_FILM?: string;
  EXPOSE?: string;
  WASHING?: string;
  GERINDA?: string;
  SELESAI?: string;
  [key: string]: unknown;
}

export interface ScreenData {
  ID: string;
  JOP_NAME: string;
  NO_JOP: string;
  NO_B: string;
  TIPE: string;
  STATUS: string;
  DATE: string;
  DESCRIPTION?: string;
  MESH_SCREEN?: string;
  KETERANGAN?: string;
  SHIFT: string;
  BAGUS?: number;
  RUSAK?: number;
  GANTI?: number;
  PENYEBAB_RUSAK?: string;
  PENYEBAB_GANTI?: string;
  NAMA_OP: string;
  HAPUS_SCREEN?: string;
  LAYOUT?: string;
  POLES?: string;
  EXPOSE?: string;
  KERASKAN?: string;
  SELESAI?: string;
  [key: string]: unknown;
}

/**
 * schema.ts — Utility untuk pembuatan ID Unik terstandarisasi
 *
 * Format: "DEPT"-YYMMDD-XXXX
 * Contoh: "DT-260423-0472", "DG-260423-8812", "PP-260423-3301"
 *
 * Digunakan oleh semua service (jobService, josService, dll.)
 * agar format ID konsisten di seluruh kodebase.
 */

/**
 * Membuat ID unik dengan format: DEPT-YYMMDD-XXXX
 * @param dept  Kode departemen, mis. "DT", "DG", "PP", "QC", "SD"
 * @returns     ID string unik
 * @example     generateUniqueId("DT") → "DT-260423-4872"
 */
export function generateUniqueId(dept: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  const deptCode = dept.toUpperCase().replace(/\s+/g, "").slice(0, 6);
  return `${deptCode}-${yy}${mm}${dd}-${rand}`;
}

/**
 * Peta kode departemen standar yang dipakai dalam ID
 */
export const DEPT_CODES = {
  DT:         "DT",   // Design Teknis / JOP
  DG:         "DG",   // Desain Grafis / JOS
  PREPRESS:   "PP",   // Prepress
  QC:         "QC",   // Quality Control
  SUPPORT:    "SD",   // Support Design
  ADMIN:      "ADM",  // Admin entry
} as const;

/**
 * Peta kode mesin spesifik di departemen Prepress
 */
export const MACHINE_CODES = {
  CTP:        "CTP",
  CTCP:       "CTCP",
  FLEXO:      "FLX",
  SCREEN:     "SCR",
  ETCHING:    "ETC",
} as const;

/**
 * Peta kode untuk Support Department
 */
export const SUPPORT_CODES = {
  GMG:        "GMG",
  CNC:        "CNC",
  BLUEPRINT:  "BPR",
} as const;

export type DeptCode = keyof typeof DEPT_CODES;
export type MachineCode = keyof typeof MACHINE_CODES;
export type SupportCode = keyof typeof SUPPORT_CODES;

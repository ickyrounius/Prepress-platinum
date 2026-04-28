/**
 * calculations.ts — SINGLE SOURCE OF TRUTH untuk semua logika perhitungan
 *
 * File ini adalah kanonikal untuk:
 *   - LA  (Level Aktifitas / revisi weight)
 *   - DP  (Deadline Pressure score)
 *   - TC  (Total Complexity score) — simple & weighted
 *   - Level TC string (RINGAN, STANDARD, ADVANCED, COMPLEX, CRITICAL)
 *   - TC Split (pembagian antara PIC Utama & Support)
 *
 * Semua modul lain (calculateKPI.ts, kpiStyles.ts, spv/page.tsx, dll.)
 * harus mengimpor dari sini. JANGAN duplikasi logika ini di tempat lain.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TC Formula Config (weighted multipliers — dari legacy tcFormula.ts)
// ─────────────────────────────────────────────────────────────────────────────

export interface TCFormulaConfig {
  kt: number;
  rp: number;
  bs: number;
  cad: number;
  la: number;
  dp: number;
}

export const DEFAULT_TC_FORMULA: TCFormulaConfig = {
  kt: 1,
  rp: 1,
  bs: 1,
  cad: 1,
  la: 1,
  dp: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Output interface untuk KPI results
// ─────────────────────────────────────────────────────────────────────────────

export interface CalculationResult {
  LA: number;
  DP: number;
  TOTAL_TC: number;
  LEVEL_TC: string;
  TC_UTAMA: number;
  TC_SUPPORT: number;
  WAITING_TIME: number;
  LEAD_TIME: number;
  CYCLE_TIME: number;
  DELAY_TIME: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — bisa diimpor secara individual oleh modul lain
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hitung skor LA (Level Aktifitas) berdasarkan jumlah revisi.
 * LA = revisiKe + 1, maksimum 5.
 */
export function calcLA(revisiKe: number | undefined | null): number {
  const revisi = typeof revisiKe === "number" ? revisiKe : (parseInt(String(revisiKe ?? "0")) || 0);
  return Math.min(revisi + 1, 5);
}

/**
 * Hitung skor DP (Deadline Pressure) dari selisih hari masuk vs target.
 * ≤1 hari → 5, 2 → 4, 3 → 3, 4 → 2, ≥5 → 1
 */
export function calcDP(ingressDate: unknown, targetDate: unknown): number {
  if (!ingressDate || !targetDate) return 1;
  const t1 = new Date(String(ingressDate));
  const t2 = new Date(String(targetDate));
  if (isNaN(t1.getTime()) || isNaN(t2.getTime())) return 1;
  const diffDays = Math.ceil((t2.getTime() - t1.getTime()) / 86_400_000);
  if (diffDays <= 1) return 5;
  if (diffDays === 2) return 4;
  if (diffDays === 3) return 3;
  if (diffDays === 4) return 2;
  return 1;
}

/**
 * Hitung skor DP dari targetDate vs startDate (atau sekarang jika tidak disediakan).
 * Alias yang lebih eksplisit — digunakan oleh SPV Panel.
 */
export function calcDeadlinePressure(targetDateValue: unknown, startDateValue?: unknown): number {
  const targetDate = parseDateInput(targetDateValue);
  if (!targetDate) return 1;
  const startDate = parseDateInput(startDateValue) || new Date();
  const diffDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / 86_400_000);
  if (diffDays <= 1) return 5;
  if (diffDays === 2) return 4;
  if (diffDays === 3) return 3;
  if (diffDays === 4) return 2;
  return 1;
}

/** Parse date input safely. */
function parseDateInput(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Hitung nilai TOTAL_TC dari komponen raw + LA + DP (simple sum, no weights).
 */
export function calcTotalTC(
  kt: number, rp: number, bs: number, cad: number,
  la: number, dp: number
): number {
  return Math.floor(kt + rp + bs + cad + la + dp);
}

/**
 * Hitung nilai TOTAL_TC dengan weighted multiplier dari TCFormulaConfig.
 * Digunakan oleh SPV Panel untuk kalkulasi dengan bobot konfigurasi.
 */
export function calcWeightedTotalTC(
  values: { kt: number; rp: number; bs: number; cad: number },
  laValue: number,
  dpValue: number,
  formula: TCFormulaConfig
): number {
  const total =
    values.kt * formula.kt +
    values.rp * formula.rp +
    values.bs * formula.bs +
    values.cad * formula.cad +
    laValue * formula.la +
    dpValue * formula.dp;
  return Number(total.toFixed(2));
}

/**
 * Konversi nilai TOTAL_TC ke label level string.
 * Thresholds: ≤8 RINGAN, ≤13 STANDARD, ≤18 ADVANCED, ≤23 COMPLEX, >23 CRITICAL
 */
export function calcLevelTC(totalTC: number): string {
  if (totalTC <= 8)  return "RINGAN";
  if (totalTC <= 13) return "STANDARD";
  if (totalTC <= 18) return "ADVANCED";
  if (totalTC <= 23) return "COMPLEX";
  return "CRITICAL";
}

/**
 * Hitung pembagian TC antara PIC Utama dan Support berdasarkan FASE_DT.
 * Jika tidak ada support, TC_UTAMA = TOTAL_TC, TC_SUPPORT = 0.
 */
export function calcTCSplit(
  totalTC: number,
  picSupport: string | undefined | null,
  faseDT: string | undefined | null
): { tcUtama: number; tcSupport: number } {
  const hasSupport = !!(picSupport && picSupport !== "-" && picSupport !== "");
  if (!hasSupport) return { tcUtama: totalTC, tcSupport: 0 };

  const fase = String(faseDT || "").toUpperCase();
  if (fase === "FULL")     return { tcUtama: Math.round(totalTC * 0.7), tcSupport: Math.round(totalTC * 0.3) };
  if (fase === "LAYOUT")   return { tcUtama: totalTC, tcSupport: totalTC };
  if (fase === "FILE_CAD") return { tcUtama: Math.round(totalTC * 0.3), tcSupport: Math.round(totalTC * 0.7) };
  // Default split (PARTIAL atau tidak diisi)
  return { tcUtama: Math.round(totalTC * 0.7), tcSupport: Math.round(totalTC * 0.3) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Backward-compatible aliases (menggantikan tcFormula.ts yang sudah dihapus)
// ─────────────────────────────────────────────────────────────────────────────

/** Alias for calcDeadlinePressure — digunakan oleh panel DT & DG. */
export const calculateDeadlinePressureScore = calcDeadlinePressure;

/** Alias for calcWeightedTotalTC — digunakan oleh panel DT & DG. */
export function calculateTotalTc(
  values: { kt: number; rp: number; bs: number; cad: number },
  laValue: number,
  dpValue: number,
  formula: TCFormulaConfig
): number {
  return calcWeightedTotalTC(values, laValue, dpValue, formula);
}

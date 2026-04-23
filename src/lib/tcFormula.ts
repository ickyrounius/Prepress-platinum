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

export function calculateTotalTc(
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

function parseDateInput(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

// Rule adapted from legacy DASHBOARD_DT:
// <=1 day:5, 2:4, 3:3, 4:2, >=5:1
export function calculateDeadlinePressureScore(targetDateValue: unknown, startDateValue?: unknown): number {
  const targetDate = parseDateInput(targetDateValue);
  if (!targetDate) return 1;

  const startDate = parseDateInput(startDateValue) || new Date();
  const diffDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 5;
  if (diffDays === 2) return 4;
  if (diffDays === 3) return 3;
  if (diffDays === 4) return 2;
  return 1;
}

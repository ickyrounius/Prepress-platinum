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
  dp: 1
};

export function calculateDeadlinePressureScore(targetDate: string | undefined, ingressDate: string | undefined): number {
  if (!ingressDate || !targetDate) return 1;
  const t1 = new Date(ingressDate).getTime();
  const t2 = new Date(targetDate).getTime();
  if (isNaN(t1) || isNaN(t2)) return 1;
  
  const diffDays = Math.ceil((t2 - t1) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 5;
  if (diffDays === 2) return 4;
  if (diffDays === 3) return 3;
  if (diffDays === 4) return 2;
  return 1;
}

export function calculateTotalTc(
  values: { kt: number; rp: number; bs: number; cad: number },
  la: number,
  dp: number,
  config: TCFormulaConfig = DEFAULT_TC_FORMULA
): number {
  return Math.floor(
    (values.kt * config.kt) +
    (values.rp * config.rp) +
    (values.bs * config.bs) +
    (values.cad * config.cad) +
    (la * config.la) +
    (dp * config.dp)
  );
}

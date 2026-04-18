export interface JobData {
  TGL_MASUK?: string;
  TGL_TARGET?: string;
  TGL_MULAI?: string;
  TGL_SELESAI?: string;
  ST_PRO_JOP?: string;
  ST_WORKFLOW?: string;
  REVISI_KE?: number;
  KT?: number;
  RP?: number;
  BS?: number;
  CAD?: number;
  PIC_SUPPORT?: string;
  FASE_DT?: string;
}

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

/**
 * Konversi logika runAutoCalculation() dari Kode.gs ke lingkungan Typescript.
 * Memproses poin TC (Target Calculation) dan metrik Waktu (Time Metrics).
 */
export function calculateJobMetrics(item: JobData): CalculationResult {
  const revisi = item.REVISI_KE || 0;
  // LA max is 5
  const laValue = Math.min(revisi + 1, 5);
  let dpValue = 1;

  if (item.TGL_MASUK && item.TGL_TARGET) {
    const t1 = new Date(item.TGL_MASUK).getTime();
    const t2 = new Date(item.TGL_TARGET).getTime();
    if (!isNaN(t1) && !isNaN(t2)) {
      const diffDays = Math.ceil((t2 - t1) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) dpValue = 5;
      else if (diffDays === 2) dpValue = 4;
      else if (diffDays === 3) dpValue = 3;
      else if (diffDays === 4) dpValue = 2;
      else dpValue = 1;
    }
  }

  const totalTC = Math.floor(
    (item.KT || 0) +
    (item.RP || 0) +
    (item.BS || 0) +
    (item.CAD || 0) +
    laValue +
    dpValue
  );

  let levelTC = "RINGAN";
  if (totalTC > 8 && totalTC <= 13) levelTC = "STANDARD";
  else if (totalTC > 13 && totalTC <= 18) levelTC = "ADVANCED";
  else if (totalTC > 18 && totalTC <= 23) levelTC = "COMPLEX";
  else if (totalTC > 23) levelTC = "CRITICAL";

  const hasSupport = item.PIC_SUPPORT && item.PIC_SUPPORT !== "-" && item.PIC_SUPPORT !== "";
  let tcUtama = totalTC;
  let tcSupport = 0;
  const faseDT = String(item.FASE_DT || "").toUpperCase();

  if (hasSupport) {
    if (faseDT === "FULL") {
      tcUtama = Math.round(totalTC * 0.7);
      tcSupport = Math.round(totalTC * 0.3);
    } else if (faseDT === "LAYOUT") {
      tcUtama = totalTC;
      tcSupport = totalTC;
    } else if (faseDT === "FILE_CAD") {
      tcUtama = Math.round(totalTC * 0.3);
      tcSupport = Math.round(totalTC * 0.7);
    } else {
      tcUtama = Math.round(totalTC * 0.7);
      tcSupport = Math.round(totalTC * 0.3);
    }
  } else {
    tcUtama = totalTC;
    tcSupport = 0;
  }

  // Time calculations
  let waitingTime = 0;
  let leadTime = 0;
  let cycleTime = 0;
  let delayTime = 0;

  if (item.TGL_MULAI && item.TGL_MULAI !== "-" && item.TGL_MULAI !== "") {
    const start = new Date(item.TGL_MULAI).getTime();
    const masuk = item.TGL_MASUK ? new Date(item.TGL_MASUK).getTime() : null;
    const end = (item.TGL_SELESAI && item.TGL_SELESAI !== "-") ? new Date(item.TGL_SELESAI).getTime() : null;
    const target = item.TGL_TARGET ? new Date(item.TGL_TARGET) : null;

    if (!isNaN(start)) {
      if (masuk && !isNaN(masuk)) {
        waitingTime = parseFloat(((start - masuk) / (1000 * 60 * 60)).toFixed(2));
      }
      if (end && !isNaN(end)) {
        const diffHrs = (end - start) / (1000 * 60 * 60);
        leadTime = parseFloat(diffHrs.toFixed(2));
        cycleTime = parseFloat((diffHrs * 0.85).toFixed(2));
        
        if (target && !isNaN(target.getTime())) {
          target.setHours(23, 59, 59);
          const targetTime = target.getTime();
          if (end > targetTime) {
            delayTime = parseFloat(((end - targetTime) / (1000 * 60 * 60)).toFixed(2));
          }
        }
      }
    }
  }

  return {
    LA: laValue,
    DP: dpValue,
    TOTAL_TC: totalTC,
    LEVEL_TC: levelTC,
    TC_UTAMA: tcUtama,
    TC_SUPPORT: tcSupport,
    WAITING_TIME: waitingTime,
    LEAD_TIME: leadTime,
    CYCLE_TIME: cycleTime,
    DELAY_TIME: delayTime
  };
}

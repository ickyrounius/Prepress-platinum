import { JopData, JosData } from '../job/jobTypes';
<<<<<<< HEAD
import { calculateDeadlinePressureScore, calculateTotalTc, DEFAULT_TC_FORMULA, type TCFormulaConfig } from '../../lib/tcFormula';

export const calculateKPI = (item: JopData, tcFormula: TCFormulaConfig = DEFAULT_TC_FORMULA): Partial<JopData> => {
  const revisi = typeof item.REVISI_KE === 'number' ? item.REVISI_KE : (parseInt(String(item.REVISI_KE)) || 0);
  const laValue = Math.min(revisi + 1, 5);
=======

export const calculateKPI = (item: JopData): Partial<JopData> => {
  const revisi = typeof item.REVISI_KE === 'number' ? item.REVISI_KE : (parseInt(String(item.REVISI_KE)) || 0);
  const laValue = Math.min(revisi + 1, 5);
  let dpValue = 1;
>>>>>>> 06b91674e4f53ac844b5d9b4e1edf5ceba6c6fac
  
  const ingressDate = item.TGL_MASUK_JOP || item.TGL_MASUK;
  const targetDate = item.TGL_TARGET_JOP || item.TGL_TARGET;
  const startDate = item.TGL_MULAI_B || item.TGL_MULAI;
  const finishDate = item.TGL_SELESAI_JOP || item.TGL_SELESAI_B || item.TGL_SELESAI;

<<<<<<< HEAD
  // Use shared DP calculation from tcFormula.ts (single source of truth)
  const dpValue = calculateDeadlinePressureScore(targetDate as string | undefined, ingressDate as string | undefined);

  // Use shared TC calculation from tcFormula.ts with configurable weights
  const tcValues = {
    kt: parseFloat(String(item.KT)) || 0,
    rp: parseFloat(String(item.RP)) || 0,
    bs: parseFloat(String(item.BS)) || 0,
    cad: parseFloat(String(item.CAD)) || 0,
  };
  const totalTC = calculateTotalTc(tcValues, laValue, dpValue, tcFormula);
=======
  if (ingressDate && targetDate) {
    const t1 = new Date(ingressDate);
    const t2 = new Date(targetDate);
    if (!isNaN(t1.getTime()) && !isNaN(t2.getTime())) {
      const diffDays = Math.ceil((t2.getTime() - t1.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) dpValue = 5;      
      else if (diffDays === 2) dpValue = 4;
      else if (diffDays === 3) dpValue = 3;
      else if (diffDays === 4) dpValue = 2;
      else dpValue = 1;
    }
  }

  const totalTC = Math.floor(
    (parseFloat(String(item.KT))||0) + 
    (parseFloat(String(item.RP))||0) + 
    (parseFloat(String(item.BS))||0) + 
    (parseFloat(String(item.CAD))||0) + 
    laValue + dpValue
  );
>>>>>>> 06b91674e4f53ac844b5d9b4e1edf5ceba6c6fac

  const levelTC = totalTC <= 8 ? "RINGAN" : (totalTC <= 13 ? "STANDARD" : (totalTC <= 18 ? "ADVANCED" : (totalTC <= 23 ? "COMPLEX" : "CRITICAL")));
  const hasSupport = !!(item.PIC_SUPPORT && item.PIC_SUPPORT !== "-");
  
  let tcUtama = totalTC;
  let tcSupport = 0;
<<<<<<< HEAD
  const faseDT = String(item.FASE_DT || "").toUpperCase();
=======
  const faseDT = String(item.FASE_DT || item.FAASE_DT || "").toUpperCase();
>>>>>>> 06b91674e4f53ac844b5d9b4e1edf5ceba6c6fac

  if (hasSupport) {
    if (faseDT === "FULL") {
      tcUtama = Math.round(totalTC * 0.7);
      tcSupport = Math.round(totalTC * 0.3);
    } else if (faseDT === "LAYOUT") {
      tcUtama = totalTC; tcSupport = totalTC; 
    } else if (faseDT === "FILE_CAD") {
      tcUtama = Math.round(totalTC * 0.3);
      tcSupport = Math.round(totalTC * 0.7);
    } else {
      tcUtama = Math.round(totalTC * 0.7);
      tcSupport = Math.round(totalTC * 0.3);
    }
  }

  const progUp: Partial<JopData> = { 
    LA: laValue, DP: dpValue, TOTAL_TC: totalTC, LEVEL_TC: levelTC,
    TC_UTAMA: tcUtama, TC_SUPPORT: tcSupport
  };

  const nowStr = new Date().toISOString();
  const isDone = item.ST_WF_JOP === 'Closed' || item.ST_WORKFLOW === 'Closed';
  
  if (isDone && (!finishDate || finishDate === "-")) {
    progUp.TGL_SELESAI_JOP = nowStr;
  }

  if (startDate && startDate !== "-") {
    const start = new Date(startDate as any);
    const masuk = ingressDate ? new Date(ingressDate as any) : null;
    const end = (progUp.TGL_SELESAI_JOP || finishDate) && finishDate !== "-" ? new Date((progUp.TGL_SELESAI_JOP || finishDate!) as any) : null;
    const target = targetDate ? new Date(targetDate as any) : null;

    if (!isNaN(start.getTime())) {
      if (masuk && !isNaN(masuk.getTime())) {
        progUp.WAITING_TIME = parseFloat(((start.getTime() - masuk.getTime()) / (1000 * 60 * 60)).toFixed(2));
      }
      if (end && !isNaN(end.getTime())) {
        const diffHrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        progUp.LEAD_TIME = parseFloat(diffHrs.toFixed(2));
        progUp.CYCLE_TIME = parseFloat((diffHrs * 0.85).toFixed(2));
        if (target && !isNaN(target.getTime())) {
          target.setHours(23, 59, 59);
          progUp.DELAY_TIME = end > target ? parseFloat(((end.getTime() - target.getTime()) / (1000 * 60 * 60)).toFixed(2)) : 0;
        }
      }
    }
  }

  return progUp;
};

export const calculateKPI_JOS = (item: JosData): Partial<JosData> => {
  const revisi = typeof item.REVISI_KE === 'number' ? item.REVISI_KE : (parseInt(String(item.REVISI_KE)) || 0);
  const laValue = Math.min(revisi + 1, 5);
  let dpValue = 1;
  
  if (item.TGL_MASUK_JOS && item.TGL_TARGET_JOS) {
    const t1 = new Date(item.TGL_MASUK_JOS);
    const t2 = new Date(item.TGL_TARGET_JOS);
    if (!isNaN(t1.getTime()) && !isNaN(t2.getTime())) {
      const diffDays = Math.ceil((t2.getTime() - t1.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) dpValue = 5;      
      else if (diffDays === 2) dpValue = 4;
      else if (diffDays === 3) dpValue = 3;
      else if (diffDays === 4) dpValue = 2;
      else dpValue = 1;
    }
  }

  const totalTC = Math.floor(
    (parseFloat(String(item.KT))||0) + 
    (parseFloat(String(item.RP))||0) + 
    (parseFloat(String(item.BS))||0) + 
    (parseFloat(String(item.CAD))||0) + 
    laValue + dpValue
  );

  const levelTC = totalTC <= 8 ? "RINGAN" : (totalTC <= 13 ? "STANDARD" : (totalTC <= 18 ? "ADVANCED" : (totalTC <= 23 ? "COMPLEX" : "CRITICAL")));
  
  const progUp: Partial<JosData> = { 
    LA: laValue, DP: dpValue, TOTAL_TC: totalTC, LEVEL_TC: levelTC,
  };

  const nowStr = new Date().toISOString();
  if (item.ST_WF_JOS === 'Closed' && (!item.TGL_SELESAI_JOS || item.TGL_SELESAI_JOS === "-")) {
    progUp.TGL_SELESAI_JOS = nowStr;
  }

  if (item.TGL_MULAI_JOS && item.TGL_MULAI_JOS !== "-") {
    const start = new Date(item.TGL_MULAI_JOS as any);
    const masuk = item.TGL_MASUK_JOS ? new Date(item.TGL_MASUK_JOS as any) : null;
    const end = (progUp.TGL_SELESAI_JOS || item.TGL_SELESAI_JOS) && item.TGL_SELESAI_JOS !== "-" ? new Date((progUp.TGL_SELESAI_JOS || item.TGL_SELESAI_JOS!) as any) : null;
    const target = item.TGL_TARGET_JOS ? new Date(item.TGL_TARGET_JOS as any) : null;

    if (!isNaN(start.getTime())) {
      if (masuk && !isNaN(masuk.getTime())) {
        progUp.WAITING_TIME = parseFloat(((start.getTime() - masuk.getTime()) / (1000 * 60 * 60)).toFixed(2));
      }
      if (end && !isNaN(end.getTime())) {
        const diffHrs = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        progUp.LEAD_TIME = parseFloat(diffHrs.toFixed(2));
        progUp.CYCLE_TIME = parseFloat((diffHrs * 0.85).toFixed(2));
        if (target && !isNaN(target.getTime())) {
          target.setHours(23, 59, 59);
          progUp.DELAY_TIME = end > target ? parseFloat(((end.getTime() - target.getTime()) / (1000 * 60 * 60)).toFixed(2)) : 0;
        }
      }
    }
  }

  return progUp;
};

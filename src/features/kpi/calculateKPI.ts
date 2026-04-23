/**
 * calculateKPI.ts — Kalkulasi KPI untuk JOP dan JOS
 *
 * Modul ini TIDAK menduplikasi logika kalkulasi.
 * Semua helper (calcLA, calcDP, calcTotalTC, calcLevelTC, calcTCSplit)
 * diimpor dari @/lib/calculations — canonical source.
 */
import { JopData, JosData } from '../job/jobTypes';
import { calcLA, calcDP, calcTotalTC, calcLevelTC, calcTCSplit } from '@/lib/calculations';

// ─────────────────────────────────────────────────────────────────────────────
// KPI untuk JOP (Design Teknis)
// ─────────────────────────────────────────────────────────────────────────────

export const calculateKPI = (item: JopData): Partial<JopData> => {
  // Tanggal — ambil alias yang lebih spesifik dulu, fallback ke field umum
  const ingressDate = item.TGL_MASUK_JOP || item.TGL_MASUK;
  const targetDate  = item.TGL_TARGET_JOP || item.TGL_TARGET;
  const startDate   = item.TGL_MULAI_B;
  const finishDate  = item.TGL_SELESAI_JOP || item.TGL_SELESAI_B;

  // Hitung komponen TC
  const la = calcLA(item.REVISI_KE);
  const dp = calcDP(ingressDate, targetDate);
  const kt = parseFloat(String(item.KT)) || 0;
  const rp = parseFloat(String(item.RP)) || 0;
  const bs = parseFloat(String(item.BS)) || 0;
  const cad = parseFloat(String(item.CAD)) || 0;

  const totalTC = calcTotalTC(kt, rp, bs, cad, la, dp);
  const levelTC = calcLevelTC(totalTC);

  // FASE_DT — normalisasi typo lama jika masih ada di data Firestore
  const faseDT = String(item.FASE_DT || '').toUpperCase();
  const { tcUtama, tcSupport } = calcTCSplit(totalTC, item.PIC_SUPPORT, faseDT);

  const update: Partial<JopData> = {
    LA: la, DP: dp,
    TOTAL_TC: totalTC, LEVEL_TC: levelTC,
    TC_UTAMA: tcUtama, TC_SUPPORT: tcSupport,
  };

  // Auto-set TGL_SELESAI_JOP bila status Closed tapi belum ada tanggal selesai
  const isDone = item.ST_WF_JOP === 'Closed' || item.ST_WORKFLOW === 'Closed';
  if (isDone && (!finishDate || finishDate === '-')) {
    update.TGL_SELESAI_JOP = new Date().toISOString();
  }

  // Time metrics
  const effectiveFinish = update.TGL_SELESAI_JOP || finishDate;
  if (startDate && startDate !== '-') {
    const start  = new Date(startDate);
    const masuk  = ingressDate ? new Date(ingressDate) : null;
    const end    = effectiveFinish && effectiveFinish !== '-' ? new Date(String(effectiveFinish)) : null;
    const target = targetDate ? new Date(String(targetDate)) : null;

    if (!isNaN(start.getTime())) {
      if (masuk && !isNaN(masuk.getTime())) {
        update.WAITING_TIME = parseFloat(((start.getTime() - masuk.getTime()) / 3_600_000).toFixed(2));
      }
      if (end && !isNaN(end.getTime())) {
        const diffHrs = (end.getTime() - start.getTime()) / 3_600_000;
        update.LEAD_TIME  = parseFloat(diffHrs.toFixed(2));
        update.CYCLE_TIME = parseFloat((diffHrs * 0.85).toFixed(2));
        if (target && !isNaN(target.getTime())) {
          target.setHours(23, 59, 59, 999);
          update.DELAY_TIME = end.getTime() > target.getTime()
            ? parseFloat(((end.getTime() - target.getTime()) / 3_600_000).toFixed(2))
            : 0;
        }
      }
    }
  }

  return update;
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI untuk JOS (Desain Grafis)
// ─────────────────────────────────────────────────────────────────────────────

export const calculateKPI_JOS = (item: JosData): Partial<JosData> => {
  const la = calcLA(item.REVISI_KE as number | undefined);
  const dp = calcDP(item.TGL_MASUK_JOS, item.TGL_TARGET_JOS);
  const kt  = parseFloat(String(item.KT))  || 0;
  const rp  = parseFloat(String(item.RP))  || 0;
  const bs  = parseFloat(String(item.BS))  || 0;
  const cad = parseFloat(String(item.CAD)) || 0;

  const totalTC = calcTotalTC(kt, rp, bs, cad, la, dp);
  const levelTC = calcLevelTC(totalTC);

  const update: Partial<JosData> = {
    LA: la, DP: dp,
    TOTAL_TC: totalTC, LEVEL_TC: levelTC,
  };

  // Auto-set TGL_SELESAI_JOS bila status Closed tapi belum diisi
  if (item.ST_WF_JOS === 'Closed' && (!item.TGL_SELESAI_JOS || item.TGL_SELESAI_JOS === '-')) {
    update.TGL_SELESAI_JOS = new Date().toISOString();
  }

  // Time metrics
  if (item.TGL_MULAI_JOS && item.TGL_MULAI_JOS !== '-') {
    const start  = new Date(item.TGL_MULAI_JOS);
    const masuk  = item.TGL_MASUK_JOS ? new Date(item.TGL_MASUK_JOS) : null;
    const finishStr = update.TGL_SELESAI_JOS || item.TGL_SELESAI_JOS;
    const end    = finishStr && finishStr !== '-' ? new Date(String(finishStr)) : null;
    const target = item.TGL_TARGET_JOS ? new Date(String(item.TGL_TARGET_JOS)) : null;

    if (!isNaN(start.getTime())) {
      if (masuk && !isNaN(masuk.getTime())) {
        update.WAITING_TIME = parseFloat(((start.getTime() - masuk.getTime()) / 3_600_000).toFixed(2));
      }
      if (end && !isNaN(end.getTime())) {
        const diffHrs = (end.getTime() - start.getTime()) / 3_600_000;
        update.LEAD_TIME  = parseFloat(diffHrs.toFixed(2));
        update.CYCLE_TIME = parseFloat((diffHrs * 0.85).toFixed(2));
        if (target && !isNaN(target.getTime())) {
          target.setHours(23, 59, 59, 999);
          update.DELAY_TIME = end.getTime() > target.getTime()
            ? parseFloat(((end.getTime() - target.getTime()) / 3_600_000).toFixed(2))
            : 0;
        }
      }
    }
  }

  return update;
};

import { db } from '@/lib/firebase';
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, startAfter,
  serverTimestamp, FieldValue, increment,
  DocumentSnapshot, QueryDocumentSnapshot, writeBatch,
} from 'firebase/firestore';
import { JosData } from './jobTypes';
import { generateUniqueId, DEPT_CODES } from '@/lib/types/schema';
import { calcLA, calcDP, calcTotalTC, calcLevelTC } from '@/lib/calculations';
import { recordAuditLog } from '../audit-log/auditLogService';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Build normalised searchable string for prefix search */
function buildSearchable(data: Partial<JosData>): string {
  return [
    data.NO_JOS,
    data.BUYER,
    data.NAMA_PRODUK,
    data.DESIGNER,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const saveJOS = async (
  formData: Partial<JosData>,
  actorUid: string
): Promise<{ status: string; message: string; id?: string }> => {
  try {
    if (!formData.NO_JOS?.trim()) throw new Error('NO. JOS wajib diisi!');
    if (!formData.TIPE_JOS?.trim()) throw new Error('TIPE JOS wajib diisi!');
    if (!formData.BUYER?.trim()) throw new Error('BUYER wajib diisi!');

    const josRef = collection(db, 'workflows_jos');

    // Prevent active duplicates
    const dupQ = query(josRef, where('NO_JOS', '==', formData.NO_JOS));
    const dupSnap = await getDocs(dupQ);
    const hasActiveDuplicate = dupSnap.docs.some((d) => {
      const status = String((d.data() as JosData).ST_WF_JOS || '').toUpperCase();
      return !['CLOSED', 'DONE', 'CANCEL'].includes(status);
    });
    if (hasActiveDuplicate) {
      throw new Error(`NO. JOS ${formData.NO_JOS} sudah aktif di sistem!`);
    }

    const uniqueId = generateUniqueId(DEPT_CODES.DG);
    const la = calcLA(formData.REVISI_KE ?? 0);
    const dp = calcDP(formData.TGL_MASUK_JOS ?? todayString(), formData.TGL_TARGET_JOS ?? '');
    const totalTC = calcTotalTC(
      formData.KT ?? 0, formData.RP ?? 0, formData.BS ?? 0, formData.CAD ?? 0, la, dp
    );

    const newJos: JosData = {
      ID: uniqueId,
      NO_JOS: formData.NO_JOS,
      TIPE_JOS: formData.TIPE_JOS,
      BUYER: formData.BUYER,
      NAMA_PRODUK: formData.NAMA_PRODUK ?? '',
      JENIS_PRODUK: formData.JENIS_PRODUK ?? '',
      TGL_JOS: formData.TGL_JOS ?? todayString(),
      TGL_MASUK_JOS: formData.TGL_MASUK_JOS ?? todayString(),
      TGL_TARGET_JOS: formData.TGL_TARGET_JOS ?? '',
      ST_WF_JOS: 'WAITING',
      ST_PRO_JOS: 'Not Started',
      ST_DG_SERVICE: '',
      DESIGNER: formData.DESIGNER ?? '',
      JUMLAH_DESIGN: formData.JUMLAH_DESIGN ?? 0,
      JUMLAH_WARNA: formData.JUMLAH_WARNA ?? 0,
      JENIS_BAHAN: formData.JENIS_BAHAN ?? '',
      KT: formData.KT ?? 0,
      RP: formData.RP ?? 0,
      BS: formData.BS ?? 0,
      CAD: formData.CAD ?? 0,
      LA: la,
      DP: dp,
      TOTAL_TC: totalTC,
      LEVEL_TC: calcLevelTC(totalTC),
      REVISI_KE: 0,
      HOLD_DURATION_HOURS: 0,
      searchable: buildSearchable(formData),
      LAST_UPDATED: serverTimestamp(),
      LAST_UPDATED_BY: actorUid,
    };

    await setDoc(doc(db, 'workflows_jos', uniqueId), newJos);

    await recordAuditLog({
      actor_uid: actorUid,
      action: 'create',
      entity_type: 'workflows_jos',
      entity_id: uniqueId,
      before: {},
      after: { NO_JOS: newJos.NO_JOS, ST_WF_JOS: newJos.ST_WF_JOS },
    });

    return { status: 'success', message: `JOS berhasil disimpan: ${uniqueId}`, id: uniqueId };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

export const updateJOS = async (
  id: string,
  changes: Partial<JosData>,
  actorUid: string
): Promise<{ status: string; message: string }> => {
  try {
    const docRef = doc(db, 'workflows_jos', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('JOS tidak ditemukan!');

    const before = snap.data() as JosData;

    // Recalculate TC if complexity fields changed
    const la = calcLA(changes.REVISI_KE ?? before.REVISI_KE ?? 0);
    const dp = calcDP(
      changes.TGL_MASUK_JOS ?? before.TGL_MASUK_JOS,
      changes.TGL_TARGET_JOS ?? before.TGL_TARGET_JOS
    );
    const totalTC = calcTotalTC(
      changes.KT ?? before.KT ?? 0,
      changes.RP ?? before.RP ?? 0,
      changes.BS ?? before.BS ?? 0,
      changes.CAD ?? before.CAD ?? 0,
      la, dp
    );

    const payload: Partial<JosData> = {
      ...changes,
      LA: la,
      DP: dp,
      TOTAL_TC: totalTC,
      LEVEL_TC: calcLevelTC(totalTC),
      searchable: buildSearchable({ ...before, ...changes }),
      LAST_UPDATED: serverTimestamp() as unknown as FieldValue,
      LAST_UPDATED_BY: actorUid,
    };

    await updateDoc(docRef, payload as Record<string, unknown>);

    await recordAuditLog({
      actor_uid: actorUid,
      action: 'update',
      entity_type: 'workflows_jos',
      entity_id: id,
      before: { ST_WF_JOS: before.ST_WF_JOS },
      after: { ST_WF_JOS: changes.ST_WF_JOS ?? before.ST_WF_JOS },
    });

    return { status: 'success', message: 'JOS berhasil diupdate.' };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

/** HOLD on — records hold start timestamp */
export const holdJOS = async (id: string, reason: string, actorUid: string) => {
  const docRef = doc(db, 'workflows_jos', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('JOS tidak ditemukan!');
  const before = snap.data() as JosData;

  await updateDoc(docRef, {
    ST_WF_JOS: 'HOLD',
    HOLD_STARTED_AT: Date.now(),
    HOLD_REASON: reason,
    LAST_UPDATED: serverTimestamp(),
    LAST_UPDATED_BY: actorUid,
  });

  await recordAuditLog({
    actor_uid: actorUid,
    action: 'hold',
    entity_type: 'workflows_jos',
    entity_id: id,
    before: { ST_WF_JOS: before.ST_WF_JOS },
    after: { ST_WF_JOS: 'HOLD', HOLD_REASON: reason },
  });
};

/** HOLD off — accumulates hold hours */
export const resumeJOS = async (
  id: string,
  resumeStatus: string,
  actorUid: string
) => {
  const docRef = doc(db, 'workflows_jos', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('JOS tidak ditemukan!');
  const data = snap.data() as JosData;

  const holdMs = data.HOLD_STARTED_AT ? Date.now() - (data.HOLD_STARTED_AT as number) : 0;
  const holdHours = holdMs / 3_600_000;

  await updateDoc(docRef, {
    ST_WF_JOS: resumeStatus,
    HOLD_DURATION_HOURS: increment(holdHours) as unknown,
    HOLD_STARTED_AT: null,
    LAST_UPDATED: serverTimestamp(),
    LAST_UPDATED_BY: actorUid,
  });

  await recordAuditLog({
    actor_uid: actorUid,
    action: 'hold',
    entity_type: 'workflows_jos',
    entity_id: id,
    before: { ST_WF_JOS: 'HOLD' },
    after: { ST_WF_JOS: resumeStatus, addedHoldHours: holdHours },
  });
};

export const deleteJOS = async (id: string, actorUid: string): Promise<string> => {
  try {
    const docRef = doc(db, 'workflows_jos', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return '❌ JOS tidak ditemukan!';

    // Soft-delete → deleted_jops
    await setDoc(doc(db, 'deleted_jops', id), {
      ...snap.data(),
      TGL_HAPUS: new Date().toISOString(),
      DELETED_BY: actorUid,
      SOURCE_COLLECTION: 'workflows_jos',
    });
    await deleteDoc(docRef);

    await recordAuditLog({
      actor_uid: actorUid,
      action: 'delete',
      entity_type: 'workflows_jos',
      entity_id: id,
      before: snap.data() as Record<string, unknown>,
      after: {},
    });

    return '✅ JOS berhasil dihapus (soft-delete)';
  } catch (e: unknown) {
    return 'Error: ' + (e as Error).message;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Listeners (paginated)
// ─────────────────────────────────────────────────────────────────────────────

export const listenToActiveJOS = (
  callback: (data: JosData[]) => void,
  pageSize = 30
) => {
  const q = query(
    collection(db, 'workflows_jos'),
    where('ST_WF_JOS', 'not-in', ['CLOSED', 'DONE', 'CANCEL']),
    orderBy('LAST_UPDATED', 'desc'),
    limit(pageSize)
  );

  return onSnapshot(q, (snap) => {
    const items: JosData[] = [];
    snap.forEach((d) => items.push(d.data() as JosData));
    callback(items);
  });
};

export const listenToJOSByDesigner = (
  designerName: string,
  callback: (data: JosData[]) => void,
  pageSize = 50
) => {
  const q = query(
    collection(db, 'workflows_jos'),
    where('DESIGNER', '==', designerName),
    where('ST_WF_JOS', 'not-in', ['CLOSED', 'DONE']),
    orderBy('TGL_TARGET_JOS', 'asc'),
    limit(pageSize)
  );

  return onSnapshot(q, (snap) => {
    const items: JosData[] = [];
    snap.forEach((d) => items.push(d.data() as JosData));
    callback(items);
  });
};

export const searchJOS = async (term: string, pageSize = 50): Promise<JosData[]> => {
  if (!term || term.length < 3) return [];
  const t = term.toLowerCase();
  const q = query(
    collection(db, 'workflows_jos'),
    where('searchable', '>=', t),
    where('searchable', '<=', t + '\uf8ff'),
    orderBy('searchable'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as JosData);
};

// Paginated next page fetch helper
export const fetchNextJOSPage = async (
  lastDoc: QueryDocumentSnapshot | DocumentSnapshot,
  pageSize = 30
): Promise<JosData[]> => {
  const q = query(
    collection(db, 'workflows_jos'),
    where('ST_WF_JOS', 'not-in', ['CLOSED', 'DONE', 'CANCEL']),
    orderBy('LAST_UPDATED', 'desc'),
    startAfter(lastDoc),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as JosData);
};

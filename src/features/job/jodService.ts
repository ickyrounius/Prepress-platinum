import { db } from '@/lib/firebase';
import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { generateUniqueId, DEPT_CODES } from '@/lib/types/schema';
import { recordAuditLog } from '../audit-log/auditLogService';

export interface JODData {
  id?: string;
  ID_NO_JOD?: string;
  NO_JOS: string;
  NO_JOD: string;
  BUYER: string;
  NAMA_DESIGN: string;
  TIPE_JOS?: string;
  DESIGNER: string;
  JUMLAH_DESIGN?: number;
  JUMLAH_WARNA?: number;
  JENIS_BAHAN?: string;
  ST_PRO_JOD: string;
  TGL_JOD: string;
  TGL_SELESAI_JOD?: string;
  LAST_UPDATED?: unknown;
  LAST_UPDATED_BY?: string;
  [key: string]: unknown;
}

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export const saveJOD = async (
  formData: Partial<JODData>,
  actorUid: string
): Promise<{ status: string; message: string; id?: string }> => {
  try {
    if (!formData.NO_JOS?.trim()) throw new Error('NO. JOS wajib diisi!');
    if (!formData.NO_JOD?.trim()) throw new Error('NO. JOD wajib diisi!');
    if (!formData.DESIGNER?.trim()) throw new Error('DESIGNER wajib diisi!');

    const uniqueId = generateUniqueId(DEPT_CODES.DG);

    const newJod: JODData = {
      id: uniqueId,
      ID_NO_JOD: uniqueId,
      NO_JOS: formData.NO_JOS ?? '',
      NO_JOD: formData.NO_JOD ?? '',
      BUYER: formData.BUYER ?? '',
      NAMA_DESIGN: formData.NAMA_DESIGN ?? '',
      TIPE_JOS: formData.TIPE_JOS ?? '',
      DESIGNER: formData.DESIGNER ?? '',
      JUMLAH_DESIGN: formData.JUMLAH_DESIGN ?? 0,
      JUMLAH_WARNA: formData.JUMLAH_WARNA ?? 0,
      JENIS_BAHAN: formData.JENIS_BAHAN ?? '',
      ST_PRO_JOD: 'WAITING',
      TGL_JOD: formData.TGL_JOD ?? todayString(),
      LAST_UPDATED: serverTimestamp(),
      LAST_UPDATED_BY: actorUid,
    };

    await setDoc(doc(db, 'proses_jod', uniqueId), newJod);

    await recordAuditLog({
      actor_uid: actorUid,
      action: 'create',
      entity_type: 'proses_jod',
      entity_id: uniqueId,
      before: {},
      after: { NO_JOD: newJod.NO_JOD, NO_JOS: newJod.NO_JOS },
    });

    return { status: 'success', message: `JOD berhasil disimpan: ${uniqueId}`, id: uniqueId };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

export const updateJOD = async (
  id: string,
  changes: Partial<JODData>,
  actorUid: string
): Promise<{ status: string; message: string }> => {
  try {
    const docRef = doc(db, 'proses_jod', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('JOD tidak ditemukan!');
    const before = snap.data() as JODData;

    const payload = {
      ...changes,
      LAST_UPDATED: serverTimestamp(),
      LAST_UPDATED_BY: actorUid,
    };
    await updateDoc(docRef, payload as Record<string, unknown>);

    await recordAuditLog({
      actor_uid: actorUid,
      action: 'update',
      entity_type: 'proses_jod',
      entity_id: id,
      before: { ST_PRO_JOD: before.ST_PRO_JOD },
      after: { ST_PRO_JOD: changes.ST_PRO_JOD ?? before.ST_PRO_JOD },
    });

    return { status: 'success', message: 'JOD berhasil diupdate.' };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

export const listenToJODByJOS = (
  noJos: string,
  callback: (data: JODData[]) => void
) => {
  const q = query(
    collection(db, 'proses_jod'),
    where('NO_JOS', '==', noJos),
    orderBy('LAST_UPDATED', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    const items: JODData[] = [];
    snap.forEach((d) => items.push(d.data() as JODData));
    callback(items);
  });
};

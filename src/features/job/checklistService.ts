import { db } from '@/lib/firebase';
import {
  collection, doc, setDoc, getDoc, updateDoc, onSnapshot,
  query, where, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { PrepressChecklist } from './jobTypes';
import { generateUniqueId } from '@/lib/types/schema';
import { recordAuditLog } from '../audit-log/auditLogService';

export const saveChecklist = async (
  data: Omit<PrepressChecklist, 'id' | 'checkedAt'>,
  actorUid: string
): Promise<{ status: string; message: string; id?: string }> => {
  try {
    const id = generateUniqueId('CHK');
    const checklist: PrepressChecklist = {
      ...data,
      id,
      checkedBy: actorUid,
      checkedAt: Date.now(),
    };

    await setDoc(doc(db, 'prepress_checklists', id), {
      ...checklist,
      LAST_UPDATED: serverTimestamp(),
    });

    await recordAuditLog({
      actor_uid: actorUid,
      action: 'create',
      entity_type: 'prepress_checklists' as never,
      entity_id: id,
      before: {},
      after: { jobId: data.jobId, NO_B: data.NO_B, outputBlocked: data.outputBlocked },
    });

    return { status: 'success', message: `Checklist disimpan: ${id}`, id };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

export const updateChecklist = async (
  id: string,
  changes: Partial<PrepressChecklist>,
  actorUid: string
): Promise<{ status: string; message: string }> => {
  try {
    const docRef = doc(db, 'prepress_checklists', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Checklist tidak ditemukan!');

    await updateDoc(docRef, {
      ...changes,
      checkedAt: Date.now(),
      LAST_UPDATED: serverTimestamp(),
    });

    return { status: 'success', message: 'Checklist berhasil diupdate.' };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

export const listenToChecklistByJob = (
  jobId: string,
  callback: (data: PrepressChecklist[]) => void
) => {
  const q = query(
    collection(db, 'prepress_checklists'),
    where('jobId', '==', jobId),
    orderBy('checkedAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const items: PrepressChecklist[] = [];
    snap.forEach((d) => items.push(d.data() as PrepressChecklist));
    callback(items);
  });
};

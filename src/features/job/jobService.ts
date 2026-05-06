import { db, rtdb } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import { ref, set, onValue, remove, runTransaction } from 'firebase/database';
import { JopData, BlueprintLog, QCLog, UserLock } from './jobTypes';
import { generateUniqueId, DEPT_CODES } from '@/lib/types/schema';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// JOP CRUD
// ─────────────────────────────────────────────────────────────────────────────

export const saveJOP = async (
  formData: Partial<JopData> & { IS_RELAYOUT?: boolean }
): Promise<{ status: string; message: string }> => {
  try {
    // Comprehensive field validation
    if (!formData.NO_JOP && !formData.IS_RELAYOUT) {
      throw new Error('JOP No wajib diisi!');
    }
    
    // Validate required fields to prevent incomplete records
    const requiredFields = ['TIPE_JOP', 'BUYER', 'NAMA_JOP'];
    const missingFields = requiredFields.filter(
      field => !formData[field as keyof typeof formData]?.toString().trim()
    );
    if (missingFields.length > 0) {
      throw new Error(`Fields wajib diisi: ${missingFields.join(', ')}`);
    }
    
    // Validate input data types and values
    if (formData.NO_JOP && (typeof formData.NO_JOP !== 'string' || !formData.NO_JOP.trim())) {
      throw new Error('NO_JOP harus berupa string yang tidak kosong');
    }

    const jopsRef = collection(db, 'workflows_jop');

    // Cegah duplikat JOP aktif
    if (!formData.IS_RELAYOUT) {
      const q = query(
        jopsRef,
        where('NO_JOP', '==', formData.NO_JOP)
      );
      const snap = await getDocs(q);
      const hasActiveDuplicate = snap.docs.some((item) => {
        const data = item.data() as JopData;
        const status = String(data.ST_WF_JOP || data.ST_WORKFLOW || '').toUpperCase();
        return !['CLOSED', 'DONE', 'CANCEL'].includes(status);
      });
      if (hasActiveDuplicate) {
        throw new Error(
          `Nomor JOP ${formData.NO_JOP} sudah aktif di sistem! ` +
          `Gunakan fitur EDIT atau tandai sebagai RELAYOUT.`
        );
      }
    }

    // ID unik format: DT-YYMMDD-XXXX
    const uniqueId = generateUniqueId(DEPT_CODES.DT);

    const newJop: JopData = {
      ID:          uniqueId,
      TGL_MASUK:   formData.TGL_MASUK   || todayString(),
      TGL_JOP:     formData.TGL_JOP     || '',
      TGL_TARGET:  formData.TGL_TARGET  || '',
      NO_JOP:      formData.NO_JOP      || '',
      NO_JOS:      formData.NO_JOS      || '-',
      TIPE_JOP:    formData.TIPE_JOP    || '',
      BUYER:       formData.BUYER       || '',
      NAMA_JOP:    formData.NAMA_JOP    || '',
      FASE_DT:     formData.FASE_DT     || '',   // Canonical field (bukan FAASE_DT)
      PIC_UTAMA:   formData.PIC_UTAMA   || '',
      PIC_SUPPORT: formData.PIC_SUPPORT || '',
      LAST_UPDATED: serverTimestamp(),
      ST_WF_JOP:    'REVIEW',
      ST_PRO_JOP:   'Not Started',
      LEVEL_TC:     'RINGAN',
      KT: 0, RP: 0, BS: 0, CAD: 0,
      LA: 0, DP: 0,
      TOTAL_TC: 0, REVISI_KE: 0,
      TC_UTAMA: 0, TC_SUPPORT: 0,
    };

    await setDoc(doc(db, 'workflows_jop', uniqueId), newJop);

    return {
      status: 'success',
      message: `Sukses! JOP Berhasil Disimpan dengan ID: ${uniqueId}`,
    };
  } catch (e: unknown) {
    return { status: 'error', message: (e as Error).message };
  }
};

export const deleteJOPData = async (id: string): Promise<string> => {
  try {
    const jopDocRef = doc(db, 'workflows_jop', id);
    const jopSnap  = await getDoc(jopDocRef);

    if (!jopSnap.exists()) return '❌ ID Tidak Ditemukan!';

    // Pindahkan ke deleted_jops sebelum menghapus
    await setDoc(doc(db, 'deleted_jops', id), {
      ...jopSnap.data(),
      TGL_HAPUS: new Date().toISOString(),
    });
    await deleteDoc(jopDocRef);

    return '✅ Data Berhasil Dihapus & Dipindah ke Rekap Delete!';
  } catch (e: unknown) {
    return 'Error: ' + (e as Error).message;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Realtime Database — Locking
// ─────────────────────────────────────────────────────────────────────────────

export const subscribeToJopLocks = (
  callback: (locks: Record<string, UserLock>) => void
) => {
  const locksRef = ref(rtdb, 'locks');
  return onValue(locksRef, (snapshot) => {
    callback((snapshot.val() as Record<string, UserLock>) || {});
  });
};

export const lockJOP = async (
  id: string,
  userDetails: UserLock['activeUser']
) => {
  const lockRef = ref(rtdb, `locks/${id}`);
  const result = await runTransaction(lockRef, (current) => {
    if (current && current.activeUser?.uid && current.activeUser.uid !== userDetails.uid) {
      return;
    }
    return {
      activeUser: userDetails,
      timestamp: Date.now(),
    };
  });
  if (!result.committed) {
    throw new Error('JOP sedang dikunci oleh user lain.');
  }
};

export const unlockJOP = async (id: string, userUid?: string) => {
  const lockRef = ref(rtdb, `locks/${id}`);
  if (!userUid) {
    await remove(lockRef);
    return;
  }

  const result = await runTransaction(lockRef, (current) => {
    if (!current) return null;
    if (current.activeUser?.uid !== userUid) return;
    return null;
  });
  if (!result.committed) {
    throw new Error('Lock hanya bisa dibuka oleh pemilik lock.');
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Listeners
// ─────────────────────────────────────────────────────────────────────────────

/** Listen ke semua JOP yang belum Selesai/Done, diurutkan berdasarkan update terbaru. */
export const listenToMergedData = (callback: (data: JopData[]) => void) => {
  // Ditambahkan limit 500 untuk mencegah download data berlebih jika database membengkak.
  // Idealnya menggunakan pagination, namun limit ini cukup untuk dashboard operasional.
  const q = query(
    collection(db, 'workflows_jop'),
    orderBy('LAST_UPDATED', 'desc'),
    limit(500)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const activeJobs: JopData[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as JopData;
        const status = String(item.ST_WF_JOP || item.ST_WORKFLOW || '').toUpperCase();
        
        // Tetap filter di client untuk fleksibilitas pengecekan multi-field, 
        // namun query sudah dibatasi 500 data terbaru.
        if (!['CLOSED', 'DONE', 'CANCEL'].includes(status)) {
          activeJobs.push(item);
        }
      });

      callback(activeJobs);
    },
    (error: unknown) => {
      console.error('[jobService] listenToMergedData error:', error);
    }
  );
};

export const listenToBlueprintLogs = (callback: (data: BlueprintLog[]) => void) => {
  const q = query(collection(db, 'logs_blueprint'), orderBy('TGL_LOG', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const changes: BlueprintLog[] = [];
    snapshot.forEach((d) => changes.push(d.data() as BlueprintLog));
    callback(changes);
  });
};

export const listenToQCLogs = (callback: (data: QCLog[]) => void) => {
  const q = query(collection(db, 'logs_qc'), orderBy('TGL_LOG', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const changes: QCLog[] = [];
    snapshot.forEach((d) => changes.push(d.data() as QCLog));
    callback(changes);
  });
};

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
  Timestamp
} from 'firebase/firestore';
import { ref, set, onValue, remove } from 'firebase/database';
import { JopData, BlueprintLog, QCLog, UserLock } from './jobTypes';

export const saveJOP = async (formData: Partial<JopData> & { IS_RELAYOUT?: boolean }): Promise<{status: string, message: string}> => {
  try {
    if (!formData.NO_JOP && !formData.IS_RELAYOUT) {
      throw new Error("JOP No wajib diisi!");
    }

    const jopsRef = collection(db, 'workflows_jop');

    if (!formData.IS_RELAYOUT) {
      const q = query(jopsRef, where("NO_JOP", "==", formData.NO_JOP), where("ST_WORKFLOW", "!=", "Closed"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error(`Nomor JOP ${formData.NO_JOP} sudah aktif di sistem! Gunakan fitur EDIT atau tandai sebagai RELAYOUT.`);
      }
    }

    const now = new Date();
    const formattedDate = [now.getFullYear().toString().slice(-2), 
                           String(now.getMonth()+1).padStart(2, '0'), 
                           String(now.getDate()).padStart(2, '0'),
                           String(now.getHours()).padStart(2, '0'),
                           String(now.getMinutes()).padStart(2, '0')].join('');
                           
    const uniqueId = `DT-${formattedDate}-${Math.floor(1000 + Math.random() * 9000)}`;
    const tglMasuk = now.toISOString().split('T')[0];
    const noJos = formData.NO_JOS ? formData.NO_JOS : "-";

    const newJop: JopData = {
      ID: uniqueId,
      TGL_MASUK: tglMasuk,
      TGL_JOP: formData.TGL_JOP || '',
      TGL_TARGET: formData.TGL_TARGET || '',
      NO_JOP: formData.NO_JOP || '',
      NO_JOS: noJos,
      TIPE_JOP: formData.TIPE_JOP || '',
      BUYER: formData.BUYER || '',
      NAMA_JOP: formData.NAMA_JOP || '',
      LAST_UPDATED: serverTimestamp(),
<<<<<<< HEAD
      ST_WORKFLOW: "Review",
=======
      ST_WORKFLOW: "REVIEW",
>>>>>>> 06b91674e4f53ac844b5d9b4e1edf5ceba6c6fac
      ST_PRO_JOP: "Not Started",
      LEVEL_TC: "RINGAN",
      KT: 0, RP: 0, BS: 0, CAD: 0, LA: 0, DP: 0, TOTAL_TC: 0, REVISI_KE: 0, TC_UTAMA: 0, TC_SUPPORT: 0
    };

    await setDoc(doc(db, 'workflows_jop', uniqueId), newJop);

    return { status: "success", message: "Sukses! JOP Berhasil Disimpan dengan ID: " + uniqueId };
  } catch (e: unknown) {
    const error = e as Error;
    return { status: "error", message: error.message };
  }
};

export const deleteJOPData = async (id: string): Promise<string> => {
  try {
    const jopDocRef = doc(db, 'workflows_jop', id);
    const jopSnap = await getDoc(jopDocRef);

    if (!jopSnap.exists()) {
      return "❌ ID Tidak Ditemukan!";
    }

    const data = jopSnap.data();
    
    await setDoc(doc(db, 'deleted_jops', id), {
      ...data,
      TGL_HAPUS: new Date().toISOString()
    });

    await deleteDoc(jopDocRef);

    return "✅ Data Berhasil Dihapus & Dipindah ke Rekap Delete!";
  } catch (e: unknown) {
    const error = e as Error;
    return "Error: " + error.message;
  }
};

export const subscribeToJopLocks = (callback: (locks: Record<string, UserLock>) => void) => {
  const locksRef = ref(rtdb, 'locks');
  return onValue(locksRef, (snapshot) => {
    callback((snapshot.val() as Record<string, UserLock>) || {});
  });
};

export const lockJOP = async (id: string, userDetails: UserLock['activeUser']) => {
  await set(ref(rtdb, `locks/${id}`), {
    activeUser: userDetails,
    timestamp: Date.now()
  });
};

export const unlockJOP = async (id: string) => {
  await remove(ref(rtdb, `locks/${id}`));
};

export const listenToMergedData = (callback: (data: JopData[]) => void) => {
  const q = query(
    collection(db, 'workflows_jop'),
    where('ST_WORKFLOW', '!=', 'Closed')
  );
  
  return onSnapshot(q, (snapshot) => {
    const changes: JopData[] = [];
    snapshot.forEach((doc) => {
      changes.push(doc.data() as JopData);
    });
    changes.sort((a, b) => {
      const aTime = (a.LAST_UPDATED as Timestamp)?.seconds || 0;
      const bTime = (b.LAST_UPDATED as Timestamp)?.seconds || 0;
      return bTime - aTime;
    });
    callback(changes);
  }, (error: unknown) => {
    console.error("Error listening to merged data:", error);
  });
};

export const listenToBlueprintLogs = (callback: (data: BlueprintLog[]) => void) => {
  const q = query(collection(db, 'logs_blueprint'), orderBy('TGL_LOG', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const changes: BlueprintLog[] = [];
    snapshot.forEach((doc) => changes.push(doc.data() as BlueprintLog));
    callback(changes);
  });
};

export const listenToQCLogs = (callback: (data: QCLog[]) => void) => {
  const q = query(collection(db, 'logs_qc'), orderBy('TGL_LOG', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const changes: QCLog[] = [];
    snapshot.forEach((doc) => changes.push(doc.data() as QCLog));
    callback(changes);
  });
};


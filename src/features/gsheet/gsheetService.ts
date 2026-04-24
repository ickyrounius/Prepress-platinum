import { db, rtdb } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { generateUniqueId, DEPT_CODES } from '@/lib/types/schema';

// URL Google Apps Script yang berfungsi sebagai fetcher data
const GSHEET_FETCH_URL = process.env.NEXT_PUBLIC_GSHEET_FETCH_URL || "https://script.google.com/macros/s/AKfycby-IMPORT-XXX/exec";

export interface GSheetImportResult {
  success: boolean;
  importedCount: number;
  error?: string;
}

/**
 * Service untuk menarik data dari Google Sheets dan memasukkannya ke Firestore/RTDB
 */
export const importDataFromGSheet = async (type: 'JOP' | 'JOS'): Promise<GSheetImportResult> => {
  try {
    const response = await fetch(`${GSHEET_FETCH_URL}?type=${type}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from GSheet: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.rows)) {
      throw new Error(data.error || "Invalid data format from GSheet");
    }

    const rows = data.rows;
    const batch = writeBatch(db);
    const collectionName = type === 'JOP' ? 'workflows_jop' : 'workflows_jos';
    const deptCode = type === 'JOP' ? DEPT_CODES.DT : DEPT_CODES.DG;

    let count = 0;
    for (const row of rows) {
      // Validasi minimal: Harus ada nomor JOP/JOS
      const mainNo = type === 'JOP' ? row.NO_JOP : row.NO_JOS;
      if (!mainNo) continue;

      const uniqueId = row.ID || generateUniqueId(deptCode);
      const docRef = doc(db, collectionName, uniqueId);

      const payload = {
        ...row,
        ID: uniqueId,
        id: uniqueId,
        LAST_UPDATED: serverTimestamp(),
        ST_WORKFLOW: row.ST_WORKFLOW || 'OPEN',
        imported_at: Date.now(),
      };

      batch.set(docRef, payload, { merge: true });

      // Jika statusnya bukan Closed, masukkan juga ke RTDB (Hybrid Sync)
      if (!['CLOSED', 'DONE', 'CANCEL'].includes((row.ST_WORKFLOW || '').toUpperCase())) {
        await set(ref(rtdb, `active_jobs/${collectionName}/${uniqueId}`), payload);
      }
      
      count++;
    }

    await batch.commit();
    return { success: true, importedCount: count };

  } catch (error: unknown) {
    console.error("GSheet Import Error:", error);
    return { 
      success: false, 
      importedCount: 0, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

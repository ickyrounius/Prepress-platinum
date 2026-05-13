import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, getDoc, serverTimestamp, increment } from "firebase/firestore";
import { DailyKPI } from "../job/jobTypes";

/**
 * Increment KPI metrics for a user on a specific date.
 * Uses Firestore FieldValue.increment for atomic updates.
 */
export async function updateDailyKPIMetrics(
  uid: string,
  userName: string,
  metrics: Partial<Omit<DailyKPI, "date" | "uid" | "NAMA" | "updatedAt">>
): Promise<void> {
  const today = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
  const docId = `${today}_${uid}`;
  const docRef = doc(db, "daily_kpi", docId);

  try {
    // We use setDoc with merge to ensure the document exists
    const updatePayload: any = {
      date: today,
      uid: uid,
      NAMA: userName,
      updatedAt: Date.now(),
    };

    // Transform metrics to increments
    Object.keys(metrics).forEach((key) => {
      const val = (metrics as any)[key];
      if (typeof val === "number") {
        updatePayload[key] = increment(val);
      } else {
        updatePayload[key] = val;
      }
    });

    await setDoc(docRef, updatePayload, { merge: true });
  } catch (error) {
    console.error("Failed to update daily KPI", error);
  }
}

/**
 * Specifically handles job completion KPI logic.
 * Should be called when ST_WF_JOP or ST_WF_JOS transitions to DONE/CLOSED.
 */
export async function recordJobCompletionKPI(
  uid: string,
  userName: string,
  type: "JOS" | "JOP",
  isOverdue: boolean,
  leadTime: number
): Promise<void> {
  const metrics: any = {};
  if (type === "JOS") {
    metrics.completedJOS = 1;
    if (isOverdue) metrics.overdueJOS = 1;
  } else {
    metrics.completedJOP = 1;
    if (isOverdue) metrics.overdueJOP = 1;
  }
  
  // Note: leadTime average calculation in Firestore is tricky without Cloud Functions.
  // We'll store sum or just the latest for now, or handle aggregation on the client.
  // For Spark plan, we'll just track the counts and let client calculate avg from 90-day history if needed,
  // or we could store totalLeadTime and completedCount to calculate avg.
  
  await updateDailyKPIMetrics(uid, userName, metrics);
}

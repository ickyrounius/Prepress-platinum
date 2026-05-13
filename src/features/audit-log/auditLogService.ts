import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface AuditLogPayload {
  actor_uid: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

/**
 * Record an action in the audit log for security and traceability.
 */
export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await addDoc(collection(db, "audit_logs"), {
      ...payload,
      before: payload.before || {},
      after: payload.after || {},
      timestamp: Date.now(), // Store as number for easy sorting/filtering
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}

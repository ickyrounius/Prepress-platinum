import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface AuditLogPayload {
  actorUid: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record an action in the audit log for security and traceability.
 */
export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await addDoc(collection(db, "audit_logs"), {
      actor_uid: payload.actorUid,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      metadata: payload.metadata || {},
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

export interface AuditLogPayload {
  actorUid?: string;
  actor_uid?: string;
  action: string;
  entityType?: string;
  entity_type?: string;
  entityId?: string;
  entity_id?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Record an action in the audit log for security and traceability.
 */
export async function recordAuditLog(payload: AuditLogPayload): Promise<void> {
  try {
    await addDoc(collection(db, "audit_logs"), {
      ...payload,
      actor_uid: payload.actorUid || payload.actor_uid, // Map to canonical field
      entity_type: payload.entityType || payload.entity_type, // Map to canonical field
      entity_id: payload.entityId || payload.entity_id, // Map to canonical field
      before: payload.before || {},
      after: payload.after || {},
      metadata: payload.metadata || {},
      timestamp: Date.now(), // Store as number for easy sorting/filtering
    });
  } catch (error) {
    console.error("Failed to write audit log", error);
  }
}

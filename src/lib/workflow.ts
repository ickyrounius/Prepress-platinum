export type WorkflowBucket = "closed" | "review" | "process" | "hold";

const CLOSED_STATUSES = ["CLOSED", "DONE", "ACC", "SELESAI", "SELESAI LAYOUT", "SELESAI CAD"];
const REVIEW_STATUSES = ["BLUEPRINT", "PREVIEW", "ACC DG", "ACC DG&MARKETING", "REVIEW"];
const PROCESS_STATUSES = ["LAYOUT", "ON PROGRESS", "PROSESS", "PROSES", "ASSIGNED"];
const HOLD_STATUSES = ["HOLD", "REVISI", "REJECT", "CANCEL"];

export type JopType = "EXPORT" | "JASA" | "LOCAL" | "SMS" | "KARTON_BOX";
export type JosType = "EXPORT" | "JASA" | "LOCAL" | "ALL";

export function detectJopType(value: unknown): JopType {
  const noJop = String(value || "").toUpperCase();
  if (noJop.startsWith("7B")) return "JASA";
  if (noJop.startsWith("79")) return "SMS";
  if (noJop.startsWith("9")) return "KARTON_BOX";
  if (noJop.startsWith("8")) return "EXPORT";
  return "LOCAL";
}

export function detectJosType(value: unknown): JosType {
  const jos = String(value || "").toUpperCase();
  if (jos.includes("EXPORT")) return "EXPORT";
  if (jos.includes("JASA")) return "JASA";
  if (jos.includes("LOCAL")) return "LOCAL";
  return "ALL";
}

export function classifyWorkflowStatus(statusValue: unknown, subStatusValue?: unknown): WorkflowBucket {
  const status = String(statusValue || "").toUpperCase();
  const subStatus = String(subStatusValue || "").toUpperCase();

  if (CLOSED_STATUSES.includes(status) || subStatus === "DONE" || ["SELESAI LAYOUT", "SELESAI CAD"].includes(subStatus)) return "closed";
  if (REVIEW_STATUSES.includes(status)) return "review";
  if (PROCESS_STATUSES.includes(status)) return "process";
  if (HOLD_STATUSES.includes(status)) return "hold";
  return "process";
}

const STATUS_NORMALIZATION_MAP: Record<string, string> = {
  PROSESS: "PROSES",
  PROSES: "PROSES",
  LAYOUT: "PROSES",
  "ON PROGRESS": "PROSES",
  ASSIGNED: "ASSIGNED",
  BLUEPRINT: "BLUEPRINT",
  PREVIEW: "PREVIEW",
  "ACC DG": "ACC DG",
  "ACC DG&MARKETING": "ACC DG&MARKETING",
  REVIEW: "REVIEW",
  HOLD: "HOLD",
  REVISI: "REVISI",
  REJECT: "REJECT",
  CANCEL: "CANCEL",
  APPROVED: "APPROVED",
  DONE: "DONE",
  SELESAI: "DONE",
  CLOSED: "DONE",
};

export function normalizeWorkflowStatusInput(value: unknown): string {
  const raw = String(value || "").toUpperCase().trim();
  return STATUS_NORMALIZATION_MAP[raw] || raw;
}

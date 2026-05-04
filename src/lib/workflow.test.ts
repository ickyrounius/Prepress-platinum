import { describe, expect, it } from "vitest";
import {
  classifyWorkflowStatus,
  detectJopType,
  detectJosType,
  normalizeWorkflowStatusInput,
  resolveWorkflowStatus,
} from "@/lib/workflow";

describe("workflow helpers", () => {
  it("maps JOP prefix to correct type", () => {
    expect(detectJopType("7B001")).toBe("JASA");
    expect(detectJopType("79001")).toBe("SMS");
    expect(detectJopType("90001")).toBe("KARTON_BOX");
    expect(detectJopType("80001")).toBe("EXPORT");
    expect(detectJopType("12345")).toBe("LOCAL");
  });

  it("normalizes status variants", () => {
    expect(normalizeWorkflowStatusInput("layout")).toBe("PROSES");
    expect(normalizeWorkflowStatusInput("selesai")).toBe("DONE");
    expect(normalizeWorkflowStatusInput("assigned")).toBe("ASSIGNED");
  });

  it("classifies workflow bucket with main and sub status", () => {
    expect(classifyWorkflowStatus("closed")).toBe("closed");
    expect(classifyWorkflowStatus("review")).toBe("review");
    expect(classifyWorkflowStatus("hold")).toBe("hold");
    expect(classifyWorkflowStatus("something-else", "done")).toBe("closed");
  });

  it("detects JOS type from text", () => {
    expect(detectJosType("order-export")).toBe("EXPORT");
    expect(detectJosType("jasa artwork")).toBe("JASA");
    expect(detectJosType("local print")).toBe("LOCAL");
    expect(detectJosType("misc")).toBe("ALL");
  });

  it("resolves status by source type with fallback", () => {
    const item = {
      ST_WF_JOP: "On Process",
      ST_WF_JOS: "Review",
      ST_WORKFLOW: "Legacy",
    };

    expect(resolveWorkflowStatus(item, "DT")).toBe("On Process");
    expect(resolveWorkflowStatus(item, "DG")).toBe("Review");
    expect(resolveWorkflowStatus(item)).toBe("On Process");
  });
});

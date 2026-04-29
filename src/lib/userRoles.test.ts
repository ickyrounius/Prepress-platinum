import { describe, expect, it } from "vitest";
import { ROLE_SELECT_GROUPS, USER_ROLES, isValidUserRole } from "@/lib/userRoles";

describe("userRoles", () => {
  it("validates known internal role", () => {
    expect(isValidUserRole("ADMIN")).toBe(true);
    expect(isValidUserRole("SPV PREPRESS")).toBe(true);
  });

  it("rejects unknown role", () => {
    expect(isValidUserRole("SUPERADMIN")).toBe(false);
    expect(isValidUserRole("")).toBe(false);
  });

  it("ensures every role in select groups exists in canonical list", () => {
    const groupedRoles = ROLE_SELECT_GROUPS.flatMap((group) => group.options);
    for (const role of groupedRoles) {
      expect(USER_ROLES.includes(role)).toBe(true);
    }
  });
});

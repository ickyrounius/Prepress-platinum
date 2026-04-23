export const USER_ROLES = [
  "ADMIN",
  "DEVELOPER",
  "MANAGER",
  "ADMIN DT",
  "ADMIN DG",
  "ADMIN PREPRESS",
  "SPV DT",
  "DT",
  "CAD",
  "SPV DG",
  "DG",
  "DS",
  "SPV PREPRESS",
  "KOORDINATOR",
  "PRODUCTION",
  "OP CTP",
  "OP CTCP",
  "OP FLEXO",
  "OP SCREEN",
  "OP ETCHING",
  "QC",
  "SUPPORT DESIGN",
  "GMG",
  "CNC",
  "BLUEPRINT",
] as const;

export type UserRole = typeof USER_ROLES[number];

export const ROLE_SELECT_GROUPS: Array<{ label: string; options: UserRole[] }> = [
  { label: "Core Control", options: ["ADMIN", "DEVELOPER", "MANAGER"] },
  { label: "Operational Admin", options: ["ADMIN DT", "ADMIN DG", "ADMIN PREPRESS"] },
  { label: "Design Department", options: ["SPV DG", "DG", "DS", "SPV DT", "DT", "CAD", "QC"] },
  { label: "Prepress Department", options: ["SPV PREPRESS", "KOORDINATOR", "PRODUCTION", "OP CTP", "OP CTCP", "OP FLEXO", "OP SCREEN", "OP ETCHING"] },
  { label: "Support Department", options: ["SUPPORT DESIGN", "GMG", "CNC", "BLUEPRINT"] },
];

export function isValidUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

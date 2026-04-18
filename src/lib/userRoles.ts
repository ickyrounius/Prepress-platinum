export const ROLE_SELECT_GROUPS = [
  {
    label: "Management & Admin",
    options: ["ADMIN", "DEVELOPER", "MANAGER", "SPV"],
  },
  {
    label: "Departemen DT",
    options: ["DT", "SPV DT", "ADMIN DT", "CAD", "QCDT"],
  },
  {
    label: "Departemen DG",
    options: ["DG", "DS", "SPV DG", "ADMIN DG", "QCDG"],
  },
  {
    label: "Departemen Prepress",
    options: [
      "PRODUCTION",
      "SPV PREPRESS",
      "KOORDINATOR",
      "OP CTP",
      "OP CTCP",
      "OP FLEXO",
      "OP SCREEN",
      "OP ETCHING",
      "ADMIN PREPRESS",
    ],
  },
  {
    label: "Support & QC",
    options: ["SUPPORT DESIGN", "GMG", "CNC", "BLUEPRINT", "QC"],
  },
];

export const ALL_ROLES = ROLE_SELECT_GROUPS.flatMap((g) => g.options);

export function isValidUserRole(role: string): boolean {
  return ALL_ROLES.includes(role.toUpperCase());
}

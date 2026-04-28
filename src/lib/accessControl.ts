export const ADMIN_ROLES = ["ADMIN", "DEVELOPER", "MANAGER"] as const;
export const OPERATIONAL_ADMIN_ROLES = ["ADMIN DT", "ADMIN DG", "ADMIN PREPRESS"] as const;
export const ALL_ADMIN_ROLES = [...ADMIN_ROLES, ...OPERATIONAL_ADMIN_ROLES] as const;

const ROLE_GROUPS = {
  dt: ["DT", "CAD", "SPV DT", "ADMIN DT"],
  dg: ["DG", "DS", "SPV DG", "ADMIN DG"],
  prepress: [
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
  support: ["SUPPORT DESIGN", "GMG", "CNC", "BLUEPRINT"],
  qc: ["QC"],
} as const;

interface RouteAccessRule {
  prefix: string;
  allow: string[];
}

const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { prefix: "/", allow: ["*"] },
  { prefix: "/dashboard/dt", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.dt, ...ROLE_GROUPS.qc] },
  { prefix: "/dashboard/dg", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.dg, ...ROLE_GROUPS.qc] },
  { prefix: "/dashboard/production", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.prepress] },
  { prefix: "/dashboard/prepress", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.prepress] },
  { prefix: "/dashboard/support", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.support] },
  { prefix: "/panel/admin/settings/kpi", allow: [...ALL_ADMIN_ROLES] },
  { prefix: "/panel/dt", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.dt] },
  { prefix: "/panel/dg", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.dg] },
  { prefix: "/panel/qc", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.qc, ...ROLE_GROUPS.dt, ...ROLE_GROUPS.dg] },
  { prefix: "/panel/spv", allow: [...ADMIN_ROLES, "SPV DT", "SPV DG", "SPV PREPRESS", "KOORDINATOR"] },
  { prefix: "/panel/prepress", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.prepress] },
  { prefix: "/panel/production", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.prepress] },
  { prefix: "/panel/support", allow: [...ADMIN_ROLES, ...ROLE_GROUPS.support] },
  { prefix: "/panel/admin", allow: [...ADMIN_ROLES] },
  { prefix: "/users/performance", allow: ["*"] },
  { prefix: "/users", allow: [...ALL_ADMIN_ROLES] },
  { prefix: "/audit-log", allow: [...ALL_ADMIN_ROLES] },
];

export function normalizeRole(role: string | null | undefined): string {
  return (role || "GUEST").toUpperCase().trim();
}

export function hasRouteAccess(pathname: string, role: string | null | undefined): boolean {
  const normalizedRole = normalizeRole(role);
  const sortedRules = [...ROUTE_ACCESS_RULES].sort((a, b) => b.prefix.length - a.prefix.length);
  const matchedRule = sortedRules.find((rule) => pathname.startsWith(rule.prefix));

  if (!matchedRule) return true;
  if (matchedRule.allow.includes("*")) return true;
  return matchedRule.allow.includes(normalizedRole);
}

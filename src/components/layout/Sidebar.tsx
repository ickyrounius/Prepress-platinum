'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/features/auth/AuthContext";
import { useLayoutStore } from '@/lib/store/useLayoutStore';
import { normalizeRole, ADMIN_ROLES } from '@/lib/accessControl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Printer,
  Layers,
  History,
  Book,
  Code,
  Scale,
  ShieldCheck,
  Crosshair,
  Wrench,
  House,
  BarChart,
  Factory,
  ChevronDown,
  ChevronRight,
  Cpu,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface MenuGroup {
  label: string;
  color?: 'rose' | 'amber' | 'violet' | 'emerald' | 'indigo' | 'cyan' | 'slate';
  items: MenuItem[];
  defaultOpen?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  item: MenuItem;
  pathname: string;
  closeSidebar: () => void;
  compact?: boolean;
}

const SidebarItem = ({ item, pathname, closeSidebar, compact }: SidebarItemProps) => {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link href={item.href} onClick={() => closeSidebar()}>
      <motion.div
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 relative mb-0.5",
          compact ? "px-3 py-2" : "px-4 py-2.5",
          isActive
            ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
        )}
      >
        <item.icon className={cn("shrink-0 text-inherit", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
        <span className="truncate">{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute -left-4 w-0.5 h-6 bg-indigo-500 rounded-r-full"
          />
        )}
      </motion.div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Collapsible Section Component
// ─────────────────────────────────────────────────────────────────────────────

const colorMap = {
  rose:    'text-rose-400',
  amber:   'text-amber-400',
  violet:  'text-violet-400',
  emerald: 'text-emerald-400',
  indigo:  'text-indigo-400',
  cyan:    'text-cyan-400',
  slate:   'text-slate-400',
};

interface CollapsibleGroupProps {
  group: MenuGroup;
  pathname: string;
  closeSidebar: () => void;
  compact?: boolean;
}

const CollapsibleGroup = ({ group, pathname, closeSidebar, compact }: CollapsibleGroupProps) => {
  const hasActive = group.items.some(
    item => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const [open, setOpen] = useState(group.defaultOpen || hasActive);
  const colorClass = colorMap[group.color ?? 'slate'];

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors group"
      >
        <span className={cn("text-[10px] font-black uppercase tracking-widest", colorClass)}>
          {group.label}
        </span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={cn("mt-0.5", compact ? "pl-2" : "pl-1")}>
              {group.items.map(item => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  closeSidebar={closeSidebar}
                  compact={compact}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Static Section Component (non-collapsible)
// ─────────────────────────────────────────────────────────────────────────────

interface StaticSectionProps {
  label: string;
  items: MenuItem[];
  pathname: string;
  closeSidebar: () => void;
  color?: string;
}

const StaticSection = ({ label, items, pathname, closeSidebar, color = 'text-slate-500' }: StaticSectionProps) => (
  <div>
    <p className={cn("px-4 text-[10px] font-black uppercase tracking-widest mb-2", color)}>
      {label}
    </p>
    {items.map(item => (
      <SidebarItem key={item.href} item={item} pathname={pathname} closeSidebar={closeSidebar} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Menu definitions
// ─────────────────────────────────────────────────────────────────────────────

const COMMON_MENU: MenuItem[] = [
  { name: 'Dashboard',  href: '/',             icon: House },
  { name: 'Analytics',  href: '/analytics',    icon: BarChart },
  { name: 'SOP Wiki',   href: '/docs/sop',     icon: Book },
];

const ADMIN_MENU: MenuItem[] = [
  { name: 'Admin Console',   href: '/panel/admin', icon: Settings },
  { name: 'App Settings',    href: '/settings',    icon: Wrench },
  { name: 'User Management', href: '/users',        icon: Users },
  { name: 'Log History',     href: '/audit-log',    icon: History },
];

const MENU_DT: MenuItem[] = [
  { name: 'Dashboard DT',    href: '/dashboard/dt',       icon: LayoutDashboard },
  { name: 'Input JOP Baru',  href: '/panel/dt/input-jop', icon: FileText },
  { name: 'Panel Kerja DT',  href: '/panel/dt',           icon: Settings },
];

const MENU_DG: MenuItem[] = [
  { name: 'Dashboard DG',    href: '/dashboard/dg',       icon: LayoutDashboard },
  { name: 'Input JOS Baru',  href: '/panel/dg/input-jos', icon: FileText },
  { name: 'Panel Kerja DG',  href: '/panel/dg',           icon: Settings },
];

const MENU_QC: MenuItem[] = [
  { name: 'Panel QC', href: '/panel/qc', icon: ShieldCheck },
];

const MENU_PREPRESS: MenuItem[] = [
  { name: 'Dashboard Prepress', href: '/dashboard/prepress', icon: LayoutDashboard },
  { name: 'Panel Prepress',     href: '/panel/prepress',     icon: Printer },
];

const MENU_PRODUCTION: MenuItem[] = [
  { name: 'Dashboard Produksi', href: '/dashboard/production', icon: LayoutDashboard },
  { name: 'Panel Produksi',     href: '/panel/production',     icon: Wrench },
];

const MENU_SUPPORT: MenuItem[] = [
  { name: 'Dashboard Support', href: '/dashboard/support', icon: LayoutDashboard },
  { name: 'Panel Support',     href: '/panel/support',     icon: Layers },
];

const MENU_SPV: MenuItem[] = [
  { name: 'Panel SPV (Coord)', href: '/panel/spv', icon: Scale },
];

// ─────────────────────────────────────────────────────────────────────────────
// Superadmin/Developer grouped menu (collapsible by department)
// ─────────────────────────────────────────────────────────────────────────────

const SUPERADMIN_GROUPS: MenuGroup[] = [
  {
    label: 'DT — Desain Teknik',
    color: 'indigo',
    items: MENU_DT,
  },
  {
    label: 'DG — Desain Grafis',
    color: 'violet',
    items: MENU_DG,
  },
  {
    label: 'QC — Quality Control',
    color: 'emerald',
    items: MENU_QC,
  },
  {
    label: 'Prepress & Produksi',
    color: 'amber',
    items: [...MENU_PREPRESS, ...MENU_PRODUCTION],
  },
  {
    label: 'Support',
    color: 'cyan',
    items: MENU_SUPPORT,
  },
  {
    label: 'SPV / Koordinator',
    color: 'rose',
    items: MENU_SPV,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role → menu mapping for regular users
// ─────────────────────────────────────────────────────────────────────────────

function getOperationalMenu(role: string | null): MenuItem[] {
  if (!role) return [];
  const r = normalizeRole(role);
  if ((ADMIN_ROLES as readonly string[]).includes(r)) return []; // handled by groups

  if (r === 'ADMIN DT')       return [...MENU_DT, ...MENU_QC];
  if (r === 'ADMIN DG')       return [...MENU_DG, ...MENU_QC];
  if (r === 'ADMIN PREPRESS') return [...MENU_SPV, ...MENU_PREPRESS, ...MENU_PRODUCTION];

  if (r === 'SPV DT')         return [...MENU_SPV, ...MENU_DT, ...MENU_QC];
  if (r === 'SPV DG')         return [...MENU_SPV, ...MENU_DG, ...MENU_QC];
  if (r === 'SPV PREPRESS')   return [...MENU_SPV, ...MENU_PREPRESS, ...MENU_PRODUCTION];
  if (r === 'KOORDINATOR')    return [...MENU_SPV, ...MENU_PREPRESS, ...MENU_PRODUCTION];

  if (r === 'DT' || r === 'CAD') return MENU_DT;
  if (r === 'DG' || r === 'DS')  return MENU_DG;
  if (r === 'QC')                return MENU_QC;

  if (['PRODUCTION', 'OP CTP', 'OP CTCP', 'OP FLEXO', 'OP SCREEN', 'OP ETCHING'].includes(r))
    return [...MENU_PREPRESS, ...MENU_PRODUCTION];

  if (['SUPPORT DESIGN', 'GMG', 'CNC', 'BLUEPRINT'].includes(r))
    return MENU_SUPPORT;

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar({ className }: { className?: string }) {
  const { role, loading } = useAuth();
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const pathname = usePathname();

  const normalizedRole = normalizeRole(role);
  const isSuperAdmin = (ADMIN_ROLES as readonly string[]).includes(normalizedRole);
  const isDeveloper  = normalizedRole === 'DEVELOPER';
  const isManager    = normalizedRole === 'MANAGER';
  const operationalMenu = getOperationalMenu(role);

  const userLabel = isDeveloper
    ? 'Super User'
    : isManager
      ? 'Admin User'
      : normalizedRole === 'ADMIN'
        ? 'Admin User'
        : 'Standard User';

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeSidebar()}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>

        {/* ── Logo Header ── */}
        <div className="px-5 py-4 border-b border-slate-800/70 shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-9 h-9 overflow-hidden rounded-lg bg-white p-1 shadow-md shadow-indigo-500/10 shrink-0">
              <Image src="/Prepress.png" alt="Prepress Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-black tracking-tight text-white uppercase leading-none">PREPRESS</h1>
              <p className="text-[9px] font-bold text-indigo-500 tracking-[0.25em] mt-0.5">PLATINUM</p>
            </div>
          </Link>
        </div>

        {/* ── Developer Banner ── */}
        {isDeveloper && !loading && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-700/30 flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-emerald-600/20 flex items-center justify-center shrink-0">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider leading-none">Developer Mode</p>
              <p className="text-[9px] text-emerald-600/80 mt-0.5 truncate">Full system access</p>
            </div>
            <Zap className="w-3 h-3 text-emerald-500/60 ml-auto shrink-0" />
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 custom-scrollbar px-3 py-3 space-y-4 min-h-0">
          {loading ? (
            <div className="animate-pulse space-y-2 px-1">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-9 bg-slate-800 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Main Menu — always visible */}
              <StaticSection
                label="Main Menu"
                items={COMMON_MENU}
                pathname={pathname}
                closeSidebar={closeSidebar}
              />

              {/* System Admin — ADMIN / DEVELOPER / MANAGER only */}
              {isSuperAdmin && (
                <StaticSection
                  label="System Admin"
                  items={ADMIN_MENU}
                  pathname={pathname}
                  closeSidebar={closeSidebar}
                  color="text-rose-400/80"
                />
              )}

              {/* Operational — grouped & collapsible for superadmin, flat for regular users */}
              {isSuperAdmin ? (
                <div className="space-y-1">
                  <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    Panels &amp; Dashboards
                  </p>
                  {SUPERADMIN_GROUPS.map(group => (
                    <CollapsibleGroup
                      key={group.label}
                      group={group}
                      pathname={pathname}
                      closeSidebar={closeSidebar}
                      compact
                    />
                  ))}
                </div>
              ) : (
                operationalMenu.length > 0 && (
                  <StaticSection
                    label="Operational"
                    items={operationalMenu}
                    pathname={pathname}
                    closeSidebar={closeSidebar}
                  />
                )
              )}
            </>
          )}
        </nav>

        {/* ── User Badge Footer ── */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 p-3 bg-slate-800/50 rounded-xl border border-white/5">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase shrink-0",
              isDeveloper
                ? "bg-emerald-600 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/30"
                : isManager
                  ? "bg-violet-600 shadow-lg shadow-violet-900/40"
                  : "bg-indigo-600"
            )}>
              {isDeveloper
                ? <Code className="w-4 h-4" />
                : isManager
                  ? <Crosshair className="w-4 h-4" />
                  : (role ? role.substring(0, 2) : '??')}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[11px] font-black text-white truncate leading-tight">{userLabel}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold truncate">
                {role || 'GUEST'}
              </p>
            </div>
            {isDeveloper && (
              <div className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
            )}
          </div>
        </div>

      </div>
    </>
  );
}

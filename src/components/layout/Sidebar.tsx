'use client';

import React from 'react';
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
  MonitorPlay,
  Layers,
  History,
  Book,
  Code,
  Scale,
  ShieldCheck,
  Crosshair,
  Wrench,
  Trophy,
  House,
  BarChart,
  Factory,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Item Component
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
  };
  pathname: string;
  closeSidebar: () => void;
}

const SidebarItem = ({ item, pathname, closeSidebar }: SidebarItemProps) => {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link href={item.href} onClick={() => closeSidebar()}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors relative mb-1",
          isActive
            ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        )}
      >
        <item.icon className="w-4 h-4 text-inherit shrink-0" />
        {item.name}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute -left-4 w-1 h-8 bg-indigo-500 rounded-r-full"
          />
        )}
      </motion.div>
    </Link>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Menu definitions
// ─────────────────────────────────────────────────────────────────────────────

const COMMON_MENU = [
  { name: 'Dashboard',   href: '/',             icon: House },
  { name: 'Analytics',   href: '/analytics',     icon: BarChart },
  { name: 'SOP Wiki',    href: '/docs/sop',      icon: Book },
  { name: 'Production',  href: '/panel/production', icon: Factory },
  { name: 'Support',     href: '/panel/support', icon: Layers },
  { name: 'Settings',    href: '/settings',      icon: Settings },
];

const ADMIN_MENU = [
  { name: 'Admin Console',    href: '/panel/admin', icon: Settings },
  { name: 'User Management',  href: '/users',       icon: Users },
  { name: 'Log History',      href: '/audit-log',   icon: History },
];

const MENU_DT = [
  { name: 'Dashboard DT',   href: '/dashboard/dt',          icon: LayoutDashboard },
  { name: 'Input JOP Baru', href: '/panel/dt/input-jop',   icon: FileText },
  { name: 'Panel Kerja DT', href: '/panel/dt',              icon: Settings },
];

const MENU_DG = [
  { name: 'Dashboard DG',   href: '/dashboard/dg',          icon: LayoutDashboard },
  { name: 'Input JOS Baru', href: '/panel/dg/input-jos',   icon: FileText },
  { name: 'Panel Kerja DG', href: '/panel/dg',              icon: Settings },
];

const MENU_QC = [
  { name: 'Panel QC',       href: '/panel/qc',              icon: ShieldCheck },
];

const MENU_PREPRESS = [
  { name: 'Dashboard Prepress', href: '/dashboard/prepress', icon: LayoutDashboard },
  { name: 'Panel Prepress',     href: '/panel/prepress',     icon: Printer },
];

const MENU_PRODUCTION = [
  { name: 'Dashboard Produksi', href: '/dashboard/production', icon: LayoutDashboard },
  { name: 'Panel Produksi',     href: '/panel/production',     icon: Wrench },
];

const MENU_SUPPORT = [
  { name: 'Dashboard Support', href: '/dashboard/support', icon: LayoutDashboard },
  { name: 'Panel Support',     href: '/panel/support',     icon: Layers },
];

const MENU_SPV = [
  { name: 'Panel SPV (Coord)', href: '/panel/spv', icon: Scale },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role → menu mapping (sinkron dengan userRoles.ts & accessControl.ts)
// ─────────────────────────────────────────────────────────────────────────────

function getOperationalMenu(role: string | null) {
  if (!role) return [];
  const r = normalizeRole(role);

  // Superuser — akses penuh ke semua panel
  if ((ADMIN_ROLES as readonly string[]).includes(r)) {
    return [...MENU_SPV, ...MENU_DT, ...MENU_DG, ...MENU_QC, ...MENU_SUPPORT, ...MENU_PREPRESS, ...MENU_PRODUCTION];
  }

  // Admin departemen — akses panel dept masing-masing + QC read
  if (r === 'ADMIN DT')       return [...MENU_DT, ...MENU_QC];
  if (r === 'ADMIN DG')       return [...MENU_DG, ...MENU_QC];
  if (r === 'ADMIN PREPRESS') return [...MENU_SPV, ...MENU_PREPRESS, ...MENU_PRODUCTION];

  // SPV & Koordinator
  if (r === 'SPV DT')         return [...MENU_SPV, ...MENU_DT, ...MENU_QC];
  if (r === 'SPV DG')         return [...MENU_SPV, ...MENU_DG, ...MENU_QC];
  if (r === 'SPV PREPRESS')   return [...MENU_SPV, ...MENU_PREPRESS, ...MENU_PRODUCTION];
  if (r === 'KOORDINATOR')    return [...MENU_SPV, ...MENU_PREPRESS, ...MENU_PRODUCTION];

  // Operator individual
  if (r === 'DT')  return MENU_DT;
  if (r === 'CAD') return MENU_DT;   // CAD adalah bagian dari DT
  if (r === 'DG')  return MENU_DG;
  if (r === 'DS')  return MENU_DG;   // Desainer Support masuk DG

  // QC standalone
  if (r === 'QC') return MENU_QC;

  // Prepress operators
  if (['PRODUCTION', 'OP CTP', 'OP CTCP', 'OP FLEXO', 'OP SCREEN', 'OP ETCHING'].includes(r)) {
    return [...MENU_PREPRESS, ...MENU_PRODUCTION];
  }

  // Support Design & GMG & CNC & Blueprint
  if (['SUPPORT DESIGN', 'GMG', 'CNC', 'BLUEPRINT'].includes(r)) {
    return MENU_SUPPORT;
  }

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
  const operationalMenu = getOperationalMenu(role);

  // Label tampil di footer sidebar
  const userLabel = normalizedRole === 'DEVELOPER'
    ? 'Super User'
    : normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER'
      ? 'Admin User'
      : 'Standard User';

  return (
    <>
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

        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg shadow-indigo-500/10">
              <Image
                src="/Prepress.png"
                alt="Prepress Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-black tracking-tighter text-white uppercase leading-none">PREPRESS</h1>
              <p className="text-[10px] font-bold text-indigo-500 tracking-[0.2em] mt-0.5">PLATINUM</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 space-y-6 mt-4 relative custom-scrollbar pb-10">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-slate-800 rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* Main Menu */}
              <div>
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
                {COMMON_MENU.map(item => (
                  <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />
                ))}
              </div>

              {/* System Admin — hanya ADMIN / DEVELOPER / MANAGER */}
              {isSuperAdmin && (
                <div>
                  <p className="px-4 text-[10px] font-black text-rose-500/80 uppercase tracking-widest mb-3 border-t border-slate-800 pt-5">System Admin</p>
                  {ADMIN_MENU.map(item => (
                    <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />
                  ))}
                </div>
              )}

              {/* Operational — sesuai role */}
              {operationalMenu.length > 0 && (
                <div>
                  <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-t border-slate-800 pt-5">Operational</p>
                  {operationalMenu.map(item => (
                    <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* User Badge (footer) */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase transition-all duration-300 shrink-0",
              normalizedRole === 'DEVELOPER'
                ? "bg-emerald-600 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/20"
                : normalizedRole === 'MANAGER'
                  ? "bg-violet-600 shadow-lg shadow-violet-900/40"
                  : "bg-indigo-600"
            )}>
              {normalizedRole === 'DEVELOPER'
                ? <Code className="w-5 h-5" />
                : normalizedRole === 'MANAGER'
                  ? <Crosshair className="w-5 h-5" />
                  : (role ? role.substring(0, 2) : '??')}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate">{userLabel}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold truncate">
                {role || 'GUEST'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

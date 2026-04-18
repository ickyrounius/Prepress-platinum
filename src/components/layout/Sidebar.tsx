'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/features/auth/AuthContext";
import { useLayoutStore } from '@/lib/store/useLayoutStore';
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
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
        <item.icon className="w-4 h-4 text-inherit" />
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

export function Sidebar({ className }: { className?: string }) {
  const { role, loading } = useAuth();
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const pathname = usePathname();

  const common = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Data Monitor', href: '/dashboard/data', icon: MonitorPlay },
    { name: 'SOP & Wiki', href: '/docs/sop', icon: Book },
  ];

  const adminMenu = [
    { name: 'System Settings', href: '/panel/admin/settings/kpi', icon: Settings },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Log History', href: '/audit-log', icon: History },
  ];

  const quickActionMenu = [
    { name: 'Quick Input (JOS/JOP)', href: '/panel/admin', icon: FileText },
  ];

  const operationalMenu = (() => {
    if (!role) return [];
    const normalizedRole = role.toUpperCase();
    
    const spv = [
      { name: 'Panel SPV (Coord)', href: '/panel/spv', icon: Scale },
    ];
    const dt = [
      { name: 'Dashboard DT', href: '/dashboard/dt', icon: LayoutDashboard },
      { name: 'Input JOP Baru', href: '/panel/dt/input-jop', icon: FileText },
      { name: 'Panel Kerja DT', href: '/panel/dt', icon: Settings },
    ];
    const dg = [
      { name: 'Dashboard DG', href: '/dashboard/dg', icon: LayoutDashboard },
      { name: 'Input JOS Baru', href: '/panel/dg/input-jos', icon: FileText },
      { name: 'Panel Kerja DG', href: '/panel/dg', icon: Settings },
    ];
    const ds = [
      { name: 'Dashboard Support', href: '/dashboard/support', icon: LayoutDashboard },
      { name: 'Panel Support', href: '/panel/support', icon: Layers },
    ];
    const prepress = [
      { name: 'Dashboard Prepress', href: '/dashboard/prepress', icon: LayoutDashboard },
      { name: 'Panel Prepress', href: '/panel/prepress', icon: Printer },
    ];
    const production = [
      { name: 'Dashboard Produksi', href: '/dashboard/production', icon: LayoutDashboard },
      { name: 'Panel Produksi', href: '/panel/production', icon: Settings },
    ];
    const qc = [
      { name: 'Panel QC', href: '/panel/qc', icon: CheckSquare },
    ];

    if (['ADMIN', 'DEVELOPER', 'MANAGER'].includes(normalizedRole)) {
      return [...spv, ...dt, ...dg, ...ds, ...prepress, ...production, ...qc];
    }

    switch(normalizedRole) {
      case 'SPV': return spv;
      case 'DT': return dt;
      case 'DG': return dg;
      case 'SUPPORT_DESIGN': return ds;
      case 'PREPRESS': return prepress;
      case 'PRODUCTION': return production;
      case 'QC':
      case 'QCDT':
      case 'QCDG': return qc;
      default: return [];
    }
  })();

  const isDevOrAdmin = ['ADMIN', 'DEVELOPER', 'MANAGER'].includes(role?.toUpperCase() || '');

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
        "fixed inset-y-0 left-0 z-50 flex flex-col h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
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

      <div className="flex-1 px-4 space-y-6 mt-4 overflow-y-auto relative custom-scrollbar pb-10">
        {loading ? (
          <div className="animate-pulse space-y-3">
             {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-slate-800 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div>
              <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
              {common.map(item => <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />)}
            </div>

            {isDevOrAdmin && (
              <div className="space-y-1">
                <p className="px-4 text-[10px] font-black text-rose-500/80 uppercase tracking-widest mb-3 border-t border-slate-800 pt-5">Developer Tools</p>
                {adminMenu.map(item => <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />)}
                <p className="px-4 text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-3 border-t border-slate-800 pt-5 mt-5">Quick Actions</p>
                {quickActionMenu.map(item => <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />)}
              </div>
            )}

            {operationalMenu.length > 0 && (
              <div>
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 border-t border-slate-800 pt-5">Operational</p>
                {operationalMenu.map(item => <SidebarItem key={item.name} item={item} pathname={pathname} closeSidebar={closeSidebar} />)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase transition-all duration-300",
            role?.toUpperCase() === 'DEVELOPER' 
              ? "bg-emerald-600 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/20" 
              : "bg-indigo-600"
          )}>
            {role?.toUpperCase() === 'DEVELOPER' ? <Code className="w-5 h-5" /> : (role ? role.substring(0, 2) : '??')}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-white truncate">
              {['DEVELOPER', 'MANAGER', 'ADMIN'].includes(role?.toUpperCase() || '') ? 'Super User' : 'Standard User'}
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold truncate">
              {role?.toUpperCase() === 'DEVELOPER' ? 'Admin System' : role || 'GUEST'}
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
);
}

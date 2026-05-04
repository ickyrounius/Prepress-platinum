"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutStore } from "@/lib/store/useLayoutStore";
import { 
  List, 
  ArrowsClockwise, 
  SignOut 
} from "@phosphor-icons/react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROUTE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: "/dashboard/data", title: "DATA MONITOR" },
  { prefix: "/dashboard/dt", title: "DASHBOARD DESIGN TEKNIK" },
  { prefix: "/dashboard/dg", title: "DASHBOARD DESIGN GRAFIS" },
  { prefix: "/dashboard/prepress", title: "DASHBOARD PREPRESS" },
  { prefix: "/dashboard/production", title: "DASHBOARD PRODUKSI" },
  { prefix: "/dashboard/support", title: "DASHBOARD SUPPORT" },
  { prefix: "/dashboard", title: "DASHBOARD" },
  { prefix: "/panel/admin/settings/kpi", title: "PENGATURAN KPI" },
  { prefix: "/panel/admin", title: "ADMIN CONSOLE" },
  { prefix: "/panel/dt/input-jop", title: "INPUT JOP BARU" },
  { prefix: "/panel/dg/input-jos", title: "INPUT JOS BARU" },
  { prefix: "/panel/prepress/request", title: "PERMINTAAN PREPRESS" },
  { prefix: "/panel/prepress", title: "PANEL PREPRESS" },
  { prefix: "/panel/production/ctp", title: "PANEL PRODUKSI CTP" },
  { prefix: "/panel/production/ctcp", title: "PANEL PRODUKSI CTCP" },
  { prefix: "/panel/production/flexo", title: "PANEL PRODUKSI FLEXO" },
  { prefix: "/panel/production/screen", title: "PANEL PRODUKSI SCREEN" },
  { prefix: "/panel/production/etching", title: "PANEL PRODUKSI ETCHING" },
  { prefix: "/panel/production", title: "PANEL PRODUKSI" },
  { prefix: "/panel/dt", title: "PANEL DESIGN TEKNIK" },
  { prefix: "/panel/dg", title: "PANEL DESIGN GRAFIS" },
  { prefix: "/panel/qc", title: "PANEL QUALITY CONTROL" },
  { prefix: "/panel/spv", title: "PANEL SPV / KOORDINATOR" },
  { prefix: "/panel/support", title: "PANEL SUPPORT" },
  { prefix: "/panel/kpi", title: "PERFORMA KPI" },
  { prefix: "/users/performance", title: "PERFORMA SAYA" },
  { prefix: "/users", title: "MANAJEMEN PENGGUNA" },
  { prefix: "/audit-log", title: "RIWAYAT LOG" },
  { prefix: "/analytics", title: "ANALYTICS" },
  { prefix: "/docs/sop", title: "SOP WIKI" },
  { prefix: "/settings", title: "PENGATURAN APLIKASI" },
];

export default function TopHeader() {
  const { user, name } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useLayoutStore();
  const [isSpinning, setIsSpinning] = useState(false);

  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "DASHBOARD";

    const matched = ROUTE_TITLES.find((item) => pathname.startsWith(item.prefix));
    if (matched) return matched.title;

    const parts = pathname.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return lastPart ? lastPart.replace(/-/g, " ").toUpperCase() : "PREPRESS PLATINUM";
  };

  const handleRefresh = () => {
    setIsSpinning(true);
    router.refresh();
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/90 sm:min-h-20 sm:gap-3 sm:px-6 lg:px-8 no-print">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button 
          title="Buka Sidebar" 
          aria-label="Buka sidebar navigasi"
          onClick={toggleSidebar}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition shrink-0"
        >
          <List weight="bold" className="text-xl sm:text-2xl" />
        </button>
        <h2 id="header-title" className="text-sm sm:text-xl font-bold text-slate-800 uppercase tracking-widest truncate max-w-[120px] sm:max-w-none">
          {getPageTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-3">
        <Button
          onClick={handleRefresh} 
          variant="ghost"
          size="sm"
          className="px-2 sm:px-3 text-slate-600 dark:text-slate-300"
        >
          <ArrowsClockwise weight="bold" className={isSpinning ? "animate-spin-custom text-indigo-500" : ""} />
          <span className="hidden sm:inline">REFRESH</span>
        </Button>

        <ThemeToggle />

        <div className="hidden sm:block h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

        <Badge id="user-display" variant="indigo" className="hidden md:inline-flex truncate max-w-[180px]">
          {name || user?.email || "USER"}
        </Badge>

        <Button
          onClick={async () => {
            try {
              await signOut(auth);
              window.location.href = '/login';
            } catch (err) {
              console.error("Logout failed", err);
              window.location.href = '/login';
            }
          }}
          variant="ghost"
          size="sm"
          className="px-2 sm:px-3 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
        >
          <SignOut weight="bold" /> <span className="hidden sm:inline">LOGOUT</span>
        </Button>
      </div>
    </header>
  );
}

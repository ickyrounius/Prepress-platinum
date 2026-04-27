"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { usePathname } from "next/navigation";
import { useLayoutStore } from "@/lib/store/useLayoutStore";
import { 
  List, 
  ArrowsClockwise, 
  SignOut 
} from "@phosphor-icons/react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function TopHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { toggleSidebar } = useLayoutStore();
  const [isSpinning, setIsSpinning] = useState(false);

  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "DASHBOARD";
    
    // Auto-generate title from path parts efficiently
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length > 0) {
      const lastPart = parts[parts.length - 1].replace(/-/g, ' ');
      // Contextual title based on parent department
      if (parts.includes('dg')) return `DG: ${lastPart}`;
      if (parts.includes('dt')) return `DT: ${lastPart}`;
      if (parts.includes('production')) return `PROD: ${lastPart}`;
      if (parts.includes('support')) return `SUP: ${lastPart}`;
      
      return lastPart;
    }
    return "FLOWORKS PREPRESS";
  };

  const handleRefresh = () => {
    setIsSpinning(true);
    // Simulate refresh data globally, or just reload the window
    window.location.reload();
    setTimeout(() => setIsSpinning(false), 1000);
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 w-full shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-3 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/90 sm:min-h-20 sm:gap-3 sm:px-6 lg:px-8 no-print">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button 
          title="Buka Sidebar" 
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
        <button 
          onClick={handleRefresh} 
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition active:scale-95"
        >
          <ArrowsClockwise weight="bold" className={isSpinning ? "animate-spin-custom text-indigo-500" : ""} />
          <span className="hidden sm:inline">REFRESH</span>
        </button>

        <ThemeToggle />

        <div className="hidden sm:block h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

        <span id="user-display" className="hidden md:inline-block text-[10px] sm:text-xs font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100 dark:border-indigo-800 truncate max-w-[180px]">
          {user?.displayName || user?.email || "USER"}
        </span>

        <button 
          onClick={async () => {
            try {
              await signOut(auth);
              window.location.href = '/login';
            } catch (err) {
              console.error("Logout failed", err);
              window.location.href = '/login';
            }
          }} 
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition border border-transparent hover:border-rose-100 dark:hover:border-rose-800"
        >
          <SignOut weight="bold" /> <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </div>
    </header>
  );
}

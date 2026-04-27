"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import { useLayoutStore } from "@/lib/store/useLayoutStore";
import { useAuth } from "@/features/auth/AuthContext";
import { hasRouteAccess } from "@/lib/accessControl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user && !hasRouteAccess(pathname || "/", role)) {
      router.replace("/");
    }
  }, [user, role, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 w-full relative z-[999]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex bg-background min-h-screen text-foreground relative w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <TopHeader />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

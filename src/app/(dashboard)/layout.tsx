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
    <div className="relative flex min-h-screen w-full items-start bg-background text-foreground">
      <Sidebar />
      
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px] animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

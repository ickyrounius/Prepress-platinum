"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import { useLayoutStore } from "@/lib/store/useLayoutStore";
import { useAuth } from "@/features/auth/AuthContext";
import { hasRouteAccess } from "@/lib/accessControl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, closeSidebar } = useLayoutStore();
  const { user, role, loading, validated, active } = useAuth();
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

  if (!validated || !active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full glass rounded-2xl p-8 border border-border/50 shadow-2xl text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Akun Menunggu Validasi</h1>
          <p className="text-muted-foreground mb-6">
            Akun Anda sedang menunggu validasi dari administrator. Silakan hubungi admin untuk mengaktifkan akun Anda.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-800">Catatan</p>
                <p className="text-xs text-amber-700">
                  Anda dapat menghubungi tim IT atau administrator departemen untuk mempercepat proses validasi.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
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

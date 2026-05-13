"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import { useUIStore } from "@/lib/store/useUIStore";
import RoleGuard from "@/components/layout/RoleGuard";
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
  const { sidebarOpen, setSidebarOpen } = useUIStore();
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
      <div className="flex min-h-screen items-center justify-center bg-slate-900 w-full relative z-[999]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!validated || !active) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <div className="max-w-md w-full rounded-2xl p-8 border border-slate-800 bg-slate-900/50 shadow-2xl text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-white">Akun Menunggu Validasi</h1>
          <p className="text-slate-400 mb-6">
            Akun Anda sedang menunggu validasi dari administrator. Silakan hubungi admin untuk mengaktifkan akun Anda.
          </p>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-amber-500">Catatan</p>
                <p className="text-xs text-amber-500/70">
                  Anda dapat menghubungi tim IT atau administrator departemen untuk mempercepat proses validasi.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full h-11 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-start bg-slate-950 text-slate-200">
      <Sidebar />
      
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RoleGuard>
              {children}
            </RoleGuard>
          </div>
        </main>
      </div>
    </div>
  );
}

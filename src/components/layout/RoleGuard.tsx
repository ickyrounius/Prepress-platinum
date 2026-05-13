'use client';

import { useUserStore } from '@/lib/store/useUserStore';
import { hasRouteAccess } from '@/lib/accessControl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * RoleGuard component to protect pages based on user roles.
 * Uses accessControl.ts rules to determine access.
 */
export default function RoleGuard({ children, fallback }: RoleGuardProps) {
  const { user, isAuthenticated } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();

  const hasAccess = hasRouteAccess(pathname, user?.KATEGORI);

  useEffect(() => {
    // If not authenticated, we might want to redirect to login
    // but usually handled by a higher level AuthGuard.
    // Here we focus on Role access.
    if (isAuthenticated && !hasAccess) {
      console.warn(`Access denied for role: ${user?.KATEGORI} at ${pathname}`);
    }
  }, [hasAccess, isAuthenticated, pathname, user?.KATEGORI]);

  if (!hasAccess) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-white mb-2">Akses Dibatasi</h2>
        <p className="text-slate-400 max-w-xs mb-6">
          Maaf, akun Anda ({user?.KATEGORI || 'GUEST'}) tidak memiliki izin untuk mengakses halaman ini.
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Kembali
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

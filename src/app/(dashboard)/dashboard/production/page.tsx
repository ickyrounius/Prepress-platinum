'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductionDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/prepress');
  }, [router]);

  return null;
}

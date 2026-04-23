'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupportDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/panel/support');
  }, [router]);

  return null;
}

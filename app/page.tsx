'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context/AppContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAppContext();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      // Both Admins and Company users now land on the dashboard
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
    </div>
  );
}

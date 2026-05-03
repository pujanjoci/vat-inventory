'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppContext } from '@/lib/context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, sidebarCollapsed, user, mounted } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  if (!mounted || !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Sidebar />
      <div className={cn(
        "flex flex-col min-h-screen transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <Navbar />
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

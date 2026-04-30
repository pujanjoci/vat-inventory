'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAppContext } from '@/lib/context/AppContext';
import { Badge } from '../ui/Badge';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, sidebarCollapsed } = useAppContext();

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

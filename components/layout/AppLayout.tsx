'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useApp } from '@/lib/context/AppContext';
import { Toast } from '../ui/Toast';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { toasts } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 font-body">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 ml-64 overflow-x-hidden">
          {children}
        </main>
      </div>
      
      {/* Toast Portal */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </div>
  );
};

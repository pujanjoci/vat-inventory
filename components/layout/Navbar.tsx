'use client';

import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export const Navbar = () => {
  const { settings } = useApp();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-8 ml-64">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-md">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search records..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-sm font-bold text-slate-900">{settings.companyName}</span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">PAN: {settings.panNo}</span>
        </div>
        
        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};



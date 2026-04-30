'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Factory, 
  FileText, 
  Settings,
  ChevronRight,
  Database,
  PieChart
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    label: 'Masters', 
    icon: Database,
    children: [
      { label: 'Raw Materials', href: '/masters/rm' },
      { label: 'Finished Goods', href: '/masters/fg' },
      { label: 'Byproducts', href: '/masters/bp' },
      { label: 'Parties', href: '/masters/party' },
      { label: 'GL Accounts', href: '/masters/gl' },
    ]
  },
  { 
    label: 'Transactions', 
    icon: TrendingUp,
    children: [
      { label: 'Purchase Entry', href: '/transactions/purchase' },
      { label: 'Sales Entry', href: '/transactions/sales' },
      { label: 'Production Entry', href: '/transactions/production' },
    ]
  },
  { 
    label: 'Reports', 
    icon: FileText,
    children: [
      { label: 'RM Stock', href: '/reports/rm-stock' },
      { label: 'FG & BP Stock', href: '/reports/fg-stock' },
      { label: 'VAT Summary', href: '/reports/vat-summary' },
    ]
  },
  { label: 'Costing', href: '/costing', icon: PieChart },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm tracking-tight">GANESH TEL MILL</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Inventory Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || item.children?.some(c => pathname === c.href);
          
          return (
            <div key={item.label} className="space-y-1">
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                    isActive 
                      ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-600 rounded-l-none' 
                      : 'hover:bg-slate-800 hover:text-white'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')} />
                  {item.label}
                </Link>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
                    <Icon className="w-3 h-3" />
                    {item.label}
                  </div>
                  <div className="space-y-0.5 ml-4">
                    {item.children?.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isChildActive 
                              ? 'text-white' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          )}
                        >
                          <ChevronRight className={cn('w-3 h-3', isChildActive ? 'text-indigo-500' : 'text-slate-600')} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">AD</div>
          <div className="flex flex-col">
            <span className="text-xs text-white font-semibold">Admin User</span>
            <span className="text-[10px] text-slate-500">604141622</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

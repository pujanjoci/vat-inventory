'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Database, 
  FileText, 
  PieChart, 
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAppContext } from '@/lib/context/AppContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  {
    title: 'Management',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Ledgers',
    items: [
      { label: 'Purchase Entry', href: '/transactions/purchase', icon: TrendingUp },
      { label: 'Sales Entry', href: '/transactions/sales', icon: TrendingUp },
      { label: 'Production Entry', href: '/transactions/production', icon: TrendingUp },
    ]
  },
  {
    title: 'Inventories',
    items: [
      { label: 'Raw Materials', href: '/masters/rm', icon: Database },
      { label: 'Finished Goods', href: '/masters/fg', icon: Database },
      { label: 'By-products', href: '/masters/bp', icon: Database },
      { label: 'Party Master', href: '/masters/party', icon: Database },
    ]
  },
  {
    title: 'Financials',
    items: [
      { label: 'VAT Summary', href: '/reports/vat-summary', icon: FileText },
      { label: 'Inventory Costing', href: '/costing', icon: PieChart },
    ]
  },
  {
    title: 'System',
    items: [
      { label: 'Preferences', href: '/settings', icon: Settings },
    ]
  }
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { settings, sidebarCollapsed: collapsed, setSidebarCollapsed: setCollapsed } = useAppContext();

  return (
    <aside 
      className={cn(
        "bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)] flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-[var(--color-border)] transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Area */}
      <div className="p-6 mb-2 flex items-center gap-3 h-20 border-b border-[var(--color-border)]">
        <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(197,160,89,0.3)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-[var(--color-text-primary)] font-bold text-sm tracking-tight uppercase whitespace-nowrap font-display">Vat & Inventory</span>
            <span className="text-[9px] text-[var(--color-text-muted)] font-bold tracking-[0.2em] uppercase truncate mt-0.5">{settings.companyName}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {navigation.map((group) => (
          <div key={group.title} className="space-y-2">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-4">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                      isActive 
                        ? 'bg-[var(--color-accent)] text-white shadow-[0_8px_16px_rgba(197,160,89,0.2)] border-b-2 border-amber-600/20' 
                        : 'hover:bg-[var(--color-accent-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-white' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]')} />
                    {!collapsed && <span>{item.label}</span>}
                    
                    {/* Active Indicator Line */}
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-20" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Area & Toggle */}
      <div className="p-4 border-t border-[var(--color-border)] bg-surface-raised/50">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-3 mb-4 rounded-xl bg-white border border-[var(--color-border)] shadow-sm">
            <div className="w-9 h-9 bg-accent-light border border-accent/20 rounded-full flex items-center justify-center text-xs font-bold text-accent shrink-0">
              {settings.userName?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs text-[var(--color-text-primary)] font-bold truncate">{settings.userName || 'Admin User'}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium font-mono">PAN: {settings.panNo}</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl hover:bg-[var(--color-accent-light)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-all duration-200 group"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" /> 
              <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

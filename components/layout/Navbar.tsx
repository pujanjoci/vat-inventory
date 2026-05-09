'use client';

import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAppContext } from '@/lib/context/AppContext';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { getFiscalYear } from '@/lib/calculations';

export const Navbar = () => {
  const { user } = useAppContext();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, i) => ({
    label: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
    href: '/' + pathParts.slice(0, i + 1).join('/')
  }));

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border)] sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 transition-all">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Breadcrumb - desktop only */}
        <nav className="hidden md:flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[var(--color-border-strong)]">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-[var(--color-text-primary)] font-medium" : ""}>
                  {b.label}
                </span>
              </React.Fragment>
            ))
          ) : (
            <span className="text-[var(--color-text-primary)] font-medium">Dashboard</span>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Fiscal Year Selector */}
        <div className="hidden sm:block">
          <Badge variant="brand" className="px-3 py-1 bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-indigo-100 shadow-sm">
            FY {getFiscalYear()}
          </Badge>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <button className="p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-raised)] rounded-lg relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-danger)] rounded-full border-2 border-white" />
          </button>
          
          <div className="h-8 w-px bg-[var(--color-border)] mx-1" />

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-bold text-[var(--color-text-primary)] leading-none">{user?.Username || 'Guest'}</span>
              <span className="text-[10px] font-medium text-[var(--color-text-muted)] mt-1">{user?.Role === 'Admin' ? 'System Administrator' : 'Company Staff'}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.Username?.substring(0, 1).toUpperCase() || 'G'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

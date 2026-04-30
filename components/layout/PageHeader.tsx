import React from 'react';
import { ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }: PageHeaderProps) => {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] mb-3">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              <span className={cn(
                "transition-colors",
                i === breadcrumbs.length - 1 ? "text-[var(--color-text-primary)] font-medium" : "hover:text-[var(--color-text-secondary)]"
              )}>
                {b.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      
      {/* Title row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] font-display tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] font-medium">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

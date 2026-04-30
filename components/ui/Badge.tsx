import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant = 
  | 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'neutral'
  | 'FINAL' | 'PRELIMINARY' | 'Yes' | 'No' | 'Taxable' 
  | 'Purchase' | 'Sale' | 'Return' | 'Vendor' | 'Customer';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
  brand: 'bg-accent-light text-accent border border-accent/10',
  neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
  
  // Specific mappings
  'FINAL':       'bg-success-light text-success border border-green-200',
  'PRELIMINARY': 'bg-warning-light text-warning border border-amber-200',
  'Yes':         'bg-success-light text-success',
  'No':          'bg-slate-100 text-slate-600',
  'Taxable':     'bg-accent-light text-accent border border-accent/20',
  'Purchase':    'bg-slate-100 text-slate-700 border border-slate-200',
  'Sale':        'bg-success-light text-success border border-success/10',
  'Return':      'bg-rose-50 text-rose-700 border border-rose-100',
  'Vendor':      'bg-amber-50 text-amber-700 border border-amber-100',
  'Customer':    'bg-slate-50 text-slate-700 border border-slate-100',
};

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  return (
    <span className={cn(
      'rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-flex items-center transition-colors duration-150',
      badgeVariants[variant],
      className
    )}>
      {children}
    </span>
  );
};

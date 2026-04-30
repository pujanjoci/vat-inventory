import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card = ({ children, title, className, headerAction }: CardProps) => {
  return (
    <div className={cn('premium-card bg-white overflow-hidden', className)}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

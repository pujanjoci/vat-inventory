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
    <div className={cn('bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden', className)}>
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          {title && <h3 className="text-lg font-display text-slate-800">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};


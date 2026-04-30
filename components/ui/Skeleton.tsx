import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton = ({ className, count = 1 }: SkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-[var(--color-border)] animate-pulse rounded-md',
            className
          )}
        />
      ))}
    </>
  );
};

export const MetricCardSkeleton = () => (
  <div className="premium-card p-5 space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-24" />
  </div>
);

export const TableSkeleton = () => (
  <div className="premium-card overflow-hidden">
    <div className="px-4 py-3 bg-[var(--color-surface-raised)] border-b border-[var(--color-border)]">
      <Skeleton className="h-8 w-64" />
    </div>
    <div className="p-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-[var(--color-border)] last:border-0">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  </div>
);

export const FormSkeleton = () => (
  <div className="premium-card p-6 space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="pt-4 border-t border-[var(--color-border)] flex justify-end gap-3">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

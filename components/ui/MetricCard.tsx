import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TrendingUp, TrendingDown } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number; // percentage value
  className?: string;
}

export const MetricCard = ({ title, value, icon: Icon, trend, className }: MetricCardProps) => {
  return (
    <div className={cn("bg-white border border-[var(--color-border)] rounded-xl p-5 relative overflow-hidden group hover:border-[var(--color-accent)] hover:shadow-[0_4px_20px_rgba(29,78,216,0.08)] transition-all duration-200", className)}>
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-1 h-full rounded-r-xl bg-transparent group-hover:bg-[var(--color-accent)] transition-colors duration-200" />
      
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          {title}
        </p>
        <div className="p-1.5 rounded-lg bg-[var(--color-accent-light)]">
          <Icon className="h-4 w-4 text-[var(--color-accent)]" />
        </div>
      </div>
      
      <div className="font-display text-[28px] font-bold text-[var(--color-text-primary)] leading-none mb-2">
        {value}
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className={trend >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}>
            {trend >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 inline mr-0.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 inline mr-0.5" />
            )}
            {Math.abs(trend)}%
          </span>
          <span className="text-[var(--color-text-muted)]">vs last month</span>
        </div>
      )}
    </div>
  );
};

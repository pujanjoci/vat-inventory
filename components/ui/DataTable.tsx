import React from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'right' | 'center';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  count?: number;
  onExport?: () => void;
  onSearch?: (query: string) => void;
  emptyMessage?: string;
  footerRows?: React.ReactNode;
}

export function DataTable<T>({ 
  columns, 
  data, 
  count, 
  onExport, 
  onSearch,
  emptyMessage = "No records found",
  footerRows
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden bg-white shadow-sm">
      {/* Table toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <input 
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] bg-white focus:outline-none focus:border-[var(--color-accent)] transition-colors" 
              placeholder="Search..." 
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)] w-full sm:w-auto justify-between">
          <span className="text-xs font-medium uppercase tracking-wider">{count ?? data.length} records</span>
          {onExport && (
            <button 
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-border)] bg-white hover:bg-[var(--color-surface-raised)] transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          )}
        </div>
      </div>
      
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]">
              {columns.map((col, i) => (
                <th 
                  key={i}
                  className={cn(
                    "px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--color-text-muted)] whitespace-nowrap",
                    col.align === 'right' ? 'text-right' : 'text-left',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-[var(--color-text-muted)] italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-accent-light/30 transition-colors duration-100 group">
                  {columns.map((col, colIndex) => {
                    const content = typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : (row[col.accessor] as React.ReactNode);
                    
                    return (
                      <td 
                        key={colIndex}
                        className={cn(
                          "px-4 py-3 text-[var(--color-text-primary)]",
                          col.align === 'right' ? 'text-right font-mono tabular-nums' : 'text-left',
                          col.className
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
          {footerRows && (
            <tfoot className="border-t-2 border-[var(--color-border-strong)] bg-[var(--color-surface-raised)]">
              {footerRows}
            </tfoot>
          )}
        </table>
      </div>
      
      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <p className="text-xs text-[var(--color-text-muted)]">
          Showing 1–{Math.min(data.length, 25)} of {count ?? data.length}
        </p>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-30 disabled:pointer-events-none hover:bg-white transition-colors" disabled>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded-lg border border-[var(--color-border)] disabled:opacity-30 disabled:pointer-events-none hover:bg-white transition-colors" disabled>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

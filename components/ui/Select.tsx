import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder = "Select an option", ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-text-secondary)] mb-1.5 block">
            {label}
            {props.required && <span className="text-[var(--color-danger)] ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'premium-input appearance-none bg-no-repeat bg-right pr-10',
            error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`,
            backgroundSize: '1.25rem'
          }}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
}

const colorStyles = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  slate: 'bg-slate-50 text-slate-600 border-slate-100',
};

export const MetricCard = ({ title, value, icon, trend, color = 'indigo' }: MetricCardProps) => {
  return (
    <div className={`p-6 rounded-2xl border ${colorStyles[color]} relative overflow-hidden group hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{title}</p>
          <h3 className="text-3xl font-bold font-mono text-slate-900">{value}</h3>
          
          {trend && (
            <p className={`text-sm mt-3 font-medium flex items-center gap-1 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className="text-lg leading-none">{trend.isPositive ? '↑' : '↓'}</span>
              {trend.value} <span className="text-slate-500 ml-1">vs last month</span>
            </p>
          )}
        </div>
        
        {icon && (
          <div className="p-3 bg-white/50 rounded-xl">
            {icon}
          </div>
        )}
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {icon}
      </div>
    </div>
  );
};

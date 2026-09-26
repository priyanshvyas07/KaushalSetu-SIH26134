import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  dataLabel?: 'REAL' | 'SAMPLE' | 'FORECAST';
  icon?: any;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  dataLabel,
  icon: Icon,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500 text-[11px]">{subtitle}</span>}
        {change && (
          <span className={`font-medium text-[11px] tabular-nums ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
            {change}
          </span>
        )}
        {dataLabel && (
          <DataSourceBadge
            type={dataLabel === 'REAL' ? 'VERIFIED' : 'BENCHMARK'}
            source="Industry Demand Benchmark"
          />
        )}
      </div>
    </div>
  );
};

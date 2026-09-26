import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';
import { LucideIcon } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  supportingContext?: string;
  icon?: LucideIcon;
  showVerified?: boolean;
  verifiedSource?: string;
  sourceType?: 'VERIFIED' | 'BENCHMARK' | 'FORECAST';
  onClick?: () => void;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  supportingContext,
  icon: Icon,
  showVerified = true,
  verifiedSource,
  sourceType = 'BENCHMARK',
  onClick,
  className = '',
}) => {
  const changeStyles = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    negative: 'text-rose-700 bg-rose-50 border-rose-200/60',
    warning: 'text-amber-700 bg-amber-50 border-amber-200/60',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200/60',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          {Icon && (
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </span>
          {change && (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border tabular-nums ${
                changeStyles[changeType]
              }`}
            >
              {change}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-600 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        {supportingContext ? (
          <span className="text-slate-500 truncate" title={supportingContext}>
            {supportingContext}
          </span>
        ) : (
          <span className="text-slate-400">Validated against industry index</span>
        )}

        {showVerified && (
          <DataSourceBadge
            source={verifiedSource || 'National Labour Demand Benchmark'}
            type={sourceType}
          />
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Check, ShieldCheck, Info } from 'lucide-react';

interface DataSourceBadgeProps {
  source?: string;
  timestamp?: string;
  type?: 'VERIFIED' | 'BENCHMARK' | 'FORECAST';
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source = 'Industry Demand Benchmark (SIH26134 Baseline)',
  timestamp,
  type = 'BENCHMARK',
  className = '',
}) => {
  if (type === 'VERIFIED') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-normal ${className}`}
        title={timestamp ? `Source: ${source} · Last synced ${timestamp}` : `Source: ${source}`}
      >
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
        </span>
        <span className="font-medium text-slate-700">Verified Live Data</span>
        {timestamp && (
          <>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 text-[10px] tabular-nums">{timestamp}</span>
          </>
        )}
      </div>
    );
  }

  if (type === 'FORECAST') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-normal ${className}`}
        title={`Source: ${source} (Predictive Model Forecast)`}
      >
        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
          <Info className="w-2.5 h-2.5 stroke-[2.5]" />
        </span>
        <span className="font-medium text-amber-800">Model Forecast</span>
      </div>
    );
  }

  // Default: BENCHMARK / DEMO
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-normal ${className}`}
      title={timestamp ? `Source: ${source} · Benchmark Model` : `Source: ${source}`}
    >
      <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
        <Info className="w-2.5 h-2.5 stroke-[2.5]" />
      </span>
      <span className="font-medium text-slate-600">Benchmark Data</span>
      {timestamp && (
        <>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="text-slate-500 text-[10px] tabular-nums">{timestamp}</span>
        </>
      )}
    </div>
  );
};

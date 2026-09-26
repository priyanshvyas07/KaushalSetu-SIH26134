import React from 'react';

interface DataBadgeProps {
  type: 'REAL' | 'SAMPLE' | 'FORECAST';
  label?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ type, label }) => {
  if (type === 'REAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        {label || 'REAL DATA'}
      </span>
    );
  }

  if (type === 'FORECAST') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        {label || 'MODEL FORECAST'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {label || 'SAMPLE BENCHMARK'}
    </span>
  );
};

import React from 'react';

export type StatusVariant =
  | 'critical'
  | 'warning'
  | 'success'
  | 'neutral'
  | 'info';

interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  size = 'sm',
  dot = true,
  className = '',
}) => {
  const styles: Record<StatusVariant, { container: string; dot: string }> = {
    critical: {
      container: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    warning: {
      container: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    success: {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    neutral: {
      container: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
    },
    info: {
      container: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      dot: 'bg-indigo-500',
    },
  };

  const current = styles[variant] || styles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md whitespace-nowrap ${sizeClasses} ${current.container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />}
      <span>{label}</span>
    </span>
  );
};

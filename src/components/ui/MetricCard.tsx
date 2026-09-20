import React from 'react';
import { LucideIcon } from 'lucide-react';
import { DataSourceBadge, DataSourceType } from './DataSourceBadge';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon;
  statusColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate';
  source?: DataSourceType | string;
  lastUpdated?: string;
  onClick?: () => void;
  actionLabel?: string;
  className?: string;
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  statusColor = 'slate',
  source,
  lastUpdated,
  onClick,
  actionLabel,
  className = '',
  id
}) => {
  const colorMap = {
    emerald: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    amber: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    rose: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
    blue: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    slate: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
  };

  const isInteractive = Boolean(onClick);

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-200 ${
        isInteractive ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-2 rounded-lg border ${colorMap[statusColor]}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
        </div>
        {source && <DataSourceBadge source={source} lastUpdated={lastUpdated} />}
      </div>

      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
          {value !== undefined && value !== null && !isNaN(Number(value)) ? value : value || '—'}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>{subtitle}</span>
          {actionLabel && isInteractive && (
            <span className="text-slate-900 dark:text-slate-200 font-medium hover:underline text-[11px]">
              {actionLabel} &rarr;
            </span>
          )}
        </p>
      )}
    </div>
  );
};

import React from 'react';
import { Cpu, User, Radio, RefreshCw } from 'lucide-react';

export type DataSourceType = 'automatic' | 'manual' | 'agent' | 'network' | 'audit';

interface DataSourceBadgeProps {
  source: DataSourceType | string;
  lastUpdated?: string;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  lastUpdated,
  className = ''
}) => {
  const norm = source.toLowerCase();
  const isAuto = norm === 'automatic' || norm === 'agent' || norm === 'network';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide transition-colors ${
        isAuto
          ? 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          : 'bg-amber-50 text-amber-800 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50'
      } ${className}`}
      title={lastUpdated ? `Source: ${source} · Last recorded: ${lastUpdated}` : `Source: ${source}`}
    >
      {isAuto ? (
        <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
      ) : (
        <User className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      )}
      <span className="capitalize">{norm}</span>
      {lastUpdated && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
          · {lastUpdated}
        </span>
      )}
    </span>
  );
};

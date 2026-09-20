import React from 'react';

export type HealthLevel = 'healthy' | 'attention' | 'critical' | 'offline' | 'unknown' | 'stale';

interface HealthIndicatorProps {
  level: HealthLevel | string;
  label?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  level,
  label,
  subtext,
  size = 'md',
  showPulse = false,
  className = ''
}) => {
  const norm = (level || 'unknown').toLowerCase();

  let dotColor = 'bg-slate-400';
  let pulseColor = 'bg-slate-400';
  let textColor = 'text-slate-700 dark:text-slate-300';
  let defaultLabel = 'Unknown';

  switch (norm) {
    case 'healthy':
    case 'operational':
    case 'ready':
    case 'online':
    case 'live':
      dotColor = 'bg-emerald-500';
      pulseColor = 'bg-emerald-400';
      textColor = 'text-emerald-700 dark:text-emerald-400';
      defaultLabel = 'Healthy';
      break;
    case 'attention':
    case 'warning':
    case 'recent':
      dotColor = 'bg-amber-500';
      pulseColor = 'bg-amber-400';
      textColor = 'text-amber-700 dark:text-amber-400';
      defaultLabel = 'Attention';
      break;
    case 'critical':
    case 'failed':
    case 'blocked':
      dotColor = 'bg-rose-500';
      pulseColor = 'bg-rose-400';
      textColor = 'text-rose-700 dark:text-rose-400';
      defaultLabel = 'Critical';
      break;
    case 'offline':
    case 'disconnected':
      dotColor = 'bg-slate-500';
      pulseColor = 'bg-slate-400';
      textColor = 'text-slate-600 dark:text-slate-400';
      defaultLabel = 'Offline';
      break;
    case 'stale':
      dotColor = 'bg-orange-400';
      pulseColor = 'bg-orange-300';
      textColor = 'text-orange-700 dark:text-orange-400';
      defaultLabel = 'Stale Data';
      break;
    default:
      dotColor = 'bg-slate-400';
      pulseColor = 'bg-slate-300';
      textColor = 'text-slate-500 dark:text-slate-400';
      defaultLabel = 'Unknown';
      break;
  }

  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-semibold' : 'text-sm font-medium';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex items-center justify-center">
        {showPulse && norm !== 'offline' && norm !== 'unknown' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${pulseColor}`} />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${dotColor}`} />
      </span>
      <div className="flex flex-col">
        <span className={`${textSize} ${textColor} tracking-tight select-none`}>
          {label || defaultLabel}
        </span>
        {subtext && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};

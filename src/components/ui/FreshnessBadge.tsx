import React from 'react';
import { Activity, Clock, AlertTriangle, WifiOff } from 'lucide-react';

interface FreshnessBadgeProps {
  status?: 'live' | 'recent' | 'stale' | 'unavailable' | 'zero';
  secondsAgo?: number;
  lastUpdated?: string;
  source?: string;
  className?: string;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  status = 'live',
  secondsAgo,
  lastUpdated,
  source,
  className = ''
}) => {
  let label = 'Live';
  let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
  let Icon = Activity;
  let pulse = true;

  if (status === 'unavailable') {
    label = 'Telemetry Unavailable';
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
    Icon = WifiOff;
    pulse = false;
  } else if (status === 'stale' || (secondsAgo !== undefined && secondsAgo > 60)) {
    label = 'Stale Data';
    badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800/60';
    Icon = AlertTriangle;
    pulse = false;
  } else if (status === 'recent' || (secondsAgo !== undefined && secondsAgo >= 15)) {
    label = 'Recent';
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
    Icon = Clock;
    pulse = false;
  }

  let timingText = '';
  if (secondsAgo !== undefined) {
    if (secondsAgo < 5) timingText = 'Just now';
    else if (secondsAgo < 60) timingText = `${secondsAgo}s ago`;
    else timingText = `${Math.floor(secondsAgo / 60)}m ago`;
  } else if (lastUpdated) {
    timingText = lastUpdated;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border tracking-wide uppercase ${badgeStyle} ${className}`}
      title={source ? `Source: ${source}` : undefined}
    >
      <Icon className={`w-3 h-3 ${pulse ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
      {timingText && <span className="normal-case font-medium opacity-80">· {timingText}</span>}
    </span>
  );
};

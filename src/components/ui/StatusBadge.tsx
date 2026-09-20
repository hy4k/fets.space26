import React from 'react';
import { SystemStatus, IssuePriority, IssueStatus } from '../../types';
import { CheckCircle2, AlertTriangle, XCircle, WifiOff, Wrench, Clock, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: SystemStatus | IssueStatus | IssuePriority | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showPulse = false,
  className = ''
}) => {
  const normalized = status.toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let dot = 'bg-slate-400 dark:bg-slate-500';
  let Icon = Clock;
  let label = status;

  switch (normalized) {
    case 'operational':
    case 'ready':
    case 'passed':
    case 'resolved':
    case 'closed':
    case 'installed':
    case 'available':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60';
      dot = 'bg-emerald-500 dark:bg-emerald-400';
      Icon = CheckCircle2;
      label = normalized === 'operational' ? 'Operational' : status;
      break;

    case 'attention':
    case 'needs_attention':
    case 'in_progress':
    case 'warning':
    case 'medium':
    case 'assigned':
      bg = 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60';
      dot = 'bg-amber-500 dark:bg-amber-400';
      Icon = AlertTriangle;
      label = normalized === 'attention' ? 'Attention' : status;
      break;

    case 'critical':
    case 'high':
    case 'failed':
    case 'issue':
    case 'not_ready':
    case 'lost':
      bg = 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60';
      dot = 'bg-rose-500 dark:bg-rose-400';
      Icon = ShieldAlert;
      label = normalized === 'critical' ? 'Critical' : status;
      break;

    case 'offline':
    case 'missing':
    case 'retired':
      bg = 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      dot = 'bg-slate-400 dark:bg-slate-500';
      Icon = WifiOff;
      label = normalized === 'offline' ? 'Offline' : status;
      break;

    case 'maintenance':
    case 'in_repair':
      bg = 'bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60';
      dot = 'bg-indigo-500 dark:bg-indigo-400';
      Icon = Wrench;
      label = normalized === 'maintenance' ? 'Maintenance' : status;
      break;

    case 'open':
    case 'scheduled':
    case 'low':
      bg = 'bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60';
      dot = 'bg-blue-500 dark:bg-blue-400';
      Icon = Clock;
      label = status;
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide whitespace-nowrap select-none transition-colors ${bg} ${sizeClasses[size]} ${className}`}
    >
      {showPulse ? (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dot} opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dot}`}></span>
        </span>
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`}></span>
      )}
      <span className="capitalize">{label}</span>
    </span>
  );
};

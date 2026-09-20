import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertSeverity = 'critical' | 'attention' | 'info';

interface AlertBannerProps {
  severity: AlertSeverity | string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  severity,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  className = ''
}) => {
  const norm = severity.toLowerCase();

  const styles = {
    critical: {
      bg: 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    attention: {
      bg: 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    info: {
      bg: 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const current = norm === 'critical' ? styles.critical : norm === 'attention' || norm === 'warning' ? styles.attention : styles.info;
  const Icon = current.icon;

  return (
    <div
      className={`rounded-xl border p-4 flex items-start gap-3 shadow-xs ${current.bg} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${current.iconColor}`} />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        <p className="mt-0.5 text-xs opacity-90 leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${current.btn}`}
          >
            {actionLabel}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

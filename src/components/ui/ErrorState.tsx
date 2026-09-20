import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title: string;
  reason?: string;
  lastSuccessfulUpdate?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  reason,
  lastSuccessfulUpdate,
  onRetry,
  isRetrying = false,
  className = ''
}) => {
  return (
    <div
      className={`rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-6 flex flex-col sm:flex-row items-start gap-4 ${className}`}
    >
      <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200 uppercase tracking-wider">
          {title}
        </h4>
        {reason && (
          <p className="mt-1 text-sm text-rose-800 dark:text-rose-300 leading-relaxed">
            <strong className="font-semibold">Reason:</strong> {reason}
          </p>
        )}
        {lastSuccessfulUpdate && (
          <p className="mt-1.5 text-xs text-rose-700/80 dark:text-rose-400/80">
            Last successful update: {lastSuccessfulUpdate}
          </p>
        )}
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
        </button>
      )}
    </div>
  );
};

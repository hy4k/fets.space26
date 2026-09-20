import React from 'react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading telemetry...',
  subtext,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm ${className}`}
    >
      <div className="w-10 h-10 mb-4 relative flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-800 dark:border-t-slate-200 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 tracking-tight">
        {message}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          {subtext}
        </p>
      )}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 ${className}`}>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
  </div>
);

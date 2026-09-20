import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};

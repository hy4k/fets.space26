import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useApp();
  const [showTooltip, setShowTooltip] = useState(false);

  const isDark = theme === 'dark';
  const tooltipText = isDark ? 'Switch to Light mode' : 'Switch to Dark mode';

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        id="fets-theme-toggle"
        onClick={toggleTheme}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={tooltipText}
        aria-pressed={isDark}
        title={tooltipText}
        className="relative w-[32px] h-[32px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 cursor-pointer group"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
        )}
      </button>

      {/* Accessible Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute right-0 top-full mt-1.5 z-50 px-2 py-1 text-[11px] font-medium text-white bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded shadow-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100"
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
};

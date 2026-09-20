import React from 'react';
import {
  Printer,
  AlertTriangle,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PrinterTelemetry } from '../../types';

interface PrinterStatusCardProps {
  data: PrinterTelemetry | null;
  isLoading: boolean;
  timeAgoText: string;
  onClick: () => void;
}

export const PrinterStatusCard: React.FC<PrinterStatusCardProps> = ({
  data,
  isLoading,
  timeAgoText,
  onClick
}) => {
  const isLive = data?.isLive ?? false;
  const isDemo = data?.monitoringMode === 'DEMO_ONLY' || (!isLive && data?.provider === 'MOCK_DEMO');
  const health = data?.healthStatus || 'UNKNOWN';
  const state = data?.printerState || 'UNKNOWN';
  const ip = data?.ipAddress || '192.168.29.91';

  // Toner level calculation
  const rawTonerLevel = data?.toner?.levelPercent;
  const isTonerAvailable = typeof rawTonerLevel === 'number' && !Number.isNaN(rawTonerLevel);
  const tonerLevel = isTonerAvailable ? rawTonerLevel : null;

  // State badge styling
  const renderBadge = () => {
    if (isLoading && !data) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
          POLLING...
        </span>
      );
    }

    if (health === 'OFFLINE' || data?.networkStatus === 'DISCONNECTED') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10px] font-bold text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
          <span>OFFLINE</span>
        </span>
      );
    }

    if (state === 'PAPER_JAM' || health === 'CRITICAL') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-[10px] font-bold text-rose-800 dark:text-rose-300 animate-pulse">
          <AlertCircle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
          <span>PAPER JAM</span>
        </span>
      );
    }

    if (state === 'PAPER_EMPTY') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
          <span>OUT OF PAPER</span>
        </span>
      );
    }

    if (state === 'PRINTING') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[10px] font-bold text-blue-800 dark:text-blue-300">
          <Activity className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 animate-spin" />
          <span>PRINTING</span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>READY</span>
      </span>
    );
  };

  return (
    <div
      id="kpi-card-network-printer"
      onClick={onClick}
      title="Network Printer: HP Laser MFP 1188fnw (192.168.29.91)"
      className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none relative group flex flex-col justify-between h-full ${
        state === 'PAPER_JAM' || health === 'CRITICAL'
          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-slate-800 dark:text-slate-200 hover:border-rose-400 dark:hover:border-rose-700 shadow-2xs hover:shadow-xs ring-1 ring-rose-200/60 dark:ring-rose-900/60'
          : health === 'OFFLINE' || data?.networkStatus === 'DISCONNECTED'
          ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs hover:shadow-xs'
          : state === 'PAPER_EMPTY'
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-slate-800 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-700 shadow-2xs hover:shadow-xs ring-1 ring-amber-200/60 dark:ring-amber-900/60'
          : 'bg-gradient-to-br from-white via-[#FAF9F6] to-[#F5EFE6]/50 dark:from-[#12141A] dark:via-[#101217] dark:to-[#0B0D12] border-stone-200/90 dark:border-[#2C2417] text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:hover:border-[#C5A059]/40 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Top Row: Title + Status Indicator */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-stone-900 dark:text-[#FAF7F2]">
            <Printer className="w-4 h-4 text-[#C5A059] dark:text-[#DFB76C] shrink-0" />
            <span className="font-bold tracking-tight text-stone-900 dark:text-[#FAF7F2] truncate">HP 1188fnw</span>
          </div>

          <div className="shrink-0">{renderBadge()}</div>
        </div>

        {/* Central Display: IP & Toner Level */}
        <div className="mt-2">
          <div className="flex items-baseline justify-between gap-1">
            <div className="font-mono text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
              {ip}
            </div>
            {isTonerAvailable && (
              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                    (tonerLevel ?? 0) <= 15
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tonerLevel}%
                </span>
              </div>
            )}
          </div>

          {/* Subtitle / Status row */}
          <div className="text-[11px] opacity-75 mt-1 truncate flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium">
            <span className="truncate">
              {state === 'READY'
                ? 'Tray 1 Ready • Standby'
                : state === 'PAPER_JAM'
                ? 'Clear Paper Jam'
                : state === 'PAPER_EMPTY'
                ? 'Media Empty (Add Paper)'
                : data?.location?.split('/')[0] || 'Control Desk'}
            </span>
            {isTonerAvailable && <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">Toner</span>}
          </div>

          {/* Toner progress bar */}
          {isTonerAvailable && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  (tonerLevel ?? 0) <= 15
                    ? 'bg-amber-500'
                    : (tonerLevel ?? 0) <= 30
                    ? 'bg-blue-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, tonerLevel ?? 0))}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-100/90 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
        <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
          Click for details
        </span>
        <span className="text-slate-400 dark:text-slate-500 font-normal shrink-0 ml-1">
          {timeAgoText}
        </span>
      </div>
    </div>
  );
};

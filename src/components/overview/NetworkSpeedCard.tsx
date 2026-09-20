import React, { useMemo } from 'react';
import { Network, AlertTriangle, AlertCircle, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { NetworkOverview } from '../../types';

interface NetworkSpeedCardProps {
  data: NetworkOverview | null;
  isLoading: boolean;
  timeAgoText: string;
  onClick: () => void;
  systemsCount?: number;
  ispName?: string;
  ispSpeed?: string;
}

export const NetworkSpeedCard: React.FC<NetworkSpeedCardProps> = ({
  data,
  isLoading,
  timeAgoText,
  onClick,
  systemsCount = 40,
  ispName = 'JIO Forun',
  ispSpeed = '1 Gbps'
}) => {
  // Determine telemetry status
  const status = data?.status || (isLoading ? 'live' : 'unavailable');
  const downloadMbps = typeof data?.downloadMbps === 'number' && !Number.isNaN(data.downloadMbps) ? data.downloadMbps : 0;
  const uploadMbps = typeof data?.uploadMbps === 'number' && !Number.isNaN(data.uploadMbps) ? data.uploadMbps : 0;
  const connectedCount = data?.connectedSystems ?? systemsCount;

  // Micro-visual bars calculation (7 micro bars reflecting recent throughput activity)
  const microBars = useMemo(() => {
    if (!data?.recentReadings || data.recentReadings.length === 0) {
      return [4, 7, 10, 13, 11, 8, 5];
    }
    const recent = data.recentReadings.slice(-7);
    const validDl = recent.map((r) => (typeof r.downloadMbps === 'number' && !Number.isNaN(r.downloadMbps) ? r.downloadMbps : 0));
    const maxDl = Math.max(...validDl, 350);
    return validDl.map((dl) => {
      const pct = Math.max(0.15, Math.min(1, maxDl > 0 ? dl / maxDl : 0.2));
      return Math.round(pct * 14); // height in px (3px to 14px)
    });
  }, [data?.recentReadings]);

  return (
    <div
      id="kpi-card-network-speed"
      onClick={onClick}
      title="Live Overall Testing Centre Network Speed • Click for Network Overview"
      className="p-4 rounded-xl border border-stone-200/90 dark:border-[#2C2417] hover:border-[#C5A059] dark:hover:border-[#DFB76C] bg-gradient-to-br from-white via-[#FAF9F6] to-[#F5EFE6]/60 dark:from-[#13161F] dark:via-[#101217] dark:to-[#0A0C0F] text-stone-800 dark:text-stone-200 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer select-none relative group flex flex-col justify-between h-full min-h-[140px]"
    >
      {/* Top Row: Title + LIVE / Status Indicator */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-stone-900 dark:text-[#FAF7F2]">
            <Network className="w-4 h-4 text-[#C5A059] dark:text-[#DFB76C]" />
            <span className="font-bold tracking-tight uppercase text-[11px]">Network</span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium truncate max-w-[110px]" title={`${ispName} (${ispSpeed})`}>
              • {ispName}
            </span>
          </div>

          {/* Status Badge */}
          {status === 'live' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          )}

          {status === 'recent' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>RECENT</span>
            </div>
          )}

          {status === 'stale' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-[10px] font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>DATA STALE</span>
            </div>
          )}

          {status === 'unavailable' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-[10px] font-bold text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
              <span>OFFLINE</span>
            </div>
          )}

          {status === 'zero' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>CONNECTED</span>
            </div>
          )}
        </div>

        {/* Central Display: Aggregate Speed or Status Alert */}
        <div className="mt-2.5">
          {status === 'stale' ? (
            /* STALE STATE: Do NOT continue showing old Mbps values as though they are live */
            <div className="py-1">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>DATA STALE</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs font-mono font-medium text-slate-400 dark:text-slate-500 bg-amber-50/50 dark:bg-amber-950/30 px-2 py-1 rounded border border-amber-100 dark:border-amber-900/40">
                <span>↓ -- Mbps</span>
                <span>↑ -- Mbps</span>
              </div>
            </div>
          ) : status === 'unavailable' ? (
            /* SOURCE FAILURE: Show NETWORK DATA UNAVAILABLE instead of 0 Mbps */
            <div className="py-1">
              <div className="text-[11px] font-black text-rose-800 dark:text-rose-300 tracking-tight leading-tight">
                NETWORK DATA UNAVAILABLE
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                Monitoring source unreachable
              </div>
            </div>
          ) : (
            /* LIVE / RECENT / ZERO TRAFFIC DISPLAY */
            <div>
              <div className="flex items-baseline justify-between gap-2">
                {/* Download */}
                <div>
                  <div className="text-2xl font-black tracking-tight text-stone-900 dark:text-[#FAF7F2] flex items-baseline gap-0.5">
                    <span className="text-[#C5A059] dark:text-[#DFB76C] font-bold text-lg">↓</span>
                    <span>{Math.round(downloadMbps)}</span>
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 font-mono ml-0.5">Mbps</span>
                  </div>
                  <div className="text-[9px] font-bold text-[#9C7934] dark:text-[#DFB76C] uppercase tracking-wider">
                    DOWNLOAD
                  </div>
                </div>

                {/* Upload */}
                <div>
                  <div className="text-2xl font-black tracking-tight text-stone-900 dark:text-[#FAF7F2] flex items-baseline gap-0.5">
                    <span className="text-[#C5A059] dark:text-[#DFB76C] font-bold text-lg">↑</span>
                    <span>{Math.round(uploadMbps)}</span>
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 font-mono ml-0.5">Mbps</span>
                  </div>
                  <div className="text-[9px] font-bold text-[#9C7934] dark:text-[#DFB76C] uppercase tracking-wider">
                    UPLOAD
                  </div>
                </div>
              </div>

              {/* Live Micro-Visual: subtle animated throughput indicator */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-end gap-1 h-3.5" title="Recent aggregate throughput activity">
                  {microBars.map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${Math.max(3, h)}px` }}
                      className="w-1 bg-[#C5A059] dark:bg-[#DFB76C] rounded-t-xs transition-all duration-300"
                    />
                  ))}
                </div>
                <span className="text-[10px] font-semibold text-[#9C7934] dark:text-[#DFB76C]">
                  {status === 'zero' ? 'No active traffic' : 'Centre Aggregate'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Systems Connected & Freshness */}
      <div className="mt-3 pt-2 border-t border-stone-200/90 dark:border-[#2C2417] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-semibold text-[#9C7934] dark:text-[#DFB76C]">
          <span>{connectedCount} Systems</span>
          {data?.refreshInterval && (
            <span className="text-[9px] px-1.5 py-0.5 font-mono font-medium rounded bg-stone-200/60 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300">
              {data.refreshInterval}s rate
            </span>
          )}
        </div>
        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
          {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
          {timeAgoText}
        </span>
      </div>
    </div>
  );
};

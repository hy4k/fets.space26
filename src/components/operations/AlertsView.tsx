import React, { useState } from 'react';
import {
  BellRing,
  AlertTriangle,
  ShieldAlert,
  WifiOff,
  Info,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Alert } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

export const AlertsView: React.FC = () => {
  const { alerts, markAlertResolved, resolveAlert, markNotificationRead, navigate, currentCentre } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.systemId && a.systemId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || a.type === filterType;

    return matchesSearch && matchesType;
  });

  const activeCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Real-Time Operational Alerts</h2>
            {activeCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold border border-rose-300 dark:border-rose-700">
                {activeCount} Active Alerts
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry threshold triggers, offline node alerts, and hardware diagnostics for {currentCentre.name}.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'critical', 'attention', 'offline', 'info'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'all' ? 'All Alerts' : type}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search alerts or workstation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-56 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border transition-all ${
              alert.resolved
                ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                : alert.type === 'critical'
                ? 'bg-rose-50/50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-800/60 shadow-2xs'
                : alert.type === 'attention'
                ? 'bg-amber-50/50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-800/60 shadow-2xs'
                : alert.type === 'offline'
                ? 'bg-slate-100 dark:bg-slate-850 border-slate-300 dark:border-slate-700 shadow-2xs'
                : 'bg-blue-50/50 dark:bg-blue-950/25 border-blue-200 dark:border-blue-800/60 shadow-2xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <StatusBadge status={alert.type} size="md" />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{alert.title}</h3>
                    {alert.systemId && (
                      <button
                        onClick={() => navigate('system-detail', alert.systemId)}
                        className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 hover:underline bg-white dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700"
                      >
                        {alert.systemId}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{alert.timestamp}</span>

                {!alert.resolved && (
                  <button
                    onClick={() => (markAlertResolved || resolveAlert)(alert.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    Resolve Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

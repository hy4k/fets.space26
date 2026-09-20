import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';

export const ExamAndAlertsOverview: React.FC = () => {
  const { examApps, alerts, navigate } = useApp();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* EXAM APPLICATIONS OVERVIEW */}
      <div className="lg:col-span-2 bg-gradient-to-br from-white via-[#FCFBF8] to-[#FAF8F4] dark:from-[#12141A] dark:via-[#101217] dark:to-[#0B0D11] p-5 rounded-xl border border-stone-200/90 dark:border-[#2C2417] shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-[#262017]">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#FAF7F2] tracking-wide uppercase">
              Exam Applications Coverage
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">Live Client Distribution across 36 Workstations</span>
          </div>
          <button
            onClick={() => navigate('exams')}
            className="text-xs font-semibold text-[#9C7934] dark:text-[#DFB76C] hover:text-[#7A5D24] dark:hover:text-[#F3D797] flex items-center gap-1 cursor-pointer"
          >
            <span>View Applications</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {examApps.map((app) => {
            const coveragePct =
              (app?.totalSystems ?? 0) > 0 ? Math.round((app.installedCount / app.totalSystems) * 100) : 0;
            const missingCount = Math.max(0, (app?.totalSystems ?? 0) - (app?.installedCount ?? 0));

            return (
              <div
                key={app.id}
                onClick={() => navigate('exam-detail', app.id)}
                className="p-3 rounded-lg border border-stone-100 dark:border-[#262017] hover:border-[#C5A059]/40 hover:bg-[#FAF8F4] dark:hover:bg-[#161822] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: app.color }}
                    />
                    <span className="text-xs font-bold text-stone-900 dark:text-[#FAF7F2] group-hover:text-[#9C7934] dark:group-hover:text-[#DFB76C] transition-colors">
                      {app.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 dark:bg-[#1A1D26] text-stone-600 dark:text-stone-300 rounded font-mono border border-stone-200 dark:border-[#2C2417]">
                      v{app.currentVersion}
                    </span>
                    {missingCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded font-medium border border-amber-200 dark:border-amber-800">
                        {missingCount} Missing
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300">
                      {app.installedCount} / {app.totalSystems} installed
                    </span>
                    <span
                      className={`text-xs font-black font-mono ${
                        coveragePct === 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {coveragePct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 dark:bg-[#1A1D26] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      coveragePct === 100 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${coveragePct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT OPERATIONAL ALERTS */}
      <div className="bg-gradient-to-br from-white via-[#FCFBF8] to-[#FAF8F4] dark:from-[#12141A] dark:via-[#101217] dark:to-[#0B0D11] p-5 rounded-xl border border-stone-200/90 dark:border-[#2C2417] shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-[#262017]">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-[#FAF7F2] tracking-wide uppercase">Recent Alerts</h3>
              <span className="text-[10px] px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold rounded-full border border-rose-200 dark:border-rose-800">
                {alerts.filter((a) => !a.resolved).length} Active
              </span>
            </div>
            <button
              onClick={() => navigate('alerts')}
              className="text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#FAF7F2] cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="space-y-2.5">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  if (alert.systemId) navigate('system-detail', alert.systemId);
                  else navigate('alerts');
                }}
                className="p-2.5 rounded-lg border border-stone-100 dark:border-[#262017] hover:border-stone-200 dark:hover:border-[#382E20] hover:bg-stone-50/80 dark:hover:bg-[#161822] cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.type} size="sm" />
                    <span className="text-xs font-bold text-stone-900 dark:text-[#FAF7F2]">{alert.systemId || 'Centre'}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300 mt-1">{alert.title}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 dark:border-[#262017] mt-4">
          <button
            onClick={() => navigate('issues')}
            className="w-full py-2 text-center text-xs font-semibold text-stone-800 dark:text-[#FAF7F2] hover:bg-[#FAF8F4] dark:hover:bg-[#1A1D26] rounded-lg transition-colors border border-stone-200 dark:border-[#2C2417] hover:border-[#C5A059] cursor-pointer"
          >
            Open Ticket Management System →
          </button>
        </div>
      </div>
    </div>
  );
};

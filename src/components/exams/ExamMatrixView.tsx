import React, { useState } from 'react';
import {
  Table,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Download,
  Filter,
  Search,
  ArrowLeft,
  GraduationCap,
  UserCheck,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Check,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExamAppCategory, InstalledExamApp } from '../../types';

export const ExamMatrixView: React.FC = () => {
  const { examApps, systems, navigate, currentCentre, updateExamAppStatus, openSystemDetail } = useApp();

  const [activeDivision, setActiveDivision] = useState<ExamAppCategory>('delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIssueOnly, setFilterIssueOnly] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ systemId: string; appId: string } | null>(null);

  // Split apps
  const deliveryApps = examApps.filter((a) => a.category === 'delivery' || (!a.category && !a.id.startsWith('admin-')));
  const adminApps = examApps.filter((a) => a.category === 'admin_admission' || a.id.startsWith('admin-'));

  const currentApps = activeDivision === 'delivery' ? deliveryApps : adminApps;

  // Split systems
  const targetSystems = systems.filter((s) => activeDivision === 'delivery' ? s.type === 'workstation' : s.type === 'admin_pc');

  // Filter systems
  const filteredSystems = targetSystems.filter((system) => {
    const matchesSearch =
      system.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      system.network.ipAddress.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterIssueOnly) {
      // Check if any app on this system has issue or missing or drift
      return currentApps.some((app) => {
        const item = system.examApps?.find((a) => a.appId === app.id || a.code === app.code);
        if (!item || item.status !== 'installed') return true;
        if (app.expectedVersion && item.version !== app.expectedVersion) return true;
        return false;
      });
    }

    return true;
  });

  // Calculate column totals
  const columnStats = currentApps.map((app) => {
    let installed = 0;
    let missing = 0;
    let issue = 0;
    let drift = 0;

    targetSystems.forEach((sys) => {
      const match = sys.examApps?.find((a) => a.appId === app.id || a.code === app.code);
      if (match?.status === 'installed') {
        installed++;
        if (app.expectedVersion && match.version !== app.expectedVersion) {
          drift++;
        }
      } else if (match?.status === 'issue') {
        issue++;
      } else {
        missing++;
      }
    });

    const total = targetSystems.length;
    const pct = total > 0 ? Math.round((installed / total) * 100) : 0;

    return {
      appId: app.id,
      installed,
      missing,
      issue,
      drift,
      pct
    };
  });

  const handleExportCSV = () => {
    const headers = ['System ID', 'Hostname', 'IP Address', ...currentApps.map((a) => `${a.code} (v${a.currentVersion})`)];
    const rows = filteredSystems.map((s) => {
      const appCols = currentApps.map((app) => {
        const item = s.examApps?.find((a) => a.appId === app.id || a.code === app.code);
        return item ? `${item.status} (${item.version || 'unknown'})` : 'missing';
      });
      return [s.id, s.name, s.network.ipAddress, ...appCols];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FETS_${activeDivision}_Matrix_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('exams')}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Return to Applications Directory"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Applications Grid
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-mono">{currentCentre.name}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Full Applications & Systems Matrix
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Division Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveDivision('delivery')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDivision === 'delivery'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>DIVISION 1: EXAM DELIVERY MATRIX ({deliveryApps.length} Apps • 36 Workstations)</span>
            </button>

            <button
              onClick={() => setActiveDivision('admin_admission')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDivision === 'admin_admission'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>DIVISION 2: ADMIN / ADMISSION MATRIX ({adminApps.length} Apps • Admin PCs)</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search node or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              onClick={() => setFilterIssueOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                filterIssueOnly
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Filter Needs Attention
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-200 font-bold sticky top-0 z-20 shadow-2xs">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3.5 min-w-[140px] bg-slate-50 dark:bg-slate-850 sticky left-0 z-30">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    {activeDivision === 'delivery' ? 'Testing Workstation' : 'Admin Workstation'}
                  </div>
                </th>
                <th className="px-3 py-3.5 min-w-[120px]">IP / Subnet</th>
                {currentApps.map((app) => (
                  <th key={app.id} className="px-3 py-3 text-center min-w-[130px] border-l border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-[11px] shadow-xs mb-1"
                        style={{ backgroundColor: app.color || (activeDivision === 'delivery' ? '#059669' : '#4F46E5') }}
                      >
                        {app.code}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{app.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">Target v{app.expectedVersion || app.currentVersion}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSystems.map((system) => (
                <tr key={system.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Sticky left column with station name */}
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-white sticky left-0 z-10 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-r border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => openSystemDetail(system.id)}
                      className="text-left hover:text-emerald-800 dark:hover:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="text-sm font-black">{system.id}</span>
                      <span className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[80px]">
                        ({system.name})
                      </span>
                    </button>
                  </td>

                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {system.network.ipAddress}
                  </td>

                  {/* Application matrix cells */}
                  {currentApps.map((app) => {
                    const match = system.examApps?.find((a) => a.appId === app.id || a.code === app.code);
                    const status = match ? match.status : ('missing' as InstalledExamApp['status']);
                    const version = match?.version || null;
                    const expected = app.expectedVersion || app.currentVersion;
                    const hasDrift = status === 'installed' && version && expected && version !== expected;
                    const isCellOpen = selectedCell?.systemId === system.id && selectedCell?.appId === app.id;

                    return (
                      <td
                        key={app.id}
                        className="px-2 py-2 text-center border-l border-slate-100 dark:border-slate-800 relative"
                      >
                        <div className="relative inline-block w-full">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCell(isCellOpen ? null : { systemId: system.id, appId: app.id })
                            }
                            className={`w-full py-1.5 px-2 rounded-lg border text-center font-mono text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                              status === 'installed'
                                ? hasDrift
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100'
                                : status === 'issue'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {status === 'installed' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : status === 'issue' ? (
                                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                              ) : (
                                <XCircle className="w-3 h-3 text-slate-400 shrink-0" />
                              )}
                              <span className="capitalize text-[10px]">
                                {status === 'installed' ? (version ? `v${version}` : 'Installed') : status}
                              </span>
                            </div>

                            {hasDrift && (
                              <span className="text-[8.5px] font-extrabold text-amber-700 dark:text-amber-400 tracking-tight">
                                Drift (Exp v{expected})
                              </span>
                            )}
                          </button>

                          {/* Quick Interactive Status Popover */}
                          {isCellOpen && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-10 z-50 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 text-left space-y-1 animate-in fade-in zoom-in-95">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1 border-b border-slate-100 dark:border-slate-700">
                                {system.id} • {app.code}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  updateExamAppStatus(system.id, app.id, 'installed', undefined, app.expectedVersion || app.currentVersion);
                                  setSelectedCell(null);
                                }}
                                className="w-full text-left px-2 py-1 rounded text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Installed (v{app.expectedVersion || app.currentVersion})</span>
                                {status === 'installed' && !hasDrift && <Check className="w-3 h-3" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  updateExamAppStatus(system.id, app.id, 'missing');
                                  setSelectedCell(null);
                                }}
                                className="w-full text-left px-2 py-1 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between cursor-pointer"
                              >
                                <span>Missing</span>
                                {status === 'missing' && <Check className="w-3 h-3" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  updateExamAppStatus(system.id, app.id, 'issue');
                                  setSelectedCell(null);
                                }}
                                className="w-full text-left px-2 py-1 rounded text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Issue / Broken</span>
                                {status === 'issue' && <Check className="w-3 h-3" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  updateExamAppStatus(system.id, app.id, 'not_verified');
                                  setSelectedCell(null);
                                }}
                                className="w-full text-left px-2 py-1 rounded text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-between cursor-pointer"
                              >
                                <span>Not Verified</span>
                                {status === 'not_verified' && <Check className="w-3 h-3" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Summary Footer Row */}
            <tfoot className="bg-slate-100 dark:bg-slate-850 font-bold border-t-2 border-slate-300 dark:border-slate-700 sticky bottom-0 z-20">
              <tr>
                <td className="px-4 py-3 sticky left-0 z-30 bg-slate-100 dark:bg-slate-850 text-slate-900 dark:text-white uppercase text-[11px]">
                  Fleet Compliance Total
                </td>
                <td className="px-3 py-3 text-slate-500 font-mono text-[11px]">
                  {filteredSystems.length} Nodes
                </td>
                {columnStats.map((stat) => (
                  <td key={stat.appId} className="px-3 py-3 text-center border-l border-slate-200 dark:border-slate-800">
                    <div className="font-mono text-xs font-black text-slate-900 dark:text-white">
                      {stat.pct}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {stat.installed}/{targetSystems.length} Active
                    </div>
                    {stat.drift > 0 && (
                      <div className="text-[9px] text-amber-700 dark:text-amber-400 font-bold">
                        {stat.drift} Drift
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Download,
  ExternalLink,
  Layers,
  Cpu,
  Monitor,
  Check,
  SlidersHorizontal,
  ChevronRight,
  LayoutGrid,
  List,
  UserCheck,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { SystemCard } from '../systems/SystemCard';
import { SystemRecord, InstalledExamApp } from '../../types';

export const ExamDetailView: React.FC = () => {
  const {
    examApps,
    selectedEntityId,
    systems,
    navigate,
    currentCentre,
    updateExamAppStatus,
    openSystemDetail
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'installed' | 'missing' | 'issue' | 'not_verified' | 'drift'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isVerifyingAll, setIsVerifyingAll] = useState(false);

  // Match current exam app or default to Pearson VUE / first app
  const exam = examApps.find((e) => e.id === selectedEntityId || e.code === selectedEntityId) || examApps[1] || examApps[0];

  if (!exam) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-300 font-semibold">Application record not found.</p>
        <button
          onClick={() => navigate('exams')}
          className="mt-4 px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 cursor-pointer"
        >
          Return to Applications Directory
        </button>
      </div>
    );
  }

  const isAdminApp = exam.category === 'admin_admission' || exam.id.startsWith('admin-');

  // Eligible fleet systems:
  // Admin applications -> ONLY Admin PCs (ADM-01, MW01)
  // Exam Delivery applications -> ONLY Workstations (W001..W036)
  const eligibleSystems = systems.filter((s) => (isAdminApp ? s.type === 'admin_pc' : s.type === 'workstation'));

  // Workstation mapping with installation details
  const systemStatuses = eligibleSystems.map((system) => {
    const match = system.examApps?.find((a) => a.appId === exam.id || a.code === exam.code);
    const installed = match ? match.status === 'installed' : false;
    const status = match ? match.status : ('missing' as InstalledExamApp['status']);
    const version = match ? match.version : null;
    const expectedVersion = match?.expectedVersion || exam.expectedVersion || exam.currentVersion;
    const hasDrift = installed && version && expectedVersion && version !== expectedVersion;

    return {
      system,
      installed,
      status,
      version,
      expectedVersion,
      hasDrift,
      lastVerified: match?.lastVerifiedDate || match?.lastVerified || '2026-08-28',
      verifiedBy: match?.verifiedBy || 'Automated Sync',
      notes: match?.notes
    };
  });

  const filteredItems = systemStatuses.filter((ws) => {
    const matchesSearch =
      ws.system.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.system.network.ipAddress.includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterState === 'all') return true;
    if (filterState === 'installed') return ws.status === 'installed';
    if (filterState === 'missing') return ws.status === 'missing';
    if (filterState === 'issue') return ws.status === 'issue';
    if (filterState === 'not_verified') return ws.status === 'not_verified' || ws.status === 'not_checked';
    if (filterState === 'drift') return ws.hasDrift;
    return true;
  });

  const installedCount = systemStatuses.filter((s) => s.status === 'installed').length;
  const missingCount = systemStatuses.filter((s) => s.status === 'missing').length;
  const issueCount = systemStatuses.filter((s) => s.status === 'issue').length;
  const driftCount = systemStatuses.filter((s) => s.hasDrift).length;
  const coveragePct = eligibleSystems.length > 0 ? Math.round((installedCount / eligibleSystems.length) * 100) : 0;

  const handleStatusChange = (systemId: string, newStatus: InstalledExamApp['status']) => {
    updateExamAppStatus(systemId, exam.id, newStatus);
  };

  const handleVerifyAll = () => {
    setIsVerifyingAll(true);
    eligibleSystems.forEach((s) => {
      updateExamAppStatus(s.id, exam.id, 'installed', undefined, exam.currentVersion, 'Fleet Audit');
    });
    setTimeout(() => setIsVerifyingAll(false), 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('exams')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Back to Applications Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm shrink-0"
              style={{ backgroundColor: exam.color || (isAdminApp ? '#4F46E5' : '#059669') }}
            >
              {exam.code}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{exam.name}</h1>
                
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isAdminApp
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {isAdminApp ? 'Division 2: Admin & Admission' : 'Division 1: Exam Delivery'}
                </span>

                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded border border-slate-200 dark:border-slate-700">
                  Target: v{exam.expectedVersion || exam.currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Vendor: <strong className="text-slate-700 dark:text-slate-300">{exam.vendor}</strong> • Filtered fleet: {eligibleSystems.length} {isAdminApp ? 'Admin Consoles' : 'Testing Workstations'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyAll}
            disabled={isVerifyingAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isVerifyingAll ? 'animate-spin' : ''}`} />
            <span>Verify All Nodes</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Installed Systems</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            {installedCount} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {eligibleSystems.length}</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{coveragePct}% Fleet Coverage</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Pending Installations</span>
          <div className="mt-1 text-2xl font-black text-amber-600 dark:text-amber-400">
            {missingCount}
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
            {missingCount === 0 ? 'All nodes configured' : 'Require client deployment'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Version Drift / Outdated</span>
          <div className={`mt-1 text-2xl font-black ${driftCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {driftCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {driftCount === 0 ? 'Consistent build across fleet' : 'Mismatch with expected version'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Hardware Baseline</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{exam.minRamGB} GB RAM</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{exam.minStorageGB} GB SSD Baseline</span>
        </div>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={`Filter ${isAdminApp ? 'admin nodes' : 'workstations'} (e.g. W001, ADM, 192.168)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* View Mode Toggle: Poker Cards vs Systems Table */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">View Mode:</span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Use existing FETS poker-card workstation UI"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Workstation Poker Cards</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Detailed Systems Table"
              >
                <List className="w-3.5 h-3.5" />
                <span>Systems Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterState === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            All Systems ({eligibleSystems.length})
          </button>

          <button
            onClick={() => setFilterState('installed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterState === 'installed'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Installed ({installedCount})
          </button>

          <button
            onClick={() => setFilterState('missing')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterState === 'missing'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Missing ({missingCount})
          </button>

          {issueCount > 0 && (
            <button
              onClick={() => setFilterState('issue')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterState === 'issue'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              Issue / Broken ({issueCount})
            </button>
          )}

          {driftCount > 0 && (
            <button
              onClick={() => setFilterState('drift')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterState === 'drift'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              Version Drift ({driftCount})
            </button>
          )}
        </div>
      </div>

      {/* FILTERED SYSTEMS DISPLAY */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No systems matched current filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try switching filter to &quot;All Systems&quot; or clear the search query.
          </p>
          <button
            onClick={() => {
              setFilterState('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* POKER-CARD WORKSTATION UI */
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing {filteredItems.length} {isAdminApp ? 'Admin Node Cards' : 'Workstation Poker Cards'}
            </span>
            <span className="font-mono text-[11px]">
              Hover bottom of each card for hardware & network specs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredItems.map(({ system, status, hasDrift, version }) => (
              <div key={system.id} className="relative">
                {/* Visual badge indicator above card showing client status for this specific exam */}
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                    {exam.code}:
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded border ${
                        status === 'installed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : status === 'issue'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {status}
                    </span>
                    {hasDrift && (
                      <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1 rounded">
                        Drift
                      </span>
                    )}
                  </div>
                </div>

                {/* The real FETS Poker Card Component */}
                <SystemCard
                  system={system}
                  onClick={() => openSystemDetail(system.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* DETAILED SYSTEMS TABLE */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Node / Station</th>
                  <th className="px-4 py-3">Hostname</th>
                  <th className="px-4 py-3">Status for {exam.code}</th>
                  <th className="px-4 py-3">Installed Build</th>
                  <th className="px-4 py-3">RAM / SSD</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Last Verified</th>
                  <th className="px-4 py-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map(({ system, status, version, expectedVersion, hasDrift, lastVerified }) => (
                  <tr key={system.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      <button
                        onClick={() => openSystemDetail(system.id)}
                        className="hover:text-emerald-800 dark:hover:text-emerald-400 hover:underline cursor-pointer"
                      >
                        {system.id}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                      {system.name}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={status}
                        onChange={(e) => handleStatusChange(system.id, e.target.value as InstalledExamApp['status'])}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                          status === 'installed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : status === 'issue'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <option value="installed">Installed</option>
                        <option value="missing">Missing</option>
                        <option value="issue">Issue</option>
                        <option value="not_verified">Not Verified</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px]">
                      {version ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">v{version}</span>
                          {hasDrift && (
                            <span
                              className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              title={`Expected v${expectedVersion}`}
                            >
                              Drift (Exp v{expectedVersion})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">
                      {system.hardware.ramGB}GB / {system.hardware.storageGB}GB
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {system.network.ipAddress}
                    </td>
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500 text-[11px]">
                      {lastVerified}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            system.id,
                            status === 'installed' ? 'missing' : 'installed'
                          )
                        }
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                          status === 'installed'
                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            : 'bg-emerald-800 text-white border-emerald-800 hover:bg-emerald-900'
                        }`}
                      >
                        {status === 'installed' ? 'Uninstall' : 'Deploy Client'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

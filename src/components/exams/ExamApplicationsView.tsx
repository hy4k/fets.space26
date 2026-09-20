import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Cpu,
  Monitor,
  Search,
  Check,
  ChevronRight,
  FileCheck2,
  Table,
  UserCheck,
  ClipboardList,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExamApplication, ExamAppCategory } from '../../types';
import { Modal } from '../ui/Modal';

export const ExamApplicationsView: React.FC = () => {
  const { examApps, systems, navigate, currentCentre, addExamApp } = useApp();
  
  // Active Division: 'delivery' (Division 1) or 'admin_admission' (Division 2)
  const [activeDivision, setActiveDivision] = useState<ExamAppCategory>('delivery');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'full' | 'partial' | 'drift'>('all');
  const [isAddAppModalOpen, setAddAppModalOpen] = useState(false);

  // New Application Form State
  const [newAppName, setNewAppName] = useState('');
  const [newAppCode, setNewAppCode] = useState('');
  const [newAppVendor, setNewAppVendor] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<ExamAppCategory>(activeDivision);
  const [newAppVersion, setNewAppVersion] = useState('1.0.0');
  const [newAppExpectedVersion, setNewAppExpectedVersion] = useState('1.0.0');
  const [newAppMinRam, setNewAppMinRam] = useState(8);
  const [newAppMinStorage, setNewAppMinStorage] = useState(128);
  const [newAppMinOs, setNewAppMinOs] = useState('Windows 10 Pro 64-bit');
  const [newAppDescription, setNewAppDescription] = useState('');

  // Segregate applications strictly by division
  const deliveryApps = examApps.filter((a) => a.category === 'delivery' || (!a.category && !a.id.startsWith('admin-')));
  const adminApps = examApps.filter((a) => a.category === 'admin_admission' || a.id.startsWith('admin-'));

  const currentDivisionApps = activeDivision === 'delivery' ? deliveryApps : adminApps;

  // Filtered applications
  const filteredApps = currentDivisionApps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (searchQuery.toLowerCase().includes('regis') && app.name.toLowerCase().includes('regist'));

    const total = app.totalSystems || (activeDivision === 'admin_admission' ? 2 : 36);
    const isFull = (app.installedCount || 0) >= total;
    const hasDrift = app.expectedVersion && app.currentVersion !== app.expectedVersion;

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'full') return matchesSearch && isFull;
    if (statusFilter === 'partial') return matchesSearch && !isFull;
    if (statusFilter === 'drift') return matchesSearch && hasDrift;
    return matchesSearch;
  });

  // Calculate Division Metrics
  const totalTargetFleet = activeDivision === 'delivery' ? 36 : 2;
  const totalFleetSystemsCount = systems.filter((s) => activeDivision === 'delivery' ? s.type === 'workstation' : s.type === 'admin_pc').length || totalTargetFleet;
  
  const avgCoverage = currentDivisionApps.length > 0
    ? Math.round(
        currentDivisionApps.reduce((acc, app) => {
          const total = app.totalSystems || totalFleetSystemsCount;
          return acc + (total > 0 ? (app.installedCount / total) * 100 : 0);
        }, 0) / currentDivisionApps.length
      )
    : 0;

  const fullyDeployedApps = currentDivisionApps.filter((a) => (a.installedCount || 0) >= (a.totalSystems || totalFleetSystemsCount)).length;
  const driftAppsCount = currentDivisionApps.filter((a) => a.expectedVersion && a.currentVersion !== a.expectedVersion).length;

  const handleOpenAddModal = (category: ExamAppCategory) => {
    setNewAppCategory(category);
    setNewAppName('');
    setNewAppCode('');
    setNewAppVendor('');
    setNewAppVersion('1.0.0');
    setNewAppExpectedVersion('1.0.0');
    setNewAppMinRam(category === 'admin_admission' ? 8 : 8);
    setNewAppMinStorage(category === 'admin_admission' ? 256 : 128);
    setNewAppMinOs('Windows 10 Pro 64-bit');
    setNewAppDescription('');
    setAddAppModalOpen(true);
  };

  const handleAddAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExamApp({
      name: newAppName,
      code: newAppCode.toUpperCase(),
      vendor: newAppVendor,
      category: newAppCategory,
      currentVersion: newAppVersion,
      expectedVersion: newAppExpectedVersion || newAppVersion,
      minRamGB: Number(newAppMinRam),
      minStorageGB: Number(newAppMinStorage),
      minOs: newAppMinOs,
      requiredPeripherals: newAppCategory === 'admin_admission'
        ? ['Keyboard', 'Mouse', 'Biometric Scanner / Webcam', 'Document Reader']
        : ['Keyboard', 'Mouse', 'Audio Headset', 'TCA Webcam'],
      description: newAppDescription || `${newAppName} (${newAppCategory === 'admin_admission' ? 'Admin/Admission' : 'Delivery Client'})`,
      color: newAppCategory === 'admin_admission' ? '#4F46E5' : '#059669',
      eligibleSystemTypes: newAppCategory === 'admin_admission' ? ['admin_pc'] : ['workstation']
    });
    setAddAppModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Division Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Application Architecture
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{currentCentre.name}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              Applications & Testing Engines
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Strict operational separation between <strong className="text-emerald-700 dark:text-emerald-400">Exam Delivery Lockdown Clients</strong> on candidate workstations and <strong className="text-indigo-700 dark:text-indigo-400">Admin & Admission Applications</strong> on proctor consoles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('exam-matrix')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <Table className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Full Applications Matrix</span>
            </button>

            <button
              onClick={() => handleOpenAddModal(activeDivision)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                activeDivision === 'delivery'
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeDivision === 'delivery' ? 'Register Delivery Client' : 'Register Admin Application'}
              </span>
            </button>
          </div>
        </div>

        {/* PRIMARY DIVISION SWITCHER TABS */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* DIVISION 1: EXAM DELIVERY APPLICATIONS */}
            <button
              type="button"
              onClick={() => setActiveDivision('delivery')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                activeDivision === 'delivery'
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/60 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                      activeDivision === 'delivery'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        DIVISION 1
                      </span>
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Workstations W001–W036
                      </span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      EXAM DELIVERY APPLICATIONS
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                      activeDivision === 'delivery'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {deliveryApps.length} Clients
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">
                Candidate testing lockdown browsers: CMA US, Pearson VUE, PSI Bridge, CELPIP, ITTS.
              </p>
            </button>

            {/* DIVISION 2: ADMIN / ADMISSION APPLICATIONS */}
            <button
              type="button"
              onClick={() => setActiveDivision('admin_admission')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                activeDivision === 'admin_admission'
                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-slate-50/60 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-colors ${
                      activeDivision === 'admin_admission'
                        ? 'bg-indigo-700 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                        DIVISION 2
                      </span>
                      <span className="w-1 h-1 rounded-full bg-indigo-500" />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Admin Systems ADM-01 & MW01
                      </span>
                    </div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                      ADMIN / ADMISSION APPLICATIONS
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono border ${
                      activeDivision === 'admin_admission'
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {adminApps.length} Tools
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-1">
                Proctor & intake operations: ProAdmin, Admission Manager, Synchronizer, Registration Manager.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Division Summary KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {activeDivision === 'delivery' ? 'Target Testing Fleet' : 'Target Admin Fleet'}
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalFleetSystemsCount}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {activeDivision === 'delivery' ? 'Workstations (W001–W036)' : 'Dedicated Admin PCs'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 block">
            Dedicated Assignment
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Fleet Deployment Average
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${avgCoverage >= 90 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {avgCoverage}%
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Overall Coverage</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-mono">
            {fullyDeployedApps} of {currentDivisionApps.length} Apps 100% Deployed
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Active Applications
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentDivisionApps.length}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Configured</span>
          </div>
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-1 block">
            Audited Pre-flight
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Version Drift Detection
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${driftAppsCount === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {driftAppsCount}
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Drift Alerts</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {driftAppsCount === 0 ? 'All clients match expected build' : 'Requires client package update'}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeDivision === 'delivery' ? 'exam delivery clients (CMA, Pearson, etc.)...' : 'admin applications (CAS, REG, etc.)...'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            All ({currentDivisionApps.length})
          </button>

          <button
            onClick={() => setStatusFilter('full')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'full'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            100% Deployed ({fullyDeployedApps})
          </button>

          <button
            onClick={() => setStatusFilter('partial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'partial'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Pending / Partial ({currentDivisionApps.length - fullyDeployedApps})
          </button>

          {driftAppsCount > 0 && (
            <button
              onClick={() => setStatusFilter('drift')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'drift'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              Version Drift ({driftAppsCount})
            </button>
          )}
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApps.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No applications match your query</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting search terms or register a new application under this division.
          </p>
          <button
            onClick={() => handleOpenAddModal(activeDivision)}
            className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Application</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredApps.map((app) => {
            const total = app.totalSystems || (activeDivision === 'admin_admission' ? 2 : 36);
            const coveragePct = total > 0 ? Math.min(100, Math.round(((app.installedCount || 0) / total) * 100)) : 0;
            const missingCount = Math.max(0, total - (app.installedCount || 0));
            const hasVersionDrift = app.expectedVersion && app.currentVersion !== app.expectedVersion;

            return (
              <div
                key={app.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-2xs p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                  activeDivision === 'delivery'
                    ? 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
              >
                <div>
                  {/* Division Header Tag & Code */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0"
                        style={{ backgroundColor: app.color || (activeDivision === 'delivery' ? '#059669' : '#4F46E5') }}
                      >
                        {app.code}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                              activeDivision === 'delivery'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            {activeDivision === 'delivery' ? 'Exam Delivery' : 'Admin & Admission'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 leading-snug">
                          {app.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.vendor}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded border border-slate-200 dark:border-slate-700">
                        <span>v{app.currentVersion}</span>
                      </div>
                      {hasVersionDrift && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Drift: Exp v{app.expectedVersion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fleet Coverage Bar */}
                  <div className="my-4 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-600 dark:text-slate-400">
                        {activeDivision === 'delivery' ? 'Workstation Fleet Deployment' : 'Admin Console Deployment'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {app.installedCount || 0} / {total} ({coveragePct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${coveragePct}%`,
                          backgroundColor: app.color || (activeDivision === 'delivery' ? '#059669' : '#4F46E5')
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-2 font-medium">
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{app.installedCount || 0} Verified Active</span>
                      </span>

                      {missingCount > 0 ? (
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          {missingCount} {activeDivision === 'delivery' ? 'Workstations' : 'Admin Nodes'} Missing
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          100% Target Met
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Technical Baseline & Minimum Specs */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Technical Baseline
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800 text-[11px]">
                      <span>RAM Baseline</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {app.minRamGB} GB Min
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800 text-[11px]">
                      <span>Storage Baseline</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {app.minStorageGB} GB SSD
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800 text-[11px]">
                      <span>Supported OS</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {app.minOs || 'Windows 10 Pro 64-bit'}
                      </span>
                    </div>
                  </div>

                  {/* Required Peripherals */}
                  {app.requiredPeripherals && app.requiredPeripherals.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Mandatory Peripherals
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {app.requiredPeripherals.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => navigate('exam-detail', app.id)}
                    className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeDivision === 'delivery'
                        ? 'text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300'
                        : 'text-indigo-800 dark:text-indigo-400 hover:text-indigo-950 dark:hover:text-indigo-300'
                    }`}
                  >
                    <span>
                      {activeDivision === 'delivery' ? 'Filter Workstations' : 'Filter Admin Systems'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate('exam-matrix')}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    View in Matrix →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Register New Application */}
      <Modal
        isOpen={isAddAppModalOpen}
        onClose={() => setAddAppModalOpen(false)}
        title={newAppCategory === 'admin_admission' ? 'Register Admin / Admission Application' : 'Register Exam Delivery Client'}
        subtitle="Configure application parameters, testing vendor, and target fleet division"
        maxWidth="lg"
      >
        <form onSubmit={handleAddAppSubmit} className="space-y-4 text-xs">
          {/* DIVISION SELECTION */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Select Architectural Division *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setNewAppCategory('delivery')}
                className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  newAppCategory === 'delivery'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="appDivision"
                  checked={newAppCategory === 'delivery'}
                  onChange={() => setNewAppCategory('delivery')}
                  className="sr-only"
                />
                <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Division 1: Exam Delivery</div>
                  <div className="text-[10px] opacity-80">Workstations (W001–W036)</div>
                </div>
              </label>

              <label
                onClick={() => setNewAppCategory('admin_admission')}
                className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  newAppCategory === 'admin_admission'
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="appDivision"
                  checked={newAppCategory === 'admin_admission'}
                  onChange={() => setNewAppCategory('admin_admission')}
                  className="sr-only"
                />
                <UserCheck className="w-4 h-4 text-indigo-700 dark:text-indigo-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Division 2: Admin/Admission</div>
                  <div className="text-[10px] opacity-80">Admin Systems (ADM-01, MW01)</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Name *
              </label>
              <input
                type="text"
                required
                placeholder={newAppCategory === 'admin_admission' ? 'e.g. ProAdmin / Admission Manager' : 'e.g. Kryterion Sentinel'}
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder={newAppCategory === 'admin_admission' ? 'e.g. PRO' : 'e.g. SENT'}
                value={newAppCode}
                onChange={(e) => setNewAppCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Testing / Software Vendor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prometric / Kryterion / ETS"
                value={newAppVendor}
                onChange={(e) => setNewAppVendor(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Installed Version *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2.14.0"
                value={newAppVersion}
                onChange={(e) => setNewAppVersion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Compliance Version
              </label>
              <input
                type="text"
                placeholder="e.g. 2.14.0"
                value={newAppExpectedVersion}
                onChange={(e) => setNewAppExpectedVersion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min OS Requirement
              </label>
              <input
                type="text"
                value={newAppMinOs}
                onChange={(e) => setNewAppMinOs(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min RAM (GB)
              </label>
              <input
                type="number"
                min={4}
                max={64}
                value={newAppMinRam}
                onChange={(e) => setNewAppMinRam(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Storage (GB)
              </label>
              <input
                type="number"
                min={32}
                max={1024}
                value={newAppMinStorage}
                onChange={(e) => setNewAppMinStorage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Used for high-stakes professional certification delivery."
              value={newAppDescription}
              onChange={(e) => setNewAppDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div
            className={`p-3 rounded-lg text-[11px] border ${
              newAppCategory === 'delivery'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
            }`}
          >
            {newAppCategory === 'delivery'
              ? 'This application will be assigned to all 36 testing workstations (W001–W036) under Division 1.'
              : 'This application will be assigned exclusively to the center admin workstations (ADM-01 and MW01) under Division 2.'}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddAppModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg font-semibold cursor-pointer ${
                newAppCategory === 'delivery'
                  ? 'bg-emerald-800 hover:bg-emerald-900'
                  : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              Register {newAppCategory === 'delivery' ? 'Exam Delivery Client' : 'Admin Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

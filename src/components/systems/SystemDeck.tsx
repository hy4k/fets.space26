import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Layers,
  MapPin,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Sun,
  Moon,
  QrCode,
  ArrowLeftRight,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  Clock,
  Laptop,
  Check,
  Plus,
  RefreshCw,
  FileCheck2,
  SlidersHorizontal,
  ChevronDown,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemRecord, SystemStatus } from '../../types';
import { SystemCard } from './SystemCard';
import { CardFlipModal } from './CardFlipModal';
import { SystemComparisonModal } from './SystemComparisonModal';
import { EditWorkstationModal } from './EditWorkstationModal';
import { PrintQRModal } from '../ui/PrintQRModal';
import { QRScannerModal } from '../ui/QRScannerModal';
import { MorningOperationsModal } from '../operations/MorningOperationsModal';
import { EndOfDaySummaryModal } from '../operations/EndOfDaySummaryModal';
import { AssetTransferModal } from '../assets/AssetTransferModal';

export type DeckViewMode = 'grid' | 'fan' | 'map' | 'list';

export const SystemDeck: React.FC = () => {
  const {
    systems,
    activeCentre,
    capacity,
    openAuditModal,
    openIssueModal,
    assetMovements,
    issues
  } = useApp();

  // View state
  const [viewMode, setViewMode] = useState<DeckViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'id' | 'status-priority' | 'issues' | 'audit' | 'apps'
  >('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Interactive Card Modals
  const [activeFlippedSystem, setActiveFlippedSystem] = useState<SystemRecord | null>(null);
  const [editingSystem, setEditingSystem] = useState<SystemRecord | null>(null);
  const [isCreateSystemOpen, setIsCreateSystemOpen] = useState(false);
  const [qrPrintSystem, setQrPrintSystem] = useState<SystemRecord | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isMorningOpsOpen, setIsMorningOpsOpen] = useState(false);
  const [isEndOfDayOpen, setIsEndOfDayOpen] = useState(false);
  const [transferSourceSystem, setTransferSourceSystem] = useState<SystemRecord | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Multi-card comparison
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Toggle selection for comparison
  const handleToggleCompare = (systemId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(systemId)
        ? prev.filter((id) => id !== systemId)
        : prev.length < 4
        ? [...prev, systemId]
        : prev
    );
  };

  // Status Counts sourced from capacity engine
  const totalSystems = capacity.installedSystems;
  const operationalCount = capacity.operational;
  const attentionCount = capacity.attention;
  const criticalCount = capacity.critical;
  const offlineCount = capacity.offline;
  const auditsDueCount = systems.filter((s) => s.lastAuditDate?.includes('Due')).length;

  // Filtering & Sorting Logic
  const filteredSystems = useMemo(() => {
    return systems
      .filter((sys) => {
        // Status filter
        if (statusFilter === 'operational' && sys.status !== 'operational') return false;
        if (statusFilter === 'attention' && sys.status !== 'attention') return false;
        if (statusFilter === 'critical' && sys.status !== 'critical') return false;
        if (statusFilter === 'offline' && sys.status !== 'offline') return false;
        if (statusFilter === 'audits-due' && !sys.lastAuditDate?.includes('Due')) return false;
        if (statusFilter === 'issues' && sys.activeIssueCount === 0) return false;
        if (statusFilter === 'exam-issues') {
          const hasExamDefect = sys.examApps.some(
            (a) => a.status === 'missing' || a.status === 'issue'
          );
          if (!hasExamDefect) return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          sys.id.toLowerCase().includes(q) ||
          sys.name.toLowerCase().includes(q) ||
          sys.network.ipAddress.includes(q) ||
          sys.hardware.processor.toLowerCase().includes(q) ||
          sys.hardware.monitorModel.toLowerCase().includes(q) ||
          sys.os.name.toLowerCase().includes(q) ||
          sys.notes?.toLowerCase().includes(q) ||
          sys.examApps.some((a) => a.appName.toLowerCase().includes(q) || a.code.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'id') {
          comp = a.id.localeCompare(b.id, undefined, { numeric: true });
        } else if (sortBy === 'status-priority') {
          const rank: Record<SystemStatus, number> = {
            critical: 0,
            attention: 1,
            offline: 2,
            maintenance: 3,
            operational: 4
          };
          comp = rank[a.status] - rank[b.status];
        } else if (sortBy === 'issues') {
          comp = b.activeIssueCount - a.activeIssueCount;
        } else if (sortBy === 'audit') {
          const aDue = a.lastAuditDate?.includes('Due') ? 0 : 1;
          const bDue = b.lastAuditDate?.includes('Due') ? 0 : 1;
          comp = aDue - bDue;
        } else if (sortBy === 'apps') {
          const aCount = a.examApps.filter((x) => x.status === 'installed').length;
          const bCount = b.examApps.filter((x) => x.status === 'installed').length;
          comp = aCount - bCount;
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [systems, statusFilter, searchQuery, sortBy, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* TOP STATUS SUMMARY CARDS (INTERACTIVE PILLS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Systems */}
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#0B3B2C] text-white border-[#092E23] shadow-md ring-2 ring-emerald-700/30'
              : 'bg-white dark:bg-[#12151D] hover:bg-stone-50 dark:hover:bg-[#171A24] border-stone-200/90 dark:border-[#2C2417] text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-70">
            TOTAL SYSTEMS
          </div>
          <div className="text-2xl font-black font-sans mt-0.5">{totalSystems}</div>
          <div className="text-[11px] font-medium opacity-80 mt-1">Fleet Inventory</div>
        </button>

        {/* Operational */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'operational' ? 'all' : 'operational')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'operational'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/30'
              : 'bg-white dark:bg-[#12151D] hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60 text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            OPERATIONAL
          </div>
          <div className="text-2xl font-black font-sans mt-0.5 text-emerald-600 dark:text-emerald-400">
            {operationalCount}
          </div>
          <div className="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400 mt-1">Ready for Testing</div>
        </button>

        {/* Attention */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'attention' ? 'all' : 'attention')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'attention'
              ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-[#12151D] hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60 text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            ATTENTION
          </div>
          <div className="text-2xl font-black font-sans mt-0.5 text-amber-600 dark:text-amber-400">
            {attentionCount}
          </div>
          <div className="text-[11px] font-medium text-amber-700/80 dark:text-amber-400 mt-1">Updates / Checksum</div>
        </button>

        {/* Critical */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'critical' ? 'all' : 'critical')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'critical'
              ? 'bg-rose-700 text-white border-rose-800 shadow-md ring-2 ring-rose-600/30'
              : 'bg-white dark:bg-[#12151D] hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60 text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            CRITICAL
          </div>
          <div className="text-2xl font-black font-sans mt-0.5 text-rose-600 dark:text-rose-400">{criticalCount}</div>
          <div className="text-[11px] font-medium text-rose-700/80 dark:text-rose-400 mt-1">Defect Flagged</div>
        </button>

        {/* Offline */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'offline' ? 'all' : 'offline')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'offline'
              ? 'bg-stone-700 text-white border-stone-800 shadow-md ring-2 ring-stone-500/30'
              : 'bg-white dark:bg-[#12151D] hover:bg-stone-100 dark:hover:bg-[#171A24] border-stone-200/90 dark:border-[#2C2417] text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            OFFLINE
          </div>
          <div className="text-2xl font-black font-sans mt-0.5 text-stone-600 dark:text-stone-300">{offlineCount}</div>
          <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-1">Unreachable</div>
        </button>

        {/* Audits Due */}
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'audits-due' ? 'all' : 'audits-due')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'audits-due'
              ? 'bg-blue-700 text-white border-blue-800 shadow-md ring-2 ring-blue-500/30'
              : 'bg-white dark:bg-[#12151D] hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/60 text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            AUDITS DUE
          </div>
          <div className="text-2xl font-black font-sans mt-0.5 text-blue-600 dark:text-blue-400">
            {auditsDueCount}
          </div>
          <div className="text-[11px] font-medium text-blue-700/80 dark:text-blue-400 mt-1">Inspection Window</div>
        </button>
      </div>

      {/* OPERATIONS TOOLBAR & CONTROLS */}
      <div className="bg-white dark:bg-[#12151D] rounded-2xl border border-stone-200/90 dark:border-[#2C2417] p-4 shadow-2xs space-y-3">
        {/* Row 1: Search, Filter Tabs, and View Modes */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by ID, IP, CPU, Monitor (e.g. W014, BENQ, 192.168.10.1)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F6] dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] rounded-xl text-xs text-stone-900 dark:text-[#FAF7F2] placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs p-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Operations Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Add Workstation / New System */}
            <button
              type="button"
              onClick={() => setIsCreateSystemOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-white bg-[#0A6447] hover:bg-[#08543B] dark:bg-[#064E3B] dark:hover:bg-[#08644C] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add System</span>
            </button>

            {/* Morning Inspection */}
            <button
              type="button"
              onClick={() => setIsMorningOpsOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Morning Ops</span>
            </button>

            {/* End of Day */}
            <button
              type="button"
              onClick={() => setIsEndOfDayOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-[#171A24] hover:bg-stone-200 dark:hover:bg-[#202432] border border-stone-200 dark:border-[#2C2417] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>End of Day</span>
            </button>

            {/* Scan QR */}
            <button
              type="button"
              onClick={() => setIsQrScannerOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Scan QR</span>
            </button>

            {/* Compare Button */}
            {selectedForCompare.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-purple-900 dark:text-purple-200 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-800/60 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer animate-in zoom-in-95"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Compare ({selectedForCompare.length})</span>
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-stone-100/90 dark:bg-[#171A24] rounded-xl border border-stone-200/90 dark:border-[#2C2417] self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#222736] text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Standard Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('fan')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'fan'
                  ? 'bg-white dark:bg-[#222736] text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Deck Fan View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deck Fan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-[#222736] text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Lab Booth Floor Map"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Floor Map</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#222736] text-stone-900 dark:text-[#FAF7F2] shadow-2xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
              title="Compact Audit Table"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>

        {/* Row 2: Sort and Filter Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-[#2C2417] text-xs">
          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-400 dark:text-stone-500 font-medium mr-1">Filter:</span>
            {[
              { key: 'all', label: 'All Systems' },
              { key: 'operational', label: 'Operational Only' },
              { key: 'attention', label: 'Attention Needed' },
              { key: 'critical', label: 'Critical' },
              { key: 'exam-issues', label: 'Exam App Issues' },
              { key: 'audits-due', label: 'Audits Due' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-[#0B3B2C] text-white font-semibold shadow-2xs'
                    : 'bg-stone-50 dark:bg-[#171A24] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#202432] hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200/90 dark:border-[#2C2417]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="id">System Number (W001 - W040)</option>
              <option value="status-priority">Status Priority (Critical First)</option>
              <option value="issues">Most Open Issues</option>
              <option value="audit">Audit Date (Due First)</option>
              <option value="apps">Installed Applications</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer"
              title="Toggle Sort Ascending / Descending"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: STANDARD GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredSystems.map((system) => (
            <SystemCard
              key={system.id}
              system={system}
              onClick={() => setActiveFlippedSystem(system)}
              onQuickAudit={(sys) => openAuditModal(sys.id)}
              onReportIssue={(sys) => openIssueModal(sys.id)}
              onPrintQR={(sys) => setQrPrintSystem(sys)}
              onEditSystem={(sys) => setEditingSystem(sys)}
              onTransferAsset={(sys) => {
                setTransferSourceSystem(sys);
                setIsTransferModalOpen(true);
              }}
              isSelectedForCompare={selectedForCompare.includes(system.id)}
              onToggleCompare={handleToggleCompare}
              showCompareCheckbox={true}
            />
          ))}
        </div>
      )}

      {/* VIEW MODE 2: DECK FAN VIEW (POKER CARD EXPERIENCE) */}
      {viewMode === 'fan' && (
        <div className="p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between mb-4 text-white">
            <div>
              <h3 className="text-sm font-bold font-sans">Deck Cascade Layout</h3>
              <p className="text-xs text-slate-400">
                Interactive fanned cards. Hover to fan out and inspect any booth.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Showing {filteredSystems.length} cards
            </span>
          </div>

          {/* Horizontal Scrollable Fanned Deck */}
          <div className="flex overflow-x-auto pb-6 pt-4 px-4 gap-[-40px] items-center min-h-[330px] scrollbar-thin scrollbar-thumb-slate-700">
            {filteredSystems.map((system, idx) => {
              // Staggered tilt for organic card fan
              const rotation = ((idx % 7) - 3) * 2;
              return (
                <div
                  key={system.id}
                  className="shrink-0 w-56 -mr-12 hover:mr-4 hover:z-30 hover:-translate-y-4 hover:scale-105 transition-all duration-200 cursor-pointer"
                  style={{
                    transform: `rotate(${rotation}deg)`
                  }}
                  onClick={() => setActiveFlippedSystem(system)}
                >
                  <SystemCard
                    system={system}
                    onClick={() => setActiveFlippedSystem(system)}
                    onQuickAudit={(sys) => openAuditModal(sys.id)}
                    onReportIssue={(sys) => openIssueModal(sys.id)}
                    onPrintQR={(sys) => setQrPrintSystem(sys)}
                    onEditSystem={(sys) => setEditingSystem(sys)}
                    onTransferAsset={(sys) => {
                      setTransferSourceSystem(sys);
                      setIsTransferModalOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: FLOOR MAP LAYOUT */}
      {viewMode === 'map' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Testing Lab A — Physical Booth Arrangement
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calicut • 36 Candidate Workstations + Server Rack + Master Proctor Console
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Operational
              </span>
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Attention
              </span>
              <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
              </span>
            </div>
          </div>

          {/* Infrastructure Top Desk (Proctor & Server) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Proctor Console */}
            {systems.find((s) => s.id === 'MW01' || s.id === 'ADM-01') && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400 uppercase">
                    PROCTOR CONTROL DESK
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">MW01 (Master Workstation)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">IP: 192.168.10.200 • Pearson Admissions</div>
                </div>
                <button
                  onClick={() => {
                    const mw = systems.find((s) => s.id === 'MW01');
                    if (mw) setActiveFlippedSystem(mw);
                  }}
                  className="px-3 py-1 text-xs font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  Flip Card
                </button>
              </div>
            )}

            {/* Server Rack */}
            {systems.find((s) => s.id === 'SRV-01') && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400 uppercase">
                    SERVER RACK 01
                  </span>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">SRV-01 (Exam Cache Server)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">IP: 192.168.10.10 • 1Gbps Uplink SW-01</div>
                </div>
                <button
                  onClick={() => {
                    const srv = systems.find((s) => s.id === 'SRV-01');
                    if (srv) setActiveFlippedSystem(srv);
                  }}
                  className="px-3 py-1 text-xs font-semibold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg border border-purple-200 dark:border-purple-800 cursor-pointer"
                >
                  Flip Card
                </button>
              </div>
            )}
          </div>

          {/* Row 1: North Booths (W001 - W018) */}
          <div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Row A (North Wall) — Booths W001 to W018 (Switch SW-01)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2.5">
              {systems
                .filter((s) => s.type === 'workstation')
                .slice(0, 18)
                .map((sys) => (
                  <div
                    key={sys.id}
                    onClick={() => setActiveFlippedSystem(sys)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 shadow-2xs ${
                      sys.status === 'operational'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : sys.status === 'attention'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        : sys.status === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-black font-sans">{sys.id}</div>
                    <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400">{sys.name.split('-')[1]}</div>
                    <div className="text-[8px] font-bold uppercase mt-1">
                      {sys.status.substring(0, 4)}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Central Lab Aisle Divider */}
          <div className="py-2 flex items-center justify-center">
            <div className="w-full border-t border-dashed border-slate-300 dark:border-slate-700 relative flex justify-center">
              <span className="bg-white dark:bg-slate-800 px-4 text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 font-bold tracking-widest -mt-2">
                TESTING LAB CENTRAL CANDIDATE AISLE
              </span>
            </div>
          </div>

          {/* Row 2: South Booths (W019 - W036) */}
          <div>
            <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Row B (South Wall) — Booths W019 to W036 (Switch SW-02)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2.5">
              {systems
                .filter((s) => s.type === 'workstation')
                .slice(18, 36)
                .map((sys) => (
                  <div
                    key={sys.id}
                    onClick={() => setActiveFlippedSystem(sys)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:scale-105 shadow-2xs ${
                      sys.status === 'operational'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : sys.status === 'attention'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        : sys.status === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-black font-sans">{sys.id}</div>
                    <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400">{sys.name.split('-')[1]}</div>
                    <div className="text-[8px] font-bold uppercase mt-1">
                      {sys.status.substring(0, 4)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 4: COMPACT TABLE LIST */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/70 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700 tracking-wider font-mono">
                <tr>
                  <th className="py-3 px-4">System ID</th>
                  <th className="py-3 px-4">Hostname</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">CPU / RAM</th>
                  <th className="py-3 px-4">Monitor</th>
                  <th className="py-3 px-4">Exams Ready</th>
                  <th className="py-3 px-4">Issues</th>
                  <th className="py-3 px-4">Last Audit</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                {filteredSystems.map((sys) => {
                  const examAppsCount = sys.examApps.filter((a) => a.status === 'installed').length;
                  return (
                    <tr
                      key={sys.id}
                      onClick={() => setActiveFlippedSystem(sys)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {sys.id}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">{sys.name}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            sys.status === 'operational'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : sys.status === 'attention'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              : sys.status === 'critical'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {sys.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {sys.network.ipAddress}
                      </td>
                      <td className="py-2.5 px-4">
                        {sys.hardware.processor.split('@')[0]} ({sys.hardware.ramGB}GB)
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {sys.hardware.monitorModel.split(' ')[0]}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-semibold ${
                            examAppsCount === 5 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {examAppsCount}/5
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {sys.activeIssueCount > 0 ? (
                          <span className="text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            {sys.activeIssueCount} Open
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {sys.lastAuditDate}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSystem(sys);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded border border-slate-300 dark:border-slate-600 cursor-pointer transition-colors"
                            title="Edit Workstation"
                          >
                            <Edit3 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFlippedSystem(sys);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                          >
                            Flip
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3D CARD FLIP MODAL (FLIPS FROM CARD TO CARD-BACK) */}
      <CardFlipModal
        system={activeFlippedSystem}
        allSystems={filteredSystems}
        isOpen={!!activeFlippedSystem}
        onClose={() => setActiveFlippedSystem(null)}
        onSelectSystem={(sys) => setActiveFlippedSystem(sys)}
        onRunAudit={(sys) => openAuditModal(sys.id)}
        onReportIssue={(sys) => openIssueModal(sys.id)}
        onPrintQR={(sys) => setQrPrintSystem(sys)}
        onEditSystem={(sys) => setEditingSystem(sys)}
        onTransferAsset={(sys) => {
          setTransferSourceSystem(sys);
          setIsTransferModalOpen(true);
        }}
      />

      {/* SYSTEM COMPARISON MATRIX MODAL */}
      <SystemComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        systems={systems.filter((s) => selectedForCompare.includes(s.id))}
        onRemoveSystem={(id) => handleToggleCompare(id)}
        onSelectSystem={(sys) => {
          setIsCompareModalOpen(false);
          setActiveFlippedSystem(sys);
        }}
      />

      {/* PRINT QR CODE MODAL */}
      {qrPrintSystem && (
        <PrintQRModal
          system={qrPrintSystem}
          isOpen={!!qrPrintSystem}
          onClose={() => setQrPrintSystem(null)}
        />
      )}

      {/* QR SCANNER MODAL */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onSelectSystem={(sys) => {
          setActiveFlippedSystem(sys);
        }}
      />

      {/* MORNING OPERATIONS MODAL */}
      <MorningOperationsModal
        isOpen={isMorningOpsOpen}
        onClose={() => setIsMorningOpsOpen(false)}
        systems={systems}
        centre={activeCentre}
      />

      {/* END OF DAY SUMMARY MODAL */}
      <EndOfDaySummaryModal
        isOpen={isEndOfDayOpen}
        onClose={() => setIsEndOfDayOpen(false)}
        systems={systems}
        centre={activeCentre}
        movements={assetMovements}
        issues={issues}
      />

      {/* ASSET TRANSFER MODAL */}
      <AssetTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        sourceSystem={transferSourceSystem}
      />

      {/* EDIT / CREATE WORKSTATION MODAL */}
      {(!!editingSystem || isCreateSystemOpen) && (
        <EditWorkstationModal
          system={editingSystem}
          isOpen={!!editingSystem || isCreateSystemOpen}
          isCreateMode={isCreateSystemOpen}
          onClose={() => {
            setEditingSystem(null);
            setIsCreateSystemOpen(false);
          }}
        />
      )}
    </div>
  );
};

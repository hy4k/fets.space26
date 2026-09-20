import React, { useState, useMemo, useEffect } from 'react';
import {
  Monitor,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  FileCheck2,
  ArrowLeftRight,
  ShieldCheck,
  FileSpreadsheet,
  Search,
  Filter,
  LayoutGrid,
  Layers,
  List,
  MoreVertical,
  ArrowUpRight,
  ExternalLink,
  Laptop,
  Check,
  X,
  RefreshCw,
  HardDrive,
  Cpu,
  Tv,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { SystemRecord, SystemStatus, InstalledExamApp } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { ExamAndAlertsOverview } from './ExamAndAlertsOverview';
import { LabFloorMap } from './LabFloorMap';
import { WorkstationInspectorDrawer } from './WorkstationInspectorDrawer';
import { SystemCard } from '../systems/SystemCard';
import { CardFlipModal } from '../systems/CardFlipModal';
import { PrintQRModal } from '../ui/PrintQRModal';
import { QRScannerModal } from '../ui/QRScannerModal';
import { MorningOperationsModal } from '../operations/MorningOperationsModal';
import { EndOfDaySummaryModal } from '../operations/EndOfDaySummaryModal';
import { AssetTransferModal } from '../assets/AssetTransferModal';
import { NetworkSpeedCard } from './NetworkSpeedCard';
import { NetworkDetailModal } from './NetworkDetailModal';
import { useNetworkSpeed } from '../../hooks/useNetworkSpeed';
import { PrinterStatusCard } from '../printer/PrinterStatusCard';
import { PrinterDetailModal } from '../printer/PrinterDetailModal';
import { usePrinterStatus } from '../../hooks/usePrinterStatus';
import { ThemeToggle } from '../ui/ThemeToggle';

export const OverviewDashboard: React.FC = () => {
  const {
    systems,
    examApps,
    alerts,
    issues,
    audits,
    currentCentre,
    capacity,
    booths,
    navigate,
    createSystem,
    createIssue,
    transferAsset,
    recordAudit,
    currentUser,
    setSystemStatus,
    assets,
    assetMovements,
    readinessBreakdown
  } = useApp();

  // Filters & State
  const [isFleetExpanded, setIsFleetExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'floor' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'id' | 'status' | 'name' | 'lastUpdated'>('id');
  const [activeContextMenuId, setActiveContextMenuId] = useState<string | null>(null);
  const [selectedDrawerSystem, setSelectedDrawerSystem] = useState<SystemRecord | null>(null);

  // Toggle fleet status view when clicking KPI boxes
  const handleKpiCardClick = (targetStatus: string) => {
    if (isFleetExpanded && statusFilter === targetStatus) {
      setIsFleetExpanded(false);
    } else {
      setStatusFilter(targetStatus);
      setIsFleetExpanded(true);
    }
  };

  // Dismiss context menu on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (activeContextMenuId) {
        setActiveContextMenuId(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeContextMenuId]);

  // Quick Action Modals
  const [isAddSystemModalOpen, setAddSystemModalOpen] = useState(false);
  const [isReportIssueModalOpen, setReportIssueModalOpen] = useState(false);
  const [isQuickAuditModalOpen, setQuickAuditModalOpen] = useState(false);
  const [isAssetTransferModalOpen, setAssetTransferModalOpen] = useState(false);
  const [selectedSystemForAction, setSelectedSystemForAction] = useState<SystemRecord | null>(null);

  // Playing Card Metaphor & Operations State
  const [activeFlippedSystem, setActiveFlippedSystem] = useState<SystemRecord | null>(null);
  const [qrPrintSystem, setQrPrintSystem] = useState<SystemRecord | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isMorningOpsOpen, setIsMorningOpsOpen] = useState(false);
  const [isEndOfDayOpen, setIsEndOfDayOpen] = useState(false);
  const [transferSourceSystem, setTransferSourceSystem] = useState<SystemRecord | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Centre-Wide Live Network Speed & Monitoring Telemetry
  const {
    networkData,
    isLoading: isNetworkLoading,
    timeAgoText: networkTimeAgoText,
    refresh: refreshNetwork,
    updateConfig: updateNetworkConfig,
    simulateState: simulateNetworkState
  } = useNetworkSpeed();
  const [isNetworkDetailOpen, setIsNetworkDetailOpen] = useState(false);

  // Dedicated Network Printer (HP Laser MFP 1188fnw) Telemetry & Monitoring
  const {
    printerData,
    isLoading: isPrinterLoading,
    timeAgoText: printerTimeAgoText,
    isProbing: isPrinterProbing,
    isPrintingTest,
    refresh: refreshPrinter,
    probe: probePrinter,
    sendTestPrint,
    simulateState: simulatePrinterState,
    updateConfig: updatePrinterConfig
  } = usePrinterStatus();
  const [isPrinterDetailOpen, setIsPrinterDetailOpen] = useState(false);

  // Form states for modals
  const [newSystemId, setNewSystemId] = useState('');
  const [newSystemHostname, setNewSystemHostname] = useState('');
  const [newSystemRam, setNewSystemRam] = useState(8);
  const [newSystemStorage, setNewSystemStorage] = useState(128);
  const [newSystemOS, setNewSystemOS] = useState('Windows 11 Home');

  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issueSystemId, setIssueSystemId] = useState('W001');
  const [issuePriority, setIssuePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [issueType, setIssueType] = useState<'hardware' | 'software' | 'exam_app' | 'network' | 'peripheral'>('hardware');

  const [transferAssetTag, setTransferAssetTag] = useState('AST-MON-014');
  const [transferToSystem, setTransferToSystem] = useState('W017');
  const [transferReason, setTransferReason] = useState('Monitor replacement for testing booth');

  // Candidate Workstations Fleet (Testing Booths W001 to W036: exactly 36 workstations)
  const workstationSystems = useMemo(() => {
    return systems.filter((s) => s.type === 'workstation' || (!s.type && s.id.startsWith('W')));
  }, [systems]);

  // Active unacknowledged / unresolved alerts list
  const activeAlertsList = useMemo(() => {
    return alerts.filter((a) => !a.resolved);
  }, [alerts]);

  // Metrics sourced directly from workstation fleet & canonical capacity engine
  const totalWorkstationsCount = workstationSystems.length || 36;
  const operationalCount = workstationSystems.filter((s) => s.status === 'operational').length;
  const offlineCount = workstationSystems.filter((s) => s.status === 'offline').length;
  const auditsDueCount = workstationSystems.filter(
    (s) => s.lastAuditDate && s.lastAuditDate.includes('Audit Due')
  ).length || 2;

  // Filtered workstations for Grid, Floor Map and Table views
  const filteredSystems = useMemo(() => {
    return workstationSystems
      .filter((s) => {
        const matchesSearch =
          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.network.ipAddress.includes(searchQuery) ||
          s.os.version.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'audits_due'
            ? s.lastAuditDate?.includes('Audit Due')
            : s.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'id') {
          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
        }
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [workstationSystems, searchQuery, statusFilter, sortBy]);

  // Operational Readiness Badge Configuration
  const operationalState = readinessBreakdown?.operationalState || 'READY';
  const operationalBadgeConfig = {
    READY: {
      label: 'Exam Delivery Ready',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500',
      pulse: true
    },
    ATTENTION: {
      label: 'Attention Required',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500',
      pulse: false
    },
    OFFLINE: {
      label: 'Fleet Offline',
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      dot: 'bg-rose-500',
      pulse: false
    },
    MAINTENANCE: {
      label: 'Maintenance Active',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
      dot: 'bg-indigo-500',
      pulse: false
    }
  }[operationalState] || {
    label: 'Exam Delivery Ready',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
    pulse: true
  };

  // Card accent border class
  const getCardAccentBorder = (status: SystemStatus) => {
    switch (status) {
      case 'operational':
        return 'border-emerald-200 bg-[#ECFDF5] hover:border-emerald-300 hover:shadow-md';
      case 'attention':
        return 'border-amber-300 bg-[#FFFBEB] hover:border-amber-400 hover:shadow-md ring-1 ring-amber-300/70';
      case 'critical':
        return 'border-rose-300 bg-[#FEF2F2] hover:border-rose-400 hover:shadow-md ring-1 ring-rose-300/70';
      case 'offline':
        return 'border-slate-300 bg-[#F1F5F9] hover:border-slate-400 opacity-90';
      case 'maintenance':
        return 'border-indigo-300 bg-[#F1F5F9] hover:border-indigo-400 hover:shadow-md';
      default:
        return 'border-slate-200 bg-[#F8FAFC]';
    }
  };

  const getCardBgColor = (status: SystemStatus) => {
    switch (status) {
      case 'operational':
        return '#ECFDF5';
      case 'attention':
        return '#FFFBEB';
      case 'critical':
        return '#FEF2F2';
      case 'offline':
      case 'maintenance':
      default:
        return '#F1F5F9';
    }
  };

  const getStatusIndicatorDot = (status: SystemStatus) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'attention':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-rose-500';
      case 'offline':
        return 'bg-slate-400';
      case 'maintenance':
        return 'bg-indigo-500';
    }
  };

  const handleCreateSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSystem({
      id: newSystemId || `W${(systems.length + 1).toString().padStart(3, '0')}`,
      name: newSystemHostname || `4960-T${(systems.length + 1).toString().padStart(3, '0')}`,
      hardware: {
        processor: 'Intel Core i3-10100',
        ramGB: Number(newSystemRam),
        storageGB: Number(newSystemStorage),
        storageType: 'SSD',
        monitorModel: 'BENQ GW2480 23.8"',
        cameraModel: 'A-01 HD Pro'
      },
      os: {
        name: 'Windows 11 Home',
        version: newSystemOS || '23H2',
        build: '22631.3007',
        architecture: '64-bit',
        lastUpdateDate: '2026-08-30'
      }
    });
    setAddSystemModalOpen(false);
  };

  const handleReportIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIssue({
      title: issueTitle,
      description: issueDesc,
      type: issueType,
      priority: issuePriority,
      status: 'open',
      systemId: issueSystemId,
      systemName: systems.find((s) => s.id === issueSystemId)?.name,
      reportedBy: currentUser.name
    });
    setReportIssueModalOpen(false);
    setIssueTitle('');
    setIssueDesc('');
  };

  const handleAssetTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    transferAsset(transferAssetTag, transferToSystem, `Testing Lab A - Booth ${transferToSystem}`, transferReason);
    setAssetTransferModalOpen(false);
  };

  return (
    <div className="relative space-y-6 pb-12">
      {/* Luxury Color Theme Ambient Horizon Layers for Overview */}
      <div className="absolute -top-6 -left-6 -right-6 h-[500px] pointer-events-none -z-10 overflow-hidden">
        {/* Overhead warm golden diffuse studio spotlight */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[950px] h-[380px] bg-[radial-gradient(ellipse_at_center,rgba(197,160,89,0.22),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(217,160,70,0.22),transparent_70%)] blur-2xl" />
        {/* Signature Bentley crimson-amber horizon light sweep */}
        <div className="absolute top-16 left-0 right-0 h-32 bg-[linear-gradient(90deg,transparent_0%,rgba(180,30,45,0.12)_25%,rgba(217,145,50,0.18)_50%,rgba(180,30,45,0.12)_75%,transparent_100%)] dark:bg-[linear-gradient(90deg,transparent_0%,rgba(190,30,45,0.20)_25%,rgba(225,160,60,0.25)_50%,rgba(190,30,45,0.20)_75%,transparent_100%)] blur-2xl" />
        {/* Lateral bronze and champagne highlights */}
        <div className="absolute top-20 right-0 w-[460px] h-[340px] bg-[radial-gradient(circle,rgba(223,183,108,0.14),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(217,160,70,0.15),transparent_65%)] blur-3xl" />
        <div className="absolute top-28 left-0 w-[420px] h-[320px] bg-[radial-gradient(circle,rgba(156,121,52,0.12),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(197,160,89,0.14),transparent_65%)] blur-3xl" />
      </div>

      {/* Top Section: Overview Banner (left) + Network Box (top right corner) */}
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
        {/* Top Banner / Summary Header with Luxury Automotive Studio Palette */}
        <div className="flex-1 flex flex-col justify-between gap-4 bg-gradient-to-br from-white via-[#FAF8F5] to-[#F5EFE6] dark:from-[#13161D] dark:via-[#101217] dark:to-[#0A0C0F] p-5 rounded-2xl border border-[#D5C7A8] dark:border-[#382E1E] shadow-sm relative overflow-hidden group">
          {/* Distinctive champagne gold hairline accent on top border */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent pointer-events-none" />
          {/* Subtle top-right warm glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.12),transparent_70%)] pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-stone-900 dark:text-[#FAF7F2] tracking-tight">Overview Command Dashboard</h2>
                <button
                  onClick={() => setIsMorningOpsOpen(true)}
                  title="View Operational Readiness Breakdown"
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold border cursor-pointer transition-transform hover:scale-102 ${operationalBadgeConfig.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${operationalBadgeConfig.dot} ${operationalBadgeConfig.pulse ? 'animate-pulse' : ''}`} />
                  {operationalBadgeConfig.label}
                </button>
              </div>
              <div className="flex items-center shrink-0">
                <ThemeToggle />
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Real-time status, hardware diagnostics, and exam client compliance for {currentCentre.name} ({currentCentre.totalWorkstations} Workstations).
            </p>
          </div>

          {/* Quick Action Buttons - Streamlined Command Center Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsMorningOpsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#090A0D] bg-gradient-to-r from-[#C5A059] via-[#DFB76C] to-[#C5A059] hover:brightness-105 border border-[#9C7934]/30 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Launch Morning Shift Operational Checklist"
            >
              <Clock className="w-3.5 h-3.5 text-[#090A0D]" />
              <span>Morning Ops</span>
            </button>

            <button
              onClick={() => setIsEndOfDayOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-[#161822] hover:bg-stone-50 dark:hover:bg-[#1D202C] border border-stone-200 dark:border-[#2C2417] rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Generate End of Day Operational Summary"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
              <span>End of Day</span>
            </button>

            <button
              onClick={() => navigate('audits')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-[#161822] hover:bg-stone-50 dark:hover:bg-[#1D202C] border border-stone-200 dark:border-[#2C2417] rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Conduct Workstation Hardware & Compliance Audit"
            >
              <FileCheck2 className="w-4 h-4 text-[#9C7934] dark:text-[#DFB76C]" />
              <span>Run Audit</span>
            </button>

            <button
              onClick={() => setAddSystemModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-[#FAF7F2] dark:text-[#090A0D] hover:bg-stone-800 dark:hover:bg-white rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Provision New Workstation into Fleet"
            >
              <Plus className="w-4 h-4" />
              <span>Add System</span>
            </button>
          </div>
        </div>

        {/* Top Right Corner: Live Network Speed Box */}
        <div className="w-full sm:w-80 lg:w-72 xl:w-80 shrink-0 flex flex-col">
          <NetworkSpeedCard
            data={networkData}
            isLoading={isNetworkLoading}
            timeAgoText={networkTimeAgoText}
            onClick={() => setIsNetworkDetailOpen(true)}
            systemsCount={totalWorkstationsCount || 40}
            ispName={currentCentre.primaryIsp || 'JIO Forun'}
            ispSpeed={currentCentre.primaryIspSpeed || '1 Gbps'}
          />
        </div>
      </div>

      {/* DASHBOARD KPI CARDS - COMMAND METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Workstations */}
        <div
          id="kpi-card-total"
          onClick={() => handleKpiCardClick('all')}
          title={isFleetExpanded && statusFilter === 'all' ? 'Click to collapse workstation fleet view' : 'Click to view all 36 workstations'}
          className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
            isFleetExpanded && statusFilter === 'all'
              ? 'bg-gradient-to-r from-[#C5A059] to-[#DFB76C] text-[#090A0D] border-[#C5A059] shadow-md ring-2 ring-[#C5A059]/30 scale-[1.02]'
              : 'bg-gradient-to-br from-white to-[#FAF8F5] dark:from-[#13151B] dark:to-[#0E1015] border-stone-200/90 dark:border-[#2A2216] text-stone-800 dark:text-stone-200 hover:border-stone-300 dark:hover:border-[#C5A059]/40 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold opacity-80">
            <span>Total Workstations</span>
            <div className="flex items-center gap-1">
              <Monitor className="w-4 h-4 text-stone-400" />
              {isFleetExpanded && statusFilter === 'all' ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#090A0D]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              )}
            </div>
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight">{totalWorkstationsCount}</div>
          <div className="text-[11px] opacity-75 mt-1 truncate">36 Testing Booths (W001–W036)</div>
          <div className="text-[10px] font-semibold mt-1.5 opacity-85">
            {isFleetExpanded && statusFilter === 'all' ? 'Active • Click to collapse ▲' : 'Click to open workstations ▼'}
          </div>
        </div>

        {/* Operational */}
        <div
          id="kpi-card-operational"
          onClick={() => handleKpiCardClick('operational')}
          title={isFleetExpanded && statusFilter === 'operational' ? 'Click to collapse operational workstations' : 'Click to view operational workstations'}
          className={`p-4 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
            isFleetExpanded && statusFilter === 'operational'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/30 scale-[1.02]'
              : 'bg-gradient-to-br from-emerald-50/60 to-[#F4F9F6] dark:from-[#111914] dark:to-[#0B120E] border-emerald-200/80 dark:border-[#1E3022] text-stone-800 dark:text-stone-200 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isFleetExpanded && statusFilter === 'operational' ? 'text-white' : 'text-emerald-800 dark:text-emerald-300'}>
              Operational
            </span>
            <div className="flex items-center gap-1">
              <CheckCircle2 className={`w-4 h-4 ${isFleetExpanded && statusFilter === 'operational' ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
              {isFleetExpanded && statusFilter === 'operational' ? (
                <ChevronUp className="w-3.5 h-3.5 text-white" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          </div>
          <div
            className={`mt-2 text-3xl font-black tracking-tight ${
              isFleetExpanded && statusFilter === 'operational' ? 'text-white' : 'text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {operationalCount}
          </div>
          <div
            className={`text-[11px] mt-1 truncate font-semibold ${
              isFleetExpanded && statusFilter === 'operational' ? 'text-white/90' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {totalWorkstationsCount > 0 && !Number.isNaN(operationalCount)
              ? Math.round((operationalCount / totalWorkstationsCount) * 100)
              : 0}% Exam Delivery Ready
          </div>
          <div
            className={`text-[10px] font-semibold mt-1.5 ${
              isFleetExpanded && statusFilter === 'operational' ? 'text-white/80' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isFleetExpanded && statusFilter === 'operational' ? 'Active • Click to collapse ▲' : 'Click to open workstations ▼'}
          </div>
        </div>

        {/* Network Printer: HP Laser MFP 1188fnw */}
        <div className="flex h-full min-h-[140px] w-full">
          <PrinterStatusCard
            data={printerData}
            isLoading={isPrinterLoading}
            timeAgoText={printerTimeAgoText}
            onClick={() => setIsPrinterDetailOpen(true)}
          />
        </div>
      </div>

      {/* WORKSTATION FLEET STATUS & SYSTEM SECTIONS (Expandable on KPI box click) */}
      <AnimatePresence mode="wait">
        {!isFleetExpanded ? (
          /* COLLAPSED STATE PROMPT BANNER */
          <motion.div
            key="collapsed-banner"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="bg-gradient-to-br from-white/95 via-[#FCFBF8] to-[#FAF7F2] dark:from-[#12141A] dark:via-[#101217] dark:to-[#0B0D11] border border-stone-200/90 dark:border-[#2C2417] rounded-xl p-6 text-center shadow-2xs hover:border-stone-300 dark:hover:border-[#C5A059]/40 transition-all cursor-pointer select-none"
            onClick={() => handleKpiCardClick('all')}
          >
            <div className="flex flex-col items-center justify-center max-w-lg mx-auto space-y-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-[#1A1D26] flex items-center justify-center text-[#C5A059] dark:text-[#DFB76C]">
                <Monitor className="w-5 h-5 text-[#9C7934] dark:text-[#DFB76C]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-[#FAF7F2] flex items-center justify-center gap-1.5">
                  <span>Workstation Fleet Status is Hidden</span>
                  <ChevronDown className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Click on any metric box above to open and inspect workstations according to their status.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleKpiCardClick('all');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-900 dark:bg-[#FAF7F2] hover:bg-stone-800 dark:hover:bg-white text-white dark:text-[#090A0D] rounded-lg transition-colors cursor-pointer"
                >
                  All Workstations ({totalWorkstationsCount})
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleKpiCardClick('operational');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Operational ({operationalCount})
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* EXPANDED WORKSTATION FLEET STATUS */
          <motion.div
            key="expanded-fleet"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Active Filter Bar with Quick Close */}
            <div className="flex items-center justify-between bg-white dark:bg-[#12141A] px-4 py-2.5 rounded-xl border border-stone-200 dark:border-[#2C2417] text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 dark:text-stone-400 font-medium">Viewing Fleet:</span>
                <span className="font-bold text-stone-900 dark:text-[#FAF7F2] capitalize">
                  {statusFilter === 'all'
                    ? 'All Workstations'
                    : statusFilter === 'audits_due'
                    ? 'Audits Due'
                    : `${statusFilter} Workstations`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 dark:bg-[#1A1D26] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-[#2C2417]">
                  {filteredSystems.length} {filteredSystems.length === 1 ? 'booth' : 'booths'}
                </span>
              </div>
              <button
                onClick={() => setIsFleetExpanded(false)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-[#FAF7F2] bg-stone-100 dark:bg-[#1A1D26] hover:bg-stone-200 dark:hover:bg-[#252834] rounded-lg transition-colors cursor-pointer"
                title="Collapse workstation fleet view"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide / Collapse</span>
              </button>
            </div>

            {/* WORKSTATION GRID SECTION (Main Core Command Center) */}
            <div className="bg-gradient-to-br from-white via-[#FCFBF8] to-[#FAF8F4] dark:from-[#12141A] dark:via-[#101217] dark:to-[#0B0D11] p-5 rounded-xl border border-[#D5C7A8] dark:border-[#382E1E] shadow-sm space-y-4 relative overflow-hidden">
              {/* Subtle top gold accent line */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent pointer-events-none" />

              {/* Controls Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-stone-200/80 dark:border-[#262017]">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-[#FAF7F2] tracking-tight flex items-center gap-2">
                    <span>Workstation Fleet Status</span>
                    <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                      (Showing {filteredSystems.length} of {systems.length} systems)
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Compact operational overview displaying Workstation ID, Hostname, OS, RAM, SSD, and Exam Apps.
                  </p>
                </div>

                {/* Grid Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search W001, IP, OS..."
                      className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#161822] border border-stone-200 dark:border-[#2C2417] text-stone-900 dark:text-[#FAF7F2] placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059] w-44"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#161822] border border-stone-200 dark:border-[#2C2417] text-stone-700 dark:text-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="operational">Operational</option>
                    <option value="offline">Offline</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="audits_due">Audits Due</option>
                  </select>

                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1.5 text-xs bg-white dark:bg-[#161822] border border-stone-200 dark:border-[#2C2417] text-stone-700 dark:text-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                  >
                    <option value="id">Sort: Workstation ID</option>
                    <option value="status">Sort: Status</option>
                    <option value="name">Sort: Hostname</option>
                  </select>

                  {/* View Mode Toggle: Grid, Floor Map, Table */}
                  <div className="flex items-center border border-stone-200 dark:border-[#2C2417] rounded-lg overflow-hidden bg-stone-100 dark:bg-[#161822] p-0.5">
                    <button
                      id="view-mode-grid"
                      onClick={() => setViewMode('grid')}
                      className={`px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-[#252834] text-[#9C7934] dark:text-[#DFB76C] shadow-2xs font-bold'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-[#FAF7F2]'
                      }`}
                      title="Workstation Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>
                    <button
                      id="view-mode-floor"
                      onClick={() => setViewMode('floor')}
                      className={`px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        viewMode === 'floor'
                          ? 'bg-white dark:bg-[#252834] text-[#9C7934] dark:text-[#DFB76C] shadow-2xs font-bold'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-[#FAF7F2]'
                      }`}
                      title="Interactive 2D Lab Floor Map Blueprint"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#C5A059] dark:text-[#DFB76C]" />
                      <span>Floor Map</span>
                    </button>
                    <button
                      id="view-mode-table"
                      onClick={() => setViewMode('table')}
                      className={`px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                        viewMode === 'table'
                          ? 'bg-white dark:bg-[#252834] text-[#9C7934] dark:text-[#DFB76C] shadow-2xs font-bold'
                          : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-[#FAF7F2]'
                      }`}
                      title="Ledger Table View"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                  </div>

                  {/* Quick Collapse Button */}
                  <button
                    onClick={() => setIsFleetExpanded(false)}
                    className="px-2 py-1 flex items-center gap-1 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1A1D26] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-[#2C2417]"
                    title="Collapse workstation fleet view"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Collapse</span>
                  </button>
                </div>
              </div>

        {/* WORKSTATION VIEWS (Floor Map, Grid, Table) */}
        {viewMode === 'floor' ? (
          <LabFloorMap
            systems={systems}
            onSelectSystem={(sys) => setActiveFlippedSystem(sys)}
            onNavigateDetail={(id) => navigate('system-detail', id)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredSystems.map((system) => (
              <SystemCard
                key={system.id}
                system={system}
                onClick={() => setActiveFlippedSystem(system)}
                onQuickAudit={(sys) => {
                  setSelectedSystemForAction(sys);
                  setQuickAuditModalOpen(true);
                }}
                onReportIssue={(sys) => {
                  setSelectedSystemForAction(sys);
                  setIssueSystemId(sys.id);
                  setReportIssueModalOpen(true);
                }}
                onPrintQR={(sys) => setQrPrintSystem(sys)}
                onTransferAsset={(sys) => {
                  setTransferSourceSystem(sys);
                  setIsTransferModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          /* WORKSTATION TABLE VIEW */
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Workstation ID</th>
                  <th className="px-4 py-3">Hostname</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Audit Status</th>
                  <th className="px-4 py-3">Operating System</th>
                  <th className="px-4 py-3">RAM</th>
                  <th className="px-4 py-3">SSD</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
                {filteredSystems.map((s) => {
                  const rowBgClass =
                    s.status === 'operational'
                      ? 'bg-[#ECFDF5] dark:bg-emerald-950/20'
                      : s.status === 'attention'
                      ? 'bg-[#FFFBEB] dark:bg-amber-950/20'
                      : s.status === 'critical'
                      ? 'bg-[#FEF2F2] dark:bg-rose-950/20'
                      : 'bg-[#F1F5F9] dark:bg-slate-900/40';
                  const rowBorder =
                    s.status === 'operational'
                      ? 'border-emerald-200/80 dark:border-emerald-900/60'
                      : s.status === 'attention'
                      ? 'border-amber-200/80 dark:border-amber-900/60'
                      : s.status === 'critical'
                      ? 'border-rose-200/80 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-800';
                  const isAuditDue = s.lastAuditDate?.includes('Due') || s.lastAuditDate?.toLowerCase().includes('due');

                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors border-b ${rowBorder} ${rowBgClass} hover:brightness-95`}
                    >
                      <td
                        className="px-4 py-3 font-mono font-bold text-slate-950 dark:text-white"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${getStatusIndicatorDot(s.status)}`} />
                          <button
                            onClick={() => navigate('system-detail', s.id)}
                            className="hover:text-emerald-950 dark:hover:text-emerald-400 hover:underline cursor-pointer font-black"
                          >
                            {s.id}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{s.name}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        {isAuditDue ? (
                          <button
                            onClick={() => {
                              setSelectedSystemForAction(s);
                              setQuickAuditModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                            title="Audit Due • Click to launch audit"
                          >
                            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                            <span>Audit Due</span>
                            <span className="underline ml-0.5 text-[10px]">Run →</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <FileCheck2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{s.lastAuditDate ? s.lastAuditDate.replace(' (Audit Due)', '') : 'Audited'}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono text-[11px]">{s.os.name} {s.os.version}</td>
                      <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{s.hardware.ramGB} GB</td>
                      <td className="px-4 py-3 font-bold text-slate-950 dark:text-white">{s.hardware.storageGB} GB</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{s.network.ipAddress}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px]">{s.lastUpdated}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDrawerSystem(s)}
                            className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-semibold text-xs cursor-pointer px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => navigate('system-detail', s.id)}
                            className="text-slate-950 dark:text-white hover:text-emerald-950 dark:hover:text-emerald-400 font-bold text-xs cursor-pointer"
                          >
                            Full →
                          </button>

                          {/* Workstation Table Context Menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveContextMenuId(activeContextMenuId === `tbl-${s.id}` ? null : `tbl-${s.id}`);
                              }}
                              className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors cursor-pointer"
                              title="Workstation Quick Actions"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeContextMenuId === `tbl-${s.id}` && (
                              <div
                                className="absolute right-0 top-6 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 animate-in fade-in text-slate-800 dark:text-slate-100 text-left"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    navigate('system-detail', s.id);
                                    setActiveContextMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                                  <span>View System Details</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedSystemForAction(s);
                                    setIssueSystemId(s.id);
                                    setReportIssueModalOpen(true);
                                    setActiveContextMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Report Issue</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedSystemForAction(s);
                                    setQuickAuditModalOpen(true);
                                    setActiveContextMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                                >
                                  <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Run Audit</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedSystemForAction(s);
                                    const systemAsset = assets?.find((a) => a.assignedSystemId === s.id);
                                    if (systemAsset) {
                                      setTransferAssetTag(systemAsset.id);
                                    } else if (assets && assets.length > 0) {
                                      setTransferAssetTag(assets[0].id);
                                    }
                                    const nextSystem = systems.find(
                                      (item) => item.id !== s.id && (item.type === 'workstation' || item.id.startsWith('W'))
                                    );
                                    setTransferToSystem(nextSystem ? nextSystem.id : 'W001');
                                    setTransferReason(`Hardware transfer/swap for ${s.id}`);
                                    setAssetTransferModalOpen(true);
                                    setActiveContextMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                                >
                                  <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                  <span className="font-medium text-slate-800 dark:text-slate-200">Asset Transfer</span>
                                </button>

                                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                                <button
                                  onClick={() => {
                                    setSystemStatus(
                                      s.id,
                                      s.status === 'operational' ? 'maintenance' : 'operational'
                                    );
                                    setActiveContextMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                  <span>Toggle Maintenance</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam Applications Coverage & Recent Alerts (Always visible foundational overview widgets) */}
      <ExamAndAlertsOverview />

      {/* Workstation Quick Inspector Slide-Over Drawer */}
      <WorkstationInspectorDrawer
        system={selectedDrawerSystem}
        onClose={() => setSelectedDrawerSystem(null)}
        onNavigateDetail={(id) => navigate('system-detail', id)}
        onOpenReportIssue={(id) => {
          setIssueSystemId(id);
          setReportIssueModalOpen(true);
        }}
      />

      {/* QUICK MODAL 1: Add System */}
      <Modal
        isOpen={isAddSystemModalOpen}
        onClose={() => setAddSystemModalOpen(false)}
        title="Register New Testing Workstation"
        subtitle={`Provisioning new hardware in ${currentCentre.name}`}
      >
        <form onSubmit={handleCreateSystemSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workstation ID</label>
              <input
                type="text"
                placeholder="e.g. W041"
                value={newSystemId}
                onChange={(e) => setNewSystemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">System Hostname</label>
              <input
                type="text"
                placeholder="e.g. 4960-T041"
                value={newSystemHostname}
                onChange={(e) => setNewSystemHostname(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">RAM Capacity (GB)</label>
              <select
                value={newSystemRam}
                onChange={(e) => setNewSystemRam(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value={8}>8 GB DDR4</option>
                <option value={16}>16 GB DDR4</option>
                <option value={32}>32 GB DDR4</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SSD Capacity (GB)</label>
              <select
                value={newSystemStorage}
                onChange={(e) => setNewSystemStorage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value={128}>128 GB SSD</option>
                <option value={256}>256 GB NVMe</option>
                <option value={512}>512 GB NVMe</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Operating System</label>
            <input
              type="text"
              value={newSystemOS}
              onChange={(e) => setNewSystemOS(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-[11px] border border-emerald-200">
            <p className="font-semibold">Automated Package Provisioning:</p>
            <p className="mt-0.5">
              Standard exam suite (CMA US, Pearson VUE, PSI, CELPIP, ITTS) will be pre-registered and network IP mapped on 192.168.10.x subnet.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddSystemModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
            >
              Provision System
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 2: Report Issue */}
      <Modal
        isOpen={isReportIssueModalOpen}
        onClose={() => setReportIssueModalOpen(false)}
        title="Report IT or Hardware Fault"
        subtitle="Log an operational incident ticket for immediate technician dispatch"
      >
        <form onSubmit={handleReportIssueSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Affected System</label>
              <select
                value={issueSystemId}
                onChange={(e) => setIssueSystemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={issuePriority}
                onChange={(e) => setIssuePriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-semibold text-rose-700"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical (Immediate Block)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="hardware">Hardware Fault</option>
                <option value="software">Operating System / Software</option>
                <option value="exam_app">Exam Delivery Application</option>
                <option value="network">Network / Connectivity</option>
                <option value="peripheral">Peripheral (Keyboard/Mouse/Headset/Camera)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reported By</label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.role.toUpperCase()})`}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Summary</label>
            <input
              type="text"
              required
              placeholder="e.g. Headset audio cut-out on right channel"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Description & Steps</label>
            <textarea
              rows={3}
              required
              placeholder="Describe symptoms observed, candidate impact, or diagnostic tool error codes..."
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportIssueModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold"
            >
              Raise Incident Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 3: Asset Transfer */}
      <Modal
        isOpen={isAssetTransferModalOpen}
        onClose={() => setAssetTransferModalOpen(false)}
        title={
          selectedSystemForAction
            ? `Hardware Asset Transfer — ${selectedSystemForAction.id}`
            : 'Hardware Asset Movement & Transfer'
        }
        subtitle={
          selectedSystemForAction
            ? `Relocate or swap hardware components for workstation ${selectedSystemForAction.id} (${selectedSystemForAction.name})`
            : 'Log relocation of monitors, peripherals, or computers with full audit trail'
        }
      >
        <form onSubmit={handleAssetTransferSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Asset Tag</label>
            <select
              value={transferAssetTag}
              onChange={(e) => setTransferAssetTag(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
            >
              {assets && assets.length > 0 ? (
                assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} — {a.brand} {a.model} ({a.category.toUpperCase()}){' '}
                    {a.assignedSystemId ? `[Assigned: ${a.assignedSystemId}]` : '[In Storage Reserve]'}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No assets currently registered in inventory
                </option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transfer Destination</label>
              <select
                value={transferToSystem}
                onChange={(e) => setTransferToSystem(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-semibold"
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technician Authorized</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transfer Reason</label>
            <input
              type="text"
              required
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="e.g. Swapped malfunctioning monitor with calibrated reserve"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssetTransferModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold"
            >
              Log Asset Movement
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 4: Quick Audit */}
      {selectedSystemForAction && (
        <Modal
          isOpen={isQuickAuditModalOpen}
          onClose={() => setQuickAuditModalOpen(false)}
          title={`Pre-Exam Audit Check: ${selectedSystemForAction.id}`}
          subtitle={`Auditor: ${currentUser.name} • Calicut Lab A`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between font-mono font-bold text-slate-800">
                <span>{selectedSystemForAction.id} — {selectedSystemForAction.name}</span>
                <span>{selectedSystemForAction.hardware.ramGB}GB RAM | {selectedSystemForAction.hardware.storageGB}GB SSD</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">IP: {selectedSystemForAction.network.ipAddress} • {selectedSystemForAction.os.name} {selectedSystemForAction.os.version}</p>
            </div>

            <div className="space-y-2">
              {[
                'Physical peripherals sanitized, plugged in and tested (Keyboard/Mouse/Headset/Webcam)',
                'Display resolution verified at 1920x1080 @ 60Hz with privacy filter aligned',
                'Exam lockdown clients launched and verified (CMA, PV, PSI, CELPIP, ITTS)',
                'Operating system updates verified without pending restarts',
                'Network latency test < 3ms to testing gateway'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2 bg-white rounded border border-slate-200">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-700 rounded" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickAuditModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  recordAudit({
                    systemId: selectedSystemForAction.id,
                    systemName: selectedSystemForAction.name,
                    auditor: currentUser.name,
                    auditorRole: currentUser.role.toUpperCase(),
                    status: 'passed',
                    checklist: [
                      { id: '1', category: 'General', item: 'All pre-flight checks passed', status: 'pass' }
                    ],
                    notes: 'Quick audit completed successfully. Ready for exam sessions.',
                    durationMinutes: 8
                  });
                  setQuickAuditModalOpen(false);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold"
              >
                Sign Off & Pass Audit
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3D Card Flip Modal */}
      <CardFlipModal
        system={activeFlippedSystem}
        allSystems={filteredSystems}
        isOpen={!!activeFlippedSystem}
        onClose={() => setActiveFlippedSystem(null)}
        onSelectSystem={(sys) => setActiveFlippedSystem(sys)}
        onRunAudit={(sys) => {
          setSelectedSystemForAction(sys);
          setQuickAuditModalOpen(true);
        }}
        onReportIssue={(sys) => {
          setSelectedSystemForAction(sys);
          setIssueSystemId(sys.id);
          setReportIssueModalOpen(true);
        }}
        onPrintQR={(sys) => setQrPrintSystem(sys)}
        onTransferAsset={(sys) => {
          setTransferSourceSystem(sys);
          setIsTransferModalOpen(true);
        }}
      />

      {/* Print QR Modal */}
      {qrPrintSystem && (
        <PrintQRModal
          system={qrPrintSystem}
          isOpen={!!qrPrintSystem}
          onClose={() => setQrPrintSystem(null)}
        />
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onSelectSystem={(sys) => setActiveFlippedSystem(sys)}
      />

      {/* Morning Operations Modal */}
      <MorningOperationsModal
        isOpen={isMorningOpsOpen}
        onClose={() => setIsMorningOpsOpen(false)}
        systems={systems}
        centre={currentCentre}
      />

      {/* End of Day Summary Modal */}
      <EndOfDaySummaryModal
        isOpen={isEndOfDayOpen}
        onClose={() => setIsEndOfDayOpen(false)}
        systems={systems}
        centre={currentCentre}
        movements={assetMovements || []}
        issues={issues}
      />

      {/* Asset Transfer Modal */}
      <AssetTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        sourceSystem={transferSourceSystem}
      />

      {/* Network Speed Detail Modal */}
      <NetworkDetailModal
        isOpen={isNetworkDetailOpen}
        onClose={() => setIsNetworkDetailOpen(false)}
        data={networkData}
        timeAgoText={networkTimeAgoText}
        onRefresh={refreshNetwork}
        onUpdateConfig={updateNetworkConfig}
        onSimulateState={simulateNetworkState}
      />

      {/* Network Printer Detail & Diagnostics Modal (HP Laser MFP 1188fnw) */}
      <PrinterDetailModal
        isOpen={isPrinterDetailOpen}
        onClose={() => setIsPrinterDetailOpen(false)}
        printerData={printerData}
        isLoading={isPrinterLoading}
        timeAgoText={printerTimeAgoText}
        isProbing={isPrinterProbing}
        isPrintingTest={isPrintingTest}
        onRefresh={refreshPrinter}
        onProbe={probePrinter}
        onSendTestPrint={sendTestPrint}
        onSimulateState={simulatePrinterState}
        onUpdateConfig={updatePrinterConfig}
      />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RotateCcw,
  Cpu,
  HardDrive,
  Monitor,
  Camera,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Wifi,
  Network,
  QrCode,
  FileCheck2,
  AlertCircle,
  ArrowLeftRight,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Activity,
  SlidersHorizontal,
  MoreVertical,
  Copy,
  Edit3
} from 'lucide-react';
import { SystemRecord, InstalledExamApp, SystemStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { EditWorkstationModal } from './EditWorkstationModal';

interface SystemCardBackProps {
  system: SystemRecord;
  onClose: () => void;
  onFlipBack: () => void;
  onRunAudit: (system: SystemRecord) => void;
  onReportIssue: (system: SystemRecord) => void;
  onPrintQR: (system: SystemRecord) => void;
  onTransferAsset?: (system: SystemRecord) => void;
  onEditSystem?: (system: SystemRecord) => void;
}

export const SystemCardBack: React.FC<SystemCardBackProps> = ({
  system,
  onClose,
  onFlipBack,
  onRunAudit,
  onReportIssue,
  onPrintQR,
  onTransferAsset,
  onEditSystem
}) => {
  const { setSystemStatus, verifyExamApp, assets } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'hardware' | 'exams' | 'assets' | 'network' | 'issues' | 'drift'
  >('overview');
  const [isVerifying, setIsVerifying] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close 3-dot menu on click outside or escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  // Operational readiness factors based on verified physical & software attributes
  const isOperational = system.status === 'operational';
  const hasSsd = Boolean(system.hardware?.storageGB && system.hardware?.storageGB > 0 && system.hardware?.storageType !== 'None');
  const hasRam = (system.hardware?.ramGB ?? 0) >= 8;
  const isNetworkConnected = system.networkStatus === 'connected' || system.status === 'operational';
  const installedAppsCount = (system.examApps || []).filter((a) => a.status === 'installed').length;
  const totalAppsCount = (system.examApps || []).length;
  const isAgentOnline = system.agentStatus === 'online' || system.status === 'operational';
  const hasActiveIssues = (system.activeIssueCount ?? 0) > 0;

  // Test ping simulation
  const handleTestPing = () => {
    setPingResult('Pinging 192.168.10.1...');
    setTimeout(() => {
      setPingResult('Ping OK: 4 packets sent, 4 received (0% loss), avg 0.8ms');
    }, 600);
  };

  // Assigned assets detail
  const assignedAssets = assets.filter(
    (a) => a.assignedSystemId === system.id || system.assignedAssetIds?.includes(a.id)
  );

  // Status-inspired TCG theme border matching the cards
  const getStatusBorder = () => {
    switch (system.status) {
      case 'operational':
        return 'border-[#C5A059] dark:border-[#DFB76C] shadow-[0_4px_30px_-4px_rgba(223,183,108,0.25)]';
      case 'attention':
        return 'border-[#ea580c] dark:border-[#f97316] shadow-[0_4px_30px_-4px_rgba(249,115,22,0.25)]';
      case 'critical':
        return 'border-[#ef4444] dark:border-[#f87171] shadow-[0_4px_30px_-4px_rgba(239,68,68,0.25)]';
      case 'maintenance':
        return 'border-[#9333ea] dark:border-[#a855f7] shadow-[0_4px_30px_-4px_rgba(168,85,247,0.25)]';
      case 'offline':
      default:
        return 'border-[#64748b] dark:border-[#94a3b8] shadow-[0_4px_30px_-4px_rgba(148,163,184,0.2)]';
    }
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-2xl border-[3px] ${getStatusBorder()} shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900 dark:text-slate-100 relative transition-colors`}>
      {/* Playing Card Header Banner */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* FETS Logo seal / Category tag */}
          <div className="w-10 h-10 rounded-xl bg-[#2A2012] dark:bg-[#1A1610] text-[#DFB76C] font-mono font-black flex items-center justify-center text-sm shadow-sm border border-[#523F23] dark:border-[#7A5E24]">
            {system.type === 'server' ? 'SRV' : system.type === 'admin_pc' ? 'ADM' : 'PC'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
                {system.id}
              </h2>
              <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {system.name}
              </span>
              <StatusBadge status={system.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {system.centreName} • Testing Lab A • IP: {system.network.ipAddress}
            </p>
          </div>
        </div>

        {/* Header Controls: 3-Dot Quick Actions, Flip back & Close */}
        <div className="flex items-center gap-2">
          {/* Quick Actions 3-dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                menuOpen
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
              title="Workstation Quick Actions"
              aria-label="Workstation Quick Actions"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-50 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-xs text-slate-700 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-700 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-mono text-slate-400 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  {system.id} Actions
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      if (onEditSystem) {
                        onEditSystem(system);
                      } else {
                        setIsEditModalOpen(true);
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Edit Workstation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onRunAudit(system);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Run Workstation Audit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onReportIssue(system);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Report Technical Issue</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onPrintQR(system);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Print QR Asset Label</span>
                  </button>

                  {onTransferAsset && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onTransferAsset(system);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span>Transfer Workstation</span>
                    </button>
                  )}
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(system.network.ipAddress);
                      setCopiedIp(true);
                      setTimeout(() => setCopiedIp(false), 2000);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center justify-between font-medium cursor-pointer text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                      <span>Copy IP Address</span>
                    </span>
                    {copiedIp && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.5 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onFlipBack();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5 font-medium cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Flip Card to Front</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onFlipBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Flip card back to front"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Flip Back</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close detail card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* QUICK ACTION BAR */}
      <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onReportIssue(system)}
            className="px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/70 border border-amber-300 dark:border-amber-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Report Issue</span>
          </button>
          <button
            type="button"
            onClick={() => onRunAudit(system)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 border border-blue-300 dark:border-blue-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>Run Audit</span>
          </button>
          <button
            type="button"
            onClick={() => onPrintQR(system)}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Print QR</span>
          </button>
          {onTransferAsset && (
            <button
              type="button"
              onClick={() => onTransferAsset(system)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Transfer Asset</span>
            </button>
          )}
        </div>

        {/* Operational Status Badge */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 leading-none">
              Operational State
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mt-0.5">
              {system.status}
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${
              system.status === 'operational'
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : system.status === 'attention'
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : system.status === 'critical'
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                : system.status === 'maintenance'
                ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                : 'bg-slate-400'
            }`}
          />
        </div>
      </div>

      {/* MODULAR SECTION NAVIGATION TABS */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto bg-white dark:bg-slate-900 pt-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-950 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Summary & Specs
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hardware'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-950 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Hardware & OS
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'exams'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-950 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Exam Applications</span>
          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded-full">
            {system.examApps.filter((a) => a.status === 'installed').length}/5
          </span>
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'assets'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-950 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Assigned Assets ({assignedAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'network'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-950 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Network & Switch
        </button>
        <button
          onClick={() => setActiveTab('drift')}
          className={`px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'drift'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-950 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/30'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3 h-3 text-slate-400" />
          <span>Config Standard & Drift</span>
        </button>
      </div>

      {/* BODY CONTENT AREA */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/30 dark:bg-slate-900/60">
        {/* TAB 1: OVERVIEW SUMMARY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Workstation Verification & Operational Checklist */}
            <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Workstation Operational Checklist
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                    isOperational
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}>
                    {isOperational ? 'CERTIFIED READY' : 'ACTION REQUIRED'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">RAM (≥8GB)</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{system.hardware?.ramGB ?? 0} GB</div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${hasRam ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {hasRam ? 'PASSED' : 'LOW RAM'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Storage</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {hasSsd ? `${system.hardware?.storageGB}GB SSD` : 'No SSD'}
                  </div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${hasSsd ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {hasSsd ? 'PASSED' : 'REQUIRED'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Ethernet</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {system.network?.linkSpeed || '1000 Mbps'}
                  </div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${isNetworkConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isNetworkConnected ? 'CONNECTED' : 'DISCONNECTED'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Exam Clients</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {installedAppsCount}/{totalAppsCount || 5}
                  </div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${installedAppsCount >= (totalAppsCount || 5) ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {installedAppsCount >= (totalAppsCount || 5) ? 'ALL VERIFIED' : 'PENDING'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Incidents</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {system.activeIssueCount ?? 0}
                  </div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${!hasActiveIssues ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {!hasActiveIssues ? 'CLEAR' : 'OPEN TICKETS'}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750">
                  <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Agent Sync</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {isAgentOnline ? 'Heartbeat OK' : 'Offline'}
                  </div>
                  <div className={`text-[9px] font-semibold mt-0.5 ${isAgentOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isAgentOnline ? 'ONLINE' : 'UNREACHABLE'}
                  </div>
                </div>
              </div>

              {!hasSsd && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                  <span className="font-bold shrink-0">Operator Alert:</span>
                  <span>SSD installation required before this workstation can be assigned to exam candidates.</span>
                </div>
              )}
            </div>

            {/* Grid of Core Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Module: Hardware Core */}
              <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Hardware</span>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Calibrated</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Processor</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.hardware.processor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">RAM</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.hardware.ramGB} GB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Storage</span>
                    <span className={`font-semibold ${system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'No SSD Installed' : `${system.hardware.storageGB} GB ${system.hardware.storageType}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Monitor</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.hardware.monitorModel}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Camera</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.hardware.cameraModel}</span>
                  </div>
                </div>
              </div>

              {/* Module: Operating System */}
              <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <span>Operating System</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    Lockdown Active
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Edition</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.os.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Version</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.os.version}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Build</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{system.os.build}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Architecture</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.os.architecture}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Last Windows Update</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">{system.os.lastUpdateDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module: Exam Applications Row */}
            <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Exam Applications Readiness</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('exams')}
                  className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {system.examApps.map((app) => (
                  <div
                    key={app.appId}
                    className={`p-2.5 rounded-lg border text-center ${
                      app.status === 'installed'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-300'
                        : app.status === 'issue'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{app.appName}</div>
                    <div className="text-[10px] font-mono mt-0.5 opacity-80">{app.version}</div>
                    <div className="mt-1.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          app.status === 'installed'
                            ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                            : app.status === 'issue'
                            ? 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300'
                            : 'bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module: Issues & Audit Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Issues */}
              <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Open Issues</span>
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      system.activeIssueCount === 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300'
                    }`}
                  >
                    {system.activeIssueCount} Open
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {system.notes || 'No active defects logged for this testing booth.'}
                </p>
                <button
                  type="button"
                  onClick={() => onReportIssue(system)}
                  className="w-full py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Log System Issue
                </button>
              </div>

              {/* Audit */}
              <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Audit Verification</span>
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      system.lastAuditDate?.includes('Due')
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'
                    }`}
                  >
                    {system.lastAuditDate?.includes('Due') ? 'Audit Due' : 'Current'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span>Last Audit:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{system.lastAuditDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inspector:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Lazeem M. (Admin)</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRunAudit(system)}
                  className="w-full py-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800/80 rounded-lg transition-colors cursor-pointer"
                >
                  Run Compliance Audit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HARDWARE & OS */}
        {activeTab === 'hardware' && (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                Complete Hardware Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Processor (CPU)</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{system.hardware.processor}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Socket LGA1200 • 4 Cores / 8 Threads</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Memory (RAM)</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{system.hardware.ramGB} GB DDR4</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">2666 MHz Non-ECC Single Rank</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Primary Storage</div>
                  <div className={`text-sm font-bold mt-1 ${system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'No SSD Installed' : `${system.hardware.storageGB} GB ${system.hardware.storageType}`}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'Pending 128 GB SSD installation' : 'SATA III 6Gbps • BitLocker Encrypted'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Testing Display</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{system.hardware.monitorModel}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">1920x1080 @ 60Hz • HDMI Input</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Biometric / Proctor Camera</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{system.hardware.cameraModel}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">1080p 30fps Wide-Angle Lens</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">Peripherals Bundle</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                    {system.hardware.keyboardModel || 'Logitech K120'} +{' '}
                    {system.hardware.mouseModel || 'Logitech B100'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Audio: {system.hardware.headsetModel || 'Jabra UC Voice 150'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXAM APPLICATIONS */}
        {activeTab === 'exams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    {system.type === 'admin_pc'
                      ? 'DIVISION 2: ADMIN & ADMISSION APPLICATIONS'
                      : 'DIVISION 1: EXAM DELIVERY APPLICATIONS'}
                  </h4>
                  <span
                    className={`text-[9.5px] font-black uppercase px-2 py-0.2 rounded border ${
                      system.type === 'admin_pc'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {system.type === 'admin_pc' ? 'Admin Fleet' : 'Workstation Fleet'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {system.type === 'admin_pc'
                    ? `Staff, proctor & candidate check-in consoles configured on ${system.id}`
                    : `Secure testing delivery lockdown clients configured on ${system.id}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsVerifying(true);
                  setTimeout(() => setIsVerifying(false), 800);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Verify All Checksums</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {system.examApps.map((app) => {
                const hasDrift = app.expectedVersion && app.version && app.version !== app.expectedVersion;

                return (
                  <div
                    key={app.appId}
                    className="p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          app.status === 'installed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : app.status === 'issue'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {app.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{app.appName}</span>
                          {hasDrift && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Drift: Exp v{app.expectedVersion}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          Installed: v{app.version} • Last Verified: {app.lastVerified}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          verifyExamApp(
                            system.id,
                            app.appId,
                            e.target.value as InstalledExamApp['status']
                          )
                        }
                        className={`text-xs font-bold px-2 py-1 rounded-md border cursor-pointer ${
                          app.status === 'installed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                            : app.status === 'issue'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80'
                        }`}
                      >
                        <option value="installed">Installed</option>
                        <option value="missing">Missing</option>
                        <option value="issue">Issue</option>
                        <option value="not_verified">Not Verified</option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          verifyExamApp(
                            system.id,
                            app.appId,
                            'installed'
                          )
                        }
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors cursor-pointer"
                      >
                        Test Launch
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ASSIGNED ASSETS */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Hardware Assets Assigned to {system.id}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Serialized hardware assets physically deployed at this testing booth
                </p>
              </div>
              {onTransferAsset && (
                <button
                  type="button"
                  onClick={() => onTransferAsset(system)}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Transfer / Swap Asset</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignedAssets.length > 0 ? (
                assignedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {asset.id}
                      </span>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {asset.brand} {asset.model}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        SN: {asset.serialNumber}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      {asset.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                  No registered assets currently linked to {system.id}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: NETWORK */}
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#EFF6FF] dark:bg-blue-950/20 rounded-xl border border-[#BFDBFE] dark:border-blue-900/50 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#1D4ED8] dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-400" />
                  <span>Network Interface & Switch Port</span>
                </h4>
                <button
                  type="button"
                  onClick={handleTestPing}
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                >
                  Ping Test Gateway
                </button>
              </div>

              {pingResult && (
                <div className="p-2.5 bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg shadow-inner border border-slate-800">
                  {pingResult}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-[#BFDBFE] dark:border-blue-900/40">
                  <div className="text-[#1D4ED8] dark:text-blue-400 font-medium">IP Address</div>
                  <div className="font-mono font-bold text-[#1D4ED8] dark:text-blue-300 mt-0.5">
                    {system.network.ipAddress}
                  </div>
                </div>
                <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-[#BFDBFE] dark:border-blue-900/40">
                  <div className="text-[#1D4ED8] dark:text-blue-400 font-medium">MAC Address</div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {system.network.macAddress}
                  </div>
                </div>
                <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-[#BFDBFE] dark:border-blue-900/40">
                  <div className="text-[#1D4ED8] dark:text-blue-400 font-medium">Default Gateway</div>
                  <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{system.network.gateway}</div>
                </div>
                <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-[#BFDBFE] dark:border-blue-900/40">
                  <div className="text-[#1D4ED8] dark:text-blue-400 font-medium">Switch & Port</div>
                  <div className="font-mono font-bold text-[#2563EB] dark:text-blue-300 mt-0.5">
                    {system.network.switchId} • Port {system.network.switchPort} (VLAN {system.network.vlan})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONFIG STANDARD & DRIFT */}
        {activeTab === 'drift' && (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Baseline Configuration Verification</span>
                </h4>
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80">
                  Calicut Lab Standard v2.4
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <span className="text-slate-700 dark:text-slate-300">OS Standard: Windows 11 Home 64-bit</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Compliant ({system.os.name})
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <span className="text-slate-700 dark:text-slate-300">RAM Baseline: Minimum 8 GB</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Compliant ({system.hardware.ramGB} GB)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <span className="text-slate-700 dark:text-slate-300">Storage Baseline: Minimum 128 GB SSD</span>
                  {system.hardware.storageType === 'None' || !system.hardware.storageGB ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Non-Compliant (No SSD)
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Compliant ({system.hardware.storageGB} GB)
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-750">
                  <span className="text-slate-700 dark:text-slate-300">All 5 Core Exam Clients Installed</span>
                  {system.examApps.every((a) => a.status === 'installed') ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> 5/5 Installed
                    </span>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Configuration Drift Detected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>System Record: {system.id}</span>
          <span>•</span>
          <span>Last Updated: {system.lastUpdated}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFlipBack}
            className="px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Flip to Card Front
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold bg-emerald-800 dark:bg-emerald-700 text-white hover:bg-emerald-900 dark:hover:bg-emerald-600 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>

      {/* Edit Workstation Modal - conditionally mounted */}
      {isEditModalOpen && (
        <EditWorkstationModal
          system={system}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

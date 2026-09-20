import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  Wrench,
  Clock,
  MoreVertical,
  QrCode,
  FileCheck2,
  AlertCircle,
  ArrowLeftRight,
  RotateCw,
  Eye,
  Cpu,
  HardDrive,
  Network,
  Monitor,
  GraduationCap,
  Edit3,
  Server
} from 'lucide-react';
import { SystemRecord, SystemStatus } from '../../types';
import { EditWorkstationModal } from './EditWorkstationModal';

interface SystemCardProps {
  system: SystemRecord;
  onClick: () => void;
  onQuickAudit?: (system: SystemRecord) => void;
  onReportIssue?: (system: SystemRecord) => void;
  onPrintQR?: (system: SystemRecord) => void;
  onTransferAsset?: (system: SystemRecord) => void;
  onEditSystem?: (system: SystemRecord) => void;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (systemId: string) => void;
  showCompareCheckbox?: boolean;
}

// =========================================================================
// ORNATE TCG CORNER ACCENTS (Stepped corner notch brackets from photo)
// =========================================================================
const TcgCornerAccents: React.FC<{
  borderColor: string;
  dotColor: string;
}> = ({ borderColor, dotColor }) => (
  <div className="pointer-events-none absolute inset-0 z-20">
    {/* Top-Left Corner Notch */}
    <div className={`absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 ${borderColor}`} />
    <div className={`absolute top-2.5 left-2.5 w-1 h-1 rounded-full ${dotColor}`} />

    {/* Top-Right Corner Notch */}
    <div className={`absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 ${borderColor}`} />
    <div className={`absolute top-2.5 right-2.5 w-1 h-1 rounded-full ${dotColor}`} />

    {/* Bottom-Left Corner Notch */}
    <div className={`absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 ${borderColor}`} />
    <div className={`absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full ${dotColor}`} />

    {/* Bottom-Right Corner Notch */}
    <div className={`absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 ${borderColor}`} />
    <div className={`absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full ${dotColor}`} />
  </div>
);

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  onClick,
  onQuickAudit,
  onReportIssue,
  onPrintQR,
  onTransferAsset,
  onEditSystem,
  isSelectedForCompare = false,
  onToggleCompare,
  showCompareCheckbox = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBottomHovered, setIsBottomHovered] = useState(false);
  const [isFlippedManual, setIsFlippedManual] = useState(false);
  const [forceFront, setForceFront] = useState(false);
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

  // Category Badge Mapping
  const getCategoryBadge = () => {
    switch (system.type) {
      case 'server':
        return { label: 'SRV', fullName: 'Server Core', icon: Server };
      case 'admin_pc':
        return { label: 'ADM', fullName: 'Admin Terminal', icon: Monitor };
      case 'workstation':
        return { label: 'PC', fullName: 'Workstation', icon: Monitor };
      default:
        return { label: 'DEV', fullName: 'Device Node', icon: Monitor };
    }
  };

  // =========================================================================
  // REFINED THEME PALETTES (Green and Crimson removed as requested)
  // 1. Solar Gold / Champagne Amber (Operational - inspired by the foreground card)
  // 2. Solar Tangerine / Ember Flame (Attention)
  // 3. Electric Scarlet / Modern Alert (Critical)
  // 4. Astral Amethyst / Royal Violet (Maintenance)
  // 5. Cosmic Midnight / Cyber Slate (Offline)
  // =========================================================================
  const getTcgTheme = (status: SystemStatus) => {
    switch (status) {
      case 'operational':
        return {
          label: 'OPERATIONAL',
          shortLabel: 'OP',
          outerBorder: 'border-[#C5A059] dark:border-[#DFB76C]',
          outerGlow: 'shadow-[0_4px_18px_-3px_rgba(223,183,108,0.28)] hover:shadow-[0_8px_25px_-2px_rgba(197,160,89,0.42)]',
          innerFrameBorder: 'border-[#E8D7B5] dark:border-[#523F23]',
          cornerBorder: 'border-[#C5A059] dark:border-[#DFB76C]',
          cornerDot: 'bg-[#C5A059] dark:bg-[#DFB76C]',
          bgGradientFront: 'bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDD] dark:from-[#14110C] dark:via-[#1A1610] dark:to-[#0E0C08]',
          bgGradientBack: 'bg-gradient-to-br from-[#120F0B] via-[#1A1611] to-[#0A0806]',
          idGradient: 'bg-gradient-to-br from-[#785416] via-[#B88728] to-[#C5A059] dark:from-[#FFF2D4] dark:via-[#F5E2B8] dark:to-[#DFB76C]',
          accentText: 'text-[#8A631E] dark:text-[#DFB76C]',
          subText: 'text-[#A88338] dark:text-[#F5E2B8]',
          sigilBg: 'bg-[#FAF3E0] dark:bg-[#251E14]',
          sigilBorder: 'border-[#E8D7B5] dark:border-[#7A5E24]',
          sigilGlow: 'bg-[#DFB76C]',
          sigilIconColor: 'text-[#8A631E] dark:text-[#DFB76C]',
          badgeBg: 'bg-[#C5A059]/15 text-[#785416] dark:text-[#DFB76C] border-[#C5A059]/40',
          dotColor: 'bg-[#C5A059] dark:bg-[#DFB76C] shadow-[0_0_8px_rgba(223,183,108,0.85)]',
          icon: CheckCircle2
        };

      case 'attention':
        return {
          label: 'ATTENTION',
          shortLabel: 'ATTN',
          outerBorder: 'border-[#ea580c] dark:border-[#f97316]',
          outerGlow: 'shadow-[0_4px_18px_-3px_rgba(234,88,12,0.28)] hover:shadow-[0_8px_25px_-2px_rgba(249,115,22,0.42)]',
          innerFrameBorder: 'border-[#fed7aa] dark:border-[#7c2d12]/70',
          cornerBorder: 'border-[#ea580c] dark:border-[#f97316]',
          cornerDot: 'bg-[#f97316]',
          bgGradientFront: 'bg-gradient-to-b from-[#fffaf5] via-[#fff5eb] to-[#ffedd5] dark:from-[#1c0e05] dark:via-[#261308] dark:to-[#140a04]',
          bgGradientBack: 'bg-gradient-to-br from-[#180b03] via-[#241206] to-[#0d0602]',
          idGradient: 'bg-gradient-to-br from-[#9a3412] via-[#c2410c] to-[#ea580c] dark:from-[#ffedd5] dark:via-[#fed7aa] dark:to-[#fb923c]',
          accentText: 'text-[#9a3412] dark:text-[#fed7aa]',
          subText: 'text-[#c2410c] dark:text-[#fb923c]',
          sigilBg: 'bg-orange-50 dark:bg-orange-950/80',
          sigilBorder: 'border-orange-300 dark:border-orange-700',
          sigilGlow: 'bg-orange-400',
          sigilIconColor: 'text-orange-700 dark:text-orange-300',
          badgeBg: 'bg-orange-500/15 text-orange-800 dark:text-orange-200 border-orange-500/40',
          dotColor: 'bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.85)]',
          icon: AlertTriangle
        };

      case 'critical':
        return {
          label: 'CRITICAL',
          shortLabel: 'CRIT',
          outerBorder: 'border-[#ef4444] dark:border-[#f87171]',
          outerGlow: 'shadow-[0_4px_18px_-3px_rgba(239,68,68,0.28)] hover:shadow-[0_8px_25px_-2px_rgba(248,113,113,0.45)]',
          innerFrameBorder: 'border-[#fecaca] dark:border-[#7f1d1d]/70',
          cornerBorder: 'border-[#ef4444] dark:border-[#f87171]',
          cornerDot: 'bg-[#f87171]',
          bgGradientFront: 'bg-gradient-to-b from-[#fff8f8] via-[#fff1f1] to-[#fee2e2] dark:from-[#1f0a0a] dark:via-[#290d0d] to-[#140606]',
          bgGradientBack: 'bg-gradient-to-br from-[#1a0707] via-[#240a0a] to-[#0e0404]',
          idGradient: 'bg-gradient-to-br from-[#991b1b] via-[#dc2626] to-[#ef4444] dark:from-[#fee2e2] dark:via-[#fca5a5] dark:to-[#f87171]',
          accentText: 'text-[#991b1b] dark:text-[#fca5a5]',
          subText: 'text-[#dc2626] dark:text-[#f87171]',
          sigilBg: 'bg-red-50 dark:bg-red-950/80',
          sigilBorder: 'border-red-300 dark:border-red-700',
          sigilGlow: 'bg-red-500',
          sigilIconColor: 'text-red-700 dark:text-red-300',
          badgeBg: 'bg-red-500/15 text-red-800 dark:text-red-200 border-red-500/40',
          dotColor: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.85)]',
          icon: ShieldAlert
        };

      case 'maintenance':
        return {
          label: 'MAINTENANCE',
          shortLabel: 'MNT',
          outerBorder: 'border-[#9333ea] dark:border-[#a855f7]',
          outerGlow: 'shadow-[0_4px_18px_-3px_rgba(168,85,247,0.28)] hover:shadow-[0_8px_25px_-2px_rgba(147,51,234,0.42)]',
          innerFrameBorder: 'border-[#e9d5ff] dark:border-[#581c87]/70',
          cornerBorder: 'border-[#9333ea] dark:border-[#a855f7]',
          cornerDot: 'bg-[#a855f7]',
          bgGradientFront: 'bg-gradient-to-b from-[#faf5ff] via-[#f5edff] to-[#edd9ff] dark:from-[#180826] dark:via-[#220c36] to-[#100519]',
          bgGradientBack: 'bg-gradient-to-br from-[#140620] via-[#1e0a2f] to-[#0c0314]',
          idGradient: 'bg-gradient-to-br from-[#581c87] via-[#7e22ce] to-[#9333ea] dark:from-[#f3e8ff] dark:via-[#d8b4fe] dark:to-[#c084fc]',
          accentText: 'text-[#581c87] dark:text-[#d8b4fe]',
          subText: 'text-[#7e22ce] dark:text-[#c084fc]',
          sigilBg: 'bg-purple-50 dark:bg-purple-950/80',
          sigilBorder: 'border-purple-300 dark:border-purple-700',
          sigilGlow: 'bg-purple-400',
          sigilIconColor: 'text-purple-700 dark:text-purple-300',
          badgeBg: 'bg-purple-500/15 text-purple-800 dark:text-purple-200 border-purple-500/40',
          dotColor: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.85)]',
          icon: Wrench
        };

      case 'offline':
      default:
        return {
          label: 'OFFLINE',
          shortLabel: 'OFF',
          outerBorder: 'border-[#64748b] dark:border-[#94a3b8]',
          outerGlow: 'shadow-[0_4px_18px_-3px_rgba(100,116,139,0.2)] hover:shadow-[0_8px_25px_-2px_rgba(148,163,184,0.35)]',
          innerFrameBorder: 'border-[#cbd5e1] dark:border-[#334155]',
          cornerBorder: 'border-[#64748b] dark:border-[#94a3b8]',
          cornerDot: 'bg-[#94a3b8]',
          bgGradientFront: 'bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#0f141d] dark:via-[#141b27] to-[#0a0d14]',
          bgGradientBack: 'bg-gradient-to-br from-[#0c1017] via-[#111721] to-[#080b0f]',
          idGradient: 'bg-gradient-to-br from-[#334155] via-[#475569] to-[#64748b] dark:from-[#f1f5f9] dark:via-[#cbd5e1] dark:to-[#94a3b8]',
          accentText: 'text-[#334155] dark:text-[#cbd5e1]',
          subText: 'text-[#475569] dark:text-[#94a3b8]',
          sigilBg: 'bg-slate-100 dark:bg-slate-850',
          sigilBorder: 'border-slate-300 dark:border-slate-700',
          sigilGlow: 'bg-slate-400',
          sigilIconColor: 'text-slate-600 dark:text-slate-400',
          badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/40',
          dotColor: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]',
          icon: WifiOff
        };
    }
  };

  const theme = getTcgTheme(system.status);
  const category = getCategoryBadge();
  const CategoryIcon = category.icon;

  // Exam apps count installed
  const installedExamApps = system.examApps.filter((a) => a.status === 'installed');
  const installedExamAppsCount = installedExamApps.length;
  const isAuditDue = system.lastAuditDate?.includes('Due') || system.lastAuditDate?.toLowerCase().includes('due');

  const isFlipped = (isBottomHovered || isFlippedManual || menuOpen) && !forceFront;

  return (
    <div
      id={`system-card-${system.id}`}
      className={`flip-card group relative w-full h-[276px] select-none text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C5A059] rounded-xl transition-all duration-300 hover:-translate-y-1 ${
        isFlipped ? 'flipped' : ''
      } ${forceFront ? 'force-front' : ''}`}
      onMouseLeave={() => {
        setIsBottomHovered(false);
        setIsFlippedManual(false);
        setForceFront(false);
      }}
      onClick={() => {
        onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flip-card-inner">
        {/* =========================================================================
            FRONT FACE (Ultra-compact, pristine, fits completely in 276px)
            ========================================================================= */}
        <div
          className={`flip-card-front p-1.5 rounded-xl border-2 ${theme.outerBorder} ${theme.outerGlow} transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
            isSelectedForCompare ? 'ring-2 ring-[#C5A059]' : ''
          }`}
        >
          {/* ORNATE CORNER NOTCHES */}
          <TcgCornerAccents borderColor={theme.cornerBorder} dotColor={theme.cornerDot} />

          {/* INNER COLLECTIBLE CARD FRAME */}
          <div
            className={`relative w-full h-full rounded-lg border ${theme.innerFrameBorder} ${theme.bgGradientFront} p-2 flex flex-col justify-between overflow-hidden shadow-inner`}
          >
            {/* HOLOGRAPHIC CROSSHATCH / PRISMATIC MESH FOIL */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.10] dark:opacity-[0.16] mix-blend-overlay"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 8px),
                  repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 8px)
                `
              }}
            />

            {/* INTERACTIVE HOLOGRAPHIC GLEAM SWEEP */}
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 z-15"
              style={{ willChange: 'transform' }}
            />

            {/* TOP HEADER ROW */}
            <div className="flex items-center justify-between relative z-10">
              {/* Top-Left: Sigil Orb + Category */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border shadow-2xs ${theme.sigilBg} ${theme.sigilBorder}`}
                >
                  <CategoryIcon className={`w-3 h-3 ${theme.sigilIconColor}`} />
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9.5px] font-black font-mono px-1.5 py-0.5 rounded border leading-none ${theme.badgeBg}`}
                  >
                    {category.label}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 dark:text-stone-400">
                    B{system.id.replace('W', '')}
                  </span>
                </div>
              </div>

              {/* Top-Right: Compare + Status */}
              <div className="flex items-center gap-1.5">
                {showCompareCheckbox && (
                  <input
                    type="checkbox"
                    checked={isSelectedForCompare}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => onToggleCompare?.(system.id)}
                    className="w-3 h-3 rounded text-amber-600 focus:ring-amber-600 cursor-pointer accent-amber-600 dark:bg-stone-700 dark:border-stone-600"
                    title="Select to compare"
                  />
                )}

                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9.5px] font-black tracking-tight shadow-2xs ${theme.badgeBg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor} animate-soft-pulse`} />
                  <span>{theme.shortLabel}</span>
                </div>
              </div>
            </div>

            {/* CENTRE HERO: WORKSTATION ID & HARDWARE SPECS */}
            <div className="flex flex-col items-center justify-center text-center relative z-10 py-1">
              {/* Big Bold Hero Workstation ID */}
              <div
                className={`text-2xl sm:text-[28px] font-black tracking-tight font-sans bg-clip-text text-transparent ${theme.idGradient} drop-shadow-2xs group-hover:scale-105 transition-transform duration-200 leading-tight`}
              >
                {system.id}
              </div>

              {/* Hostname & Lab */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-600 dark:text-stone-300 mt-0.5 truncate max-w-full px-1">
                <span className="font-bold">{system.name}</span>
                <span className="text-stone-300 dark:text-stone-600">•</span>
                <span className="text-stone-500 dark:text-stone-400">{system.centreName.split(' ')[0] || 'Calicut'}</span>
              </div>

              {/* Hardware Spec Chips */}
              <div className="mt-1.5 inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-md bg-white/75 dark:bg-black/45 border border-stone-200/80 dark:border-stone-800/80 text-[9.5px] font-mono text-stone-700 dark:text-stone-200 shadow-2xs">
                <span className="font-bold flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5 text-stone-400" />
                  {system.hardware.ramGB}GB RAM
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    system.hardware.storageType === 'None' || !system.hardware.storageGB
                      ? 'text-amber-700 dark:text-amber-400 font-bold'
                      : ''
                  }`}
                >
                  <HardDrive className="w-2.5 h-2.5 text-stone-400" />
                  {system.hardware.storageType === 'None' || !system.hardware.storageGB
                    ? 'No SSD'
                    : `${system.hardware.storageGB}GB ${system.hardware.storageType}`}
                </span>
              </div>

              {/* Audit Status Pill */}
              <div className="mt-1.5">
                {isAuditDue ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onQuickAudit) onQuickAudit(system);
                      else onClick();
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-100 shadow-2xs cursor-pointer group/audit"
                    title="Audit Due • Click to launch audit"
                  >
                    <Clock className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span>Audit Due</span>
                    <span className="underline ml-0.5 text-[8.5px] group-hover/audit:text-blue-900 dark:group-hover/audit:text-blue-100">
                      Run →
                    </span>
                  </button>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-medium text-stone-600 dark:text-stone-300 bg-white/60 dark:bg-black/35 border border-stone-200/80 dark:border-stone-800"
                    title={`Last audited: ${system.lastAuditDate || 'Completed'}`}
                  >
                    <FileCheck2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{system.lastAuditDate ? system.lastAuditDate.replace(' (Audit Due)', '') : 'Audit: OK'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* BOTTOM SECTION: TELEMETRY + COMPACT FLIP ZONE */}
            <div className="flex flex-col gap-1 relative z-10 pt-1 border-t border-stone-200/70 dark:border-stone-800/80">
              {/* Telemetry Row: IP Address & Exam Apps Count */}
              <div className="flex items-center justify-between text-[9px] font-mono text-stone-600 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <Network className="w-2.5 h-2.5 text-stone-400" />
                  {system.network.ipAddress}
                </span>

                <div className="flex items-center gap-1">
                  <GraduationCap className="w-2.5 h-2.5 text-stone-400" />
                  <span
                    className={`font-bold ${
                      installedExamAppsCount >= (system.type === 'admin_pc' ? 4 : 5)
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {installedExamAppsCount}/{system.type === 'admin_pc' ? 4 : 5} Apps
                  </span>
                </div>
              </div>

              {/* Status & Issue Row */}
              <div className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1 font-bold tracking-tight uppercase">
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                  <span className={theme.accentText}>{theme.label}</span>
                </div>

                {system.activeIssueCount > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/80 px-1.5 py-0.2 rounded border border-rose-300 dark:border-rose-800 text-[8.5px]">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {system.activeIssueCount} Issue{system.activeIssueCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-stone-400 dark:text-stone-500 font-mono text-[8.5px]">
                    Port P{system.id.replace('W', '')}
                  </span>
                )}
              </div>

              {/* COMPACT FLIP ZONE */}
              <div
                id={`card-bottom-flip-zone-${system.id}`}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setIsBottomHovered(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlippedManual((prev) => !prev);
                }}
                className={`py-0.5 px-2 rounded-md bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/80 border border-dashed ${theme.innerFrameBorder} text-stone-600 dark:text-stone-300 flex items-center justify-between transition-all duration-150 cursor-pointer select-none group/flip-trigger shadow-2xs`}
                title="Hover or tap here to flip card to specs"
              >
                <div className="flex items-center gap-1 text-[8.5px] font-semibold">
                  <RotateCw className={`w-2.5 h-2.5 ${theme.accentText} group-hover/flip-trigger:rotate-180 transition-transform duration-400`} />
                  <span>Hover to flip</span>
                </div>
                <span
                  className={`text-[8px] font-mono font-black uppercase tracking-wider px-1 py-0.2 rounded bg-black/5 dark:bg-white/10 ${theme.accentText}`}
                >
                  Specs ↻
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BACK FACE (Matching Compact Diagnostic Vault in 276px)
            ========================================================================= */}
        <div
          className={`flip-card-back p-1.5 rounded-xl border-2 ${theme.outerBorder} ${theme.outerGlow} transition-all duration-300 flex flex-col justify-between overflow-hidden relative text-white`}
        >
          {/* ORNATE CORNER NOTCHES ON BACK */}
          <TcgCornerAccents borderColor={theme.cornerBorder} dotColor={theme.cornerDot} />

          {/* INNER OBSIDIAN VAULT */}
          <div
            className={`relative w-full h-full rounded-lg border ${theme.innerFrameBorder} ${theme.bgGradientBack} p-2 flex flex-col justify-between overflow-hidden shadow-2xl`}
          >
            {/* Top Row: System ID + Category + 3-Dot Quick Actions Menu */}
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-1 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-mono font-black text-white tracking-tight">
                    {system.id}
                  </span>
                  <span
                    className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${theme.badgeBg}`}
                  >
                    {category.label}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 truncate max-w-[110px]">
                    {system.name}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <div
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8.5px] font-bold ${theme.badgeBg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                    <span>{theme.shortLabel}</span>
                  </div>

                  {/* Quick Actions 3-dot Menu */}
                  <div className="relative" ref={menuRef}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((prev) => !prev);
                      }}
                      className={`p-1 rounded transition-all cursor-pointer flex items-center justify-center ${
                        menuOpen
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-stone-300 hover:text-white hover:bg-white/10 active:scale-95'
                      }`}
                      title="Workstation Quick Actions"
                      aria-label="Workstation Quick Actions"
                      aria-expanded={menuOpen}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {menuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-7 z-50 w-48 bg-stone-900/98 backdrop-blur-xl border border-stone-700/90 rounded-xl shadow-2xl py-1 text-xs text-stone-200 animate-in fade-in zoom-in-95 duration-100 divide-y divide-stone-800/80 max-h-[220px] overflow-y-auto"
                      >
                        <div className="px-3 py-1 text-[9.5px] font-mono text-stone-400 uppercase tracking-wider font-semibold">
                          {system.id} Actions
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              if (onEditSystem) onEditSystem(system);
                              else setIsEditModalOpen(true);
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center gap-2 text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Edit Workstation</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              onClick();
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center gap-2 text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <Eye className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Inspect Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              if (onQuickAudit) onQuickAudit(system);
                              else onClick();
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center justify-between text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <FileCheck2 className="w-3 h-3 text-blue-400 shrink-0" />
                              <span>{isAuditDue ? 'Run Pending Audit' : 'Run Audit'}</span>
                            </span>
                            {isAuditDue && (
                              <span className="text-[8.5px] font-bold text-blue-300 bg-blue-900/80 px-1 rounded">
                                Due
                              </span>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              if (onReportIssue) onReportIssue(system);
                              else onClick();
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center gap-2 text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <AlertCircle className="w-3 h-3 text-orange-400 shrink-0" />
                            <span>Report Issue</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              if (onPrintQR) onPrintQR(system);
                              else onClick();
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center gap-2 text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <QrCode className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Print QR Code</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              if (onTransferAsset) onTransferAsset(system);
                              else onClick();
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center gap-2 text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <ArrowLeftRight className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>Transfer Asset</span>
                          </button>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(false);
                              setForceFront(true);
                              setIsFlippedManual(false);
                            }}
                            className="w-full text-left px-3 py-1 hover:bg-stone-800 flex items-center gap-2 text-stone-400 hover:text-stone-200 font-medium cursor-pointer transition-colors"
                          >
                            <RotateCw className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>Flip to Front</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hardware Spec Rows (Fits tightly and beautifully) */}
              <div className="mt-1 space-y-0.5 text-[10px] relative z-10">
                <div className="flex items-center justify-between text-stone-300 py-0.5 border-b border-white/5">
                  <span className="flex items-center gap-1 text-stone-400 text-[9.5px]">
                    <Cpu className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span>CPU</span>
                  </span>
                  <span className="font-mono text-stone-200 truncate max-w-[140px]">
                    {system.hardware.processor.replace('Intel Core ', '')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-300 py-0.5 border-b border-white/5">
                  <span className="flex items-center gap-1 text-stone-400 text-[9.5px]">
                    <HardDrive className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                    <span>RAM / Disk</span>
                  </span>
                  <span className="font-mono text-stone-200">
                    {system.hardware.ramGB}GB /{' '}
                    {system.hardware.storageType === 'None' || !system.hardware.storageGB
                      ? 'No SSD'
                      : `${system.hardware.storageGB}GB ${system.hardware.storageType}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-300 py-0.5 border-b border-white/5">
                  <span className="flex items-center gap-1 text-stone-400 text-[9.5px]">
                    <Monitor className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                    <span>OS Build</span>
                  </span>
                  <span className="font-mono text-stone-300 truncate max-w-[140px]">
                    {system.os.name.replace('Windows ', 'Win ')} {system.os.version}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-300 py-0.5 border-b border-white/5">
                  <span className="flex items-center gap-1 text-stone-400 text-[9.5px]">
                    <Network className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                    <span>IPv4 Subnet</span>
                  </span>
                  <span className="font-mono text-amber-300 font-semibold">
                    {system.network.ipAddress}
                  </span>
                </div>
              </div>

              {/* Exam Lockdown Clients Micro-Chips */}
              <div className="mt-1 relative z-10">
                <div className="flex items-center justify-between text-[8.5px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    <span>Exam Clients ({installedExamAppsCount}/5)</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {system.examApps.map((app) => (
                    <span
                      key={app.appId}
                      className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                        app.status === 'installed'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                          : 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                      }`}
                    >
                      {app.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Quick-Action Buttons */}
            <div className="mt-1 pt-1 border-t border-white/10 relative z-10">
              <div className="grid grid-cols-3 gap-1">
                {onQuickAudit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAudit(system);
                    }}
                    className={`px-1 py-0.5 text-[9px] font-bold rounded border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      isAuditDue
                        ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-2xs'
                        : 'bg-blue-950/70 hover:bg-blue-900 text-blue-200 border-blue-700/60'
                    }`}
                    title={isAuditDue ? 'Audit Due - Click to run' : 'Run Audit'}
                  >
                    <FileCheck2 className="w-2.5 h-2.5" />
                    <span>Audit</span>
                  </button>
                )}

                {onReportIssue && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportIssue(system);
                    }}
                    className="px-1 py-0.5 text-[9px] font-bold rounded bg-orange-950/70 hover:bg-orange-900 text-orange-200 border border-orange-700/60 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Report Issue"
                  >
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>Issue</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="px-1 py-0.5 text-[9px] font-bold rounded bg-[#2A2012] hover:bg-[#3D2F1A] text-[#DFB76C] border border-[#523F23] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Open Inspector"
                >
                  <Eye className="w-2.5 h-2.5" />
                  <span>Inspect</span>
                </button>
              </div>

              {/* DEDICATED BOTTOM FLIP-BACK SPACE */}
              <div
                id={`card-bottom-flipback-zone-${system.id}`}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setIsBottomHovered(false);
                  setIsFlippedManual(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBottomHovered(false);
                  setIsFlippedManual(false);
                  setForceFront(true);
                }}
                className={`mt-1 py-0.5 px-2 rounded-md bg-black/60 hover:bg-black/90 border border-dashed ${theme.innerFrameBorder} text-stone-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer select-none group/flip-back shadow-2xs`}
                title="Hover or tap here to flip back to front view"
              >
                <div className="flex items-center gap-1 text-[8.5px]">
                  <RotateCw className="w-2.5 h-2.5 text-stone-400 group-hover/flip-back:text-amber-400 -scale-x-100 transition-transform duration-400 group-hover/flip-back:-rotate-180" />
                  <span>Hover to flip front</span>
                </div>
                <span className="text-[8px] font-mono text-stone-300 group-hover/flip-back:text-white bg-white/10 px-1 py-0.2 rounded border border-white/20">
                  Front ↺
                </span>
              </div>
            </div>
          </div>
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

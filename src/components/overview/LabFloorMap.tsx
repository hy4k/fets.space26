import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Monitor,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Wifi,
  WifiOff,
  Server,
  Zap,
  RotateCw,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Printer,
  Compass,
  Layers,
  Save,
  Undo,
  Sliders,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  ShieldCheck,
  Building,
  Radio,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemRecord, SystemStatus, SystemLayout, FloorZone, Booth } from '../../types';
import { CardFlipModal } from '../systems/CardFlipModal';
import { Modal } from '../ui/Modal';

interface LabFloorMapProps {
  systems?: SystemRecord[];
  onSelectSystem?: (system: SystemRecord) => void;
  onNavigateDetail?: (systemId: string) => void;
}

export const LabFloorMap: React.FC<LabFloorMapProps> = ({
  systems: propSystems,
  onSelectSystem: propOnSelectSystem,
  onNavigateDetail: propOnNavigateDetail
}) => {
  const {
    systems: contextSystems,
    booths,
    capacity,
    isLiveBackendConnected,
    floorLayouts,
    updateSystemLayout,
    saveFloorLayouts,
    resetFloorLayouts,
    issues,
    examApps,
    currentCentre,
    currentUser,
    navigate,
    setSystemStatus
  } = useApp();

  const systems = propSystems || contextSystems;

  // Zoom and Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [examAppFilter, setExamAppFilter] = useState<string>('all');
  const [zoneHighlight, setZoneHighlight] = useState<FloorZone | 'ALL'>('ALL');

  // Ping Sweep State
  const [isPinging, setIsPinging] = useState(false);
  const [pingStep, setPingStep] = useState<number>(0);

  // Interaction State
  const [hoveredSystemId, setHoveredSystemId] = useState<string | null>(null);
  const [selectedSystemForModal, setSelectedSystemForModal] = useState<SystemRecord | null>(null);
  const [selectedOpenSlotBooth, setSelectedOpenSlotBooth] = useState<Booth | null>(null);

  // Admin Edit Mode State
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'it_admin' || currentUser.role === 'technician';
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftLayouts, setDraftLayouts] = useState<Record<string, SystemLayout>>({});
  const [editingSystemId, setEditingSystemId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Quick Action Modals for CardFlipModal integration
  const [auditTargetSystem, setAuditTargetSystem] = useState<SystemRecord | null>(null);
  const [issueTargetSystem, setIssueTargetSystem] = useState<SystemRecord | null>(null);

  // Initialize draft layouts when entering edit mode
  useEffect(() => {
    if (isEditMode) {
      setDraftLayouts({ ...floorLayouts });
      setHasUnsavedChanges(false);
    }
  }, [isEditMode, floorLayouts]);

  // Active layouts to render (draft if editing, otherwise committed)
  const activeLayouts = isEditMode ? draftLayouts : floorLayouts;

  // Workstations 1–40
  const workstationSystems = useMemo(() => {
    return systems
      .filter((s) => s.type === 'workstation' || (!s.type && s.id.startsWith('W')))
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [systems]);

  // Special stations
  const adminSystems = useMemo(() => {
    return systems.filter((s) => s.id === 'ADM-01' || s.id === 'MW01');
  }, [systems]);

  const serverSystems = useMemo(() => {
    return systems.filter((s) => s.id === 'SRV-01');
  }, [systems]);

  // Section divisions for status summaries
  const leftSectionSystems = useMemo(() => {
    return workstationSystems.filter((s) => {
      const num = parseInt(s.id.replace('W', ''), 10);
      return num >= 1 && num <= 15;
    });
  }, [workstationSystems]);

  const centerSectionSystems = useMemo(() => {
    return workstationSystems.filter((s) => {
      const num = parseInt(s.id.replace('W', ''), 10);
      return num >= 16 && num <= 29;
    });
  }, [workstationSystems]);

  const rightSectionSystems = useMemo(() => {
    return workstationSystems.filter((s) => {
      const num = parseInt(s.id.replace('W', ''), 10);
      return num >= 30 && num <= 40;
    });
  }, [workstationSystems]);

  // Physical Open Booth Slots (Booths 37–40: unpopulated physical cubicles, expansion ready, never offline)
  const openSlotBooths = useMemo(() => {
    return (booths || []).filter((b) => b.physicalStatus === 'open_slot');
  }, [booths]);

  // Status & Capacity Counts dynamically derived from AppContext
  const counts = useMemo(() => {
    return {
      totalBooths: capacity?.physicalBooths ?? 40,
      installedSystems: capacity?.installedSystems ?? workstationSystems.length,
      available: capacity?.availableSystems ?? 9,
      busy: capacity?.busySystems ?? 24,
      operational: capacity?.operational ?? 33,
      attention: capacity?.attention ?? 2,
      critical: capacity?.critical ?? 1,
      offline: capacity?.offline ?? 1,
      openSlots: capacity?.openBoothSlots ?? 4
    };
  }, [capacity, workstationSystems.length]);

  // Run Real-Time Ping Sweep across all 40 booths
  const runFloorPingSweep = () => {
    if (isPinging) return;
    setIsPinging(true);
    setPingStep(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setPingStep(current);
      if (current >= 40) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPinging(false);
          setPingStep(0);
        }, 600);
      }
    }, 45);
  };

  // Check if system matches search & filter criteria
  const isSystemHighlighted = (system: SystemRecord) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const num = system.id.replace('W', '');
      const matchesSearch =
        system.id.toLowerCase().includes(q) ||
        system.name.toLowerCase().includes(q) ||
        system.network.ipAddress.includes(q) ||
        num === q;
      if (!matchesSearch) return false;
    }

    // Status filter match (supporting health and occupancy dimensions)
    if (statusFilter !== 'all') {
      if (statusFilter === 'available') {
        if (system.occupancyStatus !== 'available') return false;
      } else if (statusFilter === 'busy' || statusFilter === 'in_exam') {
        if (system.occupancyStatus !== 'busy') return false;
      } else if (statusFilter === 'open_slots') {
        return false; // Installed systems are not open slots
      } else if (system.status !== statusFilter && system.healthStatus !== statusFilter) {
        return false;
      }
    }

    // Exam App filter match
    if (examAppFilter !== 'all') {
      const hasApp = system.examApps.some(
        (a) => a.appId === examAppFilter && a.status === 'installed'
      );
      if (!hasApp) return false;
    }

    // Zone highlight match
    if (zoneHighlight !== 'ALL') {
      const layout = activeLayouts[system.id];
      if (layout && layout.zone !== zoneHighlight) return false;
    }

    return true;
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || examAppFilter !== 'all' || zoneHighlight !== 'ALL';

  // Handle Workstation Click
  const handleWorkstationClick = (system: SystemRecord) => {
    if (isEditMode) {
      setEditingSystemId(system.id);
      return;
    }

    if (propOnSelectSystem) {
      propOnSelectSystem(system);
    }
    setSelectedSystemForModal(system);
  };

  // Dragging support for Admin Floor Map Editor
  const [draggedSystemId, setDraggedSystemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent, systemId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    const layout = activeLayouts[systemId] || { positionX: 100, positionY: 100 };
    setDraggedSystemId(systemId);
    setDragOffset({
      x: e.clientX - layout.positionX,
      y: e.clientY - layout.positionY
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !draggedSystemId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let rawX = (e.clientX - rect.left) / zoomLevel;
    let rawY = (e.clientY - rect.top) / zoomLevel;

    // Constrain to canvas
    let newX = Math.max(20, Math.min(960, rawX));
    let newY = Math.max(20, Math.min(700, rawY));

    if (snapToGrid) {
      newX = Math.round(newX / 10) * 10;
      newY = Math.round(newY / 10) * 10;
    }

    setDraftLayouts((prev) => ({
      ...prev,
      [draggedSystemId]: {
        ...(prev[draggedSystemId] || {
          id: `lay-${draggedSystemId}`,
          systemId: draggedSystemId,
          zone: 'LEFT',
          deskId: 'DESK-L1',
          row: 1,
          col: 1,
          positionX: newX,
          positionY: newY,
          rotation: 0,
          mapVisible: true
        }),
        positionX: newX,
        positionY: newY
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleDragEnd = () => {
    setDraggedSystemId(null);
  };

  // Save changes from editor
  const handleSaveFloorPlan = () => {
    saveFloorLayouts(draftLayouts);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
    setEditingSystemId(null);
  };

  // Reset to default room layout
  const handleResetToDefaults = () => {
    if (window.confirm('Reset workstation positions to default physical 3-zone layout?')) {
      resetFloorLayouts();
      setDraftLayouts({});
      setHasUnsavedChanges(false);
      setIsEditMode(false);
      setEditingSystemId(null);
    }
  };

  // Get Styling for Workstation Status
  const getWorkstationStyles = (status: SystemStatus, highlighted: boolean, isDimmed: boolean) => {
    if (isDimmed) {
      return {
        bg: 'bg-stone-100/70 dark:bg-[#12151E]/60',
        border: 'border-stone-300 dark:border-[#2C2417]',
        text: 'text-stone-400 dark:text-stone-500',
        dot: 'bg-stone-400',
        badge: 'bg-stone-200 dark:bg-stone-800 text-stone-500',
        glow: ''
      };
    }

    switch (status) {
      case 'operational':
        return {
          bg: 'bg-[#ECFDF5] dark:bg-[#0D231A]',
          border: 'border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500',
          text: 'text-emerald-950 dark:text-emerald-200',
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          badge: 'bg-emerald-600 text-white',
          glow: highlighted ? 'ring-2 ring-emerald-500 shadow-md' : 'shadow-2xs'
        };
      case 'attention':
        return {
          bg: 'bg-[#FFFBEB] dark:bg-[#281D0B]',
          border: 'border-amber-400 dark:border-amber-800/80 hover:border-amber-500 ring-1 ring-amber-300',
          text: 'text-amber-950 dark:text-amber-200',
          dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse',
          badge: 'bg-amber-600 text-white',
          glow: highlighted ? 'ring-2 ring-amber-500 shadow-md' : 'shadow-2xs'
        };
      case 'critical':
        return {
          bg: 'bg-[#FEF2F2] dark:bg-[#2A0F15]',
          border: 'border-rose-400 dark:border-rose-800/80 hover:border-rose-600 ring-2 ring-rose-400/80',
          text: 'text-rose-950 dark:text-rose-200',
          dot: 'bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,1)] animate-ping',
          badge: 'bg-rose-600 text-white',
          glow: 'ring-2 ring-rose-500 shadow-lg shadow-rose-200'
        };
      case 'offline':
        return {
          bg: 'bg-[#F1F5F9] dark:bg-[#151722]',
          border: 'border-stone-400 dark:border-stone-700 hover:border-stone-500',
          text: 'text-stone-600 dark:text-stone-400',
          dot: 'bg-stone-400',
          badge: 'bg-stone-500 text-white',
          glow: highlighted ? 'ring-2 ring-stone-400' : 'opacity-90'
        };
      case 'maintenance':
        return {
          bg: 'bg-[#EEF2FF] dark:bg-[#151B2E]',
          border: 'border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500',
          text: 'text-indigo-950 dark:text-indigo-200',
          dot: 'bg-indigo-500',
          badge: 'bg-indigo-600 text-white',
          glow: highlighted ? 'ring-2 ring-indigo-500' : 'shadow-2xs'
        };
      default:
        return {
          bg: 'bg-[#FAF9F6] dark:bg-[#151720]',
          border: 'border-stone-200 dark:border-[#2C2417]',
          text: 'text-stone-800 dark:text-stone-200',
          dot: 'bg-stone-500',
          badge: 'bg-stone-700 text-white',
          glow: ''
        };
    }
  };

  // Render an individual Physical Workstation Desk
  const renderWorkstationDesk = (system: SystemRecord, index: number) => {
    const layout = activeLayouts[system.id] || {
      positionX: 100 + (index % 5) * 120,
      positionY: 150 + Math.floor(index / 5) * 80,
      zone: 'LEFT',
      rotation: 0
    };

    const isMatch = isSystemHighlighted(system);
    const isDimmed = hasActiveFilters && !isMatch;
    const styles = getWorkstationStyles(system.status, isMatch, isDimmed);
    const isHovered = hoveredSystemId === system.id;
    const isEditingThis = isEditMode && editingSystemId === system.id;

    // Ping sweep animation step match
    const isSweepPinging = isPinging && pingStep === index + 1;

    // Number extraction e.g. W014 -> "14"
    const displayNum = system.id.replace('W', '').padStart(2, '0');

    // Issues for this system
    const systemIssues = issues.filter(
      (i) => i.systemId === system.id && (i.status === 'open' || i.status === 'in_progress')
    );

    return (
      <div
        key={system.id}
        id={`workstation-${system.id}`}
        onMouseEnter={() => setHoveredSystemId(system.id)}
        onMouseLeave={() => setHoveredSystemId(null)}
        onClick={() => handleWorkstationClick(system)}
        onMouseDown={(e) => handleDragStart(e, system.id)}
        style={{
          left: `${layout.positionX}px`,
          top: `${layout.positionY}px`,
          transform: `rotate(${layout.rotation || 0}deg)`,
          width: '92px',
          height: '62px'
        }}
        className={`absolute rounded-lg border select-none transition-all duration-150 cursor-pointer ${
          styles.bg
        } ${styles.border} ${styles.glow} ${
          isHovered ? 'scale-105 z-30 shadow-lg -translate-y-0.5' : 'z-10'
        } ${isSweepPinging ? '!bg-sky-200 ring-2 ring-sky-500 !border-sky-500 scale-110 z-40' : ''} ${
          isEditingThis ? 'ring-2 ring-blue-600 shadow-xl z-40' : ''
        } ${isEditMode ? 'cursor-grab active:cursor-grabbing hover:border-blue-500' : ''} ${
          isDimmed ? 'opacity-35 grayscale-[50%]' : 'opacity-100'
        }`}
      >
        {/* Physical Desk Top Edge (Screen / Partition Representation) */}
        <div className="absolute -top-1 left-2 right-2 h-1 bg-slate-300/80 rounded-t-xs" />
        
        {/* Desk Interior Layout */}
        <div className="p-1.5 h-full flex flex-col justify-between">
          {/* Top Row: Station Number & Status Dot */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
              <span className="font-mono font-black text-xs text-slate-900 tracking-tight">
                {displayNum}
              </span>
            </div>

            {/* Status Pill or Issue Badge */}
            {systemIssues.length > 0 ? (
              <span className="flex items-center gap-0.5 px-1 py-0.2 bg-rose-600 text-white rounded text-[8px] font-bold font-mono uppercase animate-pulse">
                {systemIssues.length === 1 ? '1 ISS' : `${systemIssues.length} ISS`}
              </span>
            ) : (
              <span
                className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase ${styles.badge}`}
              >
                {system.status === 'operational'
                  ? 'OK'
                  : system.status === 'attention'
                  ? 'ATTN'
                  : system.status === 'offline'
                  ? 'OFF'
                  : system.status.substring(0, 4)}
              </span>
            )}
          </div>

          {/* Center Graphic: Realistic Monitor & Desk Workstation Name */}
          <div className="flex items-center justify-between gap-1 my-0.5">
            <span className="font-mono font-bold text-[10px] text-slate-700 truncate">
              {system.id}
            </span>
            
            {/* Monitor Silhouette Icon */}
            <div className="w-3.5 h-3 bg-slate-700/80 rounded-[2px] flex items-center justify-center">
              <div className="w-2 h-1.5 bg-sky-200/90 rounded-[1px]" />
            </div>
          </div>

          {/* Bottom Row: IP Suffix & Exam Readiness Mini-Dots */}
          <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 pt-0.5 border-t border-black/5">
            <span>.{system.network.ipAddress.split('.').slice(-1)[0]}</span>
            <div className="flex items-center gap-0.5">
              {system.examApps.slice(0, 3).map((app, i) => (
                <span
                  key={i}
                  className={`w-1 h-1 rounded-full ${
                    app.status === 'installed' ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  title={app.appName}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hover Precision Dossier Tooltip */}
        {isHovered && !isEditMode && (
          <div className="absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 w-64 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl z-50 border border-slate-700 pointer-events-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 text-left">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/80">
              <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>Station {system.id}</span>
                <span className="text-slate-400 text-[10px]">({system.name})</span>
              </div>
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                  system.status === 'operational'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                    : system.status === 'attention'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30'
                    : system.status === 'critical'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {system.status}
              </span>
            </div>

            <div className="text-[10px] space-y-1 text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">IP / Switch:</span>
                <span className="font-semibold text-white">
                  {system.network.ipAddress} ({system.network.switchId}:P{system.network.switchPort})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hardware:</span>
                <span>{system.hardware.ramGB}GB RAM • {system.hardware.storageGB}GB SSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OS Build:</span>
                <span className="truncate max-w-[120px]">{system.os.name} {system.os.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exam Clients:</span>
                <span className="text-emerald-400 font-bold">
                  {system.examApps.filter((a) => a.status === 'installed').length}/5 Verified
                </span>
              </div>

              {systemIssues.length > 0 && (
                <div className="mt-1 pt-1 border-t border-slate-700 text-rose-300 text-[9px] space-y-0.5">
                  <span className="font-bold flex items-center gap-1 text-rose-400">
                    <AlertTriangle className="w-3 h-3" /> Active Issues ({systemIssues.length}):
                  </span>
                  {systemIssues.map((iss) => (
                    <div key={iss.id} className="truncate text-[9px] text-slate-200">
                      • {iss.title}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-center text-emerald-400 font-sans font-semibold flex items-center justify-center gap-1">
              <span>Click to open full workstation card dossier</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Physical Booth Open Slot (Booths 37–40: No PC installed, expansion ready, never offline)
  const renderOpenSlotBooth = (booth: Booth) => {
    const layout = activeLayouts[booth.id] || {
      positionX: 920,
      positionY: 250 + (booth.boothNumber - 37) * 75,
      zone: 'RIGHT' as FloorZone,
      rotation: 0
    };

    const isMatch = statusFilter === 'all' || statusFilter === 'open_slots';
    const isDimmed = statusFilter !== 'all' && statusFilter !== 'open_slots';
    const isHovered = hoveredSystemId === booth.id;

    return (
      <div
        key={booth.id}
        id={`open-slot-booth-${booth.id}`}
        onMouseEnter={() => setHoveredSystemId(booth.id)}
        onMouseLeave={() => setHoveredSystemId(null)}
        onClick={() => setSelectedOpenSlotBooth(booth)}
        style={{
          left: `${layout.positionX}px`,
          top: `${layout.positionY}px`,
          transform: `rotate(${layout.rotation || 0}deg)`,
          width: '92px',
          height: '62px'
        }}
        className={`absolute rounded-lg border-2 border-dashed select-none transition-all duration-150 cursor-pointer bg-amber-50/50 border-amber-400 hover:border-amber-600 hover:bg-amber-100/60 text-left ${
          isHovered ? 'scale-105 z-30 shadow-lg -translate-y-0.5 ring-2 ring-amber-400' : 'z-10'
        } ${isDimmed ? 'opacity-30 grayscale-[50%]' : 'opacity-100'}`}
        title={`Physical Booth ${booth.boothNumber} • OPEN SLOT (No PC Installed) • Click to view specifications`}
      >
        {/* Top desk partition */}
        <div className="absolute -top-1 left-2 right-2 h-1 bg-amber-300/80 rounded-t-xs" />

        <div className="p-1.5 h-full flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-mono font-black text-xs text-amber-950 tracking-tight">
                {booth.boothNumber.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-[7.5px] font-mono px-1 py-0.2 rounded font-bold uppercase bg-amber-200 text-amber-900 border border-amber-300">
              OPEN SLOT
            </span>
          </div>

          <div className="my-0.5">
            <div className="font-mono font-bold text-[9px] text-amber-900 truncate">
              {booth.id} (Booth #{booth.boothNumber})
            </div>
            <div className="text-[8px] text-amber-800 font-sans leading-none mt-0.5">
              Unpopulated Cubicle
            </div>
          </div>

          <div className="flex items-center justify-between text-[7.5px] font-mono text-amber-800/80 pt-0.5 border-t border-amber-200">
            <span>Cat6 Cabled</span>
            <span className="font-semibold text-amber-900">Expansion Ready</span>
          </div>
        </div>
      </div>
    );
  };

  // Render Admin / Server Special Stations
  const renderSpecialStation = (system: SystemRecord, isServer = false) => {
    const layout = activeLayouts[system.id] || {
      positionX: isServer ? 160 : 790,
      positionY: 70,
      zone: isServer ? 'SERVER' : 'ADMIN',
      rotation: 0
    };

    const isHovered = hoveredSystemId === system.id;
    const isEditingThis = isEditMode && editingSystemId === system.id;

    return (
      <div
        key={system.id}
        id={`station-${system.id}`}
        onMouseEnter={() => setHoveredSystemId(system.id)}
        onMouseLeave={() => setHoveredSystemId(null)}
        onClick={() => handleWorkstationClick(system)}
        onMouseDown={(e) => handleDragStart(e, system.id)}
        style={{
          left: `${layout.positionX}px`,
          top: `${layout.positionY}px`,
          width: '100px',
          height: '64px'
        }}
        className={`absolute rounded-lg border p-1.5 select-none transition-all duration-150 cursor-pointer ${
          isServer
            ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-md'
            : 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'
        } ${isHovered ? 'scale-105 z-30 ring-2 ring-indigo-400' : 'z-10'} ${
          isEditingThis ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1">
            {isServer ? (
              <Server className="w-3 h-3 text-sky-400" />
            ) : (
              <ShieldCheck className="w-3 h-3 text-indigo-600" />
            )}
            <span className="font-mono font-bold text-xs">{system.id}</span>
          </div>
          <span
            className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
              isServer ? 'bg-sky-500 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {isServer ? 'NOC' : 'PROCTOR'}
          </span>
        </div>

        <div className="text-[9px] font-semibold truncate">
          {system.name.replace('4960-', '')}
        </div>
        <div className="text-[8px] font-mono text-slate-400 mt-1 flex justify-between">
          <span>.{system.network.ipAddress.split('.').slice(-1)[0]}</span>
          <span>1 Gbps</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* 1. ROOM HUD HEADER & CONTROL BAR */}
      <div className="bg-gradient-to-br from-white via-[#FCFBF8] to-[#FAF8F4] dark:from-[#12151D] dark:via-[#101218] dark:to-[#0B0D12] p-4 rounded-2xl border border-[#D5C7A8] dark:border-[#382E1E] shadow-sm space-y-3 relative overflow-hidden">
        {/* Top gold hairline accent */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Room Title and Subnet Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900 dark:text-[#FAF7F2] tracking-tight flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-700" />
                <span>{currentCentre.name} — Physical Floor Layout</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>40 Workstations Active</span>
              </span>
              {isEditMode && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 animate-pulse">
                  Editor Mode Active
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
              <span>Subnet: 192.168.10.101 – 192.168.10.140</span>
              <span>•</span>
              <span>VLAN 10 Isolated Exam Network</span>
              <span>•</span>
              <span>Switch SW-01 (W001–W024), Switch SW-02 (W025–W040)</span>
            </p>
          </div>

          {/* Right Action Tools: Ping Sweep, Zoom, Edit Layout, Export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Ping Sweep */}
            <button
              onClick={runFloorPingSweep}
              disabled={isPinging}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border ${
                isPinging
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 text-sky-700 dark:text-sky-300'
                  : 'bg-white dark:bg-[#171A24] border-stone-200/90 dark:border-[#2C2417] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#202432] shadow-2xs'
              }`}
              title="Ping sweep all 40 workstations in sequence"
            >
              <Radio className={`w-3.5 h-3.5 text-sky-600 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? `Pinging #${pingStep}/40...` : 'Run Ping Sweep'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-lg border border-stone-200/90 dark:border-[#2C2417] bg-white dark:bg-[#171A24] p-0.5 shadow-2xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
                className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#202432] rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-2 text-stone-600 dark:text-stone-300 min-w-[42px] text-center font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))}
                className="p-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#202432] rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1.0)}
                className="p-1 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-[10px] font-mono hover:bg-stone-100 dark:hover:bg-[#202432] rounded px-1.5 border-l border-stone-200/90 dark:border-[#2C2417] cursor-pointer"
                title="Reset Zoom to 100%"
              >
                100%
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 bg-white dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] hover:bg-stone-50 dark:hover:bg-[#202432] text-stone-700 dark:text-stone-300 rounded-lg shadow-2xs cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Floor Plan'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Admin Edit Mode Toggle */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveFloorPlan}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs cursor-pointer"
                      title="Save new workstation coordinates"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Layout</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditingSystemId(null);
                        setDraftLayouts({});
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-stone-100 dark:bg-[#171A24] hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleResetToDefaults}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                      title="Reset room positions to default layout"
                    >
                      <Undo className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] hover:bg-stone-50 dark:hover:bg-[#202432] text-stone-700 dark:text-stone-300 rounded-lg shadow-2xs cursor-pointer"
                    title="Enable drag and drop workstation layout repositioning"
                  >
                    <Sliders className="w-3.5 h-3.5 text-stone-500" />
                    <span>Edit Floor Plan</span>
                  </button>
                )}
              </div>
            )}

            {/* Export Floor Map */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] hover:bg-stone-50 dark:hover:bg-[#202432] text-stone-700 dark:text-stone-300 rounded-lg shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              <span>Export Floor Plan</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-[#2C2417] text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station (e.g. 14, W014, IP)..."
              className="pl-8 pr-7 py-1.5 text-xs bg-[#FAF9F6] dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] text-stone-900 dark:text-[#FAF7F2] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 w-60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-stone-400 dark:text-stone-500 text-[11px] font-medium mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#0B3B2C] text-white'
                  : 'bg-stone-100 dark:bg-[#171A24] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#202432]'
              }`}
            >
              All Booths ({counts.totalBooths})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'available'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Available ({counts.available})
            </button>
            <button
              onClick={() => setStatusFilter('busy')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'busy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
              }`}
            >
              In Exam ({counts.busy})
            </button>
            <button
              onClick={() => setStatusFilter('open_slots')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'open_slots'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 border border-amber-300 dark:border-amber-700'
              }`}
            >
              Open Slots ({counts.openSlots})
            </button>
          </div>

          {/* Exam Client Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 dark:text-stone-500 text-[11px] font-medium">Exam App:</span>
            <select
              value={examAppFilter}
              onChange={(e) => setExamAppFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-[#FAF9F6] dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium text-stone-800 dark:text-stone-200"
            >
              <option value="all">All Applications</option>
              {examApps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.installedCount}/40)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone Filter Highlights */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-medium">Physical Sections:</span>
            <button
              onClick={() => setZoneHighlight('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                zoneHighlight === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Full Room (40)
            </button>
            <button
              onClick={() => setZoneHighlight('LEFT')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                zoneHighlight === 'LEFT' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Left Bay (01–15)
            </button>
            <button
              onClick={() => setZoneHighlight('CENTER')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                zoneHighlight === 'CENTER' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Centre Island (16–29)
            </button>
            <button
              onClick={() => setZoneHighlight('RIGHT')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                zoneHighlight === 'RIGHT' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Right Bank (30–40)
            </button>
          </div>

          {/* Quick Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setExamAppFilter('all');
                setZoneHighlight('ALL');
              }}
              className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN DIGITAL FLOOR PLAN CANVAS */}
      <div
        ref={containerRef}
        className={`relative overflow-auto rounded-2xl border border-[#D5C7A8] dark:border-[#382E1E] bg-gradient-to-b from-[#F9F5EC] to-[#EDE3D0] dark:from-[#0E1017] dark:to-[#07080B] shadow-inner transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 p-6 bg-slate-950/95 backdrop-blur-md' : ''
        }`}
        style={{ minHeight: isFullscreen ? '100vh' : '790px' }}
      >
        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-slate-800 text-white hover:bg-slate-700 rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Exit Fullscreen</span>
          </button>
        )}

        {/* Scaled Virtual Floor Room Stage */}
        <div
          className="relative mx-auto my-4 transition-transform duration-75 origin-top-left sm:origin-top"
          style={{
            width: '1040px',
            height: '750px',
            transform: `scale(${zoomLevel})`
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleDragEnd}
        >
          {/* Blueprint Grid & Architectural Underlay */}
          <div className="absolute inset-0 bg-white dark:bg-[#0C0E14] border-4 border-[#C5A059]/40 dark:border-[#382E1E] rounded-2xl overflow-hidden shadow-2xl">
            {/* Showroom Center Spotlight Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_60%_at_50%_50%,rgba(197,160,89,0.18),transparent_75%)] pointer-events-none" />
            {/* Room Grid Lines */}
            <div
              className="absolute inset-0 opacity-[0.22] dark:opacity-[0.18] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#C5A059 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Room Compass Rose Indicator (Top Right corner) */}
            <div className="absolute top-3 right-4 flex items-center gap-1.5 text-[10px] font-mono text-slate-400 select-none">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>NORTH FACING</span>
            </div>

            {/* A. SERVER NOC AREA (Top Left) */}
            <div className="absolute top-3 left-6 w-[230px] h-[105px] border-2 border-dashed border-stone-400/80 dark:border-[#2C2417] rounded-xl bg-stone-100/70 dark:bg-[#12151E] p-2 text-left">
              <div className="flex items-center justify-between pb-1 border-b border-stone-300 dark:border-[#2C2417]">
                <span className="text-[10px] font-mono font-bold text-stone-700 dark:text-stone-200 uppercase flex items-center gap-1">
                  <Server className="w-3 h-3 text-stone-600 dark:text-[#C5A059]" />
                  <span>Server & Comms Rack (NOC)</span>
                </span>
                <span className="text-[9px] font-mono text-stone-400">SW-01/02</span>
              </div>
              <div className="mt-1 text-[9px] text-stone-500 dark:text-stone-400 font-mono">
                Gateway: 192.168.10.1 • Core Fiber Uplink
              </div>
            </div>

            {/* Render Server Station SRV-01 */}
            {serverSystems.map((s) => renderSpecialStation(s, true))}

            {/* B. ADMIN & PROCTOR AREA (Top Right) */}
            <div className="absolute top-3 right-6 w-[270px] h-[105px] border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 rounded-xl bg-indigo-50/40 dark:bg-[#131728] p-2 text-left">
              <div className="flex items-center justify-between pb-1 border-b border-indigo-200 dark:border-indigo-900/40">
                <span className="text-[10px] font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-700 dark:text-indigo-400" />
                  <span>Chief Proctor & Reception Desk</span>
                </span>
                <span className="text-[9px] font-mono text-indigo-500 dark:text-indigo-400">TCA / Admin</span>
              </div>
              <div className="mt-1 text-[9px] text-indigo-700 dark:text-indigo-300 font-mono">
                Biometric Registration & Live Proctoring
              </div>
            </div>

            {/* Render Admin Stations ADM-01 & MW01 */}
            {adminSystems.map((s) => renderSpecialStation(s, false))}

            {/* C. LEFT SECTION CONTAINER: Workstations 1–15 */}
            <div
              className={`absolute top-[125px] left-6 w-[250px] h-[585px] rounded-xl border-2 transition-all p-2.5 ${
                zoneHighlight === 'LEFT'
                  ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-400'
                  : 'border-stone-300 dark:border-[#2C2417] bg-stone-50/60 dark:bg-[#0E1118]/80'
              }`}
            >
              {/* Section Header Banner */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-200 dark:border-[#2C2417] text-left">
                <div>
                  <h4 className="text-xs font-black text-stone-900 dark:text-[#FAF7F2] tracking-tight uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Left Section</span>
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                    Workstations 01–15 (15 Booths)
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] rounded text-stone-700 dark:text-stone-300">
                  Switch SW-01
                </span>
              </div>

              {/* Bay Labels Inside Left Section */}
              <div className="absolute top-10 left-3 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Bay L1 (01–05)
              </div>
              <div className="absolute top-[320px] left-3 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Bay L2 (06–10)
              </div>
              <div className="absolute top-[320px] right-3 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Bay L3 (11–15)
              </div>
            </div>

            {/* D. CENTRAL AISLE / WALKWAY A */}
            <div className="absolute top-[140px] left-[285px] w-[95px] h-[560px] flex flex-col items-center justify-center pointer-events-none select-none">
              <div className="h-full w-0.5 border-l-2 border-dashed border-stone-300 dark:border-[#2C2417]" />
              <span className="rotate-90 text-[10px] font-mono tracking-widest text-stone-400 dark:text-stone-500 whitespace-nowrap uppercase py-4">
                Central Walkway & Access Corridor
              </span>
              <div className="h-full w-0.5 border-l-2 border-dashed border-stone-300 dark:border-[#2C2417]" />
            </div>

            {/* E. CENTRE / MIDDLE SECTION CONTAINER: Workstations 16–29 */}
            <div
              className={`absolute top-[125px] left-[390px] w-[265px] h-[585px] rounded-xl border-2 transition-all p-2.5 ${
                zoneHighlight === 'CENTER'
                  ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-400'
                  : 'border-stone-300 dark:border-[#2C2417] bg-stone-50/60 dark:bg-[#0E1118]/80'
              }`}
            >
              {/* Section Header Banner */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-200 dark:border-[#2C2417] text-left">
                <div>
                  <h4 className="text-xs font-black text-stone-900 dark:text-[#FAF7F2] tracking-tight uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Centre Section</span>
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                    Workstations 16–29 (14 Booths)
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] rounded text-stone-700 dark:text-stone-300">
                  Dual Island
                </span>
              </div>

              {/* Physical Central Acoustic Partition Divider */}
              <div className="absolute top-12 bottom-4 left-1/2 -translate-x-1/2 w-1.5 bg-stone-400/70 dark:bg-stone-700 rounded-full shadow-xs pointer-events-none" />

              {/* Sub-row labels */}
              <div className="absolute top-10 left-5 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                West Island (16–22)
              </div>
              <div className="absolute top-10 right-4 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                East Island (23–29)
              </div>
            </div>

            {/* F. RIGHT AISLE / WALKWAY B */}
            <div className="absolute top-[140px] left-[665px] w-[80px] h-[560px] flex flex-col items-center justify-center pointer-events-none select-none">
              <div className="h-full w-0.5 border-l-2 border-dashed border-stone-300 dark:border-[#2C2417]" />
              <span className="rotate-90 text-[10px] font-mono tracking-widest text-stone-400 dark:text-stone-500 whitespace-nowrap uppercase py-4">
                East Aisle Passage
              </span>
              <div className="h-full w-0.5 border-l-2 border-dashed border-stone-300 dark:border-[#2C2417]" />
            </div>

            {/* G. RIGHT SECTION CONTAINER: Workstations 30–40 */}
            <div
              className={`absolute top-[125px] left-[750px] w-[265px] h-[585px] rounded-xl border-2 transition-all p-2.5 ${
                zoneHighlight === 'RIGHT'
                  ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-400'
                  : 'border-stone-300 dark:border-[#2C2417] bg-stone-50/60 dark:bg-[#0E1118]/80'
              }`}
            >
              {/* Section Header Banner */}
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-stone-200 dark:border-[#2C2417] text-left">
                <div>
                  <h4 className="text-xs font-black text-stone-900 dark:text-[#FAF7F2] tracking-tight uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Right Section</span>
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                    Workstations 30–40 (11 Booths)
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white dark:bg-[#171A24] border border-stone-200/90 dark:border-[#2C2417] rounded text-stone-700 dark:text-stone-300">
                  Switch SW-02
                </span>
              </div>

              {/* Sub-row labels */}
              <div className="absolute top-10 left-5 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Bank R1 (30–35)
              </div>
              <div className="absolute top-10 right-4 text-[9px] font-mono font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Bank R2 (36–40)
              </div>
            </div>

            {/* H. PHYSICAL ARCHITECTURAL DOORS & EXITS */}
            {/* Main Candidate Entrance (Bottom Left) */}
            <div className="absolute bottom-1 left-8 flex items-center gap-2 bg-white px-3 py-1 rounded-t-md border-t-2 border-x-2 border-emerald-600 text-emerald-950 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-[10px] font-bold font-mono uppercase">
                Main Candidate Entrance
              </span>
            </div>

            {/* Emergency Exit (Bottom Right) */}
            <div className="absolute bottom-1 right-12 flex items-center gap-1.5 bg-emerald-700 text-white px-2.5 py-0.5 rounded-t-md font-mono text-[9px] font-bold shadow-sm">
              <span>EMERGENCY FIRE EXIT →</span>
            </div>

            {/* I. RENDER ALL 36 INSTALLED WORKSTATION DESKS */}
            {workstationSystems.map((system, index) => renderWorkstationDesk(system, index))}

            {/* J. RENDER 4 PHYSICAL OPEN BOOTH SLOTS (BOOTHS 37–40: OPEN SLOT, NEVER OFFLINE) */}
            {openSlotBooths.map((booth) => renderOpenSlotBooth(booth))}
          </div>
        </div>

        {/* 3. MAP FOOTER METRICS & LEGEND BAR */}
        <div className="p-3 bg-gradient-to-r from-white via-[#FCFBF8] to-white dark:from-[#12151D] dark:via-[#101218] dark:to-[#0B0D12] border-t border-stone-200/90 dark:border-[#2C2417] flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-stone-600 dark:text-stone-300">
          {/* Section Distribution Summary */}
          <div className="flex flex-wrap items-center gap-3 text-stone-600 dark:text-stone-300">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Physical Booth Fleet:</span>
            <span className="font-mono text-stone-900 dark:text-stone-100 font-bold">{counts.totalBooths} Total Positions</span>
            <span>({counts.installedSystems} Installed PCs • {counts.openSlots} Open Slots)</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-emerald-800 dark:text-emerald-400">{counts.available} Available</strong>
            </span>
            <span>•</span>
            <span className="text-blue-700 dark:text-blue-400 font-semibold">{counts.busy} In Examination</span>
            <span>•</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">{counts.attention} Attention</span>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">Available ({counts.available})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">In Exam ({counts.busy})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">Attention ({counts.attention})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span className="text-stone-700 dark:text-stone-300 font-medium">Critical ({counts.critical})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md border border-dashed border-amber-500 bg-amber-100 dark:bg-amber-950/60" />
              <span className="text-amber-800 dark:text-amber-300 font-medium font-mono">Open Slots ({counts.openSlots})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WORKSTATION POKER-CARD FLIP MODAL (Integrated direct click interaction) */}
      <CardFlipModal
        system={selectedSystemForModal}
        allSystems={systems}
        isOpen={Boolean(selectedSystemForModal)}
        onClose={() => setSelectedSystemForModal(null)}
        onSelectSystem={(s) => setSelectedSystemForModal(s)}
        onRunAudit={(s) => {
          setSelectedSystemForModal(null);
          if (propOnNavigateDetail) {
            propOnNavigateDetail(s.id);
          } else {
            navigate('audits');
          }
        }}
        onReportIssue={(s) => {
          setSelectedSystemForModal(null);
          navigate('issues');
        }}
        onPrintQR={(s) => {
          setSelectedSystemForModal(null);
          navigate('systems', s.id);
        }}
      />

      {/* 5. EXPORT FLOOR MAP MODAL */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Testing Centre Floor Plan"
        subtitle={`${currentCentre.name} — Calicut Room 1`}
      >
        <div className="space-y-4 text-xs text-slate-700 text-left">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="font-bold text-slate-900">FETS Space Calicut Floor Plan Specification</div>
            <div>• Workstation count: 40 testing booths + 3 admin/server stations</div>
            <div>• Layout: Left Section (1–15), Centre Island (16–29), Right Bank (30–40)</div>
            <div>• Current Status: 35 Operational, 3 Attention, 1 Critical, 1 Offline</div>
            <div>• Timestamp: {new Date().toLocaleString()}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.print();
                setIsExportModalOpen(false);
              }}
              className="px-4 py-1.5 font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      </Modal>

      {/* 6. PHYSICAL OPEN BOOTH SLOT SPECIFICATION MODAL */}
      <Modal
        isOpen={Boolean(selectedOpenSlotBooth)}
        onClose={() => setSelectedOpenSlotBooth(null)}
        title={`Physical Booth ${selectedOpenSlotBooth?.id || ''} — Open Slot Specification`}
        subtitle="Testing Lab A • 2nd Floor • Candidate Testing Cubicle"
      >
        <div className="space-y-4 text-xs text-slate-700 text-left">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 font-mono text-sm">
                Physical Booth #{selectedOpenSlotBooth?.boothNumber} ({selectedOpenSlotBooth?.id})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold border border-amber-300 uppercase">
                OPEN PHYSICAL SLOT
              </span>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed">
              This physical candidate testing booth exists structurally with acoustic partitions, power drops, and network cabling, but currently has no computer workstation deployed. Per examination centre policy, open slots are <strong>never</strong> counted as offline or failed systems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Physical Location</div>
              <div className="font-semibold text-slate-900 mt-0.5">Right Bank R2 (Booth #{selectedOpenSlotBooth?.boothNumber})</div>
              <div className="text-[10px] text-slate-500">2nd Floor • Testing Lab A</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Network Infrastructure</div>
              <div className="font-semibold text-slate-900 mt-0.5">Switch SW-02: Port {selectedOpenSlotBooth ? selectedOpenSlotBooth.boothNumber - 20 : 17}</div>
              <div className="text-[10px] text-emerald-700">Cat6 Gigabit Certified • VLAN 10</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Electrical Power</div>
              <div className="font-semibold text-slate-900 mt-0.5">Dual 230V 6A Sockets</div>
              <div className="text-[10px] text-slate-500">UPS Circuit 2 (Generator Backed)</div>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Operational Status</div>
              <div className="font-semibold text-amber-800 mt-0.5">Unpopulated Slot</div>
              <div className="text-[10px] text-slate-500 font-sans">Ready for hardware provisioning</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setSelectedOpenSlotBooth(null)}
              className="px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                setSelectedOpenSlotBooth(null);
                navigate('systems');
              }}
              className="px-4 py-1.5 font-semibold bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Provision Workstation to Booth #{selectedOpenSlotBooth?.boothNumber}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

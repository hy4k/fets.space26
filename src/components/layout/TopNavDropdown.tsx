import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Cpu,
  Package,
  ArrowLeftRight,
  Network,
  GraduationCap,
  Table,
  FileSpreadsheet,
  Settings,
  X,
  Search,
  CheckCircle2,
  ChevronRight,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

export const TopNavDropdown: React.FC = () => {
  const {
    activeView,
    navigate,
    isTopNavOpen,
    setTopNavOpen,
    capacity,
    assets,
    examApps,
    currentCentre,
    setSearchOpen
  } = useApp();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isTopNavOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setTopNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTopNavOpen, setTopNavOpen]);

  // Close on outside pointer click
  useEffect(() => {
    if (!isTopNavOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      // If clicking inside the panel or clicking the FS button, let their own handlers manage it
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Check if clicked the toggle button
        const toggleBtn = document.getElementById('fs-nav-toggle-btn');
        if (toggleBtn && toggleBtn.contains(e.target as Node)) {
          return;
        }
        setTopNavOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isTopNavOpen, setTopNavOpen]);

  const handleSelectView = (view: AppView) => {
    navigate(view);
    setTopNavOpen(false);
  };

  // Canonical navigation structure matching enterprise specification
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Overview',
          view: 'overview' as AppView,
          icon: LayoutDashboard,
          badge: null,
          description: 'Live testing operations & health metrics'
        }
      ]
    },
    {
      title: 'SYSTEMS',
      items: [
        {
          label: 'Floor Map',
          view: 'floor-map' as AppView,
          icon: MapPin,
          badge: (capacity?.physicalBooths ?? 40).toString(),
          description: 'Physical lab layout & workstation booths'
        },
        {
          label: 'Workstations',
          view: 'systems' as AppView,
          icon: Cpu,
          badge: (capacity?.installedSystems ?? 36).toString(),
          description: 'Hardware nodes & operating systems'
        }
      ]
    },
    {
      title: 'ASSETS',
      items: [
        {
          label: 'All Assets',
          view: 'assets' as AppView,
          icon: Package,
          badge: assets && assets.length > 0 ? assets.length.toString() : null,
          description: 'Monitors, peripherals & network gear'
        },
        {
          label: 'Asset Movements',
          view: 'asset-movements' as AppView,
          icon: ArrowLeftRight,
          badge: null,
          description: 'Audit logs & hardware transfer chains'
        }
      ]
    },
    {
      title: 'NETWORK',
      items: [
        {
          label: 'IP & Switches',
          view: 'network' as AppView,
          icon: Network,
          badge: 'SW-01/02',
          description: 'Telemetry, VLANs & dual-ISP gateways'
        }
      ]
    },
    {
      title: 'EXAMS',
      items: [
        {
          label: 'Exam Applications',
          view: 'exams' as AppView,
          icon: GraduationCap,
          badge: examApps && examApps.length > 0 ? examApps.length.toString() : '9',
          description: 'Delivery clients, locks & compatibility'
        },
        {
          label: 'Applications Matrix',
          view: 'exam-matrix' as AppView,
          icon: Table,
          badge: 'Grid',
          description: 'Node-by-node app compliance matrix'
        }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        {
          label: 'Operations Reports',
          view: 'reports' as AppView,
          icon: FileSpreadsheet,
          badge: null,
          description: 'Shift logs, incident archives & metrics'
        }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        {
          label: 'Centre & Roles',
          view: 'settings' as AppView,
          icon: Settings,
          badge: null,
          description: 'Campus configuration, gateways & RBAC'
        }
      ]
    }
  ];

  return (
    <>
      {/* Background Overlay Backdrop - does NOT shift content underneath */}
      <div
        id="top-nav-backdrop"
        aria-hidden="true"
        onClick={() => setTopNavOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ease-out ${
          isTopNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Top Dropdown Drawer Panel */}
      <div
        id="top-nav-dropdown-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Application Command Navigation"
        className={`fixed z-50 top-0 left-0 lg:left-20 right-0 max-h-[90vh] overflow-y-auto bg-[#090A0D]/98 dark:bg-[#07080B]/98 text-stone-200 border-b border-[#2C2317] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] transition-all duration-250 ease-out ${
          isTopNavOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        {/* Ambient Top Rim Spotlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#DFB76C]/40 to-transparent pointer-events-none" />

        {/* Header Bar inside Top Navigation Panel */}
        <div className="px-5 sm:px-8 py-4 border-b border-[#201A12] flex items-center justify-between gap-4 bg-[#0D0F14]">
          {/* Left: Branding & Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E5C378] via-[#C5A059] to-[#8C6928] flex items-center justify-center text-[#090A0D] font-black text-xs shadow-md shadow-[#C5A059]/20 tracking-wider border border-[#FAF3E0]/40 shrink-0">
              FS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#FAF7F2] text-sm tracking-wider">
                  FETS SPACE
                </span>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#1C160F] text-[#DFB76C] font-mono font-bold rounded border border-[#523F23]">
                  PRO
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-stone-400 font-medium ml-2 pl-2 border-l border-[#2B2319]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFB76C] shadow-[0_0_6px_#DFB76C]" />
                  {currentCentre?.name || 'Calicut Testing Centre'}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium tracking-tight">
                IT Operations Platform • Command Navigation
              </p>
            </div>
          </div>

          {/* Right: Quick actions & Close Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setTopNavOpen(false);
                setSearchOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14171E] hover:bg-[#1C2029] border border-[#2B2319] hover:border-[#C5A059]/40 text-xs text-stone-300 hover:text-white transition-colors cursor-pointer group"
              title="Global Quick Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#DFB76C] transition-colors" />
              <span>Search</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090A0D] text-stone-400 border border-[#2B2319]">
                ⌘K
              </kbd>
            </button>

            {/* Close Toggle Button */}
            <button
              type="button"
              onClick={() => setTopNavOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14171E] hover:bg-[#1C2029] border border-[#2B2319] hover:border-[#C5A059]/50 text-xs font-semibold text-stone-300 hover:text-white transition-all cursor-pointer group"
              title="Close navigation panel (Esc)"
              aria-label="Close navigation panel"
            >
              <span className="hidden sm:inline text-stone-400 group-hover:text-stone-300">Close</span>
              <span className="hidden sm:inline text-[10px] font-mono px-1 py-0.2 rounded bg-[#090A0D] text-stone-400 border border-[#262017]">
                Esc
              </span>
              <X className="w-4 h-4 text-stone-400 group-hover:text-[#DFB76C] transition-colors" />
            </button>
          </div>
        </div>

        {/* Multi-Column Technical Grid matching user layout */}
        <div className="p-5 sm:p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="flex flex-col space-y-2">
                {/* Section Eyebrow Label */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#201A12]">
                  <span className="text-[10px] font-bold text-[#A89478] tracking-widest uppercase font-mono">
                    {section.title}
                  </span>
                  <span className="text-[10px] text-stone-600 font-mono">
                    0{sIdx + 1}
                  </span>
                </div>

                {/* Section Items */}
                <div className="space-y-1.5 pt-1">
                  {section.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.view;

                    return (
                      <button
                        key={iIdx}
                        type="button"
                        onClick={() => handleSelectView(item.view)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer group relative ${
                          isActive
                            ? 'bg-[#C5A059]/15 border-[#C5A059]/50 text-[#FAF7F2] shadow-xs shadow-[#C5A059]/10 ring-1 ring-[#C5A059]/30'
                            : 'bg-[#12151D]/60 hover:bg-[#161B26] border-[#221C16]/70 hover:border-[#3A3022] text-stone-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Icon container */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                isActive
                                  ? 'bg-gradient-to-br from-[#E5C378] to-[#C5A059] text-[#090A0D] shadow-xs'
                                  : 'bg-[#181C25] text-stone-400 group-hover:text-[#DFB76C] group-hover:bg-[#1E2330] border border-[#262017]'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>

                            {/* Label & Description */}
                            <div className="min-w-0 truncate">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-semibold tracking-tight ${
                                    isActive ? 'text-[#FAF7F2]' : 'text-stone-200 group-hover:text-white'
                                  }`}
                                >
                                  {item.label}
                                </span>
                                {isActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFB76C] animate-pulse" />
                                )}
                              </div>
                              <p className="text-[10px] text-stone-400 group-hover:text-stone-300 truncate font-normal">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Badge pill */}
                          {item.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 transition-colors ${
                                isActive
                                  ? 'bg-[#090A0D] text-[#DFB76C] border border-[#C5A059]/40'
                                  : 'bg-[#14171E] text-stone-300 group-hover:text-[#DFB76C] border border-[#292218] group-hover:border-[#3D301E]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Technical Footer */}
        <div className="px-5 sm:px-8 py-3 bg-[#060709] border-t border-[#201A12] flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium text-stone-300">
              <span className="w-2 h-2 rounded-full bg-[#DFB76C] shadow-[0_0_6px_#DFB76C] animate-pulse" />
              Node Cluster Online
            </span>
            <span className="text-stone-600">•</span>
            <span className="font-mono text-stone-500">v2.4-enterprise</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-stone-500">
            <span>Press <kbd className="px-1 py-0.5 bg-[#12141A] rounded border border-[#2B2319] text-stone-400 font-mono">Esc</kbd> to dismiss</span>
            <span>•</span>
            <span>Selection shifts view instantly</span>
          </div>
        </div>
      </div>
    </>
  );
};

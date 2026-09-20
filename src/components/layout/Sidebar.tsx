import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Package,
  ArrowLeftRight,
  Network,
  GraduationCap,
  CheckCircle2,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Table
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    navigate,
    isSidebarCollapsed,
    setSidebarCollapsed,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    systems,
    capacity,
    assets,
    examApps
  } = useApp();

  const handleNav = (view: AppView, id?: string | null) => {
    navigate(view, id);
    setMobileSidebarOpen(false);
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        {
          label: 'Overview',
          view: 'overview' as AppView,
          icon: LayoutDashboard,
          badge: null
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
          badge: capacity.physicalBooths.toString()
        },
        {
          label: 'Workstations',
          view: 'systems' as AppView,
          icon: Cpu,
          badge: capacity.installedSystems.toString()
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
          badge: assets && assets.length > 0 ? assets.length.toString() : null
        },
        {
          label: 'Asset Movements',
          view: 'asset-movements' as AppView,
          icon: ArrowLeftRight,
          badge: null
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
          badge: 'SW-01/02'
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
          badge: examApps && examApps.length > 0 ? examApps.length.toString() : null
        },
        {
          label: 'Applications Matrix',
          view: 'exam-matrix' as AppView,
          icon: Table,
          badge: 'Grid'
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
          badge: null
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
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="deep-space-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-[#090A0D] text-stone-400 flex flex-col border-r border-[#262017] transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div
          className="h-16 px-4 flex items-center justify-between border-b border-[#262017] shrink-0 bg-[#090A0D]"
        >
          {!isSidebarCollapsed ? (
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => handleNav('overview')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E5C378] via-[#C5A059] to-[#8C6928] flex items-center justify-center text-[#090A0D] font-black text-sm shadow-md shadow-[#C5A059]/20 tracking-wider border border-[#FAF3E0]/40 group-hover:brightness-110 transition-all">
                FS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#FAF7F2] text-sm tracking-wider">FETS SPACE</span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-[#1C160F] text-[#DFB76C] font-mono font-bold rounded border border-[#523F23]">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-medium tracking-tight">IT Operations Platform</p>
              </div>
            </div>
          ) : (
            <div
              className="mx-auto w-9 h-9 rounded-lg bg-gradient-to-br from-[#E5C378] via-[#C5A059] to-[#8C6928] flex items-center justify-center text-[#090A0D] font-black text-sm shadow-md shadow-[#C5A059]/20 cursor-pointer hover:brightness-110 transition-all border border-[#FAF3E0]/40"
              onClick={() => handleNav('overview')}
            >
              FS
            </div>
          )}

          {/* Close for mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex p-1 text-stone-400 hover:text-white hover:bg-[#14171E] rounded-md transition-colors cursor-pointer"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-2 text-[10px] font-bold text-[#8C7D6B] tracking-wider uppercase">
                  {section.title}
                </div>
              )}

              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = activeView === item.view;

                return (
                  <button
                    key={iIdx}
                    onClick={() => handleNav(item.view)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                    } py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#C5A059] via-[#DFB76C] to-[#C5A059] text-[#090A0D] shadow-sm font-bold hover:brightness-105'
                        : 'text-stone-400 hover:text-[#FAF7F2] hover:bg-[#14171E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#090A0D]' : 'text-stone-400 group-hover:text-stone-200'
                        }`}
                      />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                          isActive
                            ? 'bg-[#090A0D]/80 text-[#DFB76C] border border-[#090A0D]/30'
                            : 'bg-[#14171E] text-stone-300 border border-[#2B2319]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        {!isSidebarCollapsed ? (
          <div
            className="p-3 border-t border-[#262017] bg-[#060709] text-[11px] text-stone-400"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#DFB76C] shadow-[0_0_8px_#DFB76C] animate-pulse" />
                <span className="font-semibold text-stone-200">Cluster Online</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500">v2.4-prod</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-stone-500">
              <span>Calicut Testing Centre</span>
              <span className="text-[#DFB76C]/90 font-mono">ONLINE</span>
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-[#262017] text-center bg-[#060709]">
            <span className="w-2 h-2 rounded-full bg-[#DFB76C] shadow-[0_0_8px_#DFB76C] inline-block animate-pulse" />
          </div>
        )}
      </aside>
    </>
  );
};

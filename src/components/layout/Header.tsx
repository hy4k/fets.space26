import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Building2,
  ChevronDown,
  User,
  Shield,
  Check,
  CheckCircle2,
  AlertTriangle,
  Menu,
  FileText,
  Sliders,
  ExternalLink,
  Laptop,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ThemeToggle } from '../ui/ThemeToggle';

export const Header: React.FC = () => {
  const {
    activeView,
    selectedEntityId,
    currentCentre,
    setCurrentCentre,
    allCentres,
    currentUser,
    switchRole,
    availableUsers,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setSearchOpen,
    refreshData,
    setMobileSidebarOpen,
    navigate
  } = useApp();

  const [isCentreMenuOpen, setCentreMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const centreMenuRef = useRef<HTMLDivElement>(null);

  // Close centre menu on outside click or Escape
  useEffect(() => {
    if (!isCentreMenuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (centreMenuRef.current && !centreMenuRef.current.contains(e.target as Node)) {
        setCentreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCentreMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCentreMenuOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Human friendly view titles
  const getBreadcrumbTitle = () => {
    switch (activeView) {
      case 'overview':
        return 'Overview';
      case 'floor-map':
        return 'Lab Floor Map & Physical Layout';
      case 'systems':
        return 'Systems & Workstations';
      case 'system-detail':
        return `System ${selectedEntityId || ''}`;
      case 'assets':
        return 'Hardware & Asset Inventory';
      case 'asset-movements':
        return 'Asset Movement History';
      case 'network':
        return 'Network & Switch Infrastructure';
      case 'exams':
        return 'Exam Delivery Applications';
      case 'exam-detail':
        return `Exam Application: ${selectedEntityId?.toUpperCase() || ''}`;
      case 'exam-matrix':
        return 'Exam Matrix Grid';
      case 'issues':
        return 'Issues & Tickets';
      case 'issue-detail':
        return `Issue ${selectedEntityId || ''}`;
      case 'maintenance':
        return 'Scheduled Maintenance';
      case 'audits':
        return 'Audits & Checklists';
      case 'audit-detail':
        return `Audit Record ${selectedEntityId || ''}`;
      case 'alerts':
        return 'Operational Alerts';
      case 'reports':
        return 'Executive Reports & Compliance';
      case 'settings':
        return 'Centre Settings & Configuration';
      default:
        return 'Dashboard';
    }
  };

  const getRoleDisplayName = (role: UserRole | string) => {
    if (role === 'admin') return 'lazeem';
    if (role === 'it_admin') return 'IT Admin';
    return role.replace('_', ' ');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-[#221A0F] text-[#DFB76C] border-[#523F23]';
      case 'it_admin':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/60';
      case 'technician':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60';
      case 'tca':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800/60';
      case 'manager':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white dark:bg-[#090A0D] border-b border-stone-200/90 dark:border-[#262017] shadow-2xs transition-colors duration-200">
      {/* Left: Mobile Menu Button & Active View Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#121419] rounded-lg transition-colors cursor-pointer"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm sm:text-base font-black text-stone-900 dark:text-[#FAF7F2] tracking-tight font-sans">
            {getBreadcrumbTitle()}
          </h1>
          <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">•</span>

          {/* SINGLE ADVANCED CAMPUS SWITCHER TILE */}
          <div className="relative" ref={centreMenuRef}>
            <button
              type="button"
              onClick={() => setCentreMenuOpen((prev) => !prev)}
              className="group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C5A059]/10 hover:bg-[#C5A059]/20 dark:bg-[#DFB76C]/10 dark:hover:bg-[#DFB76C]/20 text-[#855D18] dark:text-[#DFB76C] border border-[#C5A059]/30 hover:border-[#C5A059]/60 dark:border-[#DFB76C]/30 dark:hover:border-[#DFB76C]/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95 select-none"
              title="Campus Selector • Click to shift between Calicut and Cochin"
              aria-label="Switch Exam Testing Centre"
              aria-expanded={isCentreMenuOpen}
            >
              <span className="w-2 h-2 rounded-full bg-[#C5A059] dark:bg-[#DFB76C] shadow-[0_0_8px_#DFB76C] animate-soft-pulse shrink-0" />
              <span className="font-bold tracking-tight">
                {currentCentre.name.replace(/\s+Centre$/i, '')}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#C5A059] dark:text-[#DFB76C] transition-transform duration-200 ${
                  isCentreMenuOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                }`}
              />
            </button>

            {/* Dropdown Menu directly anchored to the single tile */}
            {isCentreMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#121419] rounded-xl shadow-2xl border border-stone-200 dark:border-[#262017] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 border-b border-stone-100 dark:border-[#262017] flex items-center justify-between text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider">
                  <span>Shift Testing Centre</span>
                  <span className="text-[10px] text-[#C5A059] dark:text-[#DFB76C] font-mono">2 Active Sites</span>
                </div>
                <div className="py-1">
                  {allCentres.map((c) => {
                    const isSelected = c.id === currentCentre.id;
                    const shortName = c.name.replace(/\s+Centre$/i, '');
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCurrentCentre(c);
                          setCentreMenuOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#171A22] transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 dark:bg-[#1C160F] text-amber-950 dark:text-[#DFB76C] font-bold border-l-2 border-[#C5A059]'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border font-bold text-[11px] font-mono ${
                              isSelected
                                ? 'bg-[#C5A059] text-white border-[#C5A059]'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                            }`}
                          >
                            {shortName.substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <span>{shortName}</span>
                              {isSelected && (
                                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-[#C5A059]/15 text-[#855D18] dark:text-[#DFB76C] font-mono font-normal">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 dark:text-stone-400 font-normal mt-0.5">
                              {c.city} • {c.totalWorkstations || 40} Workstations
                            </p>
                          </div>
                        </div>
                        {isSelected ? (
                          <Check className="w-4 h-4 text-[#C5A059] dark:text-[#DFB76C] shrink-0" />
                        ) : (
                          <span className="text-[10px] font-medium text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                            Shift →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Centre Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-[#121419] hover:bg-stone-100/80 dark:hover:bg-[#171A21] border border-stone-200/90 dark:border-[#262017] hover:border-[#C5A059]/60 dark:hover:border-[#C5A059]/60 rounded-lg transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400 group-hover:text-[#C5A059] dark:group-hover:text-[#DFB76C]" />
            <span className="group-hover:text-stone-700 dark:group-hover:text-stone-200">Search systems, assets, IP, MAC, or anything...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-stone-400 dark:text-stone-400 bg-white dark:bg-[#090A0D] border border-stone-200 dark:border-[#262017] rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="md:hidden p-2 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#121419] rounded-lg cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Toggle (Quick Light / Dark Switcher) */}
        <ThemeToggle />

        <button
          onClick={handleRefresh}
          className="p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#121419] rounded-lg transition-colors cursor-pointer"
          title="Refresh Centre Data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5A059] dark:text-[#DFB76C]' : ''}`} />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#121419] rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DFB76C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C5A059]"></span>
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#121419] rounded-xl shadow-2xl border border-stone-200 dark:border-[#262017] py-2 z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100 dark:border-[#262017]">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-[#FAF7F2]">Centre Activity Alerts</h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#221A0F] text-[#DFB76C] rounded-full border border-[#523F23]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-[#C5A059] dark:text-[#DFB76C] hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-[#262017]">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-stone-400">No new notifications</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.link) {
                          if (notif.link.includes('issues')) navigate('issues');
                          else if (notif.link.includes('audits')) navigate('audits');
                          else if (notif.link.includes('assets')) navigate('assets');
                          else if (notif.link.includes('readiness') || notif.link.includes('exams')) navigate('exams');
                        }
                        setNotificationsOpen(false);
                      }}
                      className={`p-3 text-left hover:bg-stone-50 dark:hover:bg-[#171A22] cursor-pointer transition-colors ${
                        !notif.read ? 'bg-amber-50/30 dark:bg-[#1C160F]/60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-stone-900 dark:text-[#FAF7F2]">{notif.title}</p>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">{notif.description}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-stone-100 dark:border-[#262017] bg-stone-50/50 dark:bg-[#0E1015] flex justify-between items-center text-[11px]">
                <button
                  onClick={() => {
                    navigate('alerts');
                    setNotificationsOpen(false);
                  }}
                  className="text-[#C5A059] dark:text-[#DFB76C] font-semibold hover:underline cursor-pointer"
                >
                  View All Alerts Center →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#121419] rounded-lg transition-colors border border-stone-200/80 dark:border-[#262017] cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#DFB76C] to-[#9C7934] text-[#090A0D] font-bold flex items-center justify-center text-[11px] shadow-xs">
              {currentUser.avatar || 'LM'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="font-semibold text-stone-900 dark:text-[#FAF7F2] block leading-tight text-xs">{currentUser.name}</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 capitalize">{getRoleDisplayName(currentUser.role)}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#121419] rounded-xl shadow-2xl border border-stone-200 dark:border-[#262017] py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-stone-100 dark:border-[#262017]">
                <p className="text-xs font-bold text-stone-900 dark:text-[#FAF7F2]">{currentUser.name}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">{currentUser.email}</p>
                <div className="mt-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeColor(currentUser.role)}`}>
                    Active Role: {getRoleDisplayName(currentUser.role)}
                  </span>
                </div>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Switch Operational Persona (RBAC Testing)
              </div>

              <div className="space-y-0.5">
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchRole(u.role);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-stone-50 dark:hover:bg-[#171A22] cursor-pointer ${
                      u.role === currentUser.role
                        ? 'bg-amber-50/50 dark:bg-[#1C160F] text-amber-900 dark:text-[#DFB76C] font-semibold border-l-2 border-[#C5A059]'
                        : 'text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-stone-100 dark:bg-[#1E222B] text-stone-700 dark:text-stone-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        {u.avatar}
                      </span>
                      <div>
                        <span>{u.name}</span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block capitalize">{getRoleDisplayName(u.role)}</span>
                      </div>
                    </div>
                    {u.role === currentUser.role && <Check className="w-3.5 h-3.5 text-[#C5A059] dark:text-[#DFB76C]" />}
                  </button>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-stone-100 dark:border-[#262017] px-3">
                <button
                  onClick={() => {
                    navigate('settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#C5A059] dark:hover:text-[#DFB76C] py-1 flex items-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Platform Settings & Roles</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

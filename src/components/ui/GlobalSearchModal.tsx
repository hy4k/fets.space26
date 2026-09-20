import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Monitor, Package, AlertCircle, FileCheck, Network, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from './StatusBadge';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, systems, assets, issues, examApps, navigate } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Global keyboard shortcut: cmd+k or ctrl+k
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();

    const matchedSystems = systems
      .filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.network.ipAddress.includes(q) ||
          s.network.macAddress.toLowerCase().includes(q) ||
          s.os.version.toLowerCase().includes(q)
      )
      .slice(0, 5);

    const matchedAssets = assets
      .filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.brand.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          (a.assignedSystemName && a.assignedSystemName.toLowerCase().includes(q))
      )
      .slice(0, 5);

    const matchedIssues = issues
      .filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.systemId && i.systemId.toLowerCase().includes(q))
      )
      .slice(0, 4);

    const matchedExams = examApps.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (q.includes('regis') && e.name.toLowerCase().includes('regist'))
    );

    const deliveryExams = matchedExams
      .filter((e) => e.category === 'delivery' || (!e.category && !e.id.startsWith('admin-')))
      .slice(0, 4);

    const adminExams = matchedExams
      .filter((e) => e.category === 'admin_admission' || e.id.startsWith('admin-'))
      .slice(0, 4);

    const totalCount =
      matchedSystems.length + matchedAssets.length + matchedIssues.length + deliveryExams.length + adminExams.length;

    return {
      systems: matchedSystems,
      assets: matchedAssets,
      issues: matchedIssues,
      deliveryExams,
      adminExams,
      totalCount
    };
  }, [query, systems, assets, issues, examApps]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setSearchOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search systems, assets, IP, MAC, exam apps, issues (e.g. W001, 192.168.10, Pearson)..."
            className="w-full px-3 py-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">Global Command Search</p>
              <p>Type a workstation ID (W005), hostname, serial number, IP, or issue keyword to scan the entire testing centre.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['W001', '4960-T005', 'Pearson VUE', '192.168.10.105', 'AST-MON-014', 'SSD'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setQuery(hint)}
                    className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition-colors cursor-pointer"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : results?.totalCount === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              <p className="text-slate-600 dark:text-slate-300 font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1">Try searching by Workstation ID (W001..W040), IP, or Asset category.</p>
            </div>
          ) : (
            <>
              {/* Systems Group */}
              {results && results.systems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Systems & Workstations</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.systems.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          navigate('system-detail', s.id);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/60">
                            {s.id}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                                {s.name}
                              </span>
                              <StatusBadge status={s.status} size="sm" />
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>{s.hardware.ramGB} GB RAM • {s.hardware.storageGB} GB SSD</span>
                              <span>•</span>
                              <span className="font-mono">{s.network.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assets Group */}
              {results && results.assets.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Package className="w-3.5 h-3.5" />
                    <span>Hardware Assets</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.assets.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          navigate('assets', a.id);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-mono font-bold border border-blue-200/60 dark:border-blue-800/60">
                            {a.category.slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">
                                {a.id} — {a.brand} {a.model}
                              </span>
                              <StatusBadge status={a.status} size="sm" />
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>SN: {a.serialNumber}</span>
                              <span>•</span>
                              <span>{a.assignedSystemName || a.assignedLocation}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-700 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues Group */}
              {results && results.issues.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Issues & Tickets</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.issues.map((i) => (
                      <div
                        key={i.id}
                        onClick={() => {
                          navigate('issue-detail', i.id);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">{i.id}</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400">
                              {i.title}
                            </span>
                            <StatusBadge status={i.priority} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{i.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Division 1: Exam Delivery Apps Group */}
              {results && results.deliveryExams.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Division 1: Exam Delivery Applications</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.deliveryExams.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          navigate('exam-detail', e.id);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                              {e.name} ({e.code})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono rounded border border-emerald-200 dark:border-emerald-800">
                              v{e.currentVersion}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{e.vendor} • {e.installedCount}/{e.totalSystems} workstations</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Division 2: Admin & Admission Apps Group */}
              {results && results.adminExams.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Division 2: Admin & Admission Applications</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.adminExams.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          navigate('exam-detail', e.id);
                          setSearchOpen(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 cursor-pointer transition-all group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                              {e.name} ({e.code})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-mono rounded border border-indigo-200 dark:border-indigo-800">
                              v{e.currentVersion}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{e.vendor} • {e.installedCount}/{e.totalSystems} admin consoles</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-slate-700 dark:text-slate-300">↵</kbd> to select</span>
            <span><kbd className="px-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-slate-700 dark:text-slate-300">ESC</kbd> to exit</span>
          </div>
          <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400">FETS SPACE Omni-Search</span>
        </div>
      </div>
    </div>
  );
};

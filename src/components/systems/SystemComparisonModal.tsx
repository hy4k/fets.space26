import React from 'react';
import { X, Check, AlertTriangle, ShieldAlert, WifiOff, Cpu, Layers, HardDrive, CheckCircle2 } from 'lucide-react';
import { SystemRecord } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';

interface SystemComparisonModalProps {
  systems: SystemRecord[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveSystem: (id: string) => void;
  onSelectSystem: (system: SystemRecord) => void;
}

export const SystemComparisonModal: React.FC<SystemComparisonModalProps> = ({
  systems,
  isOpen,
  onClose,
  onRemoveSystem,
  onSelectSystem
}) => {
  if (!isOpen || systems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">System Card Comparison Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparing {systems.length} systems side-by-side against testing lab standards
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table / Columns */}
        <div className="p-6 overflow-x-auto flex-1">
          <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4">
            {systems.map((sys) => {
              const installedAppsCount = sys.examApps.filter((a) => a.status === 'installed').length;
              const totalAppsCount = sys.examApps.length;

              return (
                <div
                  key={sys.id}
                  className="bg-slate-50/70 dark:bg-slate-850/70 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between space-y-4 shadow-2xs relative"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                      <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-sans">{sys.id}</div>
                      <div className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">{sys.name}</div>
                      <div className="mt-1">
                        <StatusBadge status={sys.status} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveSystem(sys.id)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Hardware Specs */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Hardware
                    </span>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">CPU:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate ml-1">{sys.hardware.processor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">RAM:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sys.hardware.ramGB} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Storage:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {sys.hardware.storageGB} GB {sys.hardware.storageType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Monitor:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate ml-1">{sys.hardware.monitorModel.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* OS */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Operating System
                    </span>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">OS:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sys.os.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Build:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{sys.os.build}</span>
                      </div>
                    </div>
                  </div>

                  {/* Exam Apps */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Exam Engines
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                        {installedAppsCount}/{totalAppsCount}
                      </span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750 space-y-1">
                      {sys.examApps.map((app) => (
                        <div key={app.appId} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300">{app.code}</span>
                          <span
                            className={`font-semibold text-[10px] uppercase px-1 rounded ${
                              app.status === 'installed'
                                ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50'
                                : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Issues & Audit */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Open Issues:</span>
                      <span
                        className={`font-bold ${
                          sys.activeIssueCount > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {sys.activeIssueCount}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Audit Status:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sys.lastAuditDate?.includes('Due') ? 'Due' : 'Current'}
                      </span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <button
                    type="button"
                    onClick={() => onSelectSystem(sys)}
                    className="w-full py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Open Card Back
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tip: You can select up to 4 system cards simultaneously for side-by-side analysis.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};

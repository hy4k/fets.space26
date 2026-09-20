import React from 'react';
import {
  Moon,
  FileCheck2,
  AlertCircle,
  ArrowLeftRight,
  Printer,
  X,
  CheckCircle2,
  Clock,
  Shield,
  FileText
} from 'lucide-react';
import { SystemRecord, Centre, AssetMovement, Issue } from '../../types';
import { useApp } from '../../context/AppContext';

interface EndOfDaySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemRecord[];
  centre: Centre;
  movements: AssetMovement[];
  issues: Issue[];
}

export const EndOfDaySummaryModal: React.FC<EndOfDaySummaryModalProps> = ({
  isOpen,
  onClose,
  systems,
  centre,
  movements,
  issues
}) => {
  const { audits } = useApp();

  if (!isOpen) return null;

  const resolvedIssues = issues.filter((i) => i.status === 'resolved');
  const openIssues = issues.filter((i) => i.status !== 'resolved');
  const todayDate = '03 September 2026';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Moon className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">End of Day Operational Log</h3>
                <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-700">
                  Shift Closing
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {centre.name} • Testing Lab A • Date: {todayDate}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">Systems Checked</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{systems.length}</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">100% Verified</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">Issues Resolved</div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{resolvedIssues.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">During today's shifts</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">Audits Completed</div>
              <div className="text-2xl font-black text-blue-800 dark:text-blue-400 mt-1">{audits.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Bi-weekly compliance</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 dark:text-slate-400">Assets Moved</div>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1">{movements.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Custody logged</div>
            </div>
          </div>

          {/* Asset Custody Movements */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Hardware Asset Custody Transfers ({movements.length})</span>
              </h4>
            </div>
            <div className="space-y-2">
              {movements.map((mov) => (
                <div
                  key={mov.id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{mov.assetTag}</span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {mov.fromSystemId || mov.fromLocation} → {mov.toSystemId || mov.toLocation} •{' '}
                      {mov.reason}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{mov.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outstanding Defects Handed Over */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Outstanding Defect Handover ({openIssues.length})</span>
              </h4>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Night maintenance queue</span>
            </div>
            <div className="space-y-2">
              {openIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-rose-950 dark:text-rose-200 font-mono">
                      {issue.systemId}: {issue.title}
                    </span>
                    <div className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">{issue.description}</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                    {issue.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Official PDF Log</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-black dark:hover:bg-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Sign & Close Shift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

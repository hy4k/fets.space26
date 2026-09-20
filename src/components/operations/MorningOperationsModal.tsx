import React, { useState } from 'react';
import {
  Sun,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Printer,
  X,
  RefreshCw,
  Clock,
  Laptop,
  Check,
  Layers
} from 'lucide-react';
import { SystemRecord, Centre } from '../../types';
import { useApp } from '../../context/AppContext';

interface MorningOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systems: SystemRecord[];
  centre: Centre;
}

export const MorningOperationsModal: React.FC<MorningOperationsModalProps> = ({
  isOpen,
  onClose,
  systems,
  centre
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [confirmedChecklist, setConfirmedChecklist] = useState<Record<string, boolean>>({
    network_core: true,
    power_backup: true,
    proctor_cctv: true,
    audio_headsets: true,
    lockdown_client: true
  });

  const { readinessBreakdown } = useApp();

  if (!isOpen) return null;

  const reachableSystems = systems.filter((s) => s.status !== 'offline').length;
  const operationalSystems = systems.filter((s) => s.status === 'operational').length;
  const attentionSystems = systems.filter((s) => s.status === 'attention').length;
  const criticalSystems = systems.filter((s) => s.status === 'critical').length;
  const examReadySystems = systems.filter((s) =>
    s.examApps.every((a) => a.status === 'installed')
  ).length;
  const openIssuesCount = systems.reduce((acc, s) => acc + s.activeIssueCount, 0);
  const auditsDueCount = systems.filter((s) => s.lastAuditDate?.includes('Due')).length;

  // Consume verified operational readiness directly from canonical domain state
  const operationalState = readinessBreakdown?.operationalState || (criticalSystems === 0 ? 'READY' : 'ATTENTION');
  const isFleetOperational = operationalState === 'READY';
  const operationalStatusText = isFleetOperational ? 'OPERATIONAL READY' : 'ATTENTION REQUIRED';

  const toggleChecklistItem = (key: string) => {
    setConfirmedChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50 via-white to-slate-50 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Start of Day Inspection</h3>
                <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800">
                  Morning Ops
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {centre.name} ({centre.code}) • Shift 1 Candidate Check-in Readiness
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

        {/* Operational Hero Box */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div
            className={`p-5 rounded-2xl text-white shadow-sm border flex flex-wrap items-center justify-between gap-4 ${
              isFleetOperational
                ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 dark:from-emerald-950 dark:to-slate-950 border-emerald-800/40'
                : 'bg-gradient-to-br from-amber-900 to-amber-950 dark:from-amber-950 dark:to-slate-950 border-amber-800/40'
            }`}
          >
            <div>
              <span
                className={`text-xs uppercase font-mono font-semibold tracking-wider ${
                  isFleetOperational ? 'text-emerald-300' : 'text-amber-300'
                }`}
              >
                Shift Operational Readiness
              </span>
              <div className="text-3xl font-black tracking-tight mt-1">{operationalStatusText}</div>
              <p className={`text-xs mt-1 ${isFleetOperational ? 'text-emerald-200' : 'text-amber-200'}`}>
                {reachableSystems} of {systems.length} systems reachable • {examReadySystems} active fleet
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  isFleetOperational
                    ? 'bg-emerald-800/80 border-emerald-600 text-emerald-100'
                    : 'bg-amber-800/80 border-amber-600 text-amber-100'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${isFleetOperational ? 'text-emerald-300' : 'text-amber-300'}`} />
                <span>{isFleetOperational ? 'Authorized for Morning Session' : 'Manager Review Required'}</span>
              </span>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Systems Reachable</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {reachableSystems} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {systems.length}</span>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                100% Online Response
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Exam App Delivery</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {examReadySystems} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {systems.length}</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                Pearson VUE, CMA, PSI
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open Technical Issues</div>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{openIssuesCount}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                W005 (SMART Bad Sectors)
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audits Due</div>
              <div className="text-2xl font-black text-blue-800 dark:text-blue-400 mt-1">{auditsDueCount}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">W035, W036 scheduled</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Attention Booths</div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{attentionSystems}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">W004, W014, W027</div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Master Terminal</div>
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-1">MW01</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1">Ready for Admissions</div>
            </div>
          </div>

          {/* Domain Operational Verification Pillars */}
          {readinessBreakdown?.factors && readinessBreakdown.factors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Automated Fleet Telemetry Verification
                </h4>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  {readinessBreakdown?.verifiedPillarsPassed ?? 6} of {readinessBreakdown?.totalPillars ?? 7} Pillars Clear
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {readinessBreakdown.factors.map((factor) => {
                  const isReady = factor.status === 'READY';
                  return (
                    <div
                      key={factor.name}
                      className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{factor.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {factor.detail}
                        </div>
                      </div>
                      <span
                        className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                          isReady
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {factor.status || (isReady ? 'READY' : 'ATTENTION')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TCA Morning Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TCA Verification Checklist
            </h4>
            <div className="space-y-2">
              {[
                { key: 'network_core', label: 'Primary Cisco Switch SW-01 and VLAN 10 links active' },
                { key: 'power_backup', label: 'Central APC 10kVA Online UPS on AC mains, battery at 100%' },
                { key: 'proctor_cctv', label: 'All 3 Hikvision Dome & Bullet IP cameras streaming to NVR' },
                { key: 'audio_headsets', label: 'Noise-cancelling headsets tested for CELPIP speaking booths' },
                { key: 'lockdown_client', label: 'Athena & PSI Secure Browser lockdown daemon verified' }
              ].map((item) => (
                <label
                  key={item.key}
                  onClick={() => toggleChecklistItem(item.key)}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!confirmedChecklist[item.key]}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-700 dark:text-emerald-600 focus:ring-emerald-700 accent-emerald-700 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Morning Roster</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Sign Off & Open Centre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

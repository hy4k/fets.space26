import React, { useState } from 'react';
import {
  X,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Cpu,
  HardDrive,
  Network,
  Wifi,
  FileCheck2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Headphones,
  Camera,
  Keyboard,
  Mouse,
  Check,
  Clock,
  Edit3
} from 'lucide-react';
import { SystemRecord, SystemStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { useApp } from '../../context/AppContext';
import { EditWorkstationModal } from '../systems/EditWorkstationModal';

interface WorkstationInspectorDrawerProps {
  system: SystemRecord | null;
  onClose: () => void;
  onNavigateDetail: (systemId: string) => void;
  onOpenReportIssue: (systemId: string) => void;
}

export const WorkstationInspectorDrawer: React.FC<WorkstationInspectorDrawerProps> = ({
  system,
  onClose,
  onNavigateDetail,
  onOpenReportIssue
}) => {
  const { setSystemStatus } = useApp();
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [auditPassed, setAuditPassed] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!system) return null;

  const handleRunPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setPingLatency(Math.floor(Math.random() * 3) + 1.2);
      setIsPinging(false);
    }, 400);
  };

  const handlePassQuickAudit = () => {
    setAuditPassed(true);
    setTimeout(() => setAuditPassed(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs text-slate-800 dark:text-slate-200">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{system.id}</h3>
                <StatusBadge status={system.status} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {system.name} • {system.centreName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
              title="Edit Workstation"
            >
              <Edit3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Status Alert Banner if not operational */}
          {system.status !== 'operational' && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                system.status === 'critical'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
              }`}
            >
              {system.status === 'critical' ? (
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold">
                  {system.status === 'critical' ? 'Critical Attention Required' : 'Operational Notice'}
                </div>
                <div className="mt-0.5 opacity-90">{system.notes}</div>
              </div>
            </div>
          )}

          {/* Quick Diagnostics Strip */}
          <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">ICMP Latency</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
                {isPinging ? (
                  <span className="text-sky-600 dark:text-sky-400 animate-pulse">Pinging...</span>
                ) : pingLatency ? (
                  <span className="text-emerald-600 dark:text-emerald-400">{pingLatency} ms</span>
                ) : (
                  '1.8 ms'
                )}
              </div>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Link Speed</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
                {system.network.linkSpeed}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-mono uppercase">Switch Port</div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 font-mono">
                {system.network.switchId} #{system.network.switchPort}
              </div>
            </div>
          </div>

          {/* Hardware Specifications */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware & Specifications</span>
            </h4>
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Processor</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{system.hardware.processor}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Memory (RAM)</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.hardware.ramGB} GB DDR4</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Storage</span>
                <div className="text-right">
                  <span className={`font-bold ${system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'No SSD Installed' : `${system.hardware.storageGB} GB ${system.hardware.storageType}`}
                  </span>
                  {(system.hardware.storageType === 'None' || !system.hardware.storageGB) && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Pending 128GB SSD Installation</div>
                  )}
                  {system.status === 'critical' && system.hardware.storageType !== 'None' && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">SMART Degradation Reported</div>
                  )}
                </div>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Monitor Display</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{system.hardware.monitorModel}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Operating System</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">
                  {system.os.name} {system.os.version} ({system.os.build})
                </span>
              </div>
            </div>
          </div>

          {/* Network Infrastructure Telemetry */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" />
              <span>Network Infrastructure</span>
            </h4>
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Static IP Address:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.network.ipAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">MAC Address:</span>
                <span className="text-slate-700 dark:text-slate-300">{system.network.macAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">VLAN / Subnet:</span>
                <span className="text-slate-700 dark:text-slate-300">VLAN {system.network.vlan} (192.168.10.0/24)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Default Gateway:</span>
                <span className="text-slate-700 dark:text-slate-300">{system.network.gateway}</span>
              </div>
            </div>
          </div>

          {/* Exam Applications Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Installed Exam Delivery Clients</span>
            </h4>
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {system.examApps.map((app) => (
                <div key={app.appId} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{app.appName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      Target: v{app.version} • Checked: {app.lastVerified}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      app.status === 'installed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : app.status === 'issue'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 line-through'
                    }`}
                  >
                    {app.status === 'installed'
                      ? 'LOCKDOWN PASS'
                      : app.status === 'issue'
                      ? 'VERSION CHECK'
                      : 'MISSING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRunPing}
              disabled={isPinging}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Wifi className={`w-3.5 h-3.5 ${isPinging ? 'animate-ping' : ''}`} />
              <span>{isPinging ? 'Pinging...' : 'ICMP Ping Sweep'}</span>
            </button>

            <button
              onClick={handlePassQuickAudit}
              disabled={auditPassed}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer ${
                auditPassed
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{auditPassed ? 'Audit Recorded ✓' : 'Pass Shift Audit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenReportIssue(system.id);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/80 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Log Incident Ticket</span>
            </button>

            <button
              onClick={() => {
                onNavigateDetail(system.id);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Full System Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Edit Workstation Configuration</span>
          </button>
        </div>
      </div>

      {/* Edit Workstation Modal */}
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

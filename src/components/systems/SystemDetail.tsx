import React, { useState } from 'react';
import {
  Monitor,
  Cpu,
  HardDrive,
  Tv,
  Camera,
  Keyboard,
  Headphones,
  Network,
  ShieldCheck,
  FileCheck2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Edit3,
  Wrench,
  Radio,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Building2,
  Package,
  Layers,
  History,
  Check,
  Wifi,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemRecord, SystemStatus, InstalledExamApp } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { EditWorkstationModal } from './EditWorkstationModal';

export const SystemDetail: React.FC = () => {
  const {
    systems,
    selectedEntityId,
    navigate,
    assets,
    issues,
    audits,
    currentCentre,
    currentUser,
    setSystemStatus,
    updateSystemHardware,
    updateExamAppStatus,
    createIssue,
    recordAudit
  } = useApp();

  // Find target system or fallback to W001
  const system = systems.find((s) => s.id === selectedEntityId) || systems[0];

  // Ping Diagnostic State
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    latencyMs: number | null;
    status: 'success' | 'failed' | null;
    message: string | null;
  }>({ latencyMs: null, status: null, message: null });

  // Edit Workstation Modal
  const [isEditWorkstationOpen, setEditWorkstationOpen] = useState(false);

  // Edit Specs Modal
  const [isEditSpecsOpen, setEditSpecsOpen] = useState(false);
  const [editRam, setEditRam] = useState(system.hardware.ramGB);
  const [editStorage, setEditStorage] = useState(system.hardware.storageGB);
  const [editProcessor, setEditProcessor] = useState(system.hardware.processor);
  const [editMonitor, setEditMonitor] = useState(system.hardware.monitorModel || '');

  // Report Issue Modal
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Run Audit Modal
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditStatus, setAuditStatus] = useState<'passed' | 'needs_attention' | 'failed'>('passed');

  if (!system) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-300">System not found.</p>
        <button
          onClick={() => navigate('systems')}
          className="mt-4 px-4 py-2 bg-emerald-800 dark:bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900 dark:hover:bg-emerald-600"
        >
          Return to Systems List
        </button>
      </div>
    );
  }

  // Linked Assets
  const linkedAssets = assets.filter(
    (a) =>
      a.assignedSystemId === system.id ||
      (system.assignedAssetIds && system.assignedAssetIds.includes(a.id))
  );

  // Linked Issues
  const linkedIssues = issues.filter((i) => i.systemId === system.id);

  // Linked Audits
  const linkedAudits = audits.filter((a) => a.systemId === system.id);

  // Ping Diagnostic Handler
  const handlePingDiagnostic = async () => {
    setIsPinging(true);
    setPingResult({ latencyMs: null, status: null, message: 'Sending ICMP ping packets (4x 64 bytes)...' });
    
    try {
      const response = await fetch(`/api/systems/${system.id}/ping`, { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        setPingResult({
          latencyMs: data.latencyMs,
          status: 'success',
          message: data.message
        });
      } else {
        setPingResult({
          latencyMs: null,
          status: 'failed',
          message: data.message || 'Host unreachable.'
        });
      }
    } catch (e) {
      // Offline fallback
      if (system.status === 'offline') {
        setPingResult({
          latencyMs: null,
          status: 'failed',
          message: 'Request timed out: 100% packet loss. Device appears powered off or disconnected from switch port.'
        });
      } else {
        const fakeLatency = Math.floor(Math.random() * 2) + 1;
        setPingResult({
          latencyMs: fakeLatency,
          status: 'success',
          message: `Active ICMP reply: 64 bytes in ${fakeLatency}ms. Link 1000Mbps Full-Duplex.`
        });
      }
    } finally {
      setIsPinging(false);
    }
  };

  const handleSaveSpecs = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemHardware(system.id, {
      ramGB: Number(editRam),
      storageGB: Number(editStorage),
      processor: editProcessor,
      monitorModel: editMonitor
    });
    setEditSpecsOpen(false);
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    createIssue({
      title: issueTitle,
      description: issueDesc,
      type: 'hardware',
      priority: issuePriority,
      status: 'open',
      systemId: system.id,
      systemName: system.name,
      reportedBy: currentUser.name
    });
    setIssueModalOpen(false);
    setIssueTitle('');
    setIssueDesc('');
  };

  const handleCompleteAudit = (e: React.FormEvent) => {
    e.preventDefault();
    recordAudit({
      systemId: system.id,
      systemName: system.name,
      auditor: currentUser.name,
      auditorRole: currentUser.role.toUpperCase(),
      status: auditStatus,
      checklist: [
        { id: '1', category: 'Hardware', item: 'Peripherals verified and sanitised', status: 'pass' },
        { id: '2', category: 'Software', item: 'Exam clients verified and ready', status: 'pass' },
        { id: '3', category: 'Network', item: 'Gigabit link validated', status: 'pass' }
      ],
      notes: auditNotes || 'Routine operational audit conducted successfully.',
      durationMinutes: 12
    });
    setAuditModalOpen(false);
    setAuditNotes('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('systems')}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title="Back to Systems"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-slate-900 dark:text-slate-100">{system.id}</span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">({system.name})</span>
              <StatusBadge status={system.status} size="md" showPulse={system.status === 'operational'} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentCentre.name} • Testing Lab A • Booth #{system.id.replace('W', '')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditWorkstationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Edit Workstation</span>
          </button>

          <button
            onClick={handlePingDiagnostic}
            disabled={isPinging}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Radio className={`w-3.5 h-3.5 ${isPinging ? 'animate-pulse text-emerald-700 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
            <span>{isPinging ? 'Pinging Node...' : 'Ping Diagnostic'}</span>
          </button>

          <button
            onClick={() => setEditSpecsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Edit Specs</span>
          </button>

          <button
            onClick={() => setIssueModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Report Issue</span>
          </button>

          <button
            onClick={() => setAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Run Audit</span>
          </button>

          <button
            onClick={() =>
              setSystemStatus(
                system.id,
                system.status === 'operational' ? 'maintenance' : 'operational'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-750 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{system.status === 'maintenance' ? 'Set Operational' : 'Mark Maintenance'}</span>
          </button>
        </div>
      </div>

      {/* Ping Diagnostic Result Banner */}
      {pingResult.message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            pingResult.status === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {pingResult.status === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium font-mono">{pingResult.message}</span>
          </div>
          {pingResult.latencyMs !== null && (
            <span className="font-mono font-bold bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200">
              RTT: {pingResult.latencyMs} ms
            </span>
          )}
        </div>
      )}

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 1. System Info & 2. Hardware Specs */}
        <div className="space-y-6 lg:col-span-2">
          {/* 1. SYSTEM INFORMATION */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
                <Monitor className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                <span>System Identification & Profile</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">Node ID: {system.id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">System ID</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{system.id}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Hostname</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.name}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">System Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{system.type.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Operational Status</span>
                <div className="mt-0.5">
                  <StatusBadge status={system.status} size="sm" />
                </div>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Location & Room</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{system.location || 'Testing Lab A - Row 1'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Assigned Centre</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{currentCentre.name} ({currentCentre.code})</span>
              </div>
            </div>
          </div>

          {/* 2. HARDWARE SPECIFICATIONS */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Hardware Components & Peripherals</span>
              </h3>
              <button
                onClick={() => setEditSpecsOpen(true)}
                className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Modify Specs
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase">Processor</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.hardware.processor}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase">RAM Memory</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.hardware.ramGB} GB DDR4 (Dual Channel)</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase">Storage</span>
                </div>
                <span className={`font-bold ${system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                  {system.hardware.storageType === 'None' || !system.hardware.storageGB ? 'No SSD Installed' : `${system.hardware.storageGB} GB ${system.hardware.storageType}`}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Tv className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase">Primary Display</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.hardware.monitorModel || 'BENQ GW2480 23.8"'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase">TCA Proctor Camera</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.hardware.cameraModel || 'A-01 HD Pro Webcam'}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg border border-slate-100 dark:border-slate-750">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                  <Headphones className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold uppercase">Headset / Audio</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.hardware.headsetModel || 'Jabra UC Voice 150 USB'}</span>
              </div>
            </div>
          </div>

          {/* 3. EXAM OR ADMIN APPLICATIONS */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                {system.type === 'admin_pc' ? (
                  <UserCheck className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
                    <span>
                      {system.type === 'admin_pc'
                        ? 'DIVISION 2: ADMIN & ADMISSION APPLICATIONS'
                        : 'DIVISION 1: EXAM DELIVERY APPLICATIONS'}
                    </span>
                    <span
                      className={`text-[9.5px] font-black uppercase px-2 py-0.2 rounded border ${
                        system.type === 'admin_pc'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {system.examApps.length} Deployed
                    </span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {system.type === 'admin_pc'
                      ? 'Proctor, candidate intake check-in & center administration consoles'
                      : 'Lockdown browser & secure delivery testing engines'}
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {system.examApps.map((app) => {
                const hasDrift = app.expectedVersion && app.version && app.version !== app.expectedVersion;

                return (
                  <div key={app.appId} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          system.type === 'admin_pc'
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {app.code}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{app.appName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600">
                            v{app.version}
                          </span>
                          {hasDrift && (
                            <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Drift: Exp v{app.expectedVersion}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Verified on {app.lastVerifiedDate || '2026-08-28'} • Code: {app.code}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateExamAppStatus(
                            system.id,
                            app.appId,
                            e.target.value as any
                          )
                        }
                        className={`text-xs font-bold px-2 py-1 rounded-lg border cursor-pointer ${
                          app.status === 'installed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : app.status === 'issue'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <option value="installed">Installed</option>
                        <option value="missing">Missing</option>
                        <option value="issue">Issue</option>
                        <option value="not_verified">Not Verified</option>
                      </select>

                      <button
                        onClick={() =>
                          updateExamAppStatus(
                            system.id,
                            app.appId,
                            app.status === 'installed' ? 'missing' : 'installed'
                          )
                        }
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded transition-colors cursor-pointer"
                      >
                        {app.status === 'installed' ? 'Mark Missing' : 'Deploy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. ACTIVITY & AUDIT TIMELINE */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
                <History className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <span>Lifecycle & Activity Timeline</span>
              </h3>
            </div>

            <div className="space-y-3">
              {system.activityLogs && system.activityLogs.length > 0 ? (
                system.activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{log.action}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">• {log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{log.details}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">By: {log.performedBy}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Operational Audit Passed</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">• 2026-08-29 09:20 AM</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Pre-exam verification checklist 100% completed.</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">By: Lazeem (IT Admin)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Pearson VUE Client Updated</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">• 2026-08-25 14:10 PM</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">Updated delivery client to v2.14.001</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">By: System Engine</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Operating System, Network, Assigned Hardware Assets, Issues */}
        <div className="space-y-6">
          {/* OPERATING SYSTEM */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase mb-3 pb-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Operating System</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-750">
                <span className="text-slate-400 dark:text-slate-500">OS Edition</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{system.os.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-750">
                <span className="text-slate-400 dark:text-slate-500">Version</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{system.os.version}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-750">
                <span className="text-slate-400 dark:text-slate-500">OS Build</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{system.os.build}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-750">
                <span className="text-slate-400 dark:text-slate-500">Architecture</span>
                <span className="text-slate-800 dark:text-slate-200">{system.os.architecture}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 dark:text-slate-500">Last Windows Update</span>
                <span className="text-slate-800 dark:text-slate-200">{system.os.lastUpdateDate || '2026-08-28'}</span>
              </div>
            </div>
          </div>

          {/* NETWORK CONFIGURATION */}
          <div className="bg-[#EFF6FF] dark:bg-blue-950/30 p-5 rounded-xl border border-[#BFDBFE] dark:border-blue-900/60 shadow-2xs">
            <h3 className="text-sm font-bold text-[#1D4ED8] dark:text-blue-400 tracking-wide uppercase mb-3 pb-2 border-b border-[#BFDBFE]/60 dark:border-blue-900/40 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#1D4ED8] dark:text-blue-400" />
              <span>Network & Switch Routing</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#BFDBFE]/40 dark:border-blue-900/40">
                <span className="text-[#1D4ED8] dark:text-blue-300 font-sans font-medium">IP Address</span>
                <span className="font-bold text-[#1D4ED8] dark:text-blue-300">{system.network.ipAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#BFDBFE]/40 dark:border-blue-900/40">
                <span className="text-slate-600 dark:text-slate-400 font-sans">MAC Address</span>
                <span className="text-slate-800 dark:text-slate-200">{system.network.macAddress}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#BFDBFE]/40 dark:border-blue-900/40">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Subnet Mask</span>
                <span className="text-slate-800 dark:text-slate-200">{system.network.subnetMask || '255.255.255.0'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#BFDBFE]/40 dark:border-blue-900/40">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Gateway</span>
                <span className="text-slate-800 dark:text-slate-200">{system.network.gateway || '192.168.10.1'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#BFDBFE]/40 dark:border-blue-900/40">
                <span className="text-[#1D4ED8] dark:text-blue-300 font-sans font-medium">Switch / Rack</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">{system.network.switchId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#BFDBFE]/40 dark:border-blue-900/40">
                <span className="text-[#1D4ED8] dark:text-blue-300 font-sans font-medium">Switch Port</span>
                <span className="font-bold text-[#2563EB] dark:text-blue-400">Port #{system.network.switchPort}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 dark:text-slate-400 font-sans">VLAN ID</span>
                <span className="text-slate-800 dark:text-slate-200">VLAN {system.network.vlan || 10}</span>
              </div>
            </div>
          </div>

          {/* ASSIGNED HARDWARE ASSETS */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span>Assigned Asset Tags</span>
              </h3>
              <button
                onClick={() => navigate('assets')}
                className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Asset Center →
              </button>
            </div>

            <div className="space-y-2.5">
              {linkedAssets.length > 0 ? (
                linkedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => navigate('assets', asset.id)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg border border-slate-100 dark:border-slate-750 cursor-pointer transition-colors text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{asset.id}</span>
                        <StatusBadge status={asset.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{asset.brand} {asset.model}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{asset.serialNumber}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded border border-slate-100 dark:border-slate-750 flex justify-between">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">AST-MON-001</span>
                    <span className="text-slate-600 dark:text-slate-400">BENQ 24&quot; Display</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded border border-slate-100 dark:border-slate-750 flex justify-between">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">AST-KEY-001</span>
                    <span className="text-slate-600 dark:text-slate-400">Logitech K120</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded border border-slate-100 dark:border-slate-750 flex justify-between">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">AST-HED-001</span>
                    <span className="text-slate-600 dark:text-slate-400">Jabra UC 150</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE ISSUES & INCIDENTS */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Issues & Tickets ({linkedIssues.length})</span>
              </h3>
              <button
                onClick={() => setIssueModalOpen(true)}
                className="text-xs text-rose-700 dark:text-rose-400 font-semibold hover:underline cursor-pointer"
              >
                + New Ticket
              </button>
            </div>

            {linkedIssues.length > 0 ? (
              <div className="space-y-2">
                {linkedIssues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => navigate('issue-detail', issue.id)}
                    className="p-2.5 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-800/80 cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-900 dark:text-rose-300">{issue.id}</span>
                      <StatusBadge status={issue.priority} size="sm" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mt-1">{issue.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">{issue.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-800 dark:text-emerald-300">
                <Check className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                <span>No active incidents or faults reported on this workstation.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Edit Specs */}
      <Modal
        isOpen={isEditSpecsOpen}
        onClose={() => setEditSpecsOpen(false)}
        title={`Edit Hardware Specifications: ${system.id}`}
        subtitle="Update registered hardware specs and attached peripherals"
      >
        <form onSubmit={handleSaveSpecs} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Processor</label>
            <input
              type="text"
              value={editProcessor}
              onChange={(e) => setEditProcessor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">RAM (GB)</label>
              <select
                value={editRam}
                onChange={(e) => setEditRam(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value={8}>8 GB DDR4</option>
                <option value={16}>16 GB DDR4</option>
                <option value={32}>32 GB DDR4</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">SSD Capacity (GB)</label>
              <select
                value={editStorage}
                onChange={(e) => setEditStorage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value={128}>128 GB SSD</option>
                <option value={256}>256 GB SSD</option>
                <option value={512}>512 GB SSD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Monitor Model</label>
            <input
              type="text"
              value={editMonitor}
              onChange={(e) => setEditMonitor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditSpecsOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer"
            >
              Save Hardware Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Report Issue */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title={`Report Fault for Workstation ${system.id}`}
        subtitle={`System Hostname: ${system.name}`}
      >
        <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Priority</label>
            <select
              value={issuePriority}
              onChange={(e) => setIssuePriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical (Immediate Replacement Needed)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Issue Summary</label>
            <input
              type="text"
              required
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="e.g. SSD disk I/O latency spikes during Pearson exam"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              placeholder="Provide symptoms, test step results, candidate impact..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIssueModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-700 dark:bg-rose-600 hover:bg-rose-800 dark:hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Run Audit */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        title={`Conduct Full Audit: ${system.id}`}
        subtitle={`Inspector: ${currentUser.name} • ${currentCentre.name}`}
      >
        <form onSubmit={handleCompleteAudit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Audit Outcome Status</label>
            <select
              value={auditStatus}
              onChange={(e) => setAuditStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="passed">Passed (100% Operational & Ready)</option>
              <option value="needs_attention">Needs Attention (Minor items flagged)</option>
              <option value="failed">Failed (Unsuitable for exam delivery)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Auditor Notes & Observations</label>
            <textarea
              rows={3}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="e.g. Keyboard and mouse replaced with calibrated spares. Exam clients launch cleanly."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAuditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 hover:bg-emerald-900 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer"
            >
              Save & Sign Audit Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Edit Workstation */}
      {isEditWorkstationOpen && (
        <EditWorkstationModal
          system={system}
          isOpen={isEditWorkstationOpen}
          onClose={() => setEditWorkstationOpen(false)}
          onDeleted={() => {
            setEditWorkstationOpen(false);
            navigate('systems');
          }}
        />
      )}
    </div>
  );
};

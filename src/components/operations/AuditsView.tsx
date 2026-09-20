import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  User,
  Clock,
  Check,
  X,
  FileText,
  SlidersHorizontal,
  Award,
  ShieldCheck,
  Building,
  Printer,
  Calendar,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditRecord, AuditChecklistItem, AuditCertificationSpec } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';

export const AuditsView: React.FC = () => {
  const { audits, auditCertifications, systems, currentCentre, currentUser, recordAudit, navigate } = useApp();

  const [activeTab, setActiveTab] = useState<'workstations' | 'accreditations'>('workstations');
  const [isStartAuditModalOpen, setStartAuditModalOpen] = useState(false);
  const [selectedAuditForInspection, setSelectedAuditForInspection] = useState<AuditRecord | null>(null);
  const [selectedCertForInspection, setSelectedCertForInspection] = useState<AuditCertificationSpec | null>(null);

  // New Audit Wizard Form State
  const [auditTargetSystemId, setAuditTargetSystemId] = useState('W001');
  const [auditNotes, setAuditNotes] = useState('');

  // 6 Step Checklist
  const [checklistItems, setChecklistItems] = useState<{ id: string; category: string; item: string; status: 'pass' | 'fail' | 'na' }[]>([
    { id: '1', category: 'Peripherals', item: 'Keyboard & Optical Mouse sanitized and functioning smoothly', status: 'pass' },
    { id: '2', category: 'Peripherals', item: 'Audio Headset tested (Microphone + Left/Right speaker output)', status: 'pass' },
    { id: '3', category: 'Peripherals', item: 'TCA Proctor Webcam video feed aligned and focused', status: 'pass' },
    { id: '4', category: 'Display', item: 'Primary display resolution 1920x1080 @ 60Hz with privacy shield', status: 'pass' },
    { id: '5', category: 'Exam Engines', item: 'Lockdown clients verified (CMA, Pearson VUE, PSI, CELPIP, ITTS)', status: 'pass' },
    { id: '6', category: 'Operating System', item: 'Windows OS updates verified with no pending reboot prompts', status: 'pass' }
  ]);

  const toggleCheckItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'pass' ? 'fail' : 'pass' }
          : item
      )
    );
  };

  const handleCompleteAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasFail = checklistItems.some((c) => c.status === 'fail');
    const system = systems.find((s) => s.id === auditTargetSystemId);

    recordAudit({
      systemId: auditTargetSystemId,
      systemName: system?.name || auditTargetSystemId,
      auditor: currentUser.name,
      auditorRole: currentUser.role.toUpperCase(),
      status: hasFail ? 'needs_attention' : 'passed',
      checklist: checklistItems as any,
      notes: auditNotes || 'Routine pre-flight workstation audit signed off.',
      durationMinutes: 14
    });

    setStartAuditModalOpen(false);
    setAuditNotes('');
  };

  const passedCount = audits.filter((a) => a.status === 'passed').length;
  const attentionCount = audits.filter((a) => a.status === 'needs_attention').length;
  const failedCount = audits.filter((a) => a.status === 'failed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Workstation Audits & Inspections</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              ISO/IEC Compliance Register
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Conduct daily pre-exam sweeps, sign off on hardware cleanliness, and maintain formal audit records for {currentCentre.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Audit Wizard</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs: Workstations vs Official Accreditations */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('workstations')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'workstations'
              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Workstation Pre-Flight Sweeps</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/70 dark:bg-slate-900/70 border font-mono">
            {audits.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('accreditations')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'accreditations'
              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Official Vendor Accreditations</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/70 dark:bg-slate-900/70 border font-mono">
            {auditCertifications?.length ?? 2}
          </span>
        </button>
      </div>

      {activeTab === 'workstations' ? (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Total Audits Conducted</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{audits.length} Records</div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Documented sign-offs</span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-2xs bg-emerald-50/40 dark:bg-emerald-950/30">
              <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold uppercase">Clean 100% Passes</span>
              <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{passedCount} Audits</div>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Immediate exam clearance</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-2xs bg-amber-50/40 dark:bg-amber-950/30">
              <span className="text-xs text-amber-800 dark:text-amber-400 font-semibold uppercase">Needs Attention</span>
              <div className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-300">{attentionCount} Audits</div>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Remediated on site</span>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800/60 shadow-2xs bg-rose-50/40 dark:bg-rose-950/30">
              <span className="text-xs text-rose-800 dark:text-rose-400 font-semibold uppercase">Failed Inspections</span>
              <div className="mt-1 text-2xl font-black text-rose-700 dark:text-rose-300">{failedCount} Audits</div>
              <span className="text-[11px] text-rose-700/80 dark:text-rose-400/80">Hardware locked out</span>
            </div>
          </div>

          {/* Historical Audit Ledger Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                Audit Ledger & Inspection Records
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Showing all certified inspection logs</span>
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Audit ID</th>
                    <th className="px-4 py-3">Workstation</th>
                    <th className="px-4 py-3">Outcome</th>
                    <th className="px-4 py-3">Auditor / Inspector</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Inspection Date</th>
                    <th className="px-4 py-3 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {audits.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => setSelectedAuditForInspection(a)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{a.id}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 block">{a.systemId}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{a.systemName}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{a.auditor}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{a.auditorRole}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono">{a.durationMinutes} mins</td>
                      <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-[11px]">{a.date}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold">
                          View Certificate →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* VENDOR ACCREDITATION CERTIFICATIONS TAB */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(auditCertifications || []).map((cert) => {
              const passedReqs = cert.requirements.filter((r) => r.passed).length;
              const totalReqs = cert.requirements.length;

              return (
                <div
                  key={cert.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5 flex flex-col justify-between hover:border-amber-400 dark:hover:border-amber-600/70 transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {cert.id}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 uppercase">
                            {cert.status}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 leading-snug">
                          {cert.accreditationTitle}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                          {cert.sponsorName}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cert Number</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                          {cert.certificationNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Inspected</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {cert.inspectionDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valid Until</span>
                        <span className="font-semibold text-emerald-800 dark:text-emerald-400 truncate block">
                          {cert.validUntil}
                        </span>
                      </div>
                    </div>

                    {/* Requirements summary */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Accreditation Standards Verified</span>
                        <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                          {passedReqs} of {totalReqs} Standards Met (100%)
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {cert.requirements.map((req, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-150 dark:border-slate-750 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                                  {req.category}
                                </span>
                              </div>
                              <div className="font-medium text-slate-800 dark:text-slate-200 text-[11px] mt-0.5">
                                {req.description}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                Measured: <span className="font-mono text-slate-700 dark:text-slate-300">{req.measuredValue}</span>
                              </div>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              PASS
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sign-offs */}
                    <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/70 dark:border-amber-800/40 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Lead Inspector:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                          {cert.leadAuditor}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Chief TCA Sign-off:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                          {cert.tcaSignOff}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">Systems Engineer:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate max-w-[200px]">
                          {cert.itAdminSignOff}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCertForInspection(cert)}
                    className="w-full py-2 px-3 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>View Formal Accreditation Certificate</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Start Audit Wizard */}
      <Modal
        isOpen={isStartAuditModalOpen}
        onClose={() => setStartAuditModalOpen(false)}
        title="Interactive Pre-Flight Audit Checklist"
        subtitle={`Inspector: ${currentUser.name} (${currentUser.role.toUpperCase()}) • ${currentCentre.name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleCompleteAuditSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Workstation</label>
            <select
              value={auditTargetSystemId}
              onChange={(e) => setAuditTargetSystemId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
            >
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.name}) — {s.hardware.ramGB}GB RAM | {s.hardware.storageGB}GB SSD
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Step-by-Step Verification Checklist (Click to Toggle Pass/Fail)
            </span>

            {checklistItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheckItem(item.id)}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  item.status === 'pass'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                    item.status === 'pass'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {item.status === 'pass' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 rounded ${
                        item.status === 'pass' ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {item.status === 'pass' ? 'PASSED' : 'FAILED / FLAGGED'}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{item.item}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Auditor Sign-off Notes</label>
            <textarea
              rows={2}
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="e.g. All peripherals checked. Mouse cable securely anchored. Exam clients launch cleanly."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStartAuditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold"
            >
              Sign & Commit Audit Record
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: View Audit Record & Certificate */}
      {selectedAuditForInspection && (
        <Modal
          isOpen={!!selectedAuditForInspection}
          onClose={() => setSelectedAuditForInspection(null)}
          title={`Audit Certificate: ${selectedAuditForInspection.id}`}
          subtitle={`Inspection on ${selectedAuditForInspection.systemId} (${selectedAuditForInspection.systemName})`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] block">AUDITOR</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAuditForInspection.auditor}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{selectedAuditForInspection.auditorRole}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] block">RESULT</span>
                <StatusBadge status={selectedAuditForInspection.status} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] block">TIMESTAMP</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAuditForInspection.date}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Checklist Results
              </span>
              <div className="space-y-1.5">
                {selectedAuditForInspection.checklist.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{c.item}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded border border-emerald-200 dark:border-emerald-700">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Auditor Sign-off Comments
              </span>
              <p className="text-slate-700 dark:text-slate-300">{selectedAuditForInspection.notes}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAuditForInspection(null)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: View Formal Vendor Accreditation Certificate */}
      {selectedCertForInspection && (
        <Modal
          isOpen={!!selectedCertForInspection}
          onClose={() => setSelectedCertForInspection(null)}
          title={`Official Accreditation Certificate: ${selectedCertForInspection.id}`}
          subtitle={`${selectedCertForInspection.sponsorName} • Certificate #${selectedCertForInspection.certificationNumber}`}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Formal Certificate Card */}
            <div className="p-6 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 shadow-md space-y-4">
              <div className="flex items-start justify-between border-b border-amber-200 dark:border-amber-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
                      OFFICIAL CERTIFICATE OF COMPLIANCE
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedCertForInspection.accreditationTitle}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Issued by: {selectedCertForInspection.sponsorName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 uppercase tracking-wider">
                    {selectedCertForInspection.status.toUpperCase()}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                    Valid thru: {selectedCertForInspection.validUntil}
                  </span>
                </div>
              </div>

              {/* Facility & Certification Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Authorized Centre</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {currentCentre.name} ({currentCentre.code})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Registry ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedCertForInspection.certificationNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Inspection Audit</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedCertForInspection.inspectionDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Compliance Standard</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate block">
                    100% Verified (Zero Faults)
                  </span>
                </div>
              </div>

              {/* Formal Requirements Ledger */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Verified Physical & Technical Standards ({selectedCertForInspection.requirements.length} Requirements)
                </span>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-850">
                  {selectedCertForInspection.requirements.map((req, i) => (
                    <div key={i} className="p-3 flex items-start justify-between gap-4">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            {req.category}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                            {req.description}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Standard: <span className="text-slate-600 dark:text-slate-300">{req.standard}</span>
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                          Measured: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{req.measuredValue}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded shrink-0">
                        VERIFIED PASS
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Sign-Off Signatures Block */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Senior Lead QA Auditor</span>
                  <div className="font-serif italic text-sm text-slate-900 dark:text-slate-100 mt-1 font-bold">
                    {selectedCertForInspection.leadAuditor.split('(')[0]}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block">Certified Audit Inspector</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Chief TCA Sign-off</span>
                  <div className="font-serif italic text-sm text-slate-900 dark:text-slate-100 mt-1 font-bold">
                    {selectedCertForInspection.tcaSignOff.split('(')[0]}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block">Test Centre Administrator</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Systems Engineer</span>
                  <div className="font-serif italic text-sm text-slate-900 dark:text-slate-100 mt-1 font-bold">
                    {selectedCertForInspection.itAdminSignOff.split('(')[0]}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block">Infrastructure Specialist</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCertForInspection(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-semibold cursor-pointer transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

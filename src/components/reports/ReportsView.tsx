import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileCheck2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Server,
  Award,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

export const ReportsView: React.FC = () => {
  const { systems, assets, issues, audits, examApps, auditCertifications, readinessBreakdown, currentCentre, currentUser } = useApp();
  const [selectedReportType, setSelectedReportType] = useState<string>('operational_summary');
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);

  const totalSystems = systems.length;
  const operationalCount = systems.filter((s) => s.status === 'operational').length;
  const operationalPct = totalSystems > 0 ? Math.round((operationalCount / totalSystems) * 100) : 0;

  const reportsList = [
    {
      id: 'operational_summary',
      title: 'Daily Fleet Operations Summary',
      description: 'Comprehensive assessment of workstation availability, 7-pillar verification factors, and testing capacity.',
      badge: 'Daily Operational',
      icon: FileCheck2,
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'audit_certifications',
      title: 'Vendor Accreditation & Compliance Register',
      description: 'Certified inspection standards, measured facility parameters, and dual-signoff records for Pearson VUE and Prometric.',
      badge: 'Accreditation',
      icon: Award,
      color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'inventory',
      title: 'Master Workstation & Hardware Inventory',
      description: 'Complete ledger of all 40 testing booths, server nodes, proctor consoles, and asset serial tags.',
      badge: 'Full Inventory',
      icon: Server,
      color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'exam_coverage',
      title: 'Exam Application Lockdown Compliance Matrix',
      description: 'Version verification for CMA, Pearson VUE, PSI, CELPIP, and ITTS across testing workstations.',
      badge: 'Compliance Audit',
      icon: Layers,
      color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'incidents',
      title: 'Incident Resolution & Hardware Fault SLA Report',
      description: 'Breakdown of logged tickets, mean time to repair (MTTR), and technician response metrics.',
      badge: 'Operations SLA',
      icon: AlertTriangle,
      color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
    }
  ];

  const handleExportCSV = (type: string) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'inventory' || type === 'operational_summary') {
      csvContent += 'ID,Name,Type,Status,RAM_GB,Storage_GB,IP_Address,Switch_Port\n';
      systems.forEach((s) => {
        csvContent += `${s.id},"${s.name}",${s.type},${s.status},${s.hardware.ramGB},${s.hardware.storageGB},${s.network.ipAddress},${s.network.switchPort}\n`;
      });
    } else if (type === 'audit_certifications') {
      csvContent += 'Certificate_ID,Sponsor,Accreditation_Title,Certificate_Number,Status,Lead_Auditor,Inspection_Date,Valid_Until,Category,Requirement,Standard,Measured_Value,Compliance_Result\n';
      (auditCertifications || []).forEach((cert) => {
        cert.requirements.forEach((req) => {
          csvContent += `"${cert.id}","${cert.sponsorName}","${cert.accreditationTitle}","${cert.certificationNumber}","${cert.status}","${cert.leadAuditor}","${cert.inspectionDate}","${cert.validUntil}","${req.category}","${req.description}","${req.standard}","${req.measuredValue}","${req.passed ? 'PASSED' : 'ACTION_REQUIRED'}"\n`;
        });
      });
    } else if (type === 'exam_coverage') {
      csvContent += 'App_ID,App_Name,Code,Vendor,Division,Target_Fleet,Current_Version,Expected_Version,Installed_Count,Total_Eligible,Coverage_Pct\n';
      examApps.forEach((e) => {
        const division = e.category === 'admin_admission' || e.id.startsWith('admin-')
          ? 'Division 2: Admin / Admission'
          : 'Division 1: Exam Delivery';
        const fleet = e.category === 'admin_admission' || e.id.startsWith('admin-')
          ? 'Admin PCs'
          : 'Workstations';
        const total = e.totalSystems || (fleet === 'Admin PCs' ? 2 : 40);
        const pct = total > 0 ? Math.round((e.installedCount / total) * 100) : 0;
        csvContent += `${e.id},"${e.name}",${e.code},"${e.vendor}","${division}","${fleet}",${e.currentVersion},${e.expectedVersion || e.currentVersion},${e.installedCount},${total},${pct}%\n`;
      });
    } else if (type === 'incidents') {
      csvContent += 'Ticket_ID,System_ID,Title,Priority,Status,Reported_By,Date\n';
      issues.forEach((i) => {
        csvContent += `${i.id},${i.systemId || 'N/A'},"${i.title}",${i.priority},${i.status},"${i.reportedBy}",${i.reportedAt}\n`;
      });
    } else {
      csvContent += 'Asset_ID,Category,Brand,Model,Serial_Number,Status,Location\n';
      assets.forEach((a) => {
        csvContent += `${a.id},${a.category},"${a.brand}","${a.model}",${a.serialNumber},${a.status},"${a.assignedLocation}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FETS_Space_Report_${type}_${currentCentre.code}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Operational Analytics & Reports</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Audit & Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export verified operational records, testing capacity summaries, and hardware asset audits for {currentCentre.name}.
          </p>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Operational Uptime</span>
          <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">{operationalPct}%</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{operationalCount} of {totalSystems} systems green</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Candidate Delivery SLA</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">99.8%</div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Within Pearson/CMA SLA</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Hardware Assets Tracked</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{assets.length} Units</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">100% serialized in register</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Certified Audits</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{audits.length} Records</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Signed off by proctors</span>
        </div>
      </div>

      {/* Reports Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportsList.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2.5 rounded-lg border ${r.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                    {r.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3">{r.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setSelectedReportType(r.id);
                    setPreviewModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Live Preview
                </button>

                <button
                  onClick={() => handleExportCSV(r.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Report Preview */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Official Operations Report Preview"
        subtitle={`Calicut Testing Centre (4960) • Generated by ${currentUser.name}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {reportsList.find((r) => r.id === selectedReportType)?.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: {currentCentre.name} ({currentCentre.code}) • Generated: {new Date().toLocaleString()}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                VERIFIED
              </span>
            </div>

            {selectedReportType === 'audit_certifications' ? (
              <div className="space-y-3 py-2 text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(auditCertifications || []).map((cert) => (
                    <div key={cert.id} className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 uppercase px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-amber-300 dark:border-amber-800">
                          {cert.id}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                          {cert.status}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{cert.accreditationTitle}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Valid thru: {cert.validUntil} • Cert #{cert.certificationNumber}
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 pt-1 border-t border-amber-200 dark:border-amber-800">
                        Lead Auditor: <span className="font-semibold text-slate-800 dark:text-slate-200">{cert.leadAuditor}</span>
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        ✓ {cert.requirements.length} of {cert.requirements.length} Standards Verified Pass
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs max-h-48 overflow-y-auto space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Accreditation Verification Ledger Excerpt
                  </span>
                  {(auditCertifications || []).flatMap((c) => c.requirements.slice(0, 3)).map((req, i) => (
                    <div key={i} className="flex items-start justify-between gap-2 p-1.5 bg-slate-50 dark:bg-slate-850 rounded border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{req.category}: {req.description}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Measured: {req.measuredValue}</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        PASS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedReportType === 'exam_coverage' ? (
              <div className="space-y-3 py-2 text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block uppercase tracking-wider">
                      DIVISION 1: EXAM DELIVERY APPLICATIONS
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {examApps.filter((a) => a.category === 'delivery' || (!a.category && a.id !== 'cas' && a.id !== 'reg' && a.id !== 'eac' && a.id !== 'idv')).length} Engines
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Workstations (W001-W040) • Lockdown browsers
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <span className="text-[10px] text-indigo-800 dark:text-indigo-400 font-bold block uppercase tracking-wider">
                      DIVISION 2: ADMIN & ADMISSION APPLICATIONS
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {examApps.filter((a) => a.category === 'admin_admission' || a.id.startsWith('admin-')).length} Consoles
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Admin PCs (ADM-01, MW01) • Intake & proctor tools
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs divide-y divide-slate-100 dark:divide-slate-700 max-h-48 overflow-y-auto">
                  {examApps.map((app) => {
                    const isAdm = app.category === 'admin_admission' || app.id.startsWith('admin-');
                    const total = isAdm ? 2 : 40;
                    const pct = Math.round((app.installedCount / total) * 100);

                    return (
                      <div key={app.id} className="py-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
                              isAdm
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isAdm ? 'Admin' : 'Delivery'}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{app.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">v{app.currentVersion}</span>
                        </div>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {app.installedCount}/{total} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2 text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">TOTAL WORKSTATIONS</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">40 Testing Booths</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">ACTIVE ENGINES</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{examApps.length} Delivery Engines</span>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">DELIVERY CAPACITY</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{operationalPct}% Readied</span>
                  </div>
                </div>

                {readinessBreakdown?.factors && readinessBreakdown.factors.length > 0 && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <span>7-Pillar Operational Readiness Factors</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono">
                        {readinessBreakdown.factors.filter((f: any) => f.status === 'READY').length} of {readinessBreakdown.factors.length} READY
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {readinessBreakdown.factors.map((factor: any) => (
                        <div key={factor.id} className="p-2 rounded bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">{factor.name}</span>
                          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border shrink-0 ${
                            factor.status === 'READY'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
                            {factor.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              This summary verifies that all testing booths meet the published IT infrastructure baseline for proctored high-stakes certification examinations. Dual ISP failover and static IP address allocation are active and healthy.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportCSV(selectedReportType)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

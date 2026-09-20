import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';
import { Modal } from './components/ui/Modal';

// Views
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { LabFloorMap } from './components/overview/LabFloorMap';
import { SystemsList } from './components/systems/SystemsList';
import { SystemDetail } from './components/systems/SystemDetail';
import { AssetsView } from './components/assets/AssetsView';
import { AssetMovementsView } from './components/assets/AssetMovementsView';
import { ExamApplicationsView } from './components/exams/ExamApplicationsView';
import { ExamDetailView } from './components/exams/ExamDetailView';
import { ExamMatrixView } from './components/exams/ExamMatrixView';
import { NetworkView } from './components/network/NetworkView';
import { IssuesView } from './components/operations/IssuesView';
import { AuditsView } from './components/operations/AuditsView';
import { MaintenanceView } from './components/operations/MaintenanceView';
import { AlertsView } from './components/operations/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const {
    activeView,
    isSearchOpen,
    setSearchOpen,
    isAddSystemModalOpen,
    setAddSystemModalOpen,
    isReportIssueModalOpen,
    setReportIssueModalOpen,
    isTransferAssetModalOpen,
    setTransferAssetModalOpen,
    isRunAuditModalOpen,
    setRunAuditModalOpen,
    createSystem,
    createIssue,
    transferAsset,
    recordAudit,
    systems,
    assets,
    currentUser,
    currentCentre
  } = useApp();

  // Quick Action Form States
  // 1. Add System Form
  const [newSystemId, setNewSystemId] = useState('');
  const [newSystemName, setNewSystemName] = useState('');
  const [newSystemIp, setNewSystemIp] = useState('');
  const [newSystemRam, setNewSystemRam] = useState(8);
  const [newSystemStorage, setNewSystemStorage] = useState(256);

  // 2. Report Issue Form
  const [issueSystemId, setIssueSystemId] = useState('W001');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState<any>('high');

  // 3. Transfer Asset Form
  const [transferAssetId, setTransferAssetId] = useState('');
  const [transferDest, setTransferDest] = useState('W001');
  const [transferReason, setTransferReason] = useState('Replacement for candidate delivery');

  // 4. Quick Audit Form
  const [auditSystemId, setAuditSystemId] = useState('W001');
  const [auditNote, setAuditNote] = useState('');

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'floor-map':
        return <LabFloorMap />;
      case 'systems':
        return <SystemsList />;
      case 'system-detail':
        return <SystemDetail />;
      case 'assets':
        return <AssetsView />;
      case 'asset-movements':
        return <AssetMovementsView />;
      case 'exams':
        return <ExamApplicationsView />;
      case 'exam-detail':
        return <ExamDetailView />;
      case 'exam-matrix':
        return <ExamMatrixView />;
      case 'network':
        return <NetworkView />;
      case 'issues':
        return <IssuesView />;
      case 'audits':
        return <AuditsView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-stone-100 dark:bg-[#090A0D] text-stone-900 dark:text-[#FAF7F2] overflow-hidden font-sans selection:bg-[#C5A059]/30 selection:text-white">
      {/* Sidebar Navigation - clean and isolated */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#090A0D] transition-colors duration-200 relative z-10">
        {/* Top Header - clean and isolated */}
        <Header />

        {/* Viewport Content - Background theme applied STRICTLY to the interface layout (Not sidebar or header) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#FAF6EE] via-[#F3EDE0] to-[#ECE4D4] dark:from-[#0E1017] dark:via-[#0A0C11] dark:to-[#07080B] transition-colors duration-200 relative">
          {/* Luxury Automotive Studio Ambient Lighting strictly inside interface viewport (inspired by Bentley luxury staging: overhead warm golden studio spotlight, crimson-amber horizon light beam, and bronze floor reflections) */}
          <div className="absolute inset-x-0 top-0 h-[520px] pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(197,160,89,0.18),transparent_75%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(217,160,70,0.18),transparent_75%)] z-0" />
          
          {/* Signature Bentley crimson-amber horizon light beam reflecting across upper interface canvas */}
          <div className="absolute inset-x-0 top-16 h-36 pointer-events-none bg-[linear-gradient(90deg,transparent_0%,rgba(180,30,45,0.07)_20%,rgba(217,145,50,0.14)_50%,rgba(180,30,45,0.07)_80%,transparent_100%)] dark:bg-[linear-gradient(90deg,transparent_0%,rgba(190,30,45,0.16)_20%,rgba(225,160,60,0.22)_50%,rgba(190,30,45,0.16)_80%,transparent_100%)] blur-2xl z-0" />

          {/* Warm Champagne Lateral Reflections */}
          <div className="absolute top-12 right-0 w-[550px] h-[450px] pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(197,160,89,0.12),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(223,183,108,0.12),transparent_65%)] blur-xl z-0" />
          <div className="absolute top-24 left-0 w-[500px] h-[400px] pointer-events-none bg-[radial-gradient(ellipse_at_top_left,rgba(168,131,56,0.10),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(197,160,89,0.10),transparent_65%)] blur-xl z-0" />

          {/* Subtle studio showroom floor grid accent */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(197,160,89,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,160,89,0.035)_1px,transparent_1px)] bg-[size:40px_40px] dark:opacity-60 opacity-35 z-0" />

          <div className="max-w-7xl mx-auto relative z-10">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Search Omni-Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

      {/* QUICK MODAL 1: Add Workstation */}
      <Modal
        isOpen={isAddSystemModalOpen}
        onClose={() => setAddSystemModalOpen(false)}
        title="Provision New Workstation Node"
        subtitle={`Adding testing station to ${currentCentre.name}`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createSystem({
              id: newSystemId || `W${(systems.length + 1).toString().padStart(3, '0')}`,
              name: newSystemName || `Workstation ${(systems.length + 1).toString().padStart(3, '0')}`,
              type: 'workstation',
              status: 'operational',
              assignedRoom: 'Testing Lab A',
              assignedDesk: `Booth ${(systems.length + 1).toString().padStart(3, '0')}`,
              hardware: {
                cpuModel: 'Intel Core i5-11400 (6-Core, 4.4 GHz Turbo)',
                ramGB: Number(newSystemRam),
                storageGB: Number(newSystemStorage),
                storageType: 'NVMe SSD',
                osName: 'Windows 11 Home 64-bit',
                osVersion: '23H2 (Build 22631.3007)',
                biosVersion: 'American Megatrends 2.14'
              },
              network: {
                ipAddress: newSystemIp || `192.168.10.${40 + systems.length + 1}`,
                macAddress: `E4:54:E8:A1:${Math.floor(10 + Math.random() * 89)}:${Math.floor(10 + Math.random() * 89)}`,
                subnetMask: '255.255.255.0',
                gateway: '192.168.10.1',
                dnsServers: ['1.1.1.1', '8.8.8.8'],
                switchPort: `SW-B-P${((systems.length % 24) + 1).toString().padStart(2, '0')}`,
                pingLatencyMs: 2
              },
              peripherals: {
                monitorSerial: `MON-BENQ-${Math.floor(100000 + Math.random() * 900000)}`,
                keyboardModel: 'Logitech K120 USB Keyboard',
                mouseModel: 'Logitech B100 Optical Mouse',
                headsetModel: 'Logitech H390 USB Headset with Noise-Cancelling Mic',
                webcamModel: 'Logitech C920e HD Pro 1080p Proctor Webcam',
                upsProtected: true
              },
              examApps: [
                { appId: '1', code: 'CMA', name: 'CMA US Secure Browser', version: '4.2.1', status: 'installed', lastVerifiedDate: '2026-08-30' },
                { appId: '2', code: 'PVUE', name: 'Pearson VUE Delivery Client', version: '24.8.1', status: 'installed', lastVerifiedDate: '2026-08-30' },
                { appId: '3', code: 'PSI', name: 'PSI Bridge Secure Browser', version: '3.19.0', status: 'installed', lastVerifiedDate: '2026-08-30' },
                { appId: '4', code: 'CELPIP', name: 'CELPIP Secure Exam Engine', version: '5.1.0', status: 'installed', lastVerifiedDate: '2026-08-30' },
                { appId: '5', code: 'ITTS', name: 'ITTS Secure Lockdown Client', version: '1.8.4', status: 'installed', lastVerifiedDate: '2026-08-30' }
              ],
              lastAuditedDate: '2026-08-30',
              maintenanceDue: '2026-09-30'
            });
            setAddSystemModalOpen(false);
            setNewSystemId('');
            setNewSystemName('');
            setNewSystemIp('');
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workstation Tag ID</label>
              <input
                type="text"
                placeholder="e.g. W041"
                value={newSystemId}
                onChange={(e) => setNewSystemId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Hostname</label>
              <input
                type="text"
                placeholder="e.g. Workstation 041"
                value={newSystemName}
                onChange={(e) => setNewSystemName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Static IP Address</label>
              <input
                type="text"
                placeholder="e.g. 192.168.10.81"
                value={newSystemIp}
                onChange={(e) => setNewSystemIp(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">RAM Memory (GB)</label>
              <input
                type="number"
                value={newSystemRam}
                onChange={(e) => setNewSystemRam(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">SSD Storage (GB)</label>
              <input
                type="number"
                value={newSystemStorage}
                onChange={(e) => setNewSystemStorage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 rounded-lg text-[11px] border border-emerald-200 dark:border-emerald-800">
            Node will be automatically provisioned with standard exam delivery lockdown engine matrices.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddSystemModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold"
            >
              Provision Workstation
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 2: Report Incident */}
      <Modal
        isOpen={isReportIssueModalOpen}
        onClose={() => setReportIssueModalOpen(false)}
        title="Report Incident / Hardware Fault"
        subtitle="Log operational disruption for immediate technician response"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createIssue({
              title: issueTitle,
              description: issueDesc,
              type: 'hardware',
              priority: issuePriority,
              status: 'open',
              systemId: issueSystemId,
              systemName: systems.find((s) => s.id === issueSystemId)?.name,
              reportedBy: currentUser.name
            });
            setReportIssueModalOpen(false);
            setIssueTitle('');
            setIssueDesc('');
          }}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affected Workstation</label>
              <select
                value={issueSystemId}
                onChange={(e) => setIssueSystemId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              >
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={issuePriority}
                onChange={(e) => setIssuePriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-rose-700 dark:text-rose-400 font-bold"
              >
                <option value="critical">Critical (Candidate Blocked)</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Incident Summary</label>
            <input
              type="text"
              required
              placeholder="e.g. Display backlight flickering during session"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              required
              placeholder="Describe symptoms, error codes, and troubleshooting performed..."
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportIssueModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-lg font-semibold"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 3: Transfer Asset */}
      <Modal
        isOpen={isTransferAssetModalOpen}
        onClose={() => setTransferAssetModalOpen(false)}
        title="Quick Hardware Asset Transfer"
        subtitle="Log equipment swap or store room checkout"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (transferAssetId) {
              transferAsset(
                transferAssetId,
                transferDest,
                `Testing Lab A - Booth ${transferDest}`,
                transferReason
              );
              setTransferAssetModalOpen(false);
            }
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Hardware Asset</label>
            <select
              value={transferAssetId}
              onChange={(e) => setTransferAssetId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-medium text-slate-900 dark:text-white"
            >
              <option value="">-- Choose Asset from Inventory --</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id}: {a.brand} {a.model} ({a.category}) — {a.assignedSystemId || a.assignedLocation}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transfer Destination</label>
              <select
                value={transferDest}
                onChange={(e) => setTransferDest(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
              >
                <option value="STORE_ROOM">Store Room Reserve</option>
                {systems.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} ({s.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Technician</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transfer Reason / Audit Note</label>
            <input
              type="text"
              required
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="e.g. Swapped monitor on booth W012 for candidate delivery"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTransferAssetModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg font-semibold"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK MODAL 4: Quick Audit */}
      <Modal
        isOpen={isRunAuditModalOpen}
        onClose={() => setRunAuditModalOpen(false)}
        title="Quick Pre-Flight Workstation Audit"
        subtitle={`Inspector: ${currentUser.name} (${currentUser.role.toUpperCase()})`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const system = systems.find((s) => s.id === auditSystemId);
            recordAudit({
              systemId: auditSystemId,
              systemName: system?.name || auditSystemId,
              auditor: currentUser.name,
              auditorRole: currentUser.role.toUpperCase(),
              status: 'passed',
              checklist: [
                { id: '1', category: 'Peripherals', item: 'Keyboard & Optical Mouse sanitized', status: 'pass' },
                { id: '2', category: 'Peripherals', item: 'Audio Headset tested and clear', status: 'pass' },
                { id: '3', category: 'Peripherals', item: 'Proctor Webcam focused and online', status: 'pass' },
                { id: '4', category: 'Display', item: '1080p Display and Privacy Shield verified', status: 'pass' },
                { id: '5', category: 'Exam Engines', item: 'Lockdown clients launch verified', status: 'pass' }
              ],
              notes: auditNote || 'Pre-flight quick audit certified.',
              durationMinutes: 10
            });
            setRunAuditModalOpen(false);
            setAuditNote('');
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Workstation</label>
            <select
              value={auditSystemId}
              onChange={(e) => setAuditSystemId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
            >
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1 text-slate-700 dark:text-slate-300">
            <p className="font-semibold">Quick Verification Standards:</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">• Peripherals sanitized & plugged into rear USB 3.0 ports</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">• Headset microphone and stereo output functional</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">• Pearson VUE / CMA US lockdown engines clean launch</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Inspector Sign-off Note</label>
            <input
              type="text"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              placeholder="e.g. All checks passed. Ready for candidate seating."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRunAuditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold"
            >
              Certify & Sign Off
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Shield,
  Layers,
  Network,
  Database,
  Users,
  Download,
  Upload,
  RotateCcw,
  Check,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, NetworkMonitoringSourceType } from '../../types';
import { useNetworkSpeed } from '../../hooks/useNetworkSpeed';
import { ThemeToggle } from '../ui/ThemeToggle';

export const SettingsView: React.FC = () => {
  const { currentCentre, currentUser, setCurrentCentre, exportStateJson, importStateJson, resetStateToDefault } = useApp();

  const [activeTab, setActiveTab] = useState<'centre' | 'backup' | 'rbac' | 'network'>('centre');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Network Monitoring hook
  const {
    networkData,
    isLoading: isNetLoading,
    timeAgoText: netTimeAgo,
    updateConfig: updateNetConfig,
    simulateState: simulateNetState,
    refresh: refreshNet
  } = useNetworkSpeed();

  const [netSource, setNetSource] = useState<NetworkMonitoringSourceType>(
    networkData?.monitoringSource || 'Admin Server'
  );
  const [netInterface, setNetInterface] = useState<string>(
    networkData?.interface || 'Ethernet (eth1)'
  );
  const [netSaveSuccess, setNetSaveSuccess] = useState(false);

  // Keep local form in sync with loaded data
  React.useEffect(() => {
    if (networkData) {
      setNetSource(networkData.monitoringSource);
      setNetInterface(networkData.interface);
    }
  }, [networkData?.monitoringSource, networkData?.interface]);

  const handleSaveNetworkConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateNetConfig({
      monitoringSource: netSource,
      interfaceName: netInterface
    });
    if (ok) {
      setNetSaveSuccess(true);
      setTimeout(() => setNetSaveSuccess(false), 2500);
    }
  };

  // Form State
  const [centreName, setCentreName] = useState(currentCentre.name);
  const [centreCode, setCentreCode] = useState(currentCentre.code);
  const [centreLocation, setCentreLocation] = useState(currentCentre.location || '');
  const [centreCapacity, setCentreCapacity] = useState(currentCentre.totalWorkstations);
  const [primaryIsp, setPrimaryIsp] = useState(currentCentre.primaryIsp || 'JIO Forun');
  const [primaryIspPlan, setPrimaryIspPlan] = useState(currentCentre.primaryIspPlan || '1 Gbps Plan');
  const [primaryIspSpeed, setPrimaryIspSpeed] = useState(currentCentre.primaryIspSpeed || '1 Gbps');
  const [primaryIspIp, setPrimaryIspIp] = useState(currentCentre.primaryIspIp || '103.141.22.45');
  const [secondaryIsp, setSecondaryIsp] = useState(currentCentre.secondaryIsp || 'Airtel Business Fiber');
  const [secondaryIspIp, setSecondaryIspIp] = useState(currentCentre.secondaryIspIp || '122.179.48.112');
  const [secondaryGatewayIp, setSecondaryGatewayIp] = useState(currentCentre.secondaryGatewayIp || '192.168.20.1');
  const [gatewayIp, setGatewayIp] = useState(currentCentre.gatewayIp || '192.168.10.1');

  // Keep in sync if currentCentre changes
  React.useEffect(() => {
    setCentreName(currentCentre.name);
    setCentreCode(currentCentre.code);
    setCentreLocation(currentCentre.location || '');
    setCentreCapacity(currentCentre.totalWorkstations);
    setPrimaryIsp(currentCentre.primaryIsp || 'JIO Forun');
    setPrimaryIspPlan(currentCentre.primaryIspPlan || '1 Gbps Plan');
    setPrimaryIspSpeed(currentCentre.primaryIspSpeed || '1 Gbps');
    setPrimaryIspIp(currentCentre.primaryIspIp || '103.141.22.45');
    setSecondaryIsp(currentCentre.secondaryIsp || 'Airtel Business Fiber');
    setSecondaryIspIp(currentCentre.secondaryIspIp || '122.179.48.112');
    setSecondaryGatewayIp(currentCentre.secondaryGatewayIp || '192.168.20.1');
    setGatewayIp(currentCentre.gatewayIp || '192.168.10.1');
  }, [currentCentre.id, currentCentre.code, currentCentre.name]);

  const handleSaveCentre = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentCentre({
      ...currentCentre,
      name: centreName,
      code: centreCode,
      location: centreLocation,
      totalWorkstations: Number(centreCapacity),
      primaryIsp,
      primaryIspPlan,
      primaryIspSpeed,
      primaryIspIp,
      secondaryIsp,
      secondaryIspIp,
      secondaryGatewayIp,
      gatewayIp
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importStateJson(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Platform Settings & Centre Profile</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
              Centre Code: {currentCentre.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure testing venue metadata, network gateway routing, backup state snapshots, and role policies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Theme:</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('centre')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'centre'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Testing Facility Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'backup'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>State Snapshots & Backups</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rbac'
              ? 'border-emerald-800 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Access Roles (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'network'
              ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
        >
          <Network className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Network Monitoring</span>
        </button>
      </div>

      {/* TAB 1: Centre Profile */}
      {activeTab === 'centre' && (
        <form onSubmit={handleSaveCentre} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Testing Centre Configuration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official registry details for candidate admission and Pearson/CMA affiliation.</p>
            </div>

            {saveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                <span>Saved successfully</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Centre Name</label>
              <input
                type="text"
                required
                value={centreName}
                onChange={(e) => setCentreName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Affiliation Code</label>
              <input
                type="text"
                required
                value={centreCode}
                onChange={(e) => setCentreCode(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold uppercase text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Location / Campus</label>
              <input
                type="text"
                required
                value={centreLocation}
                onChange={(e) => setCentreLocation(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Candidate Capacity</label>
              <input
                type="number"
                required
                value={centreCapacity}
                onChange={(e) => setCentreCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Fiber ISP</label>
              <input
                type="text"
                required
                value={primaryIsp}
                onChange={(e) => setPrimaryIsp(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                placeholder="e.g. JIO Forun"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary ISP Public WAN IP</label>
              <input
                type="text"
                required
                value={primaryIspIp}
                onChange={(e) => setPrimaryIspIp(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                placeholder="e.g. 103.141.22.45"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Plan & Speed</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={primaryIspPlan}
                  onChange={(e) => setPrimaryIspPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                  placeholder="Plan (e.g. 1 Gbps Plan)"
                />
                <input
                  type="text"
                  required
                  value={primaryIspSpeed}
                  onChange={(e) => setPrimaryIspSpeed(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                  placeholder="Speed (e.g. 1 Gbps)"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Secondary Backup ISP</label>
              <input
                type="text"
                required
                value={secondaryIsp}
                onChange={(e) => setSecondaryIsp(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                placeholder="e.g. Airtel Business Fiber"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Secondary ISP Public WAN IP</label>
              <input
                type="text"
                required
                value={secondaryIspIp}
                onChange={(e) => setSecondaryIspIp(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                placeholder="e.g. 122.179.48.112"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Gateway IPv4</label>
                <input
                  type="text"
                  required
                  value={gatewayIp}
                  onChange={(e) => setGatewayIp(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Secondary Gateway IPv4</label>
                <input
                  type="text"
                  required
                  value={secondaryGatewayIp}
                  onChange={(e) => setSecondaryGatewayIp(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: State Snapshots & Backup */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-5 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Data Persistence & State Management</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Export or import the full FETS Space operational database snapshot (JSON format).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Export */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="font-bold text-slate-900 dark:text-white">Export JSON State</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Download complete snapshot of 40 workstations, assets, audit checklists, exam matrix, and ticket history.
              </p>
              <button
                onClick={exportStateJson}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Download Snapshot
              </button>
            </div>

            {/* Import */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                <span className="font-bold text-slate-900 dark:text-white">Restore / Import JSON</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Upload an existing JSON backup file to overwrite local state and restore previous operations.
              </p>
              <label className="w-full py-2 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-lg text-xs block text-center cursor-pointer transition-colors">
                Upload Backup File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Reset */}
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                <span className="font-bold text-rose-900 dark:text-rose-300">Reset to Factory Seed</span>
              </div>
              <p className="text-rose-800 dark:text-rose-400 text-[11px]">
                Re-seed all 40 Calicut workstations, baseline hardware, asset inventory, and standard exam engines.
              </p>
              <button
                onClick={() => {
                  if (confirm('Reset platform data to default factory seed state?')) {
                    resetStateToDefault();
                  }
                }}
                className="w-full py-2 bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RBAC Roles */}
      {activeTab === 'rbac' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">Role-Based Access Control (RBAC) Matrix</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Security permissions assigned across administrative and proctoring staff.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Role Tier</th>
                  <th className="px-4 py-3">Workstations & Systems</th>
                  <th className="px-4 py-3">Hardware Transfers</th>
                  <th className="px-4 py-3">Audit Sign-offs</th>
                  <th className="px-4 py-3">System Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Lazeem (Admin)</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Full Create / Edit / Delete</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Authorized</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Authorized</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Full Access</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">IT Technician</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Edit / Diagnostics / Ping</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Authorized</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Authorized</td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">View Only</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Exam Proctor / TCA</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">View / Report Fault</td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">Restricted</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Daily Sweep Checklist</td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">Restricted</td>
                </tr>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Auditor</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">View Only</td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">Restricted</td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400 font-semibold">Read & Export Reports</td>
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500">Restricted</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Network Monitoring Configuration */}
      {activeTab === 'network' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Network Monitoring</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure centre-wide throughput observation point, network interface, and telemetry sampling.</p>
            </div>

            {netSaveSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                <span>Saved successfully</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveNetworkConfig} className="space-y-4 max-w-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Monitoring Source */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monitoring Source
                </label>
                <select
                  value={netSource}
                  onChange={(e) => setNetSource(e.target.value as NetworkMonitoringSourceType)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-600/40 focus:outline-none"
                >
                  <option value="Admin Server">Admin Server</option>
                  <option value="Gateway">Gateway</option>
                  <option value="Router">Router</option>
                  <option value="Dedicated Monitoring Host">Dedicated Monitoring Host</option>
                  <option value="Custom Interface">Custom Interface</option>
                </select>
              </div>

              {/* Interface */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interface
                </label>
                <select
                  value={netInterface}
                  onChange={(e) => setNetInterface(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-2 focus:ring-blue-600/40 focus:outline-none"
                >
                  <option value="Ethernet (eth1)">Ethernet</option>
                  <option value="Gigabit Uplink (eth2)">Gigabit Uplink</option>
                  <option value="WAN Gateway">WAN Gateway</option>
                  <option value="SFP+ 10G Uplink">SFP+ 10G Uplink</option>
                </select>
              </div>
            </div>

            {/* Status & Last Data Row */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700 dark:text-blue-300">Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700 dark:text-blue-300">Last Data:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{netTimeAgo}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-blue-200/60 dark:border-blue-900/50">
                <span className="font-semibold text-blue-700 dark:text-blue-300">Current Aggregate Throughput:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ↓ {networkData && typeof networkData.downloadMbps === 'number' && !Number.isNaN(networkData.downloadMbps) ? Math.round(networkData.downloadMbps) : 284} Mbps • ↑ {networkData && typeof networkData.uploadMbps === 'number' && !Number.isNaN(networkData.uploadMbps) ? Math.round(networkData.uploadMbps) : 46} Mbps
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-700 dark:text-blue-300">Physical Link Speed:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {networkData?.linkSpeed || '1 Gbps Full-Duplex'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Calculates real byte deltas over polling intervals.
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

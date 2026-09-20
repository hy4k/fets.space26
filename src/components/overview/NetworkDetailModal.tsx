import React, { useState } from 'react';
import {
  Network,
  Activity,
  ArrowDown,
  ArrowUp,
  Server,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sliders,
  X,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { NetworkOverview, NetworkMonitoringSourceType } from '../../types';
import { useApp } from '../../context/AppContext';

interface NetworkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NetworkOverview | null;
  timeAgoText: string;
  onRefresh: () => void;
  onUpdateConfig: (cfg: any) => Promise<boolean>;
  onSimulateState: (state: 'active' | 'stale_simulated' | 'unavailable_simulated' | 'zero_simulated') => Promise<boolean>;
}

export const NetworkDetailModal: React.FC<NetworkDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  timeAgoText,
  onRefresh,
  onUpdateConfig,
  onSimulateState
}) => {
  const { currentCentre } = useApp();
  const [selectedSource, setSelectedSource] = useState<NetworkMonitoringSourceType>(
    data?.monitoringSource || 'Admin Server'
  );
  const [selectedInterface, setSelectedInterface] = useState<string>(
    data?.interface || 'Ethernet (eth1)'
  );
  const [selectedRefreshInterval, setSelectedRefreshInterval] = useState<number>(
    data?.refreshInterval || 1
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadMbps = typeof data?.downloadMbps === 'number' && !Number.isNaN(data.downloadMbps) ? data.downloadMbps : 0;
  const uploadMbps = typeof data?.uploadMbps === 'number' && !Number.isNaN(data.uploadMbps) ? data.uploadMbps : 0;
  const status = data?.status || 'live';
  const linkSpeed = data?.linkSpeed || '1 Gbps Full-Duplex';
  const connectedSystems = data?.connectedSystems || 40;
  const refreshIntervalSec = data?.refreshInterval || selectedRefreshInterval || 1;

  const handlePollNow = async () => {
    setIsPolling(true);
    await onRefresh();
    setTimeout(() => setIsPolling(false), 500);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await onUpdateConfig({
      monitoringSource: selectedSource,
      interfaceName: selectedInterface,
      refreshInterval: Number(selectedRefreshInterval)
    });
    setIsSaving(false);
    if (ok) {
      setFeedbackMsg(`Telemetry cadence set to ${selectedRefreshInterval}s.`);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleSimulate = async (state: 'active' | 'stale_simulated' | 'unavailable_simulated' | 'zero_simulated') => {
    await onSimulateState(state);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Network Overview • Testing Centre Aggregate Throughput"
      subtitle="Live bandwidth telemetry and real-time sampling diagnostics"
      maxWidth="3xl"
    >
      <div className="space-y-5 text-stone-800 dark:text-stone-200">
        {/* Top Summary Banner */}
        <div className="bg-[#EFF6FF] dark:bg-blue-950/30 border border-[#BFDBFE] dark:border-blue-900/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 border border-[#BFDBFE] dark:border-blue-800 flex items-center justify-center text-[#1D4ED8] dark:text-blue-400 shrink-0">
              <Network className="w-5 h-5 text-[#1D4ED8] dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#1D4ED8] dark:text-blue-400">Centre Aggregate Throughput</h3>
                {status === 'live' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE ({refreshIntervalSec}s Cadence)
                  </span>
                )}
                {status === 'recent' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    RECENT
                  </span>
                )}
                {status === 'stale' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    DATA STALE
                  </span>
                )}
                {status === 'unavailable' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    UNAVAILABLE
                  </span>
                )}
                {status === 'zero' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full">
                    CONNECTED (0 Mbps)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#1D4ED8]/80 dark:text-blue-300/80 mt-0.5">
                Observed from {data?.monitoringSource || 'Admin Server'} • {connectedSystems} Active Workstations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePollNow}
            disabled={isPolling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] dark:text-blue-300 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-750 border border-[#BFDBFE] dark:border-blue-900/60 rounded-lg shadow-2xs transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-60"
            title="Trigger immediate live network measurement"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1D4ED8] dark:text-blue-300 ${isPolling ? 'animate-spin' : ''}`} />
            <span>{isPolling ? 'Sampling...' : 'Poll Now'}</span>
          </button>
        </div>

        {/* Primary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Download */}
          <div className="bg-[#EFF6FF] dark:bg-blue-950/20 border border-[#BFDBFE] dark:border-blue-900/60 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1D4ED8] dark:text-blue-400 uppercase tracking-wider">
              <span>Download / Inbound Traffic</span>
              <span className="text-[#2563EB] dark:text-blue-400 font-bold">↓ Inbound</span>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-baseline gap-1">
              <span>{status === 'stale' || status === 'unavailable' ? '--' : Math.round(downloadMbps)}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">Mbps</span>
            </div>
            <div className="mt-1 text-xs text-[#1D4ED8]/70 dark:text-blue-300/70">
              Peak aggregate inbound bandwidth for testing booths
            </div>
          </div>

          {/* Upload */}
          <div className="bg-[#EFF6FF] dark:bg-blue-950/20 border border-[#BFDBFE] dark:border-blue-900/60 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1D4ED8] dark:text-blue-400 uppercase tracking-wider">
              <span>Upload / Outbound Traffic</span>
              <span className="text-[#2563EB] dark:text-blue-400 font-bold">↑ Outbound</span>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-baseline gap-1">
              <span>{status === 'stale' || status === 'unavailable' ? '--' : Math.round(uploadMbps)}</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-mono">Mbps</span>
            </div>
            <div className="mt-1 text-xs text-[#1D4ED8]/70 dark:text-blue-300/70">
              Telemetry, exam video feeds, and response submission
            </div>
          </div>
        </div>

        {/* Technical Distinction & Telemetry Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-[#1D4ED8] dark:text-blue-400 uppercase tracking-wider">
            Monitoring Specification & Physical Link
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-lg border border-[#BFDBFE] dark:border-blue-900/60">
              <span className="text-[#1D4ED8] dark:text-blue-400 font-medium block">Active Primary ISP</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate" title={currentCentre.primaryIsp || 'JIO Forun'}>
                {currentCentre.primaryIsp || 'JIO Forun'}
              </span>
              <span className="text-[10px] text-[#2563EB] dark:text-blue-400 font-semibold block">{currentCentre.primaryIspSpeed || '1 Gbps'} Plan</span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 block mt-0.5">IP: {currentCentre.primaryIspIp || '103.141.22.45'}</span>
            </div>

            <div className="p-2.5 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-lg border border-[#BFDBFE] dark:border-blue-900/60">
              <span className="text-[#1D4ED8] dark:text-blue-400 font-medium block">Secondary Backup ISP</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate" title={currentCentre.secondaryIsp || 'Airtel Business Fiber'}>
                {currentCentre.secondaryIsp || 'Airtel Business Fiber'}
              </span>
              <span className="text-[10px] text-[#2563EB] dark:text-blue-400 font-semibold block">{currentCentre.secondaryIspSpeed || '300 Mbps'} Failover</span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 block mt-0.5">IP: {currentCentre.secondaryIspIp || '122.179.48.112'}</span>
            </div>

            <div className="p-2.5 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-lg border border-[#BFDBFE] dark:border-blue-900/60">
              <span className="text-[#1D4ED8] dark:text-blue-400 font-medium block">Current Aggregate</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {status === 'stale' || status === 'unavailable' ? '--' : `${Math.round(downloadMbps)} Mbps`}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Link Cap: {linkSpeed}</span>
            </div>

            <div className="p-2.5 bg-[#EFF6FF] dark:bg-blue-950/30 rounded-lg border border-[#BFDBFE] dark:border-blue-900/60">
              <span className="text-[#1D4ED8] dark:text-blue-400 font-medium block">Interface & Gateway</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">{data?.interface || 'Ethernet (eth1)'}</span>
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 block mt-0.5">GW: {currentCentre.gatewayIp || '192.168.10.1'}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              <strong>Note:</strong> Physical link capability is {linkSpeed}. The displayed {Math.round(downloadMbps)} Mbps is the current real-time aggregate traffic throughput across the centre.
            </span>
            <span className="font-mono font-medium text-slate-600 dark:text-slate-400 shrink-0 ml-2">
              {timeAgoText}
            </span>
          </div>
        </div>

        {/* Recent Throughput (Last 5–15 Minutes) */}
        {data?.recentReadings && data.recentReadings.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Recent Throughput Activity
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {data.recentReadings.length} telemetry samples recorded
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
              {data.recentReadings.slice(-8).reverse().map((r, idx) => (
                <div key={idx} className="py-1.5 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{r.timestamp}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">↓ {r.downloadMbps} Mbps</span>
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">↑ {r.uploadMbps} Mbps</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Monitoring Configuration */}
        <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Network Monitoring Source Configuration
              </h4>
            </div>
            {feedbackMsg && (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {feedbackMsg}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Monitoring Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value as NetworkMonitoringSourceType)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              >
                <option value="Admin Server">Admin Server (Exam Host)</option>
                <option value="Gateway">Centre Gateway (192.168.10.1)</option>
                <option value="Router">Core Edge Router</option>
                <option value="Dedicated Monitoring Host">Dedicated Host</option>
                <option value="Custom Interface">Custom Interface</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Interface
              </label>
              <select
                value={selectedInterface}
                onChange={(e) => setSelectedInterface(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              >
                <option value="Ethernet (eth1)">Ethernet (eth1) • Primary LAN</option>
                <option value="Gigabit Uplink (eth2)">Gigabit Uplink (eth2)</option>
                <option value="WAN Gateway">WAN Gateway Interface</option>
                <option value="SFP+ 10G Uplink">SFP+ 10G Optical Uplink</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Refresh Cadence (Rate)
              </label>
              <select
                value={selectedRefreshInterval}
                onChange={(e) => setSelectedRefreshInterval(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium focus:ring-2 focus:ring-[#C5A059] focus:outline-none"
              >
                <option value={1}>1 second (Ultra-Responsive Live)</option>
                <option value={2}>2 seconds (Fast Cadence)</option>
                <option value={3}>3 seconds (Standard Interval)</option>
                <option value={5}>5 seconds (Eco Mode)</option>
              </select>
            </div>

            <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-2">
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Calculates aggregate bits/sec delta using real byte counters over active sampling windows.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#C5A059] hover:bg-[#b08c46] text-[#0A0C0F] font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer self-end sm:self-auto disabled:opacity-60"
              >
                {isSaving ? 'Applying Cadence...' : 'Save & Apply Cadence'}
              </button>
            </div>
          </form>

          {/* Live Cadence & Lapse Diagnostic Monitor */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Sample Cadence</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                Every {refreshIntervalSec}s
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Telemetry Lapse</span>
              <span className={`font-mono font-bold text-sm ${data?.dataFreshnessSeconds && data.dataFreshnessSeconds > 15 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {data?.dataFreshnessSeconds ?? 0}s delay
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Stream Protocol</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] block truncate">
                SSE Zero-Lag Push
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 block">Stream Status</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200 text-[11px] flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Sync
              </span>
            </div>
          </div>

          {/* Verification & Simulation Controls for Testing Centre Admin */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Admin Telemetry State Verifier (Requirement Checks)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSimulate('active')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  status === 'live' || status === 'recent'
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                ● Normal Live Traffic
              </button>

              <button
                type="button"
                onClick={() => handleSimulate('stale_simulated')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  status === 'stale'
                    ? 'bg-amber-600 text-white border-amber-700'
                    : 'bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
              >
                ⚠ Test Stale (&gt;60s)
              </button>

              <button
                type="button"
                onClick={() => handleSimulate('unavailable_simulated')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  status === 'unavailable'
                    ? 'bg-rose-700 text-white border-rose-800'
                    : 'bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                ✖ Test Unavailable
              </button>

              <button
                type="button"
                onClick={() => handleSimulate('zero_simulated')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                  status === 'zero'
                    ? 'bg-slate-800 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                ○ Test Zero Traffic (0 Mbps)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  Network,
  Wifi,
  Server,
  Shield,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Radio,
  Zap,
  Globe,
  Monitor,
  Copy,
  Check,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ui/StatusBadge';
import { usePrinterStatus } from '../../hooks/usePrinterStatus';
import { PrinterDetailModal } from '../printer/PrinterDetailModal';

export const NetworkView: React.FC = () => {
  const { networkNodes, systems, currentCentre, navigate } = useApp();
  const [selectedSwitch, setSelectedSwitch] = useState<'SW-A' | 'SW-B'>('SW-A');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Network Printer Subsystem Telemetry
  const {
    printerData,
    isLoading: isPrinterLoading,
    timeAgoText: printerTimeAgoText,
    isProbing: isPrinterProbing,
    isPrintingTest,
    refresh: refreshPrinter,
    probe: probePrinter,
    sendTestPrint,
    simulateState: simulatePrinterState,
    updateConfig: updatePrinterConfig
  } = usePrinterStatus();
  const [isPrinterDetailOpen, setIsPrinterDetailOpen] = useState(false);

  const primaryWanIp = currentCentre.primaryIspIp || '103.141.22.45';
  const primaryGatewayIp = currentCentre.gatewayIp || '192.168.10.1';
  const secondaryWanIp = currentCentre.secondaryIspIp || '122.179.48.112';
  const secondaryGatewayIp = currentCentre.secondaryGatewayIp || '192.168.20.1';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const workstations = systems.filter((s) => s.type === 'workstation');

  // Generate switch ports (1 to 24)
  const switchPorts = Array.from({ length: 24 }, (_, i) => {
    const portNum = i + 1;
    const ws = workstations.find(
      (w) => w.network.switchPort === `${selectedSwitch}-P${portNum.toString().padStart(2, '0')}`
    );

    const isConnected = !!ws;
    const isOnline = ws ? ws.status !== 'offline' : false;
    const hasIssue = ws ? ws.status === 'attention' || ws.status === 'critical' : false;

    return {
      portNumber: portNum,
      portLabel: `${selectedSwitch}-P${portNum.toString().padStart(2, '0')}`,
      connectedSystem: ws,
      status: !isConnected ? 'empty' : !isOnline ? 'down' : hasIssue ? 'warning' : 'active',
      speed: isConnected ? '1.0 Gbps' : 'Disconnected',
      vlan: ws ? (ws.id.startsWith('W00') || ws.id.startsWith('W01') ? 'VLAN 10 (Exams)' : 'VLAN 20 (Testing)') : '—'
    };
  });

  const filteredSystems = systems.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.network.ipAddress.includes(searchQuery) ||
      s.network.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.network.switchPort.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePingSweep = () => {
    setIsPingingAll(true);
    setTimeout(() => {
      setIsPingingAll(false);
    }, 900);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Network Infrastructure & Topology</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
              Gigabit LAN Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time topology, managed switch port maps, VLAN partitioning, and ISP fiber uplink monitoring for {currentCentre.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePingSweep}
            disabled={isPingingAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPingingAll ? 'animate-spin' : ''}`} />
            <span>{isPingingAll ? 'Pinging All Nodes...' : 'Network Diagnostic Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Network Core KPI & ISP Uplinks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Primary ISP: JIO Forun */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Primary ISP: {currentCentre.primaryIsp || 'JIO Forun'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ACTIVE
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentCentre.primaryIspSpeed || '1 Gbps'}
            </span>
            <span className="text-xs text-blue-600/80 dark:text-blue-400/80">
              {currentCentre.primaryIspPlan ? `${currentCentre.primaryIspPlan} • Symmetric` : '1 Gbps Plan • Symmetric Bandwidth'}
            </span>
          </div>

          {/* JIO IP Address Display Block */}
          <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-blue-200 dark:border-blue-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider">
                Public WAN Static IP
              </span>
              <button
                type="button"
                onClick={() => handleCopy(primaryWanIp, 'jio-wan')}
                className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono font-medium cursor-pointer"
                title="Copy Jio WAN IP"
              >
                {copiedKey === 'jio-wan' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{primaryWanIp}</span>
              <span className="text-[9.5px] font-sans font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Jio Fiber Static
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Gateway IPv4</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{primaryGatewayIp}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Subnet Mask</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">255.255.255.0</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Core DNS</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">1.1.1.1, 8.8.8.8</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Latency to Pearson/CMA</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">8 ms avg</span>
            </div>
          </div>
        </div>

        {/* Secondary ISP: Airtel Business Fiber */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Secondary ISP: {currentCentre.secondaryIsp || 'Airtel Business Fiber'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              HOT STANDBY
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentCentre.secondaryIspSpeed || '300 Mbps'}
            </span>
            <span className="text-xs text-blue-600/80 dark:text-blue-400/80">Automated Failover</span>
          </div>

          {/* Airtel IP Address Display Block */}
          <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-blue-200 dark:border-blue-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider">
                Public WAN Static IP
              </span>
              <button
                type="button"
                onClick={() => handleCopy(secondaryWanIp, 'airtel-wan')}
                className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono font-medium cursor-pointer"
                title="Copy Airtel WAN IP"
              >
                {copiedKey === 'airtel-wan' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{secondaryWanIp}</span>
              <span className="text-[9.5px] font-sans font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Airtel Dedicated
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Secondary Gateway</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{secondaryGatewayIp}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Subnet Mask</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">255.255.255.0</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Failover SLA</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">&lt; 3 Seconds</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Routing Protocol</span>
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">VRRP Auto-Switch</span>
            </div>
          </div>
        </div>

        {/* DNS & Subnets */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Core DNS & VLAN Subnets</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ISOLATED
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {systems.filter((s) => s.type === 'workstation').length} Nodes
            </span>
            <span className="text-xs text-blue-600/80 dark:text-blue-400/80">Strict Subnet Partitioning</span>
          </div>

          {/* Subnet / IP Routing Details Block */}
          <div className="p-2.5 bg-white/90 dark:bg-slate-850 rounded-lg border border-blue-200 dark:border-blue-800/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider">
                Exam Network Scope
              </span>
              <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 font-semibold">
                Class C Private
              </span>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{currentCentre.networkSubnet || '192.168.10.0/24'}</span>
              <span className="text-[9.5px] font-sans font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                VLAN 10 Exam
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-200/60 dark:border-blue-800/60 text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Surveillance VLAN 30</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">192.168.30.0/24</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">DHCP Range</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">.10 – .99 Static</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Primary DNS</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">1.1.1.1 (Cloudflare)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Secondary DNS</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">8.8.8.8 (Google)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centre Infrastructure & Peripheral Nodes (Network Printer, Switches, Core Services) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 tracking-wide uppercase">
                Core Infrastructure & Network Peripheral Nodes
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Dedicated examination laser printer and network peripherals on the centre LAN.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Subnet Scope: 192.168.29.0/24</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Node 1: HP Laser MFP 1188fnw Network Printer */}
          <div
            onClick={() => setIsPrinterDetailOpen(true)}
            className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition-all cursor-pointer shadow-2xs hover:shadow-xs group space-y-2.5 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block leading-tight">
                    HP Laser MFP 1188fnw
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Network Laser Printer</span>
                </div>
              </div>

              {printerData?.isLive ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 animate-pulse">
                  LIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  DEMO
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-baseline justify-between font-mono">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Static IPv4:</span>
                <span className="font-bold text-slate-900 dark:text-white">192.168.29.91</span>
              </div>
              <div className="flex items-baseline justify-between font-mono text-[11px] text-slate-600 dark:text-slate-300">
                <span>Active Ports:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">9100, 80, 631</span>
              </div>
              <div className="flex items-baseline justify-between text-[11px] text-slate-600 dark:text-slate-300">
                <span>Location:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[130px]">Control Room</span>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                Open Diagnostics →
              </span>
              <a
                href="http://192.168.29.91"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                title="Open Web Interface (192.168.29.91)"
              >
                Web EWS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Switch Port Map Visualizer */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-xl p-5 shadow-sm space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                Hardware Switch Port Visualizer: Cisco Catalyst 24-Port Gigabit
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live link status, PoE negotiation, and connected workstation mapping.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedSwitch('SW-A')}
              className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                selectedSwitch === 'SW-A' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Switch A (Booths 01–20)
            </button>
            <button
              onClick={() => setSelectedSwitch('SW-B')}
              className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer ${
                selectedSwitch === 'SW-B' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Switch B (Booths 21–40)
            </button>
          </div>
        </div>

        {/* 24 Port Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2.5 pt-2">
          {switchPorts.map((port) => (
            <div
              key={port.portNumber}
              onClick={() => {
                if (port.connectedSystem) navigate('system-detail', port.connectedSystem.id);
              }}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                port.status === 'active'
                  ? 'bg-emerald-950/40 border-emerald-600/60 hover:bg-emerald-900/50'
                  : port.status === 'warning'
                  ? 'bg-amber-950/40 border-amber-600/60 hover:bg-amber-900/50'
                  : port.status === 'down'
                  ? 'bg-rose-950/40 border-rose-600/60 hover:bg-rose-900/50'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-500'
              }`}
            >
              {/* Port status LED light */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-300">P{port.portNumber}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    port.status === 'active'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
                      : port.status === 'warning'
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : port.status === 'down'
                      ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                      : 'bg-slate-600'
                  }`}
                />
              </div>

              {/* Port connection payload */}
              <div className="text-[11px] font-mono font-bold text-white truncate">
                {port.connectedSystem ? port.connectedSystem.id : 'Unlinked'}
              </div>
              <div className="text-[9px] text-slate-400 truncate mt-0.5">{port.speed}</div>
            </div>
          ))}
        </div>
      </div>

      {/* IP Address & Network Node Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              IP Address Allocation & Node Registry ({filteredSystems.length} Devices)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Static DHCP reservations and real-time ICMP ping latencies for all testing machines.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search IP, MAC, Switch Port..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Host ID</th>
                <th className="px-4 py-3">System Name</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Subnet / VLAN</th>
                <th className="px-4 py-3">MAC Address</th>
                <th className="px-4 py-3">Switch Port</th>
                <th className="px-4 py-3">Link Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSystems.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    <button
                      onClick={() => navigate('system-detail', s.id)}
                      className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {s.id}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{s.network.ipAddress}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 font-mono text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                      VLAN 10 ({s.network.subnetMask})
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{s.network.macAddress}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{s.network.switchPort}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate('system-detail', s.id)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold cursor-pointer"
                    >
                      Ping Node →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Network Printer Detail & Diagnostics Modal (HP Laser MFP 1188fnw) */}
      <PrinterDetailModal
        isOpen={isPrinterDetailOpen}
        onClose={() => setIsPrinterDetailOpen(false)}
        printerData={printerData}
        isLoading={isPrinterLoading}
        timeAgoText={printerTimeAgoText}
        isProbing={isPrinterProbing}
        isPrintingTest={isPrintingTest}
        onRefresh={refreshPrinter}
        onProbe={probePrinter}
        onSendTestPrint={sendTestPrint}
        onSimulateState={simulatePrinterState}
        onUpdateConfig={updatePrinterConfig}
      />
    </div>
  );
};

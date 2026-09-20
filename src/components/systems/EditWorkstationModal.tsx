import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Cpu,
  Monitor,
  Camera,
  HardDrive,
  Check,
  RotateCcw,
  Network,
  Shield,
  Layers
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SystemRecord, SystemStatus, SystemType } from '../../types';
import { useApp } from '../../context/AppContext';

export interface EditWorkstationModalProps {
  system: SystemRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: SystemRecord) => void;
  onDeleted?: (deletedId: string) => void;
  isCreateMode?: boolean;
}

type UIStatusType = 'operational' | 'maintenance' | 'fault' | 'off-site';

export const EditWorkstationModal: React.FC<EditWorkstationModalProps> = ({
  system,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
  isCreateMode = false
}) => {
  const { updateSystem, deleteSystem, createSystem, currentCentre } = useApp();

  // Primary Identity Fields
  const [systemId, setSystemId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('Workstation');
  const [centre, setCentre] = useState<string>('Calicut');

  // Status mapping
  const [uiStatus, setUiStatus] = useState<UIStatusType>('operational');
  const [faultSeverity, setFaultSeverity] = useState<'critical' | 'attention'>('critical');

  // Hardware & Specs Fields matching the image
  const [processor, setProcessor] = useState('i3 - 8');
  const [ram, setRam] = useState('8 GB');
  const [operatingSystem, setOperatingSystem] = useState('Windows 11');
  const [storage, setStorage] = useState('119 GB');
  const [camera, setCamera] = useState('A-05');
  const [cpuBrand, setCpuBrand] = useState('Consistent');
  const [monitor, setMonitor] = useState('ZEBSTER');

  // Notes
  const [notes, setNotes] = useState('');

  // Advanced Drawer/Accordion toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Peripherals & Hardware
  const [storageType, setStorageType] = useState<'SSD' | 'NVMe' | 'HDD' | 'None'>('SSD');
  const [keyboard, setKeyboard] = useState('Dell KB216 USB Keyboard');
  const [mouse, setMouse] = useState('Dell MS116 Optical Mouse');
  const [headset, setHeadset] = useState('Jabra Evolve 20 Stereo');

  // Advanced Network
  const [ipAddress, setIpAddress] = useState('192.168.10.108');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [gateway, setGateway] = useState('192.168.10.1');
  const [macAddress, setMacAddress] = useState('B4:2E:99:A1:08:4F');
  const [switchPort, setSwitchPort] = useState('08');
  const [vlan, setVlan] = useState(10);

  // Advanced OS info
  const [osArchitecture, setOsArchitecture] = useState<'64-bit' | '32-bit'>('64-bit');
  const [osBuild, setOsBuild] = useState('22631.3007');

  // State flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputConfirmation, setDeleteInputConfirmation] = useState('');

  // Synchronize state when modal opens or system changes
  useEffect(() => {
    if (!isOpen) return;

    if (system) {
      setSystemId(system.id || 'W08');
      setName(system.name || 'Work station');
      
      // Type mapping
      if (system.type === 'workstation') setType('Workstation');
      else if (system.type === 'admin_pc') setType('Admin PC');
      else if (system.type === 'server') setType('Server');
      else setType('Workstation');

      setCentre(system.centreName || currentCentre?.name || 'Calicut');

      // Map system status to UI status
      if (system.status === 'operational') {
        setUiStatus('operational');
      } else if (system.status === 'maintenance') {
        setUiStatus('maintenance');
      } else if (system.status === 'attention' || system.status === 'critical') {
        setUiStatus('fault');
        setFaultSeverity(system.status);
      } else if (system.status === 'offline') {
        setUiStatus('off-site');
      } else {
        setUiStatus('operational');
      }

      // Hardware fields
      setProcessor(system.hardware?.processor || 'i3 - 8');
      setRam(system.hardware?.ramGB ? `${system.hardware.ramGB} GB` : '8 GB');
      setStorage(system.hardware?.storageGB ? `${system.hardware.storageGB} GB` : '119 GB');
      setStorageType(system.hardware?.storageType || 'SSD');
      setCamera(system.hardware?.cameraModel || 'A-05');
      setCpuBrand(system.hardware?.cpuBrand || 'Consistent');
      setMonitor(system.hardware?.monitorModel || 'ZEBSTER');

      // Peripherals
      setKeyboard(system.hardware?.keyboardModel || 'Dell KB216 USB Keyboard');
      setMouse(system.hardware?.mouseModel || 'Dell MS116 Optical Mouse');
      setHeadset(system.hardware?.headsetModel || 'Jabra Evolve 20 Stereo');

      // OS
      setOperatingSystem(system.os?.name || 'Windows 11');
      setOsArchitecture(system.os?.architecture || '64-bit');
      setOsBuild(system.os?.build || system.os?.buildNumber || '22631.3007');

      // Network
      setIpAddress(system.network?.ipAddress || `192.168.10.${system.boothNumber || 108}`);
      setSubnetMask(system.network?.subnetMask || '255.255.255.0');
      setGateway(system.network?.gateway || '192.168.10.1');
      setMacAddress(system.network?.macAddress || 'B4:2E:99:A1:08:4F');
      setSwitchPort(system.network?.switchPort ? String(system.network.switchPort) : '08');
      setVlan(system.network?.vlan || 10);

      // Notes
      setNotes(system.notes || '');

      setShowDeleteConfirm(false);
      setDeleteInputConfirmation('');
      setIsSavedSuccessfully(false);
    } else if (isCreateMode) {
      // Defaults for new system
      setSystemId('W37');
      setName('Work station');
      setType('Workstation');
      setCentre(currentCentre?.name || 'Calicut');
      setUiStatus('operational');
      setProcessor('i3 - 8');
      setRam('8 GB');
      setOperatingSystem('Windows 11');
      setStorage('119 GB');
      setCamera('A-05');
      setCpuBrand('Consistent');
      setMonitor('ZEBSTER');
      setNotes('');
      setShowDeleteConfirm(false);
      setIsSavedSuccessfully(false);
    }
  }, [system?.id, isCreateMode, isOpen]);

  if (!isOpen) return null;

  // Preset Handlers for super fast & advanced auto-fill
  const applyPreset = (preset: 'standard' | 'performance' | 'proctor' | 'defaultImage') => {
    if (preset === 'standard' || preset === 'defaultImage') {
      setProcessor('i3 - 8');
      setRam('8 GB');
      setOperatingSystem('Windows 11');
      setStorage('119 GB');
      setStorageType('SSD');
      setCamera('A-05');
      setCpuBrand('Consistent');
      setMonitor('ZEBSTER');
    } else if (preset === 'performance') {
      setProcessor('i5 - 12400 @ 4.4GHz');
      setRam('16 GB');
      setOperatingSystem('Windows 11 Pro');
      setStorage('256 GB');
      setStorageType('NVMe');
      setCamera('Logitech C920 Full HD');
      setCpuBrand('Dell OptiPlex');
      setMonitor('BenQ GW2480 24" FHD');
    } else if (preset === 'proctor') {
      setProcessor('i7 - 12700 @ 4.9GHz');
      setRam('32 GB');
      setOperatingSystem('Windows 11 Enterprise');
      setStorage('512 GB');
      setStorageType('NVMe');
      setCamera('Logitech Brio 4K');
      setCpuBrand('HP EliteDesk');
      setMonitor('Dell UltraSharp 27" Dual');
      setType('Admin PC');
    }
  };

  // Convert UI status back to SystemRecord status
  const getSystemStatus = (): SystemStatus => {
    if (uiStatus === 'operational') return 'operational';
    if (uiStatus === 'maintenance') return 'maintenance';
    if (uiStatus === 'fault') return faultSeverity;
    if (uiStatus === 'off-site') return 'offline';
    return 'operational';
  };

  // Extract numerical RAM in GB
  const parseRamGB = (ramStr: string): number => {
    const matched = ramStr.match(/(\d+)/);
    return matched ? parseInt(matched[1], 10) : 8;
  };

  // Extract numerical storage in GB
  const parseStorageGB = (storageStr: string): number => {
    const matched = storageStr.match(/(\d+)/);
    return matched ? parseInt(matched[1], 10) : 119;
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const calculatedStatus = getSystemStatus();
    const parsedRam = parseRamGB(ram);
    const parsedStorage = parseStorageGB(storage);

    const mappedType: SystemType =
      type === 'Admin PC' ? 'admin_pc' : type === 'Server' ? 'server' : 'workstation';

    if (system && !isCreateMode) {
      const updates: Partial<SystemRecord> = {
        name: name.trim() || 'Work station',
        type: mappedType,
        status: calculatedStatus,
        notes: notes.trim(),
        centreName: centre,
        hardware: {
          ...system.hardware,
          processor: processor.trim(),
          ramGB: parsedRam,
          storageGB: parsedStorage,
          storageType,
          cameraModel: camera.trim(),
          cpuBrand: cpuBrand.trim(),
          monitorModel: monitor.trim(),
          keyboardModel: keyboard.trim(),
          mouseModel: mouse.trim(),
          headsetModel: headset.trim()
        },
        network: {
          ...system.network,
          ipAddress: ipAddress.trim(),
          subnetMask: subnetMask.trim(),
          gateway: gateway.trim(),
          macAddress: macAddress.trim(),
          switchPort: parseInt(switchPort, 10) || 8,
          vlan: Number(vlan) || 10
        },
        os: {
          ...system.os,
          name: operatingSystem.trim(),
          architecture: osArchitecture,
          build: osBuild.trim()
        },
        lastUpdated: new Date().toISOString()
      };

      updateSystem(system.id, updates);
      setIsSavedSuccessfully(true);

      if (onSaved) {
        onSaved({ ...system, ...updates } as SystemRecord);
      }
    } else {
      // Create new system
      const newSys = createSystem({
        id: systemId.trim() || `W${Math.floor(Math.random() * 900 + 100)}`,
        name: name.trim() || 'Work station',
        type: mappedType,
        status: calculatedStatus,
        notes: notes.trim(),
        centreName: centre,
        hardware: {
          processor: processor.trim(),
          ramGB: parsedRam,
          storageGB: parsedStorage,
          storageType,
          cameraModel: camera.trim(),
          cpuBrand: cpuBrand.trim(),
          monitorModel: monitor.trim(),
          keyboardModel: keyboard.trim(),
          mouseModel: mouse.trim(),
          headsetModel: headset.trim()
        },
        network: {
          ipAddress: ipAddress.trim(),
          subnetMask: subnetMask.trim(),
          gateway: gateway.trim(),
          macAddress: macAddress.trim(),
          switchPort: parseInt(switchPort, 10) || 8,
          vlan: Number(vlan) || 10,
          switchId: 'SW-01',
          dns: '1.1.1.1',
          linkSpeed: '1 Gbps'
        },
        os: {
          name: operatingSystem.trim(),
          architecture: osArchitecture,
          build: osBuild.trim(),
          version: '23H2',
          lastUpdateDate: new Date().toISOString().slice(0, 10)
        }
      });

      setIsSavedSuccessfully(true);
      if (onSaved) {
        onSaved(newSys);
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSavedSuccessfully(false);
      onClose();
    }, 600);
  };

  // Handle Delete
  const handleDelete = () => {
    if (!system) return;
    deleteSystem(system.id);
    if (onDeleted) {
      onDeleted(system.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const currentDisplayId = system?.id || systemId || 'W08';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      contentPadding="p-0"
      maxWidth="xl"
    >
      <div className="bg-[#FAF7F2] dark:bg-[#0E1015] text-stone-800 dark:text-[#FAF7F2] rounded-3xl p-5 sm:p-7 space-y-5 transition-colors">
        {/* Top Header Bar matching the Image */}
        <div className="flex items-center justify-between pb-1">
          {/* Green Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0A6447] dark:bg-[#064E3B] text-white shadow-xs">
            <span className="text-xs font-black uppercase tracking-wider">
              {isCreateMode ? 'ADDING NEW SYSTEM' : `EDITING ${currentDisplayId}`}
            </span>
          </div>

          {/* Cancel Text Button */}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            CANCEL
          </button>
        </div>

        {/* Quick Specs Preset Bar (Super Advanced & Simple feature) */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#EFECE6]/80 dark:bg-[#161922] border border-stone-300/60 dark:border-stone-800 rounded-2xl text-[11px]">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 font-semibold shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span className="hidden sm:inline">Quick Spec Presets:</span>
            <span className="sm:hidden">Presets:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={() => applyPreset('defaultImage')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium hover:border-[#0A6447] hover:text-[#0A6447] dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Standard Lab (i3 / 8GB)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('performance')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium hover:border-[#0A6447] hover:text-[#0A6447] dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              High Perf (i5 / 16GB)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('proctor')}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-medium hover:border-[#0A6447] hover:text-[#0A6447] dark:hover:border-emerald-400 dark:hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              Proctor (i7 / 32GB)
            </button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* SYSTEM ID */}
          <div>
            <label
              htmlFor="ws-system-id"
              className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
            >
              SYSTEM ID
            </label>
            <input
              id="ws-system-id"
              type="text"
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
              disabled={!isCreateMode && !!system}
              className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-bold text-sm tracking-wide focus:outline-none focus:ring-2 focus:ring-[#0A6447] disabled:opacity-90 disabled:cursor-not-allowed"
              placeholder="e.g. W08"
            />
          </div>

          {/* NAME */}
          <div>
            <label
              htmlFor="ws-name"
              className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
            >
              NAME
            </label>
            <input
              id="ws-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
              placeholder="Work station"
            />
          </div>

          {/* TYPE & CENTRE (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* TYPE Dropdown */}
            <div>
              <label
                htmlFor="ws-type"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
              >
                TYPE
              </label>
              <div className="relative">
                <select
                  id="ws-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447] pr-10 cursor-pointer"
                >
                  <option value="Workstation">Workstation</option>
                  <option value="Admin PC">Admin PC / Console</option>
                  <option value="Server">Exam Server</option>
                  <option value="Backup Terminal">Backup Terminal</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-600 dark:text-stone-300">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* CENTRE Dropdown */}
            <div>
              <label
                htmlFor="ws-centre"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
              >
                CENTRE
              </label>
              <div className="relative">
                <select
                  id="ws-centre"
                  value={centre}
                  onChange={(e) => setCentre(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447] pr-10 cursor-pointer"
                >
                  <option value="Calicut">Calicut</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Trivandrum">Trivandrum</option>
                  <option value="Kannur">Kannur</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-600 dark:text-stone-300">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* STATUS: 4-Pill Interactive Grid matching Image */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                STATUS
              </label>
              {uiStatus === 'fault' && (
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-stone-500 dark:text-stone-400">Severity:</span>
                  <button
                    type="button"
                    onClick={() => setFaultSeverity('attention')}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      faultSeverity === 'attention'
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Minor Warning
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaultSeverity('critical')}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      faultSeverity === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200 font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Critical Lockout
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Operational */}
              <button
                type="button"
                onClick={() => setUiStatus('operational')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                  uiStatus === 'operational'
                    ? 'bg-[#18181B] dark:bg-[#1E2330] text-white border-stone-800 dark:border-stone-600 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-[#EFECE6] dark:bg-[#161922] text-stone-700 dark:text-stone-300 border-stone-300/80 dark:border-stone-700/80 hover:bg-stone-200/80 dark:hover:bg-stone-800/80'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0 shadow-xs animate-pulse" />
                <span>Operational</span>
              </button>

              {/* Maintenance */}
              <button
                type="button"
                onClick={() => setUiStatus('maintenance')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                  uiStatus === 'maintenance'
                    ? 'bg-[#18181B] dark:bg-[#1E2330] text-white border-stone-800 dark:border-stone-600 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-[#EFECE6] dark:bg-[#161922] text-stone-700 dark:text-stone-300 border-stone-300/80 dark:border-stone-700/80 hover:bg-stone-200/80 dark:hover:bg-stone-800/80'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0 shadow-xs" />
                <span>Maintenance</span>
              </button>

              {/* Fault */}
              <button
                type="button"
                onClick={() => setUiStatus('fault')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                  uiStatus === 'fault'
                    ? 'bg-[#18181B] dark:bg-[#1E2330] text-white border-stone-800 dark:border-stone-600 shadow-md ring-1 ring-rose-500/50'
                    : 'bg-[#EFECE6] dark:bg-[#161922] text-stone-700 dark:text-stone-300 border-stone-300/80 dark:border-stone-700/80 hover:bg-stone-200/80 dark:hover:bg-stone-800/80'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0 shadow-xs" />
                <span>Fault</span>
              </button>

              {/* Off-site */}
              <button
                type="button"
                onClick={() => setUiStatus('off-site')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border ${
                  uiStatus === 'off-site'
                    ? 'bg-[#18181B] dark:bg-[#1E2330] text-white border-stone-800 dark:border-stone-600 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-[#EFECE6] dark:bg-[#161922] text-stone-700 dark:text-stone-300 border-stone-300/80 dark:border-stone-700/80 hover:bg-stone-200/80 dark:hover:bg-stone-800/80'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0 shadow-xs" />
                <span>Off-site</span>
              </button>
            </div>
          </div>

          {/* 2-Column Hardware/Specs Grid matching Image */}
          <div className="space-y-3 pt-1">
            {/* Row 1: PROCESSOR & RAM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="ws-processor"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
                >
                  PROCESSOR
                </label>
                <input
                  id="ws-processor"
                  type="text"
                  value={processor}
                  onChange={(e) => setProcessor(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="i3 - 8"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="ws-ram"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >
                    RAM
                  </label>
                  <div className="flex items-center gap-1">
                    {['8 GB', '16 GB', '32 GB'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setRam(chip)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          ram === chip
                            ? 'bg-[#0A6447] text-white'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="ws-ram"
                  type="text"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="8 GB"
                />
              </div>
            </div>

            {/* Row 2: OPERATING SYSTEM & STORAGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="ws-os"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >
                    OPERATING SYSTEM
                  </label>
                  <div className="flex items-center gap-1">
                    {['Windows 11', 'Windows 10'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setOperatingSystem(chip)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          operatingSystem === chip
                            ? 'bg-[#0A6447] text-white'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300'
                        }`}
                      >
                        {chip.replace('Windows', 'Win')}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="ws-os"
                  type="text"
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="Windows 11"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="ws-storage"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400"
                  >
                    STORAGE
                  </label>
                  <div className="flex items-center gap-1">
                    {['119 GB', '256 GB', '512 GB'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setStorage(chip)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          storage === chip
                            ? 'bg-[#0A6447] text-white'
                            : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  id="ws-storage"
                  type="text"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="119 GB"
                />
              </div>
            </div>

            {/* Row 3: CAMERA & CPU BRAND */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="ws-camera"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
                >
                  CAMERA
                </label>
                <input
                  id="ws-camera"
                  type="text"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="A-05"
                />
              </div>

              <div>
                <label
                  htmlFor="ws-cpu-brand"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
                >
                  CPU BRAND
                </label>
                <input
                  id="ws-cpu-brand"
                  type="text"
                  value={cpuBrand}
                  onChange={(e) => setCpuBrand(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="Consistent"
                />
              </div>
            </div>

            {/* Row 4: MONITOR & QUICK PERIPHERAL NOTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-1">
                <label
                  htmlFor="ws-monitor"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
                >
                  MONITOR
                </label>
                <input
                  id="ws-monitor"
                  type="text"
                  value={monitor}
                  onChange={(e) => setMonitor(e.target.value)}
                  className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#0A6447]"
                  placeholder="ZEBSTER"
                />
              </div>

              {/* Advanced Network & Peripheral Quick Link */}
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-3 bg-[#E8E4DC] dark:bg-[#1A1E29] hover:bg-[#DDD8CE] dark:hover:bg-[#222736] border border-stone-300 dark:border-stone-700 rounded-2xl text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#0A6447] dark:text-emerald-400" />
                    <span>{showAdvanced ? 'Hide Advanced Config' : 'Advanced Config (IP/MAC/Apps)'}</span>
                  </span>
                  {showAdvanced ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Super Advanced Collapsible Accordion (IP, MAC, Switch Port, Peripherals, OS Build) */}
          {showAdvanced && (
            <div className="p-4 bg-white dark:bg-[#13161F] border border-stone-300/90 dark:border-stone-800 rounded-2xl space-y-4 animate-in fade-in zoom-in-98 duration-150">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#0A6447] dark:text-emerald-400" />
                  Network & Physical Patching
                </span>
                <span className="text-[10px] font-mono font-semibold text-stone-500">
                  VLAN {vlan} • Port {switchPort}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    IPv4 Address
                  </label>
                  <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-xs"
                    placeholder="192.168.10.108"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    value={macAddress}
                    onChange={(e) => setMacAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-xs"
                    placeholder="B4:2E:99:A1:08:4F"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Switch Port
                  </label>
                  <input
                    type="text"
                    value={switchPort}
                    onChange={(e) => setSwitchPort(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-xs"
                    placeholder="08"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Default Gateway
                  </label>
                  <input
                    type="text"
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-xs"
                    placeholder="192.168.10.1"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Drive Architecture
                  </label>
                  <select
                    value={storageType}
                    onChange={(e) => setStorageType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    <option value="SSD">SATA SSD (Standard)</option>
                    <option value="NVMe">M.2 NVMe High-Speed</option>
                    <option value="HDD">Mechanical Hard Disk</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                    OS Architecture
                  </label>
                  <select
                    value={osArchitecture}
                    onChange={(e) => setOsArchitecture(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    <option value="64-bit">64-bit (x64) Standard</option>
                    <option value="32-bit">32-bit (Legacy)</option>
                  </select>
                </div>
              </div>

              {/* Peripherals Row */}
              <div className="border-t border-stone-200 dark:border-stone-800 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                  Associated Peripherals
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block mb-0.5">Keyboard</span>
                    <input
                      type="text"
                      value={keyboard}
                      onChange={(e) => setKeyboard(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                      placeholder="Dell KB216"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block mb-0.5">Mouse</span>
                    <input
                      type="text"
                      value={mouse}
                      onChange={(e) => setMouse(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                      placeholder="Dell MS116"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block mb-0.5">Headset</span>
                    <input
                      type="text"
                      value={headset}
                      onChange={(e) => setHeadset(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                      placeholder="Jabra Evolve 20"
                    />
                  </div>
                </div>
              </div>

              {/* Installed Exam Apps Badges Preview */}
              {system?.examApps && system.examApps.length > 0 && (
                <div className="border-t border-stone-200 dark:border-stone-800 pt-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">
                    Verified Exam Suites ({system.examApps.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {system.examApps.map((app) => (
                      <span
                        key={app.appId}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          app.status === 'installed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                        {app.appName} ({app.version})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOTES */}
          <div>
            <label
              htmlFor="ws-notes"
              className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5"
            >
              NOTES
            </label>
            <textarea
              id="ws-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[#EFECE6] dark:bg-[#161922] border border-stone-300/80 dark:border-stone-700/80 rounded-2xl text-stone-900 dark:text-white font-medium text-xs focus:outline-none focus:ring-2 focus:ring-[#0A6447] placeholder-stone-400"
              placeholder="Maintenance history, issues, reminders..."
            />
          </div>

          {/* Primary Action Button: SAVE CHANGES */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0A6447] hover:bg-[#08543B] active:bg-[#064430] text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSavedSuccessfully ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                  <span>CHANGES SAVED!</span>
                </>
              ) : isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>SAVING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Link: DELETE THIS SYSTEM */}
          {!isCreateMode && system && (
            <div className="pt-2 text-center">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-black uppercase tracking-wider text-[#DC2626] dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
                >
                  DELETE THIS SYSTEM
                </button>
              ) : (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-left space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                        Confirm Deletion of Workstation {currentDisplayId}
                      </h4>
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                        This will permanently delete this system from the testing centre inventory and unassign any associated booth.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Workstation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowLeftRight,
  Monitor,
  Tv,
  Keyboard,
  Headphones,
  Camera,
  Video,
  Network,
  Cable,
  Download,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  ExternalLink,
  ChevronRight,
  Printer,
  Mouse,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LayoutList,
  Layers,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetCategory, AssetStatus } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { usePrinterStatus } from '../../hooks/usePrinterStatus';
import { PrinterDetailModal } from '../printer/PrinterDetailModal';

export type AssetSortField = 'system' | 'category' | 'id' | 'brand' | 'status' | 'location';
export type AssetViewMode = 'table' | 'by-system' | 'by-category';

export interface SystemAssetGroup {
  systemName: string;
  location: string;
  assets: Asset[];
}

export const AssetsView: React.FC = () => {
  const { assets, systems, navigate, currentCentre, currentUser, createAsset, deleteAsset, clearAllAssets, transferAsset } = useApp();

  // Dedicated Network Printer (HP Laser MFP 1188fnw) Telemetry & Diagnostics
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

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<AssetSortField>('system');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<AssetViewMode>('table');

  // Modals
  const [isAddAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [isTransferModalOpen, setTransferModalOpen] = useState(false);
  const [isClearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState<Asset | null>(null);

  // New Asset Manual Form
  const [newAssetTag, setNewAssetTag] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('computer');
  const [newAssetBrand, setNewAssetBrand] = useState('');
  const [newAssetModel, setNewAssetModel] = useState('');
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [newAssetStatus, setNewAssetStatus] = useState<AssetStatus>('available');
  const [newAssetLocation, setNewAssetLocation] = useState('IT Store Room / Reserve Spares');
  const [newAssetSystem, setNewAssetSystem] = useState('');
  const [newAssetCondition, setNewAssetCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [newAssetNotes, setNewAssetNotes] = useState('');

  // Transfer Form
  const [transferTargetSystem, setTransferTargetSystem] = useState('W001');
  const [transferReason, setTransferReason] = useState('Hardware swap for testing session');

  const categories: { key: string; label: string; icon: any }[] = [
    { key: 'all', label: 'All Equipment', icon: Package },
    { key: 'computer', label: 'Systems & PCs', icon: Monitor },
    { key: 'printer', label: 'Printers', icon: Printer },
    { key: 'monitor', label: 'Monitors', icon: Tv },
    { key: 'keyboard', label: 'Keyboards', icon: Keyboard },
    { key: 'mouse', label: 'Mice', icon: Mouse },
    { key: 'headset', label: 'Headsets', icon: Headphones },
    { key: 'camera', label: 'Webcams', icon: Camera },
    { key: 'cctv', label: 'CCTV Cameras', icon: Video },
    { key: 'switch', label: 'Switches & Racks', icon: Network },
    { key: 'cable', label: 'Cables & Adapters', icon: Cable }
  ];

  const getCategoryPrefix = (cat: AssetCategory): string => {
    const prefixMap: Record<string, string> = {
      printer: 'AST-PRN',
      computer: 'AST-CMP',
      monitor: 'AST-MON',
      keyboard: 'AST-KEY',
      mouse: 'AST-MOU',
      headset: 'AST-HED',
      camera: 'AST-CAM',
      cctv: 'AST-CCTV',
      switch: 'AST-SW',
      cable: 'AST-CBL'
    };
    return prefixMap[cat] || 'AST-IT';
  };

  const generateNewSerial = (cat?: AssetCategory) => {
    const targetCat = cat || newAssetCategory;
    const code = targetCat.slice(0, 3).toUpperCase();
    const rand = Math.floor(10000000 + Math.random() * 90000000);
    setNewAssetSerial(`SN-${code}-${rand}`);
  };

  const regenerateTag = (cat?: AssetCategory) => {
    const targetCat = cat || newAssetCategory;
    const prefix = getCategoryPrefix(targetCat);
    const count = assets.filter((a) => a.category === targetCat).length + 1;
    setNewAssetTag(`${prefix}-${count.toString().padStart(3, '0')}`);
  };

  // Auto-generate tag suggestion and defaults when category changes
  const handleCategorySelectChange = (cat: AssetCategory) => {
    setNewAssetCategory(cat);
    regenerateTag(cat);
    generateNewSerial(cat);
  };

  const handleSystemAllocationChange = (sysId: string) => {
    setNewAssetSystem(sysId);
    if (sysId) {
      setNewAssetLocation(`Testing Lab A - Booth ${sysId}`);
      setNewAssetStatus('assigned');
    } else {
      setNewAssetLocation('IT Store Room / Reserve Spares');
      setNewAssetStatus('available');
    }
  };

  const openAddModal = (cat?: AssetCategory, defaultSystemId?: string) => {
    const selectedCat = cat || 'computer';
    setNewAssetCategory(selectedCat);
    const prefix = getCategoryPrefix(selectedCat);
    const count = assets.filter((a) => a.category === selectedCat).length + 1;
    setNewAssetTag(`${prefix}-${count.toString().padStart(3, '0')}`);

    // Set intelligent starting brand & model suggestions based on category
    if (selectedCat === 'computer') {
      setNewAssetBrand('Dell');
      setNewAssetModel('OptiPlex 7090 Micro');
    } else if (selectedCat === 'monitor') {
      setNewAssetBrand('BenQ');
      setNewAssetModel('GW2480 23.8" Eye-Care FHD');
    } else if (selectedCat === 'keyboard') {
      setNewAssetBrand('Logitech');
      setNewAssetModel('K120 USB Wired Keyboard');
    } else if (selectedCat === 'mouse') {
      setNewAssetBrand('Logitech');
      setNewAssetModel('B100 Optical USB Mouse');
    } else if (selectedCat === 'headset') {
      setNewAssetBrand('Jabra');
      setNewAssetModel('UC Voice 150 Duo USB');
    } else if (selectedCat === 'camera') {
      setNewAssetBrand('Logitech');
      setNewAssetModel('C920 HD Pro 1080p Webcam');
    } else if (selectedCat === 'printer') {
      setNewAssetBrand('HP');
      setNewAssetModel('Laser MFP 1188fnw');
    } else if (selectedCat === 'switch') {
      setNewAssetBrand('Cisco');
      setNewAssetModel('Catalyst 2960-X 48-Port PoE');
    } else {
      setNewAssetBrand('');
      setNewAssetModel('');
    }

    const rand = Math.floor(10000000 + Math.random() * 90000000);
    setNewAssetSerial(`SN-${prefix.replace('AST-', '')}-${rand}`);
    setNewAssetSystem(defaultSystemId || '');
    setNewAssetStatus(defaultSystemId ? 'assigned' : 'available');
    setNewAssetLocation(defaultSystemId ? `Testing Lab A - Booth ${defaultSystemId}` : 'IT Store Room / Reserve Spares');
    setNewAssetCondition('excellent');
    setNewAssetNotes('');
    setAddAssetModalOpen(true);
  };

  const toggleSort = (field: AssetSortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted Assets
  const filteredAndSortedAssets = useMemo(() => {
    const list = assets.filter((a) => {
      const matchesSearch =
        a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.assignedSystemId && a.assignedSystemId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.assignedSystemName && a.assignedSystemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.assignedLocation && a.assignedLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'system': {
          // Put assigned workstations first, sort alphabetically/numerically, then unassigned
          const sysA = a.assignedSystemId || (a.status === 'assigned' ? a.assignedLocation : 'ZZZ');
          const sysB = b.assignedSystemId || (b.status === 'assigned' ? b.assignedLocation : 'ZZZ');
          comparison = sysA.localeCompare(sysB, undefined, { numeric: true, sensitivity: 'base' });
          break;
        }
        case 'category': {
          comparison = a.category.localeCompare(b.category);
          break;
        }
        case 'id': {
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        }
        case 'brand': {
          const brandA = `${a.brand} ${a.model}`;
          const brandB = `${b.brand} ${b.model}`;
          comparison = brandA.localeCompare(brandB);
          break;
        }
        case 'status': {
          comparison = a.status.localeCompare(b.status);
          break;
        }
        case 'location': {
          comparison = (a.assignedLocation || '').localeCompare(b.assignedLocation || '');
          break;
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [assets, searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Grouped by System for "by-system" view mode
  const assetsBySystem = useMemo<Record<string, SystemAssetGroup>>(() => {
    const grouped: Record<string, SystemAssetGroup> = {};

    filteredAndSortedAssets.forEach((asset) => {
      const key = asset.assignedSystemId || 'UNASSIGNED_SPARES';
      const label = asset.assignedSystemId
        ? `${asset.assignedSystemId} (${asset.assignedSystemName || 'Testing Station'})`
        : 'Spares & Store Room Reserves';
      const location = asset.assignedLocation || 'Central Storage / Rack A';

      if (!grouped[key]) {
        grouped[key] = {
          systemName: label,
          location,
          assets: []
        };
      }
      grouped[key].assets.push(asset);
    });

    return grouped;
  }, [filteredAndSortedAssets]);

  // Grouped by Category for "by-category" view mode
  const assetsByCategory = useMemo<Record<string, Asset[]>>(() => {
    const grouped: Record<string, Asset[]> = {};
    filteredAndSortedAssets.forEach((asset) => {
      if (!grouped[asset.category]) {
        grouped[asset.category] = [];
      }
      grouped[asset.category].push(asset);
    });
    return grouped;
  }, [filteredAndSortedAssets]);

  // Counts
  const assignedCount = assets.filter((a) => a.status === 'assigned').length;
  const availableCount = assets.filter((a) => a.status === 'available').length;
  const repairCount = assets.filter((a) => a.status === 'in_repair').length;
  const printerCount = assets.filter((a) => a.category === 'printer').length;

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catCode = newAssetCategory.slice(0, 3).toUpperCase();
    const tag = newAssetTag.trim() || `AST-${catCode}-${(assets.length + 1).toString().padStart(3, '0')}`;
    const brand = newAssetBrand.trim() || 'Standard';
    const model = newAssetModel.trim() || 'Hardware Unit';
    const serial = newAssetSerial.trim() || `SN-${catCode}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const systemId = newAssetSystem.trim() || undefined;
    const sysObj = systemId ? systems.find((s) => s.id === systemId) : undefined;
    const isAssigned = !!systemId;

    createAsset({
      id: tag,
      category: newAssetCategory,
      brand,
      model,
      serialNumber: serial,
      status: isAssigned ? 'assigned' : newAssetStatus,
      assignedSystemId: systemId,
      assignedSystemName: sysObj?.name,
      assignedLocation: newAssetLocation.trim() || (isAssigned ? `Testing Lab A - Booth ${systemId}` : 'IT Store Room / Reserve Spares'),
      purchaseDate: new Date().toISOString().slice(0, 10),
      warrantyExpiry: '2028-12-31',
      condition: newAssetCondition,
      notes: newAssetNotes.trim() || undefined
    });
    setAddAssetModalOpen(false);
    setNewAssetTag('');
    setNewAssetBrand('');
    setNewAssetModel('');
    setNewAssetSerial('');
    setNewAssetNotes('');
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAssetForTransfer) {
      const isStoreRoom = transferTargetSystem === 'STORE_ROOM';
      transferAsset(
        selectedAssetForTransfer.id,
        isStoreRoom ? undefined : transferTargetSystem,
        isStoreRoom ? 'Store Room / Spares Rack A' : `Testing Lab A - Booth ${transferTargetSystem}`,
        transferReason
      );
      setTransferModalOpen(false);
      setSelectedAssetForTransfer(null);
    }
  };

  const getCategoryBadgeInfo = (category: AssetCategory) => {
    switch (category) {
      case 'printer':
        return {
          icon: Printer,
          label: 'Printer',
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        };
      case 'computer':
        return {
          icon: Monitor,
          label: 'System / PC',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
      case 'monitor':
        return {
          icon: Tv,
          label: 'Monitor',
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'keyboard':
        return {
          icon: Keyboard,
          label: 'Keyboard',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
      case 'mouse':
        return {
          icon: Mouse,
          label: 'Mouse',
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
      case 'headset':
        return {
          icon: Headphones,
          label: 'Headset',
          bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
        };
      case 'camera':
        return {
          icon: Camera,
          label: 'Webcam',
          bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        };
      case 'cctv':
        return {
          icon: Video,
          label: 'CCTV',
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        };
      case 'switch':
        return {
          icon: Network,
          label: 'Switch',
          bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        };
      default:
        return {
          icon: Package,
          label: category.replace('_', ' '),
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        };
    }
  };

  const exportCsv = () => {
    const headers = ['Asset ID', 'Category', 'Brand', 'Model', 'Serial Number', 'Status', 'Assigned System', 'Location', 'Warranty'];
    const rows = filteredAndSortedAssets.map((a) => [
      a.id,
      a.category,
      a.brand,
      `"${a.model.replace(/"/g, '""')}"`,
      a.serialNumber,
      a.status,
      a.assignedSystemId || 'Unassigned',
      `"${(a.assignedLocation || '').replace(/"/g, '""')}"`,
      a.warrantyExpiry || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `assets_inventory_${currentCentre.id.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Hardware & Asset Management</h2>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
              {assets.length} Tracked Assets
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full lifecycle registry for testing systems, printers, monitors, peripherals, CCTV, and network switches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {assets.length > 0 && (
            <button
              onClick={() => setClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Clear all assets from this inventory list to start fresh"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>Clear Asset List</span>
            </button>
          )}

          <button
            onClick={exportCsv}
            disabled={assets.length === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-colors ${
              assets.length === 0
                ? 'text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer'
            }`}
            title="Export filtered assets as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('asset-movements')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Movement Audit Trail</span>
          </button>

          <button
            onClick={() => setIsPrinterDetailOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Open HP Laser MFP 1188fnw Network Telemetry & Diagnostics (192.168.29.91)"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Printer Monitor</span>
            {printerData?.isLive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Asset Manually</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Total Tracked Assets</span>
          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{assets.length} Units</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Across 10 Hardware Categories</span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-2xs bg-emerald-50/40 dark:bg-emerald-950/30">
          <span className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold uppercase">Deployed to Booths</span>
          <div className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-300">{assignedCount} Units</div>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Active in testing stations</span>
        </div>

        <div
          onClick={() => setIsPrinterDetailOpen(true)}
          className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 shadow-2xs bg-indigo-50/40 dark:bg-indigo-950/30 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all group select-none"
          title="Click to view HP Laser MFP 1188fnw Network Telemetry & Diagnostics"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-800 dark:text-indigo-400 font-semibold uppercase">Printers & Admin</span>
            <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-1 text-2xl font-black text-indigo-700 dark:text-indigo-300">{printerCount} Units</div>
          <div className="flex items-center justify-between text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
            <span>HP 1188fnw (192.168.29.91)</span>
            <span className="font-bold underline">Live Monitor →</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-2xs bg-blue-50/40 dark:bg-blue-950/30">
          <span className="text-xs text-blue-800 dark:text-blue-400 font-semibold uppercase">Store Room Reserves</span>
          <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-300">{availableCount} Units</div>
          <span className="text-[11px] text-blue-700/80 dark:text-blue-400/80">{repairCount} in repair bench</span>
        </div>
      </div>

      {/* VIEW MODE & DROPDOWN CONTROL BAR (Adaptable Setup & Sorting) */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Left: View Mode Segmented Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View all assets in a dense, adaptable table"
            >
              <LayoutList className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Adaptable Table</span>
            </button>

            <button
              onClick={() => {
                setViewMode('by-system');
                setSortBy('system');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'by-system'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Group assets by testing booth & workstation"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Group by System</span>
            </button>

            <button
              onClick={() => {
                setViewMode('by-category');
                setSortBy('category');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'by-category'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Group assets by equipment type (System, Printer, Monitor...)"
            >
              <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Group by Category</span>
            </button>
          </div>

          {/* Right: Primary Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search Tag, Serial, System, Brand, Model (e.g. Printer, W012, HP)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>
        </div>

        {/* Second Row: Specific Dropdowns for Sorting & Filtering */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium cursor-pointer focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">All Equipment ({assets.length})</option>
                <option value="computer">Systems & PCs ({assets.filter((a) => a.category === 'computer').length})</option>
                <option value="printer">Printers ({assets.filter((a) => a.category === 'printer').length})</option>
                <option value="monitor">Monitors ({assets.filter((a) => a.category === 'monitor').length})</option>
                <option value="keyboard">Keyboards ({assets.filter((a) => a.category === 'keyboard').length})</option>
                <option value="mouse">Mice ({assets.filter((a) => a.category === 'mouse').length})</option>
                <option value="camera">Webcams ({assets.filter((a) => a.category === 'camera').length})</option>
                <option value="headset">Headsets ({assets.filter((a) => a.category === 'headset').length})</option>
                <option value="switch">Switches & Racks ({assets.filter((a) => a.category === 'switch').length})</option>
                <option value="cctv">CCTV Cameras ({assets.filter((a) => a.category === 'cctv').length})</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium cursor-pointer focus:ring-1 focus:ring-emerald-700"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned to Booth / System</option>
                <option value="available">Available in Store Room</option>
                <option value="in_repair">Under Repair / Inspection</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            {/* SORT BY DROPDOWN: User specifically requested "sort by system,printer etc" */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as AssetSortField)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold cursor-pointer focus:ring-1 focus:ring-emerald-700"
              >
                <option value="system">Assigned System (W001 → W036, Admin, Spares)</option>
                <option value="category">Category (System, Printer, Monitor, etc.)</option>
                <option value="id">Asset Tag ID (AST-...)</option>
                <option value="brand">Brand & Model</option>
                <option value="status">Allocation Status</option>
                <option value="location">Physical Location</option>
              </select>

              {/* Ascending / Descending Toggle */}
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title={`Current order: ${sortOrder.toUpperCase()}. Click to reverse.`}
              >
                {sortOrder === 'asc' ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-[10px] font-mono">ASC</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-[10px] font-mono">DESC</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredAndSortedAssets.length}</span> of {assets.length} assets
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count =
              cat.key === 'all'
                ? assets.length
                : assets.filter((a) => a.category === cat.key).length;

            return (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 ${
                  categoryFilter === cat.key
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    categoryFilter === cat.key ? 'bg-emerald-950 dark:bg-emerald-950/80 text-emerald-200 dark:text-emerald-300' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: ADAPTABLE TABLE SETUP (Dense, Sortable Headers, Quick Actions)
          ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 select-none">
                <tr>
                  {/* Asset Tag Header */}
                  <th
                    onClick={() => toggleSort('id')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Click to sort by Asset Tag"
                  >
                    <div className="flex items-center gap-1">
                      <span>Asset Tag</span>
                      {sortBy === 'id' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </th>

                  {/* Category Header */}
                  <th
                    onClick={() => toggleSort('category')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Click to sort by Category (System, Printer, etc.)"
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      {sortBy === 'category' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </th>

                  {/* Brand & Model Header */}
                  <th
                    onClick={() => toggleSort('brand')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Click to sort by Brand & Model"
                  >
                    <div className="flex items-center gap-1">
                      <span>Brand & Model</span>
                      {sortBy === 'brand' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </th>

                  {/* Serial Number */}
                  <th className="px-4 py-3">Serial Number</th>

                  {/* Status Header */}
                  <th
                    onClick={() => toggleSort('status')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Click to sort by Status"
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortBy === 'status' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </th>

                  {/* Assigned System / Location Header */}
                  <th
                    onClick={() => toggleSort('system')}
                    className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Click to sort by Assigned System / Booth"
                  >
                    <div className="flex items-center gap-1">
                      <span>Assigned System / Location</span>
                      {sortBy === 'system' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  </th>

                  <th className="px-4 py-3">Warranty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSortedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <Package className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block">
                            {assets.length === 0 ? 'Asset Inventory is Empty' : 'No assets match the selected filters'}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                            {assets.length === 0
                              ? 'All pre-loaded assets have been cleared from the inventory list. You can now add your equipment manually.'
                              : 'Try adjusting your search keywords or category filters.'}
                          </p>
                        </div>
                        {assets.length === 0 ? (
                          <button
                            onClick={() => openAddModal()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer mt-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Add Asset Manually</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCategoryFilter('all');
                              setStatusFilter('all');
                              setSearchQuery('');
                            }}
                            className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline font-semibold"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedAssets.map((asset) => {
                    const badge = getCategoryBadgeInfo(asset.category);
                    const CategoryIcon = badge.icon;
                    return (
                      <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                        {/* Tag */}
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          {asset.id}
                        </td>

                        {/* Category Badge */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold border ${badge.bg}`}>
                            <CategoryIcon className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Brand & Model */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {asset.brand} {asset.model}
                          </div>
                          {asset.notes && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs">
                              {asset.notes}
                            </div>
                          )}
                        </td>

                        {/* Serial */}
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {asset.serialNumber}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={asset.status} size="sm" />
                        </td>

                        {/* Assigned System / Location */}
                        <td className="px-4 py-3">
                          {asset.assignedSystemId ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => navigate('system-detail', asset.assignedSystemId)}
                                className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline font-mono text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <span>{asset.assignedSystemId}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                                ({asset.assignedSystemName || asset.assignedLocation})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
                              {asset.assignedLocation || 'Store Room / Spare'}
                            </span>
                          )}
                        </td>

                        {/* Warranty */}
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          {asset.warrantyExpiry || '2027-12-31'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAssetForTransfer(asset);
                                setTransferModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors cursor-pointer"
                              title="Reassign or transfer asset location"
                            >
                              <ArrowLeftRight className="w-3 h-3" />
                              <span>Transfer</span>
                            </button>
                            <button
                              onClick={() => setAssetToDelete(asset)}
                              className="inline-flex items-center p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete asset from inventory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: GROUPED BY SYSTEM (Workstation-Centric Asset Bundles)
          ========================================================================= */}
      {viewMode === 'by-system' && (
        <div className="space-y-4">
          {assets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No System Asset Groups</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                All equipment has been cleared from inventory. Add hardware assets manually and assign them to booths (W001–W036) to group by system.
              </p>
              <button
                onClick={() => openAddModal('computer')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Asset Manually</span>
              </button>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
                <span className="font-semibold">
                  Grouping assets by assigned Workstation, Proctor Room, and Reserve Spares.
                </span>
                <span className="font-mono text-[11px] font-bold">
                  {Object.keys(assetsBySystem).length} System Groups
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(assetsBySystem) as [string, SystemAssetGroup][]).map(([sysId, group]) => {
              const isUnassigned = sysId === 'UNASSIGNED_SPARES';
              return (
                <div
                  key={sysId}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-2xs flex flex-col justify-between ${
                    isUnassigned ? 'border-amber-200 dark:border-amber-800/60 bg-amber-50/10 dark:bg-amber-950/10' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                          {isUnassigned ? '📦 Store Room Spares' : sysId}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {group.systemName}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
                        {group.assets.length} Assets
                      </span>
                    </div>

                    {/* Asset Items List */}
                    <div className="mt-3 space-y-2">
                      {group.assets.map((asset) => {
                        const badge = getCategoryBadgeInfo(asset.category);
                        const Icon = badge.icon;
                        return (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className={`p-1.5 rounded-md border ${badge.bg}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <div className="truncate">
                                <div className="font-semibold text-slate-900 dark:text-white truncate">
                                  {asset.brand} {asset.model}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                  {asset.id} • SN: {asset.serialNumber}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedAssetForTransfer(asset);
                                  setTransferModalOpen(true);
                                }}
                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors"
                                title="Transfer asset"
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setAssetToDelete(asset)}
                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                title="Delete asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {!isUnassigned && (
                    <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{group.location}</span>
                      <button
                        onClick={() => navigate('system-detail', sysId)}
                        className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Workstation</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 3: GROUPED BY CATEGORY (Systems, Printers, Monitors, Peripherals)
          ========================================================================= */}
      {viewMode === 'by-category' && (
        <div className="space-y-6">
          {assets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Category Groups</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                The hardware registry is clear. Use the manual entry form to start adding workstations, printers, monitors, or peripherals.
              </p>
              <button
                onClick={() => openAddModal()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Asset Manually</span>
              </button>
            </div>
          ) : (
            (Object.entries(assetsByCategory) as [string, Asset[]][]).map(([catKey, items]) => {
            const badge = getCategoryBadgeInfo(catKey as AssetCategory);
            const Icon = badge.icon;
            return (
              <div key={catKey} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${badge.bg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {badge.label} Equipment
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {items.length} units registered
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300">
                    {items.filter((i) => i.status === 'assigned').length} Assigned • {items.filter((i) => i.status === 'available').length} Spares
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Asset Tag</th>
                        <th className="px-4 py-2.5">Brand & Model</th>
                        <th className="px-4 py-2.5">Serial Number</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Assigned System / Location</th>
                        <th className="px-4 py-2.5">Warranty</th>
                        <th className="px-4 py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {items.map((asset) => (
                        <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors">
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900 dark:text-white">
                            {asset.id}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-semibold text-slate-900 dark:text-white">{asset.brand} {asset.model}</span>
                            {asset.notes && <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-sm">{asset.notes}</span>}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {asset.serialNumber}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge status={asset.status} size="sm" />
                          </td>
                          <td className="px-4 py-2.5 font-mono text-slate-700 dark:text-slate-300">
                            {asset.assignedSystemId ? (
                              <button
                                onClick={() => navigate('system-detail', asset.assignedSystemId)}
                                className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline"
                              >
                                {asset.assignedSystemId} ({asset.assignedSystemName})
                              </button>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">{asset.assignedLocation}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {asset.warrantyExpiry || '2027-12-31'}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedAssetForTransfer(asset);
                                  setTransferModalOpen(true);
                                }}
                                className="px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded transition-colors"
                              >
                                Transfer →
                              </button>
                              <button
                                onClick={() => setAssetToDelete(asset)}
                                className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                title="Delete asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }))}
        </div>
      )}

      {/* MODAL: Register Asset Manually */}
      <Modal
        isOpen={isAddAssetModalOpen}
        onClose={() => setAddAssetModalOpen(false)}
        title="Add Hardware Asset Manually"
        subtitle={`Register equipment and serial tags directly into ${currentCentre.name} inventory`}
      >
        <form onSubmit={handleAddAssetSubmit} className="space-y-4 text-xs">
          {/* Category Selector with Quick Icons */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Asset Category</label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {(
                [
                  { key: 'computer', label: 'PC System', icon: Monitor },
                  { key: 'printer', label: 'Printer', icon: Printer },
                  { key: 'monitor', label: 'Monitor', icon: Tv },
                  { key: 'keyboard', label: 'Keyboard', icon: Keyboard },
                  { key: 'mouse', label: 'Mouse', icon: Mouse },
                  { key: 'headset', label: 'Headset', icon: Headphones },
                  { key: 'camera', label: 'Webcam', icon: Camera },
                  { key: 'switch', label: 'Switch', icon: Network },
                  { key: 'cctv', label: 'CCTV', icon: Video },
                  { key: 'cable', label: 'Cable', icon: Cable }
                ] as const
              ).map((item) => {
                const ItemIcon = item.icon;
                const isSelected = newAssetCategory === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleCategorySelectChange(item.key as AssetCategory)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <ItemIcon className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="text-[10px] leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Asset Tag ID</label>
                <button
                  type="button"
                  onClick={() => regenerateTag()}
                  className="text-[10px] text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  title="Auto-suggest sequential tag ID"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Auto-Suggest</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. AST-CMP-001"
                value={newAssetTag}
                onChange={(e) => setNewAssetTag(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono font-semibold focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Hardware Serial Number</label>
                <button
                  type="button"
                  onClick={() => generateNewSerial()}
                  className="text-[10px] text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
                  title="Generate a random serial number"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. SN-CMP-8492014"
                value={newAssetSerial}
                onChange={(e) => setNewAssetSerial(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Brand & Model */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Brand / Manufacturer</label>
              <input
                type="text"
                required
                placeholder="e.g. Dell, HP, Logitech, BenQ"
                value={newAssetBrand}
                onChange={(e) => setNewAssetBrand(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {/* Quick Brand Pills */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {['Dell', 'HP', 'Logitech', 'BenQ', 'Cisco', 'Lenovo', 'Brother'].map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setNewAssetBrand(brand)}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Model Name / Spec</label>
              <input
                type="text"
                required
                placeholder="e.g. OptiPlex 7090 Micro, GW2480"
                value={newAssetModel}
                onChange={(e) => setNewAssetModel(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Deployment & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Deploy to Workstation / System</label>
              <select
                value={newAssetSystem}
                onChange={(e) => handleSystemAllocationChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono font-medium focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500"
              >
                <option value="">Store Room (Unassigned Spare Inventory)</option>
                <optgroup label="Testing Lab A - Booths">
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} ({s.name})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location Description</label>
              <input
                type="text"
                value={newAssetLocation}
                onChange={(e) => setNewAssetLocation(e.target.value)}
                placeholder="e.g. Testing Lab A - Booth W001"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Status & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Allocation Status</label>
              <select
                value={newAssetStatus}
                onChange={(e) => setNewAssetStatus(e.target.value as AssetStatus)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 capitalize"
              >
                <option value="available">Available (In Store Room)</option>
                <option value="assigned">Assigned (Active on Station)</option>
                <option value="in_repair">Under Repair / Maintenance</option>
                <option value="retired">Retired / Decommissioned</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Hardware Condition</label>
              <select
                value={newAssetCondition}
                onChange={(e) => setNewAssetCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 capitalize"
              >
                <option value="excellent">Excellent - Brand New / Fully Inspected</option>
                <option value="good">Good - Working Normally</option>
                <option value="fair">Fair - Minor Wear, Operational</option>
                <option value="poor">Poor - Needs Service</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Specifications (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Core i5-11500T, 16GB RAM, 512GB NVMe SSD"
              value={newAssetNotes}
              onChange={(e) => setNewAssetNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddAssetModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
            >
              + Save Asset to Inventory
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Clear All Assets Confirmation */}
      <Modal
        isOpen={isClearAllModalOpen}
        onClose={() => setClearAllModalOpen(false)}
        title="Clear Asset Inventory?"
        subtitle="This operation only removes items from the hardware asset list"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-rose-900 dark:text-rose-200 block text-sm">
                Confirm clearing all {assets.length} hardware assets
              </span>
              <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                All equipment entries in this inventory list will be removed so you can add physical hardware assets manually.
                Workstation booths (W001–W036), testing software, and proctor delivery configurations remain completely untouched.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setClearAllModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearAllAssets();
                setClearAllModalOpen(false);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
            >
              Clear All Assets
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Delete Single Asset Confirmation */}
      {assetToDelete && (
        <Modal
          isOpen={!!assetToDelete}
          onClose={() => setAssetToDelete(null)}
          title={`Remove Asset: ${assetToDelete.id}`}
          subtitle={`${assetToDelete.brand} ${assetToDelete.model} (SN: ${assetToDelete.serialNumber})`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white font-mono">{assetToDelete.id}</strong> from the inventory list?
              {assetToDelete.assignedSystemId && (
                <span> It is currently mapped to workstation booth <strong className="text-slate-900 dark:text-white">{assetToDelete.assignedSystemId}</strong>.</span>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAsset(assetToDelete.id);
                  setAssetToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
              >
                Delete Asset
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Transfer Asset */}
      {selectedAssetForTransfer && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          title={`Transfer Asset: ${selectedAssetForTransfer.id}`}
          subtitle={`${selectedAssetForTransfer.brand} ${selectedAssetForTransfer.model} (SN: ${selectedAssetForTransfer.serialNumber})`}
        >
          <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Current Allocation:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedAssetForTransfer.assignedSystemId
                  ? `${selectedAssetForTransfer.assignedSystemId} (${selectedAssetForTransfer.assignedSystemName})`
                  : selectedAssetForTransfer.assignedLocation}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transfer Destination</label>
                <select
                  value={transferTargetSystem}
                  onChange={(e) => setTransferTargetSystem(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono font-semibold"
                >
                  <option value="STORE_ROOM">Store Room (Reserve Spare)</option>
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
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400"
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
                placeholder="e.g. Swapped hardware for testing session delivery"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
              >
                Execute Asset Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}

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

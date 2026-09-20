import React, { useState } from 'react';
import { QrCode, Printer, Check, Copy, X, Shield, Laptop, Monitor, Cpu } from 'lucide-react';
import { SystemRecord } from '../../types';

interface PrintQRModalProps {
  system: SystemRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintQRModal: React.FC<PrintQRModalProps> = ({ system, isOpen, onClose }) => {
  const [activeLabel, setActiveLabel] = useState<'workstation' | 'cpu' | 'monitor'>('workstation');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getQRData = () => {
    switch (activeLabel) {
      case 'workstation':
        return `https://fets.space/scan?sys=${system.id}&centre=${system.centreId}`;
      case 'cpu':
        return `https://fets.space/scan?asset=AST-CMP-${system.id}&sys=${system.id}`;
      case 'monitor':
        return `https://fets.space/scan?asset=AST-MON-${system.id}&sys=${system.id}`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(getQRData());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">System QR Label Generator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {system.id} ({system.name}) • {system.centreName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Label Selector Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveLabel('workstation')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeLabel === 'workstation'
                ? 'border-emerald-700 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/40'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Workstation QR</span>
          </button>
          <button
            onClick={() => setActiveLabel('cpu')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeLabel === 'cpu'
                ? 'border-emerald-700 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/40'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU Chassis QR</span>
          </button>
          <button
            onClick={() => setActiveLabel('monitor')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              activeLabel === 'monitor'
                ? 'border-emerald-700 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/40'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Monitor QR</span>
          </button>
        </div>

        {/* Printable Card Preview */}
        <div className="p-6 flex flex-col items-center">
          <div
            id="printable-qr-card"
            className="w-72 bg-white rounded-xl border-2 border-slate-900 p-4 shadow-sm flex flex-col items-center text-center relative"
          >
            {/* Playing Card Inset Line */}
            <div className="absolute inset-1.5 border border-slate-300 rounded-lg pointer-events-none" />

            {/* Header Badge */}
            <div className="flex items-center justify-between w-full px-1 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                FETS SPACE
              </span>
              <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                SECURE ASSET
              </span>
            </div>

            {/* QR Code SVG / Visual */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg my-2 shadow-2xs">
              <svg
                viewBox="0 0 100 100"
                className="w-32 h-32 text-slate-900"
                fill="currentColor"
              >
                {/* Clean QR code geometric representation */}
                <rect x="5" y="5" width="28" height="28" rx="2" fill="#0f172a" />
                <rect x="11" y="11" width="16" height="16" fill="#fff" />
                <rect x="15" y="15" width="8" height="8" fill="#0f172a" />

                <rect x="67" y="5" width="28" height="28" rx="2" fill="#0f172a" />
                <rect x="73" y="11" width="16" height="16" fill="#fff" />
                <rect x="77" y="15" width="8" height="8" fill="#0f172a" />

                <rect x="5" y="67" width="28" height="28" rx="2" fill="#0f172a" />
                <rect x="11" y="73" width="16" height="16" fill="#fff" />
                <rect x="15" y="77" width="8" height="8" fill="#0f172a" />

                {/* Data Modules */}
                <rect x="40" y="8" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="8" width="6" height="6" fill="#0f172a" />
                <rect x="40" y="20" width="18" height="6" fill="#0f172a" />
                <rect x="8" y="42" width="6" height="18" fill="#0f172a" />
                <rect x="20" y="42" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="42" width="16" height="16" rx="2" fill="#15803d" />
                <circle cx="50" cy="50" r="4" fill="#fff" />
                <rect x="68" y="42" width="10" height="6" fill="#0f172a" />
                <rect x="84" y="42" width="8" height="14" fill="#0f172a" />
                <rect x="40" y="68" width="8" height="6" fill="#0f172a" />
                <rect x="54" y="68" width="6" height="14" fill="#0f172a" />
                <rect x="72" y="68" width="12" height="6" fill="#0f172a" />
                <rect x="40" y="84" width="20" height="8" fill="#0f172a" />
                <rect x="70" y="82" width="18" height="10" fill="#0f172a" />
              </svg>
            </div>

            {/* Target ID & Details */}
            <div className="text-base font-black text-slate-900 tracking-tight mt-1">
              {system.id}
            </div>
            <div className="text-xs font-semibold text-slate-600 font-mono">
              {activeLabel === 'workstation' && system.name}
              {activeLabel === 'cpu' && `AST-CMP-${system.id} • ${system.hardware.processor.split(' ')[0] || 'Intel'}`}
              {activeLabel === 'monitor' && `AST-MON-${system.id} • ${system.hardware.monitorModel.split(' ')[0] || 'BENQ'}`}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {system.centreName} • IP: {system.network.ipAddress}
            </div>
            <div className="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded mt-2 border border-emerald-100">
              Scan to view system, report issue, or audit
            </div>
          </div>

          {/* Direct URL */}
          <div className="mt-4 flex items-center gap-2 w-full max-w-sm">
            <input
              type="text"
              readOnly
              value={getQRData()}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-slate-200/50 dark:border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Format: 3" x 2" Weatherproof Vinyl Sticker</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

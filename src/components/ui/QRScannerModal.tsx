import React, { useState } from 'react';
import { QrCode, Camera, Search, X, CheckCircle2, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemRecord } from '../../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem?: (system: SystemRecord) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectSystem
}) => {
  const { systems, setSelectedSystem, navigate } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [detectedSystem, setDetectedSystem] = useState<SystemRecord | null>(null);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (systemId: string) => {
    const sys = systems.find(
      (s) => s.id.toLowerCase() === systemId.toLowerCase() || s.name.toLowerCase() === systemId.toLowerCase()
    );
    if (sys) {
      setDetectedSystem(sys);
      setScanFeedback(`Decoded QR: ${sys.id} (${sys.name})`);
    } else {
      setScanFeedback(`No system found for identifier: ${systemId}`);
    }
  };

  const handleConfirmSystem = (sys: SystemRecord) => {
    if (onSelectSystem) {
      onSelectSystem(sys);
    } else {
      setSelectedSystem(sys);
      navigate('system-detail');
    }
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleSimulateScan(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">QR Code Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan workstation or peripheral asset sticker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Simulation Viewport */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-64 h-64 bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex flex-col items-center justify-center border-2 border-slate-800">
            {/* Viewfinder Reticle */}
            <div className="absolute inset-8 border-2 border-emerald-500/80 rounded-xl pointer-events-none">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
            </div>

            {/* Scanning Laser Line */}
            {isScanning && (
              <div className="absolute inset-x-8 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-[bounce_2s_infinite]" />
            )}

            <div className="text-center p-4 z-10">
              <Camera className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Align QR tag inside frame</p>
              <p className="text-[10px] text-slate-500 mt-1">High-resolution autofocus active</p>
            </div>

            {/* Quick test buttons for simulator */}
            <div className="absolute bottom-2 inset-x-2 flex justify-center gap-1 z-20">
              <button
                type="button"
                onClick={() => handleSimulateScan('W001')}
                className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/80 text-slate-300 rounded hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
              >
                Scan W001
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan('W014')}
                className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/80 text-slate-300 rounded hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
              >
                Scan W014
              </button>
              <button
                type="button"
                onClick={() => handleSimulateScan('W005')}
                className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/80 text-slate-300 rounded hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
              >
                Scan W005
              </button>
            </div>
          </div>

          {/* Detected System Card */}
          {detectedSystem && (
            <div className="w-full mt-4 p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-950 dark:text-emerald-200 font-mono">
                    {detectedSystem.id}
                  </span>
                  <span className="text-xs text-emerald-800 dark:text-emerald-300 font-mono">({detectedSystem.name})</span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  Status: {detectedSystem.status.toUpperCase()} • IP: {detectedSystem.network.ipAddress}
                </div>
              </div>
              <button
                onClick={() => handleConfirmSystem(detectedSystem)}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Inspect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {scanFeedback && !detectedSystem && (
            <div className="w-full mt-3 p-2 text-center text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{scanFeedback}</span>
            </div>
          )}

          {/* Manual Input Fallback */}
          <form onSubmit={handleManualSubmit} className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Manual System or Asset ID Input
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. W001, 4960-T001, AST-MON-014"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Encrypted TCA Barcode Protocol</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

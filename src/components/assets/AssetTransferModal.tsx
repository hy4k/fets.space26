import React, { useState } from 'react';
import { ArrowLeftRight, X, Check, Shield, Laptop, Monitor, Keyboard, Mouse, Camera, Headphones } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemRecord, Asset } from '../../types';

interface AssetTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceSystem?: SystemRecord | null;
}

export const AssetTransferModal: React.FC<AssetTransferModalProps> = ({
  isOpen,
  onClose,
  sourceSystem
}) => {
  const { systems, assets, moveAsset } = useApp();
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [targetSystemId, setTargetSystemId] = useState<string>('STORE');
  const [reason, setReason] = useState<string>('Replacement for reported hardware defect');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter available assets from sourceSystem or all assets
  const availableAssets = sourceSystem
    ? assets.filter(
        (a) =>
          a.assignedSystemId === sourceSystem.id ||
          sourceSystem.assignedAssetIds?.includes(a.id)
      )
    : assets;

  const currentAsset = assets.find((a) => a.id === selectedAssetId);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    const toSys = systems.find((s) => s.id === targetSystemId);
    const toSysId = targetSystemId === 'STORE' ? undefined : targetSystemId;
    const toSysName = targetSystemId === 'STORE' ? undefined : toSys?.name;
    const toLocation =
      targetSystemId === 'STORE'
        ? 'IT Store Room'
        : `Testing Lab A - Booth ${targetSystemId.replace('W', '')}`;

    const fromSys = systems.find((s) => s.id === sourceSystem?.id);

    moveAsset({
      assetId: selectedAssetId,
      toSystemId: toSysId,
      toSystemName: toSysName,
      toLocation,
      reason,
      movedBy: 'Lazeem M. (Admin / TCA)'
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hardware Asset Transfer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sourceSystem ? `Transferring from ${sourceSystem.id}` : 'Reassign asset custody'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Asset Successfully Transferred</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit log recorded and system registry updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="p-6 space-y-4 text-xs">
            {/* Asset to Move */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Asset to Move
              </label>
              <select
                required
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500"
              >
                <option value="">-- Choose Asset --</option>
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} • {asset.brand} {asset.model} (SN: {asset.serialNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Destination / Workstation
              </label>
              <select
                value={targetSystemId}
                onChange={(e) => setTargetSystemId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500"
              >
                <option value="STORE">IT Store Room (Spare Inventory)</option>
                <optgroup label="Testing Booth Workstations">
                  {systems
                    .filter((s) => s.id !== sourceSystem?.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id} — {s.name} ({s.status})
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Transfer Reason</label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Monitor replacement, sticky key, routine rotation"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 dark:focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Custody Signature Note */}
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
              <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span>
                Asset movement will be recorded in the immutable audit trail with timestamp and TCA credentials.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedAssetId}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Complete Transfer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Printer,
  Globe,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Activity,
  Send,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import {
  PrinterTelemetry,
  PortProbeResult,
  PrinterState,
  PrinterMonitoringConfig
} from '../../types';

interface PrinterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  printerData: PrinterTelemetry | null;
  isLoading?: boolean;
  timeAgoText?: string;
  isProbing?: boolean;
  isPrintingTest?: boolean;
  onRefresh?: () => Promise<void>;
  onProbe?: (ip?: string, ports?: number[]) => Promise<PortProbeResult[]>;
  onSendTestPrint?: () => Promise<{ success: boolean; message: string; jobId?: string }>;
  onSimulateState?: (state: PrinterState) => Promise<void>;
  onUpdateConfig?: (config: Partial<PrinterMonitoringConfig>) => Promise<void>;
}

export const PrinterDetailModal: React.FC<PrinterDetailModalProps> = ({
  isOpen,
  onClose,
  printerData,
  isLoading = false,
  isPrintingTest = false,
  onRefresh,
  onSendTestPrint
}) => {
  const [testPrintFeedback, setTestPrintFeedback] = useState<string | null>(null);

  const ip = printerData?.ipAddress || '192.168.29.91';
  const state = printerData?.printerState || 'READY';
  const health = printerData?.healthStatus || 'OPERATIONAL';
  const rawToner = printerData?.toner?.levelPercent;
  const isTonerAvailable = typeof rawToner === 'number' && !Number.isNaN(rawToner);
  const tonerLevel = isTonerAvailable ? rawToner : null;
  const location = printerData?.location?.split('/')[0]?.trim() || 'Control Desk';

  const handleTestPrint = async () => {
    if (!onSendTestPrint) return;
    const res = await onSendTestPrint();
    setTestPrintFeedback(res.message);
    setTimeout(() => setTestPrintFeedback(null), 4000);
  };

  const getStatusBadge = () => {
    if (health === 'OFFLINE' || printerData?.networkStatus === 'DISCONNECTED') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Offline</span>
        </span>
      );
    }
    if (state === 'PAPER_JAM' || health === 'CRITICAL') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 animate-pulse">
          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Paper Jam</span>
        </span>
      );
    }
    if (state === 'PAPER_EMPTY') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>Out of Paper</span>
        </span>
      );
    }
    if (state === 'PRINTING') {
      return (
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-800 dark:text-blue-300">
          <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />
          <span>Printing</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Ready</span>
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <div className="space-y-4 -mt-2">
        {/* Header: Printer identity & status */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {printerData?.name || 'HP Laser MFP 1188fnw'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {location} • IP: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{ip}</span>
              </p>
            </div>
          </div>
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Feedback Alert if test print sent */}
        {testPrintFeedback && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{testPrintFeedback}</span>
            </div>
            <button
              onClick={() => setTestPrintFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 text-xs font-bold px-1"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Attention Alert if error present */}
        {printerData?.errorMessages && printerData.errorMessages.length > 0 && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold">Attention Required:</div>
              {printerData.errorMessages.map((msg, i) => (
                <div key={i} className="text-rose-800 dark:text-rose-300">{msg}</div>
              ))}
            </div>
          </div>
        )}

        {/* Essential Info Grid: Status, Toner, Paper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Toner Level */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Toner Level</span>
              <span className={`font-bold font-mono ${
                (tonerLevel ?? 0) <= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}>
                {isTonerAvailable ? `${tonerLevel}%` : 'Normal'}
              </span>
            </div>
            {isTonerAvailable && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    (tonerLevel ?? 0) <= 15 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-500'
                  }`}
                  style={{ width: `${tonerLevel}%` }}
                />
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTonerAvailable && (tonerLevel ?? 0) <= 15
                ? 'Low toner — replace cartridge soon'
                : 'Cartridge level sufficient for exam rosters'}
            </p>
          </div>

          {/* Paper Tray */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>Paper Tray (Tray 1)</span>
              <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-300">A4 Plain</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {state === 'PAPER_EMPTY' || printerData?.trays?.[0]?.status === 'EMPTY'
                ? 'Out of Paper'
                : state === 'PAPER_JAM' || printerData?.trays?.[0]?.status === 'JAMMED'
                ? 'Paper Jam'
                : 'Loaded & Ready'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {state === 'PAPER_EMPTY' ? 'Please load A4 paper into Tray 1' : 'Ready for printing admit cards & rosters'}
            </p>
          </div>
        </div>

        {/* Action Buttons: Only essential controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href={`http://${ip}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Open Web Interface</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Refresh printer status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
                <span>Refresh</span>
              </button>
            )}

            {onSendTestPrint && (
              <button
                onClick={handleTestPrint}
                disabled={isPrintingTest || state === 'PAPER_JAM' || state === 'PAPER_EMPTY'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isPrintingTest ? 'animate-pulse' : ''}`} />
                <span>{isPrintingTest ? 'Printing...' : 'Print Test Page'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

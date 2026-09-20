import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';
import { SystemRecord } from '../../types';
import { SystemCard } from './SystemCard';
import { SystemCardBack } from './SystemCardBack';

interface CardFlipModalProps {
  system: SystemRecord | null;
  allSystems: SystemRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSystem: (system: SystemRecord) => void;
  onRunAudit: (system: SystemRecord) => void;
  onReportIssue: (system: SystemRecord) => void;
  onPrintQR: (system: SystemRecord) => void;
  onTransferAsset?: (system: SystemRecord) => void;
  onEditSystem?: (system: SystemRecord) => void;
}

export const CardFlipModal: React.FC<CardFlipModalProps> = ({
  system,
  allSystems,
  isOpen,
  onClose,
  onSelectSystem,
  onRunAudit,
  onReportIssue,
  onPrintQR,
  onTransferAsset,
  onEditSystem
}) => {
  // When opened, we start flipped to the detail back, or user can toggle flip
  const [isFlipped, setIsFlipped] = useState(true);

  // Reset flip state when system changes
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(true);
    }
  }, [system?.id, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !system) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToNextSystem(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToNextSystem(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, system, allSystems]);

  if (!isOpen || !system) return null;

  const currentIndex = allSystems.findIndex((s) => s.id === system.id);

  const navigateToNextSystem = (delta: number) => {
    if (allSystems.length === 0) return;
    let nextIndex = currentIndex + delta;
    if (nextIndex < 0) nextIndex = allSystems.length - 1;
    if (nextIndex >= allSystems.length) nextIndex = 0;
    onSelectSystem(allSystems[nextIndex]);
  };

  return (
    <div
      id="card-flip-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Left Navigation Chevron */}
      <button
        type="button"
        onClick={() => navigateToNextSystem(-1)}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-750 shadow-lg border border-slate-200 dark:border-slate-700 items-center justify-center transition-all cursor-pointer z-50"
        title="Previous System Card (Left Arrow)"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right Navigation Chevron */}
      <button
        type="button"
        onClick={() => navigateToNextSystem(1)}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-750 shadow-lg border border-slate-200 dark:border-slate-700 items-center justify-center transition-all cursor-pointer z-50"
        title="Next System Card (Right Arrow)"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 3D Flip Container with Perspective */}
      <div
        className="w-full max-w-3xl perspective-1500 flex items-center justify-center"
        style={{ perspective: '1500px' }}
      >
        <motion.div
          className="w-full preserve-3d relative"
          style={{
            transformStyle: 'preserve-3d'
          }}
          initial={{ rotateY: 0, scale: 0.94, opacity: 0.8 }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
            scale: 1,
            opacity: 1
          }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          {/* FRONT FACE OF CARD (When not flipped) */}
          <div
            className="w-full flex justify-center backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: isFlipped ? 'none' : 'flex'
            }}
          >
            <div className="w-full max-w-xs sm:max-w-sm">
              <SystemCard
                system={system}
                onClick={() => setIsFlipped(true)}
                onQuickAudit={onRunAudit}
                onReportIssue={onReportIssue}
                onPrintQR={onPrintQR}
                onEditSystem={onEditSystem}
              />
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-sm transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Flip to Detail View</span>
                </button>
              </div>
            </div>
          </div>

          {/* BACK FACE OF CARD (Detail View - rotateY 180deg) */}
          <div
            className="w-full backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: isFlipped ? 'block' : 'none'
            }}
          >
            <SystemCardBack
              system={system}
              onClose={onClose}
              onFlipBack={() => setIsFlipped(false)}
              onRunAudit={onRunAudit}
              onReportIssue={onReportIssue}
              onPrintQR={onPrintQR}
              onTransferAsset={onTransferAsset}
              onEditSystem={onEditSystem}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

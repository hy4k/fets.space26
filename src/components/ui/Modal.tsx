import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | string;
  hideHeader?: boolean;
  contentPadding?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title = '',
  subtitle,
  children,
  maxWidth = '2xl',
  hideHeader = false,
  contentPadding
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthMap: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    'max-w-sm': 'max-w-sm',
    'max-w-md': 'max-w-md',
    'max-w-lg': 'max-w-lg',
    'max-w-xl': 'max-w-xl',
    'max-w-2xl': 'max-w-2xl',
    'max-w-3xl': 'max-w-3xl',
    'max-w-4xl': 'max-w-4xl',
    'max-w-5xl': 'max-w-5xl'
  };

  const resolvedMaxWidth = maxWidthMap[maxWidth] || (maxWidth.startsWith('max-w-') ? maxWidth : 'max-w-2xl');

  const modalNode = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${resolvedMaxWidth} bg-white dark:bg-[#0E1015] rounded-2xl shadow-2xl border border-stone-200/90 dark:border-[#2C2417] z-10 overflow-hidden my-auto mx-auto ring-1 ring-black/5 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-[#12141A]/90 gap-4 shrink-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-[#FAF7F2] truncate tracking-tight" title={title}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate" title={subtitle}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`${contentPadding || 'p-5 sm:p-6'} overflow-y-auto text-stone-900 dark:text-stone-100 flex-1`}>
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : null;
};

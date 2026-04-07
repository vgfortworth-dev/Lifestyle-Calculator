import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

type ModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  footerLabel?: string;
  labelledBy: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  closeButtonClassName?: string;
  bodyClassName?: string;
};

export function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  footerLabel,
  labelledBy,
  children,
  maxWidthClassName = 'max-w-2xl',
  headerClassName = 'border-b border-slate-100 bg-slate-50 text-slate-900',
  titleClassName = 'text-2xl font-black text-slate-900',
  subtitleClassName = 'mt-1 text-sm font-bold uppercase tracking-widest text-[#3372B2]',
  closeButtonClassName = 'rounded-full p-2 text-slate-400 transition-all hover:bg-white hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200',
  bodyClassName = 'max-h-[65vh] overflow-y-auto p-6 sm:p-8',
}: ModalShellProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`max-h-[90vh] w-full overflow-hidden rounded-3xl bg-white shadow-2xl ${maxWidthClassName}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={`flex items-start justify-between gap-4 px-6 py-5 ${headerClassName}`}>
              <div>
                {eyebrow && (
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">{eyebrow}</p>
                )}
                <h2 id={labelledBy} className={titleClassName}>{title}</h2>
                {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className={closeButtonClassName}
                aria-label={`Close ${title}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className={bodyClassName}>
              {children}
            </div>

            {footerLabel && (
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  onClick={onClose}
                  className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-[0.99]"
                >
                  {footerLabel}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

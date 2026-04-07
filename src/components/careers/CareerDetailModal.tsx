import { AnimatePresence, motion } from 'motion/react';
import { createPortal } from 'react-dom';
import { RankedCareerMatch } from '../../lib/rankCareerMatches';
import { CareerDetailPanel } from './CareerDetailPanel';

type CareerDetailModalProps = {
  career: RankedCareerMatch | null;
  onClose: () => void;
};

export function CareerDetailModal({ career, onClose }: CareerDetailModalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {career && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center bg-slate-950/70 p-0 sm:items-center sm:p-6">
          <button
            className="absolute inset-0 cursor-default"
            onClick={onClose}
            aria-label="Close career details"
          />
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-6"
          >
            <CareerDetailPanel career={career} onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

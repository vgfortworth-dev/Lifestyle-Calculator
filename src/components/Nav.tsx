import { motion } from 'motion/react';
import { History, RotateCcw } from 'lucide-react';

const APP_LOGO_SRC = '/images/Liestyle calculator logo_Lifestyle Calculator Logo.svg';

type NavProps = {
  sessionEmail?: string;
  stepLabel: string;
  currentQuestionStep: number;
  totalQuestionSteps: number;
  progressPercent: number;
  showProgress: boolean;
  showHistoryButton?: boolean;
  showSignOut?: boolean;
  onReset: () => void;
  onToggleHistory: () => void;
  onSignOut: () => void;
};

export function Nav({
  sessionEmail,
  stepLabel,
  currentQuestionStep,
  totalQuestionSteps,
  progressPercent,
  showProgress,
  showHistoryButton = true,
  showSignOut = true,
  onReset,
  onToggleHistory,
  onSignOut,
}: NavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src={APP_LOGO_SRC}
            alt="Lifestyle Calculator logo"
            className="h-9 w-auto object-contain"
          />
          {sessionEmail ? (
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-black text-slate-900">User:</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sessionEmail}</span>
            </div>
          ) : null}
        </div>

        {showProgress && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {currentQuestionStep} of {totalQuestionSteps}</span>
              <span className="font-bold text-slate-700">{stepLabel}</span>
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-orange-500" animate={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {showHistoryButton ? (
            <button
              onClick={onToggleHistory}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>
          ) : null}
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">{showSignOut ? 'Reset Quiz' : 'Reset'}</span>
          </button>
          {showSignOut ? (
            <button
              onClick={onSignOut}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Sign Out
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

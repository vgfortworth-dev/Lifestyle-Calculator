import { motion } from 'motion/react';
import { Calculator, History, RotateCcw } from 'lucide-react';

type NavProps = {
  sessionEmail?: string;
  stepLabel: string;
  currentQuestionStep: number;
  totalQuestionSteps: number;
  progressPercent: number;
  showProgress: boolean;
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
  onReset,
  onToggleHistory,
  onSignOut,
}: NavProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-black text-xl tracking-tight">Lifestyle Calculator</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sessionEmail}</span>
          </div>
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
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Quiz</span>
          </button>
          <button
            onClick={onSignOut}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

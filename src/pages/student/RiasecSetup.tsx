import { useState } from 'react';
import { ArrowRight, ClipboardCheck, FastForward, ShieldCheck, Sparkles } from 'lucide-react';
import { RiasecCodeEntry } from '../../components/riasec/RiasecCodeEntry';
import { RiasecSummary } from '../../types/riasec';

type RiasecSetupProps = {
  onTakeQuiz: () => void;
  onSubmitKnownCode: (summary: RiasecSummary) => void;
  onSkip: () => void;
};

export function RiasecSetup({ onTakeQuiz, onSubmitKnownCode, onSkip }: RiasecSetupProps) {
  const [mode, setMode] = useState<'menu' | 'known-code'>('menu');

  if (mode === 'known-code') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <RiasecCodeEntry onSubmit={onSubmitKnownCode} onBack={() => setMode('menu')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-xl sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl shadow-orange-100">
            <Sparkles className="h-10 w-10" />
          </div>
          <p className="mt-6 text-xs font-black uppercase tracking-widest text-[#3372B2]">Optional Setup</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Personalize Your Calculator</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
            RIASEC can help connect your lifestyle choices to career interests. You can take the quiz, enter a code you already know, or skip this step for now.
          </p>

          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm font-medium leading-relaxed text-emerald-900/80">
                Privacy note: quiz answers are only used in this browser while you take the quiz. They are not saved to Supabase or attached to your profile.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={onTakeQuiz}
            className="group rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-900">Take the RIASEC Quiz</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Answer quick activity questions and get a local-only interest summary.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-600">
              Start quiz <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <button
            onClick={() => setMode('known-code')}
            className="group rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#3372B2]">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-900">I Already Know My Code</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Enter a 2- or 3-letter RIASEC code from a quiz you already took.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#3372B2]">
              Enter code <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <button
            onClick={onSkip}
            className="group rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-lg transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
              <FastForward className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-black text-slate-900">Skip for Now</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
              Continue straight to the Lifestyle Calculator. You can still use every calculator step.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-600">
              Continue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </section>
      </div>
    </div>
  );
}

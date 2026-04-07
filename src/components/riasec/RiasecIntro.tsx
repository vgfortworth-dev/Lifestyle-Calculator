import { ShieldCheck, Sparkles } from 'lucide-react';

type RiasecIntroProps = {
  onStart: () => void;
};

export function RiasecIntro({ onStart }: RiasecIntroProps) {
  return (
    <div className="space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-xl shadow-orange-100">
          <Sparkles className="h-10 w-10" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">Career Interest Quiz</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Find Your RIASEC Match</h1>
        </div>
        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
          Answer a few quick questions about activities you might enjoy. At the end, you will see career areas that may fit your interests.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-black text-emerald-800">Privacy note</p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-emerald-900/80">
              Your quiz answers are not saved to Supabase or your profile. They are only used in this browser during this session to calculate your result.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full rounded-2xl bg-slate-900 px-8 py-4 text-lg font-black text-white shadow-lg transition-all hover:bg-slate-800 active:scale-[0.99]"
      >
        Start Quiz
      </button>
    </div>
  );
}

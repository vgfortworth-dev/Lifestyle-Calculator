import { RiasecResult, RiasecSummary } from '../../types/riasec';
import {
  RIASEC_CATEGORY_DESCRIPTIONS,
  RIASEC_CATEGORY_LABELS,
  RIASEC_MATCHED_CAREERS,
} from '../../lib/riasecQuestions';
import { toRiasecSummary } from '../../lib/riasecScoring';

type RiasecResultsProps = {
  result: RiasecResult;
  onTryLifestyle: (summary: RiasecSummary) => void;
  onRestart: () => void;
};

export function RiasecResults({ result, onTryLifestyle, onRestart }: RiasecResultsProps) {
  const topCategories = result.rankedCategories.slice(0, 3);

  return (
    <div className="space-y-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
      <div className="space-y-3 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">Your RIASEC Result</p>
        <h1 className="text-4xl font-black text-slate-900">{result.topThree}</h1>
        <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-600">
          Your strongest match is <span className="font-black text-slate-900">{RIASEC_CATEGORY_LABELS[result.topCategory]}</span>. This is a starting point for exploring careers, not a final answer about your future.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topCategories.map((category) => (
          <section key={category} className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">{category}</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{RIASEC_CATEGORY_LABELS[category]}</h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
              {RIASEC_CATEGORY_DESCRIPTIONS[category]}
            </p>
          </section>
        ))}
      </div>

      <section className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
        <h2 className="text-xl font-black text-slate-900">Career ideas to explore</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RIASEC_MATCHED_CAREERS[result.topCategory].map((career) => (
            <div key={career} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-bold text-slate-700">
              {career}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-sm font-medium leading-relaxed text-emerald-900/80">
          Privacy reminder: only this short summary can be handed to the Lifestyle Calculator for this session. Your individual answers are not saved.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onTryLifestyle(toRiasecSummary(result))}
          className="flex-1 rounded-2xl bg-orange-500 px-6 py-4 font-black text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-[0.99]"
        >
          Try this lifestyle
        </button>
        <button
          onClick={onRestart}
          className="flex-1 rounded-2xl bg-slate-100 px-6 py-4 font-black text-slate-600 transition-all hover:bg-slate-200 active:scale-[0.99]"
        >
          Retake quiz
        </button>
      </div>
    </div>
  );
}

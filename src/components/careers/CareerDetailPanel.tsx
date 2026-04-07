import { Briefcase, GraduationCap, TrendingUp, X } from 'lucide-react';
import { RankedCareerMatch } from '../../lib/rankCareerMatches';

type CareerDetailPanelProps = {
  career: RankedCareerMatch;
  onClose: () => void;
};

export function CareerDetailPanel({ career, onClose }: CareerDetailPanelProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#3372B2]">Career Profile</p>
          <h5 className="mt-1 text-lg font-black text-slate-900">{career.title}</h5>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-slate-100 p-2 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-700"
          aria-label={`Close ${career.title} details`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
          {career.matchLabel}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
          {career.matchScore} match pts
        </span>
        {career.riasecCodes.length > 0 && (
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
            RIASEC {career.riasecCodes.join('/')}
          </span>
        )}
      </div>

      <p className="text-sm font-medium leading-relaxed text-slate-600">{career.description}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <GraduationCap className="h-4 w-4" />
            Education Needed
          </div>
          <p className="mt-2 text-sm font-bold text-slate-700">{career.education}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <Briefcase className="h-4 w-4" />
            Pay Snapshot
          </div>
          <p className="mt-2 text-sm font-bold text-slate-700">{career.avgSalary}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <TrendingUp className="h-4 w-4" />
            Growth Outlook
          </div>
          <p className="mt-2 text-sm font-bold text-slate-700">{career.growth}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Lifestyle Fit</p>
          <p className="mt-2 text-sm font-bold text-slate-700">
            {career.canAffordLifestyle
              ? 'Typical pay appears to cover your selected lifestyle.'
              : 'This may need more experience, training, or a lower-cost lifestyle plan.'}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Why This Matched</p>
        <div className="mt-3 space-y-2">
          {career.reasons.map((reason) => (
            <p key={reason} className="text-sm font-medium leading-relaxed text-slate-600">
              {reason}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

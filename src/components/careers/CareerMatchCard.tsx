import { motion } from 'motion/react';
import { Briefcase, GraduationCap, TrendingUp } from 'lucide-react';
import { RankedCareerMatch } from '../../lib/rankCareerMatches';

type CareerMatchCardProps = {
  career: RankedCareerMatch;
  index: number;
  showRiasecTags: boolean;
  onViewDetails: () => void;
};

function getMatchLabelClass(label: RankedCareerMatch['matchLabel']) {
  if (label === 'Strong match') return 'bg-emerald-100 text-emerald-700';
  if (label === 'Good-fit stretch option') return 'bg-amber-100 text-amber-700';
  return 'bg-blue-100 text-blue-700';
}

export function CareerMatchCard({
  career,
  index,
  showRiasecTags,
  onViewDetails,
}: CareerMatchCardProps) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{career.title}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${getMatchLabelClass(career.matchLabel)}`}>
              {career.matchLabel}
            </span>
            {showRiasecTags && career.riasecCodes.length > 0 && (
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                RIASEC {career.riasecCodes.join('/')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{career.matchScore} pts</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{career.description}</p>

      <div className="mb-3 space-y-2 rounded-2xl border border-slate-100 bg-white/70 p-3">
        {career.reasons.map((reason) => (
          <p key={reason} className="text-[11px] font-bold leading-relaxed text-slate-500">
            {reason}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <GraduationCap className="w-3 h-3" />
          {career.education}
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <Briefcase className="w-3 h-3" />
          {career.avgSalary}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 bg-white border rounded-lg text-[10px] font-bold uppercase tracking-tighter ${
          career.canAffordLifestyle ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600'
        }`}>
          {career.canAffordLifestyle ? 'Lifestyle fit' : 'Stretch salary'}
        </div>
      </div>

      <button
        onClick={onViewDetails}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 sm:w-auto"
      >
        Learn more
      </button>
    </motion.div>
  );
}

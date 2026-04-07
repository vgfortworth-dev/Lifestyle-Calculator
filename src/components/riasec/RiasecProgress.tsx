type RiasecProgressProps = {
  current: number;
  total: number;
};

export function RiasecProgress({ current, total }: RiasecProgressProps) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Question {current} of {total}</p>
        <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">{Math.round(progressPercent)}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-orange-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Check } from 'lucide-react';
import { Option } from '../types';
import { AppColorTokens, MultiSelectStepProps } from '../types/componentProps';
import { StreamingPlanGroup } from '../types/options';

type StreamingSelectionStepProps = MultiSelectStepProps<'streaming'> & {
  colors: Pick<AppColorTokens, 'headerBlue' | 'selectedGreen' | 'borderSlate'>;
};

export function StreamingSelectionStep({
  options,
  category,
  state,
  onToggle,
  colors,
}: StreamingSelectionStepProps) {
  const selectedIds = state.selections[category] as string[];

  const services = useMemo(() => {
    const groups: Record<string, StreamingPlanGroup> = {};

    options.forEach((opt) => {
      const serviceName = opt.service || 'Other';
      if (!groups[serviceName]) groups[serviceName] = {};

      const group = groups[serviceName];
      if (opt.planType === 'ads') group.ads = opt;
      else if (opt.planType === 'no-ads') group.noAds = opt;
      else group.standard = opt;
    });

    return groups;
  }, [options]);

  const renderOption = (opt: Option) => (
    <button
      key={opt.id}
      onClick={() => onToggle(category, opt.id)}
      className="w-full rounded-2xl text-left transition-all border-2 flex items-center gap-4 p-4 group h-full bg-white"
      style={{
        borderColor: selectedIds.includes(opt.id) ? colors.selectedGreen : colors.borderSlate,
        boxShadow: selectedIds.includes(opt.id) ? '0 0 0 2px rgba(16, 185, 129, 0.08)' : undefined
      }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner">
        <img src={opt.image} alt={opt.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm leading-tight" style={{ color: colors.headerBlue }}>
            {opt.name}
          </h4>
          <div
            className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all"
            style={{
              backgroundColor: selectedIds.includes(opt.id) ? colors.selectedGreen : 'transparent',
              borderColor: selectedIds.includes(opt.id) ? colors.selectedGreen : colors.borderSlate
            }}
          >
            {selectedIds.includes(opt.id) && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-black" style={{ color: colors.headerBlue }}>${opt.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/mo</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-12">
      {/* Desktop Header */}
      <div className="grid grid-cols-2 gap-12 px-6 hidden md:grid">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="text-xs font-black text-slate-400 tracking-wider">With Ads / Standard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-300" />
          <span className="text-xs font-black text-slate-400 tracking-wider">Without Ads / Premium</span>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(services).map(([serviceName, group]: [string, StreamingPlanGroup]) => (
          <div key={serviceName} className="space-y-4">
            <div className="flex items-center gap-4 px-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">{serviceName}</h3>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
              <div className="space-y-3">
                {group.ads ? renderOption(group.ads) : group.standard ? renderOption(group.standard) : (
                  <div className="h-full min-h-[88px] border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Ads Only</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {group.noAds ? renderOption(group.noAds) : (
                  <div className="hidden md:flex h-full min-h-[88px] border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Single Option Only</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

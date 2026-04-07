import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Option } from '../types';
import { AppColorTokens, MultiSelectStepProps } from '../types/componentProps';
import {
  INSURANCE_CATEGORY_ORDER,
  INSURANCE_PRIORITY_BADGES,
  INSURANCE_PROMPT_OPTIONS,
  InsurancePriority,
  getInsuranceInfo,
  getInsurancePriorities,
  getInsuranceWhy,
} from '../content/insuranceInfo';
import { InfoButton } from './InfoButton';

type InsuranceSelectionStepProps = MultiSelectStepProps<'insurance'> & {
  colors: AppColorTokens;
  categoryEmojis: Record<string, string>;
};

type InsuranceInfoModalProps = {
  option: Option | null;
  onClose: () => void;
};

export function InsuranceSelectionStep({
  options,
  category,
  state,
  onToggle,
  multiplier = 1,
  colors,
  categoryEmojis,
}: InsuranceSelectionStepProps) {
  const selectedIds = state.selections[category];
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [priority, setPriority] = useState<InsurancePriority | null>(null);
  const [activeInfoOption, setActiveInfoOption] = useState<Option | null>(null);
  const groups = useMemo<Record<string, Option[]>>(() => {
    const grouped: Record<string, Option[]> = {};
    options.forEach((opt) => {
      const groupName = opt.category || 'General';
      if (!grouped[groupName]) grouped[groupName] = [];
      grouped[groupName].push(opt);
    });
    return grouped;
  }, [options]);
  const orderedGroups = INSURANCE_CATEGORY_ORDER
    .filter((groupName) => groups[groupName]?.length)
    .map((groupName) => [groupName, groups[groupName]] as const);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-blue-100 bg-blue-50/80 p-6 shadow-lg shadow-blue-100/50">
        <p className="text-lg font-black text-[#3372B2]">What matters most to you?</p>
        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          Your answer can help you compare price, protection, and regular care before picking insurance options.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {INSURANCE_PROMPT_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setPriority(current => current === option ? null : option)}
              className={`rounded-xl border px-4 py-3 text-sm font-black transition-all ${
                priority === option
                  ? 'border-[#10B981] bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {orderedGroups.map(([catName, opts]) => (
          <div key={catName} className="space-y-3">
            <button
              onClick={() => setExpandedCategories(prev => ({ ...prev, [catName]: !prev[catName] }))}
              className="flex items-center gap-2 w-full text-left group"
            >
              <div className={`transition-transform duration-200 ${expandedCategories[catName] ? 'rotate-0' : '-rotate-90'}`}>
                <ChevronDown className="w-5 h-5 group-hover:text-slate-700" style={{ color: colors.headerBlue }} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-3" style={{ color: colors.headerBlue }}>
                <span className="text-2xl">{categoryEmojis[catName] || '✨'}</span>
                {catName}
                <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{opts.length}</span>
              </h3>
              <div className="flex-1 h-px bg-slate-100" />
            </button>

            <AnimatePresence>
              {expandedCategories[catName] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opts.map((opt) => {
                      const isSelected = selectedIds.includes(opt.id);
                      const priorities = getInsurancePriorities(opt);
                      const matchesPriority = priority ? priorities.includes(priority) : false;
                      const isDimmed = !!priority && !matchesPriority;
                      const whyThisFits = getInsuranceWhy(opt);

                      return (
                        <div
                          key={opt.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onToggle(category, opt.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onToggle(category, opt.id);
                            }
                          }}
                          className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center group bg-white ${
                            isSelected
                              ? 'border-[#10B981] bg-emerald-50/10 ring-2 ring-emerald-50'
                              : matchesPriority
                              ? 'border-[#3372B2] bg-blue-50/40 shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
                              : isDimmed
                              ? 'border-slate-100 opacity-60 hover:opacity-100 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
                              : 'border-slate-100 hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
                          }`}
                        >
                          <InfoButton
                            label={`Learn more about ${opt.name}`}
                            onClick={() => setActiveInfoOption(opt)}
                          />
                          {matchesPriority && priority && (
                            <span className="mb-3 rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#3372B2] shadow-sm">
                              {INSURANCE_PRIORITY_BADGES[priority]}
                            </span>
                          )}
                          <span className="text-4xl mb-3">{opt.emoji}</span>
                          <p className="font-bold mb-1" style={{ color: colors.headerBlue }}>{opt.name}</p>
                          <p className="text-sm font-medium mb-3" style={{ color: colors.valueTeal }}>{opt.description}</p>
                          <p className="mb-3 rounded-2xl bg-slate-50 px-4 py-3 text-left text-xs font-medium leading-relaxed text-slate-600">
                            <span className="font-black text-[#3372B2]">Why this fits:</span> {whyThisFits}
                          </p>
                          <p className="font-black text-xl" style={{ color: colors.headerBlue }}>
                            ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
                          </p>
                          {opt.items && (
                            <div className="mt-5 w-full rounded-2xl bg-slate-50 p-4 text-left">
                              <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#3372B2]">Best For:</p>
                              <ul className="space-y-2">
                                {opt.items.map((item) => (
                                  <li key={item} className="flex items-start gap-2 text-sm font-medium leading-snug text-slate-600">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D9B8E]" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div
                            className="mt-4 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                            style={{
                              backgroundColor: isSelected ? colors.selectedGreen : 'transparent',
                              borderColor: isSelected ? colors.selectedGreen : colors.borderSlate
                            }}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <InsuranceInfoModal
        option={activeInfoOption}
        onClose={() => setActiveInfoOption(null)}
      />
    </div>
  );
}

function InsuranceInfoModal({ option, onClose }: InsuranceInfoModalProps) {
  const info = option ? getInsuranceInfo(option) : null;

  return (
    <AnimatePresence>
      {option && info && (
        <motion.div
          className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="insurance-info-title"
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 bg-[#3372B2] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-100">Insurance Info</p>
                <h2 id="insurance-info-title" className="mt-1 text-2xl font-black">{option.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
                aria-label="Close insurance info"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6 sm:p-8">
              <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <h3 className="text-lg font-black text-[#3372B2]">What it is</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{info.what}</p>
              </section>
              <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <h3 className="text-lg font-black text-emerald-700">Why you'd want or need it</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">{info.why}</p>
              </section>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-[0.99]"
              >
                Back to Insurance Options
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

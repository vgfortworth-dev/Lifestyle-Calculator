import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X, Zap } from 'lucide-react';
import { BeforeYouChooseCallout } from './BeforeYouChooseCallout';
import { InfoButton } from './InfoButton';
import { ModalShell } from './ModalShell';
import { ELECTRICITY_PLAN_INFO } from '../content/electricityInfo';
import { Option } from '../types';
import { AppColorTokens, MultiSelectStepProps } from '../types/componentProps';

type UtilitiesSelectionStepProps = MultiSelectStepProps<'utilities'> & {
  requiredUtilityIds?: string[];
  essentialUtilityIds: string[];
  colors: AppColorTokens;
};

const utilityBlocks = [
  {
    title: 'Electricity',
    body: 'Powers lights, appliances, air conditioning, and electronics.',
  },
  {
    title: 'Water',
    body: 'Provides running water for sinks, showers, laundry, and toilets.',
  },
  {
    title: 'Trash',
    body: 'Pays for garbage collection and pickup.',
  },
];

export function UtilitiesSelectionStep({
  options,
  category,
  state,
  onToggle,
  multiplier = 1,
  requiredUtilityIds = [],
  essentialUtilityIds,
  colors,
}: UtilitiesSelectionStepProps) {
  const [showLesson, setShowLesson] = useState(false);
  const [activeElectricityInfo, setActiveElectricityInfo] = useState<Option | null>(null);
  const selectedIds = state.selections[category] as string[];
  const lockedNote = requiredUtilityIds.length
    ? 'In this housing choice, water and trash are usually part of your monthly living costs.'
    : undefined;
  const essentialUtilities = options.filter((opt) => essentialUtilityIds.includes(opt.id));
  const electricityOptions = options.filter((opt) => !essentialUtilityIds.includes(opt.id));

  const renderUtilityCards = (opts: Option[], gridClassName: string) => (
    <div className={gridClassName}>
      {opts.map((opt) => {
        const isSelected = selectedIds.includes(opt.id);
        const isLocked = requiredUtilityIds.includes(opt.id);
        const electricityInfo = ELECTRICITY_PLAN_INFO[opt.id];

        return (
          <div
            key={opt.id}
            role="button"
            tabIndex={isLocked ? -1 : 0}
            onClick={() => {
              if (!isLocked) onToggle(category, opt.id);
            }}
            onKeyDown={(event) => {
              if (!isLocked && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onToggle(category, opt.id);
              }
            }}
            aria-disabled={isLocked}
            className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center group bg-white ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
            style={{
              borderColor: isSelected ? colors.selectedGreen : colors.borderSlate,
              backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.04)' : 'white'
            }}
          >
            {electricityInfo && (
              <InfoButton
                label={`Learn more about ${opt.name}`}
                onClick={() => setActiveElectricityInfo(opt)}
              />
            )}
            {isLocked && (
              <span className="mb-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-100">
                Usually Needed
              </span>
            )}
            <span className="text-4xl mb-3">{opt.emoji}</span>
            <p className="font-bold mb-1" style={{ color: colors.headerBlue }}>{opt.name}</p>
            <p className="text-sm font-medium mb-3" style={{ color: colors.valueTeal }}>{opt.description}</p>
            {isLocked && lockedNote && (
              <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium leading-relaxed text-slate-500">
                {lockedNote}
              </p>
            )}
            <p className="font-black text-xl" style={{ color: colors.headerBlue }}>
              ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
            </p>
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
  );

  return (
    <div className="space-y-8">
      <BeforeYouChooseCallout
        body="Take a quick 2-minute look at the basic services homes usually need."
        icon={<Zap className="h-5 w-5" />}
        actionIcon={<Zap className="w-4 h-4" />}
        onLessonClick={() => setShowLesson(true)}
      />

      {requiredUtilityIds.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium leading-relaxed text-emerald-900/80">
          <span className="font-black text-emerald-700">Auto-selected:</span> City Water and City Trash are usually part of monthly living costs for this housing choice.
        </div>
      )}

      <div className="space-y-12">
        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black" style={{ color: colors.headerBlue }}>Essential Utilities</h3>
            <p className="text-sm font-medium text-slate-500">
              These are basic services most homes need and are usually required.
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              These are usually included when you live on your own.
            </p>
          </div>
          {renderUtilityCards(essentialUtilities, 'grid grid-cols-1 md:grid-cols-2 gap-6')}
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-black" style={{ color: colors.headerBlue }}>Choose Your Electricity Plan</h3>
            <p className="text-sm font-medium text-slate-500">
              Choose one electricity provider based on your budget and usage.
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              You typically choose one electricity provider for your home.
            </p>
          </div>
          {renderUtilityCards(electricityOptions, 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6')}
        </section>
      </div>

      <ElectricityPlanInfoModal
        option={activeElectricityInfo}
        onClose={() => setActiveElectricityInfo(null)}
      />

      <UtilitiesLessonModal isOpen={showLesson} onClose={() => setShowLesson(false)} />
    </div>
  );
}

function UtilitiesLessonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            aria-labelledby="utilities-lesson-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 bg-[#3372B2] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-100">Utilities Mini Lesson</p>
                <h2 id="utilities-lesson-title" className="mt-1 text-2xl font-black">Quick Lesson: How Utilities Work</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
                aria-label="Close quick lesson"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-6 sm:p-8">
              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="text-lg font-black text-[#3372B2]">What are utilities?</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    Utilities are the basic services needed to live in a home, apartment, or other place to live. These services usually include electricity, water, and trash pickup.
                  </p>
                </section>

                <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                  <h3 className="text-lg font-black text-orange-600">Why do utilities matter?</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-orange-900/80">
                    Utilities are part of the monthly cost of living. Even if rent seems affordable, utilities can increase how much you spend each month.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-black text-[#3372B2]">Common types of utilities</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {utilityBlocks.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                        <p className="font-black text-[#3372B2]">{item.title}</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-black text-[#3372B2]">Which utilities depend on where you live?</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    Some utilities depend on your housing choice. For example, someone living in a house or apartment may need to pay for water and trash, while someone living at home with family may not pay those bills directly.
                  </p>
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <h3 className="text-lg font-black text-emerald-700">Think about it</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">
                    When people move into their own place, they often have to pay more than just rent. Utilities are one of the extra monthly costs that can affect a budget.
                  </p>
                  <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm">
                    Which utility do you think people use every day without thinking about it?
                  </p>
                </section>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-[0.99]"
              >
                Back to Utilities
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ElectricityPlanInfoModal({ option, onClose }: { option: Option | null; onClose: () => void }) {
  const info = option ? ELECTRICITY_PLAN_INFO[option.id] : null;

  return (
    <ModalShell
      isOpen={!!option && !!info}
      onClose={onClose}
      title={option?.name || ''}
      subtitle="What makes this plan unique?"
      eyebrow={info?.tag}
      labelledBy="electricity-info-title"
      footerLabel="Back to Electricity Plans"
      maxWidthClassName="max-w-2xl"
      headerClassName="bg-[#3372B2] text-white"
      titleClassName="mt-2 text-2xl font-black"
      subtitleClassName="mt-1 text-sm font-bold text-blue-100"
      closeButtonClassName="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      {info && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <h3 className="text-lg font-black text-[#3372B2]">What it is</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{info.what}</p>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <h3 className="text-lg font-black text-emerald-700">Why someone might choose it</h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">{info.why}</p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-[#3372B2]">What makes it different</h3>
            <ul className="mt-3 space-y-2">
              {info.different.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium leading-relaxed text-slate-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D9B8E]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
              {info.takeaway}
            </p>
          </section>

          <p className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-medium leading-relaxed text-orange-900/80">
            Electricity plans can look similar, but small differences like fixed rates, bill credits, and auto pay can affect how your monthly bill feels.
          </p>
        </div>
      )}
    </ModalShell>
  );
}

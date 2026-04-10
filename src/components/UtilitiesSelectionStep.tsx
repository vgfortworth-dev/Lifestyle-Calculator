import { useState } from 'react';
import { Check, Zap } from 'lucide-react';
import { BeforeYouChooseCallout } from './BeforeYouChooseCallout';
import { InfoButton } from './InfoButton';
import { LessonAccordion, LessonAccordionItem } from './LessonAccordion';
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
  const lessonItems: LessonAccordionItem[] = [
    {
      id: 'utilities-basics',
      title: 'What are utilities?',
      summary: 'Utilities are the basic services people usually need where they live.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-slate-600">
          Utilities are the basic services needed to live in a home, apartment, or other place to live. These services usually include electricity, water, and trash pickup.
        </p>
      ),
    },
    {
      id: 'utilities-why-matter',
      title: 'Why do utilities matter?',
      summary: 'They are part of your monthly living cost, not just a one-time bill.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-orange-900/80">
          Utilities are part of the monthly cost of living. Even if rent seems affordable, utilities can increase how much you spend each month.
        </p>
      ),
    },
    {
      id: 'utilities-common-types',
      title: 'Common types of utilities',
      summary: 'Electricity, water, and trash all cover different daily needs.',
      content: (
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
          {utilityBlocks.map((item) => (
            <div key={item.title} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="font-black text-[#3372B2]">{item.title}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'utilities-housing-choice',
      title: 'Which utilities depend on where you live?',
      summary: 'Some costs depend on whether you live on your own or with family.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-slate-600">
          Some utilities depend on your housing choice. For example, someone living in a house or apartment may need to pay for water and trash, while someone living at home with family may not pay those bills directly.
        </p>
      ),
    },
    {
      id: 'utilities-think-about-it',
      title: 'Think about it',
      summary: 'Utilities are one of the extra costs that make real budgets feel different.',
      content: (
        <div className="pt-4">
          <p className="text-sm font-medium leading-relaxed text-emerald-900/80">
            When people move into their own place, they often have to pay more than just rent. Utilities are one of the extra monthly costs that can affect a budget.
          </p>
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm">
            Which utility do you think people use every day without thinking about it?
          </p>
        </div>
      ),
    },
  ];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Utilities Mini Lesson"
      title="Quick Lesson: How Utilities Work"
      labelledBy="utilities-lesson-title"
      footerLabel="Back to Utilities"
      maxWidthClassName="max-w-3xl"
      headerClassName="bg-[#3372B2] text-white"
      titleClassName="mt-1 text-2xl font-black"
      closeButtonClassName="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <LessonAccordion items={lessonItems} />
    </ModalShell>
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

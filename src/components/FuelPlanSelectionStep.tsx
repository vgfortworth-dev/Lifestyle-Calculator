import { useState } from 'react';
import { Car, Check, Info } from 'lucide-react';
import { BeforeYouChooseCallout } from './BeforeYouChooseCallout';
import { LessonAccordion, LessonAccordionItem } from './LessonAccordion';
import { ModalShell } from './ModalShell';
import { FUEL_LESSON_CONTENT } from '../content/fuelLessons';
import { FuelPriceEnvironment, Option, QuizState } from '../types';
import { SelectionChangeHandler } from '../types/componentProps';
import { FuelPlanType, FuelPriceEnvironmentOption } from '../types/options';

type FuelPlanSelectionStepProps = {
  state: QuizState;
  onSelect: SelectionChangeHandler;
  fuelPlanType: FuelPlanType;
  options: Option[];
  fuelPriceEnvironment: FuelPriceEnvironment;
  fuelPriceEnvironments: FuelPriceEnvironmentOption[];
  getFuelPriceEnvironment: (environment: unknown) => FuelPriceEnvironment;
  getFuelMonthlyCost: (option: Option | undefined, environment: FuelPriceEnvironment) => number;
  usageBadgeStyles: Record<string, string>;
  usageBadgeIcons: Record<string, string>;
  headerBlue: string;
};

export function FuelPlanSelectionStep({
  state,
  onSelect,
  fuelPlanType,
  options,
  fuelPriceEnvironment,
  fuelPriceEnvironments,
  getFuelPriceEnvironment,
  getFuelMonthlyCost,
  usageBadgeStyles,
  usageBadgeIcons,
  headerBlue,
}: FuelPlanSelectionStepProps) {
  const [showLesson, setShowLesson] = useState(false);
  const selectedId = state.selections.fuel;
  const selectedEnvironment = getFuelPriceEnvironment(fuelPriceEnvironment);
  const selectedEnvironmentNote = fuelPriceEnvironments.find(option => option.id === selectedEnvironment)?.note;
  const title = fuelPlanType === 'ev' ? 'Choose Your EV Charging Plan' : 'Choose Your Fuel Plan';
  const intro = fuelPlanType === 'ev'
    ? 'EV charging is usually cheaper than gas, but it still belongs in your monthly budget.'
    : 'Gas costs change based on how far and how often you drive.';

  const handleSelect = (id: string) => {
    onSelect('fuel', id);
  };

  const handleEnvironmentSelect = (environment: FuelPriceEnvironment) => {
    onSelect('fuelPriceEnvironment', environment);
  };

  if (fuelPlanType === 'none') {
    return (
      <div className="space-y-8">
        <BeforeYouChooseCallout
          body="Fuel costs depend on the kind of transportation you choose and how often you travel."
          icon={<Car className="h-5 w-5" />}
          actionIcon={<Info className="w-4 h-4" />}
          onLessonClick={() => setShowLesson(true)}
        />
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-8 text-center">
          <p className="text-4xl mb-3">✨</p>
          <h3 className="text-2xl font-black text-emerald-700">No Fuel Plan Needed</h3>
          <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">
            Your current transportation choice does not need a monthly gas or EV charging plan.
          </p>
        </div>
        <FuelLessonModal isOpen={showLesson} onClose={() => setShowLesson(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BeforeYouChooseCallout
        body={intro}
        icon={<Car className="h-5 w-5" />}
        actionIcon={<Info className="w-4 h-4" />}
        onLessonClick={() => setShowLesson(true)}
      />

      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-black" style={{ color: headerBlue }}>{title}</h3>
        <p className="text-sm font-medium text-slate-500">Pick the monthly estimate that best matches your driving habits.</p>
      </div>

      {fuelPlanType === 'gas' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-widest" style={{ color: headerBlue }}>
                Fuel Price Environment
              </p>
              <p className="text-sm font-medium leading-relaxed text-slate-500">
                Fuel prices can change over time. This shows how your monthly cost can go up or down.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[420px]">
              {fuelPriceEnvironments.map((environment) => {
                const isSelected = selectedEnvironment === environment.id;

                return (
                  <button
                    key={environment.id}
                    onClick={() => handleEnvironmentSelect(environment.id)}
                    className={`rounded-xl border px-4 py-3 text-sm font-black transition-all ${
                      isSelected
                        ? 'border-[#10B981] bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
                    }`}
                  >
                    {environment.label}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedEnvironmentNote && (
            <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-[#3372B2]">
              {selectedEnvironmentNote}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const usageLabel = opt.category || '';
          const monthlyCost = getFuelMonthlyCost(opt, selectedEnvironment);

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`relative flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl group bg-white ${
                isSelected
                  ? 'border-[#10B981] ring-2 ring-emerald-50 bg-emerald-50/10'
                  : 'border-slate-100 hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
              }`}
            >
              <div className="text-4xl mb-3">{opt.emoji}</div>
              <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${usageBadgeStyles[usageLabel] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                <span>{usageBadgeIcons[usageLabel]}</span>
                {usageLabel}
              </div>
              <p className="text-[#3372B2] font-bold text-lg">{opt.name}</p>
              <p className="text-[#3372B2] font-black text-3xl mt-2">${monthlyCost}/mo</p>
              <p className="text-[#2D9B8E] text-sm font-medium mt-2">{opt.description}</p>

              <div className="mt-5 w-full rounded-2xl bg-slate-50 p-4 text-left">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#3372B2]">Best For:</p>
                <ul className="space-y-2">
                  {opt.items?.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm font-medium leading-snug text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D9B8E]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#10B981] border-4 border-white text-white rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 stroke-[4px]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <FuelLessonModal isOpen={showLesson} onClose={() => setShowLesson(false)} />
    </div>
  );
}

function FuelLessonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { sections } = FUEL_LESSON_CONTENT;
  const lessonItems: LessonAccordionItem[] = [
    {
      id: 'fuel-why-matters',
      title: sections.whyFuelMatters.title,
      summary: 'Fuel is a monthly cost that changes based on how often you drive.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-slate-600">
          {sections.whyFuelMatters.body}
        </p>
      ),
    },
    {
      id: 'fuel-why-prices-change',
      title: sections.whyPricesChange.title,
      summary: 'Prices can go up or down for reasons outside your control.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-slate-600">
          {sections.whyPricesChange.body}
        </p>
      ),
    },
    {
      id: 'fuel-gas-vehicles',
      title: sections.gasVehicles.title,
      summary: 'Gas costs depend on distance, prices, and how efficient the vehicle is.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-orange-900/80">
          {sections.gasVehicles.body}
        </p>
      ),
    },
    {
      id: 'fuel-electric-vehicles',
      title: sections.electricVehicles.title,
      summary: 'EV charging is often lower, but it still belongs in the budget.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-emerald-900/80">
          {sections.electricVehicles.body}
        </p>
      ),
    },
    {
      id: 'fuel-think-about-it',
      title: sections.thinkAboutIt.title,
      summary: 'Driving habits can change fuel costs a lot more than people expect.',
      content: (
        <div className="pt-4">
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            {sections.thinkAboutIt.body}
          </p>
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm">
            {sections.thinkAboutIt.question}
          </p>
        </div>
      ),
    },
  ];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={FUEL_LESSON_CONTENT.eyebrow}
      title={FUEL_LESSON_CONTENT.title}
      labelledBy="fuel-lesson-title"
      footerLabel="Back to Fuel Plans"
      maxWidthClassName="max-w-3xl"
      headerClassName="bg-[#3372B2] text-white"
      titleClassName="mt-1 text-2xl font-black"
      closeButtonClassName="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <LessonAccordion items={lessonItems} />
    </ModalShell>
  );
}

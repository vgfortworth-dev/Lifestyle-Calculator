import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Info, Smartphone, X } from 'lucide-react';
import { BeforeYouChooseCallout } from './BeforeYouChooseCallout';
import { AppColorTokens, SingleSelectStepProps } from '../types/componentProps';

type PhonePlanSelectionStepProps = SingleSelectStepProps<'phonePlan'> & {
  colors: Pick<AppColorTokens, 'headerBlue' | 'valueTeal' | 'selectedGreen'>;
};

const explanationBlocks = [
  {
    title: 'Data',
    body: 'Data is what lets you watch videos, use apps, search online, and scroll on social media.',
  },
  {
    title: 'Speed',
    body: 'Some plans offer faster internet speeds, like 5G.',
  },
  {
    title: 'Hotspot',
    body: 'A hotspot lets your phone share internet with a laptop or tablet.',
  },
];

const userTypes = [
  {
    title: 'Light User',
    body: 'Mostly calls, texts, and a little app use.',
  },
  {
    title: 'Regular User',
    body: 'Uses social media, videos, and apps most days.',
  },
  {
    title: 'Heavy User',
    body: 'Watches lots of videos, streams often, games, or is online a lot.',
  },
];

export function PhonePlanSelectionStep({
  options,
  category,
  state,
  onSelect,
  colors,
}: PhonePlanSelectionStepProps) {
  const selectedId = state.selections[category];
  const [showLesson, setShowLesson] = useState(false);

  return (
    <div className="space-y-8">
      <BeforeYouChooseCallout
        body="Take a quick 2-minute look at what phone plans include."
        icon={<Smartphone className="h-5 w-5" />}
        actionIcon={<Info className="w-4 h-4" />}
        onLessonClick={() => setShowLesson(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => onSelect(category, opt.id)}
              className="relative flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl group bg-white"
              style={{
                borderColor: isSelected ? colors.selectedGreen : 'transparent',
                boxShadow: isSelected ? '0 0 0 2px rgba(16, 185, 129, 0.08)' : undefined
              }}
            >
              {opt.image && (
                <div className="h-24 w-full flex items-center justify-center mb-4">
                  <img src={opt.image} alt={opt.name} className="max-h-full max-w-[80%] object-contain" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="font-black text-3xl mb-4" style={{ color: colors.headerBlue }}>
                ${opt.monthlyCost}/Month
              </div>

              <div className="space-y-1 text-left w-full max-w-[280px] mx-auto text-[13px] leading-snug">
                <p style={{ color: colors.headerBlue }}><span className="font-bold">Plan Name:</span> <span style={{ color: colors.valueTeal }}>{opt.planName}</span></p>
                <p style={{ color: colors.headerBlue }}><span className="font-bold">High-Speed Data:</span> <span style={{ color: colors.valueTeal }}>{opt.data}</span></p>
                <p style={{ color: colors.headerBlue }}><span className="font-bold">Hotspot:</span> <span style={{ color: colors.valueTeal }}>{opt.hotspot}</span></p>
                <p style={{ color: colors.headerBlue }}><span className="font-bold">5G Access:</span> <span style={{ color: colors.valueTeal }}>{opt.access}</span></p>
                <p style={{ color: colors.headerBlue }}><span className="font-bold">Notes:</span> <span style={{ color: colors.valueTeal }}>{opt.notes}</span></p>
              </div>

              {isSelected && (
                <div className="absolute -top-2 -right-2 text-white rounded-full p-1 shadow-md" style={{ backgroundColor: colors.selectedGreen }}>
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <PhonePlanLessonModal isOpen={showLesson} onClose={() => setShowLesson(false)} />
    </div>
  );
}

function PhonePlanLessonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
            aria-labelledby="phone-plan-lesson-title"
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 bg-[#3372B2] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-100">Phone Plan Mini Lesson</p>
                <h2 id="phone-plan-lesson-title" className="mt-1 text-2xl font-black">Quick Lesson: How Phone Plans Work</h2>
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
                  <h3 className="text-lg font-black text-[#3372B2]">What is a phone plan?</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                    A phone plan is what you pay for each month so your phone can call, text, and use the internet.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-black text-[#3372B2]">What are you paying for?</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {explanationBlocks.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                        <p className="font-black text-[#3372B2]">{item.title}</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-orange-100 bg-orange-50 p-5">
                  <h3 className="text-lg font-black text-orange-600">What does "unlimited" mean?</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-orange-900/80">
                    Unlimited does not always mean unlimited fast data. Some phone plans may slow down after you use a certain amount.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-black text-[#3372B2]">Which type of user are you?</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {userTypes.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="font-black text-slate-900">{item.title}</p>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <h3 className="text-lg font-black text-emerald-700">Think about it</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-900/80">
                    The best plan is not always the cheapest one. A good plan matches how much you really use your phone.
                  </p>
                  <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm">
                    Would you rather save money each month, or pay more for more data and speed?
                  </p>
                </section>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600 active:scale-[0.99]"
              >
                Back to Plans
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

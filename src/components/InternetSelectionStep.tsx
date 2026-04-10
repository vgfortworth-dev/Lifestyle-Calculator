import { useMemo, useState } from 'react';
import { Check, Wifi } from 'lucide-react';
import { BeforeYouChooseCallout } from './BeforeYouChooseCallout';
import { LessonAccordion, LessonAccordionItem } from './LessonAccordion';
import { ModalShell } from './ModalShell';
import { SingleSelectStepProps } from '../types/componentProps';
import { EnhancedInternetOption, InternetPlanDetails } from '../types/options';

type InternetSelectionStepProps = SingleSelectStepProps<'internet'> & {
  usageBadgeStyles: Record<string, string>;
  usageBadgeIcons: Record<string, string>;
};

const internetPlanDetails: Record<string, InternetPlanDetails> = {
  'att-500': {
    usageLabel: 'Moderate Use',
    bestFor: [
      '1-3 people using Wi-Fi',
      'Homework and browsing',
      'Streaming on 1-2 devices',
      'Video calls (Zoom, FaceTime)',
      'Light gaming',
    ],
  },
  'att-1gig': {
    usageLabel: 'Heavy Use',
    bestFor: [
      'Families or shared homes',
      'Streaming on multiple TVs',
      'Online gaming with low lag',
      'Uploading videos or content',
      'Many devices connected at once',
    ],
  },
  'spectrum-1gig': {
    usageLabel: 'Heavy Use',
    bestFor: [
      'Larger households',
      '4K streaming on multiple TVs',
      'Gaming and streaming at the same time',
      'Many devices connected',
      'All-day high-speed usage',
    ],
  },
  'xfinity-400': {
    usageLabel: 'Light Use',
    bestFor: [
      'Budget-friendly households',
      'Streaming in HD',
      'Schoolwork and browsing',
      '1-2 people using Wi-Fi',
      'Moderate daily use',
    ],
  },
  'xfinity-800': {
    usageLabel: 'Moderate Use',
    bestFor: [
      'Medium-sized households',
      'Streaming and gaming',
      'Multiple users online',
      'Faster downloads',
      'Balanced performance and cost',
    ],
  },
  'frontier-500': {
    usageLabel: 'Light Use',
    bestFor: [
      'Budget-conscious users',
      'Smaller households',
      'Basic streaming and browsing',
      'Schoolwork and video calls',
      'Fewer connected devices',
    ],
  },
  'frontier-1gig': {
    usageLabel: 'Heavy Use',
    bestFor: [
      'Families or shared homes',
      'Streaming on multiple TVs',
      'Online gaming with low lag',
      'Uploading videos or content',
      'Many devices connected at once',
    ],
  },
};

const explanationBlocks = [
  {
    title: 'Speed (Mbps)',
    body: 'Speed is how fast your internet is. Higher speeds mean faster downloads, smoother streaming, and less lag.',
  },
  {
    title: 'Devices',
    body: 'The more devices connected (phones, TVs, laptops), the more speed you may need.',
  },
  {
    title: 'Usage',
    body: 'What you do online matters. Watching videos and gaming use more internet than browsing or homework.',
  },
];

const speedExamples = [
  {
    title: '100-300 Mbps',
    body: 'Good for small households, browsing, and light streaming.',
  },
  {
    title: '400-700 Mbps',
    body: 'Good for families, multiple devices, HD streaming.',
  },
  {
    title: '1 Gig (1000 Mbps)',
    body: 'Best for heavy streaming, gaming, and many devices.',
  },
];

const connectionTypes = [
  {
    title: 'Fiber',
    body: 'Faster and more reliable, especially for uploads and gaming.',
  },
  {
    title: 'Cable',
    body: 'Widely available and works well for most households.',
  },
];

export function InternetSelectionStep({
  options,
  category,
  state,
  onSelect,
  multiplier = 1,
  usageBadgeStyles,
  usageBadgeIcons,
}: InternetSelectionStepProps) {
  const [showLesson, setShowLesson] = useState(false);
  const selectedId = state.selections[category];
  const enhancedOptions: EnhancedInternetOption[] = useMemo(() => options.map((opt) => ({
    ...opt,
    ...(internetPlanDetails[opt.id] || {}),
  })), [options]);

  return (
    <div className="space-y-8">
      <BeforeYouChooseCallout
        body="Take a quick 2-minute look at what home internet plans include."
        icon={<Wifi className="h-5 w-5" />}
        actionIcon={<Wifi className="w-4 h-4" />}
        onLessonClick={() => setShowLesson(true)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {enhancedOptions.map((opt) => {
          const isSelected = selectedId === opt.id;
          const usageLabel = opt.usageLabel;
          const bestFor = opt.bestFor;

          return (
            <button
              key={opt.id}
              onClick={() => onSelect(category, opt.id)}
              className={`relative flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl group ${
                isSelected
                  ? 'border-[#10B981] ring-2 ring-emerald-50 bg-emerald-50/10'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              {opt.image && (
                <div className="h-32 w-full flex items-center justify-center mb-4">
                  <img
                    src={opt.image}
                    alt={opt.name}
                    className="max-h-full object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="text-[#3372B2] font-black text-2xl mb-2">
                <span className="mr-2">{opt.emoji}</span>
                ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
              </div>
              {usageLabel && (
                <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${usageBadgeStyles[usageLabel] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  <span>{usageBadgeIcons[usageLabel]}</span>
                  {usageLabel}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[#3372B2] font-bold text-lg">{opt.name}</p>
                <p className="text-[#2D9B8E] text-sm font-medium">{opt.description}</p>
              </div>
              {bestFor && (
                <div className="mt-5 w-full rounded-2xl bg-slate-50 p-4 text-left">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-[#3372B2]">Best For:</p>
                  <ul className="space-y-2">
                    {bestFor.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm font-medium leading-snug text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2D9B8E]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#10B981] border-4 border-white text-white rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 stroke-[4px]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <InternetLessonModal isOpen={showLesson} onClose={() => setShowLesson(false)} />
    </div>
  );
}

function InternetLessonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const lessonItems: LessonAccordionItem[] = [
    {
      id: 'internet-basics',
      title: 'What is home internet?',
      summary: 'Home internet keeps your devices connected for school, streaming, and more.',
      content: (
        <p className="pt-4 text-sm font-medium leading-relaxed text-slate-600">
          Home internet is what allows your household to connect to Wi-Fi for streaming, gaming, schoolwork, and more.
        </p>
      ),
    },
    {
      id: 'internet-paying-for',
      title: 'What are you paying for?',
      summary: 'Speed, devices, and how you use the internet all affect the plan you need.',
      content: (
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
          {explanationBlocks.map((item) => (
            <div key={item.title} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="font-black text-[#3372B2]">{item.title}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'internet-speed',
      title: 'What do speeds mean?',
      summary: 'Higher speeds help more people stream, game, and stay online at once.',
      content: (
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
          {speedExamples.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <p className="font-black text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'internet-connection-type',
      title: 'Fiber vs Cable',
      summary: 'Both can work well, but they feel a little different in real life.',
      content: (
        <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2">
          {connectionTypes.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-black text-orange-700">{item.title}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-orange-900/80">{item.body}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'internet-think-about-it',
      title: 'Think about it',
      summary: 'The best internet plan depends on how your household really uses Wi-Fi.',
      content: (
        <div className="pt-4">
          <p className="text-sm font-medium leading-relaxed text-emerald-900/80">
            The best internet plan depends on how many people are using it and what they do online.
          </p>
          <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-800 shadow-sm">
            How many devices do you think would be connected to your internet at home?
          </p>
        </div>
      ),
    },
  ];

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Internet Mini Lesson"
      title="Quick Lesson: How Internet Plans Work"
      labelledBy="internet-lesson-title"
      footerLabel="Back to Plans"
      maxWidthClassName="max-w-3xl"
      headerClassName="bg-[#3372B2] text-white"
      titleClassName="mt-1 text-2xl font-black"
      closeButtonClassName="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
    >
      <LessonAccordion items={lessonItems} />
    </ModalShell>
  );
}

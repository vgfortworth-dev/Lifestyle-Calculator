import { RiasecAnswerValue, RiasecQuestion } from '../../types/riasec';

const ANSWER_OPTIONS: { label: string; value: RiasecAnswerValue; description: string }[] = [
  { label: 'Love this', value: 3, description: 'This sounds exciting to me.' },
  { label: 'Like this', value: 2, description: 'I would probably enjoy this.' },
  { label: 'Not sure', value: 1, description: 'Maybe, but I am not certain.' },
  { label: 'Not for me', value: 0, description: 'This does not sound like me.' },
];

type RiasecQuestionCardProps = {
  question: RiasecQuestion;
  selectedValue?: RiasecAnswerValue;
  onAnswer: (value: RiasecAnswerValue) => void;
};

export function RiasecQuestionCard({ question, selectedValue, onAnswer }: RiasecQuestionCardProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl">
      <div className="space-y-2 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">How much would you enjoy this?</p>
        <h2 className="text-2xl font-black text-slate-900">{question.prompt}</h2>
      </div>

      {question.imagePath && (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          <img
            src={question.imagePath}
            alt={question.altText || ''}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ANSWER_OPTIONS.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onAnswer(option.value)}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? 'border-[#10B981] bg-emerald-50/60 shadow-sm'
                  : 'border-slate-100 bg-white hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
              }`}
            >
              <p className="font-black text-slate-900">{option.label}</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

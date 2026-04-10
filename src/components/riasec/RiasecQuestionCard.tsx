import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
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
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const showImage = !!question.imageUrl && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
    setImageLoaded(false);
  }, [question.id, question.imageUrl]);

  return (
    <div className="space-y-6">
      <div className="relative h-[240px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl sm:h-[300px]">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />
        )}
        {showImage ? (
          <>
            <img
              src={question.imageUrl || undefined}
              alt={question.altText || question.prompt}
              className={`h-full w-full object-cover object-center transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/10 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            <div className="flex flex-col items-center gap-3 text-center">
              <ImageOff className="h-10 w-10" />
              <p className="text-xs font-black uppercase tracking-widest">
                {question.imagePath ? 'Image unavailable' : 'Question image'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:p-8">
      <div className="space-y-2 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">How much would you enjoy this?</p>
        <h2 className="mx-auto max-w-2xl text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{question.prompt}</h2>
      </div>

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
    </div>
  );
}

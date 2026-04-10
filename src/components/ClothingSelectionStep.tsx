import { Check } from 'lucide-react';
import { Option } from '../types';

type ClothingSelectionStepProps = {
  options: Option[];
  selectedId?: string;
  onSelect: (value: string) => void;
  multiplier?: number;
};

export function ClothingSelectionStep({
  options,
  selectedId,
  onSelect,
  multiplier = 1,
}: ClothingSelectionStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`relative flex flex-col items-center text-center p-6 transition-all duration-200 ease-out border-2 rounded-3xl group bg-white ${
              isSelected
                ? 'border-[#10B981] ring-2 ring-emerald-50 bg-emerald-50/10'
                : 'border-slate-100 hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
            }`}
          >
            {opt.image && (
              <div className="mb-5 h-36 w-full overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={opt.image}
                  alt={opt.name}
                  className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="text-[#3372B2] font-black text-2xl mb-2">
              <span className="mr-2">{opt.emoji}</span>
              ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
            </div>
            <div className="space-y-1">
              <p className="text-[#3372B2] font-bold text-lg">{opt.name}</p>
              <p className="text-[#2D9B8E] text-sm font-medium">{opt.description}</p>
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
  );
}

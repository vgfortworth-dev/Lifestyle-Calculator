import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Info } from 'lucide-react';
import { GROCERY_ALLERGEN_NOTE } from '../content/groceryInfo';
import { SingleSelectStepProps } from '../types/componentProps';

type GrocerySelectionStepProps = SingleSelectStepProps<'food'>;

const budgetStoreLogos = [
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/1.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/2.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/3.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/4.png',
];

const allStoreLogos = [
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/1.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/2.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/3.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/4.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/5.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/6.png',
  'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/7.png',
];

export function GrocerySelectionStep({
  options,
  category,
  state,
  onSelect,
  multiplier = 1,
}: GrocerySelectionStepProps) {
  const selectedId = state.selections[category];
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const renderSection = (type: 'essential' | 'premium', title: string, logos: string[]) => (
    <div className="relative border-b border-slate-100 last:border-0 py-10 first:pt-4 pl-12 md:pl-16">
      <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center">
        <div className="-rotate-90 whitespace-nowrap">
          <span className={`font-black text-[15px] md:text-lg uppercase tracking-[0.3em] ${
            type === 'essential' ? 'text-orange-500' : 'text-[#2D9B8E]'
          }`}>
            {title}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 grayscale opacity-60">
          {logos.map((url, i) => (
            <img key={i} src={url} className="h-12 md:h-16 object-contain" alt="Store logo" referrerPolicy="no-referrer" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {options.filter((o) => o.type === type).map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <div key={opt.id} className="relative">
                <button
                  onClick={() => onSelect(category, opt.id)}
                  className={`w-full flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl relative group ${
                    isSelected
                      ? 'border-[#10B981] ring-2 ring-emerald-50 bg-emerald-50/10'
                      : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  {opt.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2B5FA3] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Most realistic for students
                    </div>
                  )}

                  <div className="text-[#3372B2] font-black text-2xl mb-1 mt-2">
                    ~${((opt.weeklyPrice ?? 0) * multiplier).toLocaleString()}/Week
                  </div>
                  <div className="text-[#3372B2] font-bold text-lg mb-4 leading-tight">{opt.name}</div>

                  <p className="text-slate-500 text-sm mb-6 min-h-[40px]">{opt.description}</p>

                  <div
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(opt.id); }}
                    className="p-2 text-[#3372B2] hover:text-[#2D9B8E] transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
                  >
                    <Info className="w-5 h-5" />
                    What's included?
                  </div>

                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#10B981] border-4 border-white text-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[4px]" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {activeTooltip === opt.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute z-[110] top-full mt-2 left-0 right-0 p-6 bg-white border-2 border-[#3372B2] rounded-2xl shadow-2xl"
                    >
                      <button onClick={() => setActiveTooltip(null)} className="absolute top-2 right-2 text-slate-400 p-2">✕</button>
                      <p className="text-[#3372B2] font-bold mb-3 text-sm pr-6">
                        This package includes things such as:
                      </p>
                      <ul className="grid grid-cols-1 gap-1">
                        {opt.items?.map((item: string, i: number) => (
                          <li key={i} className="text-[#3372B2] text-xs flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#2D9B8E] rounded-full shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSection('essential', 'Budget Stores', budgetStoreLogos)}

      <div className="h-px bg-slate-100 my-4" />

      {renderSection('premium', 'All Stores', allStoreLogos)}

      <div className="mx-2 mt-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <span className="text-amber-500 text-lg mt-0.5">⚠</span>
        <p className="text-amber-800 text-sm font-medium leading-relaxed">
          <span className="font-bold">Need allergen-free options?</span> {GROCERY_ALLERGEN_NOTE}
        </p>
      </div>

      {activeTooltip && (
        <div className="fixed inset-0 z-[105]" onClick={() => setActiveTooltip(null)} />
      )}
    </div>
  );
}

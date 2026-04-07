import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Info } from 'lucide-react';
import { Option, QuizState } from '../types';
import { INTEREST_RATES, calculateTransportMonthly } from '../lib/calculator';
import { TransportRateKey } from '../types/calculator';

type TransportGridOption = {
  id: string;
  category?: string;
  price?: number;
  label?: string;
};

type TransportationGridStepProps = {
  state: QuizState;
  onSelect: (category: keyof QuizState['selections'], value: string[]) => void;
  options: TransportGridOption[];
};

const transportDisplayData = [
  { id: 'borrow', name: 'Borrow', emoji: '🔑', options: [{ type: 'new', price: 0, label: 'Borrow a family member or friend’s vehicle' }] },
  { id: 'bike', name: 'Bike', emoji: '🚲', options: [{ type: 'new', price: 386.49 }, { type: 'used', price: 188.0 }] },
  { id: 'micro', name: 'Micro', emoji: '👚', options: [{ type: 'new', price: 35978.73 }, { type: 'used', price: 12929.75 }] },
  { id: 'sedan', name: 'Sedan', emoji: '🚗', options: [{ type: 'new', price: 25679.30 }, { type: 'used', price: 19479.86 }, { type: 'new-ev', price: 65686.43 }, { type: 'used-ev', price: 33998.0 }] },
  { id: 'luxury-sedan', name: 'Luxury Sedan', emoji: '🏎️', options: [{ type: 'new', price: 66229.0 }, { type: 'used', price: 35122.86 }] },
  { id: 'suv', name: 'SUV', emoji: '🚙', options: [{ type: 'new', price: 37971.48 }, { type: 'used', price: 22761.0 }, { type: 'new-ev', price: 55001.10 }, { type: 'used-ev', price: 38848.0 }] },
  { id: 'truck', name: 'Truck', emoji: '🛻', options: [{ type: 'new', price: 39491.73 }, { type: 'used', price: 24664.67 }, { type: 'new-ev', price: 64406.0 }, { type: 'used-ev', price: 46284.0 }] },
  { id: 'luxury-truck', name: 'Luxury Truck', emoji: '🚚', options: [{ type: 'new', price: 63524.58 }, { type: 'used', price: 47414.67 }] },
] as const;

type TransportGridRow = (typeof transportDisplayData)[number];
type TransportGridOptionType = TransportGridRow['options'][number]['type'];

const transportOptionMapping = transportDisplayData.map(({ id, name, emoji, options }) => ({
  id,
  name,
  emoji,
  options,
}));

function isTransportRateKey(type: TransportGridOptionType): type is TransportRateKey {
  return type === 'new' || type === 'used' || type === 'new-ev' || type === 'used-ev';
}

export function getTransportationOption(id: string): Option | undefined {
  const [rowId, type] = id.split(/-(?=new|used)/);
  const row = transportOptionMapping.find(item => item.id === rowId);
  const match = row?.options.find(opt => opt.type === type);
  if (!row || !match) return undefined;

  const rate = isTransportRateKey(match.type) ? INTEREST_RATES[match.type] : 0;
  const monthly = calculateTransportMonthly(match.price, rate);
  const suffix =
    match.type === 'new' ? 'New' :
    match.type === 'used' ? 'Used' :
    match.type === 'new-ev' ? 'New EV' :
    'Used EV';
  const label = 'label' in match ? match.label : undefined;

  return {
    id,
    name: `${row.name} (${suffix})`,
    description: label || `${suffix} ${row.name}`,
    monthlyCost: monthly,
    emoji: row.emoji
  };
}

export function TransportationGridStep({ state, onSelect, options }: TransportationGridStepProps) {
  const selectedIds = state.selections.transportation as string[];
  const [showTooltip, setShowTooltip] = useState(false);
  const normalizeCategory = (opt: TransportGridOption) => {
    if (opt.category === 'new' || opt.category === 'used' || opt.category === 'new_ev' || opt.category === 'used_ev') {
      return opt.category;
    }
    if (opt.id?.includes('ev-new')) return 'new_ev';
    if (opt.id?.includes('ev-used')) return 'used_ev';
    if (opt.id?.includes('new_ev')) return 'new_ev';
    if (opt.id?.includes('used_ev')) return 'used_ev';
    if (opt.id?.endsWith('-new')) return 'new';
    if (opt.id?.endsWith('-used')) return 'used';
    return '';
  };
  const newCars = options.filter((o) => normalizeCategory(o) === 'new');
  const usedCars = options.filter((o) => normalizeCategory(o) === 'used');
  const newEVs = options.filter((o) => normalizeCategory(o) === 'new_ev');
  const usedEVs = options.filter((o) => normalizeCategory(o) === 'used_ev');
  const findOption = (rowId: string, list: TransportGridOption[], type: string) => {
    const idsByType: Record<string, string[]> = {
      new: [`${rowId}`, `${rowId}-new`],
      used: [`${rowId}-used`],
      'new-ev': [`${rowId}-ev-new`, `${rowId}-new-ev`, `${rowId}-new_ev`],
      'used-ev': [`${rowId}-ev-used`, `${rowId}-used-ev`, `${rowId}-used_ev`],
    };

    return list.find((opt) => idsByType[type]?.includes(opt.id));
  };

  const renderCell = (rowId: string, type: string, price: number, label?: string) => {
    const cellId = `${rowId}-${type}`;
    const isSelected = selectedIds.includes(cellId);
    const rate = isTransportRateKey(type as TransportGridOptionType) ? INTEREST_RATES[type as TransportRateKey] : 0;
    const monthly = calculateTransportMonthly(price, rate);

    return (
      <button
        key={cellId}
        onClick={() => onSelect('transportation', [cellId])}
        className={`flex-1 p-3 transition-all duration-200 ease-out rounded-xl text-center group min-h-[80px] flex flex-col justify-center ${
          isSelected
            ? 'border-2 border-[#10B981] bg-white shadow-lg z-10 scale-105'
            : 'border border-transparent hover:bg-[#F3F7FB] hover:border-[#D6E4F0] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
        }`}
      >
        {price === 0 ? (
          <span className="text-[#3372B2] text-sm font-bold leading-snug block px-2">{label}</span>
        ) : (
          <div className="space-y-1">
            <span className="text-[#3372B2] font-black text-lg block">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[14px] text-[#2D9B8E] font-bold leading-tight">
              {rate}% Int. • ${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 relative">
      <div className="grid grid-cols-5 gap-4 px-6 items-center mb-4">
        <div className="text-[#3372B2] font-black text-lg uppercase tracking-tight">Total Price:</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">New</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">Used</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">New EV</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">Used EV</div>
      </div>

      <div className="space-y-2">
        {transportDisplayData.map((row, index) => (
          <div
            key={row.id}
            className={`grid grid-cols-5 gap-4 px-6 py-4 items-center rounded-3xl transition-all duration-200 ease-out border-2 border-transparent hover:bg-[#F3F7FB] hover:border-[#D6E4F0] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] ${
              index % 2 !== 0 ? 'bg-[#D9EFE9]' : 'bg-white'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl md:text-5xl">{row.emoji}</span>
              <span className="text-[#3372B2] font-black text-sm uppercase tracking-wide">{row.name}</span>
            </div>

            {[
              { type: 'new', opt: findOption(row.id, newCars, 'new') },
              { type: 'used', opt: findOption(row.id, usedCars, 'used') },
              { type: 'new-ev', opt: findOption(row.id, newEVs, 'new-ev') },
              { type: 'used-ev', opt: findOption(row.id, usedEVs, 'used-ev') },
            ].map(({ type, opt }) => {
              const legacyOpt = row.options.find(o => o.type === type);
              const price = typeof opt?.price === 'number' ? Number(opt.price) : legacyOpt?.price;
              const label = opt?.label || (legacyOpt && 'label' in legacyOpt ? legacyOpt.label : undefined);

              return typeof price === 'number'
                ? renderCell(row.id, type, price, label)
                : <div key={type} />;
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="flex items-center gap-3 text-[#3372B2] font-black text-base hover:underline group"
        >
          <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
            <Info className="w-6 h-6" />
          </div>
          Wait, what is "Interest" and "Refinancing"?
        </button>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[450px] p-8 bg-[#3372B2] text-white rounded-3xl shadow-2xl z-50 text-sm leading-relaxed"
          >
            <p className="font-black mb-4 text-lg uppercase border-b border-white/20 pb-2">Interest & Refinancing</p>
            <p className="mb-4">
              <span className="font-black text-orange-300">Interest</span> is the extra money you pay to a bank for letting you borrow money to buy a car. The rate depends on your "Credit Score"—the higher your score, the lower your interest!
            </p>
            <p>
              <span className="font-black text-orange-300">Refinancing</span> means that later on, if interest rates go down or your credit gets better, you can get a NEW loan to pay off the OLD one. This can lower your monthly payment and save you money!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

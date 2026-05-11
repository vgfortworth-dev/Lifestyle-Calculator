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
  { id: 'borrow', name: 'Borrow', emoji: '\u{1F511}', options: [{ type: 'new', price: 0, label: 'Borrow a family member or friend’s vehicle' }] },
  { id: 'bike', name: 'Bike', emoji: '\u{1F6B2}', options: [{ type: 'new', price: 386.49 }, { type: 'used', price: 188.0 }] },
  { id: 'micro', name: 'Micro', emoji: '\u{1F6F4}', options: [{ type: 'new', price: 35978.73 }, { type: 'used', price: 12929.75 }] },
  { id: 'sedan', name: 'Sedan', emoji: '\u{1F697}', options: [{ type: 'new', price: 25679.30 }, { type: 'used', price: 19479.86 }, { type: 'new-ev', price: 65686.43 }, { type: 'used-ev', price: 33998.0 }] },
  { id: 'luxury-sedan', name: 'Luxury Sedan', emoji: '\u{1F3CE}\uFE0F', options: [{ type: 'new', price: 66229.0 }, { type: 'used', price: 35122.86 }] },
  { id: 'suv', name: 'SUV', emoji: '\u{1F699}', options: [{ type: 'new', price: 37971.48 }, { type: 'used', price: 22761.0 }, { type: 'new-ev', price: 55001.10 }, { type: 'used-ev', price: 38848.0 }] },
  { id: 'truck', name: 'Truck', emoji: '\u{1F6FB}', options: [{ type: 'new', price: 39491.73 }, { type: 'used', price: 24664.67 }, { type: 'new-ev', price: 64406.0 }, { type: 'used-ev', price: 46284.0 }] },
  { id: 'luxury-truck', name: 'Luxury Truck', emoji: '\u{1F69A}', options: [{ type: 'new', price: 63524.58 }, { type: 'used', price: 47414.67 }] },
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

function formatTransportTypeLabel(type: string) {
  switch (type) {
    case 'new':
      return 'New';
    case 'used':
      return 'Used';
    case 'new-ev':
      return 'New EV';
    case 'used-ev':
      return 'Used EV';
    default:
      return type;
  }
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

  const renderDesktopCell = (rowId: string, type: string, price: number, label?: string) => {
    const cellId = `${rowId}-${type}`;
    const isSelected = selectedIds.includes(cellId);
    const rate = isTransportRateKey(type as TransportGridOptionType) ? INTEREST_RATES[type as TransportRateKey] : 0;
    const monthly = calculateTransportMonthly(price, rate);

    return (
      <button
        key={cellId}
        type="button"
        onClick={() => onSelect('transportation', [cellId])}
        className={`group flex min-h-[80px] flex-1 flex-col justify-center rounded-xl p-3 text-center transition-all duration-200 ease-out ${
          isSelected
            ? 'z-10 scale-105 border-2 border-[#10B981] bg-white shadow-lg'
            : 'border border-transparent hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
        }`}
      >
        {price === 0 ? (
          <span className="block px-2 text-sm font-bold leading-snug text-[#3372B2]">{label}</span>
        ) : (
          <div className="space-y-1">
            <span className="block text-lg font-black text-[#3372B2]">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[14px] font-bold leading-tight text-[#2D9B8E]">
              {rate}% Int. • ${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </div>
          </div>
        )}
      </button>
    );
  };

  const renderMobileCell = (rowId: string, rowName: string, type: string, price: number, label?: string) => {
    const cellId = `${rowId}-${type}`;
    const isSelected = selectedIds.includes(cellId);
    const rate = isTransportRateKey(type as TransportGridOptionType) ? INTEREST_RATES[type as TransportRateKey] : 0;
    const monthly = calculateTransportMonthly(price, rate);

    return (
      <button
        key={cellId}
        type="button"
        onClick={() => onSelect('transportation', [cellId])}
        className={`rounded-2xl border p-4 text-left transition-all ${
          isSelected
            ? 'border-[#10B981] bg-emerald-50 shadow-[0_6px_18px_rgba(16,185,129,0.14)]'
            : 'border-slate-200 bg-white hover:border-[#D6E4F0] hover:bg-[#F3F7FB]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{rowName}</p>
            <h4 className="mt-1 text-lg font-black text-[#3372B2]">{formatTransportTypeLabel(type)}</h4>
          </div>
          {isSelected && (
            <span className="rounded-full bg-[#10B981] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
              Selected
            </span>
          )}
        </div>

        {price === 0 ? (
          <p className="mt-3 text-sm font-bold leading-relaxed text-[#3372B2]">{label}</p>
        ) : (
          <div className="mt-3 space-y-1">
            <p className="text-2xl font-black text-[#3372B2]">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-sm font-bold text-[#2D9B8E]">
              {rate}% interest • ${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </p>
          </div>
        )}
      </button>
    );
  };

  const transportColumns = (row: TransportGridRow) => [
    { type: 'new', opt: findOption(row.id, newCars, 'new') },
    { type: 'used', opt: findOption(row.id, usedCars, 'used') },
    { type: 'new-ev', opt: findOption(row.id, newEVs, 'new-ev') },
    { type: 'used-ev', opt: findOption(row.id, usedEVs, 'used-ev') },
  ];

  return (
    <div className="relative space-y-8">
      <div className="space-y-4 md:hidden">
        {transportDisplayData.map((row, index) => (
          <div
            key={row.id}
            className={`rounded-3xl border p-4 shadow-sm ${
              index % 2 !== 0 ? 'border-emerald-100 bg-[#F3FBF8]' : 'border-slate-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl leading-none" role="img" aria-hidden="true">
                {row.emoji}
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Transportation</p>
                <h3 className="text-xl font-black text-[#3372B2]">{row.name}</h3>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {transportColumns(row).map(({ type, opt }) => {
                const legacyOpt = row.options.find((option) => option.type === type);
                const price = typeof opt?.price === 'number' ? Number(opt.price) : legacyOpt?.price;
                const label = opt?.label || (legacyOpt && 'label' in legacyOpt ? legacyOpt.label : undefined);

                return typeof price === 'number'
                  ? renderMobileCell(row.id, row.name, type, price, label)
                  : null;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="mb-4 grid grid-cols-5 items-center gap-4 px-6">
          <div className="text-lg font-black uppercase tracking-tight text-[#3372B2]">Total Price:</div>
          <div className="text-center text-lg font-black uppercase tracking-tight text-[#3372B2]">New</div>
          <div className="text-center text-lg font-black uppercase tracking-tight text-[#3372B2]">Used</div>
          <div className="text-center text-lg font-black uppercase tracking-tight text-[#3372B2]">New EV</div>
          <div className="text-center text-lg font-black uppercase tracking-tight text-[#3372B2]">Used EV</div>
        </div>

        <div className="space-y-2">
          {transportDisplayData.map((row, index) => (
            <div
              key={row.id}
              className={`grid grid-cols-5 items-center gap-4 rounded-3xl border-2 border-transparent px-6 py-4 transition-all duration-200 ease-out hover:border-[#D6E4F0] hover:bg-[#F3F7FB] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] ${
                index % 2 !== 0 ? 'bg-[#D9EFE9]' : 'bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl md:text-5xl" role="img" aria-hidden="true">
                  {row.emoji}
                </span>
                <span className="text-sm font-black uppercase tracking-wide text-[#3372B2]">{row.name}</span>
              </div>

              {transportColumns(row).map(({ type, opt }) => {
                const legacyOpt = row.options.find((option) => option.type === type);
                const price = typeof opt?.price === 'number' ? Number(opt.price) : legacyOpt?.price;
                const label = opt?.label || (legacyOpt && 'label' in legacyOpt ? legacyOpt.label : undefined);

                return typeof price === 'number'
                  ? renderDesktopCell(row.id, type, price, label)
                  : <div key={type} />;
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-2 sm:pt-6">
        <button
          type="button"
          onClick={() => setShowTooltip((prev) => !prev)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group flex items-center gap-3 text-base font-black text-[#3372B2] hover:underline"
        >
          <div className="rounded-full bg-blue-50 p-2 transition-colors group-hover:bg-blue-100">
            <Info className="h-6 w-6" />
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
            className="absolute bottom-20 left-1/2 z-50 w-[min(92vw,450px)] -translate-x-1/2 rounded-3xl bg-[#3372B2] p-6 text-sm leading-relaxed text-white shadow-2xl sm:p-8"
          >
            <p className="mb-4 border-b border-white/20 pb-2 text-lg font-black uppercase">Interest & Refinancing</p>
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
